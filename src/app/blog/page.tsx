import { getAllBlogPosts } from "@/lib/mdx";
import { BlogCard } from "@/components/BlogCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on engineering, AI, automation, and technology.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Thoughts on engineering, AI, automation, and the intersection of
          technology and design.
        </p>
      </header>

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              frontmatter={post.frontmatter}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400">
            Blog posts coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
