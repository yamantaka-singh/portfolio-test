# ADR-0007: Astro static + GSAP ScrollTrigger + plain CSS tokens; web3d gate order without its checker

## Status
Accepted — 2026-09-12

## Context
With real-time 3D dropped (ADR-0001), the page is:
- one canvas scrubbing an image sequence
- five DOM sections reading a committed JSON file
- two link buttons

There's no React-specific need, no server (ADR-0005), and the audience is
mostly on phones in in-app browsers, where shipped JavaScript directly costs
load time.

The user's `web3d-skills` suite was chosen as the backbone before 3D was
dropped. Its gate checker (`gate-check.mjs`) cannot be reused as-is:
- Its `assets` gate fails when there are no `.glb/.gltf` files.
- Its budgets are GLB and polygon budgets.

Versions checked on npm, 2026-09-12:
- `astro` 7.3.2
- `gsap` 3.15.0 (standard no-charge licence, all plugins included)
- `lenis` 1.3.26

## Decision
**Framework**
- **Astro 7**, `output: 'static'`.
- Sections are `.astro` components. The only client JS is:
  - the scrub engine
  - the tap-to-play facades
  - the count-up numbers

**Motion**
- **GSAP 3.15 ScrollTrigger** for scrub and section reveals, using
  `scrub: 1` smoothing.
- **No Lenis** at first. Add it only if the desktop scrub feels steppy on a
  real device.

**Styling**
- **Plain CSS custom properties** in `src/styles/tokens.css` plus Astro
  scoped styles.
- **No Tailwind**: one page with bespoke components doesn't need a utility
  framework.

**Data**
- Astro content collection with a zod schema over `src/data/social.json`
  (ADR-0003).

**Images**
- Astro `<Image>` for thumbnails and photos.
- Frames are pre-exported by ffmpeg (ADR-0002) and served from `public/`.

**Analytics**
- Vercel Web Analytics.
- Custom events for WhatsApp and email clicks, which are the only conversion
  signal (ADR-0006).

**Gates**
- Keep web3d's gate **order** and its rule that a gate closes only on
  **evidence on disk or at a URL**:
  scope → art → assets → look → motion → ux → perf → ship.
- The `scene` gate becomes the canvas stage and is folded into `motion`.
- The per-gate evidence list lives in the spec.
- `gate-check.mjs` and `.web3d/build.json` are **not used**.

## Alternatives Considered
- **Next.js + GSAP**: most local skills assume it, and React would be ready
  for a future dashboard. Rejected because it ships a React runtime for a
  static page with no React need.
- **Keep the full web3d stack (Next.js + R3F)**: rejected, since nothing uses
  3D.
- **Tailwind v4**: rejected as an extra dependency and config for one page.
  Tokens as CSS variables do the same job natively.
- **Fork `gate-check.mjs` to accept no-GLB builds**: rejected. A checker for
  eight gates on a one-page site costs more to maintain than an evidence
  table a reviewer opens.

## Consequences
- **Skills**: React/Next-specific skills drop out of the plan. Antigravity
  already has an `astro` skill locally.
- **Future dashboard**: if an admin or dashboard is ever needed, it's a
  separate app or an Astro island, not a rewrite.
- **Manual gates**: gate evidence is checked by a person on the preview URL,
  not by a script. That's acceptable, since every gate already has a human
  reviewer (ADR-0004).
