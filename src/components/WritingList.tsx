import Link from "next/link";
import type { BlogPost } from "@/lib/mdx";

/* Index list for the one chronological writing feed. Entries tagged
   `publication` carry a badge (2026-07-26 IA ruling). */

export function WritingList({ posts, basePath }: { posts: BlogPost[]; basePath: string }) {
  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const formattedDate = new Date(post.frontmatter.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const isPublication = post.frontmatter.tags?.includes("publication");
        return (
          <Link
            key={post.slug}
            href={`${basePath}/${post.slug}`}
            className="block p-6 rounded-lg border border-[rgba(255,136,0,0.12)] hover:border-[rgba(255,136,0,0.35)] bg-[rgba(255,136,0,0.02)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <time className="text-sm text-gray-600 font-mono">{formattedDate}</time>
              {isPublication && (
                <span
                  className="px-2 py-0.5 text-xs rounded font-mono uppercase tracking-wider"
                  style={{ background: "rgba(255,136,0,0.08)", color: "rgba(255,136,0,0.7)" }}
                >
                  Publication
                </span>
              )}
            </div>
            <h2 className="font-mono font-semibold text-xl mt-1 mb-2 text-gray-200">
              {post.frontmatter.title}
            </h2>
            <p className="text-sm text-gray-400">{post.frontmatter.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
