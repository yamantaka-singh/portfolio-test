---
id: 2
status: actioned
skill: frontend-design
siblings_checked: checked, no propagation — the auto-track-blowout pattern is specific to Zone.astro's overlay grid; no other grid-stack overlay exists elsewhere in this codebase
title: implicit CSS Grid tracks on an overlay section let a max-content marquee blow out the layout
resolved: 2026-09-12
resolution: added explicit grid-template-columns/rows minmax(0, 1fr) to .zone in src/components/Zone.astro
---

## Issue
User reported: "the last section has slipped to the right" and "consistency issues in the marquee strip." Reproduced live at desktop (1450px) and mobile (375px) widths.

## Root cause
`.zone` in `src/components/Zone.astro` is `display: grid` with no `grid-template-columns`/`grid-template-rows`. Implicit grid tracks size themselves to `auto`, which is a max-content-based track-sizing algorithm — it runs during layout independent of any descendant's `overflow: hidden`. Every `data-zone` section stacks `.zone-still`, `.zone-content` and `.zone::after` on the same grid cell; `.zone-content` carries the section's real content, including (on Pitch/Stands/Boundary) a ticker built as `.marquee-track { width: max-content }` holding two un-breakable copies of the ticker text side by side for the seamless-loop trick.

That `max-content` width bubbles up through the implicit `auto` track regardless of the marquee's own `overflow: hidden` wrapper (overflow only clips *painting*, not ancestor intrinsic-size computation), forcing `.zone`'s column track — and therefore `.zone-content`'s `width: min(100%, 86rem)` — to size against the ticker's full un-looped width instead of the viewport. Confirmed live: Boundary's column track computed to 2499.73px (from its ~2495px marquee track) against a 720px viewport; Pitch/Stands to 1413.86px; Scoreboard/Pavilion (no marquee) were unaffected at ~631–642px. This produced a different width/x-offset per section — the "consistency" issue — with Boundary's being the most extreme, read as "slipped to the right" since its `.zone-content` rendered at x=561–602px instead of centered.

## Fix
```css
.zone {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  ...
}
```
`minmax(0, 1fr)` makes the track fill available space instead of sizing to content — the Grid equivalent of flexbox's `min-width: 0` fix for an overflow-causing flex child. Verified: all five zones now render `.zone-content` at identical width/x at both 1450px and 375px viewports, zero horizontal overflow, all 25 tests + full pipeline verifier still pass.

## Sibling check
Grepped for other `display: grid` overlay/stack patterns (`grid-area: 1 / 1`) — Zone.astro is the only one. No propagation needed.
