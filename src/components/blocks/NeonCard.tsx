"use client";

import type { ReactNode } from "react";
import { NeonTubeCard } from "../neon/NeonTubeCard";

export interface NeonCardProps {
  title: ReactNode;
  body: ReactNode;
  tag?: string;
}

/** The site's neon tube card (src/components/neon/NeonTubeCard) with a title and body. */
export function NeonCard({ title, body, tag }: NeonCardProps) {
  return (
    <div className="not-prose my-10 max-w-xl mx-auto">
      <NeonTubeCard>
        <div className="p-6">
          {tag ? <div className="font-mono text-xs tracking-widest text-[var(--neon)] mb-2">{tag}</div> : null}
          <h3 className="font-mono text-xl font-semibold text-[#e0e0e0]">{title}</h3>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">{body}</p>
        </div>
      </NeonTubeCard>
    </div>
  );
}
