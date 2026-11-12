import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface CardGridItem {
  title: string;
  description: string;
}

export interface CardGridProps extends BlockLayoutProps {
  heading: string;
  items: CardGridItem[];
}

/** Heading over a two-column grid of dark cards with an orange title and grey text. */
export function CardGrid({ heading, items, hidden, space, align }: CardGridProps) {
  if (hidden) return null;
  return (
    <section className={cx(spaceBottomClass(space, "mb-16"), textAlignClass(align))}>
      <h2 className="text-2xl font-bold font-mono mb-8 text-gray-200">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {(items || []).map((item, i) => (
          <div key={i} className="p-5 rounded-lg border border-gray-800" style={{ background: "rgba(13,11,10,0.6)" }}>
            <h3 className="font-mono font-semibold text-sm mb-2" style={{ color: "rgba(255,136,0,0.8)" }}>
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
