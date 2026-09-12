# ADR-0004: Claude plans, Antigravity executes; parallel lanes between human gates; pinned skills with web fallback

## Status
Accepted — 2026-09-12. Revises the earlier draft of this ADR.

## Context
Claude Code produces the spec, ADRs and implementation plan. Gemini
Antigravity executes. Antigravity supports skills and MCP. On this machine it
already has ~500 global skills in `~/.gemini/config/skills` plus the `motion`
and `comfy-mcp` MCP servers.

The user wants:
- local skills named in the plan
- the executing agent able to pull missing skills from the web
- a model tier per task
- **parallel agents for any task that doesn't need their confirmation**

## Decision
### Model routing
Every plan task carries a tier label. The user maps each label to the
matching model in Antigravity's picker. "Gemini 3.8 Flash High" is not a
model name that could be verified from here.

| Tier | Used for |
|------|----------|
| **Pro** | Style bible and camera path, scroll-scrub engine and frame loading, design system, performance work |
| **Flash** | Scaffold, scraper, section components, SEO, accessibility fixes, frame export, deploy |

### Agent flow
- Each task runs in a **fresh agent** that gets the spec, the relevant ADRs
  and only its own task.
- Tasks with no human gate between them run **in parallel**, each in its own
  git worktree, and merge when done.
- Anything touching a **shared file** is done by one integration agent, never
  in parallel. Shared files are the design tokens, the scroll timeline, and
  the page that composes the sections.
- Human gates:
  - consent and inputs
  - style lock
  - keyframes
  - data curation
  - design tokens
  - transition takes
  - integrated page review
  - launch
- Every gate is reviewed on a Vercel preview URL (ADR-0005), and nothing past
  a gate starts until the user approves it.

### Skills
- **Pinned into the repo.** Phase 0 runs `scripts/install-skills.sh`, which
  installs the plan's skills into the project's `.agents/skills/` using
  `npx skills add <source> --skill <name> -a antigravity -y`. Skills without
  a public source are copied from local disk.
- **Web fallback.** If a task needs a capability no installed skill covers,
  the agent runs `npx skills find <keyword>` and proposes the best match as a
  task-observer observation. It is installed, and added to
  `install-skills.sh`, only after the user approves it at a gate (ADR-0008).
- Global Antigravity skills already on this machine may be used directly, but
  anything the plan depends on must be pinned in the repo.

## Alternatives Considered
- **Fully sequential, one agent per section**: simpler, but it idles agents
  while the user runs the manual art lane, and the user explicitly asked for
  parallelism.
- **One long-running agent**: its context bloats by later phases.
- **Global skills only**: a fresh machine or teammate silently gets a
  different skill set.
- **Ad-hoc web search with no pinning**: not reproducible.

## Consequences
- Worktree merges add some overhead. It stays cheap only because shared files
  have a single owner.
- `.agents/skills/` is committed, so skill updates are explicit diffs
  (`npx skills update`), not silent drift.
- Plan tasks must state their inputs, outputs, gate and tier explicitly,
  because each agent starts with no memory of earlier ones.
