"use client";

import { isValidElement, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";

export interface MarkdownProps {
  /**
   * A string on the site and in read-only views. In the studio canvas Puck
   * swaps in an inline-text element (its `value` prop is the Markdown) because
   * the schema marks the field `contentEditable`.
   */
  text: ReactNode;
}

/**
 * What Enter should insert at `caret` in Markdown `value`: "\n" inside a list
 * item, a fenced code block, a table row or a quote, otherwise "\n\n" (a new
 * paragraph needs a blank line).
 */
export function enterInsert(value: string, caret: number): string {
  const start = value.lastIndexOf("\n", caret - 1) + 1;
  const endIdx = value.indexOf("\n", caret);
  const line = value.slice(start, endIdx === -1 ? value.length : endIdx);
  const fences = value
    .slice(0, caret)
    .split("\n")
    .filter((l) => /^\s*(```|~~~)/.test(l)).length;
  if (fences % 2 === 1) return "\n";
  if (/^\s*([-*+]|\d+[.)])\s/.test(line)) return "\n";
  if (/^\s{2,}\S/.test(line)) return "\n"; // continuation of a list item
  if (/^\s*(\||>)/.test(line)) return "\n";
  if (line.trim() === "") return "\n";
  return "\n\n";
}

/** Index in `source` that best matches a click at `offset` in the rendered text node `node`. */
function sourceIndexForClick(root: HTMLElement, source: string, node: Node, offset: number): number {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let before = 0;
  for (let n = walker.nextNode(); n && n !== node; n = walker.nextNode()) before += (n.nodeValue ?? "").length;
  const total = Math.max(1, (root.textContent ?? "").length);
  const fraction = (before + offset) / total;
  const data = node.nodeType === Node.TEXT_NODE ? (node.nodeValue ?? "") : "";
  // Among the places the clicked text occurs in the source, take the one nearest the same relative position.
  const near = (needle: string, delta: number) => {
    if (!needle) return -1;
    let best = -1;
    let bestD = Infinity;
    for (let i = source.indexOf(needle); i !== -1; i = source.indexOf(needle, i + 1)) {
      const d = Math.abs((i + delta) / Math.max(1, source.length) - fraction);
      if (d < bestD) {
        bestD = d;
        best = i + delta;
      }
    }
    return best;
  };
  const from = Math.max(0, offset - 10);
  const byCtx = near(data.slice(from, offset + 10), offset - from);
  if (byCtx !== -1) return byCtx;
  const ws = data.slice(0, offset).search(/\S+$/);
  const wordStart = ws === -1 ? offset : ws;
  const word = /^\S*/.exec(data.slice(wordStart))?.[0] ?? "";
  const byWord = near(word, offset - wordStart);
  return byWord !== -1 ? byWord : Math.round(fraction * source.length);
}

/**
 * Canvas version. Rendered like the site until clicked; then Puck's inline text
 * element (a contenteditable span that holds the raw Markdown) is shown in its
 * place and focused. Puck writes the span's text back into the field on every
 * input, so the Markdown string is never re-serialised.
 */
function EditableMarkdown({ editor, source, placeholder }: { editor: ReactNode; source: string; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const caret = useRef<number | null>(null);

  // Mark the block as an overlay portal so Puck's overlay lets pointer events through,
  // and keep hover from highlighting the whole component while typing.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("mouseover", stop, { capture: true });
    el.setAttribute("data-puck-overlay-portal", "true");
    return () => {
      el.removeEventListener("mouseover", stop, { capture: true });
      el.removeAttribute("data-puck-overlay-portal");
    };
  }, []);

  // When the raw editor mounts: focus it, place the caret, and let Puck select the block.
  useEffect(() => {
    if (!editing) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const span = root.current?.querySelector<HTMLElement>("span[contenteditable]");
      // Puck fills the span in its own effect; wait for that.
      if (!span || (source && span.textContent !== source && tries < 30)) {
        if (tries >= 30) window.clearInterval(timer);
        return;
      }
      window.clearInterval(timer);
      span.contentEditable = "plaintext-only";
      span.focus();
      const text = span.firstChild;
      const sel = span.ownerDocument.getSelection();
      if (sel && text) {
        const r = span.ownerDocument.createRange();
        r.setStart(text, Math.min(caret.current ?? source.length, (text.nodeValue ?? "").length));
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      span.click(); // Puck's click handler on the span selects the block
    }, 10);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const onKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    const span = e.target as HTMLElement;
    if (!editing || span.tagName !== "SPAN") return;
    if (e.key === "Escape") {
      e.preventDefault();
      span.blur();
      return;
    }
    if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.nativeEvent.isComposing) return;
    const doc = span.ownerDocument;
    const sel = doc.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const pre = doc.createRange();
    pre.selectNodeContents(span);
    pre.setEnd(range.startContainer, range.startOffset);
    e.preventDefault();
    e.stopPropagation();
    doc.execCommand("insertText", false, enterInsert(span.textContent ?? "", pre.toString().length));
  };

  return (
    <div
      ref={root}
      className={`prose max-w-none studio-md ${editing ? "studio-md-editing" : "studio-md-rendered"}`}
      onKeyDownCapture={onKeyDownCapture}
      onBlur={(e) => {
        if (editing && !e.currentTarget.contains(e.relatedTarget as Node | null)) setEditing(false);
      }}
    >
      {editing ? (
        editor
      ) : (
        <div
          className="studio-md-view"
          data-testid="markdown-rendered"
          onClick={(e) => e.preventDefault()}
          onMouseDown={(e) => {
            const el = root.current;
            if (!el) return;
            const doc = el.ownerDocument as Document & {
              caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
            };
            let hit: { node: Node; offset: number } | null = null;
            if (doc.caretRangeFromPoint) {
              const r = doc.caretRangeFromPoint(e.clientX, e.clientY);
              if (r) hit = { node: r.startContainer, offset: r.startOffset };
            } else if (doc.caretPositionFromPoint) {
              const p = doc.caretPositionFromPoint(e.clientX, e.clientY);
              if (p) hit = { node: p.offsetNode, offset: p.offset };
            }
            caret.current = hit ? sourceIndexForClick(el, source, hit.node, hit.offset) : source.length;
            e.preventDefault();
            setEditing(true);
          }}
        >
          {source.trim() ? (
            <ReactMarkdown>{source}</ReactMarkdown>
          ) : (
            <p className="studio-md-empty">{placeholder || "Click to write Markdown…"}</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Prose block. On disk a run of Markdown between JSX components becomes one
 * of these; the site renders that prose through MDX directly, the studio
 * canvas renders it with react-markdown so it looks the same while editing.
 */
export function Markdown({ text }: MarkdownProps) {
  if (isValidElement(text)) {
    const p = text.props as { value?: unknown; placeholder?: string };
    return <EditableMarkdown editor={text} source={typeof p.value === "string" ? p.value : ""} placeholder={p.placeholder} />;
  }
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{typeof text === "string" ? text : ""}</ReactMarkdown>
    </div>
  );
}
