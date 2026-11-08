export interface PageTitleProps {
  title: string;
}

/** Page title with the neon glow and extra space below it (no flicker). */
export function PageTitle({ title }: PageTitleProps) {
  return <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-8 neon-text">{title}</h1>;
}
