import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";

/**
 * Priority-plus overflow for a one-row toolbar. A port of the hub's
 * frontend/src/composables/usePriorityOverflow.js with the same contract: the
 * toolbar watches its own box with a ResizeObserver, measures each rendered
 * item once (cached by id, size and whether labels are shown), then shows the
 * highest-priority items that fit and hands the rest to a trailing "more"
 * button. Pinned items never overflow. Under `labelsBelow` pixels the items
 * drop their labels and keep their icons.
 */
export const ITEM_GAP = 4;
export const MORE_ID = "__more";

export interface PriorityItem {
  /** Unique string. */
  id: string;
  /** The text, also the aria-label when only the icon shows. */
  label: string;
  /** Icon name (studio/components/icons.tsx); an item without one keeps its label at every width. */
  icon?: string;
  /** Higher stays visible longer (default 0). */
  priority?: number;
  /** Never overflows. */
  pinned?: boolean;
  action?: () => void;
  /** true/false renders aria-pressed. */
  pressed?: boolean;
  /** Boolean, or a string with the reason (shown in the menu). */
  disabled?: boolean | string;
  title?: string;
  /** data-testid of the button; default `ptb-<id>`. */
  testid?: string;
  /** Opens a new tab with this address instead of running `action` (rendered as a link). */
  href?: string;
  /** Colour note on the control: "late" for something waiting on the person. */
  tone?: "late" | "ok";
}

export type ToolbarSize = "m" | "s";

interface Options {
  root: RefObject<HTMLElement | null>;
  items: PriorityItem[];
  size: ToolbarSize;
  labelsBelow: number;
}

export function usePriorityOverflow({ root, items, size, labelsBelow }: Options) {
  /** Width of the toolbar's own box. */
  const [width, setWidth] = useState(0);
  /** `${id}|${size}|${labels}` -> measured width in px. Items are measured once per key. */
  const cache = useRef(new Map<string, number>());
  /** Bumps when the cache changes so the memos below reread it. */
  const [stamp, setStamp] = useState(0);
  /** True while every item is rendered (hidden) so it can be measured. */
  const [measuring, setMeasuring] = useState(false);

  const compact = width > 0 && width < labelsBelow;
  const keyOf = useCallback((id: string) => `${id}|${size}|${compact ? "c" : "l"}`, [size, compact]);
  const widthOf = useCallback(
    (id: string) => {
      void stamp;
      return cache.current.get(keyOf(id));
    },
    [keyOf, stamp],
  );

  const missing = useMemo(
    () => items.some((item) => widthOf(item.id) === undefined) || widthOf(MORE_ID) === undefined,
    [items, widthOf],
  );

  // Measure before paint, while every item is in the row.
  useLayoutEffect(() => {
    if (!measuring) return;
    const el = root.current;
    if (el) {
      for (const node of Array.from(el.querySelectorAll<HTMLElement>("[data-pt-id]"))) {
        const rect = node.getBoundingClientRect();
        cache.current.set(keyOf(node.dataset.ptId ?? ""), rect.width || 0);
      }
    }
    setStamp((s) => s + 1);
    setMeasuring(false);
  }, [measuring, keyOf, root]);

  // New ids, a new size or a label flip need widths the cache does not have yet.
  useEffect(() => {
    if (missing && !measuring) setMeasuring(true);
  }, [missing, measuring]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const read = (entry?: ResizeObserverEntry) => {
      const fromEntry = entry?.contentRect?.width ?? entry?.borderBoxSize?.[0]?.inlineSize;
      setWidth(fromEntry || el.getBoundingClientRect().width || 0);
    };
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver((entries) => read(entries[0]));
      observer.observe(el);
    }
    read();
    return () => observer?.disconnect();
  }, [root]);

  const layout = useMemo(() => {
    const list = items;
    if (measuring || !width) return { visible: list, overflow: [] as PriorityItem[] };
    const w = (id: string) => widthOf(id) || 0;
    const span = (ids: string[]) => ids.reduce((sum, id, i) => sum + w(id) + (i ? ITEM_GAP : 0), 0);
    if (span(list.map((item) => item.id)) <= width) return { visible: list, overflow: [] as PriorityItem[] };

    const pinned = list.filter((item) => item.pinned);
    const rest = list.filter((item) => !item.pinned).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    const chosen = new Set(pinned.map((item) => item.id));
    // The "more" button is in the row from here on; every item after the first adds a gap.
    let used = span(pinned.map((item) => item.id)) + (pinned.length ? ITEM_GAP : 0) + w(MORE_ID);
    for (const item of rest) {
      const need = w(item.id) + ITEM_GAP;
      // Stop at the first that does not fit: a lower priority never shows while a higher one is hidden.
      if (used + need > width) break;
      chosen.add(item.id);
      used += need;
    }
    return {
      visible: list.filter((item) => chosen.has(item.id)),
      overflow: rest.filter((item) => !chosen.has(item.id)),
    };
  }, [items, measuring, width, widthOf]);

  const remeasure = useCallback(() => setMeasuring(true), []);

  return { width, compact, measuring, visible: layout.visible, overflow: layout.overflow, remeasure };
}
