import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Base directory for content
const contentDirectory = path.join(process.cwd(), "content");

// Types for project frontmatter
export interface ProjectFrontmatter {
  title: string;
  description: string;
  image?: string;
  // Natural pixel dimensions of `image`. When both are present the project page
  // renders the image at its own aspect ratio instead of cropping to 16:9 —
  // required for posters, which lose content under an object-cover crop.
  imageWidth?: number;
  imageHeight?: number;
  imageCaption?: string;
  tags: string[];
  github?: string;
  live?: string;
  date: string;
  featured?: boolean;
}

export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter;
  content: string;
}

// Types for blog frontmatter
export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
}

/**
 * Get all projects from content/projects directory
 * Returns projects sorted by date (newest first)
 */
export function getAllProjects(): Project[] {
  const projectsDirectory = path.join(contentDirectory, "projects");

  // Return empty array if directory doesn't exist or is empty
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(projectsDirectory);
  const mdxFiles = filenames.filter((name) => name.endsWith(".mdx"));

  const projects = mdxFiles.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(projectsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      frontmatter: data as ProjectFrontmatter,
      content,
    };
  });

  // Sort by date (newest first)
  return projects.sort((a, b) => {
    return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
  });
}

/**
 * Get a single project by slug
 */
export function getProjectBySlug(slug: string): Project | null {
  const filePath = path.join(contentDirectory, "projects", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    frontmatter: data as ProjectFrontmatter,
    content,
  };
}

/**
 * Get featured projects only
 */
export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((project) => project.frontmatter.featured);
}

/**
 * Writing collections. "notes" is the one chronological feed (2026-07-26 IA
 * ruling): it absorbed the former Blog and Publications; publication entries
 * carry a `publication` tag.
 */
export type WritingCollection = "notes";

export function getCollection(collection: WritingCollection): BlogPost[] {
  const dir = path.join(contentDirectory, collection);
  if (!fs.existsSync(dir)) {
    return [];
  }
  const posts = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(dir, filename), "utf8"));
      return { slug, frontmatter: data as BlogFrontmatter, content };
    });
  return posts.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime(),
  );
}

export function getCollectionEntry(collection: WritingCollection, slug: string): BlogPost | null {
  const filePath = path.join(contentDirectory, collection, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  return { slug, frontmatter: data as BlogFrontmatter, content };
}
