/**
 * The RemotionPlayer block: one Remotion composition from the remotion-lab
 * checkout, playable and scrubbable inside a studio page.
 *
 * Editor-only block. Unlike every other block there is no component in
 * src/components/blocks, so the site's MDX routes do not know the tag: the
 * block appears in the editor and round-trips through MDX, but a page that
 * carries it must not be published until a site component exists. See
 * "Remotion player block" in studio/README.md.
 *
 * The player, remotion and the scenes are behind React.lazy, so opening the
 * editor costs nothing until a block of this type is on the page.
 */
import { registerOverlayPortal } from "@puckeditor/core";
import { lazy, Suspense, useEffect, useRef } from "react";
import { DEFAULT_REMOTION_COMPOSITION_ID } from "./remotionCompositions";

const RemotionStage = lazy(() => import("./remotionStage"));

export interface RemotionPlayerProps {
  /** A <Composition id> listed in studio/remotionCompositions.ts. */
  composition: string;
  /** Widest the player gets, in px. It still shrinks to fit the column. */
  width: number;
  loop: boolean;
  autoPlay: boolean;
  controls: boolean;
}

export function RemotionPlayer({ composition, width, loop, autoPlay, controls }: RemotionPlayerProps) {
  const frame = useRef<HTMLDivElement>(null);

  /**
   * Two things stand between Puck's canvas and a usable player.
   *
   * 1. Puck sets `pointer-events: none` on everything inside a block
   *    ([data-puck-component] * in its stylesheet), so the play button and the
   *    scrub bar cannot be clicked at all. registerOverlayPortal is Puck's own
   *    opt-out: it sets data-puck-overlay-portal, which turns pointer events
   *    back on for this subtree.
   * 2. Both of its guards against dragging the block while you use the
   *    content (disableDrag, disableDragOnFocus) work by stopping pointerdown
   *    before it reaches the content. React delivers pointer events from one
   *    listener at the tree root, so stopping the press anywhere below that
   *    root also takes it away from Remotion's scrub bar. Measured with each
   *    of them on: the play button still worked (that is a click), seeking did
   *    nothing. Both are therefore off, and the press reaches the player.
   */
  useEffect(() => registerOverlayPortal(frame.current, { disableDrag: false, disableDragOnFocus: false }), []);

  return (
    <div className="not-prose my-8 mx-auto" style={{ maxWidth: width || undefined }}>
      <div
        ref={frame}
        className="rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]"
        style={{ background: "#0d0b0a" }}
      >
        <Suspense fallback={<div className="p-4 font-mono text-xs text-gray-500">loading remotion…</div>}>
          <RemotionStage
            compositionId={composition || DEFAULT_REMOTION_COMPOSITION_ID}
            controls={controls !== false}
            loop={Boolean(loop)}
            autoPlay={Boolean(autoPlay)}
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Blocks that live in the editor only, keyed by the name used in schema.ts and
 * in MDX. studio/blocks.tsx falls back to this map when a schema entry has no
 * component in src/components/blocks/index.ts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const studioOnlyComponents: Record<string, React.ComponentType<any>> = {
  RemotionPlayer,
};
