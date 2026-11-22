"use client";

/**
 * The RemotionPlayer block on the site: one Remotion composition, vendored from
 * the remotion-lab checkout into src/remotion/mathviz/, played and scrubbed
 * inside the page.
 *
 * The player, remotion and the scenes are behind next/dynamic with ssr: false,
 * so a page that does not carry this block never fetches them, and the server
 * never tries to render a <Player> (it needs the DOM and a requestAnimationFrame
 * loop). The studio has its own copy of this block in
 * studio/RemotionPlayerBlock.tsx, because Puck's canvas needs an overlay portal
 * and the editor runs under Vite, which has no next/dynamic. Both render the
 * same RemotionStage from the same composition map.
 *
 * Prop names match the schema entry in studio/schema.ts: composition, width,
 * controls, loop, autoPlay.
 */
import dynamic from "next/dynamic";
import { DEFAULT_REMOTION_COMPOSITION_ID, remotionCompositionMeta } from "./remotionCompositions";

const RemotionStage = dynamic(() => import("./RemotionStage"), {
  ssr: false,
  loading: () => <div className="p-4 font-mono text-xs text-gray-500">loading remotion…</div>,
});

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
  const compositionId = composition || DEFAULT_REMOTION_COMPOSITION_ID;
  const meta = remotionCompositionMeta(compositionId);

  return (
    <div className="not-prose my-8 mx-auto" style={{ maxWidth: width || undefined }}>
      {/*
        The frame holds the composition's aspect ratio from the first paint, so
        the page does not jump when the remotion chunk arrives: the <Player>
        inside takes width 100 % and derives exactly this height from
        compositionWidth / compositionHeight. Its controls are an overlay, not
        an extra row, so they add nothing to the box.
      */}
      <div
        className="rounded-lg overflow-hidden border border-[rgba(255,136,0,0.15)]"
        style={{ background: "#0d0b0a", aspectRatio: `${meta.width} / ${meta.height}` }}
      >
        <RemotionStage
          compositionId={compositionId}
          controls={controls !== false}
          loop={Boolean(loop)}
          autoPlay={Boolean(autoPlay)}
        />
      </div>
    </div>
  );
}
