import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Puck, useGetPuck, type Data, type Plugin } from "@puckeditor/core";
import { puckConfig } from "./blocks";
import { CanvasZoom } from "./CanvasZoom";
import { SourceToggleFields } from "./components/SourceToggle";
import { HeaderContext, StudioHeader, type HeaderInfo } from "./Header";

interface PageInfo {
  file: string;
  route: string;
  title: string;
}

interface PublishStatus {
  remote: string;
  branch: string;
  previewUrl: string;
  previewExists: boolean;
  aheadOfMaster: number;
  behindMaster: number;
  lastCommit: { hash: string; subject: string; date: string } | null;
  dirtyContent: string[];
  /** Files that differ between the remote's master and studio/preview. */
  changedFiles: string[];
}

const SITE = "http://127.0.0.1:24045";
/** Vite's base path (/studio/), so the API and the editor share one prefix behind the hub relay. */
const BASE = import.meta.env.BASE_URL;
const API = `${BASE}api`;

// ===== Hub theme =====
// The hub has four themes, set with data-bs-theme on its <html>. The studio mirrors
// them with data-theme on its own <html> (studio.css gives each one hub token
// values). The theme arrives as ?theme= on first load and as a postMessage from
// the hub frame when the user changes it; dark is the default.
export const HUB_THEMES = ["light", "dark", "sensitive-light", "sensitive-dark"] as const;
export type HubTheme = (typeof HUB_THEMES)[number];

export function asHubTheme(value: unknown): HubTheme | null {
  return typeof value === "string" && (HUB_THEMES as readonly string[]).includes(value) ? (value as HubTheme) : null;
}

function applyTheme(theme: HubTheme) {
  document.documentElement.dataset.theme = theme;
}

function useHubTheme(): HubTheme {
  const [theme, setTheme] = useState<HubTheme>(() => asHubTheme(new URLSearchParams(location.search).get("theme")) ?? "dark");
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; theme?: unknown } | null;
      if (!data || data.type !== "hub-theme") return;
      const next = asHubTheme(data.theme);
      if (next) setTheme(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
  return theme;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  const body = await r.json();
  if (!r.ok) throw new Error(body.error ?? r.statusText);
  return body as T;
}

/** content/<folder>/<name>.mdx (as git prints it) -> the page's site path, or null for anything else. */
export function routeOfChangedFile(file: string, pages: PageInfo[]): PageInfo | null {
  const rel = file.replace(/^content\//, "");
  return pages.find((p) => p.file === rel) ?? null;
}

/**
 * Replaces Puck's Publish button with the two steps of the publish flow:
 * "Save to preview" writes the file and pushes studio/preview; "Promote to
 * live" moves master to that branch. Rendered inside Puck so it can read the
 * current editor data.
 */
function PublishActions({ file, title, onStatus, onSaved, setBusy, busy, onPromoteRequest }: {
  file: string;
  title: string;
  busy: string;
  setBusy: (s: string) => void;
  onStatus: (s: PublishStatus | null, note: string) => void;
  onPromoteRequest: () => void;
  onSaved: (data: Data) => void;
}) {
  const getPuck = useGetPuck();

  const saveToPreview = async () => {
    setBusy("preview");
    try {
      const data: Data = getPuck().appState.data;
      const saved = await api<{ bytes: number }>(`${API}/page?file=${encodeURIComponent(file)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      onSaved(data);
      const pub = await api<{ commit: string; changed: boolean; files: string[]; previewUrl: string; remote: string; branch: string }>(
        `${API}/publish`,
        { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title }) },
      );
      const st = await api<PublishStatus>(`${API}/publish/status?fetch=0`);
      const what = pub.changed ? `${pub.files.length} file(s) in ${pub.commit.slice(0, 7)}` : "no content changes, branch reset to master";
      onStatus(st, `saved ${saved.bytes} bytes; pushed ${pub.branch} to ${pub.remote}: ${what}`);
    } catch (e) {
      onStatus(null, `save to preview failed: ${(e as Error).message}`);
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <button type="button" className="studio-action" data-testid="save-preview" onClick={saveToPreview} disabled={Boolean(busy)} title="Write the file, commit content/ on studio/preview and push it">
        {busy === "preview" ? "Saving to preview…" : "Save to preview"}
      </button>
      <button type="button" className="studio-action studio-action-live" data-testid="promote-live" onClick={onPromoteRequest} disabled={Boolean(busy)} title="Move master to studio/preview and push (deploys the live site)">
        {busy === "promote" ? "Promoting…" : "Promote to live"}
      </button>
    </>
  );
}

/** The confirm step before promote: lists the pages that differ between master and the preview. */
function PromoteDialog({ status, pages, onCancel, onConfirm, loading }: {
  status: PublishStatus | null;
  pages: PageInfo[];
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const files = status?.changedFiles ?? [];
  const nothing = !loading && status && (!status.previewExists || status.aheadOfMaster === 0);
  return (
    <div className="studio-modal-backdrop" role="presentation" onClick={onCancel}>
      <div className="studio-modal" role="dialog" aria-modal="true" aria-labelledby="promote-title" data-testid="promote-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 id="promote-title">Promote to live</h2>
        {loading ? <p>Checking {status?.remote ?? "the remote"}…</p> : null}
        {nothing ? (
          <p data-testid="promote-nothing">
            {status?.previewExists ? "studio/preview is already equal to master; there is nothing to promote." : "studio/preview is not on the remote yet. Save to preview first."}
          </p>
        ) : null}
        {!loading && !nothing && status ? (
          <>
            <p>
              master on {status.remote} moves to studio/preview ({status.aheadOfMaster} commit{status.aheadOfMaster === 1 ? "" : "s"}
              {status.behindMaster ? `, merged over ${status.behindMaster} newer on master` : ""}). This deploys the live site. Pages that change:
            </p>
            <ul data-testid="promote-pages">
              {files.map((f) => {
                const page = routeOfChangedFile(f, pages);
                return (
                  <li key={f}>
                    <span>{page ? page.route : f}</span>
                    <small>{page ? page.title : "not a content page"}</small>
                  </li>
                );
              })}
              {files.length === 0 ? <li><span>(no file list from git)</span></li> : null}
            </ul>
          </>
        ) : null}
        <div className="studio-modal-actions">
          <button type="button" className="studio-action" data-testid="promote-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="studio-action studio-action-live" data-testid="promote-confirm" onClick={onConfirm} disabled={loading || Boolean(nothing)}>
            Promote {files.length ? `${files.length} file${files.length === 1 ? "" : "s"}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Pages tree (left rail) =====
/** Sections of the tree, in display order, by the site route. */
const GROUPS: { id: string; label: string; match: (route: string) => boolean }[] = [
  { id: "home", label: "Home", match: (r) => r === "/" },
  { id: "pages", label: "Pages", match: (r) => /^\/(about|contact|founder|resume|work|forged\/(notes|tools|sheets))$/.test(r) },
  { id: "work", label: "Work", match: (r) => r.startsWith("/work/") },
  { id: "notes", label: "Notes", match: (r) => r.startsWith("/forged/notes/") },
  { id: "showcase", label: "Showcase", match: (r) => r.startsWith("/showcase/") },
  { id: "other", label: "Other", match: () => true },
];

function groupPages(pages: PageInfo[], query: string) {
  const q = query.trim().toLowerCase();
  const slug = (p: PageInfo) => (p.file.split("/").pop() ?? "").replace(/\.mdx$/, "");
  const hit = (p: PageInfo) =>
    !q || p.title.toLowerCase().includes(q) || p.route.toLowerCase().includes(q) || slug(p).toLowerCase().includes(q);
  const out = GROUPS.map((g) => ({ id: g.id, label: g.label, pages: [] as PageInfo[] }));
  for (const p of pages) {
    if (!hit(p)) continue;
    out[GROUPS.findIndex((g) => g.match(p.route))].pages.push(p);
  }
  for (const g of out) g.pages.sort((a, b) => a.title.localeCompare(b.title));
  return out.filter((g) => g.pages.length);
}

interface PagesCtx {
  pages: PageInfo[];
  file: string;
  query: string;
  setQuery: (q: string) => void;
  dirtyFiles: Set<string>;
  openPage: (file: string) => void;
}
const PagesContext = createContext<PagesCtx | null>(null);

function PagesPanel() {
  const ctx = useContext(PagesContext);
  if (!ctx) return null;
  const { pages, file, query, setQuery, dirtyFiles, openPage } = ctx;
  const groups = groupPages(pages, query);
  return (
    <div className="pages-tree" data-testid="pages-tree">
      <div className="pages-search">
        <input
          type="search"
          value={query}
          placeholder={`Search ${pages.length} pages`}
          aria-label="Search pages by title, slug or path"
          data-testid="pages-search"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="pages-scroll">
        {groups.map((g) => (
          <section key={g.id} className="pages-group">
            <h3>
              {g.label} <span>{g.pages.length}</span>
            </h3>
            <ul>
              {g.pages.map((p) => (
                <li key={p.file}>
                  <button
                    type="button"
                    className={`pages-row${p.file === file ? " is-current" : ""}`}
                    aria-current={p.file === file ? "page" : undefined}
                    data-testid="pages-row"
                    data-file={p.file}
                    onClick={() => openPage(p.file)}
                  >
                    <span className="pages-title">{p.title}</span>
                    {dirtyFiles.has(p.file) ? (
                      <span className="pages-dot" role="img" aria-label="unsaved changes" title="Unsaved changes" data-testid="pages-dot" />
                    ) : null}
                    <span className="pages-path">{p.route}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 ? <p className="pages-empty">No page matches "{query}".</p> : null}
      </div>
    </div>
  );
}

/** Left-rail tab beside Puck's Blocks and Outline. State comes from PagesContext so the plugin object stays stable. */
const pagesPlugin: Plugin = {
  name: "pages",
  label: "Pages",
  icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 2.5h6l4 4v7H3z" />
      <path d="M9 2.5v4h4" />
    </svg>
  ),
  render: () => <PagesPanel />,
  mobilePanelHeight: "min-content",
};
const PLUGINS = [pagesPlugin];

/** Stable identity so Puck does not remount the header on every App render. */
const HEADER_OVERRIDE = ({ actions }: { actions: ReactNode }) => <StudioHeader actions={actions} />;

/** Stable identity, like the header override: the Markdown "Source" toggle wraps the right-pane fields. */
const FIELDS_OVERRIDE = ({ children }: { children: ReactNode }) => <SourceToggleFields>{children}</SourceToggleFields>;

/** Data as JSON without generated ids, so Puck adding ids on open does not count as an edit. */
function normalize(data: Data): string {
  return JSON.stringify(data, (k, v) => (k === "id" ? undefined : v));
}

function describe(st: PublishStatus | null): string {
  if (!st) return "";
  if (!st.previewExists) return `${st.branch}: not on ${st.remote} yet`;
  const last = st.lastCommit ? `${st.lastCommit.hash.slice(0, 7)} "${st.lastCommit.subject}" ${st.lastCommit.date.slice(0, 16)}` : "";
  if (st.aheadOfMaster === 0 && st.behindMaster === 0) return `${st.branch} = master (${last})`;
  const parts = [];
  if (st.aheadOfMaster) parts.push(`${st.aheadOfMaster} ahead of master`);
  if (st.behindMaster) parts.push(`${st.behindMaster} behind master`);
  return `${st.branch}: ${parts.join(", ")} (${last})`;
}

export function App() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [file, setFile] = useState<string>(() => new URLSearchParams(location.search).get("file") ?? "");
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("");
  const [pub, setPub] = useState<PublishStatus | null>(null);
  const [busy, setBusy] = useState("");
  const [promoting, setPromoting] = useState<"closed" | "loading" | "ready">("closed");
  const [query, setQuery] = useState("");
  const [editedFile, setEditedFile] = useState<string | null>(null);
  const baseline = useRef("");
  useHubTheme();

  const refreshStatus = useCallback(async (fetchRemote: boolean) => {
    try {
      const st = await api<PublishStatus>(`${API}/publish/status?fetch=${fetchRemote ? 1 : 0}`);
      setPub(st);
      return st;
    } catch (e) {
      setStatus(`status failed: ${(e as Error).message}`);
      return null;
    }
  }, []);

  useEffect(() => {
    fetch(`${API}/pages`)
      .then((r) => r.json())
      .then((list: PageInfo[]) => {
        setPages(list);
        if (!file && list.length) setFile(list[0].file);
      });
    refreshStatus(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!file) return;
    setData(null);
    setStatus(`loading ${file}…`);
    fetch(`${API}/page?file=${encodeURIComponent(file)}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error);
        baseline.current = normalize(body.data);
        setEditedFile(null);
        setData(body.data);
        setStatus(`${body.data.content.length} blocks`);
        const url = new URL(location.href);
        url.searchParams.set("file", file);
        history.replaceState(null, "", url);
      })
      .catch((e) => setStatus(`error: ${e.message}`));
  }, [file]);

  const openPage = useCallback(
    (next: string) => {
      if (next === file) return;
      if (editedFile && !window.confirm("This page has unsaved edits. Leave it and discard them?")) return;
      setFile(next);
    },
    [file, editedFile],
  );

  useEffect(() => {
    if (!editedFile) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [editedFile]);

  // A dot marks the page with edits in the editor and any page whose file differs on disk from the preview branch.
  const dirtyFiles = useMemo(() => {
    const set = new Set<string>((pub?.dirtyContent ?? []).map((f) => f.replace(/^content\//, "")));
    if (editedFile) set.add(editedFile);
    return set;
  }, [pub, editedFile]);

  const openPromote = async () => {
    setPromoting("loading");
    await refreshStatus(true);
    setPromoting("ready");
  };

  const confirmPromote = async () => {
    setPromoting("closed");
    setBusy("promote");
    try {
      const res = await api<{ method: string; master: string; previousMaster: string; remote: string }>(`${API}/promote`, { method: "POST" });
      const st = await api<PublishStatus>(`${API}/publish/status?fetch=0`);
      setPub(st);
      setStatus(`promoted (${res.method}): master ${res.previousMaster.slice(0, 7)} -> ${res.master.slice(0, 7)} on ${res.remote}`);
    } catch (e) {
      setStatus(`promote failed: ${(e as Error).message}`);
    } finally {
      setBusy("");
    }
  };

  const page = pages.find((p) => p.file === file);
  const title = (data?.root?.props as { title?: string } | undefined)?.title ?? page?.title ?? file;
  // The Vercel branch deployment of studio/preview, for this page, while the preview is ahead of master.
  const previewAhead = Boolean(pub && pub.previewExists && pub.aheadOfMaster > 0);
  const previewPageUrl = pub && page ? `${pub.previewUrl}${page.route === "/" ? "" : page.route}` : null;

  const unsaved = dirtyFiles.size;
  const headerInfo: HeaderInfo = {
    title,
    route: page?.route ?? "",
    siteUrl: page ? `${SITE}${page.route}` : null,
    previewSiteUrl: pub?.previewUrl ?? null,
    pill: !pub
      ? "status…"
      : `${!pub.previewExists ? "preview not pushed" : previewAhead ? `preview ${pub.aheadOfMaster} ahead` : "preview = master"}${unsaved ? ` · ${unsaved} unsaved` : ""}`,
    pending: previewAhead || unsaved > 0,
    fullLine: describe(pub),
    unsavedOnDisk: pub?.dirtyContent.length ?? 0,
    openPreviewUrl: previewAhead ? previewPageUrl : null,
    message: status,
    busy: Boolean(busy),
    onRefresh: () => {
      void refreshStatus(true);
    },
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <HeaderContext.Provider value={headerInfo}>
        {!data ? (
          <div className="studio-header">
            <strong className="studio-brand">STUDIO</strong>
            <span className="studio-status" data-testid="studio-status">{status}</span>
          </div>
        ) : null}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {data ? (
            <PagesContext.Provider value={{ pages, file, query, setQuery, dirtyFiles, openPage }}>
              <Puck
                key={file}
                config={puckConfig}
                data={data}
                plugins={PLUGINS}
                ui={{ plugin: { current: "pages" } }}
                onChange={(d) => {
                  const changed = normalize(d) !== baseline.current;
                  setEditedFile((cur) => (changed ? file : cur === file ? null : cur));
                }}
                headerTitle={title}
                height="100%"
                overrides={{
                  // One 40 px row replaces the studio bars and Puck's own header; `actions` is the headerActions override below.
                  header: HEADER_OVERRIDE,
                  fields: FIELDS_OVERRIDE,
                  headerActions: () => (
                    <PublishActions
                      file={file}
                      title={title}
                      busy={busy}
                      setBusy={setBusy}
                      onPromoteRequest={openPromote}
                      onSaved={(d) => {
                        baseline.current = normalize(d);
                        setEditedFile(null);
                      }}
                      onStatus={(st, note) => {
                        if (st) setPub(st);
                        setStatus(note);
                      }}
                    />
                  ),
                }}
                viewports={[
                  { width: 390, height: "auto", label: "Phone" },
                  { width: 768, height: "auto", label: "Tablet" },
                  { width: 1280, height: "auto", label: "Desktop" },
                ]}
              />
              <CanvasZoom />
            </PagesContext.Provider>
          ) : null}
        </div>
      </HeaderContext.Provider>
      {promoting !== "closed" ? (
        <PromoteDialog
          status={pub}
          pages={pages}
          loading={promoting === "loading"}
          onCancel={() => setPromoting("closed")}
          onConfirm={confirmPromote}
        />
      ) : null}
    </div>
  );
}
