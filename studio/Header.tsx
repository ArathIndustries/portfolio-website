import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createUsePuck, useGetPuck, type Data } from "@puckeditor/core";
import { ZoomContext } from "./CanvasZoom";
import { PhoneSheet } from "./components/PhoneSheet";
import { PriorityToolbar, type PriorityItem } from "./components/PriorityToolbar";

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
  /** "" when idle, else the step running: "preview" or "promote". */
  busy: string;
  onRefresh: () => void;
  /** Save to preview: writes the file, commits content/ on studio/preview and pushes it. */
  onSaveToPreview: (data: Data) => void;
  /** Opens the promote confirm dialog. */
  onPromoteRequest: () => void;
}

export const HeaderContext = createContext<HeaderInfo | null>(null);

const usePuckStore = createUsePuck();

function StatusPopover({ info, anchor, onClose }: { info: HeaderInfo; anchor: HTMLElement | null; onClose: () => void }) {
  const [pos, setPos] = useState({ top: 48, right: 8 });
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const place = () => {
      const r = anchor?.getBoundingClientRect();
      setPos(r ? { top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) } : { top: 48, right: 8 });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!anchor?.contains(t) && !pop.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
    };
  }, [anchor, onClose]);

  return createPortal(
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
        <button type="button" className="studio-link" onClick={info.onRefresh} disabled={Boolean(info.busy)}>
          refresh
        </button>
      </div>
    </div>,
    document.body,
  );
}

/**
 * The single header row that replaces the studio bars and Puck's own header:
 * brand, page title and path, then a priority-plus toolbar (undo, redo, save,
 * promote, status, site and preview links, canvas zoom) that never wraps; what
 * does not fit goes into its "…" menu.
 */
export function StudioHeader() {
  const info = useContext(HeaderContext);
  const zoom = useContext(ZoomContext);
  const getPuck = useGetPuck();
  const back = usePuckStore((s) => s.history.back);
  const forward = usePuckStore((s) => s.history.forward);
  const hasPast = usePuckStore((s) => s.history.hasPast);
  const hasFuture = usePuckStore((s) => s.history.hasFuture);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);

  const items = useMemo<PriorityItem[]>(() => {
    if (!info) return [];
    const busy = Boolean(info.busy);
    const list: PriorityItem[] = [
      { id: "undo", label: "Undo", icon: "undo", pinned: true, disabled: !hasPast, action: () => back() },
      { id: "redo", label: "Redo", icon: "redo", pinned: true, disabled: !hasFuture, action: () => forward() },
      {
        id: "save",
        label: info.busy === "preview" ? "Saving to preview…" : "Save to preview",
        icon: "save",
        pinned: true,
        priority: 10,
        disabled: busy,
        title: "Write the file, commit content/ on studio/preview and push it",
        action: () => info.onSaveToPreview(getPuck().appState.data),
      },
      {
        id: "live",
        label: info.busy === "promote" ? "Promoting…" : "Promote to live",
        icon: "live",
        priority: 9,
        disabled: busy,
        title: "Move master to studio/preview and push (deploys the live site)",
        action: info.onPromoteRequest,
      },
      {
        id: "status",
        label: info.pill,
        icon: "status",
        priority: 8,
        pressed: statusOpen,
        tone: info.pending ? "late" : undefined,
        title: info.fullLine || "publish status: loading…",
        action: () => {
          setStatusAnchor(document.querySelector<HTMLElement>('[data-testid="ptb-status"]'));
          setStatusOpen((o) => !o);
        },
      },
    ];
    if (info.siteUrl) list.push({ id: "site", label: "Site", icon: "external", priority: 3, title: "Open this page on the local site", href: info.siteUrl });
    if (info.previewSiteUrl) list.push({ id: "preview", label: "Preview", icon: "external", priority: 2, title: "Vercel builds every pushed branch at this address", href: info.previewSiteUrl });
    if (zoom) {
      list.push(
        { id: "zoom-out", label: "Zoom out", icon: "zoom-out", priority: 1, disabled: !zoom.canOut, title: "Zoom canvas out (Ctrl + wheel)", action: () => zoom.step(-1) },
        { id: "zoom", label: `${zoom.pct}%`, priority: 2, pressed: zoom.isFit, title: "Fit the page to the canvas (Ctrl + 0)", action: zoom.fit },
        { id: "zoom-in", label: "Zoom in", icon: "zoom-in", priority: 1, disabled: !zoom.canIn, title: "Zoom canvas in (Ctrl + wheel)", action: () => zoom.step(1) },
      );
    }
    return list;
  }, [info, zoom, hasPast, hasFuture, back, forward, getPuck, statusOpen]);

  if (!info) return null;
  return (
    <header className="studio-header" data-testid="page-header">
      <strong className="studio-brand">STUDIO</strong>
      <span className="studio-title-wrap" title={`${info.title} ${info.route}`}>
        <strong className="studio-page-title" data-testid="page-title">{info.title}</strong>
        <code className="studio-page-path" data-testid="page-path">{info.route}</code>
      </span>
      <PriorityToolbar items={items} label="Page actions" className="studio-header-tools" />
      {statusOpen ? <StatusPopover info={info} anchor={statusAnchor} onClose={() => setStatusOpen(false)} /> : null}
      <PhoneSheet />
    </header>
  );
}
