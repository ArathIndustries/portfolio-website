"use client";

import { useEffect, useState } from "react";

export interface DataTableProps {
  /** Path or URL to a CSV file with a header row. */
  src: string;
  caption?: string;
  maxRows: number;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

/** Table rendered from a CSV path. */
export function DataTable({ src, caption, maxRows }: DataTableProps) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!src) return;
    fetch(src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((t) => !cancelled && setRows(parseCsv(t)))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (error) return <div className="not-prose my-6 font-mono text-xs text-red-400">CSV: {error}</div>;
  if (!rows) return <div className="not-prose my-6 font-mono text-xs text-gray-500">loading {src}…</div>;
  const [head, ...body] = rows;
  const shown = body.slice(0, maxRows || 50);
  return (
    <div className="not-prose my-8 overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.08)]">
      <table className="w-full text-sm">
        {caption ? <caption className="text-left px-4 py-2 font-mono text-xs text-gray-500">{caption}</caption> : null}
        <thead>
          <tr style={{ background: "rgba(255,136,0,0.08)" }}>
            {head.map((h, i) => (
              <th key={i} className="text-left px-4 py-2 font-mono text-xs tracking-wider text-[var(--neon)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i} className="border-t border-[rgba(255,255,255,0.05)]">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-2 text-gray-300 whitespace-nowrap">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {body.length > shown.length ? (
        <div className="px-4 py-2 font-mono text-xs text-gray-600">{body.length - shown.length} more rows not shown</div>
      ) : null}
    </div>
  );
}
