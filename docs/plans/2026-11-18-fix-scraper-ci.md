# Fix Scraper CI and Runner Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sync the local repository with origin/main, resolve the hanging/failing daily social stats scraper CI by restarting and hardening the self-hosted GitHub Actions runner with launchd KeepAlive, and verify an end-to-end scheduled scrape run.

**Architecture:** The scraper runs on a self-hosted macOS runner to bypass Instagram datacenter IP blocks (ADR-0009). The runner daemon (`actions.runner`) was stopped after a machine restart because its launchd plist lacked auto-restart flags, causing scheduled runs to stall in queue for 24 hours. We sync local git commits, cancel the stuck workflow run, harden the runner's launchd configuration with `KeepAlive: true`, start the runner daemon, optimize the workflow concurrency, and execute a live test run.

**Tech Stack:** GitHub Actions, macOS Launchd, Bash, Python 3 (Scrapling), Node.js (Astro), GitHub CLI (`gh`).

---

### Task 1: Sync Local Repository with Remote

**Relevant Skills:** `@skills/git-workflow`, `@skills/ponytail`

**Files:**
- Repository root: `/Users/kaalu/projects/abhishek-portfolio`

**Step 1: Verify git status and fetch origin**
Run: `git status && git fetch origin main`
Expected output: Working tree clean; `Your branch is behind 'origin/main' by 26 commits`.

**Step 2: Fast-forward local main to remote main**
Run: `git pull --ff-only origin main`
Expected output: Fast-forwarded to `bbe9ed3` (latest commit containing scraped social stats up to Nov 12).

**Step 3: Verify local log matches origin/main**
Run: `git log -1 --oneline`
Expected output: `bbe9ed3 chore: refresh social stats`.

---

### Task 2: Cancel Stuck Pending GitHub Actions Runs

**Relevant Skills:** `@skills/github-automation`, `@skills/incident-responder`

**Files:**
- GitHub Actions workflow runs for repo `yamantaka-singh/portfolio-test`

**Step 1: Check currently active and pending runs**
Run: `gh run list --workflow update-stats.yml --limit 5`
Expected output: Run `44200836278` shows status `in_progress` or `queued`/`pending`.

**Step 2: Cancel the stuck pending run**
Run: `gh run cancel 44200836278`
Expected output: Confirmation that run `44200836278` was cancelled.

**Step 3: Verify no other runs are blocking the concurrency group**
Run: `gh run list --workflow update-stats.yml --limit 3`
Expected output: All previous runs completed or cancelled; no pending jobs blocking `social-sync`.

---

### Task 3: Harden Self-Hosted Runner with Launchd KeepAlive

**Relevant Skills:** `@skills/bash-pro`, `@skills/incident-responder`

**Files:**
- Modify: `~/Library/LaunchAgents/actions.runner.yamantaka-singh-portfolio-test.MJs-MacBook-Air.plist`
- Target directory: `/Users/kaalu/actions-runner`

**Step 1: Check runner service status**
Run: `cd /Users/kaalu/actions-runner && ./svc.sh status`
Expected output: Status indicates `Stopped`.

**Step 2: Inject KeepAlive into the launchd plist**
Add `<key>KeepAlive</key><true/>` to `~/Library/LaunchAgents/actions.runner.yamantaka-singh-portfolio-test.MJs-MacBook-Air.plist` directly after `<key>RunAtLoad</key><true/>`.
Expected output: File contains:
```xml
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
```

**Step 3: Start the runner service**
Run: `cd /Users/kaalu/actions-runner && ./svc.sh start`
Expected output: Service started successfully.

**Step 4: Verify runner process and GitHub API status**
Run:
```bash
ps aux | grep -i Runner.Listener | grep -v grep
gh api repos/yamantaka-singh/portfolio-test/actions/runners
```
Expected output: Process is active; runner `MJs-MacBook-Air` reports `"status": "online"`.

---

### Task 4: Harden Workflow Concurrency & Timeouts in `update-stats.yml`

**Relevant Skills:** `@skills/github-actions-templates`, `@skills/ponytail`

**Files:**
- Modify: `.github/workflows/update-stats.yml:11-15`

**Step 1: Update concurrency configuration**
Change `cancel-in-progress: false` to `cancel-in-progress: true` under `concurrency:` so that if the Mac is asleep when a cron fires, a subsequent scheduled or manual run will automatically displace stale queued jobs instead of queuing up for 24 hours.

Diff in `.github/workflows/update-stats.yml`:
```yaml
# One refresh at a time: newer triggers cancel stale queued runs if the runner was offline.
concurrency:
  group: social-sync
  cancel-in-progress: true
```

**Step 2: Commit and push workflow improvement**
Run:
```bash
git add .github/workflows/update-stats.yml
git commit -m "fix(ci): enable cancel-in-progress for social-sync concurrency group"
git push origin main
```
Expected output: Successfully pushed to `origin/main`.

---

### Task 5: Trigger and Verify Live Scrape Workflow Run

**Relevant Skills:** `@skills/github-automation`, `@skills/verification-loop`

**Files:**
- GitHub Actions execution
- Data files: `src/data/social.json`

**Step 1: Trigger manual workflow dispatch**
Run: `gh workflow run update-stats.yml`
Expected output: `Created workflow_dispatch event for update-stats.yml`.

**Step 2: Watch workflow execution until completion**
Run: `gh run watch $(gh run list --workflow update-stats.yml --limit 1 --json databaseId -q '.[0].databaseId')`
Expected output: Runner picks up the job immediately; steps `caffeinate`, `scrapling install`, `scrape.py`, `npm ci`, `npm test`, `npm run build`, and `Commit and push` complete with `✓`.

**Step 3: Verify updated social data locally**
Run:
```bash
git pull origin main
git log -1 --stat
```
Expected output: Latest commit shows updated metrics in `src/data/social.json`.
