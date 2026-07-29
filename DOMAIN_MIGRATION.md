# Domain migration — arath.site → arathindustries.com

Staged 2026-07-28. Nothing here has been executed. Two rulings by Arath the
same day set the target; the rest is the runbook for reaching it.

## Rulings

1. **arathindustries.com becomes primary.** arath.site redirects into it and
   stays registered permanently, so the resume PDF, GitHub profile links, and
   anything already printed keep resolving.
2. **Cloudflare Registrar for the name, Cloudflare Email Routing forwarding
   into the existing Gmail.** Accepted trade-off: Email Routing is
   inbound-only, so sending as the new address goes through Gmail's send-as.
   The mailbox is a records-only decision — moving to Zoho or Google Workspace
   later means changing MX records, not moving the domain. Registrar and
   mailbox are independent choices.

Availability verified 2026-07-28: `arathindustries.com`, `.net`, and `.org` all
returned RDAP 404 (unregistered). Re-check before buying — availability is a
point-in-time observation, and this one is already stale by the time you read it.

## Blocker

Cloudflare account status is **unverified** — nobody has confirmed the account
exists and is in a state that can register domains. This is the same blocker
recorded against search-lab site #1; one verification clears both. It needs a
browser login, so it is Arath's step, not one that can be scripted.

## Sequence

Steps marked **[A]** need Arath (payment, browser login, or an account only he
can reach). Steps marked **[C]** are scriptable or editable and can be handed
off once the prior step lands.

### 1. Register the name — [A]

Verify the Cloudflare account, then register `arathindustries.com` through
Cloudflare Registrar. Cloudflare sells at wholesale with no markup; the recorded
estimate is roughly $11/yr, which should be confirmed against the price shown at
checkout rather than trusted from this file. Consider `.net` defensively only if
you actually want it — it is not required by anything here.

### 2. Attach the domain to the existing Vercel project — [A] then [C]

In the Vercel dashboard, add `arathindustries.com` and `www.arathindustries.com`
to the portfolio-website project and set the preferred one as primary. Vercel
then displays the DNS records to create. Enter those values in Cloudflare DNS.

Use the values Vercel shows at that moment. For reference, the July 2026
wdwtwa cutover used apex `A → 76.76.21.21` and `www CNAME → cname.vercel-dns.com`,
but Vercel has changed these before and the dashboard is authoritative.

If Cloudflare's orange-cloud proxy is enabled on those records and the
certificate fails to issue, set them to DNS-only (grey cloud) and retry.

### 3. Redirect arath.site — [A]

Keep arath.site registered at Bluehost and keep its DNS pointed at Vercel.
Configure the redirect **in Vercel**, on the domain itself, rather than in the
app: add arath.site to the same project and set it to redirect to
arathindustries.com. Vercel issues a 308 permanent redirect, which is what the
2026-07-28 IA burst redirects already use.

Do not let arath.site lapse. A redirect only works while the name is yours.

### 4. Update the site's own references to itself — [C]

Six places in this repo hardcode the domain. All are one-line changes, and the
build will not catch them because none of them break:

| File | What |
|---|---|
| `src/app/layout.tsx` | `metadataBase` — controls every Open Graph and canonical URL |
| `src/app/sitemap.ts` | `baseUrl` — every sitemap entry |
| `public/robots.txt` | header comment and the `Sitemap:` line |
| `src/app/work/page.tsx` | the portfolio-website featured card's `live` URL |
| `content/projects/portfolio-website.mdx` | frontmatter `live` (the prose timeline entry is historical and stays) |
| `.claude/ROUTING.md` | External references block |

`metadataBase` is the one with real consequence: leave it stale and every social
preview and canonical tag keeps pointing at the redirecting domain.

### 5. Inbound mail — [A]

In Cloudflare, enable Email Routing on arathindustries.com. It offers to create
the MX and TXT records; accept. Add the existing Gmail address as a destination
and confirm the verification mail. Then create the rule — a specific
`arath@arathindustries.com` route is easier to reason about than a catch-all,
which will collect spam once the domain is crawled.

### 6. Outbound mail — [A]

Gmail → Settings → Accounts and Import → "Send mail as" → add
`arath@arathindustries.com`. Gmail sends the verification to that address, which
Email Routing forwards back to the same inbox.

Then add sender records in Cloudflare DNS so the mail authenticates:

- **SPF** — a TXT record at the root: `v=spf1 include:_spf.google.com ~all`
- **DMARC** — a TXT record at `_dmarc`: `v=DMARC1; p=none; rua=mailto:arath@arathindustries.com`

Start DMARC at `p=none`, which reports without rejecting anything. Tighten it
only after the reports show legitimate mail passing.

**Verify before using it for anything that matters:** send a test message from
the new address to a Gmail account and a non-Google account, then open the
received message's headers and confirm SPF and DMARC show `pass`. The known
failure mode here is that mail sent via Gmail's send-as can fail DMARC alignment
because the envelope sender remains the Gmail account. This is reported from
documentation and has not been tested on these accounts — treat the header check
as the real evidence.

### 7. Everything downstream — [A] with [C] drafting

Once the address exists and passes the header check: regenerate the email
signature (drafts from 2026-07-18 are reusable with the address swapped), then
update the GitHub profile, LinkedIn contact block, and the resume PDF if it
prints a URL.

## Rollback

Through step 4 nothing is destructive: arath.site keeps serving until its
redirect is deliberately configured in step 3, and that redirect is reversible
by deleting it in Vercel. The one-way step is letting a registration lapse —
which is why arath.site stays renewed indefinitely.
