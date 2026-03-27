import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founder",
  description: "Sergio Arath Guzman — the engineer behind Arath Industries.",
};

const socialLinks = [
  { name: "GitHub", href: "https://github.com/ArathIndustries" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/sergioarathguzman/" },
  { name: "Email", href: "mailto:Sergioarathguzman@gmail.com" },
];

export default function FounderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/about"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--neon)] mb-8 transition-colors font-mono text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        About Arath Industries
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-8 neon-text">The Founder</h1>

      {/* The Story */}
      <section className="mb-12">
        <div className="space-y-5 text-gray-400 leading-relaxed">
          <p className="text-lg">
            I&apos;m Sergio Arath Guzman — a first-generation Latino engineer who started with circuits and soldering irons before ever writing a line of code. That hardware-first background is why I think about problems differently than most software people. When I look at a system, I see the physical constraints, the signal flow, the failure modes. That instinct doesn&apos;t go away just because you switch to Python.
          </p>

          <p>
            My path hasn&apos;t been linear. I studied electronic systems, moved into civil engineering design, and I&apos;m currently finishing a degree in Industrial Engineering at Texas State University. Each jump happened the same way — I&apos;d get deep enough into a field to see the inefficiencies no one was fixing, and the curiosity would pull me toward the tools that could fix them.
          </p>

          <p>
            The turning point was working on a power engineering team building schematics for electrical substations. The work was tedious, the processes were manual, and the team was stuck — not because they lacked talent, but because red tape and &ldquo;that&apos;s how we&apos;ve always done it&rdquo; had calcified into the workflow. I couldn&apos;t build the tools to fix it there. But I couldn&apos;t stop seeing the same patterns everywhere: hours burned on work that a well-designed system could eliminate.
          </p>

          <p>
            That frustration became Arath Industries. I started building the tools I wished existed — an Artificial Intelligence (AI)-powered platform that monitors 150+ government agency portals so civil engineering firms don&apos;t have to do it manually. A dashboard that maps Texas&apos;s water crisis across 254 counties so decision-makers can see the problem instead of reading spreadsheets. A wireless sensor system that puts machine learning on a $30 microcontroller so a university lab doesn&apos;t need a $7,000 data acquisition rig.
          </p>

          <p>
            I work part-time as a Civil Engineering Designer while studying full-time and building these tools on the side. The range is the point — hardware, software, data, design, infrastructure. Real problems don&apos;t fit neatly into one discipline, and neither do the solutions.
          </p>

          <p>
            When I&apos;m not building, I&apos;m probably thinking about building something else.
          </p>
        </div>
      </section>

      {/* Connect */}
      <section>
        <h2 className="text-xl font-bold font-mono mb-4 text-gray-200">Connect</h2>
        <div className="flex flex-wrap gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="neon-btn text-sm font-mono"
            >
              {link.name}
            </Link>
          ))}
          <a
            href="/Sergio_Arath_Guzman_Resume.pdf"
            download
            className="neon-btn-filled text-sm font-mono inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Resume
          </a>
        </div>
      </section>
    </div>
  );
}
