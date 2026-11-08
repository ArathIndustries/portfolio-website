export interface StatItem {
  value: string;
  label: string;
}

export interface StatsProps {
  items: StatItem[];
}

/** Row of big numbers with labels. */
export function Stats({ items }: StatsProps) {
  return (
    <div className="not-prose my-10 grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}>
      {(items || []).map((it, i) => (
        <div key={i} className="neon-card p-5 text-center">
          <div className="font-mono text-3xl font-bold neon-text">{it.value}</div>
          <div className="mt-1 text-xs tracking-wider uppercase text-gray-500 font-mono">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
