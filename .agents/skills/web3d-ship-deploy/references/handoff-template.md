# HANDOFF — <Project Name>

Delivered <date> by <you>. This document is the client's reference. Write it in
plain language; assume the reader is a marketing manager, not a developer.

---

## 1. What was built

<Scope sentence from the manifest.>

> "A Signature site where visitors watch a titanium watch case assemble itself
> as they scroll, on a persistent canvas across four sections, with a static
> fallback."

**Sections**

| # | Section | What the 3D does |
|---|---------|------------------|
| 1 | Hero | Product idles, slow rotation |
| 2 | Assembly | Case assembles as you scroll |
| 3 | Detail | Close crop on the crown, hotspots |
| 4 | Specs | 3D recedes; content takes over |
| 5 | Order | Product returns, CTA |

**Live URL:** <url>
**Repository:** <url>
**Hosting:** <Vercel / Netlify / Cloudflare> — account: <who owns it>

---

## 2. Running it locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

Node version: <20.x>. Environment variables are documented in `.env.example`.

Deploys happen automatically on push to `main`.

---

## 3. What you can change safely

**Copy** — all text lives in `src/content/*.ts`. Edit, commit, and it deploys.

**Colours** — `src/lib/tokens.ts`. Changing these updates both the website and
the 3D scene at once. Keep the background dark; the lighting is tuned for it.

**Images** — drop replacements in `public/images/` with the same filenames.

**Do not change without asking:**
- Anything in `src/three/` — the 3D scene
- `next.config.mjs` — caching and build settings
- `public/models/` — see section 4

---

## 4. Replacing the 3D model

**Read this before uploading a new model.** Dropping an unoptimised export into
`public/models/` will make the site load slowly or crash on phones.

Every model must be compressed first:

```bash
# One-time setup
npm i -g @gltf-transform/cli

# For each new model
gltf-transform optimize new-model.glb public/models/product.glb \
  --compress meshopt --texture-compress webp --texture-size 2048

# Verify it's within budget
node scripts/audit-glb.mjs public/models/
```

**Budgets this site is built to:**

| | Limit |
|---|---|
| Total 3D files | 3.5 MB |
| Triangles | 250,000 |
| Texture size | 2048 × 2048 max |
| Textures | 12 MB estimated GPU memory |

If `audit-glb.mjs` reports a failure, the model is too heavy. Reduce it in your
3D software before compressing — compression alone will not fix an oversized
model.

**After replacing a model**, the material names in the file must match the old
ones, or the finishes will not apply. Current material names:
`Titanium`, `Sapphire`, `Strap`.

---

## 5. Browser support

Tested and supported:

| Browser | Status |
|---------|--------|
| Chrome, Edge (desktop + Android) | Full 3D |
| Safari (macOS + iOS) | Full 3D |
| Firefox | Full 3D |
| Older browsers without WebGL | Static image fallback, all content readable |
| Visitors with "reduce motion" enabled | Simplified motion, all content readable |

The site is designed so that if the 3D cannot run, the page still works and
still sells. Roughly 1–2% of visitors see the fallback.

---

## 6. Accessibility

Target: WCAG 2.1 AA.

Tested with: keyboard-only navigation, VoiceOver (macOS/iOS), NVDA (Windows),
200% zoom, reduced-motion, and automated axe checks on <date>.

Known exceptions:
- <list any, with rationale>

Accessibility contact: <email>

---

## 7. Hosting and running costs

3D assets are larger than typical web images. Expected bandwidth:

| Monthly visits | Approx. bandwidth | Est. cost |
|----------------|-------------------|-----------|
| 1,000 | ~4 GB | included |
| 10,000 | ~40 GB | <£/$> |
| 50,000 | ~200 GB | <£/$> |

Returning visitors re-use cached assets, so real usage is usually lower. If
traffic grows past <n>, moving the 3D files to a dedicated CDN will reduce cost
— happy to quote that separately.

---

## 8. Support

**Included:** 30 days from <date> for bugs — anything that doesn't work as
specified in this document.

**Not included:** new sections, new 3D models, new animations, design changes,
CMS integration, ongoing maintenance. These are quoted separately.

To report a bug, email <address> with the page URL, the device and browser, and
a screenshot or screen recording.

**Ongoing support option:** <£/$>/month covers monitoring, dependency updates,
and up to <n> hours of changes.

---

## 9. Files you may need

| File | What it is |
|------|-----------|
| `.web3d/build.json` | Build manifest — budgets, decisions, gates |
| `.web3d/perf-report.json` | Performance test results at handoff |
| `.web3d/qa-checklist.md` | Completed pre-launch QA |
| `.web3d/direction.md` | Art direction spec |
| `public/poster-hero.webp` | The static fallback image |

Keep these. Any developer picking the project up later will need them.

---

## 10. Credentials handed over

- [ ] Repository access — <who, when>
- [ ] Hosting account — <who, when>
- [ ] Domain/DNS — <who, when>
- [ ] Analytics — <who, when>
- [ ] Any third-party services — <list>

Signed off by: ______________  Date: ______________
