export interface DividerProps {
  label?: string;
}

/** Neon hairline, optional centered label. */
export function Divider({ label }: DividerProps) {
  return (
    <div className="not-prose my-12 flex items-center gap-4">
      <div className="neon-divider flex-1" />
      {label ? <span className="font-mono text-xs tracking-widest text-gray-500 uppercase">{label}</span> : null}
      {label ? <div className="neon-divider flex-1" /> : null}
    </div>
  );
}
