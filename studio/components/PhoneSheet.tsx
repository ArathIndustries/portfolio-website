import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { createUsePuck, useGetPuck } from "@puckeditor/core";
import { StudioIcon } from "./icons";

/** Puck's own phone breakpoint (its layout CSS switches at min-width 638px). */
export const PHONE_QUERY = "(max-width: 637px)";

const usePuckStore = createUsePuck();

const PANE_LABEL: Record<string, string> = { blocks: "Blocks", outline: "Outline", pages: "Pages", fields: "Fields" };

export function usePhone(): boolean {
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const on = () => setPhone(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

/**
 * On the phone Puck shows the pane picked in the bottom bar (Blocks, Outline,
 * Pages, Fields) in its left-sidebar slot. studio.css turns that slot into a
 * bottom sheet over the canvas; this component adds the sheet's chrome (a grip
 * to drag, the pane's name, a close button) at the top of it, keeps the
 * sheet's height in step with Puck's expanded flag, and opens the Fields
 * sheet when a block is selected on the canvas. Rendered inside Puck (from
 * the header override) so it can read and set Puck's UI state.
 */
export function PhoneSheet() {
  const phone = usePhone();
  const getPuck = useGetPuck();
  const open = usePuckStore((s) => s.appState.ui.leftSideBarVisible);
  const expanded = usePuckStore((s) => Boolean(s.appState.ui.mobilePanelExpanded));
  const current = usePuckStore((s) => (s.appState.ui as unknown as { plugin?: { current?: string } }).plugin?.current ?? "");
  const selectedKey = usePuckStore((s) => (s.appState.ui.itemSelector ? `${s.appState.ui.itemSelector.zone ?? ""}:${s.appState.ui.itemSelector.index}` : ""));
  const [host, setHost] = useState<HTMLElement | null>(null);

  const setUi = (ui: Record<string, unknown>) => getPuck().dispatch({ type: "setUi", ui } as never);

  // Find Puck's left sidebar (it is remounted with the page) and mark it as the sheet.
  useEffect(() => {
    if (!phone) {
      setHost(null);
      return;
    }
    const tick = () => {
      const el = document.querySelector<HTMLElement>('[class*="_Sidebar--left"]');
      setHost((cur) => (cur === el ? cur : el));
    };
    tick();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [phone]);

  // The chrome goes in a wrapper inserted as the sheet's first child (a portal appends).
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!host) {
      setSlot(null);
      return;
    }
    host.setAttribute("data-studio-sheet", "");
    const el = document.createElement("div");
    el.className = "studio-sheet-slot";
    host.prepend(el);
    setSlot(el);
    return () => {
      host.removeAttribute("data-studio-sheet");
      el.remove();
    };
  }, [host]);

  // The nav's height sets where the sheet stops, so the bar below stays tappable.
  useEffect(() => {
    if (!phone) return;
    const nav = document.querySelector<HTMLElement>('[class*="_PuckLayout-nav"]');
    const inner = nav?.parentElement;
    if (!nav || !inner) return;
    const set = () => inner.style.setProperty("--studio-nav-h", `${nav.getBoundingClientRect().height}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(nav);
    return () => {
      ro.disconnect();
      inner.style.removeProperty("--studio-nav-h");
    };
  }, [phone, host]);

  // A selection on the canvas opens the Fields sheet (the pane a tap on a block is for).
  const lastSelected = useRef(selectedKey);
  useEffect(() => {
    if (!phone) {
      lastSelected.current = selectedKey;
      return;
    }
    if (selectedKey && selectedKey !== lastSelected.current) {
      setUi({ plugin: { current: "fields" }, leftSideBarVisible: true });
    }
    lastSelected.current = selectedKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, phone]);

  // Grip: drag down closes, drag up expands, a tap toggles the height.
  const onGripDown = (e: ReactPointerEvent) => {
    const startY = e.clientY;
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      if (Math.abs(dy) > 8) moved = true;
      if (dy > 70) {
        done();
        setUi({ leftSideBarVisible: false, mobilePanelExpanded: false });
      } else if (dy < -70) {
        done();
        setUi({ mobilePanelExpanded: true });
      }
    };
    const up = () => {
      done();
      if (!moved) setUi({ mobilePanelExpanded: !expanded });
    };
    const done = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  if (!phone || !slot || !open) return null;
  const label = PANE_LABEL[current] ?? current;
  return createPortal(
    <div className="studio-sheet-h" data-testid="phone-sheet-head">
      <button type="button" className="studio-sheet-grip" aria-label={expanded ? "Make the sheet shorter (drag down to close)" : "Make the sheet taller (drag down to close)"} title="Drag" onPointerDown={onGripDown}>
        <span />
      </button>
      <span className="studio-sheet-title" data-testid="phone-sheet-title">{label}</span>
      <button type="button" className="studio-ib studio-touch" aria-label={`Close ${label}`} title="Close" data-testid="phone-sheet-close" onClick={() => setUi({ leftSideBarVisible: false, mobilePanelExpanded: false })}>
        <StudioIcon name="close" />
      </button>
    </div>,
    slot,
  );
}
