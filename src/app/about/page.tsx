import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Sergio Arath Guzman — Industrial Engineer building tools that fit how people work.",
};

const skills = [
  { category: "Engineering", items: ["Civil", "Industrial", "Electronics", "Quality (SPC/DMAIC)"] },
  { category: "Programming", items: ["Python", "C/C++", "JavaScript", "TypeScript", "SQL", "Assembly"] },
  { category: "AI & ML", items: ["LLM Integration", "Prompt Engineering", "TensorFlow/TFLite", "CNNs", "Signal Processing"] },
  { category: "Web Development", items: ["Next.js", "React", "FastAPI", "Tailwind CSS", "Plotly.js", "Leaflet.js", "MDX"] },
  { category: "Hardware & IoT", items: ["Arduino", "ESP32", "BLE", "WiFi Bridges", "Sensor Systems", "Acoustic Emission"] },
  { category: "Data & Infrastructure", items: ["PostgreSQL", "Supabase", "Docker", "GitHub Actions", "Vercel", "Render"] },
  { category: "Design", items: ["Affinity Suite", "Blender", "Krita", "SVG Animation", "Data Visualization"] },
  { category: "Tools", items: ["Git", "Minitab", "Web Scraping", "REST APIs"] },
];

const socialLinks = [
  { name: "GitHub", href: "https://github.com/ArathIndustries" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/sergioarathguzman/" },
  { name: "Email", href: "mailto:Sergioarathguzman@gmail.com" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Bio Section */}
      <section className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-6 neon-text">About</h1>
        <div className="space-y-4">
          <p className="text-lg text-gray-400 leading-relaxed">
            I&apos;m a first-generation Latino engineering student with a background that spans
            electronic systems and civil design. I&apos;ve always been drawn to understanding
            how things work&mdash;whether it&apos;s a circuit, a structure, or a system. That curiosity
            has taken me down a lot of different paths, and I&apos;ve learned something valuable
            from each one.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed">
            Right now, I&apos;m studying Industrial Engineering at Texas State University while
            working part-time as a Civil Engineering Designer. Lately, I&apos;ve been diving into
            task automation&mdash;finding ways to make repetitive work disappear so people can focus
            on what actually matters.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed">
            I&apos;m motivated by curiosity and novelty. If you know where you want to go but
            don&apos;t know where to start, I like helping steer the ship in that direction.
            When I&apos;m not working or studying, you&apos;ll find me reading philosophy,
            working outside with my hands, or taking long walks to the corner store for snacks.
          </p>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold font-mono mb-6 text-gray-200">Skills & Technologies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h3 className="font-mono font-semibold text-gray-300 mb-3">
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-sm rounded font-mono"
                    style={{ background: 'rgba(255,136,0,0.08)', color: 'rgba(255,136,0,0.7)' }}
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
        <h2 className="text-2xl font-bold font-mono mb-6 text-gray-200">Get in Touch</h2>
        <p className="text-gray-400 mb-6">
          Interested in collaborating or just want to say hello? Feel free to reach out.
        </p>
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
        </div>
      </section>
    </div>
  );
}
