# Abhishek Pandey — Cricket Content Creator Portfolio — Design Spec

Date: 2026-09-12
Status: Draft, pending review

## 1. Goal

An Awwwards-tier, single-page portfolio for Abhishek Pandey, a cricket content
creator, structured as a scroll journey through a stadium — tunnel, pitch,
scoreboard, stands, pavilion, boundary rope. Not a template site: bespoke
palette, bespoke type, a real 3D hero moment, real content pulled from his
own social accounts.

Sources:
- Instagram: `@abhishekpandey_26`, `@spinandswing26`
- YouTube: `@spinandswing26`, `@abhishekunseen26`
- LinkedIn: `linkedin.com/in/abhishek-pandey-26sep03`

## 2. Narrative arc (six zones, one page)

1. **Tunnel → Bowl (Hero)** — 3D flythrough, name/tagline reveal, scroll cue
2. **The Pitch (Highlights)** — featured YouTube reels/highlights
3. **Scoreboard (Stats)** — follower/subscriber/view counts as a jumbotron
4. **The Stands (Social feed)** — Instagram grid + YouTube thumbnails
5. **Pavilion (About)** — Abhishek's story
6. **Boundary Rope (Contact)** — CTA, socials, LinkedIn badge, footer

## 3. Architecture summary

Full decisions are recorded as ADRs in `docs/adr/`. Summary:

- **Rendering**: hybrid — a real React Three Fiber 3D flythrough for the hero
  only, everything else is DOM + GSAP/Lenis layered 2.5D parallax
  ([ADR-0001](../../adr/0001-rendering-architecture.md))
- **Assets**: Gemini generates 2D concept/style art per stadium zone; that
  art both informs the 3D hero's look (textures/mood reference) and is used
  directly as the 2.5D parallax layers for zones 2–6
  ([ADR-0002](../../adr/0002-asset-generation-pipeline.md))
- **Data**: Scrapling, one-time seed scrape of Instagram + YouTube + LinkedIn
  into a committed `data/social.json`; a live re-scrape pipeline is
  explicitly deferred to a later phase
  ([ADR-0003](../../adr/0003-data-acquisition-pipeline.md))
- **Execution split**: this repo's planning (spec + ADRs + phased plan) is
  produced in Claude Code; actual implementation is executed by Gemini
  Antigravity, which has its own MCP/skill-invocation support
  ([ADR-0004](../../adr/0004-execution-tooling-split.md))
- **Hosting**: Vercel ([ADR-0005](../../adr/0005-hosting.md))
- **Structure**: single page, six sections, no routing
  ([ADR-0006](../../adr/0006-site-structure.md))

Stack: Next.js (App Router) + React + TypeScript, React Three Fiber + drei
(hero only, dynamically imported, SSR-disabled), GSAP ScrollTrigger + Lenis,
Tailwind v4 with a custom token layer, Scrapling (Python) for data.

## 4. Phases (by architecture layer)

Each phase is independently buildable and testable before the next starts.
Per phase: goal, required capabilities, local skills to use, and the
instruction to fall back to a web/MCP search if a needed capability has no
matching local skill.

### Phase 1 — Data & asset pipeline
- Scrapling script scrapes Instagram, YouTube, LinkedIn → `data/social.json`
  (reviewed/curated by hand before use, not auto-published)
- Gemini generates the six zone concept-art pieces (style reference + usable
  2.5D layer art)
- Capabilities needed: web scraping (Scrapling), image generation (Gemini
  API/MCP)
- No frontend code yet

### Phase 2 — Design system
- Palette, type pairing, spacing/motion tokens derived from the Gemini art
  and real cricket-ground references (willow, turf, red-ball, floodlight) —
  no default Tailwind theme
- Local skills: `design-system`, `premium-web-design`
- Output: a token spec + component inventory, not final pixel mockups

### Phase 3 — Hero & core scroll mechanics
- R3F tunnel-to-bowl flythrough, dynamically imported, SSR-disabled
- Lenis smooth scroll + GSAP ScrollTrigger scaffolding for the whole page
- `prefers-reduced-motion` / low-end fallback: static hero poster/video loop,
  no R3F mounted
- Local skills: `3d-web-experience`, `scroll-experience`

### Phase 4 — Remaining sections
- Build Pitch, Scoreboard, Stands, Pavilion, Boundary Rope as independent
  components consuming `data/social.json` and the Phase 1 art
- Local skills: `frontend-design`, `nextjs-app-router-patterns`,
  `react-best-practices`

### Phase 5 — SEO, accessibility, performance polish
- Meta/OG tags, `Person` + `VideoObject` schema, sitemap
- Contrast, reduced-motion, keyboard/focus pass on a visually loud page
- Lighthouse budget pass on the finished build; bundle check on the R3F
  hero specifically (it's the single biggest perf risk)
- Local skills: `seo-optimizer`, `accessibility-auditor`,
  `performance-optimizer`

### Deferred (explicitly out of scope for this plan)
- Live/scheduled re-scrape pipeline (Phase 1 is a one-time seed only)
- LinkedIn scraping reliability is known-fragile (anti-bot); if it fails,
  fall back to a manual badge/link rather than blocking Phase 1

## 5. Skill/tool sourcing rule (applies to every phase)

Gemini Antigravity supports MCP tools and skill-style invocation, so each
phase above names the local skills it expects to use. If the executing agent
lacks a matching local skill or MCP tool for a capability a phase needs, it
should search the web (or an MCP/skill registry) for an equivalent before
implementing that phase from scratch — this repo's skill list is a starting
point, not the ceiling.

## 6. Testing/QA

- Visual QA on real mobile + desktop devices (not just desktop Chrome),
  given the 3D hero and heavy motion
- Lighthouse CI thresholds for LCP/INP/CLS
- Manual check: reduced-motion path and no-WebGL fallback both render
  correctly with no missing content
- Manual check: page remains crawlable/readable with JS/WebGL disabled
  (all real copy lives in the DOM, never baked into canvas/images)

## 7. Open risks

- LinkedIn scraping via Scrapling may simply fail (strong anti-bot) — see
  Phase 1 fallback above
- 3D hero is the main performance risk; Phase 3's fallback path is not
  optional
- Gemini-generated art style must stay consistent across six zones — worth
  locking a style reference in Phase 1 before generating all six
