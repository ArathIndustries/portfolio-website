"use client";

import { useEffect, useRef, useState } from "react";

export interface ScrollyStep {
  heading: string;
  text: string;
  image?: string;
  accent?: string;
}

export interface ScrollyProps {
  steps: ScrollyStep[];
}

/**
 * Scrollytelling walkthrough: text steps scroll on the left, a sticky graphic
 * on the right changes with the step in view (image if given, otherwise a
 * numbered panel in the step's accent color).
 */
export function Scrolly({ steps }: ScrollyProps) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.step);
            setActive(idx);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [steps]);

  const step = (steps || [])[active];
  return (
    <div className="not-prose my-12 scrolly">
      <style>{`.scrolly{display:grid;grid-template-columns:1fr;gap:1.5rem}@media(min-width:768px){.scrolly{grid-template-columns:1fr 1fr;gap:3rem}}.scrolly-stick{position:sticky;top:5rem;height:60vh}@media(max-width:767px){.scrolly-stick{height:34vh;top:4rem;z-index:1}}`}</style>
      <div className="order-2 md:order-1">
        {(steps || []).map((s, i) => (
          <div
            key={i}
            data-step={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="min-h-[60vh] flex flex-col justify-center py-10 transition-opacity"
            style={{ opacity: i === active ? 1 : 0.35 }}
          >
            <div className="font-mono text-xs tracking-widest text-[var(--neon)] mb-2">STEP {i + 1}</div>
            <h3 className="font-mono text-2xl font-semibold text-[#e0e0e0]">{s.heading}</h3>
            <p className="mt-3 text-gray-400 leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="order-1 md:order-2">
        <div
          className="scrolly-stick rounded-lg border border-[rgba(255,136,0,0.2)] flex items-center justify-center overflow-hidden transition-colors duration-500"
          style={{ background: step?.accent || "#1a0e05" }}
        >
          {step?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step.image} alt={step.heading} className="w-full h-full object-contain" />
          ) : (
            <div className="font-mono text-[6rem] font-bold neon-text">{active + 1}</div>
          )}
        </div>
      </div>
    </div>
  );
}
