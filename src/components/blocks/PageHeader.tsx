import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface PageHeaderProps extends BlockLayoutProps {
  title: string;
  intro: string;
}

/** Flickering page title with a grey introduction under it. */
export function PageHeader({ title, intro, hidden, space, align }: PageHeaderProps) {
  if (hidden) return null;
  return (
    <header className={cx(spaceBottomClass(space, "mb-12"), textAlignClass(align))}>
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">{title}</h1>
      <p className="text-gray-400">{intro}</p>
    </header>
  );
}
