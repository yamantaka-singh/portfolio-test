# ADR-0002: Gemini-generated 2D concept art as the primary visual asset source

## Status
Accepted — 2026-09-12

## Context
The stadium concept needs six distinct zone visuals (tunnel, pitch,
scoreboard, stands, pavilion, boundary rope). There is no existing brand
art, no photographer, and no 3D artist on this project. The user specified
Gemini should generate the visual assets rather than sourcing stock photos
or modeling a full 3D environment from scratch.

## Decision
Gemini generates one 2D concept-art piece per stadium zone (six total),
locked to a single style reference generated first and reused as a prompt
anchor for the other five, to keep visual consistency. These images serve
two purposes:
1. Direct use as the 2.5D parallax layer art for zones 2–6 (Pitch,
   Scoreboard, Stands, Pavilion, Boundary Rope).
2. Style/mood/texture reference for the Phase 3 R3F hero scene — the 3D
   scene is built to match the generated art's palette and mood, not
   modeled from real stadium photography.

This is Phase 1 work and is a hard prerequisite for Phase 2 (design system)
and Phase 3 (hero), since the palette and type direction in Phase 2 are
derived from this art.

## Alternatives Considered
- **Photo-real generated imagery**: rejected — a stylized/illustrated
  direction is easier to keep consistent across six independently-generated
  images than photo-real output, and better matches an "exclusive,
  non-generic" brief than photo-real AI imagery (which tends to read as
  generic/stock-like).
- **Stock photography / licensed imagery**: rejected — conflicts with the
  "exclusive design" requirement and the explicit choice to use Gemini for
  asset creation.
- **Fully hand-modeled 3D stadium environment**: rejected as the sole asset
  source — see ADR-0001; would also require 3D-modeling skill/time not
  budgeted here.

## Consequences
- Visual consistency across six independently-generated images is a real
  risk; the style-reference-first approach mitigates but does not eliminate
  it. A human style-approval checkpoint after generating the reference image
  (before generating the other five) is required.
- The design system (Phase 2) cannot start meaningfully until this phase's
  art exists — it is a hard sequencing dependency, not just a suggestion.
- If Gemini output for a given zone is unusable, the phase blocks on
  re-generation rather than silently falling back to stock imagery (which
  would violate this ADR).
