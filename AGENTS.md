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
