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
}

const SITE = "http://127.0.0.1:24045";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, init);
  const body = await r.json();
  if (!r.ok) throw new Error(body.error ?? r.statusText);
  return body as T;
}

/**
 * Replaces Puck's Publish button with the two steps of the publish flow:
 * "Save to preview" writes the file and pushes studio/preview; "Promote to
 * live" moves master to that branch. Rendered inside Puck so it can read the
 * current editor data.
 */
function PublishActions({ file, title, onStatus, setBusy, busy }: {
  file: string;
  title: string;
  busy: string;
  setBusy: (s: string) => void;
  onStatus: (s: PublishStatus | null, note: string) => void;
}) {
  const getPuck = useGetPuck();

  const saveToPreview = async () => {
    setBusy("preview");
    try {
      const data: Data = getPuck().appState.data;
      const saved = await api<{ bytes: number }>(`/api/page?file=${encodeURIComponent(file)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const pub = await api<{ commit: string; changed: boolean; files: string[]; previewUrl: string; remote: string; branch: string }>(
        "/api/publish",
        { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title }) },
      );
      const st = await api<PublishStatus>("/api/publish/status?fetch=0");
      const what = pub.changed ? `${pub.files.length} file(s) in ${pub.commit.slice(0, 7)}` : "no content changes, branch reset to master";
      onStatus(st, `saved ${saved.bytes} bytes; pushed ${pub.branch} to ${pub.remote}: ${what}`);
    } catch (e) {
      onStatus(null, `save to preview failed: ${(e as Error).message}`);
    } finally {
      setBusy("");
    }
  };

  const promoteToLive = async () => {
    if (!window.confirm("Promote studio/preview to master? This deploys the live site.")) return;
    setBusy("promote");
    try {
      const res = await api<{ method: string; master: string; previousMaster: string; remote: string }>("/api/promote", { method: "POST" });
      const st = await api<PublishStatus>("/api/publish/status?fetch=0");
      onStatus(st, `promoted (${res.method}): master ${res.previousMaster.slice(0, 7)} -> ${res.master.slice(0, 7)} on ${res.remote}`);
    } catch (e) {
      onStatus(null, `promote failed: ${(e as Error).message}`);
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <button type="button" className="studio-action" onClick={saveToPreview} disabled={Boolean(busy)} title="Write the file, commit content/ on studio/preview and push it">
        {busy === "preview" ? "Saving to preview…" : "Save to preview"}
      </button>
      <button type="button" className="studio-action studio-action-live" onClick={promoteToLive} disabled={Boolean(busy)} title="Move master to studio/preview and push (deploys the live site)">
        {busy === "promote" ? "Promoting…" : "Promote to live"}
      </button>
    </>
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

  const refreshStatus = useCallback(async (fetchRemote: boolean) => {
    try {
      setPub(await api<PublishStatus>(`/api/publish/status?fetch=${fetchRemote ? 1 : 0}`));
    } catch (e) {
      setStatus(`status failed: ${(e as Error).message}`);
    }
  }, []);

  useEffect(() => {
    fetch("/api/pages")
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
    fetch(`/api/page?file=${encodeURIComponent(file)}`)
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

  const page = pages.find((p) => p.file === file);
  const title = (data?.root?.props as { title?: string } | undefined)?.title ?? page?.title ?? file;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div className="studio-bar">
        <strong style={{ color: "var(--neon)" }}>STUDIO</strong>
        <select value={file} onChange={(e) => setFile(e.target.value)}>
          {pages.map((p) => (
            <option key={p.file} value={p.file}>
              {p.file} — {p.title}
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
        <span className="studio-status">{status}</span>
      </div>
      <div className="studio-publish-status" title="Preview branch versus master on the remote">
        <span>{describe(pub) || "publish status: loading…"}</span>
        {pub && pub.dirtyContent.length ? <span className="studio-dirty">{pub.dirtyContent.length} unsaved content file(s) on disk</span> : null}
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
            headerTitle={file}
            overrides={{
              headerActions: () => (
                <PublishActions
                  file={file}
                  title={title}
                  busy={busy}
                  setBusy={setBusy}
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
    </div>
  );
}
