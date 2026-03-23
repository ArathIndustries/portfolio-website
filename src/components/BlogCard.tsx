import Link from "next/link";
import type { BlogFrontmatter } from "@/lib/mdx";

interface BlogCardProps {
  slug: string;
  frontmatter: BlogFrontmatter;
}

export function BlogCard({ slug, frontmatter }: BlogCardProps) {
  const { title, description, date, tags } = frontmatter;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group">
      <Link
        href={`/blog/${slug}`}
        className="block p-6 rounded-lg border border-gray-800 hover:border-[var(--neon)] transition-all duration-200"
        style={{ background: 'rgba(13,11,10,0.6)' }}
      >
        <time className="text-sm text-gray-600 font-mono">{formattedDate}</time>
        <h3 className="font-mono font-semibold text-lg mt-2 mb-2 text-gray-200 group-hover:text-[var(--neon)] transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 mb-4 line-clamp-2">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded font-mono"
              style={{ background: 'rgba(255,136,0,0.08)', color: 'rgba(255,136,0,0.7)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
