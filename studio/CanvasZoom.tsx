import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";

/**
 * Canvas zoom for Puck 0.24.
 *
 * Puck keeps the canvas scale in its internal store (`zoomConfig.zoom`), not in
 * `ui.viewports`, and its own zoom buttons stop at the "fit" scale. 0.24 has no
 * public setter, so this finds the store by walking React's fiber tree up from
 * the canvas element and calls the store's own `setZoomConfig`. Puck then scales
 * `#puck-canvas-root` and resizes it, and drag-and-drop uses the same number.
 * If the store cannot be found the control does not render; nothing else breaks.
 */

/** Percent steps offered by the buttons and the wheel. */
export const ZOOM_STEPS = [25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200] as const;
const MIN = 0.25;
const MAX = 2;

interface ZoomConfig {
  autoZoom: number;
  rootHeight: number;
  zoom: number;
}
interface PuckStoreApi {
  getState: () => { zoomConfig: ZoomConfig; setZoomConfig: (z: ZoomConfig) => void };
  subscribe: (listener: () => void) => () => void;
}

function findStore(el: Element): PuckStoreApi | null {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
  if (!key) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fiber: any = (el as any)[key];
  while (fiber) {
    const v = fiber.memoizedProps?.value;
    if (v && typeof v.getState === "function" && typeof v.subscribe === "function") {
      const s = v.getState();
      if (s && typeof s.setZoomConfig === "function" && s.zoomConfig) return v as PuckStoreApi;
    }
    fiber = fiber.return;
  }
  return null;
}

export function nextStep(current: number, dir: 1 | -1): number {
  const pct = current * 100;
  if (dir > 0) return (ZOOM_STEPS.find((s) => s > pct + 0.5) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]) / 100;
  return ([...ZOOM_STEPS].reverse().find((s) => s < pct - 0.5) ?? ZOOM_STEPS[0]) / 100;
}

interface Env {
  store: PuckStoreApi;
  root: HTMLElement;
  inner: HTMLElement;
  canvas: HTMLElement;
  host: HTMLElement | null;
}

/** Marks Puck's own zoom buttons for hiding and returns the element that hosts ours. */
function ensureHost(toolbar: Element | null): HTMLElement | null {
  if (!toolbar) return null;
  let host = toolbar.querySelector<HTMLElement>(":scope > .studio-zoom-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "studio-zoom-host";
    toolbar.appendChild(host);
  }
  let after = false;
  for (const child of Array.from(toolbar.children)) {
    if (child === host) continue;
    if (String(child.className).includes("ViewportControls-divider")) after = true;
    if (after) child.setAttribute("data-studio-hidden", "");
  }
  return host;
}

export function CanvasZoom() {
  const [env, setEnv] = useState<Env | null>(null);
  const [cfg, setCfg] = useState<ZoomConfig | null>(null);
  const [pan, setPan] = useState(false);

  // Find the canvas, the store and the toolbar; Puck remounts them when the page changes.
  useEffect(() => {
    const tick = () => {
      const root = document.getElementById("puck-canvas-root");
      const inner = root?.parentElement;
      const canvas = inner?.parentElement;
      if (!root || !inner || !canvas) return;
      const store = findStore(root);
      if (!store) return;
      const host = ensureHost(canvas.querySelector('[class*="ViewportControls-actionsInner"]'));
      setEnv((cur) => (cur && cur.store === store && cur.root === root && cur.host === host ? cur : { store, root, inner, canvas, host }));
    };
    tick();
    const id = window.setInterval(tick, 300);
    return () => window.clearInterval(id);
  }, []);

  // Mirror the store's zoom; switch the canvas to scrolling when the scaled page is wider than the frame.
  useEffect(() => {
    if (!env) return;
    const { store, root, inner } = env;
    const sync = () => {
      const z = store.getState().zoomConfig;
      setCfg((cur) => (cur && cur.zoom === z.zoom && cur.autoZoom === z.autoZoom ? cur : z));
      const w = parseFloat(root.style.width);
      const wide = Number.isFinite(w) && w * z.zoom > inner.clientWidth + 1;
      inner.toggleAttribute("data-studio-pan", wide);
      if (!wide) inner.scrollLeft = 0;
      setPan((cur) => (cur === wide ? cur : wide));
    };
    sync();
    const unsub = store.subscribe(sync);
    window.addEventListener("resize", sync);
    const id = window.setInterval(sync, 400);
    return () => {
      unsub();
      window.removeEventListener("resize", sync);
      window.clearInterval(id);
      inner.removeAttribute("data-studio-pan");
    };
  }, [env]);

  const apply = useCallback(
    (zoom: number) => {
      if (!env) return;
      const s = env.store.getState();
      s.setZoomConfig({ ...s.zoomConfig, zoom: Math.min(MAX, Math.max(MIN, zoom)) });
    },
    [env],
  );
  const fit = useCallback(() => {
    if (!env) return;
    const s = env.store.getState();
    s.setZoomConfig({ ...s.zoomConfig, zoom: s.zoomConfig.autoZoom });
  }, [env]);
  const step = useCallback(
    (dir: 1 | -1) => {
      if (!env) return;
      apply(nextStep(env.store.getState().zoomConfig.zoom, dir));
    },
    [env, apply],
  );

  // Ctrl/Cmd + wheel, Ctrl/Cmd + 0 and + / - over the canvas, including inside the canvas iframe.
  const stepRef = useRef(step);
  const fitRef = useRef(fit);
  stepRef.current = step;
  fitRef.current = fit;
  useEffect(() => {
    if (!env) return;
    const { inner, canvas } = env;
    let hover = false;
    let acc = 0;
    let lastWheel = 0;
    const docs = new WeakSet<Document>();
    const cleanups: (() => void)[] = [];

    const onWheel = (e: WheelEvent, fromFrame: boolean) => {
      if (!fromFrame && !canvas.contains(e.target as Node)) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const now = performance.now();
        if (now - lastWheel > 300) acc = 0;
        lastWheel = now;
        acc += e.deltaY;
        if (Math.abs(acc) >= 40) {
          stepRef.current(acc < 0 ? 1 : -1);
          acc = 0;
        }
      } else if (inner.hasAttribute("data-studio-pan") && (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY))) {
        e.preventDefault();
        inner.scrollLeft += e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      }
    };
    const onKey = (e: KeyboardEvent, fromFrame: boolean) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || !(hover || fromFrame)) return;
      if (e.key === "0") {
        e.preventDefault();
        fitRef.current();
      } else if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        stepRef.current(1);
      } else if (e.key === "-") {
        e.preventDefault();
        stepRef.current(-1);
      }
    };
    const attach = (doc: Document, fromFrame: boolean) => {
      if (docs.has(doc)) return;
      docs.add(doc);
      const w = (e: WheelEvent) => onWheel(e, fromFrame);
      const k = (e: KeyboardEvent) => onKey(e, fromFrame);
      const m = (e: MouseEvent) => {
        hover = fromFrame || canvas.contains(e.target as Node);
      };
      doc.addEventListener("wheel", w, { passive: false, capture: true });
      doc.addEventListener("keydown", k, true);
      doc.addEventListener("mousemove", m, true);
      cleanups.push(() => {
        doc.removeEventListener("wheel", w, true);
        doc.removeEventListener("keydown", k, true);
        doc.removeEventListener("mousemove", m, true);
      });
    };
    attach(document, false);
    // The canvas iframe is replaced when the page changes, so look again now and then.
    const scan = () => {
      const frame = canvas.querySelector("iframe");
      const doc = frame?.contentDocument;
      if (doc) attach(doc, true);
    };
    scan();
    const id = window.setInterval(scan, 300);
    return () => {
      window.clearInterval(id);
      cleanups.forEach((c) => c());
    };
  }, [env]);

  if (!env) return null;
  const zoom = cfg?.zoom ?? 1;
  const isFit = cfg ? Math.abs(cfg.zoom - cfg.autoZoom) < 0.0005 : true;
  const pct = Math.round(zoom * 100);
  return (
    <>
      {env.host
        ? createPortal(
            <div className="studio-zoom" data-testid="canvas-zoom" role="group" aria-label="Canvas zoom">
              <button type="button" className="studio-zoom-btn" title="Zoom canvas out (Ctrl + wheel)" aria-label="Zoom canvas out" data-testid="zoom-out" disabled={zoom <= MIN + 0.0005} onClick={() => step(-1)}>
                −
              </button>
              <output className="studio-zoom-readout" data-testid="zoom-readout" aria-live="polite">{pct}%</output>
              <button type="button" className="studio-zoom-btn" title="Zoom canvas in (Ctrl + wheel)" aria-label="Zoom canvas in" data-testid="zoom-in" disabled={zoom >= MAX - 0.0005} onClick={() => step(1)}>
                +
              </button>
              <button type="button" className={`studio-zoom-fit${isFit ? " is-on" : ""}`} title="Fit the page to the canvas (Ctrl + 0)" data-testid="zoom-fit" onClick={fit}>
                Fit
              </button>
            </div>,
            env.host,
          )
        : null}
      {pan ? createPortal(<HScroll inner={env.inner} />, env.canvas) : null}
    </>
  );
}

/** A thin horizontal scrollbar drawn by hand: a native one would shrink the frame and make Puck reset the zoom. */
function HScroll({ inner }: { inner: HTMLElement }) {
  const [m, setM] = useState({ left: 0, width: 1 });
  useEffect(() => {
    const update = () => {
      const total = inner.scrollWidth;
      const view = inner.clientWidth;
      setM({ left: total ? inner.scrollLeft / total : 0, width: total ? Math.min(1, view / total) : 1 });
    };
    update();
    inner.addEventListener("scroll", update);
    const id = window.setInterval(update, 300);
    return () => {
      inner.removeEventListener("scroll", update);
      window.clearInterval(id);
    };
  }, [inner]);
  const track = useRef<HTMLDivElement>(null);
  const onDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startLeft = inner.scrollLeft;
    const ratio = inner.scrollWidth / (track.current?.clientWidth || 1);
    const move = (ev: PointerEvent) => {
      inner.scrollLeft = startLeft + (ev.clientX - startX) * ratio;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div className="studio-hscroll" ref={track} data-testid="canvas-hscroll">
      <div className="studio-hscroll-thumb" onPointerDown={onDown} style={{ left: `${m.left * 100}%`, width: `${m.width * 100}%` }} />
    </div>
  );
}
