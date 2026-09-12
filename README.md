# Abhishek Pandey — Cricket Content Creator Portfolio

> A high-performance, cinematic Astro 7 portfolio featuring a scroll-scrubbed stadium flythrough on a fixed `<canvas>`, real DOM content, and direct booking conversions.

[![Pipeline Status](https://img.shields.io/badge/pipeline-all%20green-success)](#verification-pipeline)
[![Astro Version](https://img.shields.io/badge/astro-7.x-orange.svg)](https://astro.build)
[![Vercel Deployment](https://img.shields.io/badge/deployed%20on-vercel-black.svg)](https://abhishek-pandey-portfolio-pink.vercel.app)

- **Live Site**: [https://abhishek-pandey-portfolio-pink.vercel.app](https://abhishek-pandey-portfolio-pink.vercel.app)
- **GitHub Repository**: [yamantaka-singh/portfolio-test](https://github.com/yamantaka-singh/portfolio-test)

---

## Overview

This portfolio showcases cricket content creator **Abhishek Pandey** (host of *Spin & Swing* and *Abhishek Unseen*). As the visitor scrolls, a fixed background `<canvas>` scrubs through a continuous camera movement across an empty cricket stadium at dusk under warm floodlights, while real DOM content panels surface over the art.

### The 6 Stadium Zones

1. **The Tunnel (Intro)**: Cinematic entrance from the players' tunnel looking out onto the floodlit turf. Displays name, tagline, and walkout anchor.
2. **The Pitch (22 Yards)**: Facing down the wicket. Features 6 curated YouTube match breakdowns using zero-JS tap-to-play facades that swap to `youtube-nocookie` players on click.
3. **The Scoreboard**: Low angle looking up at a towering matrix scoreboard glowing amber. Displays audience reach and recent video view totals with smooth count-up animation.
4. **The Stands**: Panoramic view sweeping across empty tiered seats. Shows 6 curated Instagram reels and posts with like counts, captions, and direct profile links.
5. **The Pavilion**: Colonial-style clubhouse with wooden balcony railings and warm interior lights. Features an authentic 88-word story, numbered bio facts, and high-resolution photo grid.
6. **The Boundary Rope**: Low angle against the boundary rope with the entire stadium visible. Houses direct WhatsApp (`/go/whatsapp`) and Email (`/go/email`) booking CTAs.

---

## Technical Highlights

### 1. Scroll-Scrubbed Canvas Stage
- **GSAP ScrollTrigger**: Drives canvas frame rendering linked 1:1 with viewport scroll.
- **Dual-Tier AVIF Frame Budgets**:
  - Desktop: 60 frames per move @ 1600px width, quality 50 (~8 KB avg per frame).
  - Mobile: 30 frames per move @ 720px width, quality 45 (~4 KB avg per frame).
- **Sliding Preload Window**: Only active and adjacent transitions (`transitionsToLoad`) are held in memory.
- **Single Source-of-Truth Frame Math**: `pickFrame()` evaluates all tween states simultaneously to prevent multi-tween overwrite races.

### 2. Progressive Enhancement & Fallbacks
- **Full-Resolution Stills**: 6 approved 2560×1440 stadium stills (`src/assets/keyframes/`) sit in the DOM behind every zone.
- **Motion Safety**: Automatically disables canvas and animations under `prefers-reduced-motion: reduce`.
- **Zero-JS Resilience**: Pure HTML renders completely when JavaScript is disabled, with links directing to YouTube and Instagram natively.
- **Network Fault Tolerance**: If any frame asset fails to load, the stage cleanly falls back to still images without breaking page scroll.

### 3. Core Web Vitals & Performance
- **Mobile LCP**: 1.2s (target < 2.5s)
- **CLS**: 0.01 (target < 0.1)
- **TBT**: 25ms (target < 200ms)
- **Total Shipped JS**: 112 KB
- **Static HTML**: 27 KB

### 4. SEO & Structured Data
- Schema.org JSON-LD `@graph` containing `Person`, `WebSite`, and `VideoObject` metadata for featured videos.
- Dynamic `/sitemap.xml` and `/robots.txt`.
- Open Graph image generation (`og:image`), Twitter cards, and canonical link tags.

---

## Tech Stack

- **Framework**: [Astro 7](https://astro.build) (Static Site Generation)
- **Motion & Scrubbing**: [GSAP](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (AVIF / WebP / JPEG pipelines)
- **Video & Clips**: [ffmpeg](https://ffmpeg.org/) (mjpeg extraction)
- **Typography**: `@fontsource-variable/big-shoulders-display` & `@fontsource-variable/hanken-grotesk`
- **Data Scraping**: Python [Scrapling](https://github.com/D4Vinci/Scrapling) (`scraper/`)
- **Analytics**: [@vercel/analytics](https://vercel.com/analytics)
- **Hosting**: [Vercel](https://vercel.com)

---

## Getting Started

### Prerequisites

- Node.js >= 22.19.0
- Python >= 3.10
- ffmpeg (for video frame export)

### Installation

```bash
# Clone the repository
git clone https://github.com/yamantaka-singh/portfolio-test.git
cd portfolio-test

# Install Node dependencies
npm install

# Setup Python scraper venv (optional, only needed for re-scraping)
python3 -m venv scraper/.venv
scraper/.venv/bin/pip install -r scraper/requirements.txt
```

### Development

```bash
# Start Astro local dev server
npm run dev

# Run unit test suite
npm test

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Verification Pipeline

Run the end-to-end pipeline gate verifier:

```bash
# Local verification
node scripts/verify-pipeline.mjs

# Remote / live deployment verification
node scripts/verify-pipeline.mjs https://abhishek-pandey-portfolio-pink.vercel.app
```

---

## Project Structure

```
abhishek-portfolio/
├── assets/
│   ├── clips/                # Transition video clips (gitignored)
│   └── prompts/              # Style bible and keyframe generation prompts
├── docs/
│   ├── adr/                  # Architecture Decision Records (ADR-0001 to 0008)
│   ├── inputs.md             # Project parameters & consent records
│   ├── qa/                   # QA checklist, perf audit, and a11y reports
│   └── superpowers/          # Implementation specs and plans
├── public/
│   ├── frames/               # Pre-rendered AVIF frames (desktop & mobile)
│   └── robots.txt            # Search engine directives
├── scraper/                  # Offline python scraping suite
│   ├── parse.py              # Social media parsers
│   ├── scrape.py             # Public profile runner
│   └── test_parse.py         # Parser unit tests
├── scripts/
│   ├── export-frames.mjs     # Frame extraction & AVIF compressor
│   ├── generate-keyframes.mjs# Keyframe generator
│   ├── install-skills.sh     # Agent skills pinning script
│   └── verify-pipeline.mjs   # Pipeline gates verifier
└── src/
    ├── assets/               # Social thumbs, photos, and keyframes
    ├── components/           # Astro UI components (ScrubStage, Hero, Pitch, etc.)
    ├── data/                 # Social JSON, site constants, and story markdown
    ├── layouts/              # Base HTML layout with analytics & font loader
    ├── lib/                  # Scrub math, social schema, formatters, and tests
    ├── pages/                # Routes (index, sitemap.xml, /go/ redirect tracking)
    ├── scripts/              # Client-side GSAP scrub engine
    └── styles/               # Design tokens and global CSS
```

---

## Content Maintenance

- **Refresh Social Content**: Run `scraper/.venv/bin/python scraper/scrape.py`, set `"featured": true` in `src/data/social.json`, commit, and push.
- **Update About Story**: Edit `src/data/story.md` (keep to <= 120 words), commit, and push.
- **Update Stadium Clips**: Add new MP4 clips to `assets/clips/`, run `node scripts/export-frames.mjs`, commit, and push.

---

## License

Private portfolio repository. Content and brand assets belonging to Abhishek Pandey are republished with explicit consent.
