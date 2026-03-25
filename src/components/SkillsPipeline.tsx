"use client";

import { useState, useRef } from "react";

interface PipelineStage {
  years: string;
  title: string;
  summary: string;
  skills: string[];
}

const stages: PipelineStage[] = [
  {
    years: "2015–2016",
    title: "Civil Design",
    summary: "associates degree → CAD → structural fundamentals",
    skills: ["CAD Drafting", "Structural Systems", "Construction Documents", "Site Design", "Technical Drawing", "Blueprint Reading"],
  },
  {
    years: "2017–2018",
    title: "Community College",
    summary: "core academics → math → sciences",
    skills: ["Calculus", "Physics", "Chemistry", "Technical Writing", "Statistics Foundations"],
  },
  {
    years: "2019–2021",
    title: "Electronics",
    summary: "circuits → soldering → signal fundamentals",
    skills: ["Circuit Design", "Soldering & Prototyping", "Assembly Language", "C Programming", "Signal Processing Basics", "Electronic Systems", "Oscilloscopes & Multimeters", "Power Systems"],
  },
  {
    years: "2021–now",
    title: "Civil Engineering",
    summary: "professional design → substations → project coordination",
    skills: ["Civil Engineering Design", "Power Substation Schematics", "Project Coordination", "Stormwater & Drainage", "Utility Design", "Permitting & Compliance", "Client Communication", "Team Collaboration"],
  },
  {
    years: "2025–now",
    title: "Industrial Engineering",
    summary: "systems thinking → process improvement → quality",
    skills: ["Statistical Process Control (SPC)", "DMAIC Methodology", "Quality Engineering", "Minitab", "Process Improvement", "Systems Thinking", "Operations Research", "Lean Manufacturing"],
  },
  {
    years: "2025–now",
    title: "Programming & Data",
    summary: "Python → web frameworks → databases → visualization",
    skills: ["Python", "JavaScript", "TypeScript", "HTML/CSS", "SQL", "React", "Next.js", "FastAPI", "Tailwind CSS", "PostgreSQL", "Supabase", "Plotly.js", "Leaflet.js", "GeoJSON", "PapaParse", "Web Scraping", "REST API Design", "MDX"],
  },
  {
    years: "2025–now",
    title: "AI & Edge Computing",
    summary: "ML pipelines → LLMs → microcontroller inference",
    skills: ["TensorFlow", "TFLite Micro", "Convolutional Neural Networks (CNNs)", "INT8 Quantization", "Fast Fourier Transform (FFT)", "Mel-Spectrograms", "Prompt Engineering", "Large Language Model (LLM) Integration", "AI Summarization", "Document Extraction", "Edge Inference", "Arduino", "ESP32", "STM32", "Bluetooth Low Energy (BLE)", "Acoustic Emission Sensors"],
  },
  {
    years: "2025–now",
    title: "Shipping Products",
    summary: "containers → CI/CD → production monitoring",
    skills: ["Docker", "Vercel", "Render", "GitHub Actions", "Git", "CI/CD Pipelines", "Automated Scheduling", "Service Monitoring", "Watchdog Systems", "Environment Management", "Formspree", "Resend Email", "WebSocket"],
  },
];

export function SkillsPipeline() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollTo(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-stage]") as HTMLElement;
    if (!card) return;
    const scrollAmount = card.offsetWidth + 16;
    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }

  function toggleExpand(idx: number) {
    setExpanded(expanded === idx ? null : idx);
  }

  return (
    <div className="relative">
      {/* Navigation arrows */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => scrollTo("left")}
          className="p-2 rounded transition-colors"
          style={{ color: 'rgba(255,136,0,0.5)', border: '1px solid rgba(255,136,0,0.15)' }}
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={() => scrollTo("right")}
          className="p-2 rounded transition-colors"
          style={{ color: 'rgba(255,136,0,0.5)', border: '1px solid rgba(255,136,0,0.15)' }}
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {stages.map((stage, idx) => (
          <div key={idx} className="flex items-start snap-start shrink-0" data-stage>
            {/* Card */}
            <button
              onClick={() => toggleExpand(idx)}
              className="text-left rounded-lg border transition-all duration-200 cursor-pointer"
              style={{
                width: '260px',
                background: expanded === idx ? 'rgba(255,136,0,0.04)' : 'rgba(13,11,10,0.6)',
                borderColor: expanded === idx ? 'rgba(255,136,0,0.4)' : 'rgba(255,255,255,0.06)',
                boxShadow: expanded === idx ? '0 0 15px rgba(255,136,0,0.08)' : 'none',
              }}
            >
              <div className="p-5">
                {/* Year label */}
                <span
                  className="font-mono text-xs tracking-widest block mb-2"
                  style={{ color: 'rgba(255,136,0,0.4)' }}
                >
                  {stage.years}
                </span>
                <h3
                  className="font-mono font-semibold text-sm mb-1"
                  style={{ color: expanded === idx ? 'rgba(255,136,0,0.9)' : 'rgba(255,255,255,0.8)' }}
                >
                  {stage.title}
                </h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {stage.summary}
                </p>

                <div className="flex items-center gap-1 mt-3" style={{ color: 'rgba(255,136,0,0.4)' }}>
                  <span className="text-xs font-mono">{expanded === idx ? 'collapse' : `${stage.skills.length} skills`}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3 transition-transform"
                    style={{ transform: expanded === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {expanded === idx && (
                <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,136,0,0.1)' }}>
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {stage.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 text-xs rounded font-mono"
                        style={{ background: 'rgba(255,136,0,0.08)', color: 'rgba(255,136,0,0.7)' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>

            {/* Arrow connector */}
            {idx < stages.length - 1 && (
              <div className="flex items-center px-2 pt-8 shrink-0">
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                  <path
                    d="M0 6h20m0 0l-4-4m4 4l-4 4"
                    stroke="rgba(255,136,0,0.25)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        [class*="overflow-x-auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
