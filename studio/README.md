# Publishing studio (spike)

A small Puck editor that edits the site's MDX pages with the site's own React components. Pages stay MDX on disk; the studio converts MDX to Puck data on open and back on Publish. Built 2026-11-08 on branch `studio-spike` as a spike; the measured results are at the bottom.

## Run it

```
npm run studio          # editor on http://127.0.0.1:24044
npx next dev -p 24045 -H 127.0.0.1   # the site, for "open on site"
npm run studio:roundtrip             # MDX -> Puck -> MDX over every content file
py studio/examples/make_figure.py    # regenerate public/studio-examples/figure.json and table.csv
```

The editor loads `?file=showcase/studio-showcase.mdx` (any file under `content/`). Publish writes the MDX back to that file; nothing is committed or pushed.

Puck is installed as `@puckeditor/core@0.24.0`. The `@measured/puck` package name stopped at 0.20.2; 0.21 and later ship under `@puckeditor/core` (same project, MIT).

## Where things are

| Path | What |
|---|---|
| `src/components/blocks/*.tsx` | One file per block: the real component the site renders. |
| `src/components/blocks/index.ts` | `blockComponents` (name to component) and `mdxComponents` (plus child elements such as `TimelineItem`). The Next routes hand `mdxComponents` to MDXRemote. |
| `studio/schema.ts` | Fields, defaultProps, description and editing mode per block. No React, so the converters can load it under Node. |
| `studio/blocks.tsx` | The Puck config. Zips `blockComponents` and `blockSchemas`; throws at startup if a block exists on one side only. |
| `studio/convert/mdxToPuck.ts`, `puckToMdx.ts` | The converters. `roundtrip.ts` is the test. |
| `studio/vite.config.ts` | Vite app plus the file API (`/api/pages`, `/api/page`). Serves the site's `public/`. |
| `studio/App.tsx`, `main.tsx`, `studio.css` | The editor shell. `studio.css` imports `src/app/globals.css`, so the canvas uses the site's Tailwind theme. |
| `src/app/showcase/[slug]/page.tsx` | Renders `content/showcase/*.mdx`. Test route, unlinked. |
| `studio/screenshots/` | `capture.py` and the PNGs listed below. |

## Add a block

1. Write the component in `src/components/blocks/MyBlock.tsx`. Plain props, no `next/*` imports (the studio runs under Vite). Add `"use client"` if it uses effects or browser APIs; load heavy libraries with `import()` inside an effect or `React.lazy`.
2. Export it from `src/components/blocks/index.ts` (one line in `blockComponents`).
3. Add an entry to `studio/schema.ts` with `fields`, `defaultProps`, `description`, `editing`, `category`.

Done: the editor lists it, the converters accept `<MyBlock … />` in MDX, and every page route renders it. Measured on the last block (`Quote`): 18.6 s wall clock from first edit to the block rendering on the site and loading in the editor (12:57:04.6 to 12:57:23.2).

Rules the code enforces:

- A JSX tag in a page that has no schema entry makes `mdxToPuck` throw with the file and line. So does an `import`/`export`, a spread attribute, or children on a block that does not declare `childrenAs`.
- A schema entry without a component, or a component without a schema, makes `studio/blocks.tsx` throw at startup.

Field types used: `text` and `textarea` (with `contentEditable: true` for in-place editing), `number`, `select`, `radio`, `array` (with `arrayFields`, `defaultItemProps`, `getItemSummary`). Puck's field reference: https://puckeditor.com/docs/api-reference/fields.

## Blocks

Editing column: "in-place" means you click the text on the canvas and type; "side-pane" means the right panel; "mixed" is both.

| Block | What | Editing | Code-rich inside? |
|---|---|---|---|
| Timeline | The site's `Timeline` (`src/components/Timeline.tsx`). On disk it stays `<Timeline><TimelineItem … /></Timeline>`; in the editor it is an `items` array. | side-pane | existing site code, few fields |
| NeonCard | `NeonTubeCard` from `src/components/neon` with tag, title, body. | in-place | existing site code, few fields |
| Sparks | The home page `SparkCanvas` overlay. Fixed full-screen effect; one radio field. | side-pane | existing site code, one field |
| Markdown | A run of prose. This is what text between components becomes. Textarea in the side pane; rendered with react-markdown in the editor, with MDX on the site. | side-pane | no |
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

"Code-rich inside, few fields outside" is the pattern for the showcase blocks: the component owns the behaviour, the schema exposes three to five values. Everything with short text is editable in place; arrays and numbers are side-pane because Puck has no in-place widget for them.

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

Build: `npm run build` of the site with the `studio/` folder present: exit 0, 27 s wall clock at BelowNormal priority (compile 16.7 s), 47 static pages including `/showcase/studio-showcase`. `tsconfig.json` excludes `studio/` and `eslint.config.mjs` ignores it; the studio has its own `studio/tsconfig.json` (`npx tsc -p studio --noEmit` passes). `npm run lint` reports one pre-existing error in `src/components/neon/NeonGrid.tsx:1306` (`prefer-const`), unchanged from master.

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

Not verified or not done in this spike: publishing to a preview branch; the hub iframe; touch drag on a phone; the Markdown block's rich-text editing (it is a plain textarea, and the canvas preview uses react-markdown, which does not render MDX-only syntax such as inline JSX); syntax highlighting in CodeBlock; MapLibre's demo tiles and the Embed block load from the network when the page is viewed.

## Home page assessment

`src/app/page.tsx` is a 33-line client component with four pieces:

1. `SparkCanvas` with a shared `bridgeRef`: the fixed full-screen spark and flashlight overlay.
2. `NeonSign` with the same `bridgeRef`: the hand-drawn neon letters that report brightness dips and letter positions into the bridge so the sparks fly from the right places.
3. A tagline paragraph (`Forged by Arath. Built for how you work.`).
4. Two call-to-action links (`View Work`, `Hire Me`).

Pieces 3 and 4 are a `Hero`-shaped block today (title-less hero with subtitle and two CTAs; the current Hero has one CTA, so either add a second CTA pair or a `Buttons` block). Pieces 1 and 2 are the problem: they are two components joined by a mutable ref created in the page, and the ref is what makes the sparks follow the letters. A block boundary cannot pass a ref between two sibling blocks. The honest conversion is one block, `NeonSignHero`, that owns the ref and renders both `SparkCanvas` and `NeonSign` internally, with a field or two (tagline, CTA labels and hrefs) and nothing else editable. The letters themselves are SVG paths in `NeonSign.tsx` and would stay code.

What it would take: write `NeonSignHero` (about 20 lines, moving the ref inside), register it, convert the page to `content/pages/home.mdx` with `<NeonSignHero … />`, and make `src/app/page.tsx` read that file. The layout (`flex-1 flex flex-col items-center justify-center`) moves into the block. Nothing on the page is impossible as a block; what is lost is the ability to edit the sign's shape or the spark physics in the studio, which were never going to be fields anyway. Not done in this spike.
