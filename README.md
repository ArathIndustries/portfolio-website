# Portfolio Website

Personal portfolio and blog for Sergio Arath Guzman - Design Engineer exploring AI and automation.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS v4
- **Content:** MDX for blog posts and projects
- **Themes:** next-themes (dark/light mode)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the site.

## Project Structure

```
/src
  /app              → Next.js App Router pages
  /components       → React components (Header, Footer, ThemeToggle, etc.)
  /lib              → Utilities (MDX parsing)
/content
  /projects         → Project MDX files
  /blog             → Blog post MDX files
/public
  /images           → Static images
```

## Available Routes

- `/` - Home page with hero and featured content
- `/about` - About page with bio, skills, and contact
- `/projects` - Projects listing
- `/projects/[slug]` - Individual project pages
- `/blog` - Blog listing
- `/blog/[slug]` - Individual blog posts
- `/sitemap.xml` - Auto-generated sitemap

## Commands

```bash
npm run dev      # Start dev server on port 3001
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Deployment

Deployed on Vercel via GitHub integration.

## License

MIT
