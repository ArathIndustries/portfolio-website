"use client";

import { useRef } from "react";
import Link from "next/link";
import { NeonSign } from "../neon/NeonSign";
import { SparkCanvas } from "../neon/SparkCanvas";
import type { NeonBridge } from "../neon/types";
import type { BlockLayoutProps } from "./layout";

export interface NeonSignHeroProps extends BlockLayoutProps {
  tagline: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

/**
 * The home page: the hand-drawn neon sign, the spark and flashlight overlay
 * that follows it, a tagline and two call-to-action links.
 *
 * SparkCanvas and NeonSign share one mutable bridge (letter positions and
 * brightness dips flow from the sign to the sparks). A block boundary cannot
 * pass a ref between siblings, so the bridge lives here and both components
 * render inside this one block. The markup is the pre-studio src/app/page.tsx
 * unchanged, so the rendered page is pixel-identical.
 */
export function NeonSignHero({ tagline, primaryLabel, primaryHref, secondaryLabel, secondaryHref, hidden }: NeonSignHeroProps) {
  const bridgeRef = useRef<NeonBridge>({ letterZones: [], brightnessDips: [], avgBrightness: 1, signCenter: null });

  if (hidden) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
      <SparkCanvas bridgeRef={bridgeRef} />
      <NeonSign bridgeRef={bridgeRef} />

      {/* Tagline */}
      <p className="text-center text-sm sm:text-base font-mono neon-text opacity-70 mt-2 px-4">
        {tagline}
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4 mt-8">
        <Link href={primaryHref} className="neon-btn font-mono text-sm sm:text-base px-6 py-3">
          {primaryLabel}
        </Link>
        <Link href={secondaryHref} className="neon-btn-filled font-mono text-sm sm:text-base px-6 py-3">
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
