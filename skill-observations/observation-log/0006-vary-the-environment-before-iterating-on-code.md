---
id: 6
title: "Four rounds of code changes chased an environment-specific block that one change of network would have identified immediately"
status: open
type: internal
skill: [diagnosing-bugs]
proposes_skill: []
siblings_checked: "none"
area: "diagnosis-of-environment-specific-failures"
date: 2026-09-14
session_context: "Instagram scraping failing only from GitHub-hosted runners, working locally throughout"
parked_until: ""
resolved: ""
resolution: ""
---

A scrape worked locally on every attempt and failed on every GitHub-hosted run. Four
rounds went into the code: a headless-browser fallback, reading the library's source for
missed options, a plausibility guard, and backed-off retries honoring `Retry-After`. All
of it was well-reasoned from the evidence in hand, and none of it could have worked — the
block was the runner's IP range. Moving the identical, unchanged code to a different
network fixed it outright.

The decisive experiment was available from the first failure, and was in fact already
being run continuously: the same script succeeded locally the whole time. That success was
read as "the code is fine" rather than as the control half of an experiment whose
independent variable was the network.

Two insights for `diagnosing-bugs`:

1. **When a failure is environment-specific — passes here, fails there — vary the
   environment before varying the code.** A "works locally, fails in CI" split is already
   a controlled experiment with one variable; finish it before editing anything. Code
   changes cannot fix a difference the code does not contain.

2. **To tell an identity/IP-level block from a request-level one, request the most
   permissive endpoint on the same origin.** Here, the unauthenticated login page itself
   returned 429. A page that requires no credentials refusing a client that never had any
   is not about the request — it is about who is asking. One cheap request settles it and
   rules out every header, fingerprint, and retry theory at once.

See also [[0005-exit-zero-green-hid-unrefreshed-data]]: both are cases where the visible
signal (green tests, a plausible error code) was not the signal that mattered.
