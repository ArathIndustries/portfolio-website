# Publishing studio (spike)

A small Puck editor that edits the site's MDX pages with the site's own React components. Pages stay MDX on disk; the studio converts MDX to Puck data on open and back on Publish. Built 2026-11-08 on branch `studio-spike` as a spike; the measured results are at the bottom.

## Run it

```
npm run studio          # editor on http://127.0.0.1:24044/studio/
npx next dev -p 24045 -H 127.0.0.1   # the site, for "open on site"
npm run studio:roundtrip             # MDX -> Puck -> MDX over every content file
py studio/examples/make_figure.py    # regenerate public/studio-examples/figure.json and table.csv
```

The editor loads `?file=pages/home.mdx` (any file under `content/`, including the home page). The page dropdown lists pages by their address on the site (`/`, `/work/<slug>`, `/forged/notes/<slug>`, `/showcase/<slug>`), computed from the same collection-to-route map the Next app uses. "Save to preview" writes the MDX back to the file, commits `content/` on the branch `studio/preview` and pushes it; "Promote to live" moves master to that branch. See "Publish flow" below. Set `STUDIO_REMOTE=<name>` to point both at a different git remote (the tests used a throwaway bare repository); the default is `origin`.

Everything is served under the base path `/studio/` (editor, API, Vite client, HMR websocket) so the Arath Industries Hub can reverse-proxy the whole app at `<hub>/studio/` without rewriting URLs. Root requests for files in `public/` (`/images/...`) are rewritten onto the base when the studio is opened directly, so the canvas still finds them.

### Hub theme

The editor's chrome uses the hub's tokens with the hub's own names and values (`studio/tokens.css`: `--black`, `--panel`, `--raise`, `--raise2`, `--line`, `--text`, `--mute`, `--faint`, `--white`, `--late`, `--ok`, `--warn`, `--info`, `--accent`, the `--fs-*` sizes, the `--h-*` heights, `--radius`, `--radius-lg`, `--pad-panel`, `--font`, `--mono`), copied from the hub's `frontend/src/components/workspace/workspace.css`; the hub is the source and the file is not edited by hand. `studio.css` maps them into the Tailwind theme (`bg-panel`, `text-mute`, `text-fs-b`, `rounded-radius`, `font-hub`; `--black`/`--white` are `hub-black`/`hub-white` so the site's own `bg-black` and `text-white` stay fixed on the canvas). One block per hub theme, selected by `data-theme` on `<html>`. The theme comes from `?theme=light|dark|sensitive-light|sensitive-dark` in the URL, or from `postMessage({ type: "hub-theme", theme }, "*")` sent by a parent frame; dark is the default and unknown values are ignored. Puck 0.24 (`@puckeditor/core`) has no dark mode of its own; it defines its colours in `@layer puck-tokens` on `:root`, so `studio.css` sets the semantic names (`--puck-color-surface`, `-surface-muted`, `-surface-subtle`, `-surface-inverse`, `-border`, `-border-hover`, `-border-muted`, `-border-inverse`, `-text`, `-text-secondary`, `-text-muted`, `-text-subtle`, `-text-inverse`, `-interactive` and its `-hover`, `-active`, `-subtle`, `-soft`, `-soft-hover`, `-neutral-hover`, `-inverse-hover`, `-inverse-active`, `-focus-ring`, `-selection-bg`, `-selection-border`, `-line-placeholder`, `-highlight`, `-bg-disabled`, `-text-disabled`, `-overlay-backdrop`), `--puck-color-white`, `--puck-color-black`, the `--puck-color-grey-01..12` and `--puck-color-azure-01..12` scales (29 rules in puck.css read those directly), and `--puck-font-family` (the site's mono), all from the hub tokens, in an unlayered rule that wins over the layered defaults.

Puck is installed as `@puckeditor/core@0.24.0`. The `@measured/puck` package name stopped at 0.20.2; 0.21 and later ship under `@puckeditor/core` (same project, MIT).

### Hub messages (2026-11-27, B319)

The hub frames the studio with `?theme=<theme>&hubOrigin=<the hub's origin>` (hub `StudioPanel.vue`, `composables/useStudioBridge.js`). `studio/hubBridge.ts` reads `hubOrigin`; without it, or when the studio is not in a frame, nothing is posted and inbound `hub-*` messages are ignored. Inbound messages count only when `event.origin` equals that origin and `event.source` is the parent window; outbound messages go to `window.parent` with that origin as the target, never `*`.

| Direction | Message | Meaning |
|---|---|---|
| hub -> studio | `{ type: "hub-theme", theme }` | Use this hub theme (`light`, `dark`, `sensitive-light`, `sensitive-dark`); unknown values are ignored. |
| hub -> studio | `{ type: "hub-open-page", path }` | Open the page whose content path is `path`, e.g. `pages/about.mdx` (relative to `content/`, forward slashes, the `file` value of `GET /studio/api/pages`). Goes through the same `openPage` as the Pages pane, so unsaved edits ask first. |
| hub -> studio | `{ type: "hub-show-pane", pane }` | Show one pane: `blocks`, `outline`, `pages` (the left sidebar, that tab), `fields` (the right sidebar on the desktop; the Fields sheet on the phone); `null` hides the sidebars (desktop) or closes the sheet (phone). Handled by `components/HubPanes.tsx` inside Puck, so it needs a page loaded. |
| studio -> hub | `{ type: "studio-ready" }` | Once on mount, after the listeners are installed, so the hub can send a queued `hub-open-page`. |
| studio -> hub | `{ type: "studio-state", page: { path, title } \| null, dirty, saving }` | Once on load and on every change: the open page's content path and title, whether the editor holds unsaved edits, and whether "Save to preview" is running. |

### Header, phone layout, controls (2026-11-27, B320)

* `Header.tsx` is one row: brand, title and path, then `components/PriorityToolbar.tsx` (a port of the hub's `PriorityToolbar.vue` + `usePriorityOverflow.js`, same item contract) with undo, redo, Save to preview, Promote to live, the status pill, the site and preview links and the canvas zoom. The row never wraps; what does not fit goes into a "…" menu (`components/StudioMenu.tsx`). Under 620 px of toolbar width the items drop their labels.
* Under 638 px (Puck's own phone breakpoint) the grid column follows the window (`--puck-frame-width: minmax(0, 1fr)`), so the canvas fits the width and Puck's auto zoom fits the page; the pane picked in the bottom bar (Blocks, Outline, Pages, Fields) is a bottom sheet over the canvas with a grip (tap toggles the height, drag up expands, drag down closes) and a close button (`components/PhoneSheet.tsx`); selecting a block opens the Fields sheet; text fields are 16 px; the bar and the sheet pad for `env(safe-area-inset-bottom)`. Between 638 and 767 px Puck keeps its own tablet layout.
* Controls are `.studio-btn` (`.studio-ghost`, `.studio-primary`, `.studio-small`), `.studio-ib`, `.studio-input`, `.studio-select` at the hub sizes (32 px, 13.5 px fields, 12.5 px buttons, the two radii, one focus ring, `--faint` disabled). Puck's own fields follow through its `--puck-field-*`, `--puck-radius-*` and `--puck-font-size-*-unitless` variables.
* Image and PDF paths are a file field (`components/FileField.tsx`): the path plus an Upload button that posts the file to `studio/api/upload?dir=images|files&name=...`, which saves it under `public/<dir>/` (lower-case name, `-2`, `-3` on a clash, 25 MB cap) and writes the `/images/...` path into the field. Schema fields are marked with `studioFile` in `schema.ts`; `blocks.tsx` attaches the control.
* Lint: `npm run lint:studio:css` (stylelint, `studio/.stylelintrc.cjs`: no hex outside `tokens.css`, no literal colour or font-size where a token is expected), `npm run lint:studio:css:delta` (fails only on violations not in `studio/lint-baseline.json`), `npm run lint:studio:css:baseline` (rewrites the baseline).

## Where things are

| Path | What |
|---|---|
| `src/components/blocks/*.tsx` | One file per block: the real component the site renders. |
| `src/components/blocks/index.ts` | `blockComponents` (name to component) and `mdxComponents` (plus child elements such as `TimelineItem`). The Next routes hand `mdxComponents` to MDXRemote. |
| `studio/schema.ts` | Fields, defaultProps, description and editing mode per block. No React, so the converters can load it under Node. |
| `studio/blocks.tsx` | The Puck config. Zips `blockComponents` and `blockSchemas`; throws at startup if a block exists on one side only. A block named in `studioComponentOverrides` (`studio/RemotionPlayerBlock.tsx`) is drawn on the canvas with the editor's own copy instead of the site's. |
| `studio/convert/mdxToPuck.ts`, `puckToMdx.ts` | The converters. `roundtrip.ts` is the test. |
| `studio/vite.config.ts` | Vite app plus the file API (`/api/pages`, `/api/page`) and the publish API (`/api/publish`, `/api/promote`, `/api/publish/status`). Serves the site's `public/`. Aliases `next/link` to `studio/shims/next-link.tsx` so blocks keep client-side navigation on the site. |
| `studio/publish.ts` | The git side of publishing: preview branch, promote, status. Plain Node, no Vite; see "Publish flow". |
| `src/app/page.tsx` | The home page: renders `content/pages/home.mdx` through `mdxComponents`. The page is one `NeonSignHero` block. |
| `studio/App.tsx`, `main.tsx`, `studio.css` | The editor shell. `studio.css` imports `src/app/globals.css`, so the canvas uses the site's Tailwind theme. |
| `src/app/showcase/[slug]/page.tsx` | Renders `content/showcase/*.mdx`. Test route, unlinked. |
| `studio/screenshots/` | `capture.py` and the PNGs listed below. |

## Add a block

1. Write the component in `src/components/blocks/MyBlock.tsx`. Plain props, no `next/*` imports (the studio runs under Vite). Add `"use client"` if it uses effects or browser APIs; load heavy libraries with `import()` inside an effect or `React.lazy`.
2. Export it from `src/components/blocks/index.ts` (one line in `blockComponents`).
3. Add an entry to `studio/schema.ts` with `fields`, `defaultProps`, `description`, `editing`, `category`. Spread `layout({ space, align })` at the end of `fields` and take `BlockLayoutProps` in the component if the block should also get the show/hide, spacing and alignment fields (see "Layout fields").

Done: the editor lists it, the converters accept `<MyBlock … />` in MDX, and every page route renders it. Measured on the last block (`Quote`): 18.6 s wall clock from first edit to the block rendering on the site and loading in the editor (12:57:04.6 to 12:57:23.2).

Rules the code enforces:

- A JSX tag in a page that has no schema entry makes `mdxToPuck` throw with the file and line. So does an `import`/`export`, a spread attribute, or children on a block that does not declare `childrenAs`.
- A schema entry without a component, or a component without a schema, makes `studio/blocks.tsx` throw at startup. A block may also register an editor-only copy of itself in `studioComponentOverrides` (see "Remotion player block"); that copy wins on the canvas, and a name there with no schema throws too.

Field types used: `text` and `textarea` (with `contentEditable: true` for in-place editing), `number`, `select`, `radio`, `array` (with `arrayFields`, `defaultItemProps`, `getItemSummary`). Puck's field reference: https://puckeditor.com/docs/api-reference/fields.

## Blocks

Editing column: "in-place" means you click the text on the canvas and type; "side-pane" means the right panel; "mixed" is both.

| Block | What | Editing | Code-rich inside? |
|---|---|---|---|
| Timeline | The site's `Timeline` (`src/components/Timeline.tsx`). On disk it stays `<Timeline><TimelineItem … /></Timeline>`; in the editor it is an `items` array. | side-pane | existing site code, few fields |
| NeonCard | `NeonTubeCard` from `src/components/neon` with tag, title, body. | in-place | existing site code, few fields |
| Sparks | The home page `SparkCanvas` overlay. Fixed full-screen effect; one radio field. | side-pane | existing site code, one field |
| Markdown | A run of prose. This is what text between components becomes. On the canvas it is rendered with react-markdown; click it and the raw Markdown is edited in place (see "Prose in place"). The side-pane textarea is behind a Source toggle. | in-place | no |
| Hero | Title, subtitle, call to action. | mixed (title and subtitle in place) | no |
| Callout | Tone, title, body. | mixed | no |
| Quote | Quote and author. | in-place | no |
| TwoColumn | Two Markdown columns and a ratio. | side-pane | no |
| Divider | Neon hairline, optional label. | side-pane | no |
| CodeBlock | Language, filename, code. No highlighter yet. | side-pane | no |
| Figure | Image, alt, caption, max width. | mixed (caption in place) | no |
| Stats | Array of value and label. | side-pane | no |
| PlotlyChart | Path to a Plotly figure JSON written by Python; plotly.js loaded on demand. | side-pane | yes: ~1.1 MB library, 3 fields |
| MapBlock | MapLibre GL, free demo tiles, markers array. | side-pane | yes: ~0.3 MB library, 5 fields |
| Scrolly | Steps array; sticky panel changes with the step in view. | side-pane | yes: observer logic, 1 array field |
| ThreeBlock | three.js torus knot via react-three-fiber; `p`, `q`, height. | side-pane | yes: ~0.4 MB library, 3 fields |
| DataTable | CSV path, caption, max rows. | side-pane | some: CSV parser, 3 fields |
| Embed | Iframe URL checked against the allowlist in `Embed.tsx`; refused hosts render a notice. | side-pane | no |
| RemotionPlayer | A Remotion composition, vendored from `remotion-lab` into `src/remotion/mathviz/`, played in the page. The editor draws its own copy of the block; the stage inside is shared. See below. | side-pane | yes: ~320 KB chunk, 5 fields |

"Code-rich inside, few fields outside" is the pattern for the showcase blocks: the component owns the behaviour, the schema exposes three to five values. Everything with short text is editable in place; arrays and numbers are side-pane because Puck has no in-place widget for them.

## Remotion player block

`RemotionPlayer` puts a Remotion composition on the page and plays it: a play button, a volume button, a time readout, a scrub bar and fullscreen. It uses `<Player>` from `@remotion/player`, which renders the composition's React component frame by frame in the page. It is not Remotion Studio (the separate dev tool with the timeline and props editor), and it renders nothing to a video file.

The scene is **vendored into this repository**, not imported from the `remotion-lab` checkout next door:

| Path | What |
|---|---|
| `src/remotion/mathviz/` | The four files `MathViz-Remotion` needs, copied byte for byte from remotion-lab: `MathViz/MatrixScene.tsx`, `MathViz/spine.ts`, `Showcase/palette.ts`, `public/math/matrix_transform.json`. Its `README.md` names the commit the copy was taken from. |
| `scripts/sync-remotion-lab.mjs` | Re-copies exactly those files and re-stamps that commit line. `--check` compares only and exits 1 on drift. The only thing in this repo that reads the checkout. |
| `src/components/blocks/remotionCompositions.ts` | The list of compositions the block offers: id, label, duration, fps, size. Import-free on purpose, because `studio/schema.ts` reads it to build the dropdown and the MDX converters load `schema.ts` under plain Node. |
| `src/components/blocks/RemotionStage.tsx` | The `<Player>` itself and the map from composition id to the scene component and its input props. Loaded lazily by both copies of the block, so remotion (a 320 KB chunk) is fetched only once a block of this type is on the page. |
| `src/components/blocks/RemotionPlayer.tsx` | The site's block: the frame, and `next/dynamic` with `ssr: false` around the stage. Registered in `src/components/blocks/index.ts` like every other block. |
| `studio/RemotionPlayerBlock.tsx` | The editor's copy: the same frame, `React.lazy` around the same stage, and the Puck pointer-events opt-out below. Exports `studioComponentOverrides`, which `studio/blocks.tsx` reads before `blockComponents`. |

**Why vendored, when importing was working.** This site deploys to Vercel from GitHub on every push, and Vercel checks out this repository alone. An alias into a sibling folder built on this desktop and would have failed on every deploy. Importing across the two checkouts also needed `turbopack.root` raised above the repo and a set of aliases forcing one copy of `remotion`; all of that is deleted. `next.config.ts` now has no bundler configuration at all, and neither config mentions `REMOTION_LAB_DIR`.

The cost is that the copy can go stale. What keeps that honest: the files are copied unedited, so `node scripts/sync-remotion-lab.mjs --check` is a byte comparison that names the commit; and `src/remotion/mathviz/README.md` carries the commit and date in its first line, rewritten by the script itself.

**Versions must still match the checkout.** `remotion`, `@remotion/player` and every `@remotion/*` package a scene imports are pinned here to the version `remotion-lab/package.json` uses (4.0.487 as of 2026-11-21), because the vendored scene is written against that API. The *second copy* problem is gone with the alias: every import now resolves inside this repo's `node_modules`. Measured 2026-11-22 by counting a string that appears only in `remotion/dist/esm/index.mjs` across `.next/static/chunks`: **1 occurrence, with no aliases at all.** (With the old cross-repo import it was 2 without aliases, 1 with.) `resolve.dedupe` stays in `studio/vite.config.ts` as belt and braces against a future dependency that bundles its own copy; nothing reachable today needs it.

### Add another composition

Three edits, and both sides pick them up:

0. **The files.** Add the scene's files to `FILES` in `scripts/sync-remotion-lab.mjs` — the component, anything it imports from inside remotion-lab, and its data file — then run the script. Paths in the list are relative to the checkout; a leading `src/` is dropped on the way in, so `MathViz/` and `Showcase/` stay siblings and the scene's own relative imports keep resolving without editing a copy.
1. **The metadata.** Add an entry to `REMOTION_COMPOSITIONS` in `src/components/blocks/remotionCompositions.ts` with the `id`, `durationInFrames`, `fps`, `width` and `height` from that `<Composition>` in `remotion-lab/src/Root.tsx`, plus a label for the dropdown. When the composition computes its length in `calculateMetadata` rather than declaring it, write down what that computation yields.
2. **The component.** Add an entry under the same id to `stageEntries` in `src/components/blocks/RemotionStage.tsx`: the scene component, imported through `@/remotion/mathviz/...`, and the `inputProps` the composition's `calculateMetadata` would have produced. Set `derived` to the same numbers computed from the scene's own data file, and `RemotionStage.tsx` throws at load if the two disagree. An entry on one side only also throws.

Then install any `@remotion/*` package the new scene imports, at the same version. `MatrixScene` needed `@remotion/google-fonts` and `zod`; `Showcase`, for instance, would also need `@remotion/transitions`, `@remotion/noise` and `@remotion/paths`.

Scenes that read files with `staticFile()` need more than this. `staticFile` resolves against the site's and the studio's own `public/` folder, not against `src/remotion/mathviz/public/`, which is bundled rather than served, so a scene that plays an MP4 from there has nothing to load. `MatrixScene` avoids it: its data file is imported directly and parsed with the scene's own zod schema, which fails loudly rather than drawing a blank frame. A scene that genuinely needs a served file means copying that file into this repo's `public/` as well, and adding it to the script's `FILES` list with a destination that lands there.

### Two copies of the block, one stage

Every other block is a single component in `src/components/blocks` that the editor also renders. This one is two components around one shared stage, because three things about the editor's version are Puck-only or Vite-only:

- the `registerOverlayPortal` call below, which exists to undo a Puck stylesheet rule;
- `clickToPlay={false}`, because on the canvas a click on a block means "select this block";
- `next/dynamic`, which the site uses to keep the player out of the server render and which does not exist under Vite.

So `src/components/blocks/RemotionPlayer.tsx` is the site's block and is registered in `blockComponents` like any other, and `studio/RemotionPlayerBlock.tsx` lists itself in `studioComponentOverrides`, which `studio/blocks.tsx` reads first. Both import the same `RemotionStage` and the same composition list, so a scene or a timing number is only ever written down once. The site block never imports anything from `studio/`.

A page carrying the block now round-trips through MDX *and* renders on the site, so it is safe to publish. `content/showcase/remotion-player-demo.mdx` is the demo page that exercises both.

### Why the block takes its own pointer events

Puck's canvas sets `pointer-events: none` on everything inside a block (`[data-puck-component] *` in its stylesheet), so none of the player's controls can be clicked. `registerOverlayPortal` from `@puckeditor/core` is Puck's own opt-out and is called on the player's frame.

Both of its options for keeping Puck's drag-and-drop out of the way (`disableDrag`, `disableDragOnFocus`) stop `pointerdown` before it reaches the content. React delivers pointer events from a single listener at the tree root, so stopping the press below that root also takes it away from Remotion's scrub bar. Measured with either option on: the play button still worked, since that is a `click`, and seeking did nothing at all. Both are therefore off.

What this costs, measured 2026-11-21: clicking anywhere on the scrub bar seeks, and the frame redraws; press-and-drag seeks to the press point and follows the pointer for one step, then stops (Puck never enters its own drag state, so the block does not move). Repeated clicks give full control of the playhead. Clicking the player does not select the block, because the overlay portal also stops the `mouseover` Puck uses to track what is under the pointer: select it from the Outline rail instead, which is also where the side pane fields come from.

### Measured

`studio/screenshots/remotion_player_1440.png`: the block selected at 1440x900, the playhead at 0:06 of 0:10, the Outline on the left and the five fields on the right.

**Editor, 2026-11-21.** Checked against a studio on port 24049 with Playwright (Chromium 1217), 19 of 19 automated checks: the player mounts inside Puck's canvas iframe; the play, mute and fullscreen buttons exist; the time readout reads 0:10, which is the 300 frames at 30 fps that `Root.tsx` computes from `matrix_transform.json`; `width` 960 gives a 958 px player; autoplay off leaves it on frame 0; a click on the bar moves both the readout and the scene SVG; play advances the frame and pause holds it; the five fields appear in the side pane. No console or page errors.

**Site, 2026-11-22.** `npm run build` exits 0 with Turbopack, 48 static pages including `/showcase/remotion-player-demo`. `npx tsc --noEmit` (site) and `npx tsc -p studio --noEmit` both exit 0; `npx vite build --config studio/vite.config.ts` exits 0; `npm run lint` reports the same 4 pre-existing problems in `src/components/neon/NeonGrid.tsx` and nothing new. Round-trip with the demo page added: 44 files, 43 byte-identical, the one documented difference unchanged.

**The Vercel question, settled by experiment, 2026-11-22.** The whole point of vendoring is that the build must not need a folder GitHub does not have. So the folder was taken away: `remotion-lab` renamed to `remotion-lab-TEMPORARILY-RENAMED`, `.next` deleted, then everything re-run. With no checkout on disk and `REMOTION_LAB_DIR` unset — `next build` exit 0 (21.9 s compile, 34.4 s wall clock at BelowNormal priority, 48 pages), both `tsc` runs exit 0, `vite build` exits 0, round-trip unchanged, `npm run lint` unchanged, and `node scripts/sync-remotion-lab.mjs --check` exits 1 with "no remotion-lab checkout at …", which is the one thing that is *supposed* to fail. The folder was then renamed back and confirmed present with `ls`; its HEAD is still `2bd5da4` and its working tree is as it was.

Still with the checkout absent, `next start` on 127.0.0.1:24713 and `/showcase/remotion-player-demo` in Chrome through Playwright 1.65, **19 of 19 automated checks**: the frame box is 960x540 at DOMContentLoaded and still 960x540 once the player mounts, so the page does not jump; the aspect ratio is 1.7778; the readout reads `0:00 / 0:10`; the mute and fullscreen controls exist; the scene draws 4 SVG elements and prints `A = [[2,1],[1,2]]`, `λ₁ = 3, λ₂ = 1`, `det(A) = 3` — the numbers out of the vendored JSON; play moves the readout to 0:01 and pause holds it at 0:02; a click at 85 % of the scrub bar seeks to 0:08; at a 390 px viewport the frame is 358 px wide. No console or page errors other than the browser's own `/favicon.ico`.

And the editor, same conditions, studio on 127.0.0.1:24714: **7 of 7** — Puck's canvas iframe is found, the player mounts in it, `data-puck-overlay-portal` is present (only the editor's copy sets it, so the override in `studio/blocks.tsx` is what is being drawn), the play button computes `pointer-events: auto`, the readout reads `0:00 / 0:10`, play moves it to 0:01, no errors beyond `/favicon.ico`. That 404 is the browser asking for a file the studio has never served; `studio/index.html` declares no favicon.

The remotion chunk is fetched on demand, not with the page: the file holding it appears in none of the prerendered HTML files under `.next/server/app`, the demo page's own included.

Screenshots in `C:\Users\Arath\AppData\Local\Temp\site-remotion-shots\`.

Not checked: `loop`; fullscreen itself (only that the button exists); autoplay on; any composition other than `MathViz-Remotion`; a real Vercel deployment (only the local equivalent above); dragging the block on the canvas since the split; `next dev` (only `next build` and `next start`); and whether anything warns when the vendored copy drifts from remotion-lab — `--check` has to be run on purpose, nothing runs it.

## Layout fields (every block on a live page)

The blocks the site's own pages use carry three extra side-pane fields on top of their own:

| Field | Prop | What it does |
|---|---|---|
| On the site | `hidden` | `hidden` leaves the block out of the rendered page. The editor keeps showing it, dimmed, with a "hidden on the site" badge, so it stays selectable (`[data-studio-block-hidden]` in `studio.css` — not `data-studio-hidden`, which means `display:none` for the zoom control). |
| Space below (or above / above and below) | `space` | `none`, `tight`, `normal`, `loose` → `mb-0/6/12/24`, mapped per block onto the margin class it already had. |
| Alignment | `align` | `left`, `center`, `right` → `text-*` on the block, plus `justify-*` on its button or bullet rows. |

`src/components/blocks/layout.ts` holds the maps and the helpers (`spaceBottomClass`, `spaceTopClass`, `spaceBothClass`, `textAlignClass`, `rowAlignClass`, `cx`). Two rules keep this from touching pages that do not use it:

- **Unset means unchanged.** Each helper takes the block's existing class string as its fallback, and "block default" in the select writes `""`. A page that never opens these fields renders the same markup as before and its MDX gains no attribute. The round-trip count did not move when the fields were added (42 of 43 byte-identical, same one documented difference).
- **Nothing is in `defaultProps`.** Puck merges `defaultProps` only when it renders and when a block is inserted, never into the stored data, so an untouched block stays attribute-free on disk. The side-pane box for such a field is empty until it is used, while the canvas already shows the component's own default.

`Markdown` is the exception: it is written to disk as bare prose, so it cannot carry props and has no layout fields. The showcase-only blocks (Hero, Callout, Quote, Figure, Stats, TwoColumn, CodeBlock, NeonCard, Sparks and the four heavy ones) do not have them yet either.

## Converters

`mdxToPuck`: splits the frontmatter off by text (the YAML is kept verbatim as `root.props.frontmatter`), parses the body with remark plus remark-mdx, and walks the top level. Consecutive non-JSX nodes become one `Markdown` block whose text is sliced from the source by position, never re-serialised. Each JSX element becomes a block of that name; attribute expressions (`items={[…]}`) are evaluated as JavaScript object literals. The file's line ending (CRLF in this checkout, LF in git) is remembered and written back.

`puckToMdx`: frontmatter, then blocks joined by one blank line. String props become `"quoted"` attributes; strings with quotes or newlines, and all non-strings, become `{JSON}` expressions. Blocks with `childrenAs` are written in the nested form.

Round-trip result over all 33 existing content files (`npm run studio:roundtrip`, run 2026-11-08): **33 byte-identical, 0 whitespace-only, 0 different, 0 failed**. Before the line-ending fix all 33 differed only by CRLF versus LF. The showcase page is the one file that changes on first save (its hand-written multi-line `code="…"` attribute becomes `code={"…"}`); the second and third passes are identical to the first, so a saved file is stable.

A finding from the site side: next-mdx-remote 6 defaults to `blockJS: true`, and its `removeJavaScriptExpressions` plugin silently deletes every `prop={expression}` attribute. Strings survive, numbers and arrays vanish. All three MDX routes now pass `options={{ blockJS: false }}` (the `blockDangerousJS` guard stays on). Without this, MapBlock received `NaN` coordinates and Scrolly an empty steps list.

## Measured results

Screenshots (`studio/screenshots/`, taken with Playwright 1.59.1 and the cached Chromium 1217):

- `showcase_1440.png`, `showcase_390.png`: the site at `/showcase/studio-showcase`, full page, 1440 and 390 wide.
- `editor_1440.png`, `editor_390.png`: the editor with that page open.
- `editor_inline_edit_1440.png`: the hero title after typing into it on the canvas; the right pane shows the same text in the `title` field.
- `editor_array_fields_1440.png`: the Timeline selected, `items` array in the side pane, status bar after a Publish.

Editor test (scripted, Playwright): click the hero title on the canvas, type a marker, press Publish. Puck wraps the title in a `contenteditable="plaintext-only"` span; the typed text appeared in the side-pane field; Publish sent `PUT /api/page` (200) and the file on disk gained the marker on the Hero line. The file was then restored.

Phone (390 px) editor: the canvas renders the page at 92 % with the site look, and the block list, outline and fields move to a bottom bar. Dragging blocks with touch was not tested. Puck's Publish control is a `<span>` without a button role, so it is not reachable from a keyboard or screen reader; this is a Puck issue, not ours. The side pane and canvas cannot be shown at once at this width, so editing arrays on a phone means switching views for every change.

Build: `npm run build` of the site with the `studio/` folder present: exit 0, 27 s wall clock at BelowNormal priority (compile 16.7 s), 47 static pages including `/showcase/studio-showcase`. Re-run after the home page and publish flow landed (2026-11-08): exit 0, 25 s wall clock (compile 15.2 s), same 47 pages. Hygiene for master, checked the same day: the showcase route keeps `robots: { index: false }` in its metadata and appears in neither the header, the footer nor the sitemap; the home, work, notes and showcase routes all pass `blockJS: false`; `npm run lint` reports 4 problems (1 error, 3 warnings), all in `src/components/neon/NeonGrid.tsx`, which is unchanged from master; `npx tsc -p studio --noEmit` passes; the round-trip is 35 files, 34 byte-identical, 1 documented difference (the showcase page), 0 failed. `tsconfig.json` excludes `studio/` and `eslint.config.mjs` ignores it; the studio has its own `studio/tsconfig.json` (`npx tsc -p studio --noEmit` passes). `npm run lint` reports one pre-existing error in `src/components/neon/NeonGrid.tsx:1306` (`prefer-const`), unchanged from master.

Bundle (measured on `.next/static/chunks` after that build, uncompressed; Next 16 no longer prints per-route sizes):

| What | Size | Loaded when |
|---|---|---|
| plotly.js chunk (`8300f39f….js`) | 4,486 KB | first PlotlyChart mounts |
| maplibre-gl chunk (`43d1741e….js`) | 1,008 KB | first MapBlock mounts |
| three + react-three-fiber chunk (`ae1d9d8f….js`) | 871 KB | first ThreeBlock mounts |
| Initial scripts, `/showcase/studio-showcase` | 11 files, 596 KB | page load |
| Initial scripts, `/forged/notes/rebuilding-wdwtwa` | 11 files, 596 KB | page load |
| Initial scripts, `/work/modulab` | 11 files, 610 KB | page load |

None of the three library chunks appears in any page's initial script list; a page that does not use the block never fetches it. Not measured: the initial-script total of master before this branch, so the exact delta the block code itself adds to the shared chunks is unknown (the showcase and note pages load the same 11 files, which puts an upper bound of the showcase route's own code at a few KB).

Not verified or not done: the hub iframe; touch drag on a phone; the Markdown block's rich-text editing (it is a plain textarea, and the canvas preview uses react-markdown, which does not render MDX-only syntax such as inline JSX); syntax highlighting in CodeBlock; MapLibre's demo tiles and the Embed block load from the network when the page is viewed.

## Publish flow

Two steps, two buttons in Puck's header (its own Publish button is replaced through the `headerActions` override):

1. **Save to preview** (`PUT /api/page`, then `POST /api/publish`). Writes the MDX, then builds the branch `studio/preview` as `<remote>/master` plus the working tree's `content/` folder, as one commit `studio: <page title>`, and force-pushes it. The branch is rebuilt from master every time, so it never drifts and never needs rebasing. Nothing is checked out: the tree is built in a temporary index file (`GIT_INDEX_FILE`), so the working tree and the current branch are untouched. Vercel builds every pushed branch; the response and the "preview site" link carry the address pattern `https://arath-industries-git-studio-preview-arathindustries-projects.vercel.app`.
2. **Promote to live** (`POST /api/promote`, after a confirm dialog). The dialog refreshes the status from the remote and lists the pages that differ between master and `studio/preview` (`git diff --name-only <remote>/master <remote>/studio/preview`, each file shown as its site path and title). Fast-forwards master to `studio/preview` when master has not moved; otherwise merges `--no-ff` in a throwaway worktree. Pushes master.

`GET /api/publish/status` fetches the remote and reports whether the preview is ahead of or behind master, the last preview commit, the changed files, and content files changed on disk but not yet saved. The second bar under the studio title shows it. While the preview is ahead of master, that bar also shows an "Open preview" link to `<Vercel branch URL>/<page path>` for the open page, with the note "Preview needs a Vercel sign-in" (the project's Deployment Protection is on).

All API routes live under `/studio/api/`.

All git calls are `execFile("git", [...args])` with argument arrays; the page title is one argv entry after `-m`. The remote name comes from `STUDIO_REMOTE` (checked against `[A-Za-z0-9_.-]+`, default `origin`).

Tested 2026-11-08 against a bare repository added as the remote `spiketest`, seeded with master (`a2277dc`): status before (`previewExists: false`); an edit to `content/pages/home.mdx` and publish produced `00504bb studio: Home` on the bare remote, status `1 ahead, 0 behind`; promote fast-forwarded master to `00504bb`. Then a second publish (`66d8285`), an unrelated commit pushed to the remote's master (`dff2522`), status `1 ahead, 1 behind`, and promote produced the merge `857f1c7 Merge studio/preview into master (studio promote)` with both parents. From the editor (Playwright, 1440 px): the two buttons were present and Puck's Publish was not; "Save to preview" wrote 247 bytes, pushed `4ca0278 studio: Home`, and the status bar read "1 ahead of master"; the working tree was clean afterwards (the saved file was byte-identical). Not tested from the editor on that date: a confirmed promote (the dialog was dismissed); the merge path only ran headlessly.

Second run, 2026-11-08 14:40, after the hub-theme and dialog work, again against a bare `spiketest` seeded with master (`4081c48`), driven by Playwright at 1440 px: the dropdown's 35 options all start with a site path; "Save to preview" wrote 1984 bytes and pushed `ee75a6c studio: Getting Started with AI Tools in Engineering`; the status read "1 ahead of master" and the "Open preview" link pointed at `https://arath-industries-git-studio-preview-arathindustries-projects.vercel.app/forged/notes/getting-started-with-ai-tools`; "Promote to live" opened the dialog listing `/forged/notes/getting-started-with-ai-tools` with the button "Promote 1 file"; the confirm produced `promoted (fast-forward): master 4081c48 -> ee75a6c` and the bare remote's master and `studio/preview` both read `ee75a6c`; the link disappeared once preview equalled master. `postMessage({type:'hub-theme', theme:'light'})` switched `data-theme` and `--puck-color-surface` from `#0a0a0a` to `#eef0f2`; a bogus theme was ignored. No console errors.

Vercel preview deployments: the repository has no `vercel.json`, and GitHub's deployment records (read with `gh api`) show only `Production` deployments by `vercel[bot]`, all for master; master is the only branch that has ever been pushed, so there is no record either way of a branch deployment. Vercel's project default is to build every branch. Confirm once by looking at the first `studio/preview` push in the Vercel dashboard; the Vercel settings were not changed.

## Home page as a block (done)

The home page is `content/pages/home.mdx`, one `<NeonSignHero … />` with the tagline and the two call-to-action labels and links as fields. `src/app/page.tsx` reads that file and renders it with `MDXRemote` and the same `mdxComponents` as the other routes; page metadata stays the layout's default, as before. `NeonSignHero` owns the bridge ref and renders `SparkCanvas` and `NeonSign` inside one block; the markup is the old page's, unchanged.

Parity, measured 2026-11-08: production builds before and after the change, served with `next start` on 24045, screenshots with Playwright at 1440x900 and 390x844 with `requestAnimationFrame` stubbed, `Math.random` fixed at 0.5, CSS animations and transitions off and canvases hidden (the same script for both shots): **0 differing pixels of 1,296,000 at 1440 and 0 of 329,160 at 390**. Round-trip over 35 files: 34 byte-identical (`home.mdx` included); the showcase page is the one documented difference.

The original assessment, kept for the record:

`src/app/page.tsx` was a 33-line client component with four pieces:

1. `SparkCanvas` with a shared `bridgeRef`: the fixed full-screen spark and flashlight overlay.
2. `NeonSign` with the same `bridgeRef`: the hand-drawn neon letters that report brightness dips and letter positions into the bridge so the sparks fly from the right places.
3. A tagline paragraph (`Forged by Arath. Built for how you work.`).
4. Two call-to-action links (`View Work`, `Hire Me`).

Pieces 3 and 4 are a `Hero`-shaped block today (title-less hero with subtitle and two CTAs; the current Hero has one CTA, so either add a second CTA pair or a `Buttons` block). Pieces 1 and 2 are the problem: they are two components joined by a mutable ref created in the page, and the ref is what makes the sparks follow the letters. A block boundary cannot pass a ref between two sibling blocks. The honest conversion is one block, `NeonSignHero`, that owns the ref and renders both `SparkCanvas` and `NeonSign` internally, with a field or two (tagline, CTA labels and hrefs) and nothing else editable. The letters themselves are SVG paths in `NeonSign.tsx` and would stay code.

That is what was built: `NeonSignHero` moves the ref inside, the layout (`flex-1 flex flex-col items-center justify-center`) moved into the block, and `src/app/page.tsx` reads `content/pages/home.mdx`. What is lost is the ability to edit the sign's shape or the spark physics in the studio, which were never going to be fields anyway.

## Header row and canvas zoom

The three bars above Puck and Puck's own header are one 40 px row (`studio/Header.tsx`), installed with `overrides.header`; `overrides.headerActions` still supplies Save to preview and Promote to live, which arrive in the row as `actions`. The status pill shows the short state; clicking it opens the full publish line, Open preview and the Vercel sign-in note. Measured at 1440x900: 185 px (118 px of studio bars plus Puck's 67 px header) before, 40 px after.

Canvas zoom (`studio/CanvasZoom.tsx`): Puck 0.24 keeps the canvas scale in its internal store (`zoomConfig.zoom`), not in `ui.viewports`, and has no public setter. The control finds that store through React's fiber tree and calls its `setZoomConfig`, so Puck scales the canvas and drag-and-drop uses the same number. Steps are 25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200 %, plus Fit. Ctrl or Cmd with the wheel over the canvas (also inside the canvas iframe) steps the zoom and calls `preventDefault`; Ctrl+0 returns to Fit; Ctrl+plus and Ctrl+minus step over the canvas. When the scaled page is wider than the frame, the frame scrolls sideways with a drawn scrollbar (a native one would shrink the frame, and Puck resets the zoom whenever the frame resizes). Puck resets the zoom to Fit on viewport-width changes and sidebar changes. A Puck upgrade that renames `zoomConfig` makes the control disappear rather than break the editor.

## Prose in place

The Markdown field is `contentEditable`, so Puck hands the block its inline-text element instead of the string. `src/components/blocks/Markdown.tsx` reads the Markdown from that element's `value`, renders it with react-markdown as the site does, and on click swaps in the element: a `contenteditable="plaintext-only"` span styled pre-wrap that shows the raw Markdown. Puck writes the span's text back into the field on each input, so the Markdown is edited as text and never re-serialised. This is approach (a); a Markdown-aware rich editor (marked plus turndown, or Tiptap) rewrites syntax (bullets, emphasis markers, wrapping) and cannot keep a byte-identical file, so it was not used.

Behaviour: click puts the caret near the clicked word; Escape or clicking elsewhere returns to the rendered view; Enter inserts a blank line (`

`) in a paragraph or heading and a single newline inside a list item, a list continuation, a fenced code block, a table row or a quote, and on an empty line; Shift+Enter is left to the browser (not tested). Undo through Puck's history was not tested with this block. The side pane shows a Source button for a selected Markdown block; it opens the plain textarea.
