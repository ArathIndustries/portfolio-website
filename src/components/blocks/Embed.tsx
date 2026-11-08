export interface EmbedProps {
  url: string;
  height: number;
  title?: string;
}

/** Hosts an iframe may point at. Anything else renders a refusal, not a frame. */
export const EMBED_ALLOWLIST = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "codepen.io",
  "observablehq.com",
  "www.openstreetmap.org",
  "arathindustries.com",
  "www.arathindustries.com",
  "127.0.0.1",
  "localhost",
];

export function embedAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    return (u.protocol === "https:" || u.protocol === "http:") && EMBED_ALLOWLIST.includes(u.hostname);
  } catch {
    return false;
  }
}

/** Iframe embed restricted to an allowlist of hosts. */
export function Embed({ url, height, title }: EmbedProps) {
  if (!embedAllowed(url)) {
    return (
      <div className="not-prose my-6 p-4 rounded-md border border-red-900 font-mono text-xs text-red-400">
        Embed refused: host not in allowlist ({EMBED_ALLOWLIST.join(", ")}). URL: {url || "(empty)"}
      </div>
    );
  }
  return (
    <div className="not-prose my-8 rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]">
      <iframe
        src={url}
        title={title || "embed"}
        style={{ width: "100%", height, border: 0, display: "block", background: "#0d0b0a" }}
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
