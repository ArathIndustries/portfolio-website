"use client";

import { lazy, Suspense } from "react";

export interface ThreeBlockProps {
  /** Torus-knot winding numbers: p turns around the axis, q turns through the hole. */
  p: number;
  q: number;
  height: number;
}

// The whole three.js scene lives in a separate chunk loaded on demand.
const Scene = lazy(() => import("./ThreeScene"));

/** 3D parametric torus knot drawn with three.js through @react-three/fiber. */
export function ThreeBlock({ p, q, height }: ThreeBlockProps) {
  return (
    <div className="not-prose my-8 rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]" style={{ height, background: "#0d0b0a" }}>
      <Suspense fallback={<div className="p-4 font-mono text-xs text-gray-500">loading three.js…</div>}>
        <Scene p={p} q={q} />
      </Suspense>
    </div>
  );
}
