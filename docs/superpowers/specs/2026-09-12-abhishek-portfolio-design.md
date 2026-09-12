# Abhishek Pandey — Cricket Creator Portfolio — Design Spec

Date: 2026-09-12 (rev 2, after the second grilling)
Status: Draft, pending user review
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
| Assets | Manual: Gemini app stills → Flow "Frames to Video" transitions → ffmpeg frame export | [0002](../../adr/0002-asset-generation-pipeline.md) |
| Data | Scrapling seed for Instagram, YouTube and LinkedIn (public only); self-hosted thumbnails; tap-to-play; GitHub Actions refresh deferred | [0003](../../adr/0003-data-acquisition-pipeline.md) |
| Execution | Claude plans, Antigravity executes; Pro/Flash tiers; parallel lanes between human gates; skills pinned in repo, web fallback | [0004](../../adr/0004-execution-tooling-split.md) |
| Hosting | Vercel static, `*.vercel.app` until a domain is bought | [0005](../../adr/0005-hosting.md) |
| Structure | One page, six zones, Abhishek-led, WhatsApp and email CTAs, English UI with Hinglish copy | [0006](../../adr/0006-site-structure.md) |
| Stack | Astro 7 static, GSAP 3.15 ScrollTrigger, plain CSS tokens; web3d gate order without its checker | [0007](../../adr/0007-stack.md) |

## 3. Gates and evidence

Gate order is borrowed from web3d-skills. A gate closes only when its
evidence exists and the named reviewer approves it on the Vercel preview.

| Gate | Evidence | Human gate(s) |
|------|----------|---------------|
| scope | `docs/inputs.md` complete (see §6) | G0: inputs and consent |
| art | `assets/prompts/keyframes.md` + six approved stills in `assets/keyframes/` | G2: style lock, G3: all keyframes |
| assets | `src/data/social.json` curated; frames in `public/frames/` | G1: data curation, G5: transition takes |
| look | `src/styles/tokens.css`, hero zone styled on preview | G4: tokens |
| motion | Scrub engine live on preview with real frames; sections pinned to timeline | G6: integrated page |
| ux | Reduced-motion, no-JS and frame-failure fallbacks visible on preview; a11y report | (inside G6/G7) |
| perf | `docs/qa/perf-report.md`: Lighthouse mobile + real mid-range Android on 4G | (inside G7) |
| ship | `docs/qa/qa-checklist.md` complete; production URL live | G7: launch |

## 4. Phases

Legend:
- **[Pro]** / **[Flash]**: agent model tier
- **[User]**: done by hand
- **∥**: runs in parallel with its siblings, each in a fresh agent and its
  own worktree

Shared files, which only an integration agent touches:
- `src/styles/tokens.css`
- `src/pages/index.astro`
- the scroll timeline module

### Phase 0: Setup (sequential)
- **0.1 [User] Inputs and consent**
  - Abhishek's OK to scrape and republish
  - WhatsApp number and enquiry email
  - Pavilion photos and bio facts
  - Confirm the Flow plan exports clips without a visible watermark
  - Gate **G0**
- **0.2 [Flash] Scaffold**
  - Astro 7 static, linked to a Vercel project, `site` set to the
    `vercel.app` URL
  - `brew install ffmpeg`; `pip install "scrapling[fetchers]"` +
    `scrapling install`
  - Run `scripts/install-skills.sh`
  - Skills: `astro`, `vercel-deploy`

### Phase 1: Three lanes, all ∥ after G0
- **1A [Flash] Data**
  - `scraper/scrape.py` → `social.json` + thumbnails
  - zod content collection schema
  - LinkedIn failure falls back to a plain link
  - Skills: `scrapling-official`, `astro`
  - Gate **G1**: user sets `featured` flags
- **1B [Pro → User] Art**
  - Agent writes the style bible, the continuous camera path, and six
    keyframe prompts with the centre-third composition rule
  - User generates keyframe 1 → **G2** → uses it as reference for 2–6 →
    **G3**
  - Skills: `web3d-art-direction`, `premium-web-design`, `ui-ux-pro-max`
- **1C [Pro] Scrub engine**
  - Canvas component driven by ScrollTrigger, fed placeholder frames
    (ffmpeg `testsrc`)
  - Loads frames per zone (current + next)
  - Frame tiers: desktop and mobile
  - LCP poster image
  - Fallbacks: reduced-motion, no-JS and load-failure → static stills
  - Skills: `scroll-experience`, `web3d-motion-choreography`,
    `web3d-interaction-ux`, `modern-web-guidance`

### Phase 2: Look and video (after G3)
- **2.1 [Pro] Design tokens** ∥ with 2.2
  - Palette sampled from the approved stills, contrast-verified
  - Display and body type pairing (Latin only), spacing and motion tokens
  - Applied to the hero zone only
  - Skills: `design-system`, `ui-ux-pro-max`, `premium-web-design`,
    `frontend-design`
  - Gate **G4**
- **2.2 [User] Five transition clips** in Flow Frames to Video
  - Several takes each; audio stripped
  - Gate **G5**
- **2.3 [Flash] Frame export** (after G5)
  - `scripts/export-frames.sh` → AVIF (SVT-AV1) at desktop and mobile tiers
  - Replaces the placeholder frames

### Phase 3: Sections (after G1 + G4)
- **3.1–3.5 [Flash]** ∥, one worktree each. Components read
  `social.json` and the tokens but do not edit the tokens.
  - **Pitch**: featured YouTube cards, `youtube-nocookie` tap-to-play facade
  - **Scoreboard**: jumbotron counts (count-up, nullable-safe), "as of"
    date
  - **Stands**: featured Instagram grid, embed-on-tap facade
  - **Pavilion**: real photos + story. Copy drafted with `copywriting` +
    `humanizer` in Hinglish-toned English; user approves at G6.
  - **Boundary Rope**: prefilled `wa.me` link + `mailto:`, LinkedIn,
    footer, analytics click events
  - Skills: `frontend-design`, `web-design-guidelines`, `astro`
- **3.6 [Pro] Integration** (sequential, after 3.1–3.5)
  - Compose `index.astro`, pin section reveals to the scrub timeline, add
    zone anchors
  - Gate **G6**: user reviews the preview on desktop and on a real phone,
    **including Instagram's in-app browser**

### Phase 4: Audit and fix (after G6)
- **4.1–4.3 [Flash]** read-only audits ∥, no confirmation needed:
  - **Accessibility** (`accessibility-auditor`)
  - **SEO**: `Person` + `VideoObject` schema, Open Graph image =
    keyframe 1, sitemap, robots (`seo`, `schema-markup`)
  - **Performance**: Lighthouse mobile LCP < 2.5s, INP < 200ms, CLS < 0.1;
    frame budget on a mid-range Android over 4G (`core-web-vitals`,
    `web3d-performance-budget`)
- **4.4 [Pro] Fix pass** (sequential): applies the findings and writes
  `docs/qa/perf-report.md`

### Phase 5: Ship
- **5.1 [Flash]**
  - Production deploy, Vercel Web Analytics on, `docs/qa/qa-checklist.md`
  - Skills: `web3d-ship-deploy`, `vercel-deploy`,
    `verification-before-completion`
  - Gate **G7**: launch

### Deferred (each gets its own spec later)
- GitHub Actions daily refresh (`github-actions-creator`); watch for
  Instagram blocking runner IPs
- Official Instagram/YouTube APIs once Abhishek grants access (unlocks
  demographics for a real media kit)
- Custom domain (ADR-0005 checklist)
- Sound
- Enquiry form

## 5. Skills manifest (pinned into `.agents/skills/` by `scripts/install-skills.sh`)

**From public repos** (`npx skills add <source> --skill <name> -a antigravity -y`):

| Source | Skills |
|--------|--------|
| `obra/superpowers` | `executing-plans`, `subagent-driven-development`, `dispatching-parallel-agents`, `using-git-worktrees`, `verification-before-completion`, `requesting-code-review` |
| `D4Vinci/Scrapling` | `scrapling-official` |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `ui-ux-pro-max` |
| `vercel-labs/agent-skills` | `frontend-design`, `web-design-guidelines` |
| `DietrichGebert/ponytail` | `ponytail` |

**Copied from local disk** (no public source found):

| Local path | Skills |
|------------|--------|
| `~/projects/3d-design/web3d-skills/` | `web3d-art-direction`, `web3d-motion-choreography`, `web3d-interaction-ux`, `web3d-performance-budget`, `web3d-ship-deploy` |
| `~/.gemini/config/skills/` (Antigravity global on this machine) | `astro`, `scroll-experience`, `premium-web-design`, `design-system`, `modern-web-guidance`, `seo`, `schema-markup`, `core-web-vitals`, `accessibility-auditor`, `copywriting`, `humanizer`, `vercel-deploy`, `architecture-decision-records` |

**Fallback**: on a machine missing any of these, or for a capability not
listed, run `npx skills find <keyword>`, install the match, and append it to
`install-skills.sh` in the same commit.

**Deliberately excluded**, because 3D, React and generation were removed:
- R3F / `3d-web-experience`
- Next.js / React skills
- `imagegen` / `comfy-mcp`
- database skills

## 6. Inputs needed before Phase 1 (`docs/inputs.md`)
- [ ] Abhishek's consent to scrape and republish his public content
- [ ] WhatsApp number (for `wa.me`) and enquiry email
- [ ] Pavilion photos (high-res) and bio facts / milestones
- [ ] Flow plan tier confirmed to export without a visible watermark
- [ ] Vercel project name, which sets the `vercel.app` URL

## 7. Top risks
1. **Style drift** across six manual keyframes. Mitigated by the style lock
   (G2) plus reference-image reuse.
2. **Scrapers break** on YouTube/Instagram layout changes. Fix in order: the
   official YouTube API, then official APIs once access is granted.
3. **Frame bandwidth on 4G.** Budgets in ADR-0001 are tuned in Phase 4;
   fallback is all-intra `<video>` scrubbing.
4. **Instagram in-app browser quirks.** Tested explicitly at G6.
5. **The manual art lane is the bottleneck.** Lanes 1A and 1C and the
   sections are arranged to run around it.
