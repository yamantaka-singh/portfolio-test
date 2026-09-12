# ADR-0001: Scroll-scrubbed stadium video (image sequence on one canvas) + DOM sections

## Status
Accepted — 2026-09-12. Replaces the earlier draft of this ADR (hybrid R3F 3D
hero + 2.5D parallax), which was never built. Real-time 3D was dropped during
the second grilling round.

## Context
The concept is a scroll journey through a cricket stadium across six zones
(ADR-0006). The user dropped real-time 3D ("stick to the video of the 3D
stadium"). Most traffic arrives from Instagram/YouTube bio links, i.e. phones
inside in-app browsers, so weight and smoothness on mid-range phones decide
whether the concept lands at all.

## Decision
- The stadium flythrough is a pre-made video (ADR-0002), exported as an
  **image sequence** and drawn to a **single `<canvas>`** fixed behind the
  page. GSAP ScrollTrigger maps scroll position to frame index (`scrub`), so
  scrolling moves the camera forward and back.
- All text, stats, thumbnails and CTAs are **real DOM** layered over the
  canvas: crawlable, accessible, selectable.
- **Frames load per zone**: only the current zone's sequence plus the next
  one's are fetched. Starting budgets (tune on a real device):
  - desktop: ~60 frames/transition, 1600px wide, AVIF, ~40KB each
  - mobile: ~30 frames/transition, 720px wide, AVIF, ~15KB each
- **Fallbacks** reuse the six approved keyframe stills (ADR-0002) as static
  section backgrounds:
  - `prefers-reduced-motion`
  - no JS
  - frame load failure
- **LCP**: the first keyframe still ships as `<img fetchpriority="high">` and
  the canvas takes over once frames are ready.

## Alternatives Considered
- **Real-time R3F 3D stadium** (previous draft): rejected by the user. It
  needed a 3D model, shader work and device tiering.
- **Single `<video>` with `currentTime` scrubbing**: smaller download (one
  MP4), but seeking stutters on iOS Safari and in-app browsers unless the
  file is encoded all-intra, which makes it as heavy as frames anyway.
  Fallback option if frame bandwidth proves too high.
- **Clip plays once per section**: lighter, but scrolling back doesn't rewind,
  so the "walking through the stadium" feel is lost.

## Consequences
- The biggest performance risk moves from GPU to **bandwidth**. Frame
  budgets are the calibration knob, not fixed numbers; Phase 4 measures on
  a real mid-range Android over 4G.
- Frame count is limited by Veo clip length and quality, so camera motion
  must be designed at keyframe stage (ADR-0002), not fixed later in code.
- No WebGL anywhere: no GPU tiering and no context-loss handling.
