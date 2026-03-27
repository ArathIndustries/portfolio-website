"use client";

import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { NeonBridge } from "./types";

const NEON_RGB = [255, 136, 0];
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
  const visualRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const vc = visualRef.current;
    const mc = maskRef.current;
    if (!vc || !mc) return;
    const vCtxEl = vc.getContext("2d", { alpha: true });
    const mCtxEl = mc.getContext("2d", { alpha: true });
    if (!vCtxEl || !mCtxEl) return;
    const visualCanvas = vc;
    const maskCanvas = mc;
    const vCtx = vCtxEl;
    const mCtx = mCtxEl;

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

    // Resize both canvases
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      visualCanvas.width = w; visualCanvas.height = h;
      maskCanvas.width = w; maskCanvas.height = h;
    }
    resize();
    window.addEventListener("resize", resize);

    // Mouse tracking
    let mouseX = -200, mouseY = -200, lastMouseX = 0, lastMouseY = 0;
    let smoothMouseX = -200, smoothMouseY = -200;
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
      const w = visualCanvas.width;
      const h = visualCanvas.height;

      // === VISUAL CANVAS — colored sparks/bolts ===
      vCtx.clearRect(0, 0, w, h);

      // === MASK CANVAS — black with holes punched for light ===
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.globalAlpha = 1;
      mCtx.fillStyle = '#000';
      mCtx.fillRect(0, 0, w, h);
      mCtx.globalCompositeOperation = 'destination-out';

      // Sign ambient glow — large soft reveal centered on the sign
      const sc = bridgeRef.current.signCenter;
      const avgB = bridgeRef.current.avgBrightness;
      if (sc) {
        // Wider elliptical glow — stretches horizontally to cover first/last letters
        const glowRx = Math.min(w * 0.65, 900);
        const glowRy = Math.min(h * 0.35, 400);
        const glowR = Math.max(glowRx, glowRy);
        // Scale the canvas to draw an ellipse via radial gradient
        mCtx.save();
        mCtx.translate(sc.x, sc.y);
        mCtx.scale(glowRx / glowR, glowRy / glowR);
        const signGrad = mCtx.createRadialGradient(0, 0, 0, 0, 0, glowR);
        signGrad.addColorStop(0, `rgba(255,255,255,${0.75 * avgB})`);
        signGrad.addColorStop(0.2, `rgba(255,255,255,${0.45 * avgB})`);
        signGrad.addColorStop(0.5, `rgba(255,255,255,${0.15 * avgB})`);
        signGrad.addColorStop(0.75, `rgba(255,255,255,${0.04 * avgB})`);
        signGrad.addColorStop(1, 'rgba(255,255,255,0)');
        mCtx.fillStyle = signGrad;
        mCtx.beginPath(); mCtx.arc(0, 0, glowR, 0, Math.PI * 2); mCtx.fill();
        mCtx.restore();
      }

      // Mouse flashlight glow on mask
      smoothMouseX += (mouseX - smoothMouseX) * 0.15;
      smoothMouseY += (mouseY - smoothMouseY) * 0.15;
      const mouseR = 180;
      const mouseGrad = mCtx.createRadialGradient(smoothMouseX, smoothMouseY, 0, smoothMouseX, smoothMouseY, mouseR);
      mouseGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
      mouseGrad.addColorStop(0.25, 'rgba(255,255,255,0.2)');
      mouseGrad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
      mouseGrad.addColorStop(1, 'rgba(255,255,255,0)');
      mCtx.fillStyle = mouseGrad;
      mCtx.beginPath(); mCtx.arc(smoothMouseX, smoothMouseY, mouseR, 0, Math.PI * 2); mCtx.fill();

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
      let wi = 0;
      for (let i = 0; i < sparkCount; i++) {
        const s = sparks[i];
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > s.trailLen) s.trail.shift();
        s.x += s.vx; s.y += s.vy; s.vy += s.gravity; s.vx *= 0.985; s.life -= s.decay;
        if (s.life <= 0) { s.trail.length = 0; releaseSpark(s); continue; }
        const a = s.life, rr = s.size * Math.max(s.life, 0.3);

        // --- MASK: punch hole for this spark's environment light ---
        const envRadius = rr * 35 + s.life * 25;
        const maskGrad = mCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, envRadius);
        maskGrad.addColorStop(0, `rgba(255,255,255,${a * 0.25})`);
        maskGrad.addColorStop(0.3, `rgba(255,255,255,${a * 0.1})`);
        maskGrad.addColorStop(0.6, `rgba(255,255,255,${a * 0.03})`);
        maskGrad.addColorStop(1, 'rgba(255,255,255,0)');
        mCtx.fillStyle = maskGrad;
        mCtx.beginPath(); mCtx.arc(s.x, s.y, envRadius, 0, Math.PI * 2); mCtx.fill();

        // --- VISUAL: render spark ---
        // Trail
        if (s.trail.length > 1) {
          vCtx.strokeStyle = `rgb(${s.r},${s.g},${s.b})`;
          vCtx.lineCap = 'round';
          for (let t = 1; t < s.trail.length; t++) {
            vCtx.globalAlpha = (t / s.trail.length) * a * 0.3;
            vCtx.lineWidth = rr * (t / s.trail.length) * 0.8;
            vCtx.beginPath();
            vCtx.moveTo(s.trail[t - 1].x, s.trail[t - 1].y);
            vCtx.lineTo(s.trail[t].x, s.trail[t].y);
            vCtx.stroke();
          }
          vCtx.globalAlpha = a * 0.3; vCtx.lineWidth = rr * 0.8;
          vCtx.beginPath();
          vCtx.moveTo(s.trail[s.trail.length - 1].x, s.trail[s.trail.length - 1].y);
          vCtx.lineTo(s.x, s.y);
          vCtx.stroke();
        }
        // Glow
        vCtx.globalAlpha = a * 0.15;
        vCtx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        vCtx.beginPath(); vCtx.arc(s.x, s.y, rr * 4, 0, Math.PI * 2); vCtx.fill();
        // Core
        vCtx.globalAlpha = a;
        vCtx.beginPath(); vCtx.arc(s.x, s.y, rr, 0, Math.PI * 2); vCtx.fill();
        // White center
        if (s.life > 0.3) {
          vCtx.globalAlpha = a * 0.8; vCtx.fillStyle = '#fff';
          vCtx.beginPath(); vCtx.arc(s.x, s.y, rr * 0.4, 0, Math.PI * 2); vCtx.fill();
        }
        sparks[wi++] = s;
      }
      sparks.length = wi; sparkCount = wi;

      // Render bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; b.life -= b.decay;
        if (b.life <= 0) { bolts.splice(i, 1); continue; }

        // --- MASK: punch holes for bolt environment light ---
        for (const seg of b.segments) {
          const mx = (seg.x1 + seg.x2) / 2;
          const my = (seg.y1 + seg.y2) / 2;
          const boltEnvR = 80 + b.life * 60;
          const boltMaskGrad = mCtx.createRadialGradient(mx, my, 0, mx, my, boltEnvR);
          boltMaskGrad.addColorStop(0, `rgba(255,255,255,${b.life * 0.3})`);
          boltMaskGrad.addColorStop(0.4, `rgba(255,255,255,${b.life * 0.1})`);
          boltMaskGrad.addColorStop(1, 'rgba(255,255,255,0)');
          mCtx.fillStyle = boltMaskGrad;
          mCtx.beginPath(); mCtx.arc(mx, my, boltEnvR, 0, Math.PI * 2); mCtx.fill();
        }

        // --- VISUAL: render bolt ---
        vCtx.lineCap = 'round';
        // Outer glow
        vCtx.globalAlpha = b.life * 0.25;
        vCtx.strokeStyle = `rgb(${b.r},${b.g},${b.b})`;
        vCtx.lineWidth = b.life * 8;
        vCtx.beginPath();
        for (const seg of b.segments) { vCtx.moveTo(seg.x1, seg.y1); vCtx.lineTo(seg.x2, seg.y2); }
        vCtx.stroke();
        // Core
        vCtx.globalAlpha = b.life; vCtx.lineWidth = b.life * 2.5;
        vCtx.beginPath();
        for (const seg of b.segments) { vCtx.moveTo(seg.x1, seg.y1); vCtx.lineTo(seg.x2, seg.y2); }
        vCtx.stroke();
        // White core
        vCtx.globalAlpha = b.life * 0.8; vCtx.strokeStyle = '#fff'; vCtx.lineWidth = b.life;
        vCtx.beginPath();
        for (const seg of b.segments) { vCtx.moveTo(seg.x1, seg.y1); vCtx.lineTo(seg.x2, seg.y2); }
        vCtx.stroke();
      }
      vCtx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [bridgeRef]);

  const canvasBase: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  };

  return (
    <>
      {/* Mask canvas — black overlay with holes punched where light reveals bricks */}
      <canvas
        ref={maskRef}
        style={{
          ...canvasBase,
          zIndex: 1,
          mixBlendMode: "multiply",
        }}
      />
      {/* Visual canvas — colored sparks, bolts, trails */}
      <canvas
        ref={visualRef}
        style={{
          ...canvasBase,
          zIndex: 3,
        }}
      />
    </>
  );
}
