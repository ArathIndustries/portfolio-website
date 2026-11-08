import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { mdxComponents } from "@/components/blocks";

/**
 * Pages that are content files: content/pages/<name>.mdx rendered through
 * the block registry, so the publishing studio edits them. The route file
 * keeps its outer layout wrapper (width and padding) and the metadata comes
 * from the frontmatter.
 */
function load(name: string) {
  return matter(fs.readFileSync(path.join(process.cwd(), "content", "pages", `${name}.mdx`), "utf8"));
}

export function pageMetadata(name: string): Metadata {
  const { data } = load(name);
  return { title: data.title as string, description: data.description as string };
}

export function PageContent({
  name,
  className,
  overrides,
}: {
  name: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overrides?: Record<string, ComponentType<any>>;
}) {
  const { content } = load(name);
  // blockJS: next-mdx-remote 6 strips every prop={expression} by default;
  // blockDangerousJS stays on. See src/app/showcase/[slug]/page.tsx.
  const body = <MDXRemote source={content} components={{ ...mdxComponents, ...overrides }} options={{ blockJS: false }} />;
  return className ? <div className={className}>{body}</div> : body;
}
