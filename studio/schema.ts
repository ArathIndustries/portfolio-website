/**
 * The schema side of the block registry: fields, defaults and documentation
 * for every block in src/components/blocks/index.ts. No React here, so the
 * MDX converters can load this file under plain Node.
 *
 * Rule: a component without an entry here cannot appear on a page. The
 * converter fails loudly on any JSX tag not listed below.
 */
import type { Fields } from "@puckeditor/core";

export type Editing = "in-place" | "side-pane" | "mixed";

export interface BlockSchema {
  /** One line shown in the editor and the README. */
  description: string;
  /** Where the editing happens for this block. */
  editing: Editing;
  category: "Site" | "Text" | "Data" | "Showcase";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: Fields<any>;
  defaultProps: Record<string, unknown>;
  /**
   * MDX shape adapter. `childrenAs` means the MDX form is
   * <Block><Child .../><Child .../></Block> and the Puck form is an array
   * prop; the converters translate both ways.
   */
  mdx?: { childrenAs: { child: string; prop: string } };
}

const text = (contentEditable = false, placeholder?: string) =>
  ({ type: "text", contentEditable, placeholder }) as const;
const textarea = (contentEditable = false, placeholder?: string) =>
  ({ type: "textarea", contentEditable, placeholder }) as const;
const number = (min?: number, max?: number) => ({ type: "number", min, max }) as const;

export const blockSchemas: Record<string, BlockSchema> = {
  // ---------------------------------------------------------------- Site
  Timeline: {
    description: "The site's project timeline (src/components/Timeline.tsx). Items edited in the side pane.",
    editing: "side-pane",
    category: "Site",
    mdx: { childrenAs: { child: "TimelineItem", prop: "items" } },
    fields: {
      items: {
        type: "array",
        getItemSummary: (item: { date?: string; title?: string }) => `${item.date || ""} ${item.title || ""}`.trim() || "Item",
        arrayFields: {
          date: text(),
          title: text(),
          description: textarea(),
          status: { type: "select", options: [{ label: "completed", value: "completed" }, { label: "current", value: "current" }, { label: "future", value: "future" }] },
        },
        defaultItemProps: { date: "2026", title: "Milestone", description: "", status: "completed" },
      },
    },
    defaultProps: {
      items: [
        { date: "Jan 2026", title: "Started", description: "First commit.", status: "completed" },
        { date: "Now", title: "In progress", description: "Where things stand.", status: "current" },
      ],
    },
  },
  NeonCard: {
    description: "The site's neon tube card (src/components/neon/NeonTubeCard.tsx) with title and body.",
    editing: "in-place",
    category: "Site",
    fields: { tag: text(), title: text(true, "Title"), body: textarea(true, "Body") },
    defaultProps: { tag: "CARD", title: "Neon tube card", body: "The glow follows the real component's SVG tube segments." },
  },
  Sparks: {
    description: "The home page's spark/flashlight overlay (src/components/neon/SparkCanvas.tsx). Darkens the page except near the cursor. One per page.",
    editing: "side-pane",
    category: "Site",
    fields: { enabled: { type: "radio", options: [{ label: "on", value: true }, { label: "off", value: false }] } },
    defaultProps: { enabled: false },
  },
  // ---------------------------------------------------------------- Text
  Markdown: {
    description: "A run of Markdown prose. This is what plain text between components becomes on disk.",
    editing: "side-pane",
    category: "Text",
    fields: { text: textarea(false, "Write Markdown…") },
    defaultProps: { text: "## Heading\n\nA paragraph of **Markdown**." },
  },
  Hero: {
    description: "Page opener: title, subtitle, one call-to-action.",
    editing: "mixed",
    category: "Text",
    fields: { title: text(true, "Title"), subtitle: textarea(true, "Subtitle"), ctaLabel: text(), ctaHref: text() },
    defaultProps: { title: "Headline", subtitle: "One sentence under it.", ctaLabel: "View Work", ctaHref: "/work" },
  },
  Callout: {
    description: "Boxed aside with a tone (note, warning, success).",
    editing: "mixed",
    category: "Text",
    fields: {
      tone: { type: "select", options: [{ label: "note", value: "note" }, { label: "warning", value: "warning" }, { label: "success", value: "success" }] },
      title: text(true, "Title"),
      body: textarea(true, "Body"),
    },
    defaultProps: { tone: "note", title: "Heads up", body: "Something worth knowing." },
  },
  TwoColumn: {
    description: "Two Markdown columns with a ratio; stacks on phones.",
    editing: "side-pane",
    category: "Text",
    fields: {
      ratio: { type: "select", options: [{ label: "1:1", value: "1:1" }, { label: "2:1", value: "2:1" }, { label: "1:2", value: "1:2" }] },
      left: textarea(),
      right: textarea(),
    },
    defaultProps: { ratio: "1:1", left: "### Left\n\nText.", right: "### Right\n\nText." },
  },
  Divider: {
    description: "Neon hairline with an optional label.",
    editing: "side-pane",
    category: "Text",
    fields: { label: text() },
    defaultProps: { label: "" },
  },
  CodeBlock: {
    description: "Code with a language tag and optional filename.",
    editing: "side-pane",
    category: "Text",
    fields: { language: text(), filename: text(), code: textarea() },
    defaultProps: { language: "python", filename: "", code: "print('hello')" },
  },
  Figure: {
    description: "Image with caption.",
    editing: "mixed",
    category: "Text",
    fields: { src: text(false, "/images/…"), alt: text(), caption: text(true, "Caption"), maxWidth: number(100, 2000) },
    defaultProps: { src: "/images/digital-twin-poster.png", alt: "", caption: "Caption", maxWidth: 800 },
  },
  Stats: {
    description: "Row of big numbers with labels.",
    editing: "side-pane",
    category: "Data",
    fields: {
      items: {
        type: "array",
        getItemSummary: (item: { value?: string; label?: string }) => `${item.value || ""} ${item.label || ""}`.trim() || "Stat",
        arrayFields: { value: text(), label: text() },
        defaultItemProps: { value: "0", label: "label" },
      },
    },
    defaultProps: { items: [{ value: "116", label: "tests" }, { value: "33", label: "pages" }, { value: "17", label: "blocks" }] },
  },
  // ---------------------------------------------------------------- Showcase
  PlotlyChart: {
    description: "Interactive chart from a Plotly figure JSON written by Python (fig.write_json). plotly.js loads on demand.",
    editing: "side-pane",
    category: "Showcase",
    fields: { title: text(), src: text(false, "/studio-examples/figure.json"), height: number(200, 1200) },
    defaultProps: { title: "", src: "/studio-examples/figure.json", height: 420 },
  },
  MapBlock: {
    description: "MapLibre GL map, free demo tiles, markers from a list.",
    editing: "side-pane",
    category: "Showcase",
    fields: {
      lat: number(-90, 90),
      lng: number(-180, 180),
      zoom: number(0, 20),
      height: number(200, 1200),
      markers: {
        type: "array",
        getItemSummary: (m: { label?: string }) => m.label || "Marker",
        arrayFields: { label: text(), lat: number(-90, 90), lng: number(-180, 180) },
        defaultItemProps: { label: "Marker", lat: 29.8884, lng: -97.9384 },
      },
    },
    defaultProps: { lat: 29.8884, lng: -97.9384, zoom: 6, height: 420, markers: [{ label: "Texas State University", lat: 29.8884, lng: -97.9384 }] },
  },
  Scrolly: {
    description: "Scrollytelling: steps scroll past a sticky graphic that changes with the step in view.",
    editing: "side-pane",
    category: "Showcase",
    fields: {
      steps: {
        type: "array",
        getItemSummary: (s: { heading?: string }) => s.heading || "Step",
        arrayFields: { heading: text(), text: textarea(), image: text(false, "optional /images/…"), accent: text(false, "optional CSS color") },
        defaultItemProps: { heading: "Step", text: "What happens here.", image: "", accent: "" },
      },
    },
    defaultProps: {
      steps: [
        { heading: "Start", text: "The reader scrolls; the panel on the right follows.", image: "", accent: "#1a0e05" },
        { heading: "Middle", text: "Each step can swap in an image or a color.", image: "", accent: "#0b1a1f" },
        { heading: "End", text: "Steps are an array field in the side pane.", image: "", accent: "#1f0b1a" },
      ],
    },
  },
  ThreeBlock: {
    description: "3D torus knot (three.js via @react-three/fiber). Two numeric fields p and q change the knot.",
    editing: "side-pane",
    category: "Showcase",
    fields: { p: number(1, 12), q: number(1, 12), height: number(200, 1200) },
    defaultProps: { p: 2, q: 3, height: 420 },
  },
  DataTable: {
    description: "Table from a CSV path.",
    editing: "side-pane",
    category: "Data",
    fields: { caption: text(), src: text(false, "/studio-examples/table.csv"), maxRows: number(1, 500) },
    defaultProps: { caption: "", src: "/studio-examples/table.csv", maxRows: 50 },
  },
  Embed: {
    description: "Iframe restricted to an allowlist of hosts (see src/components/blocks/Embed.tsx).",
    editing: "side-pane",
    category: "Showcase",
    fields: { title: text(), url: text(false, "https://…"), height: number(100, 1600) },
    defaultProps: { title: "", url: "", height: 400 },
  },
};

export const blockNames = Object.keys(blockSchemas);

/** Names that may appear as children of a block (not blocks themselves). */
export const childElementNames = new Set(
  Object.values(blockSchemas)
    .map((s) => s.mdx?.childrenAs.child)
    .filter((n): n is string => Boolean(n)),
);
