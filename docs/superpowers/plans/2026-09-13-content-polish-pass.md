# Content & Polish Pass — Implementation Plan

Bounded edit batch against the live site (not a new architecture — no new ADR/spec). Governed by `AGENTS.md` / task-observer (ADR-0008) as always; skills tagged per group are pulled from `.agents/skills/` where already pinned.

Root-cause diagnosis (systematic-debugging, before any fix): reproduced every "cut off" / "overflow" complaint live at 375px before touching CSS. One systemic bug found: several `grid-template-columns` declarations use bare `1fr` instead of `minmax(0, 1fr)`, so a grid track's default min-content sizing can blow the track out past its container — the exact same class of bug fixed in `Zone.astro` in the previous session, recurring in Pavilion/Hero/Boundary/Scoreboard because that fix was applied to one file, not the pattern. Fixing all occurrences now.

## Group 0 — Root-cause grid fix (blocks item 11)
- `Boundary.astro`, `Hero.astro`, `Pavilion.astro`, `Scoreboard.astro`: every bare `Nfr` grid-template-columns → `minmax(0, Nfr)`.
- Skills: `diagnosing-bugs` (already used to trace it), `ponytail` (fix the pattern, not the one site).

## Group 1 — Hero.astro (items 1b, 2, 4, 5, 6, 8)
- Remove "LIVE ON AIR · CAM 01" and coordinates pills (item 4).
- Remove "LEAD ANALYST" badge on the accreditation card (item 5).
- Metric ribbon: "BGT & IPL" → "CRICKET" (item 1b).
- Bottom marquee: "180K+ SUBSCRIBERS" → "44.2K SUBSCRIBERS"; remove "BORDER-GAVASKAR TROPHY" segment (item 6).
- Shrink `.metric-ribbon` numbers and hero vertical rhythm so the section fits closer to one mobile viewport (item 8) — reduce `.metric-num` clamp ceiling and hero gaps at `max-width: 40rem`.
- Marquee full-bleed audit (item 2): Hero's ribbon is already edge-to-edge (verified: 375px = viewport at 375px width) — no fix needed there; the "cut" complaint is addressed by Group 3's full-bleed fix on Stands/Boundary, which are the ones actually inset.
- Skills: `frontend-design`, `web-design-guidelines`.

## Group 2 — Global recolor: neon → maroon (item 17)
- `tokens.css`: `--color-neon` lime → vivid rose-maroon (kept as text/border/icon accent, needs to stay legible on near-black); new `--gradient-neon` deep-maroon gradient for solid button/chip fills; `--glow-neon` recomputed to the new RGB.
- Every hardcoded `rgba(204, 255, 0, …)` literal (27 occurrences, 9 files) → the new maroon RGB triplet.
- The 6 sites using `background: var(--color-neon); color: var(--color-bg);` (button/chip fills) → `background: var(--gradient-neon); color: #fff;` (dark text on a bright lime fill needs to become light text on a dark maroon fill).
- Skills: `design-system`, `accessibility-auditor` (re-check contrast after the swap — a maroon fill with white text and a maroon accent on near-black both need verifying, unlike lime which had contrast to spare).

## Group 3 — Marquee content + full-bleed (items 2, 6, 10, 13, 14)
- Stands' `.community-ribbon` and Boundary's `.boundary-marquee`: break out of the padded content column to span the full viewport edge-to-edge (items 10, 14), using the standard `width:100vw; left:50%; margin-left:-50vw` full-bleed technique.
- Boundary's marquee: remove "BORDER-GAVASKAR TROPHY & IPL SLOTS" (item 14).
- Hero's marquee: remove "BORDER-GAVASKAR TROPHY" (item 6, done in Group 1) — after this, diff Hero's vs Boundary's remaining marquee copy so they're not repeating the same phrases (item 13); rewrite one side's wording if they still overlap.
- Skills: `scroll-experience`, `frontend-design`.

## Group 4 — Pitch.astro / Stands.astro sorting (items 7, 9)
- **No code change** — verified live: Pitch already sorts `social.videos` by `views` descending and Stands already sorts `social.posts` by `likes` descending (Instagram has no `views` field in the scraped schema, only `likes`; using it as the closest available engagement proxy). Reporting this as already-correct rather than re-touching working code.
- Skill: none (verification only).

## Group 5 — Pavilion.astro (items 12)
- Career Innings #4 (2026): remove "180K+ community, " from the description.
- Career Innings #2: `2023` → `2025` (flagged: this duplicates #3's existing `2025 · INNINGS 03` — applying literally as asked, calling it out for a decision on the timeline's actual years).
- Skills: `frontend-design`.

## Group 6 — Boundary.astro (items 1a, 15, 16, 18, 19a)
- Official Channels Registry: platform icon (lucide `Instagram`/`Youtube`/`Linkedin`) instead of the text label; the handle becomes the primary visible text (item 1a, 18).
- Accreditation seal: "OFFICIAL BCCI & DPL FIELD-OF-PLAY ACCREDITED MEDIA" → "DPL FIELD-OF-PLAY ACCREDITED MEDIA" (item 18).
- Remove the WhatsApp CTA, keep only email; delete the now-dead `whatsappUrl` helper, its tests, `/go/whatsapp` page, and `site.whatsapp` (item 15 — ponytail: delete dead code, git remembers).
- Shrink `.contact-cta` padding/font-size (item 16).
- Colophon: remove "ENGINEERED WITH ASTRO & LENIS" (item 19a).
- Skills: `frontend-design`, `ponytail`.

## Group 7 — BroadcastDock.astro (item 19b)
- Remove the "MATCHDAY LIVE" status text (and its rec-dot + divider, since a label-less dot reads as broken) from the dock's left cluster; keep the clock.
- Skill: `frontend-design`.

## Verification
- `npm test`, `node scripts/verify-pipeline.mjs` after every group.
- Live check at 375px and desktop widths for every touched section (real `document.documentElement.scrollWidth` overflow check + the DOM-walk "widest child" check that actually caught item 11 — page-level scrollWidth alone misses overflow an ancestor's `overflow:hidden` silently clips).
- `accessibility-auditor` pass specifically on the new maroon palette (Group 2) before shipping.
