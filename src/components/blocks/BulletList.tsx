import { cx, rowAlignClass, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface BulletListItem {
  text: string;
}

export interface BulletListProps extends BlockLayoutProps {
  heading: string;
  items: BulletListItem[];
}

/** Heading over a list whose bullets are small neon dots. */
export function BulletList({ heading, items, hidden, space, align }: BulletListProps) {
  if (hidden) return null;
  return (
    <section className={cx(spaceBottomClass(space, "mb-12"), textAlignClass(align))}>
      <h2 className="text-xl font-mono font-semibold mb-4 text-gray-200">{heading}</h2>
      <ul className="space-y-2">
        {(items || []).map((item, i) => (
          <li key={i} className={cx("flex items-center gap-3 text-gray-400", rowAlignClass(align))}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] opacity-60 flex-shrink-0" />
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
