export interface PageHeaderProps {
  title: string;
  intro: string;
}

/** Flickering page title with a grey introduction under it. */
export function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <header className="mb-12">
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">{title}</h1>
      <p className="text-gray-400">{intro}</p>
    </header>
  );
}
