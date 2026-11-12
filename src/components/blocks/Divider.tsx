import { cx, spaceBothClass, type BlockLayoutProps } from "./layout";

export interface DividerProps extends BlockLayoutProps {
  label?: string;
}

/** Neon hairline, optional centered label. */
export function Divider({ label, hidden, space }: DividerProps) {
  if (hidden) return null;
  return (
    <div className={cx("not-prose", spaceBothClass(space, "my-12"), "flex items-center gap-4")}>
      <div className="neon-divider flex-1" />
      {label ? <span className="font-mono text-xs tracking-widest text-gray-500 uppercase">{label}</span> : null}
      {label ? <div className="neon-divider flex-1" /> : null}
    </div>
  );
}
