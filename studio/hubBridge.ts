/**
 * The studio's side of the hub <-> studio message set (hub B319), over postMessage.
 *
 * The hub frames the studio with `?hubOrigin=<the hub's origin>`. Without it, or
 * when the studio is the top window, nothing is posted and inbound `hub-*` messages
 * are ignored. Inbound messages count only from that origin and from the parent
 * window; outbound messages go to the parent with that origin as the target, never
 * "*". The message table is in README.md, "Hub messages".
 */
export const HUB_PANES = ["blocks", "outline", "pages", "fields"] as const;
export type HubPane = (typeof HUB_PANES)[number];

export type HubToStudio =
  | { type: "hub-theme"; theme?: unknown }
  | { type: "hub-open-page"; path?: unknown }
  | { type: "hub-show-pane"; pane?: unknown };

export interface StudioPageState {
  path: string;
  title: string;
}

export type StudioToHub =
  | { type: "studio-ready" }
  | { type: "studio-state"; page: StudioPageState | null; dirty: boolean; saving: boolean };

/** The hub's origin from the frame URL, or null when absent or not an http(s) address. */
export function readHubOrigin(search: string): string | null {
  const raw = new URLSearchParams(search).get("hubOrigin");
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

export const HUB_ORIGIN: string | null = typeof location === "undefined" ? null : readHubOrigin(location.search);

function framedByHub(): boolean {
  return Boolean(HUB_ORIGIN) && typeof window !== "undefined" && window.parent !== window;
}

export function isFromHub(event: MessageEvent): boolean {
  return framedByHub() && event.origin === HUB_ORIGIN && event.source === window.parent;
}

/** Posts to the hub frame's parent; false when the studio is not framed by the hub. */
export function postToHub(message: StudioToHub): boolean {
  if (!framedByHub() || !HUB_ORIGIN) return false;
  window.parent.postMessage(message, HUB_ORIGIN);
  return true;
}

/** Listens for `hub-*` messages from the hub; returns the function that stops listening. */
export function onHubMessage(handler: (message: HubToStudio) => void): () => void {
  const listener = (event: MessageEvent) => {
    if (!isFromHub(event)) return;
    const data = event.data as { type?: unknown } | null;
    if (!data || typeof data !== "object" || typeof data.type !== "string" || !data.type.startsWith("hub-")) return;
    handler(data as HubToStudio);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}

export function asHubPane(value: unknown): HubPane | null {
  return typeof value === "string" && (HUB_PANES as readonly string[]).includes(value) ? (value as HubPane) : null;
}

/** A content path as the Pages list carries it (`pages/about.mdx`): .mdx, relative, no `..`. */
export function asPagePath(value: unknown): string | null {
  if (typeof value !== "string" || !value.endsWith(".mdx")) return null;
  const parts = value.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) return null;
  if (value.includes("\\")) return null;
  return value;
}
