import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { mdxComponents } from "@/components/blocks";

/**
 * Test pages for the publishing studio. Every component the studio can place
 * is in `mdxComponents`, so a page saved by the studio renders here with
 * the same code the editor canvas used.
 */
const dir = path.join(process.cwd(), "content", "showcase");

interface PageProps {
  params: Promise<{ slug: string }>;
}

function load(slug: string) {
  const file = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return matter(fs.readFileSync(file, "utf8"));
}

export async function generateStaticParams() {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".mdx"))
    .map((n) => ({ slug: n.replace(/\.mdx$/, "") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = load(slug);
  if (!page) return { title: "Not Found" };
  return { title: page.data.title, description: page.data.description, robots: { index: false } };
}

export default async function ShowcasePage({ params }: PageProps) {
  const { slug } = await params;
  const page = load(slug);
  if (!page) notFound();
  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="prose max-w-none">
        {/* blockJS: next-mdx-remote 6 strips every prop={expression} by default,
            which silently empties arrays and numbers on blocks. Object literals
            are needed for block props; blockDangerousJS still rejects calls to
            eval/Function/process and friends. */}
        <MDXRemote source={page.content} components={mdxComponents} options={{ blockJS: false }} />
      </div>
    </article>
  );
}
