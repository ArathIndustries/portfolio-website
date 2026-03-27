import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Arath Industries — an engineering studio building tools fit for how people work.",
};

const capabilities = [
  {
    title: "Automation & Workflow Tools",
    description: "Identifying repetitive processes and replacing them with systems that run themselves — scrapers, schedulers, pipelines, and integrations.",
  },
  {
    title: "Data Dashboards & Visualization",
    description: "Interactive analytics that make complex datasets actionable — geospatial maps, real-time charts, and decision-support tools.",
  },
  {
    title: "Full-Stack Web Applications",
    description: "End-to-end platforms from database to deployment — Application Programming Interfaces (APIs), frontends, authentication, and infrastructure.",
  },
  {
    title: "AI & Machine Learning Integration",
    description: "Large Language Model (LLM) pipelines, edge-deployed neural networks, prompt engineering, and intelligent document processing.",
  },
  {
    title: "Hardware & Embedded Systems",
    description: "Sensor networks, wireless communication, edge inference, and physical prototyping — bridging software and the real world.",
  },
  {
    title: "Process Improvement",
    description: "Industrial Engineering methodology applied to software and organizational problems — Statistical Process Control (SPC), DMAIC, and systems thinking.",
  },
];


export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Studio Identity */}
      <section className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-6 neon-text">Arath Industries</h1>
        <p className="text-lg text-gray-300 leading-relaxed mb-4">
          An engineering studio that designs and builds tools for people who are tired of doing things the hard way.
        </p>
        <blockquote
          className="font-mono text-sm leading-relaxed my-8 pl-4"
          style={{ borderLeft: '2px solid rgba(255,136,0,0.4)', color: 'rgba(255,255,255,0.7)' }}
        >
          We build what should already exist. The tools teams need but won&apos;t build because &ldquo;that&apos;s how we&apos;ve always done it&rdquo; is easier to say than &ldquo;let&apos;s fix this.&rdquo;
        </blockquote>
      </section>

      {/* Capabilities */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold font-mono mb-8 text-gray-200">What We Build</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="p-5 rounded-lg border border-gray-800"
              style={{ background: 'rgba(13,11,10,0.6)' }}
            >
              <h3 className="font-mono font-semibold text-sm mb-2" style={{ color: 'rgba(255,136,0,0.8)' }}>
                {cap.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder CTA */}
      <section
        className="p-8 rounded-lg text-center"
        style={{ border: '1px solid rgba(255,136,0,0.15)', background: 'rgba(255,136,0,0.02)' }}
      >
        <p className="text-gray-400 mb-4">
          Arath Industries is a one-person studio founded by Sergio Arath Guzman — an Industrial Engineering student, civil design professional, and self-taught developer who started seeing inefficiencies everywhere and couldn&apos;t stop building tools to fix them.
        </p>
        <Link href="/founder" className="neon-btn font-mono text-sm inline-block">
          Meet the Founder
        </Link>
      </section>
    </div>
  );
}
