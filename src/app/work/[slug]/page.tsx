import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllProjects, getProjectBySlug } from "@/lib/mdx";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

interface WorkPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.frontmatter.title,
    description: project.frontmatter.description,
  };
}

export default async function WorkDetailPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const { frontmatter, content } = project;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back Link */}
      <Link
        href="/work"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--neon)] mb-8 transition-colors font-mono text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Work
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-4">{frontmatter.title}</h1>
        <p className="text-lg text-gray-400 mb-6">{frontmatter.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm rounded font-mono"
              style={{ background: 'rgba(255,136,0,0.08)', color: 'rgba(255,136,0,0.7)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4">
          {frontmatter.github && (
            <a href={frontmatter.github} target="_blank" rel="noopener noreferrer" className="neon-btn text-sm font-mono inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Code
            </a>
          )}
          {frontmatter.live && (
            <a href={frontmatter.live} target="_blank" rel="noopener noreferrer" className="neon-btn-filled text-sm font-mono inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Live Demo
            </a>
          )}
        </div>
      </header>

      {/* Project Image */}
      {frontmatter.image && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-12">
          <Image src={frontmatter.image} alt={frontmatter.title} fill className="object-cover" priority />
        </div>
      )}

      {/* MDX Content */}
      <div className="prose max-w-none">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
