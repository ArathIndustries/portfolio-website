"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { NeonBridge } from "./types";

const NEON_RGB = [255, 0, 170];
const MAX_SPARKS = 250;

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; decay: number;
  size: number;
  r: number; g: number; b: number;
  gravity: number;
  trail: { x: number; y: number }[];
  trailLen: number;
}

interface Bolt {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  life: number; decay: number;
  r: number; g: number; b: number;
}

interface SparkCanvasProps {
  bridgeRef: MutableRefObject<NeonBridge>;
}

export function SparkCanvas({ bridgeRef }: SparkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext("2d", { alpha: true });
    if (!ctxEl) return;
    // Non-null aliases for closures
    const canvas = canvasEl;
    const ctx = ctxEl;

    // Spark pool
    const sparks: Spark[] = [];
    let sparkCount = 0;
    const sparkPool: Spark[] = [];
    const bolts: Bolt[] = [];

    function getSpark(): Spark {
      return sparkPool.length > 0 ? sparkPool.pop()! : {} as Spark;
    }
    function releaseSpark(s: Spark) { sparkPool.push(s); }

    function initSpark(s: Spark, x: number, y: number, speed: number): Spark {
      const angle = -Math.PI * (0.2 + Math.random() * 0.6);
      const velocity = (Math.random() * 1.2 + 0.5) * speed;
      s.x = x; s.y = y;
      s.vx = Math.cos(angle) * velocity + (Math.random() - 0.5) * 0.8;
      s.vy = Math.sin(angle) * velocity;
      s.life = 1.0; s.decay = Math.random() * 0.008 + 0.004;
      s.size = Math.random() * 2.0 + 0.8;
      s.r = NEON_RGB[0]; s.g = NEON_RGB[1]; s.b = NEON_RGB[2];
      if (Math.random() > 0.6) { s.r = 255; s.g = 220; s.b = 180; }
      s.gravity = 0.04 + Math.random() * 0.06;
      s.trail = []; s.trailLen = Math.floor(Math.random() * 4 + 3);
      return s;
    }

    function spawnRandomBolt(x: number, y: number) {
      const segs: Bolt["segments"] = [];
      let cx = x, cy = y;
      for (let i = 0; i < Math.floor(Math.random() * 5 + 3); i++) {
        const nx = cx + (Math.random() - 0.5) * 40;
        const ny = cy + (Math.random() - 0.5) * 40;
        segs.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx; cy = ny;
      }
      bolts.push({ segments: segs, life: 1, decay: 0.04 + Math.random() * 0.03, r: NEON_RGB[0], g: NEON_RGB[1], b: NEON_RGB[2] });
    }

    // Resize
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking
    let mouseX = 0, mouseY = 0, lastMouseX = 0, lastMouseY = 0;
    let moveAccum = 0, lastMoveTime = 0;

    function onMouseMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastMoveTime < 16) return;
      lastMoveTime = now;
      mouseX = e.clientX; mouseY = e.clientY;
      moveAccum += Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
      if (moveAccum > 4000 + Math.random() * 3000) {
        const burst = Math.floor(Math.random() * 8 + 4);
        for (let i = 0; i < burst && sparkCount < MAX_SPARKS; i++) {
          sparks.push(initSpark(getSpark(), mouseX + (Math.random() - 0.5) * 6, mouseY + (Math.random() - 0.5) * 6, 1.5));
          sparkCount++;
        }
        spawnRandomBolt(mouseX, mouseY);
        moveAccum = 0;
      }
      lastMouseX = mouseX; lastMouseY = mouseY;
    }
    document.addEventListener("mousemove", onMouseMove);

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Read brightness dips from bridge
      const dips = bridgeRef.current.brightnessDips;
      const zones = bridgeRef.current.letterZones;
      while (dips.length > 0) {
        const dip = dips.pop()!;
        const zone = zones[dip.idx];
        if (!zone) continue;
        const r = zone.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const bx = r.left + r.width * Math.random();
        const by = r.top + r.height * Math.random();
        const count = Math.floor(dip.drop * 12 + 2);
        for (let j = 0; j < count && sparkCount < MAX_SPARKS; j++) {
          sparks.push(initSpark(getSpark(), bx, by, 1.2 + dip.drop));
          sparkCount++;
        }
        if (dip.drop > 0.4 && Math.random() > 0.4) spawnRandomBolt(bx, by);
      }

      // Update + render sparks
      let w = 0;
      for (let i = 0; i < sparkCount; i++) {
        const s = sparks[i];
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > s.trailLen) s.trail.shift();
        s.x += s.vx; s.y += s.vy; s.vy += s.gravity; s.vx *= 0.985; s.life -= s.decay;
        if (s.life <= 0) { s.trail.length = 0; releaseSpark(s); continue; }
        const a = s.life, rr = s.size * Math.max(s.life, 0.3);

        // Trail
        if (s.trail.length > 1) {
          ctx.strokeStyle = `rgb(${s.r},${s.g},${s.b})`;
          ctx.lineCap = 'round';
          for (let t = 1; t < s.trail.length; t++) {
            ctx.globalAlpha = (t / s.trail.length) * a * 0.3;
            ctx.lineWidth = rr * (t / s.trail.length) * 0.8;
            ctx.beginPath();
            ctx.moveTo(s.trail[t - 1].x, s.trail[t - 1].y);
            ctx.lineTo(s.trail[t].x, s.trail[t].y);
            ctx.stroke();
          }
          ctx.globalAlpha = a * 0.3; ctx.lineWidth = rr * 0.8;
          ctx.beginPath();
          ctx.moveTo(s.trail[s.trail.length - 1].x, s.trail[s.trail.length - 1].y);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }

        // Environment light — large soft radial glow simulating light bounce on wall
        const envRadius = rr * 35 + s.life * 25;
        const envGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, envRadius);
        envGrad.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${a * 0.14})`);
        envGrad.addColorStop(0.3, `rgba(${s.r},${s.g},${s.b},${a * 0.06})`);
        envGrad.addColorStop(0.6, `rgba(${s.r},${s.g},${s.b},${a * 0.02})`);
        envGrad.addColorStop(1, `rgba(${s.r},${s.g},${s.b},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = envGrad;
        ctx.beginPath(); ctx.arc(s.x, s.y, envRadius, 0, Math.PI * 2); ctx.fill();

        // Glow
        ctx.globalAlpha = a * 0.15;
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, rr * 4, 0, Math.PI * 2); ctx.fill();
        // Core
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, Math.PI * 2); ctx.fill();
        // White center
        if (s.life > 0.3) {
          ctx.globalAlpha = a * 0.8; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(s.x, s.y, rr * 0.4, 0, Math.PI * 2); ctx.fill();
        }
        sparks[w++] = s;
      }
      sparks.length = w; sparkCount = w;

      // Render bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; b.life -= b.decay;
        if (b.life <= 0) { bolts.splice(i, 1); continue; }

        // Environment light from bolt — illuminate the wall around each segment
        for (const seg of b.segments) {
          const mx = (seg.x1 + seg.x2) / 2;
          const my = (seg.y1 + seg.y2) / 2;
          const boltEnvR = 80 + b.life * 60;
          const boltGrad = ctx.createRadialGradient(mx, my, 0, mx, my, boltEnvR);
          boltGrad.addColorStop(0, `rgba(${b.r},${b.g},${b.b},${b.life * 0.15})`);
          boltGrad.addColorStop(0.4, `rgba(${b.r},${b.g},${b.b},${b.life * 0.06})`);
          boltGrad.addColorStop(1, `rgba(${b.r},${b.g},${b.b},0)`);
          ctx.globalAlpha = 1;
          ctx.fillStyle = boltGrad;
          ctx.beginPath(); ctx.arc(mx, my, boltEnvR, 0, Math.PI * 2); ctx.fill();
        }

        ctx.lineCap = 'round';
        // Outer glow
        ctx.globalAlpha = b.life * 0.25;
        ctx.strokeStyle = `rgb(${b.r},${b.g},${b.b})`;
        ctx.lineWidth = b.life * 8;
        ctx.beginPath();
        for (const seg of b.segments) { ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); }
        ctx.stroke();
        // Core
        ctx.globalAlpha = b.life; ctx.lineWidth = b.life * 2.5;
        ctx.beginPath();
        for (const seg of b.segments) { ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); }
        ctx.stroke();
        // White core
        ctx.globalAlpha = b.life * 0.8; ctx.strokeStyle = '#fff'; ctx.lineWidth = b.life;
        ctx.beginPath();
        for (const seg of b.segments) { ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [bridgeRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        mixBlendMode: "screen",
      }}
    />
  );
}
