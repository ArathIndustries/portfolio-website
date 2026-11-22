/**
 * The editor's copy of the RemotionPlayer block: one Remotion composition,
 * vendored from the remotion-lab checkout into src/remotion/mathviz/, playable
 * and scrubbable inside a studio page.
 *
 * The site has its own copy (src/components/blocks/RemotionPlayer.tsx). Both
 * render the same RemotionStage from the same composition map; this one exists
 * because two things about it are Puck-only — the overlay portal below, and the
 * fact that a click on a block in the canvas means "select this block", so the
 * frame must not toggle playback. The site copy also loads the stage with
 * next/dynamic, which does not exist under Vite.
 *
 * studio/blocks.tsx prefers this component over the site's for the same block
 * name; see studioComponentOverrides at the bottom.
 *
 * The player, remotion and the scenes are behind React.lazy, so opening the
 * editor costs nothing until a block of this type is on the page.
 */
import { registerOverlayPortal } from "@puckeditor/core";
import { lazy, Suspense, useEffect, useRef } from "react";
import {
  DEFAULT_REMOTION_COMPOSITION_ID,
  remotionCompositionMeta,
} from "../src/components/blocks/remotionCompositions";

const RemotionStage = lazy(() => import("../src/components/blocks/RemotionStage"));

export interface RemotionPlayerProps {
  /** A <Composition id> listed in src/components/blocks/remotionCompositions.ts. */
  composition: string;
  /** Widest the player gets, in px. It still shrinks to fit the column. */
  width: number;
  loop: boolean;
  autoPlay: boolean;
  controls: boolean;
}

export function RemotionPlayer({ composition, width, loop, autoPlay, controls }: RemotionPlayerProps) {
  const frame = useRef<HTMLDivElement>(null);
  const compositionId = composition || DEFAULT_REMOTION_COMPOSITION_ID;
  const meta = remotionCompositionMeta(compositionId);

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
        style={{ background: "#0d0b0a", aspectRatio: `${meta.width} / ${meta.height}` }}
      >
        <Suspense fallback={<div className="p-4 font-mono text-xs text-gray-500">loading remotion…</div>}>
          <RemotionStage
            compositionId={compositionId}
            controls={controls !== false}
            loop={Boolean(loop)}
            autoPlay={Boolean(autoPlay)}
            clickToPlay={false}
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Blocks the editor renders with its own component instead of the site's,
 * keyed by the name used in schema.ts and in MDX. studio/blocks.tsx reads this
 * map first and falls back to src/components/blocks/index.ts; a name here with
 * no schema entry throws at startup.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const studioComponentOverrides: Record<string, React.ComponentType<any>> = {
  RemotionPlayer,
};
