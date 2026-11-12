import { cx, spaceBottomClass, textAlignClass, type BlockLayoutProps } from "./layout";

export interface PageTitleProps extends BlockLayoutProps {
  title: string;
}

/** Page title with the neon glow and extra space below it (no flicker). */
export function PageTitle({ title, hidden, space, align }: PageTitleProps) {
  if (hidden) return null;
  return (
    <h1 className={cx("text-3xl sm:text-4xl font-bold font-mono", spaceBottomClass(space, "mb-8"), "neon-text", textAlignClass(align))}>{title}</h1>
  );
}
