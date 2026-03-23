"use client";

import { useState } from "react";
import Link from "next/link";

// Placeholder projects — replace with MDX content later
const projects = [
  {
    slug: "openchambers",
    title: "OpenChambers",
    description: "Municipal meeting intelligence platform — AI-powered summaries of TX public meetings.",
    tags: ["Python", "FastAPI", "AI", "Supabase"],
    github: "https://github.com/ArathIndustries/bd-monitor",
    live: "https://bd-monitor.vercel.app",
  },
  {
    slug: "datathon-water",
    title: "Texas Water Crisis Dashboard",
    description: "Interactive data visualization dashboard for Texas water infrastructure analysis.",
    tags: ["JavaScript", "Plotly.js", "Data Viz"],
    github: "https://github.com/ArathIndustries/datathon-water-analysis",
  },
  {
    slug: "digital-twin",
    title: "Digital Twin — CNC Monitoring",
    description: "Wireless sensor network with TinyML for real-time CNC machine health monitoring.",
    tags: ["Arduino", "TFLite", "Python", "BLE"],
  },
  {
    slug: "tceq-geowatcher",
    title: "TCEQ Permit Geowatcher",
    description: "Geospatial permit tracking with LLM-powered data extraction from TCEQ records.",
    tags: ["Python", "FastAPI", "Leaflet.js"],
  },
];

export default function WorkPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <header className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4 neon-text">Work</h1>
          <p className="text-gray-400 max-w-2xl">
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

      {/* Projects */}
      <div className={viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
        : "space-y-4"
      }>
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={project.live || project.github || `/work/${project.slug}`}
            target={project.live || project.github ? "_blank" : undefined}
            rel={project.live || project.github ? "noopener noreferrer" : undefined}
            className="block group"
          >
            <article
              className="p-6 rounded-lg border border-gray-800 hover:border-[var(--neon)] transition-all duration-200"
              style={{ background: 'rgba(13,11,10,0.6)' }}
            >
              {/* Placeholder thumbnail area for grid mode */}
              {viewMode === "grid" && (
                <div className="w-full h-32 rounded-md mb-4 flex items-center justify-center" style={{ background: 'rgba(255,0,170,0.03)', border: '1px solid rgba(255,0,170,0.08)' }}>
                  <span className="text-gray-700 font-mono text-xs">Preview</span>
                </div>
              )}

              <h3 className="font-mono font-semibold text-lg mb-2 text-gray-200 group-hover:text-[var(--neon)] transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded font-mono"
                    style={{ background: 'rgba(255,0,170,0.08)', color: 'rgba(255,0,170,0.7)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
