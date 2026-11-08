import type { ReactNode } from "react";

export interface QuoteProps {
  quote: ReactNode;
  author?: ReactNode;
}

/** Pull quote with an author line. Added last, as the timed "new block" test. */
export function Quote({ quote, author }: QuoteProps) {
  return (
    <blockquote className="not-prose my-10 pl-6 border-l-4" style={{ borderColor: "var(--neon)" }}>
      <p className="text-xl leading-relaxed text-[#e0e0e0] font-mono">{quote}</p>
      {author ? <footer className="mt-3 text-sm text-gray-500">— {author}</footer> : null}
    </blockquote>
  );
}
