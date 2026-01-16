import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Sergio Arath Guzman - Industrial Engineer who cannot stop tinkering.",
};

const skills = [
  { category: "Engineering", items: ["Civil", "Industrial", "Electronics"] },
  { category: "Programming", items: ["Python", "C", "Assembly"] },
  { category: "AI & Automation", items: ["Claude", "Prompt Engineering", "Workflow Automation"] },
  { category: "Web", items: ["React", "Next.js", "Tailwind CSS", "Node.js"] },
];

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/ArathIndustries",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/sergioarathguzman/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:Sergioarathguzman@gmail.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Bio Section */}
      <section className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">About Me</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            I&apos;m a first-generation Latino engineering student with a background that spans
            electronic systems and civil design. I&apos;ve always been drawn to understanding
            how things work—whether it&apos;s a circuit, a structure, or a system. That curiosity
            has taken me down a lot of different paths, and I&apos;ve learned something valuable
            from each one.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
            Right now, I&apos;m studying Industrial Engineering at Texas State University while
            working part-time as a Civil Engineering Designer. Lately, I&apos;ve been diving into
            task automation—finding ways to make repetitive work disappear so people can focus
            on what actually matters.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
            I&apos;m motivated by curiosity and novelty. If you know where you want to go but
            don&apos;t know where to start, I like helping steer the ship in that direction.
            When I&apos;m not working or studying, you&apos;ll find me reading philosophy,
            working outside with my hands, or taking long walks to the corner store for snacks.
          </p>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Skills & Technologies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Interested in collaborating or just want to say hello? Feel free to reach out.
        </p>
        <div className="flex flex-wrap gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
