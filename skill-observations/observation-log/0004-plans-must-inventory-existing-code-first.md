---
id: 4
title: "Grilled plan proposed a duplicate pipeline because existing scraper, cron and incident history were never inventoried"
status: open
type: internal
skill: [grilling]
proposes_skill: []
siblings_checked: "none"
area: "planning-and-requirements"
date: 2026-09-13
session_context: "Reviewing a pasted content-pipeline plan produced by an earlier grill-me session"
parked_until: ""
resolved: ""
resolution: ""
---

A plan that came out of a grill-me session proposed `pipeline/sync_accounts.py` and a new
daily workflow. The repo already had `scraper/scrape.py`, `.github/workflows/update-stats.yml`
running the same job, and a commit (`3ed9a7d`) showing that CI scraping had already been
blocked and had wiped data. The session asked the user about "decisions" (hot/cold tiering,
async fetchers) whose premises one `ls` and `git log` would have disproven.

The grilling skill already says "finding facts is your job", but it doesn't say *which* facts
come first. Insight: before round 1, inventory existing code, workflows, ADRs and git history
that touch the plan's subject, and ask no question whose premise that inventory contradicts.

Proposed skill change: add a "round 0 — inventory" step to `grilling` (list the files, workflows
and commits touching the subject, and prune the design tree against them before asking anything).
