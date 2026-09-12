# ADR-0004: Planning in Claude Code, execution in Gemini Antigravity

## Status
Accepted — 2026-09-12

## Context
The user is using Claude Code for brainstorming and planning (this spec, the
ADRs, and the phased implementation plan) but intends to execute the actual
build with Gemini Antigravity, a separate agentic coding environment that
supports MCP tools and skill-style invocation.

## Decision
This repo's planning artifacts (spec, ADRs, phased plan) are written to be
tool-agnostic where they describe *what* to build, but explicitly name
capabilities and — where a matching one exists — local skills for *how* to
build it, per phase. Each phase in the spec states:
- the capability needed (e.g. "3D scroll-driven camera work", "web
  scraping", "image generation")
- a local skill name if one matches
- an explicit instruction that if the executing agent (Gemini Antigravity)
  has no matching local skill or MCP tool, it should search the web or an
  MCP/skill registry for an equivalent before building the capability from
  scratch

This keeps the plan usable by Gemini Antigravity without assuming it shares
Claude Code's specific skill catalog, while still giving it concrete
starting points rather than only abstract requirements.

## Alternatives Considered
- **Write the plan purely in Claude-Skill terms**: rejected — Gemini
  Antigravity is a different environment; a plan that only makes sense in
  Claude Code's skill vocabulary would need translation before use.
- **Write the plan with zero tool/skill references, purely descriptive**:
  rejected — the user explicitly wants both local skills named *and* a
  mechanism for the executing agent to source ones it's missing from the
  web; a purely descriptive plan discards useful, already-known starting
  points.

## Consequences
- The phased plan (produced next, via the writing-plans skill) must
  consistently apply this pattern: capability → local skill (if any) → web/
  MCP fallback instruction, for every phase.
- If Gemini Antigravity's actual skill/MCP catalog differs significantly
  from what's assumed here, some named local skills will simply not exist
  in that environment — the fallback instruction is what makes the plan
  still executable in that case, not an optional nicety.
