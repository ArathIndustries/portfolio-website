import type { ReactNode } from "react";

export interface FigureProps {
  src: string;
  alt?: string;
  caption?: ReactNode;
  maxWidth?: number;
}

/** Image with caption. Plain <img> so the same code runs in Next and Vite. */
export function Figure({ src, alt, caption, maxWidth }: FigureProps) {
  return (
    <figure className="not-prose my-8 mx-auto" style={maxWidth ? { maxWidth } : undefined}>
      <div className="rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || ""} className="w-full h-auto block" />
      </div>
      {caption ? <figcaption className="mt-3 text-xs text-gray-500 font-mono">{caption}</figcaption> : null}
    </figure>
  );
}
