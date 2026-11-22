Vendored copy of remotion-lab at commit 2bd5da4, taken 2026-11-22.

These four files are the whole of what the `MathViz-Remotion` composition needs.
They are copied here, unedited, so that `next build` is self-contained: Vercel
builds this repository from GitHub and has no `remotion-lab` checkout beside it,
so an alias into a sibling folder works on this desktop and fails there.

| File | Why it is here |
|---|---|
| `MathViz/MatrixScene.tsx` | The scene component the player renders. |
| `MathViz/spine.ts` | Its zod schema and timing helpers; `MatrixScene.tsx` imports it. |
| `Showcase/palette.ts` | The colours `MatrixScene.tsx` imports as `../Showcase/palette`. |
| `public/math/matrix_transform.json` | The scene's data: the matrix, its eigenvalues and the segment timings. Written by `manim/compute_matrix_spine.py` in remotion-lab, never by hand. |

The folder layout mirrors remotion-lab's own (`MathViz/`, `Showcase/`,
`public/`) rather than being flattened, for two reasons: the files stay byte for
byte what the checkout holds, so "is this copy current?" is a plain byte
comparison; and `MatrixScene.tsx`'s own `../Showcase/palette` import keeps
resolving without editing a vendored file.

**Do not edit these by hand.** Edit the scene in remotion-lab, then refresh:

```
node scripts/sync-remotion-lab.mjs          # re-copy, re-stamp the line above
node scripts/sync-remotion-lab.mjs --check  # compare only, exit 1 on drift
```

`REMOTION_LAB_DIR` points the script at a checkout somewhere else; the default
is `../../remotion-lab` relative to this repository. The script is the only
thing that reads the checkout — nothing in the build does.

`src/components/blocks/RemotionStage.tsx` imports from this folder through the
`@/` path alias and holds the map from composition id to scene component.
Adding another composition means adding its files to the `FILES` list in the
script and re-running it, as well as the two edits described in
`studio/README.md` under "Add another composition".
