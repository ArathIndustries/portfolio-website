import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface LeadProseProps extends BlockLayoutProps {
  text: string;
}

/** Story text: paragraphs separated by a blank line, the first one larger. */
export function LeadProse({ text, hidden, space, align }: LeadProseProps) {
  if (hidden) return null;
  const paragraphs = (typeof text === "string" ? text : "").split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <section className={cx(spaceBottomClass(space, "mb-12"), textAlignClass(align))}>
      <div className="space-y-5 text-gray-400 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i} className={i === 0 ? "text-lg" : undefined}>
            {p.trim()}
          </p>
        ))}
      </div>
    </section>
  );
}
