"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NeonTubeCard } from "@/components/neon";

const featuredProjects = [
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

const otherProjects = [
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

export default function WorkPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <header className="mb-12 flex items-start justify-between" data-grid-node="heading">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text neon-flicker">Projects</h1>
          <p className="white-neon max-w-2xl" data-responds-to="heading">
            A collection of tools, platforms, and research spanning engineering, AI, and automation.
          </p>
        </div>
        {/* View Toggle */}
        <button
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="text-gray-500 hover:text-[var(--neon)] transition-colors p-2 mt-1"
          aria-label={`Switch to ${viewMode === "list" ? "grid" : "list"} view`}
        >
          {viewMode === "list" ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          )}
        </button>
      </header>

      {/* Featured projects */}
      <div className="space-y-8">
        {featuredProjects.map((project, i) => (
          <Link key={project.slug} href={`/work/${project.slug}`} className="block">
          <NeonTubeCard cardIndex={i} className="cursor-pointer">
            {/* Live iframe preview */}
            {project.embed && (
              <div className="relative w-full" style={{ height: '400px' }}>
                <iframe
                  src={project.embed}
                  title={`${project.title} — Live Preview`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
                {/* Overlay to prevent accidental interaction — click "Visit" to use */}
                <div className="absolute inset-0 bg-transparent" />
                {/* Fade to card */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                  style={{ background: 'linear-gradient(transparent, rgba(13,11,10,0.9))' }}
                />
              </div>
            )}

            {/* No embed, but a poster/still image — show it instead */}
            {!project.embed && project.image && (
              <div className="relative w-full overflow-hidden" style={{ height: '400px', background: 'rgba(255,136,0,0.02)' }}>
                <Image
                  src={project.image}
                  alt={`${project.title} — poster`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
                {/* Fade to card, matching the embed treatment */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                  style={{ background: 'linear-gradient(transparent, rgba(13,11,10,0.9))' }}
                />
              </div>
            )}

            {/* No embed and no image — placeholder */}
            {!project.embed && !project.image && (
              <div
                className="w-full flex items-center justify-center"
                style={{ height: '180px', background: 'rgba(255,136,0,0.02)', borderBottom: '1px solid rgba(255,136,0,0.06)' }}
              >
                <span className="text-gray-700 font-mono text-sm">In Development</span>
              </div>
            )}

            {/* Project info */}
            <div className="p-6">
              <h3 className="font-mono font-semibold text-xl mb-2 text-gray-200 white-neon" data-responds-to={`card-${i}`}>
                {project.title}
              </h3>
              <p className="text-sm mb-4 white-neon" data-responds-to={`card-${i}`}>
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded font-mono"
                      style={{ background: 'rgba(255,136,0,0.08)', color: 'rgba(255,136,0,0.7)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="neon-btn text-xs font-mono px-4 py-2 inline-flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Code
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="neon-btn-filled text-xs font-mono px-4 py-2 inline-flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      Visit
                    </a>
                  )}
                </div>
              </div>
            </div>
          </NeonTubeCard>
          </Link>
        ))}
      </div>

      {/* Other work — compact cards */}
      <section className="mt-16">
        <h2 className="text-xl sm:text-2xl font-bold font-mono mb-6 neon-text">Other Work</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {otherProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="block p-5 rounded-lg border border-[rgba(255,136,0,0.12)] hover:border-[rgba(255,136,0,0.35)] bg-[rgba(255,136,0,0.02)] transition-colors"
            >
              <h3 className="font-mono font-semibold text-base mb-1 text-gray-200">
                {project.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded font-mono"
                    style={{ background: 'rgba(255,136,0,0.08)', color: 'rgba(255,136,0,0.7)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
