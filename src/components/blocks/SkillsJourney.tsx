import { SkillsTimeline } from "../SkillsTimeline";

export interface SkillsJourneyProps {
  title: string;
  subtitle: string;
}

/** Heading and subtitle over the interactive skills timeline (src/components/SkillsTimeline.tsx; the eras stay in code). */
export function SkillsJourney({ title, subtitle }: SkillsJourneyProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold font-mono mb-2 text-gray-200">{title}</h2>
      <p className="text-sm text-gray-600 mb-8 font-mono">{subtitle}</p>
      <SkillsTimeline />
    </section>
  );
}
