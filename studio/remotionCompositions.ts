/**
 * The compositions the RemotionPlayer block can play.
 *
 * Data only, and deliberately import-free: studio/schema.ts reads this file to
 * build the block's dropdown, and schema.ts is loaded under plain Node by the
 * MDX converters (studio/vite.config.ts, studio/convert/roundtrip.ts). An
 * import of React, remotion, or anything from the remotion-lab checkout here
 * would break them.
 *
 * The numbers mirror the <Composition> entries in remotion-lab/src/Root.tsx.
 * studio/remotionStage.tsx holds the matching scene component and its input
 * props, and re-derives these numbers from the scene's own data file at load
 * time, so a drift throws instead of playing a video of the wrong length.
 */

export interface RemotionCompositionMeta {
  /** The <Composition id> in remotion-lab/src/Root.tsx. */
  id: string;
  /** What the block's dropdown shows. */
  label: string;
  durationInFrames: number;
  fps: number;
  /** Composition pixel size; the player scales it to the column width. */
  width: number;
  height: number;
}

export const REMOTION_COMPOSITIONS: readonly RemotionCompositionMeta[] = [
  {
    id: "MathViz-Remotion",
    label: "MathViz: matrix transformation (MatrixScene)",
    // Root.tsx computes this in calculateMetadata as
    // ceil(total_seconds * timing.fps) over public/math/matrix_transform.json,
    // which is ceil(10.0 * 30) today. remotionStage.tsx re-checks it.
    durationInFrames: 300,
    fps: 30,
    width: 1920,
    height: 1080,
  },
];

export const DEFAULT_REMOTION_COMPOSITION_ID = "MathViz-Remotion";

/** Options for the `composition` select field in studio/schema.ts. */
export const remotionCompositionOptions = REMOTION_COMPOSITIONS.map((c) => ({
  label: c.label,
  value: c.id,
}));
