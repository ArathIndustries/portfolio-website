import type { ReactNode } from "react";

export interface HeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}

/** Page opener: big mono title, subtitle, one neon call-to-action. */
export function Hero({ title, subtitle, ctaLabel, ctaHref }: HeroProps) {
  return (
    <section className="not-prose py-16 text-center">
      <h1 className="text-4xl sm:text-6xl font-bold font-mono neon-text neon-flicker">{title}</h1>
      {subtitle ? <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">{subtitle}</p> : null}
      {ctaLabel ? (
        <div className="mt-8">
          <a href={ctaHref || "#"} className="neon-btn-filled font-mono text-sm sm:text-base px-6 py-3 inline-block">
            {ctaLabel}
          </a>
        </div>
      ) : null}
    </section>
  );
}
