import { useCallback, useEffect, useState } from "react";
import { Puck, useGetPuck, type Data } from "@puckeditor/core";
import { puckConfig } from "./blocks";

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
function PublishActions({ file, title, onStatus, setBusy, busy, onPromoteRequest }: {
  file: string;
  title: string;
  busy: string;
  setBusy: (s: string) => void;
  onStatus: (s: PublishStatus | null, note: string) => void;
  onPromoteRequest: () => void;
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
        setData(body.data);
        setStatus(`${body.data.content.length} blocks`);
        const url = new URL(location.href);
        url.searchParams.set("file", file);
        history.replaceState(null, "", url);
      })
      .catch((e) => setStatus(`error: ${e.message}`));
  }, [file]);

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

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="studio-bar">
        <strong className="studio-brand">STUDIO</strong>
        <select value={file} onChange={(e) => setFile(e.target.value)} data-testid="page-select" title="Pages, by their address on the site">
          {pages.map((p) => (
            <option key={p.file} value={p.file}>
              {p.route} — {p.title}
            </option>
          ))}
        </select>
        {page ? (
          <a href={`${SITE}${page.route}`} target="_blank" rel="noreferrer">
            open on site ↗
          </a>
        ) : null}
        {pub ? (
          <a href={pub.previewUrl} target="_blank" rel="noreferrer" title="Vercel builds every pushed branch at this address">
            preview site ↗
          </a>
        ) : null}
        <span className="studio-status" data-testid="studio-status">{status}</span>
      </div>
      <div className="studio-publish-status" title="Preview branch versus master on the remote">
        <span data-testid="publish-status">{describe(pub) || "publish status: loading…"}</span>
        {pub && pub.dirtyContent.length ? <span className="studio-dirty">{pub.dirtyContent.length} unsaved content file(s) on disk</span> : null}
        {previewAhead && previewPageUrl ? (
          <>
            <a href={previewPageUrl} target="_blank" rel="noreferrer" data-testid="open-preview" title={previewPageUrl}>
              Open preview ↗
            </a>
            <span className="studio-preview-note">Preview needs a Vercel sign-in</span>
          </>
        ) : null}
        <button type="button" className="studio-link" onClick={() => refreshStatus(true)} disabled={Boolean(busy)}>
          refresh
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {data ? (
          <Puck
            key={file}
            config={puckConfig}
            data={data}
            headerTitle={page?.route ?? file}
            overrides={{
              headerActions: () => (
                <PublishActions
                  file={file}
                  title={title}
                  busy={busy}
                  setBusy={setBusy}
                  onPromoteRequest={openPromote}
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
        ) : null}
      </div>
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
