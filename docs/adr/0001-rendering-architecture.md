# ADR-0001: Hybrid rendering — 3D hero + 2.5D layered scroll

## Status
Accepted — 2026-09-12

## Context
The site's concept is a scroll journey through a cricket stadium (tunnel →
pitch → scoreboard → stands → pavilion → boundary rope). It needs to feel
like an Awwwards-tier immersive experience while staying "very optimised"
(explicit user requirement) and shippable by a single execution pass.

## Decision
Use a **hybrid** rendering approach:
- The hero section (tunnel-to-bowl entrance) is a real React Three Fiber 3D
  scene, dynamically imported and rendered client-side only.
- All five remaining sections are DOM + CSS transforms, animated with GSAP
  ScrollTrigger and Lenis smooth scroll — layered 2D art (from ADR-0002)
  creates parallax depth, not a real 3D scene.
- Low-end devices and `prefers-reduced-motion` disable the R3F hero entirely
  in favor of a static poster or looping video.

## Alternatives Considered
- **Full 3D throughout**: most literal "walk through a stadium," but a full
  3D stadium scene across every section multiplies asset budget, draw calls,
  and mobile GPU risk — directly conflicts with the "very optimised"
  requirement and with using AI-generated 2D art as the primary asset
  source.
- **2.5D only, no 3D at all**: safest for performance, cheapest to build, but
  drops the one moment (the tunnel walk-out) most likely to read as
  genuinely immersive rather than "a nice parallax site."

## Consequences
- Two rendering paradigms exist in the codebase (a canvas/WebGL layer and a
  DOM/CSS layer); the transition between them (end of hero → start of Pitch
  section) needs explicit choreography so it doesn't feel like two different
  sites stitched together.
- Performance budget is concentrated almost entirely in one component (the
  hero); Phase 5's performance pass must specifically profile it.
- The fallback path (no R3F mounted) is a first-class requirement, not an
  edge case — Phase 3 is not complete until that path is verified.
