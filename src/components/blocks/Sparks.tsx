"use client";

import { useRef } from "react";
import { SparkCanvas } from "../neon/SparkCanvas";
import type { NeonBridge } from "../neon/types";

export interface SparksProps {
  enabled: boolean;
}

/**
 * The home page's spark-and-flashlight overlay (src/components/neon/SparkCanvas),
 * dropped onto any page. It is a fixed full-screen effect: the page goes dark
 * except around the cursor and the sparks it throws. One per page.
 */
export function Sparks({ enabled }: SparksProps) {
  const bridgeRef = useRef<NeonBridge>({ letterZones: [], brightnessDips: [], avgBrightness: 1, signCenter: null });
  if (!enabled) {
    return (
      <div className="not-prose my-4 font-mono text-xs text-gray-600 border border-dashed border-[rgba(255,255,255,0.1)] rounded p-2">
        Spark overlay (off)
      </div>
    );
  }
  return <SparkCanvas bridgeRef={bridgeRef} />;
}
