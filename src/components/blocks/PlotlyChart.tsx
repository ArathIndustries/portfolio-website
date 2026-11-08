"use client";

import { useEffect, useRef, useState } from "react";

export interface PlotlyChartProps {
  /** Path or URL to a Plotly figure JSON (what fig.write_json() produces in Python). */
  src: string;
  height: number;
  title?: string;
}

/**
 * Interactive Plotly chart. The figure is authored in Python (plotly), written
 * to JSON, and rendered here with plotly.js loaded on demand so it never enters
 * the site's main bundle.
 */
export function PlotlyChart({ src, height, title }: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el || !src) return;
    (async () => {
      try {
        const [mod, res] = await Promise.all([import("plotly.js-dist-min"), fetch(src)]);
        if (!res.ok) throw new Error(`fetch ${src}: HTTP ${res.status}`);
        const fig = await res.json();
        if (cancelled) return;
        const Plotly = (mod as unknown as { default?: PlotlyModule }).default ?? (mod as unknown as PlotlyModule);
        const layout = { ...(fig.layout || {}), autosize: true, height };
        await Plotly.newPlot(el, fig.data || [], layout, { responsive: true, displaylogo: false });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, height]);

  return (
    <div className="not-prose my-8">
      {title ? <div className="font-mono text-sm text-gray-400 mb-2">{title}</div> : null}
      <div className="rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]" style={{ background: "#0d0b0a" }}>
        {error ? (
          <div className="p-4 font-mono text-xs text-red-400">Plotly: {error}</div>
        ) : (
          <div ref={ref} style={{ height, width: "100%" }} />
        )}
      </div>
    </div>
  );
}

interface PlotlyModule {
  newPlot: (el: HTMLElement, data: unknown[], layout: unknown, config: unknown) => Promise<unknown>;
}
