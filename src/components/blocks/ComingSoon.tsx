export interface ComingSoonProps {
  title: string;
  intro: string;
  note: string;
}

/** Centered placeholder for a section that has not launched: title, glowing intro, small status note. */
export function ComingSoon({ title, intro, note }: ComingSoonProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">{title}</h1>
      <p className="white-neon max-w-xl mx-auto mb-3">{intro}</p>
      <p className="text-gray-600 font-mono text-sm">{note}</p>
    </div>
  );
}
