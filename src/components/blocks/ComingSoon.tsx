import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface ComingSoonProps extends BlockLayoutProps {
  title: string;
  intro: string;
  note: string;
}

/** Centered placeholder for a section that has not launched: title, glowing intro, small status note. */
export function ComingSoon({ title, intro, note, hidden, space, align }: ComingSoonProps) {
  if (hidden) return null;
  return (
    <div className={cx(textAlignClass(align, "text-center"), spaceBottomClass(space))}>
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">{title}</h1>
      <p className="white-neon max-w-xl mx-auto mb-3">{intro}</p>
      <p className="text-gray-600 font-mono text-sm">{note}</p>
    </div>
  );
}
