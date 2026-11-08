import { useEffect, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import { puckConfig } from "./blocks";

interface PageInfo {
  file: string;
  route: string;
  title: string;
}

const SITE = "http://127.0.0.1:24045";

export function App() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [file, setFile] = useState<string>(() => new URLSearchParams(location.search).get("file") ?? "");
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((list: PageInfo[]) => {
        setPages(list);
        if (!file && list.length) setFile(list[0].file);
      });
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

  const save = async (next: Data) => {
    setStatus("saving…");
    const r = await fetch(`/api/page?file=${encodeURIComponent(file)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
    const body = await r.json();
    setStatus(r.ok ? `saved ${body.bytes} bytes to content/${file}` : `save failed: ${body.error}`);
  };

  const page = pages.find((p) => p.file === file);

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
        <span className="studio-status">{status}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {data ? (
          <Puck
            key={file}
            config={puckConfig}
            data={data}
            onPublish={save}
            headerTitle={file}
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
