"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function MouseGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  useEffect(() => {
    // On landing page, SparkCanvas handles the mask + mouse glow
    if (isLanding) return;
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d", { alpha: true });
    if (!ctx) return;
    const canvas = el;

    let mouseX = -200;
    let mouseY = -200;
    let smoothX = -200;
    let smoothY = -200;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    document.addEventListener("mousemove", onMouseMove);

    function tick() {
      // Smooth follow
      smoothX += (mouseX - smoothX) * 0.15;
      smoothY += (mouseY - smoothY) * 0.15;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'destination-out';

      // Subtle amber-tinted reveal at cursor
      const r = 150;
      const grad = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.3)');
      grad.addColorStop(0.25, 'rgba(255,255,255,0.15)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(smoothX, smoothY, r, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [isLanding]);

  if (isLanding) return null;

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
        mixBlendMode: "multiply",
      }}
    />
  );
}
