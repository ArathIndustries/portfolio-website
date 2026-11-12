import { cx, spaceBottomClass, type BlockLayoutProps } from "./layout";

export interface ToolCard {
  title: string;
  status?: string;
  description: string;
  /** Comma-separated tag names. */
  tags: string;
  github: string;
  live: string;
}

export interface ToolCardsProps extends BlockLayoutProps {
  items: ToolCard[];
  /** Button wording, shared by every card. Unset falls back to Code and Visit. */
  codeLabel?: string;
  visitLabel?: string;
}

const tagStyle = { background: "rgba(255,136,0,0.08)", color: "rgba(255,136,0,0.7)" };

/** Stack of bordered tool cards: title, optional status badge, description, tag chips, Code and Visit buttons. */
export function ToolCards({ items, codeLabel = "Code", visitLabel = "Visit", hidden, space }: ToolCardsProps) {
  if (hidden) return null;
  return (
    <div className={cx("space-y-6", spaceBottomClass(space))}>
      {(items || []).map((tool, i) => (
        <article
          key={i}
          className="p-6 rounded-lg border border-[rgba(255,136,0,0.12)] hover:border-[rgba(255,136,0,0.35)] bg-[rgba(255,136,0,0.02)] transition-colors"
        >
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="font-mono font-semibold text-xl text-gray-200">{tool.title}</h2>
            {tool.status ? (
              <span className="px-2 py-0.5 text-xs rounded font-mono" style={tagStyle}>
                {tool.status}
              </span>
            ) : null}
          </div>
          <p className="text-sm text-gray-400 mb-4">{tool.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2 flex-1">
              {(tool.tags || "")
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs rounded font-mono" style={tagStyle}>
                    {tag}
                  </span>
                ))}
            </div>

            <div className="flex gap-3">
              {tool.github ? (
                <a
                  href={tool.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-btn text-xs font-mono px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  {codeLabel}
                </a>
              ) : null}
              {tool.live ? (
                <a
                  href={tool.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-btn-filled text-xs font-mono px-4 py-2 inline-flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  {visitLabel}
                </a>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
