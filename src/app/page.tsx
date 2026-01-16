import Link from "next/link";
import { getFeaturedProjects, getAllBlogPosts } from "@/lib/mdx";
import { ProjectCard } from "@/components/ProjectCard";

export default function Home() {
  const featuredProjects = getFeaturedProjects();
  const recentPosts = getAllBlogPosts().slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero Section */}
      <section className="text-center sm:text-left">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Hi, I&apos;m
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Sergio Arath Guzman
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
          Industrial Engineer who cannot stop tinkering.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Read Blog
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                slug={project.slug}
                frontmatter={project.frontmatter}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md mb-4" />
                <h3 className="font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Projects in progress...
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Posts */}
      <section className="mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Link
            href="/blog"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <h3 className="font-semibold mb-1">{post.frontmatter.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {post.frontmatter.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <h3 className="font-semibold mb-1">Coming Soon</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Blog posts in progress...
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
