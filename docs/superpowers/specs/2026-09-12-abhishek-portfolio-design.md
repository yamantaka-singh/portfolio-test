# Abhishek Pandey — Cricket Creator Portfolio — Design Spec

Date: 2026-09-12 (rev 3, verified against live APIs, npm and skill repos)
Status: Approved design; implementation plan in `docs/superpowers/plans/`
Planned in: Claude Code. Executed in: Gemini Antigravity (ADR-0004).

## 1. Goal

A one-page, Awwwards-tier portfolio that gets **brands to book Abhishek
Pandey**, a cricket content creator.

The page is a scroll journey through a stadium: scrolling scrubs a
Gemini/Veo-made flythrough video frame by frame, while real content from his
accounts sits on top.

Accounts:
- Instagram `@abhishekpandey_26`, `@spinandswing26`
- YouTube `@spinandswing26`, `@abhishekunseen26`
- LinkedIn `abhishek-pandey-26sep03`

## 2. Decisions

| Area | Decision | ADR |
|------|----------|-----|
| Rendering | Scroll-scrubbed image sequence on one canvas, DOM content on top, keyframe stills as fallback | [0001](../../adr/0001-rendering-architecture.md) |
| Assets | Manual: Gemini app stills → Flow "Frames to Video" transitions → ffmpeg + sharp frame export | [0002](../../adr/0002-asset-generation-pipeline.md) |
| Data | Scrapling seed, public only: Instagram counts + profile-page shortcodes (or curated URLs), YouTube page + RSS, LinkedIn meta tags; self-hosted thumbnails; tap-to-play; GitHub Actions refresh deferred | [0003](../../adr/0003-data-acquisition-pipeline.md) |
| Execution | Claude plans, Antigravity executes; Pro/Flash tiers; parallel lanes between human gates; skills pinned in repo, web fallback | [0004](../../adr/0004-execution-tooling-split.md) |
| Hosting | Vercel static, `*.vercel.app` until a domain is bought | [0005](../../adr/0005-hosting.md) |
| Structure | One page, six zones, Abhishek-led, WhatsApp and email CTAs counted via `/go/*` page views, English UI with Hinglish copy | [0006](../../adr/0006-site-structure.md) |
| Stack | Astro 7 static, GSAP 3.15 ScrollTrigger, plain CSS tokens; web3d gate order without its checker | [0007](../../adr/0007-stack.md) |
| Governance | task-observer (One Skill to Rule Them All) rules every skill: always-on activation, one pinned observation log, skills change only via staged updates the user approves at gates | [0008](../../adr/0008-task-observer-governance.md) |

## 3. Gates and evidence

Gate order is borrowed from web3d-skills. A gate closes only when its
evidence exists and the named reviewer approves it on the Vercel preview.
`node scripts/verify-pipeline.mjs [live-url]` checks every row
automatically, read-only, and exits non-zero on any failure.

| Gate | Evidence | Human gate(s) |
|------|----------|---------------|
| governance | `AGENTS.md` + `.agents/rules/00-task-observer.md` (always on) + `task-observer` installed + observation log at the pinned path | Gate review at every gate |
| scope | `docs/inputs.md` complete (see §6) | G0: inputs and consent |
| art | `assets/prompts/keyframes.md` + six approved stills in `src/assets/keyframes/` | G2: style lock, G3: all keyframes |
| assets | `src/data/social.json` curated; `src/data/frames.json` + frames in `public/frames/` | G1: data curation, G5: transition takes |
| look | `src/styles/tokens.css`, hero zone styled on preview | G4: tokens |
| motion | Scrub engine live on preview with real frames; sections pinned to timeline | G6: integrated page |
| ux | Reduced-motion, no-JS and frame-failure fallbacks visible on preview; a11y report | (inside G6/G7) |
| perf | `docs/qa/perf-report.md`: Lighthouse mobile + real mid-range Android on 4G | (inside G7) |
| ship | `docs/qa/qa-checklist.md` complete; production URL live | G7: launch |

## 4. Phases

The executable, task-by-task version with code is the implementation plan.
This section is the map.

Legend:
- **[Pro]** / **[Flash]**: agent model tier
- **[User]**: done by hand
- **∥**: runs in parallel with its siblings, each in a fresh agent and its
  own worktree

Shared files (`tokens.css`, `global.css`, `index.astro`, `Zone.astro`,
`scrub.js`, `Base.astro`) have one owner at a time; the exact hand-off order
is in the plan's Global Constraints.

### Phase 0: Setup (sequential)
- **0.1 [Pro → User] Governance + inputs** → task-observer installed and activated (`AGENTS.md`, always-on rule, pinned log), then `docs/inputs.md`. Gate **G0**.
- **0.2 [Flash] Scaffold**
  - Astro 7 static (Node ≥ 22.19), linked to a Vercel project, `site` set
    to the `vercel.app` URL
  - `brew install ffmpeg`
  - Python venv at `scraper/.venv` with `scrapling[fetchers]==0.4.15`
  - Run `scripts/install-skills.sh`
  - Run `scripts/verify-pipeline.mjs` (expected: `scope` and `build` PASS,
    every other gate FAIL)

### Phase 1: Three lanes, all ∥ after G0
- **1A [Flash] Data**
  - `scraper/scrape.py` → `social.json` + thumbnails
  - Instagram: counts from profile meta; posts from the profile page's
    recent shortcodes, or `scraper/instagram_posts.txt` if the user lists
    older favourites
  - YouTube: channel page + RSS
  - LinkedIn: meta tags, falling back to a plain link
  - zod schema in `src/lib/social-schema.js`, parsed at build by `src/lib/social.js`
  - Gate **G1**: user sets `featured` flags (and optionally lists older
    Instagram URLs)
- **1B [Pro → User] Art**
  - Agent writes the style bible, the continuous camera path, and six
    keyframe prompts with the centre-third composition rule
  - User generates keyframe 1 → **G2** → uses it as reference for 2–6 →
    **G3**
- **1C [Pro] Scrub engine**
  - Canvas component driven by ScrollTrigger, fed placeholder frames from
    `scripts/export-frames.mjs --placeholder`
  - Loads frames per transition (current + next)
  - Frame tiers: desktop and mobile
  - LCP poster image
  - Fallbacks: reduced-motion, no-JS and load-failure → static stills

### Phase 2: Look and video (after G3)
- **2.1 [Pro] Design tokens** ∥ with 2.2
  - Palette sampled from the approved stills, contrast-verified
  - Display and body type pairing (Fontsource variable fonts), spacing and
    motion tokens
  - Applied to the hero zone only
  - Gate **G4**
- **2.2 [User] Five transition clips** in Flow Frames to Video
  - Several takes each; audio stripped
  - Gate **G5**
- **2.3 [Flash] Frame export** (after G5)
  - `scripts/export-frames.mjs`: ffmpeg → JPEG → sharp → AVIF, desktop and
    mobile tiers
  - Replaces the placeholder frames

### Phase 3: Sections (after G1 + G4)
- **3.1–3.5 [Flash]** ∥, one worktree each. Components read
  `social.json` and the tokens but do not edit the tokens.
  - **Pitch**: featured YouTube cards, `youtube-nocookie` tap-to-play facade
  - **Scoreboard**: jumbotron counts (count-up, nullable-safe), "as of"
    date
  - **Stands**: curated Instagram posts, open-on-Instagram or embed-on-tap
  - **Pavilion**: real photos + story, Hinglish-toned English; user
    approves copy at G6
  - **Boundary Rope**: CTAs via `/go/whatsapp` and `/go/email` redirect
    pages, LinkedIn, footer
- **3.6 [Pro] Integration** (sequential, after 3.1–3.5)
  - Compose `index.astro`, pin section reveals to the scrub timeline, add
    zone anchors
  - Gate **G6**: user reviews the preview on desktop and on a real phone,
    **including Instagram's in-app browser**

### Phase 4: Audit and fix (after G6)
- **4.1 [Flash] SEO** ∥ with 4.2: `Person` + `VideoObject` JSON-LD, Open
  Graph image = keyframe 1, sitemap, robots
- **4.2 [Flash]** read-only audits (two agents), no confirmation needed:
  - **Accessibility**
  - **Performance**: Lighthouse mobile LCP < 2.5s, INP < 200ms, CLS < 0.1;
    frame budget on a mid-range Android over 4G
- **4.3 [Pro] Fix pass** (sequential): applies the findings and writes
  `docs/qa/perf-report.md`

### Phase 5: Ship
- **5.1 [Flash]** Production deploy, Vercel Web Analytics
  (`@vercel/analytics/astro`), `docs/qa/qa-checklist.md`,
  `verify-pipeline.mjs <live-url>` all green. Gate **G7**: launch.

### Deferred (each gets its own spec later)
- GitHub Actions daily refresh; watch for Instagram blocking runner IPs
- Official Instagram/YouTube APIs once Abhishek grants access (unlocks
  automatic post lists and demographics)
- Custom domain (ADR-0005 checklist)
- Sound
- Enquiry form

## 5. Skills manifest (pinned into `.agents/skills/` by `scripts/install-skills.sh`)

Skill names below were checked against each repo's `skills/` folder on
2026-09-12.

**From public repos** (`npx skills add <source> --skill <name> -a antigravity -y`):

| Source | Skills |
|--------|--------|
| `obra/superpowers` | `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `using-git-worktrees`, `test-driven-development`, `verification-before-completion`, `requesting-code-review` |
| `D4Vinci/Scrapling` | `scrapling-official` |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `ui-ux-pro-max` |
| `anthropics/skills` | `frontend-design`, `webapp-testing` (Playwright checks for the fallback/behaviour steps in Tasks 10, 14, 16, 18, 19) |
| `vercel-labs/agent-skills` | `web-design-guidelines`, `deploy-to-vercel` |
| `DietrichGebert/ponytail` | `ponytail`, `ponytail-review` |
| `rebelytics/one-skill-to-rule-them-all` | `task-observer` — installed first, governs all others (ADR-0008) |
| `leonxlnx/taste-skill` (install name = frontmatter `name`) | `design-taste-frontend`, `high-end-visual-design`, `full-output-enforcement` |
| `mattpocock/skills` | `grilling`, `writing-for-agents`, `diagnosing-bugs` |
| `ConardLi/garden-skills` | `web-design-engineer`, `gpt-image-2` (prompt-advisor mode only; images stay manual per ADR-0002) |

**Copied from local disk** (no public source found):

| Local path | Skills |
|------------|--------|
| `~/projects/3d-design/web3d-skills/` (each folder's single top-level `*.md` is renamed to `SKILL.md` on copy) | `web3d-art-direction`, `web3d-motion-choreography`, `web3d-interaction-ux`, `web3d-performance-budget`, `web3d-ship-deploy` |
| `~/.gemini/config/skills/` (Antigravity global on this machine) | `astro`, `scroll-experience`, `premium-web-design`, `design-system`, `modern-web-guidance`, `seo`, `schema-markup`, `core-web-vitals`, `accessibility-auditor`, `copywriting`, `humanizer`, `architecture-decision-records`, `zod-validation-expert`, `javascript-testing-patterns`, `python-testing-patterns`, `web-performance-optimization`, `debug-optimize-lcp`, `clean-code`, `a11y-debugging`, `seo-fundamentals` |

**Fallback**: for a capability not listed, run `npx skills find <keyword>`
and log the match as a task-observer `proposes_skill` observation; it is
installed and added to `install-skills.sh` only after approval at a gate
(ADR-0008). Everything above is committed in `.agents/skills/`, so a fresh
clone needs no install at all.

**Deliberately excluded**, because 3D, React and generation were removed:
- R3F / `3d-web-experience`
- Next.js / React skills
- `imagegen` / `comfy-mcp`
- database skills
- `gpt-taste` (mandates React, Tailwind, a nav bar and AIDA sections, against ADR-0006/0007)
- mattpocock `code-review` (needs its setup skill's issue-tracker file) and `tdd` (duplicates superpowers)
- garden-skills `beautiful-article` and `kb-retriever` (not this project's job) and `web-video-presentation` (builds a Vite + React app, against ADR-0007)
- anthropics/skills `canvas-design` and `algorithmic-art` (this project's art is Gemini/Flow stills per ADR-0002, not generated PNG/p5.js art), `theme-factory` (tokens are already fixed by ADR-0007), `web-artifacts-builder` (builds claude.ai artifacts, not a deployed site), `mcp-builder`/`skill-creator`/`brand-guidelines`/`docx`/`pdf`/`pptx`/`xlsx`/`slack-gif-creator`/`academy-guide`/`discernment-nudge`/`doc-coauthoring`/`internal-comms`/`claude-api` (no MCP server, skill authoring already covered by task-observer + writing-for-agents, no Anthropic-branded or document/slide/spreadsheet output in this project)

## 6. Inputs needed before Phase 1 (`docs/inputs.md`)
- [ ] Abhishek's consent to scrape and republish his public content
- [ ] WhatsApp number (for `wa.me`) and enquiry email
- [ ] Pavilion photos (high-res) and bio facts / milestones
- [ ] Instagram: the ~5 most recent posts are fine, or older post/reel URLs
      are listed in `scraper/instagram_posts.txt`
- [ ] Flow plan tier confirmed to export without a visible watermark
- [ ] Vercel project name, which sets the `vercel.app` URL

## 7. Top risks
1. **Style drift** across six manual keyframes. Mitigated by the style lock
   (G2) plus reference-image reuse.
2. **Scrapers break** on YouTube/Instagram changes. Instagram's JSON endpoint
   is already login-walled (401, checked 2026-09-12); posts come from
   profile-page shortcodes and post-page meta tags instead. Fix order:
   `StealthyFetcher`, then official APIs once access is granted.
3. **Frame bandwidth on 4G.** Budgets in ADR-0001 are tuned in Phase 4;
   fallback is all-intra `<video>` scrubbing.
4. **Instagram in-app browser quirks.** Tested explicitly at G6.
5. **The manual art lane is the bottleneck.** Lanes 1A and 1C and the
   sections are arranged to run around it.
