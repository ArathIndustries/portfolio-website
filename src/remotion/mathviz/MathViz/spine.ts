import { z } from "zod";

// Mirrors public/math/matrix_transform.json, written by
// manim/compute_matrix_spine.py. Both renderers consume this file; displayed
// numbers must come from it, never be hardcoded in a component.

export const timingSchema = z.object({
  fps: z.number(),
  grid_in: z.number(),
  vectors_in: z.number(),
  hold_before: z.number(),
  transform: z.number(),
  eigen_reveal: z.number(),
  hold_after: z.number(),
});

export const spineSchema = z.object({
  concept: z.string(),
  generated_by: z.string(),
  matrix: z.array(z.array(z.number())),
  determinant: z.number(),
  trace: z.number(),
  eigenvalues: z.array(z.number()),
  eigenvectors_columns: z.array(z.array(z.number())),
  basis_images: z.object({
    i_hat: z.array(z.number()),
    j_hat: z.array(z.number()),
  }),
  sample_points: z.array(z.array(z.number())),
  transformed_points: z.array(z.array(z.number())),
  verification: z.array(
    z.object({
      eigenvalue: z.number(),
      eigenvector: z.array(z.number()),
      A_times_v: z.array(z.number()),
      lambda_times_v: z.array(z.number()),
      max_abs_error: z.number(),
      ok: z.boolean(),
    }),
  ),
  timing: timingSchema,
  total_seconds: z.number(),
  caption_beats: z.array(z.object({ start: z.number(), text: z.string() })),
});

export type Spine = z.infer<typeof spineSchema>;

export const SPINE_URL_PATH = "math/matrix_transform.json";

export const fetchSpine = async (url: string): Promise<Spine> => {
  const res = await fetch(url);
  const json = await res.json();
  return spineSchema.parse(json);
};

// Integer-looking spine values display without decimals
export const fmt = (x: number): string =>
  Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(2);

// Segment boundaries in seconds, in scene order
export const segmentStarts = (t: z.infer<typeof timingSchema>) => {
  const gridIn = 0;
  const vectorsIn = gridIn + t.grid_in;
  const holdBefore = vectorsIn + t.vectors_in;
  const transform = holdBefore + t.hold_before;
  const eigenReveal = transform + t.transform;
  const holdAfter = eigenReveal + t.eigen_reveal;
  const end = holdAfter + t.hold_after;
  return { gridIn, vectorsIn, holdBefore, transform, eigenReveal, holdAfter, end };
};
