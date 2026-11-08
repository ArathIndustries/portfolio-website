import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/blocks";

/**
 * The home page is content/pages/home.mdx rendered through the block
 * registry, so the publishing studio edits it like any other page. The page
 * is one <NeonSignHero /> block; the sign, sparks and layout live in that
 * component. Metadata stays the layout's default, as before.
 */
const file = path.join(process.cwd(), "content", "pages", "home.mdx");

export default function Home() {
  const { content } = matter(fs.readFileSync(file, "utf8"));
  // blockJS: next-mdx-remote 6 strips every prop={expression} by default;
  // see src/app/showcase/[slug]/page.tsx. blockDangerousJS stays on.
  return <MDXRemote source={content} components={mdxComponents} options={{ blockJS: false }} />;
}
