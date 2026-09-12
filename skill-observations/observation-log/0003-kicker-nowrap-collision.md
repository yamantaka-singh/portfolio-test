---
id: 3
status: actioned
skill: frontend-design
siblings_checked: checked, no propagation — only .kicker uses the unbreakable-pill-plus-label pattern
title: shared .kicker row squeezed its label into overlapping the pill when the pill's own text was long
resolved: 2026-09-12
resolution: added flex-wrap wrap to .kicker in src/styles/global.css
---

## Issue
Continuation of the same user report ("consistency issues in the marquee strip" / "last section slipped to the right") — a second, separate bug found in the same debugging pass, specific to Boundary at mobile width (375px): the "COLLABORATION TERMINAL" pill visually overlapped "THE BOUNDARY // PARTNERSHIPS & ENQUIRIES".

## Root cause
`.kicker` (global.css) is a flex row with the default `flex-wrap: nowrap`, holding two children: an unbreakable `.hud-pill` (`white-space: nowrap`) and a plain-text label. With nowrap, both must fit on one line; the pill (fixed by its own unbreakable content) takes whatever width it needs, and the label shrinks into whatever is left. For Pitch's short pill ("VIRAL ARCHIVE", 168px) that leaves 183px for the label in a 351px row — fine. For Boundary's longer pill ("COLLABORATION TERMINAL", 245px) that leaves only 58px in a 303px row, forcing the label to wrap into many very short lines that overflow the row's height and visually collide with the pill above it.

This is a latent bug in the shared component, not a Boundary-specific override — it was invisible for every section with a short pill label and only surfaced on the one section with the longest pill text, which is why it looked like a Boundary-only ("last section") problem.

## Fix
`.kicker { flex-wrap: wrap; }` — the pill now sits on its own line and the label wraps cleanly below it whenever both don't fit on one line. Verified live at 375px: no overlap, no horizontal overflow. Re-verified Pitch's kicker (short pill) renders identically to before — wrap only changes behavior when nowrap would have caused a squeeze. 25/25 tests and the pipeline verifier still pass.
