import { getAllProjects } from "@/lib/mdx";
import { ProjectCard } from "@/components/ProjectCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore my portfolio of engineering, AI, and automation projects.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Projects</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          A collection of projects I&apos;ve worked on, spanning engineering,
          AI, and automation.
        </p>
      </header>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              frontmatter={project.frontmatter}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400">
            Projects coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
