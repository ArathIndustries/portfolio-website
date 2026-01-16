import Link from "next/link";
import type { BlogFrontmatter } from "@/lib/mdx";

interface BlogCardProps {
  slug: string;
  frontmatter: BlogFrontmatter;
}

export function BlogCard({ slug, frontmatter }: BlogCardProps) {
  const { title, description, date, tags } = frontmatter;

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group">
      <Link
        href={`/blog/${slug}`}
        className="block p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
      >
        {/* Date */}
        <time className="text-sm text-gray-500 dark:text-gray-500">
          {formattedDate}
        </time>

        {/* Title */}
        <h3 className="font-semibold text-lg mt-2 mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
