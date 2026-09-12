# ADR-0006: Single-page, six-section structure

## Status
Accepted — 2026-09-12

## Context
The stadium concept is a continuous narrative (tunnel → pitch → scoreboard →
stands → pavilion → boundary rope). The site needed a decision on whether
that narrative is a single scrolling page or split across routed pages.

## Decision
Single page, six sections, no client-side routing:
1. Hero (Tunnel → Bowl)
2. Pitch (Highlights)
3. Scoreboard (Stats)
4. The Stands (Social feed)
5. Pavilion (About)
6. Boundary Rope (Contact)

## Alternatives Considered
- **Multi-page** (Home, Reels, Stats, About, Contact as separate routes):
  better suited to large content volume or per-page SEO targeting, but
  breaks the continuous scroll-journey narrative that is the core of the
  concept, and the current content volume (a handful of highlight videos, a
  stats summary, a social grid) doesn't need separate routes.

## Consequences
- All content for the page loads together; code-splitting (especially the
  R3F hero, per ADR-0001) carries more weight than route-based splitting
  would provide elsewhere.
- SEO (Phase 5) has to work within a single-URL constraint — structured data
  and meta tags describe one page, not per-section pages.
- Deep-linking to a specific section (e.g. "the stats section") would need
  in-page anchors/scroll-to, not real routes, if ever needed later.
