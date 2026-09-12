# ADR-0005: Vercel static hosting on a vercel.app subdomain

## Status
Accepted — 2026-09-12

## Context
The site has:
- no forms (ADR-0006: enquiries go to WhatsApp and email)
- no runtime data (ADR-0003: JSON is committed at build)
- no server-rendered personalisation

The user chose Vercel, and a free `vercel.app` subdomain until a domain is
bought.

## Decision
- Astro builds with `output: 'static'`. No server adapter is needed.
- Deploy to Vercel via Git integration: every push gets a preview URL, and
  `main` goes to production.
- Production URL: `<project>.vercel.app` (e.g. `abhishek-pandey.vercel.app`),
  set as `site` in `astro.config.mjs`. Canonical URLs, sitemap and Open Graph
  URLs derive from that one value.
- Preview URLs are the review surface for every human gate (ADR-0004).

## Alternatives Considered
- **Buy a domain now**: recommended during grilling for SEO from day one;
  deferred by the user.
- **Netlify / Cloudflare Pages**: equivalent for a static site, but the user
  already chose Vercel and there's no second target to design for.

## Consequences
When a domain is bought, the move is a checklist, not a rebuild:
1. Add the domain in Vercel.
2. Change `site` in `astro.config.mjs`.
3. Redeploy.
4. Add the domain to Google Search Console and submit the sitemap.
5. Keep the `vercel.app` URL redirecting to the new domain.

Search ranking built on the subdomain partially resets after the move. That
is accepted, since the site's main traffic is bio-link clicks, not search.
