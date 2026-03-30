"use client";

import { useEffect, useRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import type { NeonBridge, Wave } from "./types";

const TOTAL_NODES = 16;

const LETTER_PATHS = [
  { d: "M0,22 L2,21 5,18 8,14 12,7 15,1 15,22 14,19 12,16 10,14 7,12 5,12 4,13 4,15 5,17 7,19 10,21 13,22 18,22", tx: 0 },
  { d: "M0,17 L2,14 3,12 3,14 6,14 7,15 7,17 6,20 6,21 7,22 8,22 10,21 11,20 13,17", tx: 15.12 },
  { d: "M9,16 L8,14 6,13 4,13 2,14 1,15 0,17 0,19 1,21 3,22 5,22 7,21 8,19 10,13 9,18 9,21 10,22 11,22 13,21 14,20 16,17", tx: 28.56 },
  { d: "M0,17 L2,14 4,10 M7,1 L1,19 1,21 2,22 4,22 6,21 7,20 9,17 M1,9 L8,9", tx: 45.36 },
  { d: "M0,17 L2,14 5,9 6,7 7,4 7,2 6,1 4,2 3,4 2,8 1,14 0,22 M0,22 L1,19 2,17 4,14 6,13 8,13 9,14 9,16 8,19 8,21 9,22 10,22 12,21 13,20 15,17", tx: 55.44 },
  { d: "M5,20 L4,21 5,22 6,21 5,20", tx: 72.24 },
  { d: "M14,17 L12,15 10,12 9,10 8,7 8,4 9,2 10,1 12,1 13,2 14,4 14,7 13,12 11,17 10,19 8,21 6,22 4,22 2,21 1,19 1,17 2,16 4,16 6,17", tx: 80.64 },
  { d: "M0,17 L2,14 4,13 5,14 5,15 4,19 3,22 M4,19 L5,17 7,14 9,13 11,13 12,14 12,16 11,19 11,21 12,22 13,22 15,21 16,20 18,17", tx: 94.08 },
  { d: "M9,16 L8,14 6,13 4,13 2,14 1,15 0,17 0,19 1,21 3,22 5,22 7,21 8,19 14,1 M10,13 L9,18 9,21 10,22 11,22 13,21 14,20 16,17", tx: 110.88 },
  { d: "M0,17 L2,13 0,19 0,21 1,22 3,22 5,21 7,19 9,16 M10,13 L8,19 8,21 9,22 10,22 12,21 13,20 15,17", tx: 127.68 },
  { d: "M0,17 L2,14 3,12 3,14 5,17 6,19 6,21 4,22 M0,21 L2,22 6,22 8,21 9,20 11,17", tx: 142.8 },
  { d: "M0,17 L2,14 4,10 M7,1 L1,19 1,21 2,22 4,22 6,21 7,20 9,17 M1,9 L8,9", tx: 154.56 },
  { d: "M0,17 L2,14 3,12 3,14 6,14 7,15 7,17 6,20 6,21 7,22 8,22 10,21 11,20 13,17", tx: 163.64 },
  { d: "M3,8 L3,9 4,9 4,8 3,8 M0,17 L2,13 0,19 0,21 1,22 2,22 4,21 5,20 7,17", tx: 177.08 },
  { d: "M1,20 L3,19 4,18 5,16 5,14 4,13 3,13 1,14 0,16 0,19 1,21 3,22 5,22 7,21 8,20 10,17", tx: 185.48 },
  { d: "M0,17 L2,14 3,12 3,14 5,17 6,19 6,21 4,22 M0,21 L2,22 6,22 8,21 9,20 11,17", tx: 195.56 },
];

const LETTER_ZONES = [
  { x: 0, y: 0, w: 18, h: 23 },
  { x: 15, y: 10, w: 13, h: 13 },
  { x: 28, y: 10, w: 17, h: 13 },
  { x: 45, y: 0, w: 10, h: 23 },
  { x: 55, y: 0, w: 16, h: 23 },
  { x: 72, y: 18, w: 8, h: 6 },
  { x: 80, y: 0, w: 15, h: 23 },
  { x: 94, y: 10, w: 18, h: 13 },
  { x: 110, y: 0, w: 17, h: 23 },
  { x: 127, y: 10, w: 16, h: 13 },
  { x: 142, y: 10, w: 12, h: 13 },
  { x: 154, y: 0, w: 11, h: 23 },
  { x: 163, y: 10, w: 14, h: 13 },
  { x: 177, y: 5, w: 9, h: 18 },
  { x: 185, y: 10, w: 11, h: 13 },
  { x: 195, y: 10, w: 12, h: 13 },
];

function renderPathLayers(paths: typeof LETTER_PATHS) {
  return (
    <>
      {/* Glass edge */}
      <g className="tube-glass-edge">
        {paths.map((p, i) => (
          <path key={i} d={p.d} transform={`translate(${p.tx},0)`} />
        ))}
      </g>
      {/* Glass tube body */}
      <g className="tube-glass">
        {paths.map((p, i) => (
          <path key={i} d={p.d} transform={`translate(${p.tx},0)`} />
        ))}
      </g>
      {/* Soft bloom */}
      <g className="tube-bloom">
        {paths.map((p, i) => (
          <path key={i} d={p.d} transform={`translate(${p.tx},0)`} />
        ))}
      </g>
      {/* Lit tube layer */}
      <g filter="url(#neon-glow)">
        <g className="tube-light">
          {paths.map((p, i) => (
            <path key={i} d={p.d} transform={`translate(${p.tx},0)`} data-light-idx={i} />
          ))}
        </g>
      </g>
      {/* White core */}
      <g className="tube-core">
        {paths.map((p, i) => (
          <path key={i} d={p.d} transform={`translate(${p.tx},0)`} data-core-idx={i} />
        ))}
      </g>
    </>
  );
}

interface NeonSignProps {
  bridgeRef: MutableRefObject<NeonBridge>;
}

export function NeonSign({ bridgeRef }: NeonSignProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const wavesRef = useRef<Wave[]>([]);
  const brightnessRef = useRef(new Float32Array(TOTAL_NODES).fill(1.0));
  const prevBrightnessRef = useRef(new Float32Array(TOTAL_NODES).fill(1.0));
  const waveTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleWave = useCallback(() => {
    const now = performance.now();
    const roll = Math.random();
    let wave: Wave;
    if (roll < 0.25) {
      wave = { startTime: now, mode: 'linear', direction: Math.random() > 0.5 ? 1 : -1, speed: 15 + Math.random() * 25, dip: 0.2 + Math.random() * 0.3, holdMs: 30 + Math.random() * 40, recoveryMs: 80 + Math.random() * 100 };
    } else if (roll < 0.45) {
      wave = { startTime: now, mode: 'linear', direction: Math.random() > 0.5 ? 1 : -1, speed: 40 + Math.random() * 60, dip: 0.3 + Math.random() * 0.2, holdMs: 100 + Math.random() * 200, recoveryMs: 300 + Math.random() * 400 };
    } else if (roll < 0.65) {
      const origin = Math.floor(Math.random() * TOTAL_NODES);
      wave = { startTime: now, mode: 'ripple', origin, speed: 20 + Math.random() * 35, dip: 0.1 + Math.random() * 0.25, holdMs: 40 + Math.random() * 60, recoveryMs: 100 + Math.random() * 150 };
    } else if (roll < 0.8) {
      const origin = Math.floor(TOTAL_NODES * 0.3 + Math.random() * TOTAL_NODES * 0.4);
      wave = { startTime: now, mode: 'ripple', origin, speed: 8 + Math.random() * 12, dip: 0.05 + Math.random() * 0.1, holdMs: 40 + Math.random() * 30, recoveryMs: 50 + Math.random() * 60, bounce: true };
    } else if (roll < 0.92) {
      wave = { startTime: now, mode: 'single', target: Math.floor(Math.random() * TOTAL_NODES), dip: 0.05 + Math.random() * 0.15, holdMs: 60 + Math.random() * 100, recoveryMs: 80 + Math.random() * 120 };
    } else {
      wave = { startTime: now, mode: 'linear', direction: 1, speed: 3 + Math.random() * 5, dip: 0, holdMs: 150 + Math.random() * 300, recoveryMs: 400 + Math.random() * 600 };
    }
    wavesRef.current.push(wave);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const lights = svg.querySelectorAll('[data-light-idx]');
    const cores = svg.querySelectorAll('[data-core-idx]');
    const zones = svg.querySelectorAll('.letter-zone');

    // Populate bridge with letter zone elements
    bridgeRef.current.letterZones = Array.from(zones);

    // Track sign center position
    function updateSignCenter() {
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      bridgeRef.current.signCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    updateSignCenter();
    window.addEventListener('resize', updateSignCenter);
    window.addEventListener('scroll', updateSignCenter);

    function setNodeBrightness(idx: number, val: number) {
      if (lights[idx]) (lights[idx] as SVGElement).style.opacity = String(val);
      if (cores[idx]) (cores[idx] as SVGElement).style.opacity = String(val * 0.5);
    }

    function processWaves(now: number) {
      const brightness = brightnessRef.current;
      const waves = wavesRef.current;
      brightness.fill(1.0);

      for (let w = waves.length - 1; w >= 0; w--) {
        const wave = waves[w];
        let allDone = true;
        for (let i = 0; i < TOTAL_NODES; i++) {
          let delay: number;
          if (wave.mode === 'ripple') {
            delay = Math.abs(i - (wave.origin ?? 0)) * (wave.speed ?? 20);
          } else if (wave.mode === 'single') {
            if (i !== wave.target) continue;
            delay = 0;
          } else {
            delay = ((wave.direction ?? 1) === 1 ? i : TOTAL_NODES - 1 - i) * (wave.speed ?? 20);
          }
          const elapsed = now - wave.startTime - delay;
          if (elapsed < 0) { allDone = false; continue; }
          const total = wave.holdMs + wave.recoveryMs;
          let b: number;
          if (elapsed < wave.holdMs) {
            b = wave.dip; allDone = false;
          } else if (elapsed < total) {
            const rt = (elapsed - wave.holdMs) / wave.recoveryMs;
            b = wave.dip + (1 - wave.dip) * rt;
            if (wave.bounce && rt > 0.3 && rt < 0.5) b *= 0.3 + Math.random() * 0.2;
            allDone = false;
          } else {
            b = 1.0;
          }
          brightness[i] = Math.min(brightness[i], b);
        }
        if (allDone) waves.splice(w, 1);
      }

      for (let i = 0; i < TOTAL_NODES; i++) setNodeBrightness(i, brightness[i]);

      // Update glow + bridge
      const avg = brightness.reduce((a, b) => a + b, 0) / TOTAL_NODES;
      bridgeRef.current.avgBrightness = avg;
      if (glowRef.current) {
        glowRef.current.style.opacity = String(avg * 0.4);
      }
    }

    function tick() {
      const now = performance.now();
      const brightness = brightnessRef.current;
      const prevBrightness = prevBrightnessRef.current;

      processWaves(now);

      // Push dips to bridge for spark system
      let maxDrop = 0;
      for (let i = 0; i < TOTAL_NODES; i++) {
        const drop = prevBrightness[i] - brightness[i];
        if (drop > 0.15) {
          bridgeRef.current.brightnessDips.push({ idx: i, drop });
          if (drop > maxDrop) maxDrop = drop;
        }
        prevBrightness[i] = brightness[i];
      }

      // Emit power events to parent frame (for iframe ↔ page sync)
      if (window.parent !== window && frameCounter++ % 6 === 0) {
        window.parent.postMessage({
          type: 'neon-sign-power',
          avgBrightness: bridgeRef.current.avgBrightness,
          maxDrop,
        }, '*');
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    let frameCounter = 0;

    // Schedule first wave
    const firstTimer = setTimeout(() => {
      scheduleWave();
      scheduleNextWave();
    }, 1500 + Math.random() * 1000);
    waveTimersRef.current.push(firstTimer);

    function scheduleNextWave() {
      const timer = setTimeout(() => {
        scheduleWave();
        if (Math.random() > 0.7) {
          setTimeout(scheduleWave, 200 + Math.random() * 400);
        }
        scheduleNextWave();
      }, 5000 + Math.random() * 12000);
      waveTimersRef.current.push(timer);
    }

    rafRef.current = requestAnimationFrame(tick);

    // Listen for voltage surges from parent page (iframe ↔ page sync)
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'neon-grid-surge') {
        const intensity = e.data.intensity || 0.6;
        // Fire a dramatic wave — energy flowing into the sign from outside
        const now = performance.now();
        wavesRef.current.push({
          startTime: now,
          mode: 'linear',
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 30 + Math.random() * 20,
          dip: 0.15 + intensity * 0.25,
          holdMs: 60 + Math.random() * 80,
          recoveryMs: 150 + Math.random() * 200,
        });
        // Double-fire for bigger surges
        if (intensity > 0.6) {
          setTimeout(() => {
            wavesRef.current.push({
              startTime: performance.now(),
              mode: 'ripple',
              origin: Math.floor(Math.random() * TOTAL_NODES),
              speed: 20 + Math.random() * 15,
              dip: intensity * 0.15,
              holdMs: 40 + Math.random() * 40,
              recoveryMs: 100 + Math.random() * 100,
            });
          }, 150 + Math.random() * 200);
        }
      }
    }
    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('message', onMessage);
      cancelAnimationFrame(rafRef.current);
      waveTimersRef.current.forEach(clearTimeout);
      waveTimersRef.current = [];
      window.removeEventListener('resize', updateSignCenter);
      window.removeEventListener('scroll', updateSignCenter);
    };
  }, [bridgeRef, scheduleWave]);

  return (
    <div className="sign-mount relative" style={{ padding: '2rem 3rem' }}>
      {/* Mounting bracket */}
      <div
        className="absolute top-[10px] left-1/2 -translate-x-1/2"
        style={{ width: 80, height: 3, background: '#1a1715', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
      />

      {/* Sign glow */}
      <div
        ref={glowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '300%',
          height: '600%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(255,80,20,0.2) 0%, rgba(255,60,10,0.1) 25%, rgba(255,40,5,0.03) 50%, transparent 75%)`,
          zIndex: -1,
          opacity: 0.8,
        }}
      />

      {/* Main sign SVG */}
      <svg
        ref={svgRef}
        className="block overflow-visible w-[85vw] max-w-[1000px] h-auto"
        viewBox="-3 -2 213 28"
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b3" />
            <feMerge>
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {renderPathLayers(LETTER_PATHS)}

        {/* Hit zones for spark system */}
        {LETTER_ZONES.map((z, i) => (
          <rect
            key={i}
            className="letter-zone"
            data-idx={i}
            x={z.x}
            y={z.y}
            width={z.w}
            height={z.h}
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}
