---
id: 5
title: "A data pipeline passed exit code, tests and build while 23 of 25 refreshed values were unchanged and a featured item was silently dropped"
status: open
type: internal
skill: [verification-before-completion]
proposes_skill: []
siblings_checked: "none"
area: "data-pipeline-verification"
date: 2026-09-13
session_context: "End-to-end local test of the social scraper refresh before any push"
parked_until: ""
resolved: ""
resolution: ""
---

The first live scrape exited 0, and schema tests, unit tests and the Astro build all passed.
That alone would have been reported green. Comparing the new data file against the committed
one field by field showed two real failures:

- Only 2 of 25 curated reels had new values. The rest came back identical because the fallback
  source only yields rounded counts, which equalled the old hand-typed ones.
- A human-featured item had vanished because it dropped out of the top-N pool.

Neither failure raises an error or breaks a schema. Both are "the data is valid but not what was
intended".

Insight for `verification-before-completion`: for any job that produces data, "green" requires a
value-level diff against the last known-good output. That means counts of items, how many fields
actually changed, and whether human-set flags survived, not just exit codes and schema validation.
Report the diff numbers as the evidence.
