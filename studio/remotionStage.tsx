/**
 * The <Player> itself, plus the map from composition id to the scene component
 * in the remotion-lab checkout.
 *
 * This is @remotion/player, not Remotion Studio: no dev server of its own and
 * no timeline, just the scene component driven frame by frame with a scrub bar.
 *
 * Loaded through React.lazy from RemotionPlayerBlock.tsx, so remotion and the
 * scenes are a separate chunk that the editor only fetches once a RemotionPlayer
 * block is on the page.
 *
 * Scenes are imported from remotion-lab through the "@remotion-lab" alias in
 * studio/vite.config.ts. Nothing is copied: edit the scene in remotion-lab and
 * the editor picks it up on the next reload.
 */
import { Player } from "@remotion/player";
import matrixSpineJson from "@remotion-lab/public/math/matrix_transform.json";
import { MatrixScene } from "@remotion-lab/src/MathViz/MatrixScene";
import { spineSchema } from "@remotion-lab/src/MathViz/spine";
import { REMOTION_COMPOSITIONS } from "./remotionCompositions";

/**
 * MatrixScene draws an empty background without its spine, and in remotion-lab
 * the spine arrives through calculateMetadata (a fetch of staticFile()). Here
 * the same file is imported directly and parsed with the scene's own zod
 * schema, so a change in the JSON fails loudly instead of rendering blank.
 */
const matrixSpine = spineSchema.parse(matrixSpineJson);

interface StageEntry {
  // Scenes declare their own prop types; the map holds several of them.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  /** What remotion-lab's calculateMetadata would have passed to the scene. */
  inputProps: Record<string, unknown>;
  /** Timing derived from the scene's data, checked against the metadata below. */
  derived?: { durationInFrames: number; fps: number };
}

const stageEntries: Record<string, StageEntry> = {
  "MathViz-Remotion": {
    component: MatrixScene,
    inputProps: { spine: matrixSpine },
    derived: {
      durationInFrames: Math.ceil(matrixSpine.total_seconds * matrixSpine.timing.fps),
      fps: matrixSpine.timing.fps,
    },
  },
};

// Both halves of the registry must agree, and the hand-written metadata must
// match what the scene's data says. All three failures are loud at load time.
for (const meta of REMOTION_COMPOSITIONS) {
  const entry = stageEntries[meta.id];
  if (!entry) {
    throw new Error(
      `RemotionPlayer: composition "${meta.id}" is listed in studio/remotionCompositions.ts but has no entry in studio/remotionStage.tsx`,
    );
  }
  const d = entry.derived;
  if (d && (d.durationInFrames !== meta.durationInFrames || d.fps !== meta.fps)) {
    throw new Error(
      `RemotionPlayer: "${meta.id}" is listed as ${meta.durationInFrames} frames at ${meta.fps} fps, but its data file gives ${d.durationInFrames} frames at ${d.fps} fps. Update studio/remotionCompositions.ts.`,
    );
  }
}
for (const id of Object.keys(stageEntries)) {
  if (!REMOTION_COMPOSITIONS.some((c) => c.id === id)) {
    throw new Error(
      `RemotionPlayer: composition "${id}" has an entry in studio/remotionStage.tsx but is not listed in studio/remotionCompositions.ts`,
    );
  }
}

export interface RemotionStageProps {
  compositionId: string;
  controls: boolean;
  loop: boolean;
  autoPlay: boolean;
}

export default function RemotionStage({ compositionId, controls, loop, autoPlay }: RemotionStageProps) {
  const meta = REMOTION_COMPOSITIONS.find((c) => c.id === compositionId);
  const entry = meta ? stageEntries[meta.id] : undefined;

  if (!meta || !entry) {
    return (
      <div className="p-4 font-mono text-xs text-red-400">
        RemotionPlayer: unknown composition &quot;{compositionId}&quot;. Known ids:{" "}
        {REMOTION_COMPOSITIONS.map((c) => c.id).join(", ")}.
      </div>
    );
  }

  return (
    <Player
      component={entry.component}
      inputProps={entry.inputProps}
      durationInFrames={meta.durationInFrames}
      fps={meta.fps}
      compositionWidth={meta.width}
      compositionHeight={meta.height}
      controls={controls}
      loop={loop}
      autoPlay={autoPlay}
      // In the editor a click on a block means "select this block", so the
      // frame itself does not toggle playback; the control row does.
      clickToPlay={false}
      // remotion-lab already acknowledges the same licence for parseMedia;
      // without this the player logs the notice on every mount.
      acknowledgeRemotionLicense
      // Width only: the player derives the height from the composition's
      // aspect ratio, so the frame fits the column at any zoom.
      style={{ width: "100%" }}
    />
  );
}
