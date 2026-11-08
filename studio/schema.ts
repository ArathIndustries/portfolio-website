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
  NeonSignHero: {
    description:
      "The home page: neon sign, spark overlay, tagline and two call-to-action links (src/components/blocks/NeonSignHero.tsx). The sign and sparks are code; only the text and links are fields. One per page.",
    editing: "mixed",
    category: "Site",
    fields: {
      tagline: text(true, "Tagline"),
      primaryLabel: text(),
      primaryHref: text(),
      secondaryLabel: text(),
      secondaryHref: text(),
    },
    defaultProps: {
      tagline: "Forged by Arath. Built for how you work.",
      primaryLabel: "View Work",
      primaryHref: "/work",
      secondaryLabel: "Hire Me",
      secondaryHref: "/contact",
    },
  },
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
  StudioIntro: {
    description: "About-page opener: flickering title, lead sentence and a bordered statement (src/components/blocks/StudioIntro.tsx).",
    editing: "mixed",
    category: "Site",
    fields: { title: text(true, "Title"), lead: textarea(true, "Lead"), quote: textarea(true, "Statement") },
    defaultProps: { title: "Studio name", lead: "One sentence about what the studio does.", quote: "A statement the studio stands behind." },
  },
  CardGrid: {
    description: "Heading over a two-column grid of dark cards, each with an orange title and grey text.",
    editing: "side-pane",
    category: "Site",
    fields: {
      heading: text(),
      items: {
        type: "array",
        getItemSummary: (item: { title?: string }) => item.title || "Card",
        arrayFields: { title: text(), description: textarea() },
        defaultItemProps: { title: "Card title", description: "What it covers." },
      },
    },
    defaultProps: { heading: "What We Build", items: [{ title: "Card title", description: "What it covers." }] },
  },
  CtaPanel: {
    description: "Centered panel with a paragraph and one neon button.",
    editing: "side-pane",
    category: "Site",
    fields: { body: textarea(), label: text(), href: text() },
    defaultProps: { body: "A sentence that leads to the button.", label: "Learn more", href: "/" },
  },
  PageHeader: {
    description: "Flickering page title with a grey introduction under it (src/components/blocks/PageHeader.tsx).",
    editing: "in-place",
    category: "Site",
    fields: { title: text(true, "Title"), intro: textarea(true, "Introduction") },
    defaultProps: { title: "Page title", intro: "One or two sentences that say what the page holds." },
  },
  BulletList: {
    description: "Heading over a list whose bullets are small neon dots.",
    editing: "side-pane",
    category: "Site",
    fields: {
      heading: text(),
      items: {
        type: "array",
        getItemSummary: (item: { text?: string }) => item.text || "Item",
        arrayFields: { text: text() },
        defaultItemProps: { text: "Item" },
      },
    },
    defaultProps: { heading: "What I can help with", items: [{ text: "First item" }, { text: "Second item" }] },
  },
  ContactForm: {
    description: "Name, email and message form posted to a Formspree endpoint; shows a thank-you panel after sending (src/components/blocks/ContactForm.tsx).",
    editing: "side-pane",
    category: "Site",
    fields: { action: text(false, "https://formspree.io/f/…"), messagePlaceholder: text(), buttonLabel: text(), successTitle: text(), successBody: textarea() },
    defaultProps: {
      action: "https://formspree.io/f/xkoqlqkz",
      messagePlaceholder: "Tell me about your project...",
      buttonLabel: "Send Message",
      successTitle: "Message sent",
      successBody: "Thanks for reaching out. I'll get back to you soon.",
    },
  },
  ContactLinks: {
    description: "Rule, a short line and a row of plain text links; mailto links open in place, others in a new tab.",
    editing: "side-pane",
    category: "Site",
    fields: {
      intro: text(),
      links: {
        type: "array",
        getItemSummary: (item: { label?: string }) => item.label || "Link",
        arrayFields: { label: text(), href: text(false, "https://… or mailto:…") },
        defaultItemProps: { label: "Link", href: "https://" },
      },
    },
    defaultProps: { intro: "Or reach out directly:", links: [{ label: "Email", href: "mailto:me@example.com" }] },
  },
  BackLink: {
    description: "Small grey link with a left arrow, placed above a page title.",
    editing: "side-pane",
    category: "Site",
    fields: { href: text(), label: text() },
    defaultProps: { href: "/about", label: "Back" },
  },
  PageTitle: {
    description: "Page title with the neon glow and extra space below it (no flicker).",
    editing: "in-place",
    category: "Site",
    fields: { title: text(true, "Title") },
    defaultProps: { title: "Page title" },
  },
  LeadProse: {
    description: "Story text: paragraphs separated by a blank line, the first one larger.",
    editing: "side-pane",
    category: "Site",
    fields: { text: textarea(false, "Paragraphs separated by a blank line") },
    defaultProps: { text: "A larger opening paragraph.\n\nA second paragraph." },
  },
  SkillsJourney: {
    description: "Heading and subtitle over the interactive skills timeline (src/components/SkillsTimeline.tsx). The eras and skills are code.",
    editing: "side-pane",
    category: "Site",
    fields: { title: text(), subtitle: text() },
    defaultProps: { title: "The Journey", subtitle: "from circuits to shipping products" },
  },
  CredentialCard: {
    description: "Heading over one credential: badge image, name, issuing body and validity dates.",
    editing: "side-pane",
    category: "Site",
    fields: { heading: text(), image: text(false, "/image.png"), alt: text(), title: text(), issuer: text(), dates: text() },
    defaultProps: { heading: "Credentials", image: "/iise-six-sigma-green-belt.png", alt: "Badge", title: "Credential name", issuer: "Issuing body", dates: "Issued 2026" },
  },
  LinkButtons: {
    description: "Heading over a row of neon buttons; mailto and root-relative links open in place, others in a new tab.",
    editing: "side-pane",
    category: "Site",
    fields: {
      heading: text(),
      links: {
        type: "array",
        getItemSummary: (item: { label?: string }) => item.label || "Button",
        arrayFields: {
          label: text(),
          href: text(false, "https://… , mailto:… or /path"),
          variant: { type: "select", options: [{ label: "outline", value: "outline" }, { label: "filled", value: "filled" }] },
          icon: { type: "select", options: [{ label: "none", value: "none" }, { label: "document", value: "document" }] },
        },
        defaultItemProps: { label: "Button", href: "https://", variant: "outline", icon: "none" },
      },
    },
    defaultProps: { heading: "Connect", links: [{ label: "GitHub", href: "https://github.com/", variant: "outline", icon: "none" }] },
  },
  ResumeViewer: {
    description: "Full-width PDF viewer: back link and title on the left, download button on the right, the PDF in a frame below (src/components/blocks/ResumeViewer.tsx). The PDF is a file in public/.",
    editing: "side-pane",
    category: "Site",
    fields: { backHref: text(), backLabel: text(), title: text(), pdf: text(false, "/file.pdf"), downloadLabel: text(), frameTitle: text() },
    defaultProps: { backHref: "/founder", backLabel: "Founder", title: "Resume", pdf: "/Sergio_Arath_Guzman_Resume.pdf", downloadLabel: "Download PDF", frameTitle: "Resume Preview" },
  },
  WorkIndex: {
    description: "The /work index (src/components/blocks/WorkIndex.tsx): heading, intro, a list/grid toggle, large cards and compact cards. Card text comes from the projects collection when the page renders (src/lib/workCards.ts); the fields choose the headings and the order of slugs. One per page.",
    editing: "side-pane",
    category: "Site",
    fields: {
      heading: text(),
      intro: textarea(),
      otherHeading: text(),
      featured: {
        type: "array",
        getItemSummary: (item: { slug?: string }) => item.slug || "Project",
        arrayFields: { slug: text(false, "project slug") },
        defaultItemProps: { slug: "" },
      },
      others: {
        type: "array",
        getItemSummary: (item: { slug?: string }) => item.slug || "Project",
        arrayFields: { slug: text(false, "project slug") },
        defaultItemProps: { slug: "" },
      },
    },
    defaultProps: { heading: "Projects", intro: "A collection of tools, platforms, and research.", otherHeading: "Other Work", featured: [{ slug: "openchambers" }], others: [{ slug: "modulab" }] },
  },
  NotesIndex: {
    description: "The notes index (src/components/blocks/NotesIndex.tsx): heading, intro and the chronological list of notes, which is computed from the notes collection when the page renders. One per page.",
    editing: "mixed",
    category: "Site",
    fields: { heading: text(true, "Heading"), intro: textarea(true, "Introduction"), emptyText: text(), basePath: text(false, "/forged/notes") },
    defaultProps: { heading: "Forged Notes", intro: "Working notes from the workshop.", emptyText: "In the forge — first note coming soon.", basePath: "/forged/notes" },
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
  Quote: {
    description: "Pull quote with an author line. Both editable in place.",
    editing: "in-place",
    category: "Text",
    fields: { quote: textarea(true, "Quote"), author: text(true, "Author") },
    defaultProps: { quote: "Something worth repeating.", author: "Someone" },
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
