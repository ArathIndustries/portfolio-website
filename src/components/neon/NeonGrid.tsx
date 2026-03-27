"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { TubeCardHandle } from "./NeonTubeCard";
import type { Wave } from "./types";

// ============================================================
// TYPES
// ============================================================

const NEON_RGB = [255, 136, 0];
const NUM_SEGS = 40;
const MAX_SPARKS = 100;

interface GridNode {
  idx: number;
  type: string; // 'card' | 'heading' | 'divider' | 'header'
  el: HTMLElement;
  cardIdx: number | null;
  brightness: number;
}

interface GridConnection {
  from: number;
  to: number;
  wireEl: HTMLElement | null;
  distance: number;
  pulseEl: HTMLElement | null;
}

interface GridSurgePending {
  nodeIdx: number;
  arriveTime: number;
  fromIdx: number;
  intensity: number;
  connIdx: number;
  direction: "up" | "down";
}

interface GridSurge {
  originIdx: number;
  intensity: number;
  startTime: number;
  speed: number;
  reached: Set<number>;
  pending: GridSurgePending[];
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  r: number;
  g: number;
  b: number;
  gravity: number;
  trail: { x: number; y: number }[];
  trailLen: number;
}

interface Bolt {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  life: number;
  decay: number;
  r: number;
  g: number;
  b: number;
}

// Card state used internally by NeonGrid for wave processing
interface CardState {
  handle: TubeCardHandle;
  waves: Wave[];
  brightness: Float32Array;
  prevBrightness: Float32Array;
}

// ============================================================
// CONTEXT
// ============================================================

export interface NeonGridContextValue {
  registerCard: (idx: number, handle: TubeCardHandle) => void;
  registerNode: (id: string, type: string, element: HTMLElement) => void;
}

export const NeonGridContext = createContext<NeonGridContextValue>({
  registerCard: () => {},
  registerNode: () => {},
});

export function useNeonGrid() {
  return useContext(NeonGridContext);
}

// ============================================================
// PROPS
// ============================================================

interface NeonGridProps {
  children: ReactNode;
}

// ============================================================
// COMPONENT
// ============================================================

export function NeonGrid({ children }: NeonGridProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Mutable refs for grid state (no re-renders needed)
  const gridNodesRef = useRef<GridNode[]>([]);
  const gridConnectionsRef = useRef<GridConnection[]>([]);
  const activeGridSurgesRef = useRef<GridSurge[]>([]);
  const cardStatesRef = useRef<Map<number, CardState>>(new Map());
  const registeredNodesRef = useRef<Map<string, { type: string; element: HTMLElement }>>(new Map());

  // Spark system refs
  const sparksRef = useRef<Spark[]>([]);
  const sparkCountRef = useRef(0);
  const sparkPoolRef = useRef<Spark[]>([]);
  const boltsRef = useRef<Bolt[]>([]);

  // Timer refs for cleanup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Helper to track timers for cleanup
  const addTimer = useCallback((fn: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const id = setTimeout(() => {
      // Remove from tracked timers
      const idx = timersRef.current.indexOf(id);
      if (idx >= 0) timersRef.current.splice(idx, 1);
      fn();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  // ============================================================
  // SPARK HELPERS
  // ============================================================

  const getSpark = useCallback((): Spark => {
    return sparkPoolRef.current.length > 0
      ? sparkPoolRef.current.pop()!
      : ({} as Spark);
  }, []);

  const releaseSpark = useCallback((s: Spark) => {
    sparkPoolRef.current.push(s);
  }, []);

  const initSpark = useCallback(
    (s: Spark, x: number, y: number, speed: number): Spark => {
      const angle = -Math.PI * (0.2 + Math.random() * 0.6);
      const velocity = (Math.random() * 1.2 + 0.5) * speed;
      s.x = x;
      s.y = y;
      s.vx = Math.cos(angle) * velocity + (Math.random() - 0.5) * 0.8;
      s.vy = Math.sin(angle) * velocity;
      s.life = 1.0;
      s.decay = Math.random() * 0.01 + 0.005;
      s.size = Math.random() * 1.5 + 0.5;
      s.r = NEON_RGB[0];
      s.g = NEON_RGB[1];
      s.b = NEON_RGB[2];
      if (Math.random() > 0.6) {
        s.r = 255;
        s.g = 220;
        s.b = 180;
      }
      s.gravity = 0.03 + Math.random() * 0.05;
      s.trail = [];
      s.trailLen = Math.floor(Math.random() * 3 + 2);
      return s;
    },
    []
  );

  const spawnBolt = useCallback((x: number, y: number) => {
    const segs: Bolt["segments"] = [];
    let cx = x,
      cy = y;
    for (let i = 0; i < Math.floor(Math.random() * 4 + 2); i++) {
      const nx = cx + (Math.random() - 0.5) * 30;
      const ny = cy + (Math.random() - 0.5) * 30;
      segs.push({ x1: cx, y1: cy, x2: nx, y2: ny });
      cx = nx;
      cy = ny;
    }
    boltsRef.current.push({
      segments: segs,
      life: 1,
      decay: 0.05 + Math.random() * 0.03,
      r: NEON_RGB[0],
      g: NEON_RGB[1],
      b: NEON_RGB[2],
    });
  }, []);

  // ============================================================
  // WAVE SYSTEM
  // ============================================================

  const scheduleWave = useCallback(
    (state: CardState, intensity?: number) => {
      const now = performance.now();
      const n = NUM_SEGS;
      const roll = Math.random();
      const int = intensity || 1;
      let wave: Wave;

      if (roll < 0.25) {
        wave = {
          startTime: now,
          mode: "linear",
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 50 + Math.random() * 40,
          dip: (0.2 + Math.random() * 0.3) * int,
          holdMs: 80 + Math.random() * 80,
          recoveryMs: 250 + Math.random() * 200,
        };
      } else if (roll < 0.45) {
        wave = {
          startTime: now,
          mode: "linear",
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 70 + Math.random() * 50,
          dip: (0.3 + Math.random() * 0.2) * int,
          holdMs: 120 + Math.random() * 120,
          recoveryMs: 350 + Math.random() * 250,
        };
      } else if (roll < 0.65) {
        const origin = Math.floor(Math.random() * n);
        wave = {
          startTime: now,
          mode: "ripple",
          origin,
          speed: 45 + Math.random() * 40,
          dip: (0.1 + Math.random() * 0.25) * int,
          holdMs: 80 + Math.random() * 80,
          recoveryMs: 250 + Math.random() * 200,
        };
      } else if (roll < 0.8) {
        const origin = Math.floor(n * 0.3 + Math.random() * n * 0.4);
        wave = {
          startTime: now,
          mode: "ripple",
          origin,
          speed: 30 + Math.random() * 30,
          dip: (0.05 + Math.random() * 0.1) * int,
          holdMs: 80 + Math.random() * 60,
          recoveryMs: 180 + Math.random() * 150,
          bounce: true,
        };
      } else if (roll < 0.92) {
        wave = {
          startTime: now,
          mode: "single",
          target: Math.floor(Math.random() * n),
          dip: (0.05 + Math.random() * 0.15) * int,
          holdMs: 100 + Math.random() * 120,
          recoveryMs: 200 + Math.random() * 200,
        };
      } else {
        wave = {
          startTime: now,
          mode: "linear",
          direction: 1,
          speed: 15 + Math.random() * 15,
          dip: 0,
          holdMs: 200 + Math.random() * 200,
          recoveryMs: 400 + Math.random() * 400,
        };
      }
      state.waves.push(wave);
    },
    []
  );

  const processWaves = useCallback((state: CardState, now: number) => {
    const n = NUM_SEGS;
    const brightness = state.brightness;
    brightness.fill(1.0);

    for (let w = state.waves.length - 1; w >= 0; w--) {
      const wave = state.waves[w];
      let allDone = true;
      for (let i = 0; i < n; i++) {
        let delay: number;
        if (wave.mode === "ripple") {
          delay =
            Math.min(
              Math.abs(i - (wave.origin ?? 0)),
              n - Math.abs(i - (wave.origin ?? 0))
            ) * (wave.speed ?? 40);
        } else if (wave.mode === "single") {
          if (i !== wave.target) continue;
          delay = 0;
        } else {
          delay =
            ((wave.direction ?? 1) === 1 ? i : n - 1 - i) *
            (wave.speed ?? 40);
        }
        const elapsed = now - wave.startTime - delay;
        if (elapsed < 0) {
          allDone = false;
          continue;
        }
        const total = wave.holdMs + wave.recoveryMs;
        let b: number;
        if (elapsed < wave.holdMs) {
          b = wave.dip;
          allDone = false;
        } else if (elapsed < total) {
          const rt = (elapsed - wave.holdMs) / wave.recoveryMs;
          b = wave.dip + (1 - wave.dip) * rt;
          if (wave.bounce && rt > 0.3 && rt < 0.5)
            b *= 0.3 + Math.random() * 0.2;
          allDone = false;
        } else {
          b = 1.0;
        }
        brightness[i] = Math.min(brightness[i], b);
      }
      if (allDone) state.waves.splice(w, 1);
    }

    // Push brightness to the card handle
    state.handle.applyBrightness(brightness);
  }, []);

  // ============================================================
  // WHITE NEON RESPONSE
  // ============================================================

  const triggerWhiteNeonResponse = useCallback(
    (sourceId: string, intensity: number) => {
      const responders = document.querySelectorAll<HTMLElement>(
        `[data-responds-to="${sourceId}"]`
      );
      responders.forEach((el) => {
        // Phase 1: dip (voltage drop)
        el.classList.add("surge-dip");
        el.classList.remove("surge-nearby");

        // Phase 2: brighten (surge arrives)
        addTimer(() => {
          el.classList.remove("surge-dip");
          el.classList.add("surge-nearby");

          // Phase 3: settle back to normal
          addTimer(() => {
            el.classList.remove("surge-nearby");
          }, 300 + intensity * 400);
        }, 100 + Math.random() * 80);
      });
    },
    [addTimer]
  );

  // ============================================================
  // ARC SYSTEM
  // ============================================================

  const tryArc = useCallback(
    (fromCardIdx: number, intensity: number) => {
      if (intensity < 0.5) return;

      const fromState = cardStatesRef.current.get(fromCardIdx);
      if (!fromState) return;
      const fromEl = fromState.handle.element;
      if (!fromEl) return;
      const fromRect = fromEl.getBoundingClientRect();

      // Find nearest card
      let nearestIdx = -1;
      let nearestDist = Infinity;

      cardStatesRef.current.forEach((state, idx) => {
        if (idx === fromCardIdx) return;
        const el = state.handle.element;
        if (!el) return;
        const r = el.getBoundingClientRect();
        let dist: number;
        if (r.top > fromRect.bottom) dist = r.top - fromRect.bottom;
        else if (fromRect.top > r.bottom) dist = fromRect.top - r.bottom;
        else dist = 0;

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });

      if (nearestIdx < 0 || nearestDist > 120) return;

      const arcChance = (intensity - 0.5) * 0.6 * (1 - nearestDist / 120);
      if (Math.random() > arcChance) return;

      const toState = cardStatesRef.current.get(nearestIdx);
      if (!toState) return;
      const toEl = toState.handle.element;
      if (!toEl) return;
      const toRect = toEl.getBoundingClientRect();

      const fromX = fromRect.left + Math.random() * fromRect.width;
      const fromBelow = toRect.top > fromRect.bottom;
      const fromY = fromBelow ? fromRect.bottom : fromRect.top;
      const toX = toRect.left + Math.random() * toRect.width;
      const toY = fromBelow ? toRect.top : toRect.bottom;

      // Build jagged arc path
      const arcSegs: Bolt["segments"] = [];
      const steps = 4 + Math.floor(Math.random() * 4);
      let cx = fromX,
        cy = fromY;

      for (let i = 0; i < steps; i++) {
        const t = (i + 1) / steps;
        const nx =
          fromX + (toX - fromX) * t + (Math.random() - 0.5) * 40;
        const ny =
          fromY + (toY - fromY) * t + (Math.random() - 0.5) * 15;
        arcSegs.push({ x1: cx, y1: cy, x2: nx, y2: ny });
        cx = nx;
        cy = ny;
      }
      // Snap final segment to target
      arcSegs[arcSegs.length - 1].x2 = toX;
      arcSegs[arcSegs.length - 1].y2 = toY;

      // Add as a bolt with slower decay
      boltsRef.current.push({
        segments: arcSegs,
        life: 1,
        decay: 0.02 + Math.random() * 0.015,
        r: NEON_RGB[0],
        g: NEON_RGB[1],
        b: NEON_RGB[2],
      });

      // Sparks at both connection points
      const sparks = sparksRef.current;
      let sc = sparkCountRef.current;
      for (
        let i = 0;
        i < 3 + Math.floor(Math.random() * 3) && sc < MAX_SPARKS;
        i++
      ) {
        sparks.push(
          initSpark(
            getSpark(),
            fromX + (Math.random() - 0.5) * 8,
            fromY + (Math.random() - 0.5) * 8,
            0.7
          )
        );
        sc++;
      }
      for (
        let i = 0;
        i < 2 + Math.floor(Math.random() * 3) && sc < MAX_SPARKS;
        i++
      ) {
        sparks.push(
          initSpark(
            getSpark(),
            toX + (Math.random() - 0.5) * 8,
            toY + (Math.random() - 0.5) * 8,
            0.6
          )
        );
        sc++;
      }
      sparkCountRef.current = sc;

      // The receiving card gets a small surge from the arc
      scheduleWave(toState, intensity * 0.4);
    },
    [getSpark, initSpark, scheduleWave]
  );

  // ============================================================
  // NODE SURGE
  // ============================================================

  const triggerNodeSurge = useCallback(
    (nodeIdx: number, intensity: number) => {
      const nodes = gridNodesRef.current;
      const node = nodes[nodeIdx];
      if (!node) return;

      if (node.type === "card" && node.cardIdx !== null) {
        triggerWhiteNeonResponse(`card-${node.cardIdx}`, intensity);
        tryArc(node.cardIdx, intensity);
        const state = cardStatesRef.current.get(node.cardIdx);
        if (state) {
          // Dip first
          state.waves.push({
            startTime: performance.now() - 50,
            mode: "linear",
            direction: 1,
            speed: 3,
            dip: 0.3 * intensity,
            holdMs: 80,
            recoveryMs: 150,
          });
          // Then surge ripple
          addTimer(() => {
            scheduleWave(state, intensity);
          }, 100 + Math.random() * 100);
        }
      } else if (node.type === "heading") {
        triggerWhiteNeonResponse("heading", intensity);
        // Flash the heading neon-text
        const el = node.el.querySelector(".neon-text") as HTMLElement | null;
        if (el) {
          const origOpacity = el.style.opacity;
          el.style.opacity = String(1 - intensity * 0.4);
          addTimer(() => {
            el.style.opacity = origOpacity || "";
            el.style.textShadow = `0 0 ${10 + intensity * 20}px rgba(${NEON_RGB.join(",")},${0.4 + intensity * 0.4}), 0 0 ${40 + intensity * 40}px rgba(${NEON_RGB.join(",")},${0.15 + intensity * 0.15})`;
            addTimer(() => {
              el.style.textShadow = "";
            }, 300);
          }, 100);
        }
      } else if (node.type === "header") {
        triggerWhiteNeonResponse("header", intensity);
        const el = node.el.querySelector(".site-logo") as HTMLElement | null;
        if (el) {
          el.style.opacity = String(1 - intensity * 0.3);
          addTimer(() => {
            el.style.opacity = "";
          }, 150);
        }
      } else if (node.type === "divider") {
        const el = node.el;
        el.style.background = `linear-gradient(90deg, transparent, rgba(${NEON_RGB.join(",")},${0.15 + intensity * 0.4}) 20%, rgba(${NEON_RGB.join(",")},${0.15 + intensity * 0.4}) 80%, transparent)`;
        el.style.boxShadow = `0 0 ${8 + intensity * 15}px rgba(${NEON_RGB.join(",")},${0.15 + intensity * 0.3})`;
        addTimer(() => {
          el.style.background = "";
          el.style.boxShadow = "";
        }, 300 + intensity * 200);
      }
    },
    [addTimer, scheduleWave, triggerWhiteNeonResponse, tryArc]
  );

  // ============================================================
  // WIRE PULSE ANIMATION
  // ============================================================

  const animateWirePulse = useCallback(
    (connIdx: number, direction: "up" | "down", duration: number) => {
      const conn = gridConnectionsRef.current[connIdx];
      if (!conn || !conn.pulseEl) return;

      const pulse = conn.pulseEl;
      pulse.style.animation = "none";
      // Force reflow
      void pulse.offsetWidth;

      const animName =
        direction === "down" ? "wire-pulse-down" : "wire-pulse-up";
      pulse.style.animation = `${animName} ${duration}ms ease-in-out forwards`;
    },
    []
  );

  // ============================================================
  // COLLISION HANDLING
  // ============================================================

  const handleCollision = useCallback(
    (nodeIdx: number, intensity1: number, intensity2: number) => {
      const nodes = gridNodesRef.current;
      const node = nodes[nodeIdx];
      if (!node) return;

      const rect = node.el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const diff = Math.abs(intensity1 - intensity2);
      const combined = intensity1 + intensity2;

      const sparks = sparksRef.current;
      let sc = sparkCountRef.current;

      // All collisions get some sparks
      const baseCount = Math.floor(combined * 6 + 2);
      for (let i = 0; i < baseCount && sc < MAX_SPARKS; i++) {
        sparks.push(
          initSpark(
            getSpark(),
            cx + (Math.random() - 0.5) * rect.width * 0.6,
            cy + (Math.random() - 0.5) * rect.height * 0.4,
            0.8 + combined * 0.4
          )
        );
        sc++;
      }

      if (diff < 0.15) {
        // Constructive interference — BIG flash + bolt shower
        const burstCount = Math.floor(Math.random() * 10 + 6);
        for (let i = 0; i < burstCount && sc < MAX_SPARKS; i++) {
          sparks.push(
            initSpark(
              getSpark(),
              cx + (Math.random() - 0.5) * rect.width * 0.8,
              cy + (Math.random() - 0.5) * rect.height * 0.5,
              1.5 + combined * 0.3
            )
          );
          sc++;
        }
        spawnBolt(cx, cy);
        if (Math.random() > 0.3)
          spawnBolt(
            cx + (Math.random() - 0.5) * 40,
            cy + (Math.random() - 0.5) * 40
          );

        // Flash neon text on heading/header nodes
        if (node.type === "heading" || node.type === "header") {
          const el =
            node.type === "header"
              ? (node.el.querySelector(".site-logo") as HTMLElement | null)
              : (node.el.querySelector(".neon-text") as HTMLElement | null);
          if (el) {
            el.style.textShadow = `0 0 30px rgba(${NEON_RGB.join(",")},1), 0 0 60px rgba(${NEON_RGB.join(",")},0.6), 0 0 100px rgba(${NEON_RGB.join(",")},0.3)`;
            addTimer(() => {
              el.style.textShadow = "";
            }, 250);
          }
        }

        // Flash card bloom
        if (node.type === "card" && node.cardIdx !== null) {
          const state = cardStatesRef.current.get(node.cardIdx);
          if (state) {
            const cardEl = state.handle.element;
            if (cardEl) {
              cardEl.style.boxShadow = `0 0 40px rgba(${NEON_RGB.join(",")},0.3), 0 0 80px rgba(${NEON_RGB.join(",")},0.15), 0 0 150px rgba(${NEON_RGB.join(",")},0.06)`;
              addTimer(() => {
                cardEl.style.boxShadow = "";
              }, 300);
            }
          }
        }
      } else if (
        intensity1 > intensity2 * 2 ||
        intensity2 > intensity1 * 2
      ) {
        // Absorption — single bolt
        if (Math.random() > 0.4) spawnBolt(cx, cy);
      } else {
        // Destructive — partial cancellation, brief dim + small bolt
        if (Math.random() > 0.5) spawnBolt(cx, cy);
        if (node.type === "card" && node.cardIdx !== null) {
          const state = cardStatesRef.current.get(node.cardIdx);
          if (state) {
            state.waves.push({
              startTime: performance.now(),
              mode: "linear",
              direction: 1,
              speed: 2,
              dip: 0.05,
              holdMs: 80,
              recoveryMs: 300,
            });
          }
        }
      }

      sparkCountRef.current = sc;

      // Trigger white neon response on collision node
      if (node.type === "card" && node.cardIdx !== null) {
        triggerWhiteNeonResponse(`card-${node.cardIdx}`, combined * 0.5);
      } else if (node.type === "heading") {
        triggerWhiteNeonResponse("heading", combined * 0.5);
      } else if (node.type === "header") {
        triggerWhiteNeonResponse("header", combined * 0.5);
      }
    },
    [addTimer, getSpark, initSpark, spawnBolt, triggerWhiteNeonResponse]
  );

  // ============================================================
  // GRID SURGE SYSTEM
  // ============================================================

  const triggerGridSurge = useCallback(
    (originIdx: number, intensity?: number) => {
      const now = performance.now();
      const connections = gridConnectionsRef.current;

      const surge: GridSurge = {
        originIdx,
        intensity: intensity ?? 0.5 + Math.random() * 0.5,
        startTime: now,
        speed: 400 + Math.random() * 400,
        reached: new Set([originIdx]),
        pending: [],
      };

      // Queue immediate neighbors
      connections.forEach((conn, ci) => {
        if (conn.from === originIdx) {
          surge.pending.push({
            nodeIdx: conn.to,
            arriveTime: now + surge.speed,
            fromIdx: originIdx,
            intensity: surge.intensity * 0.85,
            connIdx: ci,
            direction: "down",
          });
        }
        if (conn.to === originIdx) {
          surge.pending.push({
            nodeIdx: conn.from,
            arriveTime: now + surge.speed,
            fromIdx: originIdx,
            intensity: surge.intensity * 0.85,
            connIdx: ci,
            direction: "up",
          });
        }
      });

      activeGridSurgesRef.current.push(surge);

      // Trigger local effect on the origin node
      triggerNodeSurge(originIdx, surge.intensity);
    },
    [triggerNodeSurge]
  );

  const processGridSurges = useCallback(
    (now: number) => {
      const surges = activeGridSurgesRef.current;
      const connections = gridConnectionsRef.current;

      for (let s = surges.length - 1; s >= 0; s--) {
        const surge = surges[s];
        let hasActivity = false;

        for (let p = surge.pending.length - 1; p >= 0; p--) {
          const pending = surge.pending[p];

          if (now >= pending.arriveTime && !surge.reached.has(pending.nodeIdx)) {
            surge.reached.add(pending.nodeIdx);
            surge.pending.splice(p, 1);

            // Trigger local effect
            triggerNodeSurge(pending.nodeIdx, pending.intensity);

            // Check for collision with other surges
            surges.forEach((otherSurge, otherIdx) => {
              if (otherIdx === s) return;
              if (otherSurge.reached.has(pending.nodeIdx)) {
                handleCollision(
                  pending.nodeIdx,
                  surge.intensity,
                  otherSurge.intensity
                );
              }
            });

            // Propagate to next neighbors
            if (pending.intensity > 0.1) {
              connections.forEach((conn, ci) => {
                let nextNode: number | null = null;
                let dir: "up" | "down" | null = null;
                if (
                  conn.from === pending.nodeIdx &&
                  !surge.reached.has(conn.to)
                ) {
                  nextNode = conn.to;
                  dir = "down";
                }
                if (
                  conn.to === pending.nodeIdx &&
                  !surge.reached.has(conn.from)
                ) {
                  nextNode = conn.from;
                  dir = "up";
                }
                if (nextNode !== null && dir !== null) {
                  surge.pending.push({
                    nodeIdx: nextNode,
                    arriveTime: now + surge.speed,
                    fromIdx: pending.nodeIdx,
                    intensity: pending.intensity * 0.8,
                    connIdx: ci,
                    direction: dir,
                  });

                  animateWirePulse(ci, dir, surge.speed);
                }
              });
            }

            hasActivity = true;
          } else if (now < pending.arriveTime) {
            hasActivity = true;
          }
        }

        if (!hasActivity && surge.pending.length === 0) {
          surges.splice(s, 1);
        }
      }
    },
    [animateWirePulse, handleCollision, triggerNodeSurge]
  );

  // ============================================================
  // SPARK ON DIPS
  // ============================================================

  const sparkOnDips = useCallback(
    (cardIdx: number, state: CardState) => {
      const el = state.handle.element;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const midpoints = state.handle.midpoints;
      if (!midpoints) return;

      const sparks = sparksRef.current;
      let sc = sparkCountRef.current;

      for (let i = 0; i < NUM_SEGS; i++) {
        const drop = state.prevBrightness[i] - state.brightness[i];
        if (drop > 0.35 && Math.random() > 0.92) {
          const mp = midpoints[i];
          if (!mp) continue;
          const sx = rect.left + mp.midX - 6;
          const sy = rect.top + mp.midY - 6;
          const count = Math.floor(drop * 3);
          for (let j = 0; j < count && sc < MAX_SPARKS; j++) {
            sparks.push(
              initSpark(
                getSpark(),
                sx + (Math.random() - 0.5) * 4,
                sy + (Math.random() - 0.5) * 4,
                0.6 + drop * 0.5
              )
            );
            sc++;
          }
          if (drop > 0.6 && Math.random() > 0.7) spawnBolt(sx, sy);
        }
      }
      sparkCountRef.current = sc;
    },
    [getSpark, initSpark, spawnBolt]
  );

  // ============================================================
  // BIG BANG
  // ============================================================

  const triggerBigBang = useCallback(() => {
    const cardStates = cardStatesRef.current;
    if (cardStates.size === 0) return;

    // Pick a random card
    const keys = Array.from(cardStates.keys());
    const cardIdx = keys[Math.floor(Math.random() * keys.length)];
    const state = cardStates.get(cardIdx);
    if (!state) return;

    const el = state.handle.element;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Phase 1: Everything dips hard
    cardStates.forEach((s) => {
      s.waves.push({
        startTime: performance.now(),
        mode: "linear",
        direction: 1,
        speed: 5,
        dip: 0.15,
        holdMs: 200,
        recoveryMs: 100,
      });
    });

    // Phase 2: The bang — after a tense dip
    addTimer(() => {
      // Blackout the target card
      state.waves.push({
        startTime: performance.now(),
        mode: "linear",
        direction: 1,
        speed: 1,
        dip: 0,
        holdMs: 80,
        recoveryMs: 400,
      });

      // Big spark shower
      const sparks = sparksRef.current;
      let sc = sparkCountRef.current;
      const sparkBurst = 20 + Math.floor(Math.random() * 15);
      for (let i = 0; i < sparkBurst && sc < MAX_SPARKS; i++) {
        sparks.push(
          initSpark(
            getSpark(),
            cx + (Math.random() - 0.5) * rect.width * 0.8,
            cy + (Math.random() - 0.5) * rect.height * 0.6,
            1.8 + Math.random() * 0.8
          )
        );
        sc++;
      }
      sparkCountRef.current = sc;

      // Multiple bolts radiating from the card
      for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        spawnBolt(
          cx + (Math.random() - 0.5) * rect.width * 0.6,
          cy + (Math.random() - 0.5) * rect.height * 0.4
        );
      }

      // Flash the card bloom huge
      el.style.boxShadow = `0 0 60px rgba(${NEON_RGB.join(",")},0.5), 0 0 120px rgba(${NEON_RGB.join(",")},0.25), 0 0 200px rgba(${NEON_RGB.join(",")},0.1)`;
      addTimer(() => {
        el.style.boxShadow = "";
      }, 500);

      // White neon response
      triggerWhiteNeonResponse(`card-${cardIdx}`, 1.0);

      // Force arc attempt
      tryArc(cardIdx, 1.0);

      // Propagate a strong grid surge outward
      const nodes = gridNodesRef.current;
      const nodeIdx = nodes.findIndex((n) => n.cardIdx === cardIdx);
      if (nodeIdx >= 0) triggerGridSurge(nodeIdx, 1.0);
    }, 300);
  }, [
    addTimer,
    getSpark,
    initSpark,
    spawnBolt,
    triggerGridSurge,
    triggerWhiteNeonResponse,
    tryArc,
  ]);

  // ============================================================
  // BUILD GRID FROM REGISTERED NODES
  // ============================================================

  const buildGrid = useCallback(() => {
    const nodes: GridNode[] = [];
    const connections: GridConnection[] = [];

    const nodeEls = document.querySelectorAll<HTMLElement>("[data-grid-node]");
    nodeEls.forEach((el, i) => {
      nodes.push({
        idx: i,
        type: el.dataset.gridNode || "card",
        el,
        cardIdx:
          el.dataset.cardIdx !== undefined
            ? parseInt(el.dataset.cardIdx)
            : null,
        brightness: 1.0,
      });
    });

    // Build connections based on DOM order
    const wireEls = document.querySelectorAll<HTMLElement>("[data-wire]");
    let wireIdx = 0;

    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i];
      const to = nodes[i + 1];
      const fromRect = from.el.getBoundingClientRect();
      const toRect = to.el.getBoundingClientRect();
      const distance = Math.abs(toRect.top - fromRect.bottom);

      const wireEl = wireIdx < wireEls.length ? wireEls[wireIdx] : null;
      if (from.type !== "divider" && to.type !== "divider") {
        wireIdx++;
      }
      if (to.type === "divider") wireIdx++;
      if (from.type === "divider") wireIdx++;

      connections.push({
        from: i,
        to: i + 1,
        wireEl,
        distance,
        pulseEl: wireEl ? wireEl.querySelector<HTMLElement>(".wire-pulse") : null,
      });
    }

    gridNodesRef.current = nodes;
    gridConnectionsRef.current = connections;
  }, []);

  // ============================================================
  // HEADER SPARKS — periodic sparks from .neon-text elements
  // ============================================================

  const spawnHeaderSparks = useCallback(() => {
    const neonTexts = document.querySelectorAll<HTMLElement>(".neon-text");
    const sparks = sparksRef.current;
    let sc = sparkCountRef.current;

    neonTexts.forEach((el) => {
      if (Math.random() > 0.3) return; // Only sometimes
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;

      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count && sc < MAX_SPARKS; i++) {
        sparks.push(initSpark(getSpark(), x, y, 0.5 + Math.random() * 0.5));
        sc++;
      }
    });

    sparkCountRef.current = sc;
  }, [getSpark, initSpark]);

  // ============================================================
  // REGISTRATION CALLBACKS
  // ============================================================

  const registerCard = useCallback(
    (idx: number, handle: TubeCardHandle) => {
      cardStatesRef.current.set(idx, {
        handle,
        waves: [],
        brightness: new Float32Array(NUM_SEGS).fill(1.0),
        prevBrightness: new Float32Array(NUM_SEGS).fill(1.0),
      });
    },
    []
  );

  const registerNode = useCallback(
    (id: string, type: string, element: HTMLElement) => {
      registeredNodesRef.current.set(id, { type, element });
    },
    []
  );

  // ============================================================
  // MAIN EFFECT — animation loop + scheduling
  // ============================================================

  useEffect(() => {
    // Don't render spark canvas on landing page
    if (isLanding) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Resize canvas
    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Build grid after a short delay to let children mount
    const buildDelay = addTimer(() => {
      buildGrid();

      // Start per-card wave schedulers (staggered)
      cardStatesRef.current.forEach((state, idx) => {
        addTimer(() => {
          scheduleWave(state);
          scheduleLocalWavesForCard(idx);
        }, 1500 + Math.random() * 2000);
      });

      // Initial collision test — two surges from opposite ends
      addTimer(() => {
        const nodes = gridNodesRef.current;
        if (nodes.length >= 2) {
          triggerGridSurge(0, 0.8);
          triggerGridSurge(nodes.length - 1, 0.75);
        }
      }, 3000);

      // After demo collision, start normal scheduling
      addTimer(() => {
        scheduleGridSurgeLoop();
      }, 8000);

      // Big bang schedule
      addTimer(() => {
        triggerBigBang();
      }, 8000);
      addTimer(() => {
        scheduleBigBangLoop();
      }, 30000);

      // Collision surge schedule
      addTimer(() => {
        scheduleCollisionSurgeLoop();
      }, 12000);
    }, 100);

    // ---- Scheduling loops ----

    // Grid surge: 15-25s (production-tuned)
    function scheduleGridSurgeLoop() {
      addTimer(() => {
        const nodes = gridNodesRef.current;
        if (nodes.length > 0) {
          const nodeIdx = Math.floor(Math.random() * nodes.length);
          const intensity = 0.5 + Math.random() * 0.5;
          triggerGridSurge(nodeIdx, intensity);
        }
        scheduleGridSurgeLoop();
      }, 15000 + Math.random() * 10000);
    }

    // Per-card local waves: 5-17s per card, 30% double-fire chance
    function scheduleLocalWavesForCard(cardIdx: number) {
      addTimer(() => {
        const state = cardStatesRef.current.get(cardIdx);
        if (!state) return;
        const el = state.handle.element;
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            scheduleWave(state);
            // 30% chance of double-fire
            if (Math.random() > 0.7) {
              addTimer(() => scheduleWave(state), 200 + Math.random() * 400);
            }
          }
        }
        scheduleLocalWavesForCard(cardIdx);
      }, 5000 + Math.random() * 12000);
    }

    // Big bang: 45-90s (production-tuned)
    function scheduleBigBangLoop() {
      addTimer(() => {
        triggerBigBang();
        scheduleBigBangLoop();
      }, 45000 + Math.random() * 45000);
    }

    // Dual collision surges: 30-45s, 40% chance (production-tuned)
    function scheduleCollisionSurgeLoop() {
      addTimer(() => {
        if (Math.random() > 0.6) {
          const nodes = gridNodesRef.current;
          if (nodes.length >= 2) {
            const a = Math.floor(Math.random() * nodes.length);
            let b = Math.floor(Math.random() * nodes.length);
            while (b === a) b = Math.floor(Math.random() * nodes.length);
            triggerGridSurge(a, 0.5 + Math.random() * 0.5);
            addTimer(
              () => triggerGridSurge(b, 0.5 + Math.random() * 0.5),
              Math.random() * 500
            );
          }
        }
        scheduleCollisionSurgeLoop();
      }, 30000 + Math.random() * 15000);
    }

    // Header spark timer
    let headerSparkInterval: ReturnType<typeof setInterval> | null = null;
    headerSparkInterval = setInterval(() => {
      spawnHeaderSparks();
    }, 2000 + Math.random() * 3000);

    // ---- Animation loop ----
    function animate() {
      const now = performance.now();
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Process grid surges
      processGridSurges(now);

      // Process card waves + spark on dips
      cardStatesRef.current.forEach((state, cardIdx) => {
        for (let i = 0; i < NUM_SEGS; i++)
          state.prevBrightness[i] = state.brightness[i];
        processWaves(state, now);
        sparkOnDips(cardIdx, state);
      });

      // Render sparks
      const sparks = sparksRef.current;
      let sc = sparkCountRef.current;
      let w = 0;
      for (let i = 0; i < sc; i++) {
        const s = sparks[i];
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > s.trailLen) s.trail.shift();
        s.x += s.vx;
        s.y += s.vy;
        s.vy += s.gravity;
        s.vx *= 0.985;
        s.life -= s.decay;
        if (s.life <= 0) {
          s.trail.length = 0;
          releaseSpark(s);
          continue;
        }
        const a = s.life;
        const r = s.size * Math.max(s.life, 0.3);
        if (s.trail.length > 1) {
          ctx.strokeStyle = `rgb(${s.r},${s.g},${s.b})`;
          ctx.lineCap = "round";
          for (let t = 1; t < s.trail.length; t++) {
            ctx.globalAlpha = (t / s.trail.length) * a * 0.3;
            ctx.lineWidth = r * (t / s.trail.length) * 0.8;
            ctx.beginPath();
            ctx.moveTo(s.trail[t - 1].x, s.trail[t - 1].y);
            ctx.lineTo(s.trail[t].x, s.trail[t].y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = a * 0.12;
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (s.life > 0.3) {
          ctx.globalAlpha = a * 0.7;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        sparks[w++] = s;
      }
      sparks.length = w;
      sparkCountRef.current = w;

      // Render bolts
      const bolts = boltsRef.current;
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        b.life -= b.decay;
        if (b.life <= 0) {
          bolts.splice(i, 1);
          continue;
        }
        ctx.lineCap = "round";
        // Outer glow
        ctx.globalAlpha = b.life * 0.2;
        ctx.strokeStyle = `rgb(${b.r},${b.g},${b.b})`;
        ctx.lineWidth = b.life * 6;
        ctx.beginPath();
        for (const seg of b.segments) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();
        // Core
        ctx.globalAlpha = b.life;
        ctx.lineWidth = b.life * 2;
        ctx.beginPath();
        for (const seg of b.segments) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();
        // White core
        ctx.globalAlpha = b.life * 0.7;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = b.life * 0.8;
        ctx.beginPath();
        for (const seg of b.segments) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      // Clear all tracked timers
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current.length = 0;
      if (headerSparkInterval) clearInterval(headerSparkInterval);
    };
  }, [
    isLanding,
    addTimer,
    buildGrid,
    processGridSurges,
    processWaves,
    releaseSpark,
    scheduleWave,
    sparkOnDips,
    spawnHeaderSparks,
    triggerBigBang,
    triggerGridSurge,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  const contextValue: NeonGridContextValue = {
    registerCard,
    registerNode,
  };

  return (
    <NeonGridContext.Provider value={contextValue}>
      {!isLanding && (
        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 9998,
          }}
        />
      )}
      {children}
    </NeonGridContext.Provider>
  );
}
