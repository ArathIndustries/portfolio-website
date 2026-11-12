/**
 * Per-block layout props shared by every block the studio can place on a page:
 * leave the block out of the page, change the space under it, change the
 * alignment inside it.
 *
 * Rule: an unset prop keeps the block's own look, byte for byte. Every helper
 * takes the block's existing class string as the fallback and only replaces it
 * when the page actually sets a value, so a page that never touched these
 * fields renders exactly as before and its MDX gains no attributes.
 *
 * The class names are written out in full below because Tailwind reads the
 * source text to decide what CSS to generate; a name built by string
 * concatenation would never reach the stylesheet.
 */

/** Space step. "" means "leave the block's own spacing alone". */
export type BlockSpace = "" | "none" | "tight" | "normal" | "loose";
/** Alignment. "" means "leave the block's own alignment alone". */
export type BlockAlign = "" | "left" | "center" | "right";

export interface BlockLayoutProps {
  /** True leaves the block out of the rendered page (the studio still shows it, dimmed). */
  hidden?: boolean;
  /** Space under the block. */
  space?: BlockSpace;
  /** Alignment of the block's own text and button rows. */
  align?: BlockAlign;
}

const SPACE_BOTTOM: Record<string, string> = {
  none: "mb-0",
  tight: "mb-6",
  normal: "mb-12",
  loose: "mb-24",
};

const SPACE_TOP: Record<string, string> = {
  none: "mt-0",
  tight: "mt-6",
  normal: "mt-12",
  loose: "mt-24",
};

const SPACE_BOTH: Record<string, string> = {
  none: "my-0",
  tight: "my-6",
  normal: "my-12",
  loose: "my-24",
};

const TEXT_ALIGN: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/** Flex rows (button rows, bullet rows) move with justify-*, not text-align. */
const ROW_ALIGN: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

/** Join class names, dropping the empty ones. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Space under the block, or `fallback` when the page did not set one. */
export function spaceBottomClass(space: BlockSpace | undefined, fallback = ""): string {
  return (space && SPACE_BOTTOM[space]) || fallback;
}

/** Space above the block, or `fallback` when the page did not set one. */
export function spaceTopClass(space: BlockSpace | undefined, fallback = ""): string {
  return (space && SPACE_TOP[space]) || fallback;
}

/** Space above and below the block, or `fallback` when the page did not set one. */
export function spaceBothClass(space: BlockSpace | undefined, fallback = ""): string {
  return (space && SPACE_BOTH[space]) || fallback;
}

/** Text alignment inside the block, or `fallback` when the page did not set one. */
export function textAlignClass(align: BlockAlign | undefined, fallback = ""): string {
  return (align && TEXT_ALIGN[align]) || fallback;
}

/** Flex-row alignment inside the block, or `fallback` when the page did not set one. */
export function rowAlignClass(align: BlockAlign | undefined, fallback = ""): string {
  return (align && ROW_ALIGN[align]) || fallback;
}
