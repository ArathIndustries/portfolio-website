import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/mdx";
import Link from "next/link";
import type { Metadata } from "next";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

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
        href="/blog"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--neon)] mb-8 transition-colors font-mono text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Blog
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
              style={{ background: 'rgba(255,0,170,0.08)', color: 'rgba(255,0,170,0.7)' }}
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
