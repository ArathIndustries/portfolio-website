/**
 * MDX file -> Puck Data.
 *
 * Prose runs keep their exact source text (sliced by position, never
 * re-stringified) so an untouched page round-trips byte for byte. Each
 * top-level JSX element becomes a block of the same name; an unknown tag,
 * an import/export, a spread attribute, or children on a block that does
 * not declare `childrenAs` throws.
 */
import type { Data } from "@puckeditor/core";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import type { Root, RootContent } from "mdast";
import { blockSchemas, childElementNames } from "../schema";

export interface PuckPage extends Data {
  root: { props: { frontmatter: string; title?: string; eol?: "\n" | "\r\n" } };
}

export interface SplitSource {
  /** Raw YAML between the --- delimiters, without the delimiters or their newlines. */
  frontmatter: string;
  /** Everything after the closing delimiter line. */
  body: string;
}

/** Split the frontmatter off by text, so the YAML survives untouched. */
export function splitFrontmatter(source: string): SplitSource {
  const lines = source.split("\n");
  if (lines[0].trim() !== "---") return { frontmatter: "", body: source };
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (end === -1) throw new Error("Frontmatter opened with --- but never closed");
  return { frontmatter: lines.slice(1, end).join("\n"), body: lines.slice(end + 1).join("\n") };
}

const processor = unified().use(remarkParse).use(remarkMdx);

type JsxNode = Extract<RootContent, { type: "mdxJsxFlowElement" }>;
type JsxAttr = JsxNode["attributes"][number];

function evalExpression(expr: string, where: string): unknown {
  try {
    // Content files are first-party source; an object literal is the expected shape.
    return new Function(`"use strict"; return (${expr});`)();
  } catch (e) {
    throw new Error(`${where}: cannot evaluate attribute expression {${expr}}: ${(e as Error).message}`);
  }
}

function attrsToProps(attrs: JsxAttr[], where: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const a of attrs) {
    if (a.type !== "mdxJsxAttribute") throw new Error(`${where}: spread attributes {...x} are not supported`);
    if (a.value == null) props[a.name] = true;
    else if (typeof a.value === "string") props[a.name] = a.value;
    else props[a.name] = evalExpression(a.value.value, where);
  }
  return props;
}

function line(node: { position?: { start: { line: number } } }): string {
  return `line ${node.position?.start.line ?? "?"}`;
}

export function mdxToPuck(rawSource: string, fileLabel = "mdx"): PuckPage {
  // Work in LF; remember the file's own line ending so a save writes it back unchanged.
  const eol = rawSource.includes("\r\n") ? "\r\n" : "\n";
  const source = rawSource.replace(/\r\n/g, "\n");
  const { frontmatter, body } = splitFrontmatter(source);
  const tree = processor.parse(body) as Root;

  const content: Data["content"] = [];
  let proseStart: number | null = null;
  let proseEnd = 0;
  let counter = 0;
  const nextId = (type: string) => `${type}-${++counter}`;

  const flushProse = () => {
    if (proseStart === null) return;
    const text = body.slice(proseStart, proseEnd);
    content.push({ type: "Markdown", props: { id: nextId("Markdown"), text } });
    proseStart = null;
  };

  for (const node of tree.children) {
    const where = `${fileLabel} ${line(node)}`;
    if (node.type === "mdxjsEsm") throw new Error(`${where}: import/export statements are not supported in pages`);
    if (node.type === "mdxFlowExpression") throw new Error(`${where}: top-level {expressions} are not supported in pages`);

    if (node.type === "mdxJsxFlowElement") {
      flushProse();
      const name = node.name ?? "";
      if (childElementNames.has(name)) throw new Error(`${where}: <${name}> may only appear inside its parent block`);
      const schema = blockSchemas[name];
      if (!schema) throw new Error(`${where}: unknown component <${name}>; add it to src/components/blocks and studio/schema.ts first`);

      const props = attrsToProps(node.attributes, `${where} <${name}>`);
      const kids = node.children.filter((c) => !(c.type === "text" && c.value.trim() === ""));
      if (kids.length) {
        const adapter = schema.mdx?.childrenAs;
        if (!adapter) throw new Error(`${where}: <${name}> does not accept children`);
        const items: Record<string, unknown>[] = [];
        for (const k of kids) {
          if (k.type !== "mdxJsxFlowElement" || k.name !== adapter.child) {
            throw new Error(`${where}: <${name}> children must all be <${adapter.child}>, found ${k.type === "mdxJsxFlowElement" ? `<${k.name}>` : k.type}`);
          }
          if (k.children.filter((c) => !(c.type === "text" && c.value.trim() === "")).length) {
            throw new Error(`${line(k)}: <${adapter.child}> must be self-closing`);
          }
          items.push(attrsToProps(k.attributes, `${fileLabel} ${line(k)} <${adapter.child}>`));
        }
        props[adapter.prop] = items;
      }
      content.push({ type: name, props: { id: nextId(name), ...props } });
      continue;
    }

    // Anything else is prose. Keep extending the current run.
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start == null || end == null) throw new Error(`${where}: node without position`);
    if (proseStart === null) proseStart = start;
    proseEnd = end;
  }
  flushProse();

  const titleMatch = frontmatter.match(/^title:\s*"?(.*?)"?\s*$/m);
  return {
    root: { props: { frontmatter, title: titleMatch?.[1], eol } },
    content,
    zones: {},
  };
}
