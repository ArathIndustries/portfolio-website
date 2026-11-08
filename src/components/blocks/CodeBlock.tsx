export interface CodeBlockProps {
  language: string;
  code: string;
  filename?: string;
}

/** Monospace code block. No highlighter in the spike; the language is shown as a tag. */
export function CodeBlock({ language, code, filename }: CodeBlockProps) {
  return (
    <div className="not-prose my-6 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)]" style={{ background: "#0d0b0a" }}>
      <div className="flex justify-between px-4 py-2 text-xs font-mono text-gray-500 border-b border-[rgba(255,255,255,0.06)]">
        <span>{filename || ""}</span>
        <span className="text-[var(--neon)]">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-[#d0d0d0]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
