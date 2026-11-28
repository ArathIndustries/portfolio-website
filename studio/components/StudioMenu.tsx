import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StudioIcon } from "./icons";

export interface MenuEntry {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  href?: string;
  disabled?: boolean | string;
  /** Short text at the right of the label, e.g. "on". */
  note?: string;
}

/**
 * The studio's one menu: a fixed-position list under an anchor, closed by
 * Escape, a click outside, or choosing an entry. Arrow keys move between
 * entries. Stands in for the hub's useContextMenu for the toolbar overflow.
 */
export function StudioMenu({ anchor, title, entries, onClose }: { anchor: HTMLElement | null; title?: string; entries: MenuEntry[]; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor?.getBoundingClientRect();
      const w = box.current?.offsetWidth ?? 220;
      const h = box.current?.offsetHeight ?? 0;
      if (!r) return setPos({ top: 8, left: 8 });
      let left = Math.min(r.right - w, window.innerWidth - w - 8);
      left = Math.max(8, left);
      let top = r.bottom + 4;
      if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 4);
      setPos({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchor, entries.length]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        anchor?.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const focusables = Array.from(box.current?.querySelectorAll<HTMLElement>("[role=menuitem]:not([aria-disabled=true])") ?? []);
      if (!focusables.length) return;
      e.preventDefault();
      const i = focusables.indexOf(document.activeElement as HTMLElement);
      const next = e.key === "ArrowDown" ? (i + 1) % focusables.length : (i - 1 + focusables.length) % focusables.length;
      focusables[next].focus();
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    const first = box.current?.querySelector<HTMLElement>("[role=menuitem]:not([aria-disabled=true])");
    first?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div ref={box} className="studio-menu" role="menu" aria-label={title} data-testid="studio-menu" style={pos ? { top: pos.top, left: pos.left } : { visibility: "hidden" }}>
      {title ? <div className="studio-menu-title">{title}</div> : null}
      {entries.map((e) => {
        const disabled = Boolean(e.disabled);
        const inner = (
          <>
            <span className="studio-menu-icon">{e.icon ? <StudioIcon name={e.icon} /> : null}</span>
            <span className="studio-menu-label">{e.label}</span>
            {typeof e.disabled === "string" ? <small>{e.disabled}</small> : e.note ? <small>{e.note}</small> : null}
          </>
        );
        if (e.href && !disabled) {
          return (
            <a key={e.id} className="studio-menu-item" role="menuitem" href={e.href} target="_blank" rel="noreferrer" data-testid={`menu-${e.id}`} onClick={onClose}>
              {inner}
            </a>
          );
        }
        return (
          <button
            key={e.id}
            type="button"
            className="studio-menu-item"
            role="menuitem"
            aria-disabled={disabled || undefined}
            disabled={disabled}
            data-testid={`menu-${e.id}`}
            onClick={() => {
              if (disabled) return;
              onClose();
              e.action?.();
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
