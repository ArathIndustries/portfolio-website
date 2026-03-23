"use client";

import { useRef } from "react";
import Link from "next/link";
import { NeonSign, SparkCanvas } from "@/components/neon";
import type { NeonBridge } from "@/components/neon";

export default function Home() {
  const bridgeRef = useRef<NeonBridge>({ letterZones: [], brightnessDips: [] });

  return (
    <>
      <SparkCanvas bridgeRef={bridgeRef} />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-2 relative">
        <NeonSign bridgeRef={bridgeRef} />

        {/* Tagline */}
        <p className="text-center text-sm sm:text-base font-mono neon-text opacity-70 mt-2 px-4">
          Building tools that fit how people work
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-8">
          <Link href="/work" className="neon-btn font-mono text-sm sm:text-base px-6 py-3">
            View Work
          </Link>
          <Link href="/contact" className="neon-btn-filled font-mono text-sm sm:text-base px-6 py-3">
            Hire Me
          </Link>
        </div>
      </div>
    </>
  );
}
