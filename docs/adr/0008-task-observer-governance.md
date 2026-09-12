# ADR-0008: task-observer ("One Skill to Rule Them All") governs every skill

## Status
Accepted — 2026-09-12

## Context
This build runs on about 38 pinned skills from nine sources (superpowers,
Scrapling, ui-ux-pro-max, anthropics, vercel-labs, ponytail, web3d-skills,
taste-skill, mattpocock/skills, plus Antigravity globals). They overlap and
sometimes contradict each other and the spec. For example, taste-skill's
`design-taste-frontend` defaults to React/Next.js and Tailwind v4, while
ADR-0007 fixes Astro and plain CSS.

Work is done by fresh agents per task, often in parallel worktrees, often on
a fast model. Without a governor, each agent resolves those conflicts on its
own, silently, and nothing learned in one task reaches the next.

The user's requirement: `one-skill-to-rule-them-all` must "literally rule
them all".

Facts about task-observer v3 (`rebelytics/one-skill-to-rule-them-all`,
checked 2026-09-12):
- **Activation has four tiers:** description matching, user-level
  preferences, a project config instruction, and a harness hook. Only a hook
  is enforced; the lower three are probabilistic and are best stacked.
- **The log lives at one stable absolute path**, one Markdown file per
  observation, so parallel sessions never overwrite each other. It must
  never sit inside a worktree or a skills-discovery directory.
- **It never installs skill changes itself.** Updates are staged in
  `skill-updates/`, validated by `scripts/validate-skill-bundle.py`, and
  installed only after the user approves them.
- **Its session start asks one question once**, about seeding starter
  principles, then writes a marker file and never asks again.

Antigravity reads `AGENTS.md` and `GEMINI.md` at session start and applies
`.agents/rules/*.md` files marked `trigger: always_on` (12,000 characters
each). No documented session-start hook exists.

## Decision
1. **Installed first.** Task 1 installs `task-observer` before any other
   skill or any real work.
2. **Every activation tier the platform offers:**
   - **Tier 3, twice:** `AGENTS.md` carries the verbatim v3 activation block.
     `.agents/rules/00-task-observer.md` repeats it with
     `trigger: always_on`. `CLAUDE.md` imports `AGENTS.md`, so the same rules
     apply if Claude Code runs a task.
   - **Tier 2:** one probe line in the user's global `~/.gemini/GEMINI.md`,
     added with the user's OK.
   - **Tier 4 is unavailable** in Antigravity. The backstops are the
     activation block's per-task one-line observation summary and the
     verifier's `governance` gate.
3. **Pinned workspace:** `/Users/kaalu/projects/abhishek-portfolio`, the main
   checkout. All parallel agents write their observations there, never into
   their worktree.
4. **Precedence** (written into `AGENTS.md`):
   1. The user's decisions at gates
   2. The spec, the ADRs and the plan's Global Constraints
   3. task-observer's protocol
   4. Every other skill

   A skill rule that contradicts a higher level is not followed, and the
   conflict is logged as an observation against that skill.
5. **Skills change only through task-observer.** No hand edits to
   `.agents/skills/`. The path is: observation → staged copy → validator →
   user approval at the next human gate → copy into `.agents/skills/` →
   commit. A skill found with `npx skills find` enters as a `proposes_skill`
   observation and is installed only after approval.
6. **Gate review at every human gate (G0–G7):**
   - Commit the log from the main checkout.
   - Run the review in interactive mode, reading bodies and bucketing by
     skill.
   - Present it alongside the gate question.
   - Install only what the user approves.

   Task 23 runs the full review of the whole build before launch.
7. **Verifier:** `scripts/verify-pipeline.mjs` has a read-only `governance`
   row. It checks both config files, the always-on trigger, the installed
   skill, and the log at the pinned path.

## Alternatives Considered
- **Install it as one more skill and rely on description matching:** the
  skill's own author documents this as unreliable. That would be ruling in
  name only.
- **Let agents edit skills directly when they notice a problem:** no audit
  trail, parallel worktrees editing the same skill collide, and it violates
  task-observer's staging-only rule.
- **A log per worktree or per session:** worktrees are torn down with their
  observations, and parallel logs become silent forks.
- **Review only at the end (Task 23):** lessons from Phase 1 would not reach
  Phases 2–5, and a backlog of a whole build is too large to review well.
- **Pin `gpt-taste` too:** it mandates React, Tailwind, `@gsap/react`, a nav
  bar, AIDA sections and a simulated Python randomisation step. That
  contradicts ADR-0006 and ADR-0007 in every task, and would log the same
  conflict on every run. It can be added through the observation path if the
  spec ever changes.

## Consequences
- **Slower gates:** every gate carries a review. The review scales its
  content, not its frequency, and never blocks the task itself.
- **Committed history:** `skill-observations/` and `skill-updates/` are
  committed from the main checkout, so how each skill evolved during this
  build is part of the repo.
- **Machine-specific path:** the pinned workspace path is absolute. Moving
  the project to another machine means changing it in `AGENTS.md` and the
  rule file in one commit; the `governance` verifier row fails until both
  agree.
- **Protected installs:** `scripts/install-skills.sh` skips skills that
  already exist, so re-running it can never overwrite updates the user
  approved.
