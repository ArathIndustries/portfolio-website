"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
}

export interface MapBlockProps {
  lat: number;
  lng: number;
  zoom: number;
  height: number;
  markers: MapMarker[];
}

/** Free demo tile style from MapLibre; no API key. */
const STYLE_URL = "https://demotiles.maplibre.org/style.json";

/** MapLibre GL map with markers from a field. maplibre-gl is imported on demand. */
export function MapBlock({ lat, lng, zoom, height, markers }: MapBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("maplibre-gl");
        const maplibre = (mod as unknown as { default?: typeof mod }).default ?? mod;
        if (cancelled) return;
        const m = new maplibre.Map({ container: el, style: STYLE_URL, center: [lng, lat], zoom, attributionControl: false });
        map = m;
        m.addControl(new maplibre.NavigationControl(), "top-right");
        for (const mk of markers || []) {
          new maplibre.Marker({ color: "#FF8800" })
            .setLngLat([mk.lng, mk.lat])
            .setPopup(new maplibre.Popup({ offset: 20 }).setText(mk.label))
            .addTo(m);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, zoom, markers]);

  return (
    <div className="not-prose my-8 rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]" style={{ background: "#0d0b0a" }}>
      {error ? <div className="p-4 font-mono text-xs text-red-400">Map: {error}</div> : <div ref={ref} style={{ height, width: "100%" }} />}
    </div>
  );
}
