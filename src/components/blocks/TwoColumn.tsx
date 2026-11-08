import { Markdown } from "./Markdown";

export interface TwoColumnProps {
  left: string;
  right: string;
  ratio: "1:1" | "2:1" | "1:2";
}

const RATIOS: Record<TwoColumnProps["ratio"], string> = {
  "1:1": "1fr 1fr",
  "2:1": "2fr 1fr",
  "1:2": "1fr 2fr",
};

/** Two Markdown columns; stacks to one column on phones. */
export function TwoColumn({ left, right, ratio }: TwoColumnProps) {
  return (
    <div className="not-prose my-8 grid gap-8 two-column" style={{ ["--cols" as string]: RATIOS[ratio] || RATIOS["1:1"] }}>
      <style>{`.two-column{grid-template-columns:1fr}@media(min-width:768px){.two-column{grid-template-columns:var(--cols)}}`}</style>
      <Markdown text={left} />
      <Markdown text={right} />
    </div>
  );
}
