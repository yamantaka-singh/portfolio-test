# ADR-0003: One-time Scrapling seed, live pipeline deferred

## Status
Accepted — 2026-09-12

## Context
The site needs real content from Abhishek's Instagram (`@abhishekpandey_26`,
`@spinandswing26`), YouTube (`@spinandswing26`, `@abhishekunseen26`), and
LinkedIn (`abhishek-pandey-26sep03`) — posts/videos, follower/subscriber
counts, and profile info, for the Pitch, Scoreboard, and Stands sections.
The user confirmed a two-step approach: build the one-time seed first, defer
the live/scheduled pipeline to later.

## Decision
Phase 1 runs Scrapling once against the four accounts above, writing
structured output to a committed `data/social.json`. This file is manually
reviewed/curated before the frontend consumes it. The site reads this file
as static data at build time — no runtime scraping, no scheduled job, no
backend in this phase.

LinkedIn is included in scope, but flagged as unreliable: LinkedIn has
strong anti-bot defenses, so if Scrapling fails against it, the fallback is
a manual link/badge to the profile rather than blocking the phase.

A live re-scrape pipeline (scheduled job, database-backed, auto-refreshing
stats) is explicitly out of scope for this plan and deferred to a future
phase.

## Alternatives Considered
- **Live pipeline from the start**: rejected per explicit user direction —
  adds a scheduled job, storage, and ongoing anti-bot maintenance burden
  before there's even a working static site.
- **Manual content entry, no scraping at all**: rejected — the user
  specifically wants Scrapling used against the real accounts rather than
  hand-typed placeholder content.

## Consequences
- Stats/content on the live site will go stale until the deferred live
  pipeline is built; this is accepted, not a bug.
- `data/social.json`'s shape becomes a de facto contract for Phase 4's
  components; changing it later (when the live pipeline is built) means
  updating those components too.
- LinkedIn data is best-effort; no phase should assume it will be present.
