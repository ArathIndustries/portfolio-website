# CLAUDE.md

This file provides guidance to Claude Code when working with this project.

## Project Purpose

Personal portfolio and blog website to showcase projects, share updates, and establish online presence. Replacing an existing WordPress site.

## Tech Stack

- **Framework:** Next.js 15+ (App Router) with Turbopack
- **Styling:** Tailwind CSS v4 (CSS-based config)
- **Content:** MDX for blog posts (next-mdx-remote, gray-matter)
- **Themes:** next-themes for dark/light toggle
- **Deployment:** Vercel
- **Domain:** User's existing domain (migrating from WordPress)

## Project Structure

```
/src
  /app              → Next.js App Router pages
  /components       → Reusable React components
  /lib              → Utility functions (MDX parsing, etc.)
/content
  /projects         → Project MDX files
  /blog             → Blog post MDX files
/public
  /images           → Static images
```

## Working Guidelines

### Code Style
- Use TypeScript for type safety
- Prefer functional components with hooks
- Use Tailwind utility classes for styling
- Keep components small and focused
- Use `"use client"` directive only when needed (for interactivity)

### Content
- Blog posts go in `/content/blog/` as MDX files
- Project descriptions go in `/content/projects/`
- Use frontmatter for metadata (title, date, tags, etc.)

### Commands
```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Run production build locally
npm run lint     # Run ESLint
```

## Design Principles

- Clean, minimal aesthetic
- Mobile-first responsive design
- Fast page loads (prefer static generation)
- Accessible (proper heading structure, alt text, etc.)
- Dark/light theme toggle

## Current Phase

**MVP Complete** - All 8 phases finished. Site is deployed and live.

- Phase 1: Project Setup (Next.js, Tailwind, MDX)
- Phase 2: Layout & Navigation (Header, Footer, ThemeToggle)
- Phase 3: Home Page (Hero, featured content)
- Phase 4: Projects Section (MDX, dynamic routes)
- Phase 5: Blog Section (MDX, dynamic routes)
- Phase 6: About Page (Bio, skills, contact)
- Phase 7: Polish & SEO (Metadata, sitemap, 404)
- Phase 8: Deployment (GitHub, Vercel)

## Dev Server

Runs on **port 3001** (to avoid conflict with other local services on 3000).

```bash
npm run dev  # Opens http://localhost:3001
```
