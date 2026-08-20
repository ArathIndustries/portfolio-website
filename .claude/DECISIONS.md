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

## 2026-07-28 — Digital Twin public timeline: honest restatement (Arath, interactive session)

**Context:** The 7/18 refresh pass flagged `content/projects/digital-twin.mdx` as date-stale with completion unverifiable, and left it for Arath. Verified 7/28 against the project SNAPSHOT: the page marked Mar 14 2026 "current" and listed Apr 6 / Apr 14 / May 1 / May 8 / May 31 milestones as "future", all past. The record supports the May 27 captures (11 trial sessions, one real cut on 6061-T6), the May 31 Makerspace closeout submittal, and the Jun 17 Pi rebuild. It does not support dataset-complete (200+ samples), production-model-deployed (no non-leakage model exists), physical enclosure, or publication submitted (article drafted, awaiting advisor review).
**Decision:** Honest restatement. Date and keep what is supported; delete the four unsupported milestones rather than restating them as pending; end the timeline in a Paused-since-June-2026 item that names what remains. Dataset prose separates the planned 56-combination protocol from the 11 sessions actually captured. Known Issues gains the AE band bin-width defect (2048-point FFT, 488 Hz bins, band labeled 100-400 kHz actually covers 50-200 kHz; raw captures unaffected).
**Reasoning:** A visitor reading the old page saw a project mid-March and on track. Removing rather than re-dating the unmet milestones avoids replacing one unverifiable claim with another.
**Alternatives considered:** Trim to verified only, ending at May with no pause language; minimal fix moving the "current" marker and stripping stale dates while keeping all milestones.
**Not decided here:** whether the gain-confound finding — features tracking preamp gain more strongly than machine state — belongs on the public page. It stays internal for now, consistent with the "polished public, honest internal" framing agreed during the closeout review. Raise it if the page is ever used to support a research claim.

## 2026-07-28 — arathindustries.com becomes the canonical domain (Arath, interactive session)

**Context:** Brand pivot from the personal arath.site to the studio name. Two questions were ruled the same night: what the new domain is FOR, and which registrar/mailbox stack carries it.
**Decision:** (1) arathindustries.com is PRIMARY; arath.site 308-redirects in and stays registered permanently so the resume PDF, GitHub profile, and printed links keep resolving. (2) Cloudflare Registrar holds the name; Cloudflare Email Routing forwards into the existing Gmail, accepting that Email Routing is inbound-only and sending uses Gmail send-as. Registrar and mailbox are independent — moving to Zoho or Workspace later is an MX change, not a domain move.
**Reasoning:** One property, one brand, one mailbox. The split-site alternative doubled the maintenance for two audiences that are currently the same audience.
**Alternatives considered:** Split studio vs personal across the two domains; park the new name on a redirect and defer the architecture.

## 2026-07-28 — Implementation choices made during the cutover

**Apex uses CNAME flattening, not a hardcoded A record.** The Vercel CLI recommended `76.76.21.21` while the live arath.site apex served `216.198.79.1`; the CLI on this machine is four majors behind, so the two sources genuinely disagreed. Because the zone is on Cloudflare, both apex and www are `CNAME → cname.vercel-dns.com` with flattening at the apex. This tracks whatever IPs Vercel issues and cannot go stale, which removes a documented recurring failure (webdev-matrix already warned the apex IP differs between projects).

**Host redirects live in `next.config.ts`, not the Vercel dashboard.** Version-controlled, reviewable, and deploys atomically with the app. Covers arath.site, www.arath.site, and www.arathindustries.com → the apex. Apex chosen as canonical over www: both were serving 200, which is duplicate content.

**All Cloudflare records are DNS-only.** Orange-clouding in front of Vercel is a known cause of certificate-issuance failure and redirect loops. Separately, on the imported arath.site zone, Cloudflare had proxied 13 of 14 A/CNAME records by default including `mail.arath.site` — the MX target. Cloudflare's proxy speaks HTTP only, so that configuration would have broken inbound mail the moment nameservers switched. Corrected while the zone was still pending.

**Not changed: arath.site mail.** It carries live MX to Bluehost plus Resend and Amazon SES sending records. The redirect is web-only. arath.site is therefore not a domain that can simply be dropped later — something still sends as it, and what that is has not been established.

## 2026-08-20 — Project images carry their own aspect ratio (Arath, interactive session)

**Context:** The Digital Twin research poster (`dt-poster.png`, 2600x1950, sourced from `ai-portfolio-talk/assets/`) became the first image any project page has used. The existing `frontmatter.image` renderer forced `aspect-video` + `object-cover`, which crops a 4:3 poster by roughly a quarter and removes the reference and acknowledgements column.
**Decision:** `ProjectFrontmatter` gains optional `imageWidth`, `imageHeight`, and `imageCaption`. When width and height are both present the project page renders the image uncropped at its natural ratio inside a `<figure>`, links it to the full-resolution file in `/public/images/`, and prints a caption plus an "Open full size" link. Images without dimensions keep the old cropped 16:9 hero, so nothing else changes. On `/work`, a featured tile with an `image` but no `embed` now shows that image at 400 px with `object-cover object-top` — matching the embed tiles' height and fade — instead of the "In Development" placeholder.
**Reasoning:** A poster is a document, not a hero graphic; its value is in being readable, which requires both the full frame and a path to full resolution. Gating on explicit dimensions avoids adding an image-measuring dependency and keeps the behavior opt-in per project.
**Alternatives considered:** Hardcode 4:3 for all project images; measure dimensions at build time with `image-size`; place the poster only in the MDX body and leave the tile placeholder alone.
