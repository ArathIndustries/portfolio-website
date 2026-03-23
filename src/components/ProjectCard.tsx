import Image from "next/image";
import Link from "next/link";
import type { ProjectFrontmatter } from "@/lib/mdx";

interface ProjectCardProps {
  slug: string;
  frontmatter: ProjectFrontmatter;
}

export function ProjectCard({ slug, frontmatter }: ProjectCardProps) {
  const { title, description, image, tags, github, live } = frontmatter;

  return (
    <article className="group rounded-lg border border-gray-800 overflow-hidden hover:border-[var(--neon)] transition-all duration-200" style={{ background: 'rgba(13,11,10,0.6)' }}>
      <Link href={`/work/${slug}`} className="block">
        <div className="relative w-full h-48" style={{ background: 'rgba(255,0,170,0.03)' }}>
          {image ? (
            <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/work/${slug}`}>
          <h3 className="font-mono font-semibold text-lg mb-2 text-gray-200 group-hover:text-[var(--neon)] transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded font-mono" style={{ background: 'rgba(255,0,170,0.08)', color: 'rgba(255,0,170,0.7)' }}>
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[var(--neon)] flex items-center gap-1 transition-colors font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Code
            </a>
          )}
          {live && (
            <a href={live} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[var(--neon)] flex items-center gap-1 transition-colors font-mono">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
