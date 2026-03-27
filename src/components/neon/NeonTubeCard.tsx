'use client';

import { useRef, useEffect, useId, useCallback, type ReactNode } from 'react';

// ============================================================
// Types
// ============================================================

export interface WaveState {
  brightness: Float32Array;
  avgBrightness: number;
}

export interface TubeCardHandle {
  element: HTMLDivElement;
  midpoints: { midX: number; midY: number }[];
  lightSegs: SVGPathElement[];
  coreSegs: SVGPathElement[];
  bloom: SVGPathElement;
  applyBrightness: (brightness: Float32Array) => void;
}

interface NeonTubeCardProps {
  children: ReactNode;
  className?: string;
  cardRef?: (handle: TubeCardHandle | null) => void;
  waveState?: WaveState;
}

// ============================================================
// Constants
// ============================================================

const NUM_SEGMENTS = 40;
const NEON = '#FF8800';
const NEON_RGB = '255,136,0';
const BORDER_RADIUS = 14;

// ============================================================
// Helpers
// ============================================================

/** Build an SVG path for a rounded rectangle. */
export function roundedRectPath(w: number, h: number, r: number): string {
  return `M ${r},0 L ${w - r},0 Q ${w},0 ${w},${r} L ${w},${h - r} Q ${w},${h} ${w - r},${h} L ${r},${h} Q 0,${h} 0,${h - r} L 0,${r} Q 0,0 ${r},0 Z`;
}

/** Measure the total path length and per-segment midpoints. */
function getSegmentInfo(
  w: number,
  h: number,
  r: number,
  numSegs: number,
): { totalLen: number; segLen: number; midpoints: { midX: number; midY: number }[] } {
  const ns = 'http://www.w3.org/2000/svg';
  const tmpSvg = document.createElementNS(ns, 'svg');
  const tmpPath = document.createElementNS(ns, 'path') as SVGPathElement;
  tmpPath.setAttribute('d', roundedRectPath(w, h, r));
  tmpSvg.appendChild(tmpPath);
  document.body.appendChild(tmpSvg);

  const totalLen = tmpPath.getTotalLength();
  const segLen = totalLen / numSegs;
  const midpoints: { midX: number; midY: number }[] = [];

  for (let i = 0; i < numSegs; i++) {
    const mid = tmpPath.getPointAtLength((i + 0.5) * segLen);
    midpoints.push({ midX: mid.x, midY: mid.y });
  }

  document.body.removeChild(tmpSvg);
  return { totalLen, segLen, midpoints };
}

// ============================================================
// Component
// ============================================================

export function NeonTubeCard({ children, className = '', cardRef, waveState }: NeonTubeCardProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const filterId = useId();

  // Mutable refs for segment elements — survive rebuilds
  const lightSegsRef = useRef<SVGPathElement[]>([]);
  const coreSegsRef = useRef<SVGPathElement[]>([]);
  const bloomRef = useRef<SVGPathElement | null>(null);
  const midpointsRef = useRef<{ midX: number; midY: number }[]>([]);

  // Build the SVG tube layers
  const buildTube = useCallback(() => {
    const card = outerRef.current;
    const svg = svgRef.current;
    if (!card || !svg) return;

    const w = card.offsetWidth + 12;
    const h = card.offsetHeight + 12;
    const r = BORDER_RADIUS;

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    // Clear previous content (keep the <defs> by rebuilding everything)
    svg.innerHTML = '';

    const ns = 'http://www.w3.org/2000/svg';
    const d = roundedRectPath(w, h, r);
    const { totalLen, segLen, midpoints } = getSegmentInfo(w, h, r, NUM_SEGMENTS);
    midpointsRef.current = midpoints;

    // --- Filter defs ---
    const defs = document.createElementNS(ns, 'defs');
    const filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    const blurs: [string, string][] = [
      ['0.8', 'b1'],
      ['2', 'b2'],
      ['5', 'b3'],
    ];
    for (const [dev, result] of blurs) {
      const blur = document.createElementNS(ns, 'feGaussianBlur');
      blur.setAttribute('in', 'SourceGraphic');
      blur.setAttribute('stdDeviation', dev);
      blur.setAttribute('result', result);
      filter.appendChild(blur);
    }

    const merge = document.createElementNS(ns, 'feMerge');
    for (const nodeIn of ['b3', 'b2', 'b1', 'SourceGraphic']) {
      const mergeNode = document.createElementNS(ns, 'feMergeNode');
      mergeNode.setAttribute('in', nodeIn);
      merge.appendChild(mergeNode);
    }
    filter.appendChild(merge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    // --- Static layers ---
    const staticLayers: { stroke: string; strokeWidth: string; opacity?: string }[] = [
      { stroke: 'rgba(255,255,255,0.025)', strokeWidth: '4.5' },    // glass-edge
      { stroke: 'rgba(255,255,255,0.04)', strokeWidth: '3.5' },     // glass
      { stroke: NEON, strokeWidth: '7', opacity: '0.06' },          // bloom
    ];

    let bloomEl: SVGPathElement | null = null;

    for (const layer of staticLayers) {
      const p = document.createElementNS(ns, 'path') as SVGPathElement;
      p.setAttribute('d', d);
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke', layer.stroke);
      p.setAttribute('stroke-width', layer.strokeWidth);
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      if (layer.opacity) {
        p.style.opacity = layer.opacity;
        bloomEl = p;
      }
      svg.appendChild(p);
    }

    bloomRef.current = bloomEl;

    // --- Per-segment light paths (inside filter group) ---
    const filterGroup = document.createElementNS(ns, 'g');
    filterGroup.setAttribute('filter', `url(#${filterId})`);
    svg.appendChild(filterGroup);

    const lightSegs: SVGPathElement[] = [];
    const coreSegs: SVGPathElement[] = [];

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      // Light segment
      const lp = document.createElementNS(ns, 'path') as SVGPathElement;
      lp.setAttribute('d', d);
      lp.setAttribute('stroke', NEON);
      lp.setAttribute('stroke-width', '2');
      lp.setAttribute('stroke-linecap', 'round');
      lp.setAttribute('fill', 'none');
      lp.setAttribute('stroke-dasharray', `${segLen + 0.5} ${totalLen}`);
      lp.setAttribute('stroke-dashoffset', `${-i * segLen}`);
      filterGroup.appendChild(lp);
      lightSegs.push(lp);

      // Core segment
      const cp = document.createElementNS(ns, 'path') as SVGPathElement;
      cp.setAttribute('d', d);
      cp.setAttribute('stroke', '#fff');
      cp.setAttribute('stroke-width', '0.5');
      cp.setAttribute('stroke-linecap', 'round');
      cp.setAttribute('fill', 'none');
      cp.setAttribute('stroke-dasharray', `${segLen + 0.5} ${totalLen}`);
      cp.setAttribute('stroke-dashoffset', `${-i * segLen}`);
      cp.style.opacity = '0.35';
      svg.appendChild(cp);
      coreSegs.push(cp);
    }

    lightSegsRef.current = lightSegs;
    coreSegsRef.current = coreSegs;

    // Notify parent via callback ref
    if (cardRef) {
      cardRef({
        element: card,
        midpoints,
        lightSegs,
        coreSegs,
        bloom: bloomEl!,
        applyBrightness: (brightness: Float32Array) => {
          let avg = 0;
          for (let i = 0; i < NUM_SEGMENTS; i++) {
            const b = brightness[i];
            if (lightSegs[i]) lightSegs[i].style.opacity = String(b);
            if (coreSegs[i]) coreSegs[i].style.opacity = String(b * 0.35);
            avg += b;
          }
          avg /= NUM_SEGMENTS;
          if (bloomEl) bloomEl.style.opacity = String(avg * 0.06);
          if (card) {
            const g = avg;
            card.style.boxShadow =
              `0 0 ${15 + g * 10}px rgba(${NEON_RGB},${g * 0.08}),` +
              `0 0 ${50 + g * 30}px rgba(${NEON_RGB},${g * 0.04}),` +
              `0 0 ${120 + g * 50}px rgba(${NEON_RGB},${g * 0.02}),` +
              `0 0 ${200 + g * 80}px rgba(${NEON_RGB},${g * 0.008})`;
          }
        },
      });
    }
  }, [filterId, cardRef]);

  // Build on mount + rebuild on resize
  useEffect(() => {
    buildTube();

    const onResize = () => buildTube();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      // Deregister handle on unmount
      if (cardRef) cardRef(null);
    };
  }, [buildTube, cardRef]);

  // Apply brightness from waveState each frame
  useEffect(() => {
    if (!waveState) return;

    let rafId: number;

    const applyBrightness = () => {
      const { brightness, avgBrightness } = waveState;
      const lightSegs = lightSegsRef.current;
      const coreSegs = coreSegsRef.current;
      const bloom = bloomRef.current;
      const card = outerRef.current;

      if (lightSegs.length === 0) {
        rafId = requestAnimationFrame(applyBrightness);
        return;
      }

      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const b = brightness[i];
        lightSegs[i].style.opacity = String(b);
        coreSegs[i].style.opacity = String(b * 0.35);
      }

      if (bloom) {
        bloom.style.opacity = String(avgBrightness * 0.06);
      }

      // Ambient bloom — card casts light into surroundings
      if (card) {
        const g = avgBrightness;
        card.style.boxShadow =
          `0 0 ${15 + g * 10}px rgba(${NEON_RGB},${g * 0.08}),` +
          `0 0 ${50 + g * 30}px rgba(${NEON_RGB},${g * 0.04}),` +
          `0 0 ${120 + g * 50}px rgba(${NEON_RGB},${g * 0.02}),` +
          `0 0 ${200 + g * 80}px rgba(${NEON_RGB},${g * 0.008})`;
      }

      rafId = requestAnimationFrame(applyBrightness);
    };

    rafId = requestAnimationFrame(applyBrightness);
    return () => cancelAnimationFrame(rafId);
  }, [waveState]);

  return (
    <div
      ref={outerRef}
      className={`relative ${className}`}
      style={{ background: 'rgba(13,11,10,0.85)', borderRadius: '8px' }}
    >
      <svg
        ref={svgRef}
        className="absolute pointer-events-none overflow-visible"
        style={{ inset: '-6px', width: 'calc(100% + 12px)', height: 'calc(100% + 12px)' }}
      />
      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  );
}
