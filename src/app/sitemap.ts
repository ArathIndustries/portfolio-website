import { MetadataRoute } from "next";
import { getAllProjects, getAllBlogPosts } from "@/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://arath.site";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  const projects = getAllProjects();
  const projectPages = projects.map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    lastModified: new Date(project.frontmatter.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const posts = getAllBlogPosts();
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages, ...blogPages];
}
