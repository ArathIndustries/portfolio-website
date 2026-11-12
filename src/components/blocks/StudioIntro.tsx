import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface StudioIntroProps extends BlockLayoutProps {
  title: string;
  lead: string;
  quote: string;
}

/** About-page opener: flickering title, lead sentence, and a bordered statement. */
export function StudioIntro({ title, lead, quote, hidden, space, align }: StudioIntroProps) {
  if (hidden) return null;
  return (
    <section className={cx(spaceBottomClass(space, "mb-16"), textAlignClass(align))}>
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-6 neon-text neon-flicker">{title}</h1>
      <p className="text-lg text-gray-300 leading-relaxed mb-4">{lead}</p>
      <blockquote
        className="font-mono text-sm leading-relaxed my-8 pl-4"
        style={{ borderLeft: "2px solid rgba(255,136,0,0.4)", color: "rgba(255,255,255,0.7)" }}
      >
        {quote}
      </blockquote>
    </section>
  );
}
