"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Era {
  id: number;
  name: string;
  period: string;
  summary: string;
  skills: string[];
}

const eras: Era[] = [
  {
    id: 8,
    name: "Shipping Products",
    period: "2025 \u2014 PRESENT",
    summary: "containers \u2192 CI/CD \u2192 production monitoring",
    skills: [
      "Docker",
      "Vercel / Render",
      "GitHub Actions CI/CD",
      "Git",
      "Automated Scheduling",
      "Service Monitoring",
      "Watchdog Systems",
      "WebSocket",
      "Email Integration (Resend)",
    ],
  },
  {
    id: 7,
    name: "AI & Edge Computing",
    period: "2025 \u2014 PRESENT",
    summary: "ML pipelines \u2192 LLMs \u2192 microcontroller inference",
    skills: [
      "TensorFlow / TFLite Micro",
      "CNNs / INT8 Quantization",
      "FFT & Mel-Spectrograms",
      "Prompt Engineering",
      "LLM Integration",
      "AI Summarization",
      "Arduino / ESP32 / STM32",
      "Bluetooth Low Energy",
      "Acoustic Emission Sensors",
      "Edge Inference",
    ],
  },
  {
    id: 6,
    name: "Programming & Data",
    period: "2025 \u2014 PRESENT",
    summary: "Python \u2192 web frameworks \u2192 databases \u2192 visualization",
    skills: [
      "Python",
      "JavaScript / TypeScript",
      "React / Next.js",
      "FastAPI",
      "Tailwind CSS",
      "PostgreSQL / Supabase",
      "Plotly.js / Leaflet.js",
      "Web Scraping (11 scrapers)",
      "REST API Design",
      "SQL / GeoJSON / CSV",
    ],
  },
  {
    id: 5,
    name: "Industrial Engineering",
    period: "2025 \u2014 PRESENT",
    summary: "systems thinking \u2192 process improvement \u2192 quality",
    skills: [
      "Statistical Process Control",
      "DMAIC Methodology",
      "Quality Engineering",
      "Minitab",
      "Process Improvement",
      "Systems Thinking",
      "Operations Research",
      "Lean Manufacturing",
    ],
  },
  {
    id: 4,
    name: "Civil Engineering",
    period: "2021 \u2014 2026",
    summary: "professional design \u2192 substations \u2192 project coordination",
    skills: [
      "Civil Engineering Design",
      "Power Substation Schematics",
      "Project Coordination",
      "Stormwater & Drainage",
      "Utility Design",
      "Permitting & Compliance",
      "Client Communication",
      "Team Collaboration",
    ],
  },
  {
    id: 3,
    name: "Electronics",
    period: "2019 \u2014 2021",
    summary: "circuits \u2192 sensors \u2192 embedded systems",
    skills: [
      "Circuit Design",
      "Soldering & Prototyping",
      "Assembly Language",
      "C Programming",
      "Signal Processing",
      "Electronic Systems",
      "Oscilloscopes & Multimeters",
      "Power Systems",
    ],
  },
  {
    id: 2,
    name: "Community College",
    period: "2017 \u2014 2018",
    summary: "core academics \u2192 math \u2192 sciences",
    skills: [
      "Calculus",
      "Physics",
      "Chemistry",
      "Technical Writing",
      "Statistics Foundations",
    ],
  },
  {
    id: 1,
    name: "Civil Design",
    period: "2015 \u2014 2016",
    summary: "associates degree \u2192 CAD \u2192 structural fundamentals",
    skills: [
      "CAD Drafting",
      "Structural Systems",
      "Construction Documents",
      "Site Design",
      "Technical Drawing",
      "Blueprint Reading",
    ],
  },
];

export function SkillsTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const glowLineRef = useRef<HTMLDivElement>(null);
  const glowDotRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [activeItems, setActiveItems] = useState<Record<number, boolean>>({ 0: true });

  const toggleFlip = useCallback((index: number) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  useEffect(() => {
    function updateGlow() {
      const timeline = timelineRef.current;
      const glowLine = glowLineRef.current;
      const glowDot = glowDotRef.current;
      if (!timeline || !glowLine || !glowDot) {
        rafRef.current = requestAnimationFrame(updateGlow);
        return;
      }

      const rect = timeline.getBoundingClientRect();
      const timelineTop = rect.top + window.scrollY;
      const timelineHeight = rect.height;
      const scrollY = window.scrollY + window.innerHeight * 0.4;
      const progress = Math.max(0, Math.min(1, (scrollY - timelineTop) / timelineHeight));
      const glowHeight = progress * timelineHeight;

      glowLine.style.height = glowHeight + "px";
      glowDot.style.top = glowHeight + "px";

      const newActive: Record<number, boolean> = {};
      itemRefs.current.forEach((item, i) => {
        if (!item) return;
        const itemRect = item.getBoundingClientRect();
        const itemTop = itemRect.top + window.scrollY - timelineTop;
        newActive[i] = itemTop < glowHeight + 50;
      });

      setActiveItems((prev) => {
        // Only update if something changed
        for (let i = 0; i < eras.length; i++) {
          if (prev[i] !== newActive[i]) return newActive;
        }
        return prev;
      });

      rafRef.current = requestAnimationFrame(updateGlow);
    }

    rafRef.current = requestAnimationFrame(updateGlow);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <>
      <style>{`
        .st-timeline { position: relative; padding: 1rem 0; }

        .st-timeline::before {
          content: '';
          position: absolute;
          left: 50%; transform: translateX(-50%);
          top: 0; bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, transparent 0%, rgba(255,136,0,0.15) 3%, rgba(255,136,0,0.15) 97%, transparent 100%);
          filter: blur(1.5px);
        }

        .st-glow-line {
          position: absolute;
          left: 50%; transform: translateX(-50%);
          top: 0; width: 2px; height: 0;
          background: linear-gradient(180deg, #FF8800 0%, rgba(255,136,0,0.5) 60%, transparent 100%);
          box-shadow: 0 0 12px rgba(255,136,0,0.4), 0 0 24px rgba(255,136,0,0.2);
          transition: height 0.15s ease-out;
        }

        .st-glow-dot {
          position: absolute;
          left: 50%; transform: translate(-50%, -50%);
          width: 10px; height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, #FF8800 0%, rgba(255,136,0,0.8) 40%, transparent 70%);
          box-shadow: 0 0 20px #FF8800, 0 0 40px rgba(255,136,0,0.5);
          transition: top 0.15s ease-out;
        }
        .st-glow-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #FF8800;
          animation: st-ping 2s cubic-bezier(0,0,0.2,1) infinite; opacity: 0.5;
        }
        @keyframes st-ping {
          0% { transform: scale(1); opacity: 0.5; }
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }

        .st-item {
          position: relative;
          margin-bottom: 4rem;
        }
        .st-item:nth-child(odd) { padding-right: calc(50% + 2rem); }
        .st-item:nth-child(even) { padding-left: calc(50% + 2rem); }

        .st-node-dot {
          position: absolute; left: 50%; transform: translateX(-50%);
          top: 2.5rem; width: 12px; height: 12px; border-radius: 50%;
          background: #090706; border: 2px solid rgba(255,136,0,0.3);
          box-shadow: 0 0 0 2px #090706;
          z-index: 2; transition: all 0.5s ease;
        }
        .st-item.st-active .st-node-dot {
          background: #FF8800; border-color: #FF8800;
          box-shadow: 0 0 0 3px #090706, 0 0 0 5px rgba(255,136,0,0.3), 0 0 20px rgba(255,136,0,0.5);
        }
        .st-item.st-active .st-node-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #FF8800; animation: st-ping 2s ease-in-out infinite; opacity: 0.3;
        }

        .st-connector {
          position: absolute; top: calc(2.5rem + 5px); height: 1px; width: 2rem; z-index: 1;
          transition: all 0.5s;
        }
        .st-item:nth-child(odd) .st-connector {
          right: calc(50% - 2rem + 6px);
          background: linear-gradient(90deg, transparent, rgba(255,136,0,0.4));
        }
        .st-item:nth-child(even) .st-connector {
          left: calc(50% - 2rem + 6px);
          background: linear-gradient(90deg, rgba(255,136,0,0.4), transparent);
        }
        .st-item:not(.st-active) .st-connector { opacity: 0.2; }
        .st-item.st-active .st-connector {
          box-shadow: 0 0 8px rgba(255,136,0,0.2);
          opacity: 1;
        }

        .st-card { perspective: 1000px; cursor: pointer; width: 100%; }
        .st-card-inner {
          position: relative; width: 100%; height: 240px;
          transition: transform 0.6s ease; transform-style: preserve-3d;
        }
        .st-card.st-flipped .st-card-inner { transform: rotateY(180deg); }

        .st-card-front, .st-card-back {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s;
        }

        .st-card-front {
          background: rgba(13,11,10,0.85);
          border: 1px solid rgba(255,136,0,0.08);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 1.5rem;
        }
        .st-item.st-active .st-card-front {
          border-color: rgba(255,136,0,0.3);
          box-shadow:
            0 0 15px rgba(255,136,0,0.06),
            inset 0 0 30px rgba(255,136,0,0.02);
        }
        .st-card-front:hover {
          border-color: rgba(255,136,0,0.25);
          box-shadow: 0 0 20px rgba(255,136,0,0.08);
        }

        .st-era-name {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #FF8800;
          text-shadow:
            0 0 7px rgba(255,136,0,0.6),
            0 0 20px rgba(255,136,0,0.3),
            0 0 40px rgba(255,136,0,0.15);
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
        }
        .st-item:not(.st-active) .st-era-name {
          opacity: 0.6;
          text-shadow: 0 0 7px rgba(255,136,0,0.3);
        }

        .st-era-period {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,136,0,0.4);
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .st-era-summary {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .st-tap-hint {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          color: rgba(255,255,255,0.25);
          transition: color 0.3s;
        }
        .st-card-front:hover .st-tap-hint { color: rgba(255,136,0,0.5); }

        .st-mount-bracket {
          width: 50px; height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 1px;
          margin-bottom: 1rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .st-card-back {
          transform: rotateY(180deg);
          background: rgba(13,11,10,0.85);
          border: 1px solid rgba(255,136,0,0.3);
          box-shadow: 0 0 15px rgba(255,136,0,0.06);
        }
        .st-card-back-accent {
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, #FF8800, rgba(255,136,0,0.2), #FF8800);
          box-shadow: 0 0 8px rgba(255,136,0,0.3);
        }
        .st-card-back-content {
          padding: 1.25rem 1.25rem 1rem 1.5rem;
          height: 100%; display: flex; flex-direction: column;
        }
        .st-card-back-content h4 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: #FF8800;
          margin-bottom: 0.75rem;
          text-shadow: 0 0 10px rgba(255,136,0,0.3);
        }
        .st-detail-list { list-style: none; flex: 1; overflow-y: auto; margin: 0; padding: 0; }
        .st-detail-list li {
          display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 0.4rem;
        }
        .st-detail-list li .st-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #FF8800; opacity: 0.5; flex-shrink: 0;
          box-shadow: 0 0 4px rgba(255,136,0,0.4);
        }
        .st-detail-list li span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
        }
        .st-card-back-footer {
          padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 0.5rem;
        }
        .st-card-back-footer span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem; color: rgba(255,255,255,0.25);
        }

        @media (max-width: 768px) {
          .st-timeline::before, .st-glow-line, .st-glow-dot { left: 1rem; }
          .st-item:nth-child(odd),
          .st-item:nth-child(even) { padding-left: 3rem; padding-right: 0; }
          .st-node-dot { left: 1rem; }
          .st-connector { display: none; }
        }
      `}</style>

      <div className="st-timeline" ref={timelineRef}>
        <div className="st-glow-line" ref={glowLineRef} />
        <div className="st-glow-dot" ref={glowDotRef} />

        {eras.map((era, i) => (
          <div
            key={era.id}
            className={`st-item${activeItems[i] ? " st-active" : ""}`}
            ref={(el) => { itemRefs.current[i] = el; }}
          >
            <div className="st-node-dot" />
            <div className="st-connector" />
            <div
              className={`st-card${flipped[i] ? " st-flipped" : ""}`}
              onClick={() => toggleFlip(i)}
            >
              <div className="st-card-inner">
                <div className="st-card-front">
                  <div className="st-mount-bracket" />
                  <div className="st-era-name">{era.name}</div>
                  <div className="st-era-period">{era.period}</div>
                  <div className="st-era-summary">{era.summary}</div>
                  <div className="st-tap-hint">tap to explore</div>
                </div>
                <div className="st-card-back">
                  <div className="st-card-back-accent" />
                  <div className="st-card-back-content">
                    <h4>Skills Acquired</h4>
                    <ul className="st-detail-list">
                      {era.skills.map((skill) => (
                        <li key={skill}>
                          <div className="st-dot" />
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="st-card-back-footer">
                      <span>tap to go back</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
