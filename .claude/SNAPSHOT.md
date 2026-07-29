# Portfolio Website — Snapshot

Last updated: 2026-07-28

## Current phase

Routine refresh pass shipped 2026-07-28 (commits `0004dba`, `181b530`), on top
of the IA burst of the same day (`dfb206e`).

**Information architecture (7/28, `dfb206e`):** header is
**Projects | About | Tools ▾ (Apps, Sheets) | Feed | Contact**. One
chronological writing feed at `/forged/notes` absorbed the former Blog and
Publications pages; `/blog`, `/blog/[slug]`, and `/publications` are permanent
redirects into the feed. Entries tagged `publication` render a badge (0 tagged
today).

**Refresh pass (7/28):** two projects shipped since the 7/18 pass published to
`/work` — modulab and the Powder Of Life Nano 33 BLE port. Both were verified
PUBLIC on GitHub and live-200 before anything was written about them. Sitemap
gained `/forged/tools`, `/forged/sheets`, `/resume` (nav and footer
destinations that had been absent). The About founder sentence now matches the
work status ruled 7/18 — civil design is past tense, undergraduate research is
current.

**Digital Twin timeline corrected (7/28, Arath ruling):** the flag left open by
the 7/18 pass is closed. Detail in DECISIONS.md.

## Content inventory

- `content/projects/` — 16 project pages. `/work` lists them in two tiers, and
  the tier lists are **hardcoded in `src/app/work/page.tsx`**, not derived from
  the content directory. Adding a project takes both an `.mdx` file and an
  entry in that file.
- `content/notes/` — 14 entries in the one feed.
- `/forged/tools` — 3 published tool cards (statics-tutor, lp-lab,
  diffeq-tutor), also hardcoded in the page.

## Verification standing rule

Nothing outward-facing gets published about a project without first checking
repository visibility (`gh repo list`) and that any linked URL returns 200.
Applied 7/28: modulab and PowderOfLife passed; forge, search-lab, keepsake,
pm-simulator, wdwtwa-site are private and stayed unpublished. `forge`
additionally carries an unauthenticated `/api/shell/exec` endpoint and must not
be presented as reachable.

## DNS status

RESOLVED — arath.site live on Vercel, registrar Bluehost. Apex redirects to
`www`. Separately open: the `arathindustries.com` domain and official-email
workshop, which supersedes the old "custom domain email at arath.site" line —
see BACKLOG `arath-industries`.

## Design direction (decided)

- Dark workshop/lab aesthetic, old brick wall, neon sign
- Random neon color per visit
- Script simplex (Hershey) font for sign, JetBrains Mono for UI
- Voltage surge sparks, sign surges, parabolic gravity sparks

## Next priorities

1. Next routine refresh pass — BACKLOG line, dated 2026-08-28
2. Port neon sign + spark systems into Next.js/React components
3. `arathindustries.com` domain + official-email workshop (blocks the email
   signature regeneration)
4. ROADMAP Priority 2-4 items (availability signal, testimonials, list/grid
   toggle fix, mobile pass)
