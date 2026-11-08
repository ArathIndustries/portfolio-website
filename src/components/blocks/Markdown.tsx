import ReactMarkdown from "react-markdown";

export interface MarkdownProps {
  text: string;
}

/**
 * Prose block. On disk a run of Markdown between JSX components becomes one
 * of these; the site renders that prose through MDX directly, the studio
 * canvas renders it with react-markdown so it looks the same while editing.
 */
export function Markdown({ text }: MarkdownProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{typeof text === "string" ? text : ""}</ReactMarkdown>
    </div>
  );
}
