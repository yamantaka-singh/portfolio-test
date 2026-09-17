---
id: 7
title: "A pasted external root-cause analysis was plausible, cited real line numbers, and was wrong; its fix would have reintroduced an already-closed bug"
status: open
type: internal
skill: [diagnosing-bugs, systematic-debugging]
proposes_skill: []
siblings_checked: "none"
area: "ci-failure-diagnosis"
date: 2026-09-17
session_context: "User pasted a /systematic-debugging report (source unstated) diagnosing a failed self-hosted GitHub Actions run as a Node.js version mismatch"
parked_until: ""
resolved: ""
resolution: ""
---

The pasted report was well-formatted, cited real file:line references, and reasoned
plausibly from `package.json`'s Node requirement. It also said upfront it could not see
the actual job log. That disclaimer was the signal to verify before acting on the rest --
instead the natural pull is to treat detailed, confident-sounding analysis as already
half-verified.

The real logs (GitHub's run API for step-level conclusions, plus the self-hosted runner's
own local `_diag/Worker_*.log` and macOS's `pmset -g log`) told a different story: the
Mac slept mid-job, the network dropped, the job's GitHub auth lease lapsed, and every
later step shows a blank conclusion -- never a reported `failure`. A real Node engine
error is exactly the kind of thing GitHub does capture and show as `failure`; blank
steps are a different failure mode entirely (never got to report), not a smaller
version of the same one.

The pasted fix (`actions/setup-node@v4`) would have reintroduced a bug already fixed in
this same file (commit 93d7dbd): that action assumes a throwaway hosted runner and fails
writing to `/Users/runner` on a real Mac. Applying a plausible-sounding external fix
without checking it against this session's own prior work would have been a regression,
not a fix.

Insight for `diagnosing-bugs` / `systematic-debugging`: when a report (pasted, another
agent's output, a teammate's message) diagnoses a failure it admits it couldn't fully
observe, that admission is not a minor caveat to note in passing -- it means the
root-cause claim is unverified and the proposed fix has not been checked against it.
Pull the actual evidence (logs, run history, prior commits touching the same file)
before applying the fix, especially when the fix would edit code changed recently for a
different, already-diagnosed reason.
