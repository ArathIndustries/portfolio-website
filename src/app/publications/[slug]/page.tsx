import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCollection, getCollectionEntry } from "@/lib/mdx";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCollection("publications").map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getCollectionEntry("publications", slug);
  if (!post) return { title: "Not Found" };
  return { title: post.frontmatter.title, description: post.frontmatter.description };
}

export default async function PublicationPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getCollectionEntry("publications", slug);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const formattedDate = new Date(frontmatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/publications"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--neon)] mb-8 transition-colors font-mono text-sm"
      >
        &larr; Back to Publications
      </Link>

      <header className="mb-12">
        <time className="text-sm text-gray-600 font-mono">{formattedDate}</time>
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mt-2 mb-4">{frontmatter.title}</h1>
        <p className="text-lg text-gray-400 mb-6">{frontmatter.description}</p>
        <div className="flex flex-wrap gap-2">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm rounded font-mono"
              style={{ background: "rgba(255,136,0,0.08)", color: "rgba(255,136,0,0.7)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="prose max-w-none">
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
