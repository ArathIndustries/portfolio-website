import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createUsePuck } from "@puckeditor/core";

/**
 * Everything the one-row header shows. App builds this and provides it through
 * HeaderContext, so the header component handed to Puck's `overrides.header`
 * keeps one identity across renders (an inline arrow would remount it).
 */
export interface HeaderInfo {
  title: string;
  route: string;
  siteUrl: string | null;
  previewSiteUrl: string | null;
  /** Short text in the status pill, e.g. "preview 1 ahead · 1 unsaved". */
  pill: string;
  /** True when something is waiting (unsaved edits or a preview ahead of master). */
  pending: boolean;
  /** The full publish line that used to sit in its own bar. */
  fullLine: string;
  unsavedOnDisk: number;
  /** Link to this page on the Vercel branch deployment, only while the preview is ahead. */
  openPreviewUrl: string | null;
  /** Last message from a load, save or promote. */
  message: string;
  busy: boolean;
  onRefresh: () => void;
}

export const HeaderContext = createContext<HeaderInfo | null>(null);

const usePuckStore = createUsePuck();

function UndoRedo() {
  const back = usePuckStore((s) => s.history.back);
  const forward = usePuckStore((s) => s.history.forward);
  const hasPast = usePuckStore((s) => s.history.hasPast);
  const hasFuture = usePuckStore((s) => s.history.hasFuture);
  return (
    <span className="studio-undo">
      <button type="button" className="studio-icon-btn" title="Undo" aria-label="Undo" disabled={!hasPast} onClick={() => back()}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M6 3 2.5 6.5 6 10" />
          <path d="M3 6.5h6a4 4 0 0 1 0 8H6" />
        </svg>
      </button>
      <button type="button" className="studio-icon-btn" title="Redo" aria-label="Redo" disabled={!hasFuture} onClick={() => forward()}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="m10 3 3.5 3.5L10 10" />
          <path d="M13 6.5H7a4 4 0 0 0 0 8h3" />
        </svg>
      </button>
    </span>
  );
}

function StatusPill({ info }: { info: HeaderInfo }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = btn.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !pop.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`studio-pill${info.pending ? " is-pending" : ""}`}
        data-testid="status-pill"
        title={info.fullLine || "publish status: loading…"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {info.pill}
      </button>
      {open
        ? createPortal(
            <div ref={pop} className="studio-popover" role="dialog" aria-label="Publish status" style={{ top: pos.top, right: pos.right }} data-testid="status-popover">
              <div data-testid="publish-status">{info.fullLine || "publish status: loading…"}</div>
              {info.unsavedOnDisk ? <div className="studio-dirty">{info.unsavedOnDisk} unsaved content file(s)</div> : null}
              {info.openPreviewUrl ? (
                <div>
                  <a href={info.openPreviewUrl} target="_blank" rel="noreferrer" data-testid="open-preview" title={info.openPreviewUrl}>
                    Open preview ↗
                  </a>{" "}
                  <span className="studio-preview-note">Preview needs a Vercel sign-in</span>
                </div>
              ) : null}
              {info.message ? <div className="studio-popover-msg" data-testid="studio-status">{info.message}</div> : null}
              <div>
                <button type="button" className="studio-link" onClick={info.onRefresh} disabled={info.busy}>
                  refresh
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/** The single 40 px row that replaces the studio bars and Puck's own header. */
export function StudioHeader({ actions }: { actions?: ReactNode }) {
  const info = useContext(HeaderContext);
  if (!info) return null;
  return (
    <header className="studio-header" data-testid="page-header">
      <strong className="studio-brand">STUDIO</strong>
      <span className="studio-title-wrap">
        <strong className="studio-page-title" data-testid="page-title">{info.title}</strong>
        <code className="studio-page-path" data-testid="page-path">{info.route}</code>
      </span>
      {info.siteUrl ? (
        <a className="studio-hlink" href={info.siteUrl} target="_blank" rel="noreferrer" title="Open this page on the local site">
          site ↗
        </a>
      ) : null}
      {info.previewSiteUrl ? (
        <a className="studio-hlink" href={info.previewSiteUrl} target="_blank" rel="noreferrer" title="Vercel builds every pushed branch at this address">
          preview ↗
        </a>
      ) : null}
      <span className="studio-spacer" />
      <StatusPill info={info} />
      <UndoRedo />
      {actions}
    </header>
  );
}
