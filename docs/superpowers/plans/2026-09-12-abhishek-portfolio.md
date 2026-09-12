# Abhishek Pandey Portfolio Implementation Plan

> **For agentic workers (Gemini Antigravity):** `task-observer` governs this plan and every skill in it (ADR-0008). Load it and run its Session Start Protocol before your first tool call, as `AGENTS.md` and `.agents/rules/00-task-observer.md` require. Then REQUIRED SUB-SKILL: use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. All skills are pinned in `.agents/skills/` by Tasks 1–2. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-page Astro site where scrolling scrubs a stadium flythrough frame by frame, over real content from Abhishek Pandey's Instagram, YouTube and LinkedIn, ending in "book Abhishek" WhatsApp/email buttons.

**Architecture:** A static Astro 7 page with six `<section>` zones. One fixed `<canvas>` behind them draws AVIF frames chosen by GSAP ScrollTrigger progress; every zone also carries its keyframe still as a background, which is what users see without JS, with reduced motion, or if frames fail. Content comes from `src/data/social.json`, produced once by a Python Scrapling script and validated with zod at build.

**Tech Stack:** Astro 7.3, GSAP 3.15 (ScrollTrigger), plain CSS custom properties, Fontsource variable fonts, sharp, ffmpeg, Python 3.10+ with Scrapling 0.4.15, Vercel (static, Hobby), `node --test`, Python `unittest`.

**Spec:** `docs/superpowers/specs/2026-09-12-abhishek-portfolio-design.md` and `docs/adr/0001`–`0008`. Every agent reads the spec plus the ADRs its task header names.

## Global Constraints

- **task-observer rules them all (ADR-0008).** Every agent session invokes `task-observer` and runs its Session Start Protocol before the first tool call. Before applying any other skill, it greps the observation log for OPEN observations naming that skill and applies them. It ends every task with a one-line observation summary. Workspace: `/Users/kaalu/projects/abhishek-portfolio`, the main checkout, never a worktree.
- **Precedence when instructions conflict:** the user's gate decisions > the spec, the ADRs and these Global Constraints > task-observer's protocol > every other skill. If a skill's rule contradicts a higher level (e.g. a taste skill defaulting to React or Tailwind), follow the higher level and log an observation against that skill.
- **Skills change only through task-observer:** never edit `.agents/skills/` by hand. Observation → staged copy in `skill-updates/` → user approval at the next human gate → install. A skill found with `npx skills find` enters as a `proposes_skill` observation and is installed only after that approval.
- Node `>=22.19.0` (Astro 7.3.2 needs 22.12; Lighthouse 13 in Task 21 needs 22.19). Package manager: npm.
- `astro@^7.3.2`, `output` left at its static default, no server adapter.
- `gsap@^3.15.0`. No React, no Tailwind, no Lenis, no R3F.
- Python `>=3.10`, `scrapling[fetchers]==0.4.15`, `Fetcher` with `impersonate="chrome"`. Logged out. Never enter or store credentials.
- Pure logic lives in plain ESM `.js` files with JSDoc types, so `node --test` and Astro both import them with no build step.
- Frame budgets (calibration knobs, tune in Task 22): desktop 60 frames per transition at 1600px wide; mobile 30 frames at 720px wide; AVIF via sharp.
- Frame files: `public/frames/<transition-id>/<tier>/NNN.avif`, 1-based, zero-padded to 3 digits. Tiers: `desktop`, `mobile`.
- Transition ids, in order: `01-tunnel-pitch`, `02-pitch-scoreboard`, `03-scoreboard-stands`, `04-stands-pavilion`, `05-pavilion-boundary`.
- Zone ids, in order: `tunnel`, `pitch`, `scoreboard`, `stands`, `pavilion`, `boundary`.
- Keyframe files: `src/assets/keyframes/01-tunnel.jpg` … `06-boundary.jpg`, 16:9, 2560px wide, key action inside the centre third.
- Never generate Abhishek's likeness with AI. Photos of him come only from `src/assets/photos/`.
- English UI, Hinglish-toned copy where it fits. No i18n.
- All copy, stats and links are real DOM. Canvas is decoration only (`aria-hidden="true"`).
- `prefers-reduced-motion: reduce` or no JS → no canvas, static stills.
- Click counting: `/go/whatsapp` and `/go/email` page views (Vercel custom events need Pro).
- Performance targets (Lighthouse mobile): LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Shared files have one owner at a time, in this order: `src/styles/tokens.css` and `global.css` (Task 11); `src/pages/index.astro` (Tasks 10 → 11 → 19 → 20); `src/components/Zone.astro` (Tasks 10 → 11 → 19); `src/scripts/scrub.js` (Task 10, then Task 22 for its DPR knob only); `src/layouts/Base.astro` (Tasks 2 → 11 → 18 → 23).
- Commit style: `feat:`, `fix:`, `chore:`, `docs:`, `test:`. One commit per task minimum.

## How to run this plan in Antigravity

1. **One fresh agent per task.** Give it: this plan's Global Constraints, its own task, the spec, and the ADRs in its header. Nothing else.
2. **Model tier** in each header maps to Antigravity's picker: **Pro** = strongest available model, **Flash** = fast model.
3. **Skills** in each header are loaded from `.agents/skills/`, each one only after the OPEN-observation grep from `AGENTS.md`. If a task needs something none of them cover: `npx -y skills@1.5.26 find <keyword>`, then log the best match as a `proposes_skill` observation saying why. It is installed with `-a antigravity --copy` and appended to `scripts/install-skills.sh` only after the user approves it at the next gate.
4. **Parallel lanes** (below) run at the same time, each in its own git worktree (`using-git-worktrees` skill), merged back to `main` when the task's checks pass.
5. **Human gates (G0–G7):** the agent runs the *Gate review* below, then posts the Vercel preview URL (or file path), the exact gate question and the review, and waits. No task that depends on a gate starts before the user approves it.
6. **After every task**, a separate read-only verifier agent runs `node scripts/verify-pipeline.mjs` and pastes the table. It never edits, never retries, never asks; if a row that the task was meant to turn PASS is still FAIL, the task is not done, and the task's own agent investigates with `diagnosing-bugs`.

### Gate review (every human gate, G0–G7)

task-observer's interactive review, run by the gate agent before it asks the gate question:

1. Commit the shared log from the main checkout (skip if nothing changed):
   ```bash
   git -C /Users/kaalu/projects/abhishek-portfolio add skill-observations skill-updates
   git -C /Users/kaalu/projects/abhishek-portfolio commit -m "chore(skills): observations up to <gate>"
   ```
2. Load `.agents/skills/task-observer/references/weekly-review.md` and run the review in **interactive** mode over all OPEN observations: read every body, bucket by skill, present counts plus one sentence per observation, and flag escalations (a new skill, a removal or restructure, uncertainty, two observations in conflict).
3. Post the review together with the gate question, and wait. The user approves all, some or none.
4. For each approved item: task-observer stages the updated skill in `skill-updates/<skill>/`, then:
   ```bash
   python3 .agents/skills/task-observer/scripts/validate-skill-bundle.py skill-updates/<skill>
   rm -rf .agents/skills/<skill> && cp -R skill-updates/<skill> .agents/skills/<skill>
   ```
   The validator must exit 0 before the copy. Then update `skill-updates/PENDING.md` and set each applied observation to `status: actioned` with `resolved:` and `resolution:`. Use `writing-for-agents` for the skill edits themselves.
5. Commit: `git add .agents/skills skill-observations skill-updates && git commit -m "chore(skills): apply approved observations at <gate>"`.

Declined or unanswered items stay OPEN for the next gate. A declined prompt is never approval.

## Task map

| # | Task | Tier | Owner | Lane | Depends on | Gate |
|---|------|------|-------|------|------------|------|
| 1 | Governance (task-observer) + inputs and consent | Pro | Agent → **User** | — | — | **G0** |
| 2 | Scaffold, tooling, skills | Flash | Agent (+User for GitHub/Vercel) | — | G0 | — |
| 3 | Scraper parsers | Flash | Agent | A | 2 | — |
| 4 | Scraper runner → `social.json` | Flash | Agent → **User** | A | 3 | **G1** |
| 5 | Data schema and helpers | Flash | Agent | A | 2 (fixture), 4 (real data) | — |
| 6 | Style bible and keyframe prompts | Pro | Agent | B | 2 | — |
| 7 | Keyframe generation | — | **User** | B | 6 | **G2**, **G3** |
| 8 | Frame exporter + placeholder frames | Flash | Agent | C | 2 | — |
| 9 | Scrub math | Pro | Agent | C | 2 | — |
| 10 | Page shell, scrub stage, fallbacks | Pro | Agent | C | 8, 9 | — |
| 11 | Design tokens, fonts, hero | Pro | Agent | — | 5, 7 (G3), 10 | **G4** |
| 12 | Transition clips | — | **User** | ∥ with 11 | 7 (G3) | **G5** |
| 13 | Real frame export | Flash | Agent | — | 12 (G5), 8 | — |
| 14 | Pitch section | Flash | Agent | D ∥ | 5, 11 (G4) | — |
| 15 | Scoreboard section | Flash | Agent | D ∥ | 5, 11 (G4) | — |
| 16 | Stands section | Flash | Agent | D ∥ | 5, 11 (G4) | — |
| 17 | Pavilion section | Flash | Agent | D ∥ | 5, 11 (G4) | — |
| 18 | Boundary Rope + `/go/*` pages | Flash | Agent | D ∥ | 5, 11 (G4) | — |
| 19 | Integration | Pro | Agent → **User** | — | 13, 14–18 | **G6** |
| 20 | SEO | Flash | Agent | E ∥ | 19 (G6) | — |
| 21 | Accessibility + performance audits | Flash | Agent | E ∥ | 19 (G6) | — |
| 22 | Fix pass + perf report | Pro | Agent | — | 20, 21 | — |
| 23 | Ship | Flash | Agent → **User** | — | 22 | **G7** |

Lanes A, B and C all start after Task 2 and run together. Task 5 can start against its own fixture before Task 4 finishes. Lane D is five agents at once. Lane E is two.

## File structure

```
AGENTS.md, CLAUDE.md                   Task 1   task-observer activation block + precedence rules
.agents/rules/00-task-observer.md      Task 1   always-on copy of AGENTS.md (trigger: always_on)
.agents/skills/                        Tasks 1–2  pinned skills (38); changed only via approved staged updates
skill-observations/                    Task 1+  task-observer log, one file per observation (at /Users/kaalu/projects/abhishek-portfolio)
skill-updates/                         gates    staged skill updates + PENDING.md
.gitignore, package.json,
astro.config.mjs, tsconfig.json        Task 2
docs/inputs.md                         Task 1   gate G0 form
docs/qa/a11y-report.md                 Task 21
docs/qa/perf-audit.md                  Task 21
docs/qa/perf-report.md                 Task 22
docs/qa/qa-checklist.md                Task 23
assets/prompts/keyframes.md            Task 6   style bible + 6 prompts + 5 camera moves
assets/prompts/log.md                  Task 6/7/12  provenance of every generation
assets/clips/*.mp4                     Task 12  gitignored; only exported frames are committed
scraper/requirements.txt               Task 2
scraper/parse.py                       Task 3   pure parsers, no network
scraper/test_parse.py                  Task 3
scraper/scrape.py                      Task 4   network + file writes
scraper/instagram_posts.txt            Task 4   optional override list
scripts/install-skills.sh              Task 2
scripts/verify-pipeline.mjs            exists   read-only gate verifier
scripts/export-frames.mjs              Task 8   clips (or placeholders) → AVIF frames + frames.json
src/assets/keyframes/0N-<zone>.jpg     Task 7
src/assets/photos/*.jpg                Task 1   supplied by user
src/assets/social/*.jpg                Task 4
src/data/social.json                   Task 4 (fixture from Task 5 until then)
src/data/frames.json                   Task 8, overwritten by Task 13
src/data/site.js                       Task 5   name, tagline, contacts, profile URLs
src/data/story.md                      Task 17  Pavilion copy (the user edits this)
src/lib/social-schema.js (+ .test.js)  Task 5   zod schema, node-testable
src/lib/social.js                      Task 5   parsed data, featured lists, thumbnail lookup
src/lib/format.js (+ .test.js)         Task 5   compact counts, dates
src/lib/links.js (+ .test.js)          Task 5   wa.me / mailto builders
src/lib/scrub-math.js (+ .test.js)     Task 9   tier, frame URL, cover rect, preload, pickFrame
src/lib/keyframes.js                   Task 10 → 19  zone ids + keyframe lookup
src/lib/stats.js (+ .test.js)          Task 15  scoreboard totals
src/lib/jsonld.js (+ .test.js)         Task 20  Person / WebSite / VideoObject JSON-LD
src/scripts/scrub.js                   Task 10  canvas + ScrollTrigger + loading
src/components/Zone.astro              Task 10 → 11 → 19  section shell, fallback still, scrim, reveals
src/components/ScrubStage.astro        Task 10 → 11  fixed canvas + script
src/components/Hero.astro              Task 11
src/components/{Pitch,Scoreboard,Stands,Pavilion,Boundary}.astro   Tasks 14–18
src/layouts/Base.astro                 Task 2 → 11 → 18 → 23
src/styles/tokens.css, global.css      Task 11
src/pages/index.astro                  Task 10 → 11 → 19 → 20
src/pages/dev/*.astro                  Tasks 14–18, deleted in 19
src/pages/go/whatsapp.astro, email.astro   Task 18
src/pages/sitemap.xml.js               Task 20
src/assets/placeholder-still.jpg       Task 8, deleted in 19
public/frames/<transition>/<tier>/NNN.avif  Task 8 → 13
public/robots.txt                      Task 20
```

---

## Phase 0 — Setup

### Task 1: Governance (task-observer) + inputs and consent

**Tier:** Pro · **Owner:** Agent sets up governance and the form; **User** answers task-observer's one-time question and fills the form · **Lane:** — · **Gate:** **G0** · **ADRs:** 0003, 0006, 0008
**Skills:** `task-observer` (installed in Step 1), `writing-for-agents` (installed in Step 1)

**Files:**
- Create: `.agents/skills/task-observer/**`, `.agents/skills/writing-for-agents/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/rules/00-task-observer.md`, `skill-observations/**` (by the Session Start Protocol), `docs/inputs.md`
- Modify (with the user's OK, outside the repo): `~/.gemini/GEMINI.md`
- User adds: `src/assets/photos/*.jpg`, optionally `scraper/instagram_posts.txt`

**Interfaces:**
- Consumes: nothing
- Produces: task-observer active in every later session through `AGENTS.md` + the always-on rule, with its log at `/Users/kaalu/projects/abhishek-portfolio/skill-observations/`; `docs/inputs.md` with every box ticked (Tasks 2, 5, 17 and 18 read the Vercel project name, WhatsApp digits, email, tagline and bio facts from it).

Governance comes first so task-observer is already watching when the first real work happens.

- [ ] **Step 1: Install task-observer and writing-for-agents**

```bash
mkdir -p .agents/skills
npx -y skills@1.5.26 add rebelytics/one-skill-to-rule-them-all --skill task-observer -a antigravity -y --copy
npx -y skills@1.5.26 add mattpocock/skills --skill writing-for-agents -a antigravity -y --copy
ls .agents/skills/task-observer/SKILL.md .agents/skills/task-observer/references/weekly-review.md .agents/skills/task-observer/scripts/validate-skill-bundle.py .agents/skills/writing-for-agents/SKILL.md
```

Expected: all four paths print. If `references/` or `scripts/` is missing (only `SKILL.md` was copied), rebuild the bundle:

```bash
git clone --depth 1 https://github.com/rebelytics/one-skill-to-rule-them-all /tmp/task-observer
rm -rf .agents/skills/task-observer && mkdir -p .agents/skills/task-observer
cp -R /tmp/task-observer/SKILL.md /tmp/task-observer/references /tmp/task-observer/scripts .agents/skills/task-observer/
```

- [ ] **Step 2: Activation block in both project layers**

`AGENTS.md` (section 1 is task-observer's v3 activation block verbatim, with this project's path filled in; use `writing-for-agents` if anything needs rewording, never section 1):

```markdown
# Agent rules for this repository

## 1. task-observer rules every skill (ADR-0008)

Before the first tool call of any session — and before writing or
proposing a plan, not merely before executing one — invoke the
task-observer skill AND execute its Session Start Protocol (storage
check, frontmatter scan, review trigger). Loading the skill and running
the protocol are separate steps; a session that loads the file and stops
has activated nothing. Any turn that will involve a tool call counts; do
not classify the session as "too simple" from its opening message.

Select skills on the DECISION the request is about, not on the artefact it
arrived as. Name what the user is deciding, then match the installed skill
descriptions against that — a request handed over as a file to review
still needs the skill whose description names its subject.

After completing each task, check the observation records written this
session and report a one-line summary (ids and titles, or "none logged
and why"). This is the activation backstop: it forces a look at the log,
so a session that silently skipped the protocol is discovered at the
first task boundary instead of never.

Loading a skill is not complete until you have queried the observation
log for OPEN observations naming it and read their bodies:
  grep -l "skill:.*<skill-name>" \
    /Users/kaalu/projects/abhishek-portfolio/skill-observations/observation-log/*.md
Apply their insights to the current work, even if the skill file hasn't
been updated yet. Run this at every skill load, however many skills load
in one session. The session-start scan does not cover it: that is a
frontmatter sweep over every observation at session start, this is a
body-level lookup for one skill at the moment its rules are applied.

The task-observer workspace for this project is:
  /Users/kaalu/projects/abhishek-portfolio
Every path the skill uses derives from that root and nothing else:
  /Users/kaalu/projects/abhishek-portfolio/skill-observations/observation-log/   (the log)
  /Users/kaalu/projects/abhishek-portfolio/skill-observations/cross-cutting-principles.md
  /Users/kaalu/projects/abhishek-portfolio/skill-updates/                        (staging root)
  /Users/kaalu/projects/abhishek-portfolio/skill-updates/PENDING.md              (staging manifest)
Never resolve any of them from the current working
directory — a cwd inside an ephemeral checkout (a git worktree, a temporary
clone) is torn down and takes the log with it. Never place the workspace
inside a skills-discovery directory or any path linked into one. If this
environment mints a separate project identity per checkout, or more than
one agent works this project, the pinned path above is the single shared
location; do not derive one per session, tool or project.

## 2. Precedence when instructions conflict

1. The user's decisions at human gates.
2. `docs/superpowers/specs/2026-09-12-abhishek-portfolio-design.md`, `docs/adr/`, and the Global Constraints in `docs/superpowers/plans/2026-09-12-abhishek-portfolio.md`.
3. task-observer's protocol (section 1).
4. Every other skill in `.agents/skills/`.

When a skill's rule contradicts a higher level (for example a taste skill defaulting to React or Tailwind while ADR-0007 fixes Astro and plain CSS), follow the higher level and log an observation against that skill. Never silently pick one.

## 3. Skills change only through task-observer

- Never edit `.agents/skills/` by hand. Changes arrive as observations, are staged in `skill-updates/`, pass `validate-skill-bundle.py`, and are installed only after the user approves them at a human gate (plan: *Gate review*).
- A skill found with `npx skills find` is logged as a `proposes_skill` observation, not installed on the spot.
```

`CLAUDE.md` (so Claude Code, if it ever runs a task, obeys the same file):

```markdown
@AGENTS.md
```

The always-on Antigravity rule is generated from `AGENTS.md`, so the two can't drift:

```bash
mkdir -p .agents/rules
{ printf -- '---\ntrigger: always_on\n---\n\n'; tail -n +2 AGENTS.md; } > .agents/rules/00-task-observer.md
wc -c .agents/rules/00-task-observer.md
head -4 .agents/rules/00-task-observer.md
```

Expected: under 12000 characters (Antigravity's per-rule limit); the file starts with the `trigger: always_on` frontmatter.

- [ ] **Step 3: User-level layer (ask first)**

Post exactly:

> May I append one line to your global `~/.gemini/GEMINI.md` so every Antigravity session in this project starts task-observer even if the project files aren't loaded yet? The line: "In /Users/kaalu/projects/abhishek-portfolio or any worktree of it: before any other tool call, run `ls /Users/kaalu/projects/abhishek-portfolio/skill-observations`, invoke the task-observer skill, and follow that repository's AGENTS.md."

On "yes":

```bash
printf '\nIn /Users/kaalu/projects/abhishek-portfolio or any worktree of it: before any other tool call, run `ls /Users/kaalu/projects/abhishek-portfolio/skill-observations`, invoke the task-observer skill, and follow that repository'"'"'s AGENTS.md.\n' >> ~/.gemini/GEMINI.md
tail -2 ~/.gemini/GEMINI.md
```

On "no": skip; the two project layers still apply.

- [ ] **Step 4: Run the Session Start Protocol for the first time**

Invoke `task-observer` and execute its Session Start Protocol against `/Users/kaalu/projects/abhishek-portfolio`. It creates `skill-observations/observation-log/archive/`, `cross-cutting-principles.md` and `last-review-date.txt` (value `never`), and makes its one-time starter-principles offer. Relay that offer to the user verbatim and apply their answer; it writes `starter-principles-reviewed.txt`, so no later agent is ever asked again.

```bash
ls -d /Users/kaalu/projects/abhishek-portfolio/skill-observations/observation-log/archive
cat /Users/kaalu/projects/abhishek-portfolio/skill-observations/last-review-date.txt
cat /Users/kaalu/projects/abhishek-portfolio/skill-observations/starter-principles-reviewed.txt
```

Expected: the directory exists; `never`; a starter-set version line.

- [ ] **Step 5: Commit governance**

```bash
git add AGENTS.md CLAUDE.md .agents skill-observations
git commit -m "chore(governance): task-observer rules every skill (ADR-0008)"
node scripts/verify-pipeline.mjs | head -1
```

Expected: first verifier row `governance PASS`.

- [ ] **Step 6: Create the form**

`docs/inputs.md`:

```markdown
# Inputs (Gate G0)

Fill every blank, then tick the box. `node scripts/verify-pipeline.mjs`
keeps the `scope` gate FAIL while any box is unticked.

- [ ] Consent: Abhishek agreed on ____ (date) to his public Instagram, YouTube and LinkedIn content being scraped and republished on this site.
- [ ] WhatsApp number, country code + digits only (e.g. 919812345678): ____
- [ ] Enquiry email: ____
- [ ] Tagline, one line in his voice: ____
- [ ] Bio facts filled in below (3–6 bullets).
- [ ] 2–4 high-res photos of Abhishek that he owns the rights to are in `src/assets/photos/`, named by what's in them (e.g. `abhishek-batting-nets.jpg`) — the file name becomes the photo's alt text.
- [ ] Instagram: the ~5 most recent posts per account are fine, OR older post/reel URLs are listed one per line in `scraper/instagram_posts.txt`.
- [ ] Google Flow plan checked on ____: exported clips have no visible watermark.
- [ ] Vercel project name: ____ (site URL becomes https://____.vercel.app)

## Bio facts

- ____
- ____
- ____
```

- [ ] **Step 7: Commit the empty form**

```bash
git add docs/inputs.md
git commit -m "docs: add inputs form for gate G0"
```

- [ ] **Step 8: GATE G0 — stop and ask the user**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Post exactly:

> G0: please fill in `docs/inputs.md`, tick every box, and add the photos to `src/assets/photos/`. Reply "G0 done" when finished.

Wait for "G0 done".

- [ ] **Step 9: Verify and commit the user's inputs**

Run: `grep -c -- "- \[ \]" docs/inputs.md`
Expected: `0`

```bash
git add docs/inputs.md src/assets/photos
[ -f scraper/instagram_posts.txt ] && git add scraper/instagram_posts.txt
git commit -m "docs: record G0 inputs and consent"
```

---

### Task 2: Scaffold, tooling, skills

**Tier:** Flash · **Owner:** Agent; **User** for the GitHub repo and Vercel import · **Lane:** — · **Gate:** — · **ADRs:** 0004, 0005, 0007
**Skills:** `astro`, `deploy-to-vercel` (both installed in Step 2; until then read `~/.gemini/config/skills/astro/SKILL.md` directly)

**Files:**
- Create: `scripts/install-skills.sh`, `.agents/skills/**`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/layouts/Base.astro`, `src/pages/index.astro`, `scraper/requirements.txt`
- Commit (already exists): `scripts/verify-pipeline.mjs`

**Interfaces:**
- Consumes: Vercel project name from `docs/inputs.md`
- Produces: `npm run build` works; `npm test` runs `src/lib/*.test.js`; `scraper/.venv/bin/python` has Scrapling; `ffmpeg` on PATH; `Base.astro` accepts props `{ title: string, description: string }` and renders `<slot />` inside `<body>`.

- [ ] **Step 1: Write the skills installer**

`scripts/install-skills.sh`:

```bash
#!/usr/bin/env bash
# Pins every skill this plan uses into .agents/skills/ (Antigravity project scope).
# Skips skills that already exist, so approved task-observer updates (ADR-0008) are never overwritten.
# Need something not listed? Propose it as a task-observer observation (AGENTS.md section 3);
# add its line here only after the user approves it at a gate.
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=.agents/skills
mkdir -p "$DEST"

add() {
  local src=$1; shift
  local args=()
  for s in "$@"; do [ -d "$DEST/$s" ] || args+=(--skill "$s"); done
  [ ${#args[@]} -eq 0 ] && return 0
  npx -y skills@1.5.26 add "$src" "${args[@]}" -a antigravity -y --copy
}

add rebelytics/one-skill-to-rule-them-all task-observer

add obra/superpowers executing-plans subagent-driven-development dispatching-parallel-agents \
  using-git-worktrees test-driven-development verification-before-completion requesting-code-review
add D4Vinci/Scrapling scrapling-official
add nextlevelbuilder/ui-ux-pro-max-skill ui-ux-pro-max
add anthropics/skills frontend-design
add vercel-labs/agent-skills web-design-guidelines deploy-to-vercel
add DietrichGebert/ponytail ponytail ponytail-review
add leonxlnx/taste-skill design-taste-frontend high-end-visual-design full-output-enforcement
add mattpocock/skills grilling writing-for-agents diagnosing-bugs

copy_local() {
  local from=$1 name=$2
  [ -d "$DEST/$name" ] && return 0
  if [ ! -d "$from" ]; then echo "MISSING local skill $from — try: npx -y skills@1.5.26 find $name"; return 0; fi
  cp -R "$from" "$DEST/$name"
  # web3d skills ship as <name>-skill.md; Antigravity expects SKILL.md
  [ -f "$DEST/$name/SKILL.md" ] || mv "$DEST/$name"/*.md "$DEST/$name/SKILL.md"
}

WEB3D=${WEB3D_SKILLS:-$HOME/projects/3d-design/web3d-skills}
for s in web3d-art-direction web3d-motion-choreography web3d-interaction-ux web3d-performance-budget web3d-ship-deploy; do
  copy_local "$WEB3D/$s" "$s"
done

AG=${ANTIGRAVITY_SKILLS:-$HOME/.gemini/config/skills}
for s in astro scroll-experience premium-web-design design-system modern-web-guidance seo schema-markup \
  core-web-vitals accessibility-auditor copywriting humanizer architecture-decision-records; do
  copy_local "$AG/$s" "$s"
done

echo "Installed: $(ls "$DEST" | wc -l | tr -d ' ') skills"
```

- [ ] **Step 2: Run it and check the count**

```bash
chmod +x scripts/install-skills.sh && ./scripts/install-skills.sh
ls .agents/skills | wc -l
ls .agents/skills/*/SKILL.md | wc -l
```

Expected: both counts are `38`, and no `MISSING` lines. If a public install fails, re-run that one `add` line; if a local folder is missing, use the printed `skills find` command and add the result to the script.

- [ ] **Step 3: Write the project files**

`package.json`:

```json
{
  "name": "abhishek-portfolio",
  "type": "module",
  "private": true,
  "engines": { "node": ">=22.19.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test \"src/lib/*.test.js\"",
    "verify": "node scripts/verify-pipeline.mjs"
  }
}
```

`astro.config.mjs` (replace `VERCEL_PROJECT` with the name from `docs/inputs.md`):

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://VERCEL_PROJECT.vercel.app',
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`.gitignore`:

```
node_modules/
dist/
.astro/
.vercel/
.env
scraper/.venv/
__pycache__/
assets/clips/
```

`src/layouts/Base.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Abhishek Pandey — Cricket Content Creator" description="Cricket content by Abhishek Pandey.">
  <h1>Abhishek Pandey</h1>
</Base>
```

`scraper/requirements.txt`:

```
scrapling[fetchers]==0.4.15
```

- [ ] **Step 4: Install and build**

```bash
node -v
npm install astro@^7.3.2
npm run build
ls dist/index.html
```

Expected: `node -v` prints `v22.19.0` or higher; build ends with `Complete!`; `dist/index.html` exists.

- [ ] **Step 5: Python and ffmpeg**

```bash
python3 -m venv scraper/.venv
scraper/.venv/bin/pip install -r scraper/requirements.txt
scraper/.venv/bin/python -c "from scrapling.fetchers import Fetcher; print('scrapling ok')"
brew install ffmpeg
ffmpeg -hide_banner -encoders | grep -c mjpeg
```

Expected: `scrapling ok`; the grep prints `1` or more. Do **not** run `scrapling install` — the plain `Fetcher` needs no browsers.

- [ ] **Step 6: Run the verifier**

Run: `node scripts/verify-pipeline.mjs`
Expected: `governance PASS`, `scope PASS`, `build PASS`, every other gate `FAIL`, exit code 1.

- [ ] **Step 7: Commit**

```bash
git add .agents scripts package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src scraper/requirements.txt
git commit -m "chore: scaffold Astro 7, pin skills, add pipeline verifier"
```

- [ ] **Step 8: [User] GitHub + Vercel**

Ask the user to run, then reply "linked":

```bash
gh repo create VERCEL_PROJECT --private --source . --push
```

Then in the Vercel dashboard: **Add New → Project → Import** this repo, framework preset **Astro**, project name = `VERCEL_PROJECT`. Every later push to a branch gets a preview URL; `main` deploys to production.

Expected: `https://VERCEL_PROJECT.vercel.app` shows "Abhishek Pandey".

---

## Phase 1 — Lane A: Data

### Task 3: Scraper parsers

**Tier:** Flash · **Owner:** Agent · **Lane:** A · **Gate:** — · **ADRs:** 0003
**Skills:** `scrapling-official`, `test-driven-development`, `ponytail`

**Files:**
- Create: `scraper/parse.py`, `scraper/test_parse.py`

**Interfaces:**
- Consumes: nothing (pure functions, no network)
- Produces, all in `scraper/parse.py`:
  - `parse_count(text: str | None) -> int | None`
  - `parse_instagram_profile(og_description: str | None) -> {"followers": int|None, "postCount": int|None}`
  - `parse_instagram_shortcodes(html: str, limit: int = 5) -> list[{"shortcode": str, "isReel": bool}]`
  - `parse_instagram_post_url(url: str) -> {"shortcode": str, "isReel": bool} | None`
  - `parse_instagram_post(og_description: str | None) -> {"account": str|None, "likes": int|None, "caption": str}`
  - `parse_youtube_channel(html: str, handle: str) -> {"channelId": str|None, "followers": int|None}`
  - `parse_youtube_feed(xml: bytes | str) -> list[{"id": str, "title": str, "publishedAt": str, "views": int|None}]`
  - `parse_linkedin(og_title: str | None) -> {"name": str|None, "headline": str|None}`

The fixtures below are real strings captured logged-out on 2026-09-12 from public pages (`@instagram`, `@YouTube`, a public LinkedIn profile), so the regexes match what those sites actually serve.

- [ ] **Step 1: Write the failing tests**

`scraper/test_parse.py`:

```python
import unittest

import parse

YT_HTML = (
    '<link rel="canonical" href="https://www.youtube.com/channel/UCBR8-60-B28hp2BmDPdntcQ">'
    '"title":{"content":"‎⁨@YouTube⁩ • ⁨46.3M subscribers⁩"}'
    '"content":"‎⁨@YouTubeBrasil⁩ • ⁨3.45M subscribers⁩"'
)

YT_FEED = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>YouTube</title>
 <entry>
  <yt:videoId>DfECjUL9ZvU</yt:videoId>
  <title>a creator award almost as beautiful as your art</title>
  <published>2026-09-10T20:00:18+00:00</published>
  <media:group>
   <media:thumbnail url="https://i1.ytimg.com/vi/DfECjUL9ZvU/hqdefault.jpg" width="480" height="360"/>
   <media:community>
    <media:starRating count="1091" average="5.00" min="1" max="5"/>
    <media:statistics views="147443"/>
   </media:community>
  </media:group>
 </entry>
</feed>"""


class ParseCount(unittest.TestCase):
    def test_suffixes_and_commas(self):
        self.assertEqual(parse.parse_count("46.3M"), 46_300_000)
        self.assertEqual(parse.parse_count("394K"), 394_000)
        self.assertEqual(parse.parse_count("8,584"), 8584)
        self.assertEqual(parse.parse_count("1.2B"), 1_200_000_000)

    def test_garbage_is_none(self):
        self.assertIsNone(parse.parse_count(None))
        self.assertIsNone(parse.parse_count("lots"))


class Instagram(unittest.TestCase):
    def test_profile_counts(self):
        og = "687M Followers, 292 Following, 8,584 Posts - See Instagram photos and videos from Instagram (@instagram)"
        self.assertEqual(parse.parse_instagram_profile(og), {"followers": 687_000_000, "postCount": 8584})

    def test_profile_login_wall_is_nulls(self):
        self.assertEqual(parse.parse_instagram_profile(None), {"followers": None, "postCount": None})

    def test_shortcodes_dedupe_and_kind(self):
        html = 'href="/p/DdHNbqDJusb/" x href="/reel/DdGyUtFsnRO/" y href="/p/DdHNbqDJusb/"'
        self.assertEqual(
            parse.parse_instagram_shortcodes(html),
            [{"shortcode": "DdHNbqDJusb", "isReel": False}, {"shortcode": "DdGyUtFsnRO", "isReel": True}],
        )

    def test_post_url(self):
        self.assertEqual(
            parse.parse_instagram_post_url("https://www.instagram.com/reel/DdGyUtFsnRO/?igsh=abc"),
            {"shortcode": "DdGyUtFsnRO", "isReel": True},
        )
        self.assertIsNone(parse.parse_instagram_post_url("https://example.com/"))

    def test_post_meta(self):
        og = '394K likes, 8,279 comments - instagram on September 10, 2026: "Every room is its own world \U0001f58a️⁣\n⁣\n@draw_vengers"'
        got = parse.parse_instagram_post(og)
        self.assertEqual(got["account"], "instagram")
        self.assertEqual(got["likes"], 394_000)
        self.assertTrue(got["caption"].startswith("Every room is its own world"))
        self.assertFalse(got["caption"].endswith('"'))

    def test_post_meta_hidden_likes(self):
        og = '12 comments - spinandswing26 on March 3, 2026: "Nets session"'
        self.assertEqual(parse.parse_instagram_post(og), {"account": "spinandswing26", "likes": None, "caption": "Nets session"})


class YouTube(unittest.TestCase):
    def test_channel_page_picks_own_handle(self):
        self.assertEqual(
            parse.parse_youtube_channel(YT_HTML, "youtube"),
            {"channelId": "UCBR8-60-B28hp2BmDPdntcQ", "followers": 46_300_000},
        )

    def test_channel_page_missing_bits(self):
        self.assertEqual(parse.parse_youtube_channel("<html></html>", "x"), {"channelId": None, "followers": None})

    def test_feed(self):
        self.assertEqual(
            parse.parse_youtube_feed(YT_FEED),
            [{"id": "DfECjUL9ZvU", "title": "a creator award almost as beautiful as your art",
              "publishedAt": "2026-09-10T20:00:18+00:00", "views": 147443}],
        )


class LinkedIn(unittest.TestCase):
    def test_title(self):
        self.assertEqual(
            parse.parse_linkedin("Bill Gates - Chair, Gates Foundation and Founder, Breakthrough Energy | LinkedIn"),
            {"name": "Bill Gates", "headline": "Chair, Gates Foundation and Founder, Breakthrough Energy"},
        )

    def test_authwall_title_is_nulls(self):
        self.assertEqual(parse.parse_linkedin("Sign Up | LinkedIn"), {"name": None, "headline": None})
        self.assertEqual(parse.parse_linkedin(None), {"name": None, "headline": None})


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `scraper/.venv/bin/python -m unittest discover -s scraper -p "test_*.py" -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'parse'`

- [ ] **Step 3: Write the parsers**

`scraper/parse.py`:

```python
"""Pure parsers for public Instagram, YouTube and LinkedIn pages. No network here."""
import re
import xml.etree.ElementTree as ET

_SUFFIX = {"": 1, "K": 1_000, "M": 1_000_000, "B": 1_000_000_000}
_NUM = r"[\d.,]+[KMB]?"
_POST_URL = re.compile(r"instagram\.com/(p|reel)/([A-Za-z0-9_-]{8,})")
_POST_META = re.compile(
    rf"^(?:({_NUM}) likes?, )?(?:{_NUM} comments?\s*-\s*)?(\S+) on [A-Z][a-z]+ \d{{1,2}}, \d{{4}}:\s*\"?(.*?)\"?\s*$",
    re.S,
)
_FEED_NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def parse_count(text):
    m = re.fullmatch(r"\s*([\d.,]+)\s*([KMB]?)\s*", text or "", re.I)
    if not m:
        return None
    try:
        return int(round(float(m.group(1).replace(",", "")) * _SUFFIX[m.group(2).upper()]))
    except ValueError:
        return None


def parse_instagram_profile(og_description):
    m = re.match(rf"({_NUM}) Followers, {_NUM} Following, ({_NUM}) Posts", og_description or "", re.I)
    if not m:
        return {"followers": None, "postCount": None}
    return {"followers": parse_count(m.group(1)), "postCount": parse_count(m.group(2))}


def parse_instagram_shortcodes(html, limit=5):
    seen = {}
    for kind, code in re.findall(r"/(p|reel)/([A-Za-z0-9_-]{8,})", html):
        seen.setdefault(code, kind == "reel")
    return [{"shortcode": c, "isReel": r} for c, r in list(seen.items())[:limit]]


def parse_instagram_post_url(url):
    m = _POST_URL.search(url)
    return {"shortcode": m.group(2), "isReel": m.group(1) == "reel"} if m else None


def parse_instagram_post(og_description):
    m = _POST_META.match(og_description or "")
    if not m:
        return {"account": None, "likes": None, "caption": ""}
    return {"account": m.group(2), "likes": parse_count(m.group(1)), "caption": m.group(3).strip()}


def parse_youtube_channel(html, handle):
    cid = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"', html)
    subs = re.search(rf"@{re.escape(handle)}\W{{0,6}}•\W{{0,6}}({_NUM}) subscribers", html, re.I)
    return {
        "channelId": cid.group(1) if cid else None,
        "followers": parse_count(subs.group(1)) if subs else None,
    }


def parse_youtube_feed(xml):
    videos = []
    for entry in ET.fromstring(xml).findall("a:entry", _FEED_NS):
        stats = entry.find("media:group/media:community/media:statistics", _FEED_NS)
        videos.append({
            "id": entry.findtext("yt:videoId", namespaces=_FEED_NS),
            "title": entry.findtext("a:title", namespaces=_FEED_NS),
            "publishedAt": entry.findtext("a:published", namespaces=_FEED_NS),
            "views": int(stats.get("views")) if stats is not None else None,
        })
    return videos


def parse_linkedin(og_title):
    title = re.sub(r"\s*\|\s*LinkedIn\s*$", "", og_title or "")
    if " - " not in title:
        return {"name": None, "headline": None}
    name, _, headline = title.partition(" - ")
    return {"name": name.strip() or None, "headline": headline.strip() or None}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `scraper/.venv/bin/python -m unittest discover -s scraper -p "test_*.py" -v`
Expected: `Ran 13 tests` … `OK`

- [ ] **Step 5: Commit**

```bash
git add scraper/parse.py scraper/test_parse.py
git commit -m "feat(scraper): pure parsers for Instagram, YouTube and LinkedIn public pages"
```

---

### Task 4: Scraper runner → `social.json`

**Tier:** Flash · **Owner:** Agent, then **User** curates · **Lane:** A · **Gate:** **G1** · **ADRs:** 0003
**Skills:** `scrapling-official`, `ponytail`

**Files:**
- Create: `scraper/scrape.py`, `src/data/social.json` (generated), `src/assets/social/*.jpg` (generated)

**Interfaces:**
- Consumes: every function from Task 3's `scraper/parse.py`; optional `scraper/instagram_posts.txt` (one Instagram post/reel URL per line) from Task 1
- Produces: `src/data/social.json` in exactly this shape (Task 5's zod schema enforces it):

```json
{
  "scrapedAt": "2026-09-12T10:00:00+00:00",
  "profiles": [{ "platform": "instagram|youtube|linkedin", "handle": "spinandswing26", "url": "https://…",
                 "followers": 12300, "postCount": null, "name": null, "headline": null }],
  "videos": [{ "platform": "youtube", "channel": "spinandswing26", "id": "DfECjUL9ZvU", "title": "…",
               "views": 147443, "publishedAt": "2026-09-10T20:00:18+00:00", "thumb": "yt-DfECjUL9ZvU.jpg", "featured": false }],
  "posts": [{ "platform": "instagram", "account": "spinandswing26", "shortcode": "DdHNbqDJusb",
              "url": "https://www.instagram.com/p/DdHNbqDJusb/", "caption": "…", "likes": 394000,
              "isReel": false, "thumb": "ig-DdHNbqDJusb.jpg", "featured": false }]
}
```

`thumb` is a file name inside `src/assets/social/`. Rows whose thumbnail can't be downloaded are dropped, so `thumb` is never null.

- [ ] **Step 1: Write the runner**

`scraper/scrape.py`:

```python
"""One-time seed scrape -> src/data/social.json + src/assets/social/*.jpg.

Run from the repo root:  scraper/.venv/bin/python scraper/scrape.py
Public pages only, logged out, no credentials. Re-running keeps `featured` flags.
"""
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from scrapling.fetchers import Fetcher

import parse

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / "src/data/social.json"
THUMBS = ROOT / "src/assets/social"
OVERRIDE = ROOT / "scraper/instagram_posts.txt"
IG_ACCOUNTS = ["abhishekpandey_26", "spinandswing26"]
YT_CHANNELS = ["spinandswing26", "abhishekunseen26"]
LINKEDIN = "abhishek-pandey-26sep03"


def get(url, **kw):
    time.sleep(2)  # ponytail: fixed politeness delay; ~30 requests total, no need for a rate limiter
    page = Fetcher.get(url, impersonate="chrome", stealthy_headers=True, timeout=30, **kw)
    if page.status != 200:
        raise RuntimeError(f"HTTP {page.status} for {url}")
    return page


def meta(page, prop):
    return page.css(f'meta[property="{prop}"]::attr(content)').get()


def save_image(url, name):
    (THUMBS / name).write_bytes(get(url).body)
    return name


def profile_row(platform, handle, url):
    return {"platform": platform, "handle": handle, "url": url,
            "followers": None, "postCount": None, "name": None, "headline": None}


def scrape_instagram(featured):
    profiles, candidates = [], []
    for handle in IG_ACCOUNTS:
        url = f"https://www.instagram.com/{handle}/"
        row = profile_row("instagram", handle, url)
        try:
            page = get(url)
            row.update(parse.parse_instagram_profile(meta(page, "og:description")))
            candidates += parse.parse_instagram_shortcodes(page.body.decode("utf-8", "ignore"))
        except RuntimeError as err:
            print("WARN", err)
        profiles.append(row)

    if OVERRIDE.exists():
        urls = [line.strip() for line in OVERRIDE.read_text().splitlines() if line.strip()]
        candidates = [c for c in map(parse.parse_instagram_post_url, urls) if c]

    posts = []
    for c in candidates:
        kind = "reel" if c["isReel"] else "p"
        url = f"https://www.instagram.com/{kind}/{c['shortcode']}/"
        try:
            page = get(url)
            image = meta(page, "og:image")
            if not image:
                raise RuntimeError(f"no og:image for {url}")
            info = parse.parse_instagram_post(meta(page, "og:description"))
            thumb = save_image(image, f"ig-{c['shortcode']}.jpg")
        except RuntimeError as err:
            print("WARN", err)
            continue
        posts.append({"platform": "instagram", "account": info["account"] or "unknown",
                      "shortcode": c["shortcode"], "url": url, "caption": info["caption"],
                      "likes": info["likes"], "isReel": c["isReel"], "thumb": thumb,
                      "featured": c["shortcode"] in featured})
    return profiles, posts


def youtube_thumb(video_id):
    for size in ("maxresdefault", "hqdefault"):
        try:
            return save_image(f"https://i.ytimg.com/vi/{video_id}/{size}.jpg", f"yt-{video_id}.jpg")
        except RuntimeError:
            continue
    return None


def scrape_youtube(featured):
    profiles, videos = [], []
    for handle in YT_CHANNELS:
        url = f"https://www.youtube.com/@{handle}"
        row = profile_row("youtube", handle, url)
        try:
            page = get(url, headers={"Accept-Language": "en-US,en;q=0.9"})
            info = parse.parse_youtube_channel(page.body.decode("utf-8", "ignore"), handle)
            row["followers"] = info["followers"]
            if not info["channelId"]:
                raise RuntimeError(f"no channel id on {url}")
            feed = get(f"https://www.youtube.com/feeds/videos.xml?channel_id={info['channelId']}")
            for v in parse.parse_youtube_feed(feed.body):
                thumb = youtube_thumb(v["id"])
                if thumb:
                    videos.append({"platform": "youtube", "channel": handle, **v,
                                   "thumb": thumb, "featured": v["id"] in featured})
        except RuntimeError as err:
            print("WARN", err)
        profiles.append(row)
    return profiles, videos


def scrape_linkedin():
    url = f"https://www.linkedin.com/in/{LINKEDIN}"
    row = profile_row("linkedin", LINKEDIN, url)
    try:
        row.update(parse.parse_linkedin(meta(get(url), "og:title")))
    except RuntimeError as err:
        print("WARN", err, "- LinkedIn falls back to a plain link")
    return row


def main():
    THUMBS.mkdir(parents=True, exist_ok=True)
    previous = json.loads(OUT_JSON.read_text()) if OUT_JSON.exists() else {}
    featured = {r["id"] for r in previous.get("videos", []) if r.get("featured")} | \
               {r["shortcode"] for r in previous.get("posts", []) if r.get("featured")}

    ig_profiles, posts = scrape_instagram(featured)
    yt_profiles, videos = scrape_youtube(featured)
    if not posts and not videos:
        sys.exit("Nothing scraped; social.json left untouched.")

    data = {
        "scrapedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "profiles": ig_profiles + yt_profiles + [scrape_linkedin()],
        "videos": videos,
        "posts": posts,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"profiles={len(data['profiles'])} videos={len(videos)} posts={len(posts)} -> {OUT_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the parser tests again (nothing broke)**

Run: `scraper/.venv/bin/python -m unittest discover -s scraper -p "test_*.py"`
Expected: `OK`

- [ ] **Step 3: Run the scrape**

Run: `scraper/.venv/bin/python scraper/scrape.py`
Expected: a final line like `profiles=5 videos=30 posts=10 -> src/data/social.json`. `WARN` lines are allowed (LinkedIn especially). If it exits with `Nothing scraped`, stop and report the WARN lines — the first fix to try is swapping `Fetcher.get(...)` for `StealthyFetcher.fetch(url, headless=True, network_idle=True)` after `scraper/.venv/bin/scrapling install`.

- [ ] **Step 4: Check every row has its thumbnail**

```bash
node -e "const fs=require('fs');const s=JSON.parse(fs.readFileSync('src/data/social.json','utf8'));const miss=[...s.videos,...s.posts].filter(r=>!fs.existsSync('src/assets/social/'+r.thumb));console.log('videos',s.videos.length,'posts',s.posts.length,'missing thumbs',miss.length)"
```

Expected: `missing thumbs 0`

- [ ] **Step 5: Commit the seed**

```bash
git add scraper/scrape.py src/data/social.json src/assets/social
git commit -m "feat(scraper): seed social.json and thumbnails from public profiles"
```

- [ ] **Step 6: GATE G1 — user curation**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Post exactly:

> G1: open `src/data/social.json` and set `"featured": true` on 3–6 YouTube videos for The Pitch and 6–9 Instagram posts for The Stands. Want older Instagram posts? List their URLs in `scraper/instagram_posts.txt` and I'll re-run the scrape first (your flags are kept). Reply "G1 done".

Wait for "G1 done". If the override file was added, re-run Step 3 and Step 4 before continuing.

- [ ] **Step 7: Verify curation and commit**

```bash
node -e "const s=JSON.parse(require('fs').readFileSync('src/data/social.json','utf8'));console.log('featured videos',s.videos.filter(v=>v.featured).length,'featured posts',s.posts.filter(p=>p.featured).length)"
```

Expected: featured videos between 3 and 6, featured posts between 6 and 9.

```bash
git add src/data/social.json
[ -f scraper/instagram_posts.txt ] && git add scraper/instagram_posts.txt
git commit -m "chore(data): G1 curated featured videos and posts"
```

---

### Task 5: Data schema and helpers

**Tier:** Flash · **Owner:** Agent · **Lane:** A (Steps 1–8 can run before Task 4 finishes; Step 9 needs Task 4's real `social.json`) · **Gate:** — · **ADRs:** 0003, 0006
**Skills:** `test-driven-development`, `astro`, `ponytail`

**Files:**
- Create: `src/lib/social-schema.js`, `src/lib/social-schema.test.js`, `src/lib/social.js`, `src/lib/format.js`, `src/lib/format.test.js`, `src/lib/links.js`, `src/lib/links.test.js`, `src/data/site.js`

**Interfaces:**
- Consumes: `src/data/social.json` shape from Task 4; values from `docs/inputs.md`
- Produces:
  - `src/lib/social-schema.js`: `SocialSchema` (zod), `parseSocial(data) -> Social` (throws on invalid)
  - `src/lib/social.js` (Astro/Vite only, not node-testable): `social`, `featuredVideos`, `featuredPosts`, `profilesBy(platform) -> Profile[]`, `thumb(fileName) -> ImageMetadata | undefined`
  - `src/lib/format.js`: `compactCount(n: number|null) -> string` ("46.3M", null → "—"), `longDate(iso: string) -> string` ("12 September 2026")
  - `src/lib/links.js`: `whatsappUrl(digits: string, text: string) -> string`, `mailtoUrl(email: string, subject: string) -> string` (both throw on bad input)
  - `src/data/site.js`: `site = { name, tagline, whatsapp, email, enquiryText, enquirySubject, bio: string[], profiles: { instagram: string[], youtube: string[], linkedin: string } }`

- [ ] **Step 1: Write the failing schema test**

`src/lib/social-schema.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSocial } from './social-schema.js';

const sample = {
  scrapedAt: '2026-09-12T10:00:00+00:00',
  profiles: [{ platform: 'youtube', handle: 'spinandswing26', url: 'https://www.youtube.com/@spinandswing26', followers: 12300, postCount: null, name: null, headline: null }],
  videos: [{ platform: 'youtube', channel: 'spinandswing26', id: 'DfECjUL9ZvU', title: 'Nets', views: 147443, publishedAt: '2026-09-10T20:00:18+00:00', thumb: 'yt-DfECjUL9ZvU.jpg', featured: true }],
  posts: [{ platform: 'instagram', account: 'spinandswing26', shortcode: 'DdHNbqDJusb', url: 'https://www.instagram.com/p/DdHNbqDJusb/', caption: 'hi', likes: null, isReel: false, thumb: 'ig-DdHNbqDJusb.jpg', featured: false }],
};

test('accepts a valid scrape', () => {
  assert.equal(parseSocial(sample).videos[0].views, 147443);
});

test('accepts null counts', () => {
  const s = structuredClone(sample);
  s.profiles[0].followers = null;
  assert.equal(parseSocial(s).profiles[0].followers, null);
});

test('rejects a row without a thumbnail', () => {
  const s = structuredClone(sample);
  delete s.videos[0].thumb;
  assert.throws(() => parseSocial(s));
});

test('rejects an unknown platform', () => {
  const s = structuredClone(sample);
  s.profiles[0].platform = 'tiktok';
  assert.throws(() => parseSocial(s));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module` … `social-schema.js`

- [ ] **Step 3: Write the schema**

`src/lib/social-schema.js`:

```js
import { z } from 'astro/zod';

const count = z.number().int().nonnegative().nullable();
const isoDate = z.iso.datetime({ offset: true });

export const SocialSchema = z.object({
  scrapedAt: isoDate,
  profiles: z.array(
    z.object({
      platform: z.enum(['instagram', 'youtube', 'linkedin']),
      handle: z.string().min(1),
      url: z.url(),
      followers: count,
      postCount: count,
      name: z.string().nullable(),
      headline: z.string().nullable(),
    }),
  ),
  videos: z.array(
    z.object({
      platform: z.literal('youtube'),
      channel: z.string().min(1),
      id: z.string().regex(/^[\w-]{11}$/),
      title: z.string(),
      views: count,
      publishedAt: isoDate,
      thumb: z.string().regex(/^yt-[\w-]{11}\.jpg$/),
      featured: z.boolean(),
    }),
  ),
  posts: z.array(
    z.object({
      platform: z.literal('instagram'),
      account: z.string().min(1),
      shortcode: z.string().regex(/^[\w-]{8,}$/),
      url: z.url(),
      caption: z.string(),
      likes: count,
      isReel: z.boolean(),
      thumb: z.string().regex(/^ig-[\w-]{8,}\.jpg$/),
      featured: z.boolean(),
    }),
  ),
});

/** @param {unknown} data */
export const parseSocial = (data) => SocialSchema.parse(data);
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npm test`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Write the failing format and links tests**

`src/lib/format.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactCount, longDate } from './format.js';

test('compactCount', () => {
  assert.equal(compactCount(46300000), '46.3M');
  assert.equal(compactCount(8584), '8.6K');
  assert.equal(compactCount(999), '999');
  assert.equal(compactCount(0), '0');
  assert.equal(compactCount(null), '—');
});

test('longDate is UTC and unambiguous', () => {
  assert.equal(longDate('2026-09-12T23:30:00+00:00'), '12 September 2026');
});
```

`src/lib/links.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappUrl, mailtoUrl } from './links.js';

test('whatsappUrl encodes the message', () => {
  assert.equal(
    whatsappUrl('919812345678', 'Hi Abhishek & team'),
    'https://wa.me/919812345678?text=Hi%20Abhishek%20%26%20team',
  );
});

test('whatsappUrl rejects formatted numbers', () => {
  assert.throws(() => whatsappUrl('+91 98123 45678', 'hi'));
});

test('mailtoUrl encodes the subject', () => {
  assert.equal(mailtoUrl('hello@example.com', 'Brand collab: Q4'), 'mailto:hello@example.com?subject=Brand%20collab%3A%20Q4');
});

test('mailtoUrl rejects a bad address', () => {
  assert.throws(() => mailtoUrl('not-an-email', 'x'));
});
```

- [ ] **Step 6: Run them to verify they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module` for `format.js` and `links.js`

- [ ] **Step 7: Write format and links**

`src/lib/format.js`:

```js
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** @param {number | null} n */
export const compactCount = (n) => (n == null ? '—' : compact.format(n));

/** @param {string} iso */
export const longDate = (iso) => dateFmt.format(new Date(iso));
```

`src/lib/links.js`:

```js
/**
 * @param {string} digits country code + number, digits only
 * @param {string} text prefilled message
 */
export function whatsappUrl(digits, text) {
  if (!/^\d{8,15}$/.test(digits)) throw new Error(`WhatsApp number must be 8-15 digits, got "${digits}"`);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * @param {string} email
 * @param {string} subject
 */
export function mailtoUrl(email, subject) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Invalid email "${email}"`);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
```

- [ ] **Step 8: Run all tests and commit**

Run: `npm test`
Expected: `# pass 10`, `# fail 0`

```bash
git add src/lib/social-schema.js src/lib/social-schema.test.js src/lib/format.js src/lib/format.test.js src/lib/links.js src/lib/links.test.js
git commit -m "feat(lib): social.json schema, count/date formatting, WhatsApp and mailto links"
```

- [ ] **Step 9: Wire the real data and site constants (after Task 4 is merged)**

`src/lib/social.js`:

```js
import raw from '../data/social.json';
import { parseSocial } from './social-schema.js';

export const social = parseSocial(raw);
export const featuredVideos = social.videos.filter((v) => v.featured);
export const featuredPosts = social.posts.filter((p) => p.featured);

/** @param {'instagram' | 'youtube' | 'linkedin'} platform */
export const profilesBy = (platform) => social.profiles.filter((p) => p.platform === platform);

const thumbs = import.meta.glob('../assets/social/*.jpg', { eager: true, import: 'default' });
/** @param {string} fileName e.g. "yt-DfECjUL9ZvU.jpg" */
export const thumb = (fileName) => thumbs[`../assets/social/${fileName}`];
```

`src/data/site.js` — copy each value exactly from `docs/inputs.md` (tagline, WhatsApp digits, email, bio facts):

```js
export const site = {
  name: 'Abhishek Pandey',
  tagline: '<tagline from docs/inputs.md>',
  whatsapp: '<digits from docs/inputs.md>',
  email: '<email from docs/inputs.md>',
  enquiryText: "Hi Abhishek, we'd like to talk about a brand collaboration with you.",
  enquirySubject: 'Brand collaboration enquiry',
  bio: ['<fact 1 from docs/inputs.md>', '<fact 2>', '<fact 3>'],
  profiles: {
    instagram: ['https://www.instagram.com/abhishekpandey_26/', 'https://www.instagram.com/spinandswing26/'],
    youtube: ['https://www.youtube.com/@spinandswing26', 'https://www.youtube.com/@abhishekunseen26'],
    linkedin: 'https://www.linkedin.com/in/abhishek-pandey-26sep03',
  },
};
```

Then prove nothing was left unfilled and the real scrape passes the schema:

```bash
grep -c "docs/inputs.md\|<fact" src/data/site.js
npm run build
```

Expected: grep prints `0`; build `Complete!` (a zod error here names the exact bad field in `social.json` — fix the scraper, not the schema).

- [ ] **Step 10: Commit**

```bash
git add src/lib/social.js src/data/site.js
git commit -m "feat(data): parse social.json at build and add site constants"
```

---

## Phase 1 — Lane B: Art

### Task 6: Style bible and keyframe prompts

**Tier:** Pro · **Owner:** Agent · **Lane:** B · **Gate:** — (feeds G2) · **ADRs:** 0001, 0002, 0006
**Skills:** `web3d-art-direction` (concept sentence, palette, lighting mood, section blueprint), `premium-web-design`, `ui-ux-pro-max` (contrast of the palette anchors), `scroll-experience` (pacing of the five moves)

**Files:**
- Create: `assets/prompts/keyframes.md`, `assets/prompts/log.md`

**Interfaces:**
- Consumes: zone order and transition ids from Global Constraints
- Produces: six keyframe prompts headed `## Keyframe 01-tunnel` … `## Keyframe 06-boundary` and five camera-move prompts headed `## Move 01-tunnel-pitch` … `## Move 05-pavilion-boundary`. Task 7 pastes these verbatim; Task 11 samples its palette from the six palette anchors.

This is a creative task: keep every **Rule** below exactly, and use the skills to sharpen the wording, lighting and camera language. The draft is complete and usable as-is.

- [ ] **Step 1: Write the style bible and prompts**

`assets/prompts/keyframes.md`:

```markdown
# Stadium flythrough — style bible and prompts

## Concept
Match night in an empty cricket stadium, seen by the player walking out: floodlit, humid, cinematic, a little dusty. Quiet before the noise.

## Rules (do not change)
- Same stadium, same time of day, same weather in all six keyframes. Keyframe 01 is the visual reference for 02–06.
- 16:9, generate at the highest size available, key subject inside the centre third, top and bottom 15% calm enough for text.
- No people, no faces, no crowd, no readable text or numbers, no logos, no sponsor brands, no watermark.
- Stylised cinematic realism (concept art for a sports film). Not photoreal, not cartoon, not neon, no purple.

## Palette anchors
| Name | Hex | Where it lives |
|------|-----|----------------|
| Night turf | #0E1F17 | outfield in shadow, deep background |
| Willow | #D9B98A | wood, pitch strip, warm highlights |
| Cherry leather | #B3261E | tunnel stripe, rope, one accent per frame |
| Floodlight | #F4F1E6 | light beams, crease lines |
| Chalk | #E9E4D4 | stumps, sightscreen |
| Scoreboard amber | #FFB020 | scoreboard glow only |

## Light and lens
Dusk turning to night. Four floodlight towers give a warm key and long soft shadows; sky is deep blue-green (#1B2A3A); light haze makes the beams visible. 35mm lens, eye height 1.6 m unless stated, gentle film grain, no lens-flare stars, no motion blur.

## Shared prompt prefix
Cinematic stylised concept art of an empty cricket stadium at night, four floodlight towers, warm floodlight key light, deep blue-green sky, light haze with visible light beams, palette of dark turf green, willow wood, cherry red accents, floodlight white and chalk, 35mm lens, subtle film grain, 16:9, no people, no text, no logos.

## Keyframe 01-tunnel
Shared prompt prefix. Inside the concrete players' tunnel, camera 10 m back from the exit at eye height looking straight out through the opening onto the bright floodlit ground; a cherry-red stripe runs along both walls; the far opening glows; the pitch is visible in the centre third.

## Keyframe 02-pitch
Shared prompt prefix. Standing at the batting crease beside chalk-white stumps, camera at eye height looking straight down the 22-yard willow-coloured pitch to the far stumps in the centre third; floodlights above both sides; outfield dark turf green.

## Keyframe 03-scoreboard
Shared prompt prefix. From the middle of the pitch, camera tilted up about 25 degrees toward a huge scoreboard above the far stand in the centre third; its panels glow scoreboard amber with abstract blocks, no readable digits; floodlight beams cross the haze.

## Keyframe 04-stands
Shared prompt prefix. Low angle from the outfield sweeping across empty tiered stands; seats in dark green and willow tones; floodlight beams through haze; the densest tier sits in the centre third.

## Keyframe 05-pavilion
Shared prompt prefix. Facing the old pavilion from just inside the boundary: wooden balcony railings, warm interior light, empty honours boards with no readable names, cherry-red rope in the foreground; pavilion doors in the centre third.

## Keyframe 06-boundary
Shared prompt prefix. Camera low at the boundary rope, the cherry-red rope running through the centre of the frame, the whole empty ground and all four floodlight towers behind, sky deepening to night.

## Move 01-tunnel-pitch
Start frame: Keyframe 01. End frame: Keyframe 02. Slow, steady dolly forward out of the tunnel into the floodlit ground, settling at the batting crease facing down the pitch. Smooth, no shake, no cuts, no people.

## Move 02-pitch-scoreboard
Start frame: Keyframe 02. End frame: Keyframe 03. The camera rises slightly and tilts up in one smooth motion toward the scoreboard above the far stand. No cuts, no people.

## Move 03-scoreboard-stands
Start frame: Keyframe 03. End frame: Keyframe 04. The camera tilts down and pans left in one continuous arc across the empty stands. No cuts, no people.

## Move 04-stands-pavilion
Start frame: Keyframe 04. End frame: Keyframe 05. The camera tracks sideways along the boundary and turns to face the pavilion. No cuts, no people.

## Move 05-pavilion-boundary
Start frame: Keyframe 05. End frame: Keyframe 06. The camera pulls back and lowers to the boundary rope, revealing the whole ground. No cuts, no people.
```

`assets/prompts/log.md`:

```markdown
# Generation log

Every generation that ends up in the repo gets a row. Manual generation is not reproducible; this log is how a single zone gets redone later in the same style.

| Date | Asset | Tool / model | Prompt heading | Take chosen | Notes |
|------|-------|--------------|----------------|-------------|-------|
```

- [ ] **Step 2: Check structure**

```bash
grep -c "^## Keyframe 0[1-6]-" assets/prompts/keyframes.md
grep -c "^## Move 0[1-5]-" assets/prompts/keyframes.md
grep -ciE "purple|neon" assets/prompts/keyframes.md
```

Expected: `6`, `5`, and `1` (the only allowed mention is the "not neon, no purple" rule line).

- [ ] **Step 3: Commit**

```bash
git add assets/prompts
git commit -m "docs(art): style bible, six keyframe prompts, five camera moves"
```

---

### Task 7: Keyframe generation

**Tier:** — · **Owner:** **User** (agent prepares and post-processes) · **Lane:** B · **Gate:** **G2**, then **G3** · **ADRs:** 0002
**Skills:** none (manual work in the Gemini app)

**Files:**
- User adds: `assets/keyframes-raw/0N-<zone>.png` (gitignored)
- Create: `src/assets/keyframes/01-tunnel.jpg` … `06-boundary.jpg`
- Modify: `.gitignore` (add `assets/keyframes-raw/`), `assets/prompts/log.md`

**Interfaces:**
- Consumes: `## Keyframe` prompts from Task 6
- Produces: six 2560×1440 JPEGs at the exact paths in Global Constraints. Tasks 10, 11 and 20 import them; Task 12 uploads them to Flow as start/end frames.

- [ ] **Step 1: Prepare the folder**

```bash
mkdir -p assets/keyframes-raw src/assets/keyframes
printf 'assets/keyframes-raw/\n' >> .gitignore
```

- [ ] **Step 2: GATE G2 — style lock on keyframe 01**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Post exactly:

> G2: in the Gemini app, generate an image from the `## Keyframe 01-tunnel` prompt in `assets/prompts/keyframes.md` (ask for 16:9). Make 3–4 takes, pick the best, check the corners for a visible watermark, and save it as `assets/keyframes-raw/01-tunnel.png`. Reply "G2 done" — this image becomes the style reference for the other five.

Wait for "G2 done".

- [ ] **Step 3: Convert keyframe 01 and show it**

```bash
f=assets/keyframes-raw/01-tunnel.png
sips -g pixelWidth -g pixelHeight "$f"
sips -s format jpeg -s formatOptions 90 --resampleWidth 2560 "$f" --out src/assets/keyframes/01-tunnel.jpg
sips -g pixelWidth -g pixelHeight src/assets/keyframes/01-tunnel.jpg
```

Expected: output is 2560 wide and 1440 high (±2 px). If the source is not 16:9, crop it first: `sips --cropToHeightWidth <h> <w> "$f"` with `h = round(w × 9 / 16)`, then convert. Ask the user to confirm the converted file still looks right.

- [ ] **Step 4: GATE G3 — keyframes 02–06**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Post exactly:

> G3: for each of `## Keyframe 02-pitch` to `## Keyframe 06-boundary`, generate in the Gemini app **with `01-tunnel.png` attached as the style reference**, pick the best take, and save as `assets/keyframes-raw/02-pitch.png` … `06-boundary.png`. They must look like the same stadium on the same night. Reply "G3 done".

Wait for "G3 done".

- [ ] **Step 5: Convert all six and check**

```bash
for f in assets/keyframes-raw/0[2-6]-*.png; do
  sips -s format jpeg -s formatOptions 90 --resampleWidth 2560 "$f" --out "src/assets/keyframes/$(basename "${f%.png}").jpg"
done
ls src/assets/keyframes
for f in src/assets/keyframes/*.jpg; do sips -g pixelHeight "$f" | tail -1; done
```

Expected: exactly `01-tunnel.jpg 02-pitch.jpg 03-scoreboard.jpg 04-stands.jpg 05-pavilion.jpg 06-boundary.jpg`, each `pixelHeight: 1440` (±2). Show the six side by side to the user for the final G3 approval.

- [ ] **Step 6: Log and commit**

Append six rows to `assets/prompts/log.md`, one per keyframe, e.g.:

```markdown
| 2026-09-20 | 01-tunnel | Gemini app (image) | Keyframe 01-tunnel | take 3 of 4 | style reference for 02–06 |
```

```bash
git add .gitignore src/assets/keyframes assets/prompts/log.md
git commit -m "feat(art): six approved stadium keyframes (G2, G3)"
```

---

## Phase 1 — Lane C: Scrub engine

### Task 8: Frame exporter + placeholder frames

**Tier:** Flash · **Owner:** Agent · **Lane:** C · **Gate:** — · **ADRs:** 0001, 0002
**Skills:** `web3d-performance-budget` (frame budgets), `ponytail`

**Files:**
- Create: `scripts/export-frames.mjs`, `public/frames/**` (generated), `src/data/frames.json` (generated), `src/assets/placeholder-still.jpg` (generated)
- Modify: `package.json` (adds `sharp`)

**Interfaces:**
- Consumes: `assets/clips/<transition-id>.mp4` in real mode (Task 12); nothing in `--placeholder` mode
- Produces:
  - `public/frames/<transition-id>/<tier>/NNN.avif` (1-based, 3-digit)
  - `src/data/frames.json`: `{ "transitions": [{ "id": "01-tunnel-pitch", "desktop": 60, "mobile": 30 }, …] }` — counts are the frames actually written
  - `src/assets/placeholder-still.jpg` (placeholder mode only): 2560×1440 still used by Task 10 until real keyframes merge

- [ ] **Step 1: Install sharp**

Run: `npm install sharp`
Expected: `sharp` appears under `dependencies` in `package.json`.

- [ ] **Step 2: Write the exporter**

`scripts/export-frames.mjs`:

```js
#!/usr/bin/env node
// Clips in assets/clips/<id>.mp4 (or --placeholder test patterns)
//   -> public/frames/<id>/<tier>/NNN.avif + src/data/frames.json
// Run: node scripts/export-frames.mjs [--placeholder]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const TRANSITIONS = ['01-tunnel-pitch', '02-pitch-scoreboard', '03-scoreboard-stands', '04-stands-pavilion', '05-pavilion-boundary'];
// ponytail: fixed budgets from ADR-0001; these are the calibration knobs Task 22 tunes on a real phone
const TIERS = {
  desktop: { frames: 60, width: 1600, quality: 50 },
  mobile: { frames: 30, width: 720, quality: 45 },
};
const placeholder = process.argv.includes('--placeholder');

function placeholderFrame(id, i, count) {
  const hue = TRANSITIONS.indexOf(id) * 60;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <rect width="100%" height="100%" fill="hsl(${hue}, 45%, ${15 + Math.round((i / count) * 35)}%)"/>
    <text x="50%" y="50%" font-size="120" font-family="sans-serif" fill="#fff" text-anchor="middle" dominant-baseline="middle">${id} ${i + 1}/${count}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function clipFrames(id, count) {
  const clip = join('assets/clips', `${id}.mp4`);
  if (!existsSync(clip)) throw new Error(`Missing ${clip} — export it from Flow first (Task 12)`);
  const duration = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip]).toString(),
  );
  const dir = mkdtempSync(join(tmpdir(), 'frames-'));
  execFileSync('ffmpeg', ['-v', 'error', '-i', clip, '-an', '-vf', `fps=${count / duration}`, '-frames:v', String(count), '-q:v', '2', join(dir, '%03d.jpg')]);
  const buffers = readdirSync(dir).sort().map((f) => readFileSync(join(dir, f)));
  rmSync(dir, { recursive: true, force: true });
  return buffers;
}

const manifest = { transitions: [] };
for (const id of TRANSITIONS) {
  const count = TIERS.desktop.frames;
  const sources = placeholder
    ? await Promise.all(Array.from({ length: count }, (_, i) => placeholderFrame(id, i, count)))
    : clipFrames(id, count);
  const entry = { id };
  for (const [tier, { frames, width, quality }] of Object.entries(TIERS)) {
    const out = join('public/frames', id, tier);
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const n = Math.min(frames, sources.length);
    for (let i = 0; i < n; i++) {
      // fewer frames than sources: spread picks evenly so the move keeps its full length
      const src = sources[n === sources.length ? i : Math.round((i * (sources.length - 1)) / (n - 1))];
      await sharp(src).resize({ width }).avif({ quality }).toFile(join(out, `${String(i + 1).padStart(3, '0')}.avif`));
    }
    entry[tier] = n;
  }
  manifest.transitions.push(entry);
  console.log(`${id}: desktop ${entry.desktop}, mobile ${entry.mobile}`);
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/frames.json', `${JSON.stringify(manifest, null, 2)}\n`);

if (placeholder) {
  mkdirSync('src/assets', { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440"><rect width="100%" height="100%" fill="#0E1F17"/><text x="50%" y="50%" font-size="140" font-family="sans-serif" fill="#F4F1E6" text-anchor="middle" dominant-baseline="middle">placeholder still</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile('src/assets/placeholder-still.jpg');
}
```

- [ ] **Step 3: Generate placeholders and check counts and weight**

```bash
node scripts/export-frames.mjs --placeholder
ls public/frames/01-tunnel-pitch/desktop | wc -l
ls public/frames/01-tunnel-pitch/mobile | wc -l
cat src/data/frames.json
ls src/assets/placeholder-still.jpg
du -sh public/frames
```

Expected: five `…: desktop 60, mobile 30` lines; counts `60` and `30`; `frames.json` lists all five ids in order; the placeholder still exists; total well under 20 MB.

- [ ] **Step 4: Commit**

```bash
git add scripts/export-frames.mjs package.json package-lock.json public/frames src/data/frames.json src/assets/placeholder-still.jpg
git commit -m "feat(frames): AVIF frame exporter with placeholder mode"
```

---

### Task 9: Scrub math

**Tier:** Pro · **Owner:** Agent · **Lane:** C (∥ with Task 8) · **Gate:** — · **ADRs:** 0001
**Skills:** `test-driven-development`, `web3d-motion-choreography`, `ponytail`

**Files:**
- Create: `src/lib/scrub-math.js`, `src/lib/scrub-math.test.js`

**Interfaces:**
- Consumes: frame path convention from Global Constraints
- Produces, in `src/lib/scrub-math.js`:
  - `pickTier(viewportWidth: number) -> 'mobile' | 'desktop'` (mobile below 768)
  - `frameUrl(transitionId: string, tier: string, index: number) -> string` (index is 0-based; file is 1-based)
  - `coverRect(imgW, imgH, boxW, boxH) -> { x, y, w, h }` (object-fit: cover, centred)
  - `transitionsToLoad(active: number, total: number) -> number[]` (active and next, clamped)
  - `pickFrame(progresses: number[], counts: number[]) -> { t: number, i: number }` — the single source of truth for which frame is on the canvas: the last transition whose progress is above 0 owns it. Recomputing from every tween on each update means no tween can overwrite another's frame (a real bug found while verifying this plan: with one shared "current frame" variable, a ScrollTrigger refresh let the last-created tween win).

- [ ] **Step 1: Write the failing tests**

`src/lib/scrub-math.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTier, frameUrl, coverRect, transitionsToLoad, pickFrame } from './scrub-math.js';

test('pickTier splits at 768px', () => {
  assert.equal(pickTier(375), 'mobile');
  assert.equal(pickTier(767), 'mobile');
  assert.equal(pickTier(768), 'desktop');
});

test('frameUrl is 1-based and zero-padded', () => {
  assert.equal(frameUrl('01-tunnel-pitch', 'mobile', 0), '/frames/01-tunnel-pitch/mobile/001.avif');
  assert.equal(frameUrl('05-pavilion-boundary', 'desktop', 59), '/frames/05-pavilion-boundary/desktop/060.avif');
});

test('coverRect fills a same-ratio box exactly', () => {
  assert.deepEqual(coverRect(1600, 900, 1600, 900), { x: 0, y: 0, w: 1600, h: 900 });
});

test('coverRect centre-crops 16:9 into a portrait phone', () => {
  const r = coverRect(1600, 900, 390, 844);
  assert.equal(r.y, 0);
  assert.ok(Math.abs(r.h - 844) < 1e-9);
  assert.ok(r.x < 0);
  assert.ok(Math.abs(r.x * 2 + r.w - 390) < 1e-9, 'crop is symmetric');
});

test('transitionsToLoad keeps current and next, within bounds', () => {
  assert.deepEqual(transitionsToLoad(0, 5), [0, 1]);
  assert.deepEqual(transitionsToLoad(4, 5), [4]);
});

test('pickFrame shows the first frame before anything starts', () => {
  assert.deepEqual(pickFrame([0, 0, 0], [60, 60, 60]), { t: 0, i: 0 });
});

test('pickFrame: the last started transition owns the canvas', () => {
  assert.deepEqual(pickFrame([1, 0.5, 0], [60, 60, 60]), { t: 1, i: 30 });
});

test('pickFrame: a finished transition holds its last frame', () => {
  assert.deepEqual(pickFrame([1, 1, 0], [60, 59, 60]), { t: 1, i: 58 });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test src/lib/scrub-math.test.js`
Expected: FAIL with `Cannot find module` … `scrub-math.js`

- [ ] **Step 3: Implement**

`src/lib/scrub-math.js`:

```js
/** @param {number} viewportWidth CSS px */
export const pickTier = (viewportWidth) => (viewportWidth < 768 ? 'mobile' : 'desktop');

/**
 * @param {string} transitionId
 * @param {'mobile' | 'desktop'} tier
 * @param {number} index 0-based
 */
export const frameUrl = (transitionId, tier, index) =>
  `/frames/${transitionId}/${tier}/${String(index + 1).padStart(3, '0')}.avif`;

/** object-fit: cover, centred. All values in the same units (canvas px). */
export function coverRect(imgW, imgH, boxW, boxH) {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
}

/** @param {number} active @param {number} total */
export const transitionsToLoad = (active, total) => [active, active + 1].filter((i) => i >= 0 && i < total);

/**
 * The frame to show, computed from every transition's (possibly lagging) progress,
 * so no single tween can overwrite another's frame. The last transition that has
 * started owns the canvas; if none has, show the very first frame.
 * @param {number[]} progresses 0..1 per transition
 * @param {number[]} counts frames per transition
 */
export function pickFrame(progresses, counts) {
  const t = progresses.findLastIndex((p) => p > 0);
  if (t < 0) return { t: 0, i: 0 };
  return { t, i: Math.round(Math.min(1, progresses[t]) * (counts[t] - 1)) };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: all files pass, including `# pass 8` for this file's tests (18 total once Task 5 is merged).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scrub-math.js src/lib/scrub-math.test.js
git commit -m "feat(scrub): tier, frame URL, cover-rect, preload and frame-picking math"
```

---

### Task 10: Page shell, scrub stage, fallbacks

**Tier:** Pro · **Owner:** Agent · **Lane:** C (after Tasks 8 and 9) · **Gate:** — · **ADRs:** 0001, 0006, 0007
**Skills:** `scroll-experience`, `web3d-motion-choreography`, `web3d-interaction-ux` (reduced motion, no-JS and load-failure fallbacks), `modern-web-guidance`, `astro`, `full-output-enforcement`

**Files:**
- Create: `src/lib/keyframes.js`, `src/components/Zone.astro`, `src/components/ScrubStage.astro`, `src/scripts/scrub.js`
- Modify: `src/pages/index.astro` (replace the Task 2 stub), `package.json` (adds `gsap`)

**Interfaces:**
- Consumes: `src/data/frames.json` and `src/assets/placeholder-still.jpg` (Task 8); everything in `src/lib/scrub-math.js` (Task 9); keyframes from Task 7 when merged
- Produces:
  - `src/lib/keyframes.js`: `ZONES` (the six zone ids in order), `still(n: number) -> ImageMetadata` (real keyframe if present, placeholder otherwise — the fallback is deleted in Task 19)
  - `<Zone id label still eager?>`: a `<section id data-zone>` of at least one viewport, with the still behind a `<slot />`. Section components in Tasks 14–18 are placed inside it.
  - `<ScrubStage />`: the fixed canvas plus its script
  - `initScrub(canvas: HTMLCanvasElement) -> void` in `src/scripts/scrub.js`
  - `html.scrub-on` class: present only after the first frame has been drawn; removed if any frame fails to load. Stills are hidden only while it's present.

How the scroll maps to frames: transition `t` plays while zone `t+1`'s top edge travels from the bottom of the viewport to the top. Zones are at least `100dvh`, so the canvas holds each zone's keyframe while its content is on screen.

- [ ] **Step 1: Install GSAP**

Run: `npm install gsap@^3.15.0`

- [ ] **Step 2: Keyframe lookup with a temporary placeholder**

`src/lib/keyframes.js`:

```js
import placeholder from '../assets/placeholder-still.jpg';

export const ZONES = ['tunnel', 'pitch', 'scoreboard', 'stands', 'pavilion', 'boundary'];

const found = import.meta.glob('../assets/keyframes/*.jpg', { eager: true, import: 'default' });

/** @param {number} n 0-based zone index */
// ponytail: placeholder only so lane C can ship before G3; Task 19 removes the fallback
export const still = (n) => found[`../assets/keyframes/0${n + 1}-${ZONES[n]}.jpg`] ?? placeholder;
```

- [ ] **Step 3: Zone shell**

`src/components/Zone.astro`:

```astro
---
import { Image } from 'astro:assets';

interface Props {
  id: string;
  label: string;
  still: ImageMetadata;
  eager?: boolean;
}
const { id, label, still, eager = false } = Astro.props;
---
<section id={id} class="zone" aria-label={label} data-zone={id}>
  <Image
    class="zone-still"
    src={still}
    alt=""
    widths={[720, 1280, 1920, 2560]}
    sizes="100vw"
    loading={eager ? 'eager' : 'lazy'}
    fetchpriority={eager ? 'high' : 'auto'}
  />
  <div class="zone-content"><slot /></div>
</section>

<style>
  .zone {
    position: relative;
    min-height: 100dvh;
    display: grid;
  }
  .zone-still,
  .zone-content {
    grid-area: 1 / 1;
  }
  .zone-still {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .zone-content {
    position: relative;
    z-index: 1;
    align-self: center;
    padding: 1.5rem;
  }
  :global(html.scrub-on) .zone-still {
    visibility: hidden;
  }
</style>
```

- [ ] **Step 4: The scrub engine**

`src/scripts/scrub.js`:

```js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pickTier, frameUrl, coverRect, transitionsToLoad, pickFrame } from '../lib/scrub-math.js';

gsap.registerPlugin(ScrollTrigger);

/** @param {HTMLCanvasElement | null} canvas */
export function initScrub(canvas) {
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /** @type {{ id: string, desktop: number, mobile: number }[]} */
  const transitions = JSON.parse(canvas.dataset.frames ?? '[]');
  const zones = [...document.querySelectorAll('[data-zone]')];
  if (zones.length !== transitions.length + 1) {
    console.warn(`scrub: ${zones.length} zones but ${transitions.length} transitions; need exactly one more zone`);
    return;
  }

  const root = document.documentElement;
  const ctx = canvas.getContext('2d');
  const tier = pickTier(innerWidth); // ponytail: tier fixed at load; re-pick on resize only if rotation proves it matters
  const counts = transitions.map((tr) => tr[tier]);
  /** @type {HTMLImageElement[][]} */
  const images = transitions.map(() => []);
  /** @type {gsap.core.Tween[]} */
  let tweens = [];
  let current = { t: 0, i: 0 };
  let failed = false;

  function draw() {
    const img = images[current.t][current.i];
    if (failed || !img?.complete || !img.naturalWidth) return;
    const r = coverRect(img.naturalWidth, img.naturalHeight, canvas.width, canvas.height);
    ctx.drawImage(img, r.x, r.y, r.w, r.h);
    root.classList.add('scrub-on');
  }

  function fail() {
    if (failed) return;
    failed = true;
    root.classList.remove('scrub-on');
    tweens.forEach((tw) => tw.scrollTrigger?.kill());
  }

  function load(t) {
    if (images[t].length) return;
    images[t] = Array.from({ length: counts[t] }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => current.t === t && current.i === i && draw();
      img.onerror = fail;
      img.src = frameUrl(transitions[t].id, tier, i);
      return img;
    });
  }

  function sync() {
    current = pickFrame(tweens.map((tw) => tw.progress()), counts);
    transitionsToLoad(current.t, transitions.length).forEach(load);
    draw();
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    draw();
  }

  tweens = transitions.map((_, t) =>
    gsap.to(
      { p: 0 },
      {
        p: 1,
        ease: 'none',
        onUpdate: sync,
        scrollTrigger: { trigger: zones[t + 1], start: 'top bottom', end: 'top top', scrub: 1 },
      },
    ),
  );

  ScrollTrigger.addEventListener('refresh', sync);
  addEventListener('resize', resize);
  resize();
  sync();
}
```

- [ ] **Step 5: The stage component**

`src/components/ScrubStage.astro`:

```astro
---
import frames from '../data/frames.json';
---
<canvas id="scrub" aria-hidden="true" data-frames={JSON.stringify(frames.transitions)}></canvas>

<script>
  import { initScrub } from '../scripts/scrub.js';
  initScrub(document.querySelector('#scrub'));
</script>

<style>
  #scrub {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100dvh;
    display: none;
    z-index: 0;
    pointer-events: none;
  }
  :global(html.scrub-on) #scrub {
    display: block;
  }
  /* ponytail: minimal reset until Task 11 moves it into global.css */
  :global(body) {
    margin: 0;
    background: #0e1f17;
    color: #f4f1e6;
  }
</style>
```

- [ ] **Step 6: Page shell**

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import ScrubStage from '../components/ScrubStage.astro';
import Zone from '../components/Zone.astro';
import { ZONES, still } from '../lib/keyframes.js';

const LABELS = {
  tunnel: 'Intro',
  pitch: 'The Pitch',
  scoreboard: 'Scoreboard',
  stands: 'The Stands',
  pavilion: 'Pavilion',
  boundary: 'Boundary Rope',
};
---
<Base title="Abhishek Pandey — Cricket Content Creator" description="Cricket content by Abhishek Pandey.">
  <ScrubStage />
  <main>
    {ZONES.map((id, n) => (
      <Zone id={id} label={LABELS[id]} still={still(n)} eager={n === 0}>
        {n === 0 ? <h1>Abhishek Pandey</h1> : <h2>{LABELS[id]}</h2>}
      </Zone>
    ))}
  </main>
</Base>
```

- [ ] **Step 7: Build and test**

```bash
npm test
npm run build
node scripts/verify-pipeline.mjs
```

Expected: tests pass; build `Complete!`; verifier shows `motion PASS` (ScrollTrigger found) and `build PASS`. `art`, `assets` and `ux` stay FAIL until real keyframes and social data are merged.

- [ ] **Step 8: Behaviour check on a preview**

Push the branch (`git push -u origin HEAD`) and open its Vercel preview URL. Check all four, and write the result of each in the task report:

1. Scrolling from the top to the Pitch zone runs the `01-tunnel-pitch 1/60` … `60/60` placeholder counter forward; scrolling back runs it backward.
2. DevTools → Rendering → *Emulate prefers-reduced-motion: reduce*, reload: no canvas, the placeholder still shows behind every zone.
3. DevTools → Network → block request URL pattern `*/frames/*`, reload: stills show, the page still scrolls and reads normally.
4. DevTools → disable JavaScript, reload: stills show, all headings visible.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/lib/keyframes.js src/components/Zone.astro src/components/ScrubStage.astro src/scripts/scrub.js src/pages/index.astro
git commit -m "feat(scrub): canvas scroll-scrub stage with still fallbacks"
```

---

## Phase 2 — Look and video

### Task 11: Design tokens, fonts, hero

**Tier:** Pro · **Owner:** Agent → **User** approves · **Lane:** ∥ with Task 12 · **Gate:** **G4** · **ADRs:** 0006, 0007
**Skills:** `design-system`, `ui-ux-pro-max` (contrast, type scale), `premium-web-design`, `frontend-design`, `web-design-guidelines`, `design-taste-frontend`, `high-end-visual-design`, `grilling` (only when the user asks for changes at G4)

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/components/Hero.astro`
- Modify: `src/layouts/Base.astro` (fonts + global CSS), `src/components/ScrubStage.astro` (delete the temporary `body` reset), `src/components/Zone.astro` (scrim + content width), `src/pages/index.astro` (hero in zone 0), `package.json` (fonts)

**Interfaces:**
- Consumes: the six approved keyframes (G3), palette anchors in `assets/prompts/keyframes.md`, `site` from `src/data/site.js` (Task 5)
- Produces: CSS custom properties every section uses, and nothing else. Colours `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-highlight`, `--color-line`; fonts `--font-display`, `--font-body`; type steps `--step--1` … `--step-5`; space `--space-2xs` … `--space-2xl`; motion `--ease-out`, `--dur-fast`, `--dur-reveal`; plus the global `.kicker` label class in `global.css`. Tasks 14–18 may only **read** these.

The values below are a complete starting point drawn from the Task 6 anchors. Adjust hexes to match the approved keyframes, then re-run the contrast check in Step 5 with the new values.

- [ ] **Step 1: Install fonts**

Run: `npm install @fontsource-variable/big-shoulders-display @fontsource-variable/hanken-grotesk`

- [ ] **Step 2: Tokens**

`src/styles/tokens.css`:

```css
:root {
  /* primitives: sampled from src/assets/keyframes (G3) */
  --turf-950: #0e1f17;
  --willow-300: #d9b98a;
  --cherry-600: #b3261e;
  --flood-50: #f4f1e6;
  --chalk-100: #e9e4d4;
  --amber-400: #ffb020;

  /* semantic: components use only these */
  --color-bg: var(--turf-950);
  --color-surface: color-mix(in oklab, var(--turf-950) 75%, black);
  --color-text: var(--flood-50);
  --color-muted: var(--chalk-100);
  --color-accent: var(--cherry-600); /* fills only, with --color-text on top */
  --color-highlight: var(--amber-400); /* numbers, focus ring, one kicker per view */
  --color-line: color-mix(in oklab, var(--flood-50) 18%, transparent);
  --wood: var(--willow-300);

  --font-display: 'Big Shoulders Display Variable', 'Arial Narrow', sans-serif;
  --font-body: 'Hanken Grotesk Variable', system-ui, sans-serif;

  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem);
  --step-0: clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --step-2: clamp(1.6rem, 1.4rem + 1vw, 2.25rem);
  --step-3: clamp(2.2rem, 1.8rem + 2vw, 3.5rem);
  --step-4: clamp(3rem, 2.2rem + 4vw, 6rem);
  --step-5: clamp(4rem, 2.5rem + 8vw, 10rem);

  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-s: 1rem;
  --space-m: 1.5rem;
  --space-l: 2.5rem;
  --space-xl: 4rem;
  --space-2xl: 6rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 180ms;
  --dur-reveal: 600ms;
}
```

`src/styles/global.css`:

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  color-scheme: dark;
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--step-0);
  line-height: 1.6;
}
h1,
h2,
h3 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  line-height: 0.95;
  text-transform: uppercase;
}
h1 {
  font-size: var(--step-5);
}
h2 {
  font-size: var(--step-4);
}
h3 {
  font-size: var(--step-2);
}
a {
  color: inherit;
}
img {
  max-width: 100%;
  height: auto;
}
:focus-visible {
  outline: 3px solid var(--color-highlight);
  outline-offset: 3px;
}
.kicker {
  margin: 0;
  font-size: var(--step--1);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-highlight);
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Wire fonts and CSS into the layout, drop the temporary reset**

`src/layouts/Base.astro` — replace the frontmatter with:

```astro
---
import '@fontsource-variable/big-shoulders-display';
import '@fontsource-variable/hanken-grotesk';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
```

(The HTML below the frontmatter stays exactly as in Task 2.)

`src/components/ScrubStage.astro` — delete these lines from its `<style>`:

```css
  /* ponytail: minimal reset until Task 11 moves it into global.css */
  :global(body) {
    margin: 0;
    background: #0e1f17;
    color: #f4f1e6;
  }
```

- [ ] **Step 4: Scrim on zones, and the hero**

`src/components/Zone.astro` — replace its `<style>` block with:

```astro
<style>
  .zone {
    position: relative;
    min-height: 100dvh;
    display: grid;
  }
  .zone-still,
  .zone-content,
  .zone::after {
    grid-area: 1 / 1;
  }
  .zone-still {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .zone::after {
    content: '';
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(to bottom, rgb(14 31 23 / 0.15) 0%, rgb(14 31 23 / 0.35) 45%, rgb(14 31 23 / 0.85) 100%);
  }
  .zone-content {
    position: relative;
    z-index: 2;
    align-self: end;
    width: min(100%, 80rem);
    margin-inline: auto;
    padding: var(--space-xl) var(--space-m);
  }
  :global(html.scrub-on) .zone-still {
    visibility: hidden;
  }
</style>
```

`src/components/Hero.astro`:

```astro
---
import { site } from '../data/site.js';
---
<div class="hero">
  <p class="kicker">Cricket content creator · Spin &amp; Swing · Unseen</p>
  <h1>{site.name}</h1>
  <p class="tagline">{site.tagline}</p>
  <a class="cue" href="#pitch">Walk out <span aria-hidden="true">↓</span></a>
</div>

<style>
  .hero {
    display: grid;
    gap: var(--space-s);
  }
  .tagline {
    margin: 0;
    max-width: 36ch;
    font-size: var(--step-1);
    color: var(--color-muted);
  }
  .cue {
    justify-self: start;
    margin-top: var(--space-l);
    padding-bottom: var(--space-2xs);
    border-bottom: 2px solid var(--color-accent);
    font-family: var(--font-display);
    font-size: var(--step-1);
    text-transform: uppercase;
    text-decoration: none;
  }
</style>
```

`src/pages/index.astro` — add `import Hero from '../components/Hero.astro';` to the frontmatter and change the zone body line to:

```astro
        {n === 0 ? <Hero /> : <h2>{LABELS[id]}</h2>}
```

- [ ] **Step 5: Contrast check (re-run with your final hexes)**

```bash
node -e '
const L = (h) => { const c = [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255).map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2]; };
const ratio = (a,b) => { const [x,y] = [L(a),L(b)].sort((p,q) => q-p); return (x+0.05)/(y+0.05); };
for (const [fg,bg,min] of [["#f4f1e6","#0e1f17",4.5],["#e9e4d4","#0e1f17",4.5],["#ffb020","#0e1f17",3],["#f4f1e6","#b3261e",4.5]]) {
  const r = ratio(fg,bg); console.log(fg, "on", bg, r.toFixed(2), r >= min ? "PASS" : "FAIL");
}'
```

Expected: four `PASS` lines (15.14, 13.47, 9.36, 5.79 with the starting hexes).

- [ ] **Step 6: Build, verify, commit**

```bash
npm run build
node scripts/verify-pipeline.mjs
git add package.json package-lock.json src/styles src/layouts/Base.astro src/components/ScrubStage.astro src/components/Zone.astro src/components/Hero.astro src/pages/index.astro
git commit -m "feat(look): design tokens, Fontsource type, zone scrim, hero"
```

Expected: build `Complete!`; verifier `look PASS`.

- [ ] **Step 7: GATE G4**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Push and post exactly:

> G4: preview <URL>. To judge the tokens against the real art, open DevTools → Rendering → *prefers-reduced-motion: reduce* (the canvas still shows placeholder frames until Task 13). Check the hero on desktop and on your phone: name, tagline, colours, type. Reply "G4 approved" or tell me what to change.

Wait for "G4 approved". Apply requested changes to `tokens.css` / `Hero.astro` only, re-run Steps 5–6, and ask again.

---

### Task 12: Transition clips

**Tier:** — · **Owner:** **User** · **Lane:** ∥ with Task 11 · **Gate:** **G5** · **ADRs:** 0002
**Skills:** none (manual work in Google Flow)

**Files:**
- User adds: `assets/clips/01-tunnel-pitch.mp4` … `05-pavilion-boundary.mp4` (gitignored)
- Modify: `assets/prompts/log.md`

**Interfaces:**
- Consumes: `src/assets/keyframes/*.jpg` (Task 7), `## Move` prompts (Task 6)
- Produces: five MP4s at the exact paths above. Task 13 reads them.

- [ ] **Step 1: GATE G5 — post the instructions**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Post exactly:

> G5: in Google Flow (web), use **Frames to Video** five times. For each `## Move` in `assets/prompts/keyframes.md`, upload the start keyframe and end keyframe from `src/assets/keyframes/` and paste the move prompt. Use 16:9 and the highest quality available. Make 2–3 takes per move and pick the smoothest (no warping, no people appearing, the camera actually arrives at the end frame). Download each winner as `assets/clips/01-tunnel-pitch.mp4`, `02-pitch-scoreboard.mp4`, `03-scoreboard-stands.mp4`, `04-stands-pavilion.mp4`, `05-pavilion-boundary.mp4`. Audio is ignored. Reply "G5 done".

Wait for "G5 done".

- [ ] **Step 2: Check the files**

```bash
for f in assets/clips/0{1..5}-*.mp4; do
  printf "%s " "$f"
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of csv=p=0 "$f" | tr '\n' ' '
  echo
done
```

Expected: five lines, each roughly 16:9 (e.g. `1920,1080`) with a duration between 4 and 10 seconds.

- [ ] **Step 3: Log and commit**

Append five rows to `assets/prompts/log.md`, e.g. `| 2026-09-24 | 01-tunnel-pitch | Google Flow, Veo 3.1 Frames to Video | Move 01-tunnel-pitch | take 2 of 3 | |`.

```bash
git add assets/prompts/log.md
git commit -m "docs(art): log approved transition clips (G5)"
```

---

### Task 13: Real frame export

**Tier:** Flash · **Owner:** Agent · **Lane:** — · **Gate:** — · **ADRs:** 0001, 0002
**Skills:** `web3d-performance-budget`, `ponytail`

**Files:**
- Modify (regenerated): `public/frames/**`, `src/data/frames.json`

**Interfaces:**
- Consumes: `scripts/export-frames.mjs` (Task 8), `assets/clips/*.mp4` (Task 12)
- Produces: real frames at the same paths and the same `frames.json` shape as the placeholders, so no code changes.

- [ ] **Step 1: Export**

Run: `node scripts/export-frames.mjs`
Expected: five lines `…: desktop 60, mobile 30`. A clip shorter than expected may give 59; that's fine, `frames.json` records the real count.

- [ ] **Step 2: Check weight against the budget**

```bash
du -sh public/frames
for tier in desktop mobile; do
  find public/frames -path "*/$tier/*.avif" -exec du -k {} + | awk -v t=$tier '{s+=$1; n++} END {printf "%s: %d frames, %.0f KB avg\n", t, n, s/n}'
done
```

Expected: desktop average ≤ 60 KB, mobile average ≤ 25 KB. If higher, lower `quality` in `TIERS` in `scripts/export-frames.mjs` by 5 and re-run Step 1 — that's the knob.

- [ ] **Step 3: Look at it**

Push, open the preview, scroll top to bottom on desktop and on a phone. The camera should move continuously from tunnel to boundary with no jump at zone boundaries. Note any visible jump (which transition, which end) in the task report; a jump at a transition's end means that clip didn't land on its end keyframe and the user should pick another take in Task 12.

- [ ] **Step 4: Commit**

```bash
node scripts/verify-pipeline.mjs
git add public/frames src/data/frames.json scripts/export-frames.mjs
git commit -m "feat(frames): export real stadium flythrough frames"
```

Expected (verifier): `assets` PASS once `social.json` is merged.

---

## Phase 3 — Lane D: Sections (five agents in parallel)

Rules for all of Tasks 14–18:
- Each section is one component that imports its own data; it takes no props, so Task 19 can drop it into a zone with one line.
- Read tokens and the global `.kicker` class; never edit `tokens.css`, `global.css`, `index.astro`, `Zone.astro` or `scrub.js`.
- Each task adds its own preview page at `src/pages/dev/<section>.astro` (Task 19 deletes the whole `src/pages/dev/` folder), so five agents never touch the same file.
- Text sits over moving art: body copy uses `--color-text`/`--color-muted` on `--color-surface` panels or the zone scrim, never directly on the canvas.

### Task 14: Pitch section

**Tier:** Flash · **Owner:** Agent · **Lane:** D · **Gate:** — · **ADRs:** 0003, 0006
**Skills:** `frontend-design`, `web-design-guidelines`, `astro`, `accessibility-auditor`, `design-taste-frontend`, `full-output-enforcement`

**Files:**
- Create: `src/components/Pitch.astro`, `src/pages/dev/pitch.astro`

**Interfaces:**
- Consumes: `featuredVideos`, `thumb()` from `src/lib/social.js`; `compactCount`, `longDate` from `src/lib/format.js`
- Produces: `<Pitch />`

Tap-to-play facade: each card is a real link to the video on YouTube, so it works without JS; the script swaps the link for a `youtube-nocookie` player only when tapped, so no player JavaScript loads until then.

- [ ] **Step 1: Component**

`src/components/Pitch.astro`:

```astro
---
import { Image } from 'astro:assets';
import { featuredVideos, thumb } from '../lib/social.js';
import { compactCount, longDate } from '../lib/format.js';
---
<div class="pitch">
  <header>
    <p class="kicker">The Pitch</p>
    <h2>Highlights</h2>
  </header>
  <ul class="grid" role="list">
    {featuredVideos.map((v) => (
      <li class="card">
        <a class="facade" href={`https://www.youtube.com/watch?v=${v.id}`} data-yt={v.id} data-title={v.title} aria-label={`Play video: ${v.title}`}>
          <Image class="thumb" src={thumb(v.thumb)} alt="" widths={[480, 960]} sizes="(min-width: 64rem) 30vw, 90vw" />
          <span class="play" aria-hidden="true">▶</span>
        </a>
        <h3 class="title">{v.title}</h3>
        <p class="meta">{compactCount(v.views)} views · {longDate(v.publishedAt)}</p>
      </li>
    ))}
  </ul>
</div>

<script>
  document.querySelectorAll('a[data-yt]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${link.dataset.yt}?autoplay=1&playsinline=1&rel=0`;
      iframe.title = link.dataset.title ?? 'YouTube video';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.className = 'player';
      link.replaceWith(iframe);
      iframe.focus();
    });
  });
</script>

<style>
  .pitch {
    display: grid;
    gap: var(--space-l);
  }
  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-m);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  }
  .card {
    display: grid;
    gap: var(--space-xs);
    align-content: start;
  }
  .facade,
  .card :global(.player) {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border: 0;
    background: var(--color-surface);
  }
  .thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .facade:hover .thumb {
    transform: scale(1.03);
  }
  .play {
    position: absolute;
    left: var(--space-s);
    bottom: var(--space-s);
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--color-accent);
    color: var(--color-text);
  }
  .title {
    font-family: var(--font-body);
    font-size: var(--step-0);
    font-weight: 600;
    line-height: 1.3;
    text-transform: none;
  }
  .meta {
    margin: 0;
    font-size: var(--step--1);
    color: var(--color-muted);
  }
</style>
```

- [ ] **Step 2: Preview page**

`src/pages/dev/pitch.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Pitch from '../../components/Pitch.astro';
---
<Base title="dev: pitch" description="section preview">
  <main style="padding: 2rem"><Pitch /></main>
</Base>
```

- [ ] **Step 3: Build and count**

```bash
npm run build
grep -o 'data-yt="' dist/dev/pitch/index.html | wc -l
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/social.json','utf8')).videos.filter(v=>v.featured).length)"
```

Expected: build `Complete!`; the two numbers are equal.

- [ ] **Step 4: Behaviour check on the preview (`/dev/pitch`)**

1. Click a card: the thumbnail becomes a playing YouTube player in place.
2. Tab to a card and press Enter: same, and focus lands on the player.
3. JavaScript disabled: clicking opens the video on youtube.com.
4. Network tab before any click: no requests to `youtube.com` or `youtube-nocookie.com`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Pitch.astro src/pages/dev/pitch.astro
git commit -m "feat(sections): Pitch with tap-to-play YouTube facades"
```

---

### Task 15: Scoreboard section

**Tier:** Flash · **Owner:** Agent · **Lane:** D · **Gate:** — · **ADRs:** 0003, 0006
**Skills:** `frontend-design`, `premium-web-design`, `test-driven-development`, `astro`, `high-end-visual-design`, `full-output-enforcement`

**Files:**
- Create: `src/lib/stats.js`, `src/lib/stats.test.js`, `src/components/Scoreboard.astro`, `src/pages/dev/scoreboard.astro`

**Interfaces:**
- Consumes: `social` from `src/lib/social.js`; `compactCount`, `longDate` from `src/lib/format.js`
- Produces: `scoreboardStats(social) -> { totalReach: number|null, totalViews: number|null, accounts: { label: string, value: number|null, url: string }[], asOf: string }` and `<Scoreboard />`

- [ ] **Step 1: Failing test**

`src/lib/stats.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreboardStats } from './stats.js';

const base = {
  scrapedAt: '2026-09-12T10:00:00+00:00',
  profiles: [
    { platform: 'instagram', handle: 'abhishekpandey_26', url: 'https://www.instagram.com/abhishekpandey_26/', followers: 12000 },
    { platform: 'instagram', handle: 'spinandswing26', url: 'https://www.instagram.com/spinandswing26/', followers: null },
    { platform: 'youtube', handle: 'spinandswing26', url: 'https://www.youtube.com/@spinandswing26', followers: 8000 },
    { platform: 'linkedin', handle: 'abhishek-pandey-26sep03', url: 'https://www.linkedin.com/in/abhishek-pandey-26sep03', followers: null },
  ],
  videos: [{ views: 1000 }, { views: null }, { views: 500 }],
};

test('sums known followers across Instagram and YouTube only', () => {
  assert.equal(scoreboardStats(base).totalReach, 20000);
});

test('sums known video views', () => {
  assert.equal(scoreboardStats(base).totalViews, 1500);
});

test('all-unknown totals are null, not zero', () => {
  const s = structuredClone(base);
  s.profiles.forEach((p) => (p.followers = null));
  s.videos = [{ views: null }];
  const r = scoreboardStats(s);
  assert.equal(r.totalReach, null);
  assert.equal(r.totalViews, null);
});

test('lists one tile per Instagram/YouTube account, LinkedIn excluded', () => {
  assert.deepEqual(
    scoreboardStats(base).accounts.map((a) => a.label),
    ['Instagram @abhishekpandey_26', 'Instagram @spinandswing26', 'YouTube @spinandswing26'],
  );
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test src/lib/stats.test.js`
Expected: FAIL with `Cannot find module` … `stats.js`

- [ ] **Step 3: Implement**

`src/lib/stats.js`:

```js
const LABEL = { instagram: 'Instagram', youtube: 'YouTube' };

/** @param {(number | null)[]} values */
const sumKnown = (values) => {
  const known = values.filter((v) => v != null);
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
};

/** @param {{ scrapedAt: string, profiles: { platform: string, handle: string, url: string, followers: number | null }[], videos: { views: number | null }[] }} social */
export function scoreboardStats(social) {
  const reach = social.profiles.filter((p) => p.platform in LABEL);
  return {
    totalReach: sumKnown(reach.map((p) => p.followers)),
    totalViews: sumKnown(social.videos.map((v) => v.views)),
    accounts: reach.map((p) => ({ label: `${LABEL[p.platform]} @${p.handle}`, value: p.followers, url: p.url })),
    asOf: social.scrapedAt,
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test src/lib/stats.test.js`
Expected: `# pass 4`, `# fail 0`

- [ ] **Step 5: Component**

`src/components/Scoreboard.astro`:

```astro
---
import { social } from '../lib/social.js';
import { scoreboardStats } from '../lib/stats.js';
import { compactCount, longDate } from '../lib/format.js';

const s = scoreboardStats(social);
---
<div class="board">
  <header>
    <p class="kicker">Scoreboard</p>
    <h2>The numbers</h2>
  </header>
  <dl class="tiles">
    <div class="tile big">
      <dt>Total followers</dt>
      <dd data-count={s.totalReach}>{compactCount(s.totalReach)}</dd>
    </div>
    <div class="tile big">
      <dt>Views on recent videos</dt>
      <dd data-count={s.totalViews}>{compactCount(s.totalViews)}</dd>
    </div>
    {s.accounts.map((a) => (
      <div class="tile">
        <dt><a href={a.url} target="_blank" rel="noopener">{a.label}</a></dt>
        <dd data-count={a.value}>{compactCount(a.value)}</dd>
      </div>
    ))}
  </dl>
  <p class="asof">Public counts as of {longDate(s.asOf)}</p>
</div>

<script>
  import { compactCount } from '../lib/format.js';

  const counters = [...document.querySelectorAll('.board [data-count]')];
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && counters.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (!isIntersecting) continue;
          io.unobserve(target);
          const end = Number(target.dataset.count);
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / 1200);
            target.textContent = compactCount(Math.round(end * (1 - (1 - p) ** 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => io.observe(el));
  }
</script>

<style>
  .board {
    display: grid;
    gap: var(--space-m);
  }
  .tiles {
    margin: 0;
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    background: var(--color-line);
    border: 1px solid var(--color-line);
  }
  .tile {
    display: grid;
    gap: var(--space-xs);
    align-content: start;
    padding: var(--space-m);
    background: color-mix(in oklab, var(--color-surface) 88%, transparent);
  }
  @media (min-width: 40rem) {
    .big {
      grid-column: span 2;
    }
  }
  dt {
    font-size: var(--step--1);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--step-4);
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--color-highlight);
    text-shadow: 0 0 24px color-mix(in oklab, var(--color-highlight) 45%, transparent);
  }
  .asof {
    margin: 0;
    font-size: var(--step--1);
    color: var(--color-muted);
  }
</style>
```

`data-count` is left off automatically when a value is `null`, so unknown counts show "—" and are never animated.

- [ ] **Step 6: Preview page, build, commit**

`src/pages/dev/scoreboard.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Scoreboard from '../../components/Scoreboard.astro';
---
<Base title="dev: scoreboard" description="section preview">
  <main style="padding: 2rem"><Scoreboard /></main>
</Base>
```

```bash
npm test
npm run build
grep -o "Public counts as of [0-9]* [A-Za-z]* [0-9]*" dist/dev/scoreboard/index.html
git add src/lib/stats.js src/lib/stats.test.js src/components/Scoreboard.astro src/pages/dev/scoreboard.astro
git commit -m "feat(sections): Scoreboard with reach totals and count-up"
```

Expected: tests pass; build `Complete!`; the grep prints the scrape date. On `/dev/scoreboard`, numbers count up once when scrolled into view, and show final values immediately with reduced motion or JS disabled.

---

### Task 16: Stands section

**Tier:** Flash · **Owner:** Agent · **Lane:** D · **Gate:** — · **ADRs:** 0003, 0006
**Skills:** `frontend-design`, `web-design-guidelines`, `astro`, `accessibility-auditor`, `design-taste-frontend`, `full-output-enforcement`

**Files:**
- Create: `src/components/Stands.astro`, `src/pages/dev/stands.astro`

**Interfaces:**
- Consumes: `featuredPosts`, `profilesBy()`, `thumb()` from `src/lib/social.js`; `compactCount` from `src/lib/format.js`
- Produces: `<Stands />`

Posts open on Instagram in a new tab. No Instagram embed script is loaded (it is heavy and needs cookies); the self-hosted thumbnail is the preview.

- [ ] **Step 1: Component**

`src/components/Stands.astro`:

```astro
---
import { Image } from 'astro:assets';
import { featuredPosts, profilesBy, thumb } from '../lib/social.js';
import { compactCount } from '../lib/format.js';

const accounts = profilesBy('instagram');
---
<div class="stands">
  <header>
    <p class="kicker">The Stands</p>
    <h2>On Instagram</h2>
  </header>
  <ul class="grid" role="list">
    {featuredPosts.map((p) => (
      <li>
        <a
          class="post"
          href={p.url}
          target="_blank"
          rel="noopener"
          aria-label={p.caption ? undefined : `Instagram ${p.isReel ? 'reel' : 'post'} by @${p.account}`}
        >
          <Image class="thumb" src={thumb(p.thumb)} alt="" widths={[360, 720]} sizes="(min-width: 64rem) 22vw, 45vw" />
          {p.isReel && <span class="badge">Reel</span>}
          <span class="info">
            {p.likes != null && <span class="likes">{compactCount(p.likes)} likes</span>}
            {p.caption && <span class="caption">{p.caption}</span>}
          </span>
        </a>
      </li>
    ))}
  </ul>
  <p class="follow">
    {accounts.map((a) => (
      <a class="follow-link" href={a.url} target="_blank" rel="noopener">
        Follow @{a.handle}{a.followers != null && ` · ${compactCount(a.followers)}`}
      </a>
    ))}
  </p>
</div>

<style>
  .stands {
    display: grid;
    gap: var(--space-l);
  }
  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--space-s);
    grid-template-columns: repeat(auto-fill, minmax(min(45%, 14rem), 1fr));
  }
  .post {
    position: relative;
    display: grid;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    text-decoration: none;
    background: var(--color-surface);
  }
  .thumb,
  .info {
    grid-area: 1 / 1;
  }
  .thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .post:hover .thumb {
    transform: scale(1.04);
  }
  .info {
    align-self: end;
    display: grid;
    gap: var(--space-2xs);
    padding: var(--space-s);
    background: linear-gradient(to top, rgb(14 31 23 / 0.9), transparent);
  }
  .likes {
    font-family: var(--font-display);
    font-size: var(--step-1);
    color: var(--color-highlight);
  }
  .caption {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: var(--step--1);
  }
  .badge {
    position: absolute;
    top: var(--space-xs);
    right: var(--space-xs);
    padding: var(--space-2xs) var(--space-xs);
    font-size: var(--step--1);
    text-transform: uppercase;
    background: var(--color-accent);
  }
  .follow {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
    margin: 0;
  }
  .follow-link {
    padding: var(--space-xs) var(--space-m);
    border: 1px solid var(--color-line);
    text-decoration: none;
    font-family: var(--font-display);
    font-size: var(--step-1);
    text-transform: uppercase;
  }
</style>
```

- [ ] **Step 2: Preview page**

`src/pages/dev/stands.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Stands from '../../components/Stands.astro';
---
<Base title="dev: stands" description="section preview">
  <main style="padding: 2rem"><Stands /></main>
</Base>
```

- [ ] **Step 3: Build and count**

```bash
npm run build
grep -oE 'class="post"[^>]*href="https://www.instagram.com/(p|reel)/' dist/dev/stands/index.html | wc -l
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/social.json','utf8')).posts.filter(p=>p.featured).length)"
```

Expected: build `Complete!`; the two numbers are equal. If the grep prints 0 because Astro ordered the attributes differently, count `href="https://www.instagram.com/p/` and `/reel/` links instead and subtract the follow links (2).

- [ ] **Step 4: Commit**

```bash
git add src/components/Stands.astro src/pages/dev/stands.astro
git commit -m "feat(sections): Stands grid of featured Instagram posts"
```

---

### Task 17: Pavilion section

**Tier:** Flash · **Owner:** Agent (copy approved by **User** at G6) · **Lane:** D · **Gate:** — · **ADRs:** 0006
**Skills:** `copywriting`, `humanizer`, `frontend-design`, `astro`, `design-taste-frontend`

**Files:**
- Create: `src/data/story.md`, `src/components/Pavilion.astro`, `src/pages/dev/pavilion.astro`

**Interfaces:**
- Consumes: `site.name`, `site.bio` from `src/data/site.js`; photos in `src/assets/photos/` (Task 1); facts in `docs/inputs.md`
- Produces: `<Pavilion />`; `src/data/story.md` is the one file the user edits to change the About copy

- [ ] **Step 1: Write the story**

Create `src/data/story.md`: plain Markdown, no frontmatter, two short paragraphs. Rules:
- Only facts that appear in `docs/inputs.md`. No invented numbers, teams, awards or dates.
- 120 words maximum. First person is fine ("I"), matching how he talks in his videos.
- English, with at most one or two natural Hinglish touches (e.g. "yaar", "ekdum") if they fit — none if they don't.
- Last sentence points toward working together (the next zone is the booking CTA).
- Run the `humanizer` skill over the draft before saving.

Check:

```bash
wc -w src/data/story.md
```

Expected: `120` or fewer.

- [ ] **Step 2: Component**

`src/components/Pavilion.astro`:

```astro
---
import { Image } from 'astro:assets';
import { site } from '../data/site.js';
import { Content as Story } from '../data/story.md';

// alt text comes from the file name: "abhishek-batting-nets.jpg" -> "abhishek batting nets"
const photos = Object.entries(
  import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }),
)
  .slice(0, 4)
  .map(([path, src]) => ({ src, alt: path.split('/').pop().replace(/\.\w+$/, '').replace(/[-_]+/g, ' ') }));
---
<div class="pavilion">
  <header>
    <p class="kicker">Pavilion</p>
    <h2>The story</h2>
  </header>
  <div class="layout">
    <div class="text">
      <div class="story"><Story /></div>
      <ul class="facts" role="list">
        {site.bio.map((fact) => <li>{fact}</li>)}
      </ul>
    </div>
    <div class="photos">
      {photos.map((p) => (
        <Image class="photo" src={p.src} alt={p.alt} widths={[480, 960, 1440]} sizes="(min-width: 64rem) 22vw, 50vw" />
      ))}
    </div>
  </div>
</div>

<style>
  .pavilion {
    display: grid;
    gap: var(--space-l);
  }
  .layout {
    display: grid;
    gap: var(--space-l);
  }
  @media (min-width: 64rem) {
    .layout {
      grid-template-columns: 1fr 1fr;
      align-items: center;
    }
  }
  .text {
    display: grid;
    gap: var(--space-m);
    padding: var(--space-m);
    background: color-mix(in oklab, var(--color-surface) 85%, transparent);
  }
  .story :global(p) {
    margin: 0 0 var(--space-s);
    max-width: 60ch;
    font-size: var(--step-1);
    line-height: 1.5;
  }
  .facts {
    display: grid;
    gap: var(--space-xs);
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: fact;
  }
  .facts li {
    counter-increment: fact;
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    align-items: baseline;
    color: var(--color-muted);
  }
  .facts li::before {
    content: counter(fact, decimal-leading-zero);
    font-family: var(--font-display);
    font-size: var(--step-1);
    color: var(--wood);
  }
  .photos {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-s);
  }
  .photo {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }
  .photo:first-child {
    grid-row: span 2;
    aspect-ratio: auto;
    height: 100%;
  }
</style>
```

- [ ] **Step 3: Preview page, build, check alt text**

`src/pages/dev/pavilion.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Pavilion from '../../components/Pavilion.astro';
---
<Base title="dev: pavilion" description="section preview">
  <main style="padding: 2rem"><Pavilion /></main>
</Base>
```

```bash
npm run build
grep -oE '<img[^>]*alt="[^"]*"' dist/dev/pavilion/index.html | grep -oE 'alt="[^"]*"'
```

Expected: build `Complete!`; one readable `alt="…"` per photo, none empty. If a name reads badly (e.g. `alt="IMG 4031"`), ask the user to rename that photo descriptively and rebuild.

- [ ] **Step 4: Commit**

```bash
git add src/data/story.md src/components/Pavilion.astro src/pages/dev/pavilion.astro
git commit -m "feat(sections): Pavilion story, facts and photos"
```

---

### Task 18: Boundary Rope + `/go/*` pages

**Tier:** Flash · **Owner:** Agent · **Lane:** D · **Gate:** — · **ADRs:** 0005, 0006
**Skills:** `frontend-design`, `web-design-guidelines`, `astro`, `accessibility-auditor`, `design-taste-frontend`, `full-output-enforcement`

**Files:**
- Create: `src/components/Boundary.astro`, `src/pages/go/whatsapp.astro`, `src/pages/go/email.astro`, `src/pages/dev/boundary.astro`
- Modify: `src/layouts/Base.astro` (adds a `head` slot; this task is the only one in lane D allowed to touch it)

**Interfaces:**
- Consumes: `site` from `src/data/site.js`; `whatsappUrl`, `mailtoUrl` from `src/lib/links.js`
- Produces: `<Boundary />`; routes `/go/whatsapp` and `/go/email`; `Base.astro` gains `<slot name="head" />` inside `<head>` (Task 20 uses it)

Why the `/go/*` pages: Vercel Hobby counts page views but not click events, so each CTA goes through a tiny page that is counted and then forwards to WhatsApp or the mail app.

- [ ] **Step 1: Head slot in the layout**

`src/layouts/Base.astro` — inside `<head>`, directly after the `<meta name="description" …>` line, add:

```astro
    <slot name="head" />
```

- [ ] **Step 2: The redirect pages**

`src/pages/go/whatsapp.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import { site } from '../../data/site.js';
import { whatsappUrl } from '../../lib/links.js';

const target = whatsappUrl(site.whatsapp, site.enquiryText);
---
<Base title="Opening WhatsApp…" description={`Message ${site.name} on WhatsApp.`}>
  <meta slot="head" name="robots" content="noindex" />
  <main class="go">
    <p>Opening WhatsApp…</p>
    <p><a href={target}>Tap here if it didn't open.</a></p>
  </main>
  <script is:inline define:vars={{ target }}>
    // ponytail: 1s lets the analytics page view send before leaving; lower it if it feels slow
    setTimeout(() => location.replace(target), 1000);
  </script>
</Base>

<style>
  .go {
    display: grid;
    place-content: center;
    min-height: 100dvh;
    padding: var(--space-m);
    text-align: center;
  }
</style>
```

`src/pages/go/email.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import { site } from '../../data/site.js';
import { mailtoUrl } from '../../lib/links.js';

const target = mailtoUrl(site.email, site.enquirySubject);
---
<Base title="Opening email…" description={`Email ${site.name}.`}>
  <meta slot="head" name="robots" content="noindex" />
  <main class="go">
    <p>Opening your email app…</p>
    <p>If nothing happens, write to <strong>{site.email}</strong>.</p>
    <p><a href="/#boundary">Back to the site</a></p>
  </main>
  <script is:inline define:vars={{ target }}>
    // ponytail: 1s lets the analytics page view send before leaving; lower it if it feels slow
    setTimeout(() => location.replace(target), 1000);
  </script>
</Base>

<style>
  .go {
    display: grid;
    place-content: center;
    gap: var(--space-xs);
    min-height: 100dvh;
    padding: var(--space-m);
    text-align: center;
  }
</style>
```

- [ ] **Step 3: The section**

`src/components/Boundary.astro`:

```astro
---
import { site } from '../data/site.js';

const handle = (url) => url.split('/').filter(Boolean).pop().replace('@', '');
const socials = [
  ...site.profiles.instagram.map((url) => ({ url, label: `Instagram @${handle(url)}` })),
  ...site.profiles.youtube.map((url) => ({ url, label: `YouTube @${handle(url)}` })),
  { url: site.profiles.linkedin, label: 'LinkedIn' },
];
---
<div class="boundary">
  <header>
    <p class="kicker">Boundary Rope</p>
    <h2>Book {site.name.split(' ')[0]}</h2>
  </header>
  <p class="lede">Brand collaborations and sponsorships: message directly and hear back from {site.name.split(' ')[0]} himself.</p>
  <div class="ctas">
    <a class="cta primary" href="/go/whatsapp">WhatsApp</a>
    <a class="cta" href="/go/email">Email</a>
  </div>
  <p class="plain">Email: <span class="email">{site.email}</span></p>
  <footer class="footer">
    <ul class="socials" role="list">
      {socials.map((s) => (
        <li><a href={s.url} target="_blank" rel="noopener">{s.label}</a></li>
      ))}
    </ul>
    <p class="small">© {new Date().getFullYear()} {site.name}</p>
  </footer>
</div>

<style>
  .boundary {
    display: grid;
    gap: var(--space-m);
  }
  .lede {
    margin: 0;
    max-width: 40ch;
    font-size: var(--step-1);
  }
  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
  }
  .cta {
    min-width: 11rem;
    padding: var(--space-s) var(--space-l);
    border: 2px solid var(--color-text);
    font-family: var(--font-display);
    font-size: var(--step-2);
    font-weight: 800;
    text-align: center;
    text-decoration: none;
    text-transform: uppercase;
    transition: transform var(--dur-fast) var(--ease-out);
  }
  .cta:hover {
    transform: translateY(-2px);
  }
  .primary {
    border-color: var(--color-accent);
    background: var(--color-accent);
  }
  .plain {
    margin: 0;
    color: var(--color-muted);
  }
  .email {
    user-select: all;
  }
  .footer {
    display: grid;
    gap: var(--space-s);
    margin-top: var(--space-xl);
    padding-top: var(--space-m);
    border-top: 1px solid var(--color-line);
  }
  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s) var(--space-m);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .small {
    margin: 0;
    font-size: var(--step--1);
    color: var(--color-muted);
  }
</style>
```

- [ ] **Step 4: Preview page, build, check the targets**

`src/pages/dev/boundary.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Boundary from '../../components/Boundary.astro';
---
<Base title="dev: boundary" description="section preview">
  <main style="padding: 2rem"><Boundary /></main>
</Base>
```

```bash
npm run build
grep -o 'https://wa.me/[0-9]*?text=[^"]*' dist/go/whatsapp/index.html | head -1
grep -o 'mailto:[^"]*' dist/go/email/index.html | head -1
grep -c 'name="robots" content="noindex"' dist/go/whatsapp/index.html dist/go/email/index.html
```

Expected: build `Complete!`; a `wa.me` URL with the real digits and encoded message; a `mailto:` with the real address; `1` for each file.

- [ ] **Step 5: Behaviour check on the preview**

On a phone: `/dev/boundary` → WhatsApp opens WhatsApp with the message prefilled; Email opens the mail app with the subject prefilled; each social link opens the right profile.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro src/components/Boundary.astro src/pages/go src/pages/dev/boundary.astro
git commit -m "feat(sections): Boundary Rope CTAs with counted /go redirects"
```

---

### Task 19: Integration

**Tier:** Pro · **Owner:** Agent → **User** reviews · **Lane:** — (after Tasks 13–18 are all merged) · **Gate:** **G6** · **ADRs:** 0001, 0006
**Skills:** `scroll-experience`, `web3d-motion-choreography`, `web3d-interaction-ux`, `requesting-code-review`, `ponytail-review`, `design-taste-frontend`, `grilling` (only when the user asks for changes at G6)

**Files:**
- Modify: `src/pages/index.astro`, `src/lib/keyframes.js`, `src/components/Zone.astro`
- Delete: `src/pages/dev/`, `src/assets/placeholder-still.jpg`

**Interfaces:**
- Consumes: `<Hero />`, `<Pitch />`, `<Scoreboard />`, `<Stands />`, `<Pavilion />`, `<Boundary />`; `still()` and `<Zone>`; `site`
- Produces: the finished page. `still(n)` now throws at build if a keyframe is missing, instead of silently using the placeholder.

- [ ] **Step 1: Compose the page**

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import ScrubStage from '../components/ScrubStage.astro';
import Zone from '../components/Zone.astro';
import Hero from '../components/Hero.astro';
import Pitch from '../components/Pitch.astro';
import Scoreboard from '../components/Scoreboard.astro';
import Stands from '../components/Stands.astro';
import Pavilion from '../components/Pavilion.astro';
import Boundary from '../components/Boundary.astro';
import { still } from '../lib/keyframes.js';
import { site } from '../data/site.js';
---
<Base title={`${site.name} — Cricket Content Creator`} description={site.tagline}>
  <ScrubStage />
  <main>
    <Zone id="tunnel" label="Intro" still={still(0)} eager><Hero /></Zone>
    <Zone id="pitch" label="The Pitch" still={still(1)}><Pitch /></Zone>
    <Zone id="scoreboard" label="Scoreboard" still={still(2)}><Scoreboard /></Zone>
    <Zone id="stands" label="The Stands" still={still(3)}><Stands /></Zone>
    <Zone id="pavilion" label="Pavilion" still={still(4)}><Pavilion /></Zone>
    <Zone id="boundary" label="Boundary Rope" still={still(5)}><Boundary /></Zone>
  </main>
</Base>
```

- [ ] **Step 2: Remove the placeholder fallback and the dev pages**

`src/lib/keyframes.js`:

```js
export const ZONES = ['tunnel', 'pitch', 'scoreboard', 'stands', 'pavilion', 'boundary'];

const found = import.meta.glob('../assets/keyframes/*.jpg', { eager: true, import: 'default' });

/** @param {number} n 0-based zone index */
export function still(n) {
  const key = `../assets/keyframes/0${n + 1}-${ZONES[n]}.jpg`;
  if (!found[key]) throw new Error(`Missing keyframe src/${key.slice(3)} (Task 7)`);
  return found[key];
}
```

```bash
git rm -r src/pages/dev src/assets/placeholder-still.jpg
grep -rn "placeholder-still" src || echo "no placeholder references"
```

Expected: `no placeholder references`.

- [ ] **Step 3: Section reveals tied to scroll, with no JavaScript**

In `src/components/Zone.astro`, append inside the existing `<style>` block:

```css
  @media (prefers-reduced-motion: no-preference) {
    @supports (animation-timeline: view()) {
      .zone-content > :global(*) {
        animation: zone-rise linear both;
        animation-timeline: view();
        animation-range: entry 5% cover 30%;
      }
    }
  }
  @keyframes zone-rise {
    from {
      opacity: 0;
      transform: translateY(2rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
```

Browsers without scroll-driven animations simply show the content with no animation.

- [ ] **Step 4: Build, test, verify**

```bash
npm test
npm run build
node scripts/verify-pipeline.mjs
```

Expected: tests pass; build `Complete!`; verifier: `governance scope art assets look motion ux build` all PASS, `perf` and `ship` FAIL.

- [ ] **Step 5: Self-review before the gate**

Run the `requesting-code-review` skill on the diff since Task 13, then `ponytail-review`. Fix anything they flag that is a real defect (not taste), re-run Step 4, commit.

```bash
git add -A src
git commit -m "feat(page): compose the six zones, drop placeholders, add scroll reveals"
```

- [ ] **Step 6: GATE G6 — integrated review**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Push and post exactly:

> G6: preview <URL>. Please check on desktop **and** on your phone, including inside Instagram (send yourself the link in an Instagram DM and tap it there):
> 1. Scrolling top to bottom moves the camera smoothly through the stadium, no jumps or blank frames.
> 2. All text is readable over the art.
> 3. A Pitch video plays when tapped; Stands posts open Instagram; WhatsApp and Email buttons open the right app with the message ready.
> 4. The hero tagline, the Pavilion story (`src/data/story.md`) and the numbers look right.
> Reply "G6 approved" or list what to change.

Wait for "G6 approved". Fix requested changes inside the owning component (or `story.md`), rebuild, re-post.

---

## Phase 4 — Audit and fix

### Task 20: SEO

**Tier:** Flash · **Owner:** Agent · **Lane:** E (∥ with Task 21) · **Gate:** — · **ADRs:** 0005, 0006
**Skills:** `seo`, `schema-markup`, `test-driven-development`, `astro`

**Files:**
- Create: `src/lib/jsonld.js`, `src/lib/jsonld.test.js`, `src/pages/sitemap.xml.js`, `public/robots.txt`
- Modify: `src/pages/index.astro` (head tags via the `head` slot)

**Interfaces:**
- Consumes: `site`, `social`, `featuredVideos`, `still(0)`, `Base.astro`'s `head` slot (Task 18)
- Produces: `buildJsonLd({ site, videos, pageUrl, imageUrl }) -> object` (a schema.org `@graph` with `Person`, `WebSite`, one `VideoObject` per featured video)

- [ ] **Step 1: Failing test**

`src/lib/jsonld.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildJsonLd } from './jsonld.js';

const site = {
  name: 'Abhishek Pandey',
  tagline: 'Cricket, told from the nets.',
  profiles: {
    instagram: ['https://www.instagram.com/abhishekpandey_26/', 'https://www.instagram.com/spinandswing26/'],
    youtube: ['https://www.youtube.com/@spinandswing26', 'https://www.youtube.com/@abhishekunseen26'],
    linkedin: 'https://www.linkedin.com/in/abhishek-pandey-26sep03',
  },
};
const videos = [{ id: 'DfECjUL9ZvU', title: 'Nets session', views: 147443, publishedAt: '2026-09-10T20:00:18+00:00' }];
const ld = buildJsonLd({ site, videos, pageUrl: 'https://abhishek-pandey.vercel.app/', imageUrl: 'https://abhishek-pandey.vercel.app/og.jpg' });

test('person links every profile', () => {
  const person = ld['@graph'].find((n) => n['@type'] === 'Person');
  assert.equal(person.name, 'Abhishek Pandey');
  assert.equal(person.sameAs.length, 5);
});

test('one VideoObject per video with required fields', () => {
  const v = ld['@graph'].filter((n) => n['@type'] === 'VideoObject');
  assert.equal(v.length, 1);
  assert.equal(v[0].embedUrl, 'https://www.youtube.com/embed/DfECjUL9ZvU');
  assert.equal(v[0].uploadDate, '2026-09-10T20:00:18+00:00');
  assert.ok(v[0].thumbnailUrl.startsWith('https://i.ytimg.com/vi/DfECjUL9ZvU/'));
  assert.equal(v[0].interactionStatistic.userInteractionCount, 147443);
});

test('serialises to valid JSON', () => {
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(ld)));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test src/lib/jsonld.test.js`
Expected: FAIL with `Cannot find module` … `jsonld.js`

- [ ] **Step 3: Implement**

`src/lib/jsonld.js`:

```js
/**
 * @param {{ site: { name: string, tagline: string, profiles: { instagram: string[], youtube: string[], linkedin: string } },
 *   videos: { id: string, title: string, views: number | null, publishedAt: string }[], pageUrl: string, imageUrl: string }} args
 */
export function buildJsonLd({ site, videos, pageUrl, imageUrl }) {
  const personId = `${pageUrl}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: site.name,
        url: pageUrl,
        image: imageUrl,
        jobTitle: 'Cricket content creator',
        description: site.tagline,
        sameAs: [...site.profiles.instagram, ...site.profiles.youtube, site.profiles.linkedin],
      },
      { '@type': 'WebSite', url: pageUrl, name: site.name, about: { '@id': personId } },
      ...videos.map((v) => ({
        '@type': 'VideoObject',
        name: v.title,
        description: v.title,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        uploadDate: v.publishedAt,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        creator: { '@id': personId },
        ...(v.views != null && {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'WatchAction' },
            userInteractionCount: v.views,
          },
        }),
      })),
    ],
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test src/lib/jsonld.test.js`
Expected: `# pass 3`, `# fail 0`

- [ ] **Step 5: Head tags, sitemap, robots**

In `src/pages/index.astro`, add to the frontmatter:

```js
import { getImage } from 'astro:assets';
import { featuredVideos } from '../lib/social.js';
import { buildJsonLd } from '../lib/jsonld.js';

const pageUrl = new URL('/', Astro.site).href;
const og = await getImage({ src: still(0), width: 1200, height: 630, fit: 'cover', format: 'jpg' });
const imageUrl = new URL(og.src, Astro.site).href;
const jsonLd = buildJsonLd({ site, videos: featuredVideos, pageUrl, imageUrl });
const title = `${site.name} — Cricket Content Creator`;
```

Change the `<Base …>` line to `<Base title={title} description={site.tagline}>` and add directly inside it, before `<ScrubStage />`:

```astro
  <Fragment slot="head">
    <link rel="canonical" href={pageUrl} />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={site.tagline} />
    <meta property="og:url" content={pageUrl} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </Fragment>
```

`src/pages/sitemap.xml.js`:

```js
export function GET({ site }) {
  const loc = new URL('/', site).href;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${loc}</loc></url></urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
```

`public/robots.txt` (replace `VERCEL_PROJECT` with the value in `astro.config.mjs`):

```
User-agent: *
Allow: /
Disallow: /go/
Sitemap: https://VERCEL_PROJECT.vercel.app/sitemap.xml
```

- [ ] **Step 6: Build and check the output**

```bash
npm test
npm run build
grep -o '<link rel="canonical"[^>]*>' dist/index.html
grep -o '<meta property="og:image" content="[^"]*"' dist/index.html
node -e "const h=require('fs').readFileSync('dist/index.html','utf8');const m=h.match(/<script type=\"application\/ld\+json\">(.*?)<\/script>/s);const g=JSON.parse(m[1])['@graph'];console.log(g.map(n=>n['@type']).join(','))"
cat dist/sitemap.xml
```

Expected: canonical and `og:image` point at the `vercel.app` URL; the JSON-LD line reads `Person,WebSite,VideoObject,…` with one `VideoObject` per featured video; the sitemap holds one `<loc>`. Paste the production URL into Google's Rich Results Test after Task 23 and note the result in `docs/qa/qa-checklist.md`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/jsonld.js src/lib/jsonld.test.js src/pages/index.astro src/pages/sitemap.xml.js public/robots.txt
git commit -m "feat(seo): Person/VideoObject JSON-LD, Open Graph, sitemap, robots"
```

---

### Task 21: Accessibility and performance audits

**Tier:** Flash · **Owner:** Agent (two agents in parallel: one per report) · **Lane:** E (∥ with Task 20) · **Gate:** — · **ADRs:** 0001, 0007
**Skills:** a11y agent: `accessibility-auditor`, `web3d-interaction-ux` · perf agent: `core-web-vitals`, `web3d-performance-budget`

**Files:**
- Create: `docs/qa/a11y-report.md`, `docs/qa/perf-audit.md`, `docs/qa/lighthouse-mobile.json`

**Interfaces:**
- Consumes: the G6-approved preview URL
- Produces: two reports whose findings table Task 22 works through. **Read-only: these agents change no source files.**

- [ ] **Step 1: Lighthouse (either agent, once)**

```bash
npx -y lighthouse <PREVIEW_URL> --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=docs/qa/lighthouse-mobile.json --chrome-flags="--headless=new"
node -e "const r=require('./docs/qa/lighthouse-mobile.json');for(const[k,c]of Object.entries(r.categories))console.log(k,Math.round(c.score*100));for(const id of['largest-contentful-paint','cumulative-layout-shift','total-blocking-time'])console.log(id,r.audits[id].displayValue)"
```

Expected: category scores and LCP/CLS/TBT printed. (Lighthouse needs Chrome installed; if missing, run PageSpeed Insights on the URL in a browser and paste the same numbers.)

- [ ] **Step 2: Accessibility report**

Check, and record each as a row in `docs/qa/a11y-report.md`:
1. Every failing Lighthouse accessibility audit.
2. Keyboard only, top to bottom: every link/button reachable, visible focus ring, Pitch videos start with Enter, focus lands in the player.
3. Screen reader (VoiceOver on iOS or TalkBack on Android): headings read in order (h1, then one h2 per zone), canvas is silent, Stands links have names.
4. `prefers-reduced-motion: reduce`: no canvas, no count-up, no reveals, all content present.
5. JavaScript disabled: all content and links present.
6. 200% browser zoom at 375px wide: no clipped text, no horizontal scroll.
7. Contrast of any text that sits over art without a panel.

Report format:

```markdown
# Accessibility report — <date>, <preview URL>

| # | Severity (blocker/major/minor) | Where | Problem | Suggested fix |
|---|--------------------------------|-------|---------|---------------|
```

- [ ] **Step 3: Performance report**

Record in `docs/qa/perf-audit.md`:
1. Lighthouse mobile LCP, CLS, TBT (INP proxy) against targets LCP < 2.5s, CLS < 0.1, INP < 200ms.
2. On a real mid-range Android (Chrome remote debugging, network throttled to "Fast 4G"): time to first hero paint; whether scrubbing is smooth through all five transitions; total frame bytes downloaded after one full scroll (Network panel, filter `/frames/`).
3. Performance panel recording of one full scroll: long tasks over 50ms and where they come from.
4. JS shipped: `du -ch dist/_astro/*.js | tail -1`.

Report format:

```markdown
# Performance audit — <date>, <preview URL>, <device>

| Metric | Target | Measured | Pass? |
|--------|--------|----------|-------|

## Findings
| # | Severity | Problem | Evidence | Suggested fix |
|---|----------|---------|----------|---------------|
```

- [ ] **Step 4: Commit the reports**

```bash
git add docs/qa/a11y-report.md docs/qa/perf-audit.md docs/qa/lighthouse-mobile.json
git commit -m "docs(qa): accessibility and performance audit reports"
```

---

### Task 22: Fix pass and perf report

**Tier:** Pro · **Owner:** Agent · **Lane:** — (after Tasks 20 and 21) · **Gate:** — · **ADRs:** 0001, 0007
**Skills:** `accessibility-auditor`, `core-web-vitals`, `web3d-performance-budget`, `verification-before-completion`, `ponytail`, `diagnosing-bugs`

**Files:**
- Modify: whichever components the findings name; `scripts/export-frames.mjs` `TIERS` if frame weight is the problem
- Create: `docs/qa/perf-report.md`

**Interfaces:**
- Consumes: both Task 21 reports
- Produces: every blocker and major finding fixed, and `docs/qa/perf-report.md` showing targets met

- [ ] **Step 1: Fix blockers and majors, one commit each**

Work down both findings tables, blockers first. Each fix is the smallest change in the component that owns the problem; commit each as `fix(a11y): …` or `fix(perf): …` referencing the finding number. Minors: fix if under ten minutes, otherwise leave them listed.

The usual knobs, in the order to try them:
- LCP too slow → confirm the hero still is the LCP element and is `eager` + `fetchpriority="high"`; then lower its `widths` on mobile.
- Too many frame bytes on 4G → lower `quality` in `TIERS`, then lower `mobile.frames` from 30 to 24; re-run `node scripts/export-frames.mjs`.
- Scrub stutters → lower the DPR cap in `resize()` in `src/scripts/scrub.js` from 2 to 1.5.
- CLS → give the element that shifts an explicit `aspect-ratio`.

- [ ] **Step 2: Re-measure and write the report**

Re-run Task 21 Step 1 against the new preview, then write `docs/qa/perf-report.md`:

```markdown
# Performance report — <date>

| Metric | Target | Before (Task 21) | After | Pass? |
|--------|--------|------------------|-------|-------|
| LCP (Lighthouse mobile) | < 2.5 s | | | |
| CLS | < 0.1 | | | |
| TBT (INP proxy) | < 200 ms | | | |
| Frame bytes, full scroll, mobile | as low as looks right | | | |
| JS shipped | — | | | |

## Changes made
- <finding #> <what changed> (<commit sha>)

## Frame budget in use
desktop: <frames> frames @ <width>px q<quality> · mobile: <frames> frames @ <width>px q<quality>

## Real-device check
<device>, Fast 4G: <smooth / notes>
```

Every "After" cell is filled from a real measurement; every row passes or has a one-line reason.

- [ ] **Step 3: Verify and commit**

```bash
npm test
npm run build
node scripts/verify-pipeline.mjs
git add docs/qa/perf-report.md
git commit -m "docs(qa): performance report after fix pass"
```

Expected: verifier `perf PASS`; only `ship` still FAIL.

---

## Phase 5 — Ship

### Task 23: Ship

**Tier:** Flash · **Owner:** Agent → **User** approves launch · **Lane:** — · **Gate:** **G7** · **ADRs:** 0005, 0006
**Skills:** `web3d-ship-deploy`, `deploy-to-vercel`, `verification-before-completion`, `task-observer` (full review of the whole build)

**Files:**
- Modify: `src/layouts/Base.astro` (analytics), `package.json`
- Create: `docs/qa/qa-checklist.md`

**Interfaces:**
- Consumes: everything; `docs/qa/perf-report.md` (Task 22)
- Produces: the production site at `https://VERCEL_PROJECT.vercel.app` and a fully ticked QA checklist

- [ ] **Step 1: Analytics**

```bash
npm install @vercel/analytics@^2
```

`src/layouts/Base.astro` — add `import Analytics from '@vercel/analytics/astro';` to the frontmatter and `<Analytics />` as the last line inside `<head>`.

Ask the user: in the Vercel dashboard → this project → **Analytics** → **Enable**. Reply "analytics on".

- [ ] **Step 2: QA checklist**

`docs/qa/qa-checklist.md`:

```markdown
# Launch QA — <date>

Tick each item only after doing it on the production URL.

## Automated
- [ ] `node scripts/verify-pipeline.mjs https://VERCEL_PROJECT.vercel.app` prints `All green.`
- [ ] `npm test` passes
- [ ] `docs/qa/perf-report.md` shows every target met

## Browsers and devices (scroll top to bottom, tap every CTA)
- [ ] Chrome, desktop
- [ ] Safari, desktop
- [ ] Firefox, desktop (no scroll reveals is expected)
- [ ] Safari, iPhone
- [ ] Chrome, Android
- [ ] Instagram in-app browser, iPhone
- [ ] Instagram in-app browser, Android

## Fallbacks
- [ ] Reduced motion: stills, no canvas, all content
- [ ] JavaScript off: stills, all content and links work
- [ ] Frames blocked in DevTools: stills, page still reads

## Search and sharing
- [ ] Google Rich Results Test detects Person and VideoObject
- [ ] Pasting the URL into a WhatsApp chat shows the stadium preview image and title
- [ ] `/robots.txt` and `/sitemap.xml` load

## Conversions
- [ ] `/go/whatsapp` opens WhatsApp with the message prefilled
- [ ] `/go/email` opens the mail app with the subject prefilled
- [ ] Both `/go/*` visits appear as page views in Vercel Analytics (allow a few minutes)

## Content and consent
- [ ] `docs/inputs.md` consent line is ticked and dated
- [ ] No `/dev/` pages in production (`/dev/pitch` returns 404)
- [ ] Pavilion story and tagline approved at G6

## Maintenance (how to update later)
- New stats/posts: `scraper/.venv/bin/python scraper/scrape.py`, re-flag `featured`, commit, push (Task 4)
- Replace a transition: new clip in `assets/clips/`, `node scripts/export-frames.mjs`, commit, push (Task 13)
- Edit the About copy: `src/data/story.md`, push
- Change any skill: only through task-observer (AGENTS.md section 3); ask for "the task-observer review" any time
```

- [ ] **Step 3: Deploy to production**

```bash
npm test
npm run build
git add package.json package-lock.json src/layouts/Base.astro docs/qa/qa-checklist.md
git commit -m "feat(ship): Vercel Web Analytics and launch QA checklist"
git checkout main && git merge --no-ff - -m "release: stadium portfolio v1" && git push origin main
```

Wait for the Vercel production deployment to finish, then:

```bash
node scripts/verify-pipeline.mjs https://VERCEL_PROJECT.vercel.app
```

Expected: every row PASS including `live`, then `All green.` (`ship` passes because `docs/qa/qa-checklist.md` now exists; the checklist itself is ticked in Step 4.)

- [ ] **Step 4: Work through the checklist**

Tick every box in `docs/qa/qa-checklist.md` on the production URL. Anything that fails: fix in the owning component, redeploy, re-check that box. Commit the ticked checklist:

```bash
git add docs/qa/qa-checklist.md
git commit -m "docs(qa): launch checklist complete"
git push origin main
```

- [ ] **Step 5: Final task-observer review of the whole build**

Load `.agents/skills/task-observer/references/weekly-review.md` and run the comprehensive review over every OPEN observation logged since Task 1, across every skill in `.agents/skills/`, including its cross-cutting-principles pass. Its result is what the G7 gate review presents; approved updates are installed exactly as in *Gate review* step 4, so the next project starts from the improved skills.

- [ ] **Step 6: GATE G7 — launch**

Run the *Gate review* from *How to run this plan* first: commit the observation log, review OPEN observations with the user, install only what they approve.

Post exactly:

> G7: https://VERCEL_PROJECT.vercel.app is live, the verifier is all green, and the QA checklist is fully ticked (`docs/qa/qa-checklist.md`). Approve launch? The final task-observer review is below: approve the skill updates to keep. Once you approve launch, add the link to Abhishek's Instagram and YouTube bios.

Wait for "G7 approved". The plan is complete.
