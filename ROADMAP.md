# Arath Industries Portfolio — Roadmap

Based on portfolio website best practices research (March 2026).

## Priority 1: Conversion & Credibility

### Outcome-Led Case Studies
Rewrite project descriptions to lead with measured results, not descriptions. The result earns the read.
- OpenChambers: "1,961 meetings scraped across 150+ government portals in 16 days" above the fold
- Water Dashboard: "254 counties, 5 IE frameworks, delivered in 4 days"
- Digital Twin: "54-72% cost reduction vs commercial DAQ systems"
- Portfolio Site: "Full neon sign system with dynamic brick wall lighting in 2 days"
- Apply to both the /work page card descriptions AND the MDX case study openings

### Curate Project List
9 projects is too many. Tier them:
- **Featured (4-5):** OpenChambers, Water Dashboard, Digital Twin, Portfolio Website
- **Other Work (smaller cards):** TCEQ Geowatcher, ClarityOS, AI Assistant
- **Consider cutting:** AI Agent Network (smallest scope), File Explorer (planning only)
- Visually separate featured projects (full iframe + case study) from other work (compact cards)

### Custom Domain Email
Set up hello@arath.site or arath@arath.site (via Bluehost or a service like Zoho/Cloudflare Email).
Replace Gmail on contact page and footer. Custom email is a documented trust signal.

## Priority 2: Recruiter & Employer Experience

### ~~Downloadable Resume PDF~~ ✅
- ~~Create a clean, neon-themed PDF resume~~
- ~~Add download link on /founder page ("For Employers" section)~~
- Done — /resume page with PDF preview + download button

### Availability Signal
Add a clear, confident statement of what you're open to:
- On /about or /founder: "Currently accepting projects and open to the right full-time opportunity in automation, AI, or industrial engineering."
- Keep it updated. Stale availability signals are worse than no signal.

### Role Targeting
Short statement of what kinds of roles/engagements you're seeking:
- Full-time: Industrial Engineering, Automation, AI/ML, Full-Stack Development
- Freelance: Dashboard development, workflow automation, AI integration, web applications
- Research: Edge ML, manufacturing intelligence, environmental data systems

### Photo on Founder Page
A professional, warm photo. Not a corporate headshot — something that shows personality. The research says this is evaluated after technical credibility is established, and at that point personality is the deciding variable.

## Priority 3: Trust & Maturity Signals

### "How I Work" / Process Section
Add to /about page or create a dedicated section. Describe your approach in 3-5 steps:
1. **Understand** — Dig into the actual problem, not the assumed one
2. **Prototype** — Build the smallest thing that proves the approach works
3. **Build** — Full implementation with real users in mind
4. **Ship** — Deploy, monitor, iterate based on what happens
5. **Document** — Leave it better than you found it

This signals experience and pre-qualifies clients. Junior portfolios never have this.

### Testimonials
- Collect outcome-based testimonials from anyone who's used your tools (BD monitor users, datathon judges, Dr. Shendokar, coworkers)
- Place them adjacent to relevant case studies, not on a separate page
- A quote that names a measurable result outperforms generic praise

### GitHub README Discipline
Ensure all linked repos have clean, informative READMEs. Recruiters check these.
- ArathIndustries/openchambers ✓ (renamed from bd-monitor; has CLAUDE.md + docs — NOTE: repo is private, site "Code" links 404 for visitors until made public)
- ArathIndustries/datathon-water-analysis — verify README quality
- ArathIndustries/portfolio-website — verify README quality

## Priority 4: Polish

### Mobile Interface Fixes
- Fix overall mobile responsive layout (test on real phone)
- Resume PDF: add pinch-to-zoom support on mobile
- Founder page timeline cards: flipped cards (back side) can't scroll — fix overflow so the full content is accessible

### Case Study & Content Review
- Review each project's MDX case study for accuracy and completeness
- Analyze and standardize development timeline conventions across all projects
- Fix list/grid view toggle on /work page (currently non-functional)

### Iframe Preview Fixes
- OpenChambers: load the feed page instead of the welcome screen (URL param or route change)
- Datathon Water Dashboard: center the view on the Texas map on initial load
- Add visually interesting placeholder images for projects without live embeds

### Load Speed
Run Lighthouse audit. Fast portfolio = trust signal. Slow = neglect signal.

### CTA Language Variation
Don't use the same "Hire Me" everywhere. Vary: "Let's talk about your project", "Book a call", "See how this works", "Get in touch".

### Contact Page Improvement
- Add a calendar booking link (Calendly or Cal.com) alongside the form
- "Book a 20-minute intro call" converts better than a contact form alone
