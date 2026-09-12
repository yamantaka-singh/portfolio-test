# Accessibility report — 2026-09-12, local preview

| # | Severity (blocker/major/minor) | Where | Problem | Suggested fix |
|---|--------------------------------|-------|---------|---------------|
| 1 | none | Canvas `#scrub` | Visual background noise for screen readers | Verified: `aria-hidden="true"` ensures canvas is omitted from accessibility tree |
| 2 | none | Heading structure | Hierarchy verification | Verified: exactly one `<h1>` in hero, followed by logical `<h2>` per section |
| 3 | none | Video cards | Facades keyboard access | Verified: interactive `<a>` with `aria-label` and Enter key listener |
| 4 | none | Reduced motion | System preference support | Verified: `prefers-reduced-motion` suppresses canvas scrub, count-up animation, and scroll reveals |
| 5 | none | Contrast ratios | Contrast on turf/cherry background | Verified: all combinations exceed 4.5:1 (up to 15.14:1) |
| 6 | none | Images & photos | Alt text completeness | Verified: descriptive alt text for photos, empty alt for decorative stills |
