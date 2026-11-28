import { useRef, useState } from "react";
import { StudioIcon } from "./icons";
import { StudioMenu } from "./StudioMenu";
import { MORE_ID, usePriorityOverflow, type PriorityItem, type ToolbarSize } from "./usePriorityOverflow";

export type { PriorityItem } from "./usePriorityOverflow";

/**
 * PriorityToolbar: one row of actions that never wraps. A port of the hub's
 * frontend/src/components/common/PriorityToolbar.vue. The items that do not
 * fit move into a trailing "more" button, which opens StudioMenu with the
 * overflowed items. The row measures itself (ResizeObserver), so it works in a
 * frame the hub resizes, not only on a window resize.
 *
 * Props
 *   items        { id, label, icon, priority, pinned, action, pressed, disabled, title, testid, href, tone }.
 *   size         'm' (32 px controls, default) or 's' (24 px).
 *   labelsBelow  Toolbar width in px under which items drop their labels and keep the icon with a
 *                title. Default 620 (hub design/ui-standard.md section 3).
 *   label        aria-label of the toolbar. Default 'Actions'.
 *
 * Items render in the order given, whatever their priority. Only an item with an icon can lose
 * its label; a text-only item keeps it.
 */
export function PriorityToolbar({ items, size = "m", labelsBelow = 620, label = "Actions", className = "" }: { items: PriorityItem[]; size?: ToolbarSize; labelsBelow?: number; label?: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const moreEl = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { compact, measuring, visible, overflow } = usePriorityOverflow({ root, items, size, labelsBelow });
  const iconSize = size === "s" ? 12 : 14;
  const small = size === "s";

  const iconOnly = (item: PriorityItem) => compact && Boolean(item.icon);
  const classFor = (item: PriorityItem) =>
    [iconOnly(item) ? "studio-ib" : "studio-btn studio-ghost", small ? "studio-small" : "", item.pressed ? "is-on" : "", item.tone ? `studio-${item.tone}` : ""].filter(Boolean).join(" ");

  return (
    <div
      ref={root}
      className={`studio-ptb${measuring ? " studio-ptb-measuring" : ""}${compact ? " studio-ptb-compact" : ""}${small ? " studio-ptb-s" : ""}${className ? ` ${className}` : ""}`}
      role="toolbar"
      aria-label={label}
      data-testid="priority-toolbar"
    >
      {visible.map((item) => {
        const common = {
          className: classFor(item),
          "data-pt-id": item.id,
          "data-testid": item.testid || `ptb-${item.id}`,
          "aria-label": iconOnly(item) ? item.label : undefined,
          title: item.title || (iconOnly(item) ? item.label : undefined),
        };
        if (item.href && !item.disabled) {
          return (
            <a key={item.id} {...common} href={item.href} target="_blank" rel="noreferrer">
              {item.icon ? <StudioIcon name={item.icon} size={iconSize} /> : null}
              {!iconOnly(item) ? <span className="studio-ptb-label">{item.label}</span> : null}
            </a>
          );
        }
        return (
          <button
            key={item.id}
            type="button"
            {...common}
            aria-pressed={item.pressed === undefined ? undefined : item.pressed}
            disabled={item.disabled ? true : undefined}
            onClick={() => {
              if (item.disabled) return;
              item.action?.();
            }}
          >
            {item.icon ? <StudioIcon name={item.icon} size={iconSize} /> : null}
            {!iconOnly(item) ? <span className="studio-ptb-label">{item.label}</span> : null}
          </button>
        );
      })}
      {measuring || overflow.length ? (
        <button
          ref={moreEl}
          type="button"
          className={`studio-ib${small ? " studio-small" : ""}`}
          data-pt-id={MORE_ID}
          data-testid="ptb-more"
          aria-label="More actions"
          title="More actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <StudioIcon name="more" size={iconSize} />
        </button>
      ) : null}
      {menuOpen ? (
        <StudioMenu
          anchor={moreEl.current}
          title={label}
          onClose={() => setMenuOpen(false)}
          entries={overflow.map((item) => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
            action: item.action,
            href: item.href,
            disabled: item.disabled,
            note: item.pressed ? "on" : undefined,
          }))}
        />
      ) : null}
    </div>
  );
}
