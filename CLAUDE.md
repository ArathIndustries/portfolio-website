# CLAUDE.md

This file provides guidance to Claude Code when working with this project.

## Project Purpose

Personal portfolio and blog website for Arath Industries (arath.site). Dark neon sign aesthetic with interactive SVG + canvas animations.

## Tech Stack

- **Framework:** Next.js 16+ (App Router) with Turbopack
- **Styling:** Tailwind CSS v4 (CSS-based config), dark-only theme
- **Fonts:** JetBrains Mono (headings/mono) + Inter (body) via next/font/google
- **Content:** MDX for blog posts and projects (next-mdx-remote, gray-matter)
- **Animations:** SVG neon sign with wave interference + canvas spark/lightning particles
- **Deployment:** Vercel (auto-deploy on push)
- **Domain:** arath.site

## Project Structure

```
/src
  /app              → Next.js App Router pages
    /work            → Case studies (renamed from /projects)
    /blog            → Blog posts (hidden from nav)
    /about           → Bio and skills
    /contact         → Contact form (Formspree)
  /components       → Reusable React components
    /neon            → NeonSign, SparkCanvas, types
  /lib              → Utility functions (MDX parsing)
/content
  /projects         → Project MDX files (served at /work routes)
  /blog             → Blog post MDX files
/public
  /images           → Static images
```

## Design

- **Theme:** Dark only (#090706 background), no light mode
- **Neon color:** #FF00AA (--neon CSS variable)
- **Background:** SVG brick wall pattern + CSS noise overlay
- **Neon sign:** 5-layer SVG tubes (glass-edge, glass, bloom, light, core) with gaussian blur filter
- **Animations:** Wave interference dims letters → sparks fire on brightness dips → mouse voltage surge
- **Typography:** JetBrains Mono for headings/UI, Inter for body text

## Commands

```bash
npm run dev      # Start dev server (port 3001)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Key Technical Details

- NeonSign and SparkCanvas communicate via a shared mutable ref (NeonBridge) — no React state for 60fps animation
- SparkCanvas is only mounted on the landing page, not globally
- /projects routes redirect to /work (permanent redirects in next.config.ts)
- Blog route exists but is hidden from nav
- Contact form uses Formspree (placeholder ID — needs real form ID)

## Routes

- `/` — Landing page with interactive neon sign
- `/work` — Case studies list (list/grid toggle)
- `/work/[slug]` — Case study detail (MDX)
- `/about` — Bio, skills, social links
- `/contact` — Contact form + service areas
- `/blog` — Blog listing (hidden from nav)
- `/blog/[slug]` — Blog post detail (MDX)
