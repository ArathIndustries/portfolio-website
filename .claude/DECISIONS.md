# Portfolio Website — Decision Log

## 2026-03 — Neon workshop aesthetic
**Context:** Choosing visual direction for portfolio site.
**Decision:** Dark workshop/lab with neon sign hero. Script simplex (Hershey) font for sign, JetBrains Mono for UI, random neon color per visit.
**Reasoning:** Professional enough to land contracts but with personality. Matches Forge's neon workshop theme for brand consistency.
**Alternatives considered:** Clean minimalist, brutalist, standard tech portfolio.
**Reversal conditions:** None — design is validated in prototypes.

## 2026-03 — Next.js 16 + Tailwind v4 + MDX
**Context:** Choosing tech stack for portfolio.
**Decision:** Next.js for SSR/SSG, Tailwind v4 for styling, MDX for blog/case studies.
**Reasoning:** Industry standard, good DX, MDX allows mixing prose with interactive components.
**Alternatives considered:** Astro, plain HTML.
**Reversal conditions:** None.

## 2026-07-26 — IA ruling: nav rename + one writing feed (Arath, interactive session f9fcbe9b)

**Context:** thinking-narrator blog post needs a venue; review exposed Notes double-listed in two dropdowns, no stated Blog-vs-Notes rule, and nav labels Arath found off-register ("Work", "Writing").
**Decision:** Header becomes **Projects | About | Forged Tools ▾ (Sheets, Tools) | Forged Notes | Contact** (order unchanged — employer/client path first, ruled explicitly). One chronological **Forged Notes** feed absorbs the Blog (2 posts migrate) and Publications (entries tagged `publication` with a badge; page retires). "Writing" and "Blog" labels retire; the Forged brand carries both pillars: Tools = things you use, Notes = things you read. `/blog`, `/blog/[slug]`, `/publications` get redirects into the feed. Quiet pages stay quiet (/founder header-invisible, /resume footer-only — ruled intentional).
**Reasoning:** "Projects" is timeless where "Current Projects" would misdescribe finished case studies; "Forged Notes" already exists as a shipped brand with ~10 pm-sim notes, so the merge extends rather than invents; one feed kills the double-listing and the per-post venue question permanently.
**Alternatives considered:** Field Notes / Notebook / keep Blog (feed name); Case Studies / Current Projects (page name); Publications as quiet page or own nav slot.
**Reversal conditions:** If publication count grows enough that academics are a distinct audience, split Publications back out.

## 2026-07-26 — Revision: de-branded nav labels (Arath, same session, supersedes labels above)

**Context:** Reviewing the entry above, Arath preferred plainer labels over brand-carrying ones.
**Decision:** Header is **Projects | About | Tools ▾ (Apps, Sheets) | Feed | Contact**. "Forged Tools" → "Tools" with children renamed Apps + Sheets (resolves Tools-inside-Tools nesting); "Forged Notes" → "Feed" as the merged writing feed's nav label. Structure, order, merge plan, redirects, and quiet pages from the entry above are unchanged.
**Reasoning:** Nav becomes plain wayfinding; the Forged brand stays where it already lives — hero tagline ("Forged by Arath"), /forged/ URLs, and the content itself. Explicitly acknowledged trade-off: chrome no longer carries the brand.
**Alternatives considered:** Notes / Log / keep Forged Notes (feed name); flatten Tools to a single page; keep Sheets/Tools children.
**Reversal conditions:** If plain "Feed" proves too generic for first-time visitors (analytics/feedback), "Notes" is the fallback.
