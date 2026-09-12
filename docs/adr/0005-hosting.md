# ADR-0005: Vercel hosting

## Status
Accepted — 2026-09-12

## Context
The site is a Next.js App Router application with a dynamically-imported,
client-only R3F hero and otherwise static content sourced from a committed
JSON file (ADR-0003). Deployment target needed to be decided to inform build
configuration (image optimization, edge functions, etc.).

## Decision
Deploy to Vercel.

## Alternatives Considered
- **Undecided/generic Next.js hosting**: considered, but the user confirmed
  Vercel directly when asked, so there's no ambiguity to preserve — building
  "deployment-agnostic" here would be speculative generality with no second
  target in view.

## Consequences
- Can rely on Vercel's native Next.js image optimization and edge network
  rather than configuring a generic Node host.
- No self-hosting or alternative-platform concerns need to be designed for
  in this plan.
