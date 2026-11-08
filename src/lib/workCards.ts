/**
 * Card text for the /work index, keyed by project slug. The index block
 * lists a card only when content/projects/<slug>.mdx exists, so deleting a
 * project removes its card; the order comes from the page's fields.
 */
export interface WorkEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  live?: string;
  embed?: string;
  image?: string;
}

const featured: WorkEntry[] = [
  {
    slug: "openchambers",
    title: "OpenChambers",
    description: "1,961 public meetings scraped across 28 Texas agencies and AI-summarized for 50+ users — 11 custom scrapers covering 150+ government portals.",
    tags: ["Python", "FastAPI", "AI", "Supabase"],
    github: "https://github.com/ArathIndustries/openchambers",
    live: "https://openchambers.vercel.app/welcome",
    embed: "https://openchambers.vercel.app",
  },
  {
    slug: "datathon-water",
    title: "Texas Water Crisis Dashboard",
    description: "Water stress across 254 Texas counties projected to 2070 — five IE frameworks pinpointing where industrial growth collides with supply. Delivered at datathon competition.",
    tags: ["JavaScript", "Plotly.js", "Data Viz"],
    github: "https://github.com/ArathIndustries/datathon-water-analysis",
    live: "https://datathon-water-analysis.vercel.app",
    embed: "https://datathon-water-analysis.vercel.app",
  },
  {
    slug: "digital-twin",
    title: "Digital Twin — CNC Monitoring",
    description: "Wireless sensor network with TinyML for real-time CNC machine health monitoring.",
    tags: ["Arduino", "TFLite", "Python", "BLE"],
    image: "/images/digital-twin-poster.png",
  },
  {
    slug: "portfolio-website",
    title: "Portfolio Website (Arath Industries)",
    description: "Dark neon sign portfolio with interactive SVG animations and light-reactive brick wall.",
    tags: ["Next.js", "React", "Tailwind CSS", "Canvas"],
    github: "https://github.com/ArathIndustries/portfolio-website",
    live: "https://arathindustries.com",
    embed: "https://arath-industries.vercel.app",
  },
];

const others: WorkEntry[] = [
  {
    slug: "modulab",
    title: "modulab",
    description: "Physical sensor modules driving live 3D physics scenes in the browser — Web Serial and Web Bluetooth in, JSON scene documents out. No install, no build step, in-app scene editor.",
    tags: ["JavaScript", "Three.js", "Web Serial", "Web Bluetooth"],
  },
  {
    slug: "powder-of-life",
    title: "Powder Of Life — Nano 33 BLE Port",
    description: "Open-source fork porting a physical-computing library from 8-bit AVR to the nRF52840 — three type-width bugs and one Unity serial defect that silently blocked all data. Confirmed on hardware.",
    tags: ["Arduino", "C++", "Unity", "Open Source"],
  },
  {
    slug: "thinking-narrator",
    title: "Thinking Narrator",
    description: "Reads Claude Code's extended thinking aloud near-live — neural voices, karaoke word tracking, session replay. Localhost web player built v1 to v8 in one day.",
    tags: ["Python", "TTS", "Web Audio", "Claude Code"],
    github: "https://github.com/ArathIndustries/thinking-narrator",
  },
  {
    slug: "pm-simulator",
    title: "PM Flight Simulator",
    description: "Browser project-management simulator where rework-cycle and Monte Carlo dynamics make schedule slip and quality debt cascade realistically. 116 passing engine tests; every mechanic traces to a published model.",
    tags: ["TypeScript", "React", "Simulation", "System Dynamics"],
  },
  {
    slug: "wdwtwa-site",
    title: "WDWTWA Collective Site",
    description: "One-day WordPress-to-Next.js rebuild for a music collective — Discord-to-site publishing pipeline, interactive 3D gallery, design system derived from the collective's stamp art.",
    tags: ["Next.js", "Three.js", "Discord API", "Vercel"],
  },
  {
    slug: "tceq-geowatcher",
    title: "TCEQ Permit Geowatcher",
    description: "Geospatial permit tracking with LLM-powered data extraction from TCEQ records.",
    tags: ["Python", "FastAPI", "Leaflet.js"],
  },
  {
    slug: "clarityos",
    title: "ClarityOS",
    description: "Comprehensive operating system design from first principles — Consumer and Enterprise editions.",
    tags: ["OS Design", "Linux", "Architecture"],
  },
  {
    slug: "ai-assistant",
    title: "AI Executive Function Assistant",
    description: "Personal AI assistant with Discord interface and local LLM for task management and executive function support.",
    tags: ["Python", "Discord", "Ollama", "LLM"],
  },
  {
    slug: "ai-agents",
    title: "AI Agent Network",
    description: "Dockerized multi-agent system with Agent Zero and OpenClaw for inter-agent communication.",
    tags: ["Docker", "AI Agents", "Python"],
  },
  {
    slug: "file-explorer",
    title: "File Explorer App",
    description: "Cross-platform file browser built with Tauri and React — clean, minimal, and extensible.",
    tags: ["Tauri", "React", "Rust"],
  },
];

export const workCards: Record<string, WorkEntry> = Object.fromEntries([...featured, ...others].map((e) => [e.slug, e]));
