# Portfolio Website — Routing

## Inputs

| Task type              | Files to load                                                     |
|------------------------|-------------------------------------------------------------------|
| Current status         | SNAPSHOT.md                                                       |
| Why this exists        | VISION.md                                                         |
| Next steps             | ROADMAP.md                                                        |
| Decision history       | DECISIONS.md                                                      |
| Session history        | INDEX.md → follow links to central sessions/summaries/            |
| Actual code            | `C:\Users\Arath\Automation_Station\Projects\portfolio-website\`   |

## Known gotchas

- Has its own ROADMAP.md in project root — check it for priority items
- Neon sign prototypes are in test HTML files (neon-sign-v2.html is current best)
- Next.js 16 + Tailwind v4 + MDX

## Key file paths

- Neon sign prototype: neon-sign-v2.html (current best)
- Color sampler: color-sampler-v4.html
- Project roadmap: ROADMAP.md (in project root)

## External references

- Live: https://arathindustries.com (canonical since 2026-07-28; also arath-industries.vercel.app)
- Domain: arathindustries.com — registered 2026-07-28 at Cloudflare Registrar, Cloudflare nameservers (finley/ximena), apex + www as CNAME → cname.vercel-dns.com with CNAME flattening, both DNS-only. Managed via `Claude Memory\tools\cloudflare\cf.ps1`.
- Old domain: arath.site — 308-redirects to arathindustries.com via host rules in `next.config.ts` (not the Vercel dashboard). Registrar of record is **Network Solutions** (managed in the Bluehost portal), expires 2027-01-16. Keep it renewed indefinitely; the redirect only works while the name is owned. Its Cloudflare zone exists but is PENDING — nameservers still at Bluehost. arath.site also carries live MAIL records (MX → mail.arath.site, Bluehost) plus Resend and Amazon SES sending credentials; a redirect affects web only, mail is untouched.
- Repo: ArathIndustries/portfolio-website
- Deploy: Vercel auto-deploy on push to master
