---
name: web3d-ship-deploy
description: "Ship a 3D website — build config, asset CDN and caching headers, Core Web Vitals with a heavy canvas, cross-browser and real-device QA, deploy to Vercel/Netlify/Cloudflare, and the client handoff package. Use when: deploy 3D site, next build fails three.js, poor lighthouse score WebGL, cross browser 3D bugs, safari webgl issue, client handoff, launch checklist, caching glb, CDN 3D assets."
license: MIT
---

# Web3D Ship & Deploy

**Role**: Release engineer and delivery lead.

The last 10% is where 3D projects lose money. A site that works on your machine
and breaks on the client's iPad costs you a week of unbilled support and the
referral.

This skill covers everything from `next build` to the handoff document that
stops the client emailing you in month four.

---

## Build configuration

### Next.js

```js
// next.config.mjs
export default {
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['@react-three/drei'],   // drei is large; this matters
  },
  webpack(config) {
    // Import .glsl/.vs/.fs as strings
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
  async headers() {
    return [
      {
        // Content-hashed 3D assets — immutable, one year
        source: '/models/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
      {
        source: '/hdri/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};
```

**Hash your asset filenames** (`product.a3f9c1.glb`). Without a hash you cannot
use `immutable`, and without `immutable` every return visit re-validates a 3MB
file.

### Bundle discipline

drei is a large package and tree-shaking it is imperfect. Import narrowly:

```tsx
// Good
import { useGLTF } from '@react-three/drei/core/useGLTF';

// Costs more
import { useGLTF } from '@react-three/drei';
```

Check what you actually shipped:

```bash
npm i -D @next/bundle-analyzer
ANALYZE=true npm run build
```

Realistic targets for a Signature site: `three` ~150KB gz, `@react-three/fiber`
~35KB, drei (narrow imports) 20–60KB, gsap+ScrollTrigger ~40KB. That is ~300KB
before your own code — which is why the 350KB budget is tight and why the poster
image must carry the LCP.

---

## Core Web Vitals with a heavy canvas

The trap: LCP is measured on the largest *painted* element. If your canvas is
the hero, LCP waits for WebGL. Fix by making the **poster image** the LCP
element — it paints from server HTML in ~800ms.

```tsx
// The poster must be in the initial HTML, not injected by JS
<div className="canvas-root">
  <img src="/poster-hero.webp" fetchPriority="high" alt="" aria-hidden
       className="absolute inset-0 h-full w-full object-cover" />
  <ClientCanvas />   {/* dynamic, ssr: false — fades in over the poster */}
</div>
```

| Metric | Target | The 3D-specific fix |
|--------|--------|---------------------|
| LCP ≤2.5s | Poster as LCP, preloaded, WebP, ≤120KB | |
| INP ≤200ms | Keep the main thread free during load; Draco decode is the usual offender — prefer Meshopt | |
| CLS ≤0.1 | Reserve canvas height with `aspect-ratio` or fixed positioning so nothing shifts when it mounts | |
| TBT ≤200ms | Defer non-hero model loading to `requestIdleCallback` | |

Preload the hero model in the document head so it downloads during HTML parse
rather than after the JS executes — typically 300–600ms earlier:

```tsx
<link rel="preload" href="/models/product.a3f9c1.glb" as="fetch" crossOrigin="anonymous" />
```

---

## Hosting

| Host | Good for | Watch out for |
|------|----------|---------------|
| **Vercel** | Next.js default; zero-config | Bandwidth cost — a 3.5MB GLB × 10k visits is 35GB/month |
| **Netlify** | Simple, generous headers config | Same bandwidth maths |
| **Cloudflare Pages + R2** | Best economics for heavy assets | Slightly more setup |

For anything above ~5k monthly visits, put the GLBs and HDRIs on object storage
with a CDN in front (R2, S3+CloudFront, Bunny) rather than serving them from the
app host. Bandwidth is the one line item that surprises clients after launch —
mention it in the proposal.

```
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: https://client.com
Content-Type: model/gltf-binary
```

`Content-Type: model/gltf-binary` matters — some CDNs will not compress or will
mis-serve an unrecognised type. Also confirm Brotli/gzip is **not** applied to
already-compressed GLBs; it wastes CPU for ~0% gain.

---

## Cross-browser reality

Test matrix, minimum:

| Browser | Notes |
|---------|-------|
| Chrome desktop | Baseline |
| Safari macOS | Different WebGL implementation; colour can differ subtly |
| **Safari iOS** | The one that breaks. Memory limits are aggressive |
| Firefox | Shader precision differences |
| Chrome Android | Wide GPU variance |
| Edge | Usually fine (Chromium) |

Known issues worth pre-empting:

**iOS Safari memory ceiling.** Tabs are killed around 250–400MB. A 3.5MB GLB with
4K textures can exceed this once decompressed. Symptom: the tab reloads itself.
Fix: KTX2 textures, cap at 2048, dispose aggressively.

**iOS Safari context loss on tab restore.** Backgrounding the tab for a while
kills the WebGL context. Without `preventDefault()` on `webglcontextlost`, it
never comes back — the user returns to a black rectangle. Always handle it.

**Safari `100vh`.** Includes the URL bar, so a full-height canvas jumps when the
bar hides. Use `100dvh` (or `-webkit-fill-available` as a fallback).

**Firefox shader precision.** `mediump` behaves differently. If a custom shader
shows artefacts only in Firefox, that's usually it.

**Windows/Chrome ANGLE.** Some integrated GPUs fall back to software rendering
with `powerPreference: 'high-performance'` unavailable. Have the tier system
handle it — don't assume desktop means capable.

---

## Pre-launch QA

Run the full list. Write results to `.web3d/qa-checklist.md` — the ship gate
requires this file.

```bash
node scripts/qa-checklist.mjs --init          # generates the checklist
node ../web3d-performance-budget/scripts/perf-audit.mjs --url https://staging.example.com
```

Abbreviated (full version in `references/qa-checklist.md`):

**Function**
- [ ] Every CTA and form works with the canvas mounted (the canvas eats clicks)
- [ ] Anchor links and browser back/forward work with smooth scroll
- [ ] Full scroll top→bottom→top with no visual break
- [ ] Refresh at 50% scroll restores correctly

**Devices** — real hardware, not simulators
- [ ] iPhone (2 generations old minimum)
- [ ] Mid-tier Android
- [ ] iPad
- [ ] Windows laptop with integrated graphics

**Resilience**
- [ ] WebGL disabled → poster, page still sells
- [ ] Slow 3G → poster + readable copy within 3s
- [ ] `prefers-reduced-motion` → no scrubbed motion, page still complete
- [ ] Context loss (DevTools → WebGL → lose context) → recovers or falls back

**Vitals**
- [ ] Lighthouse mobile: Performance ≥75, LCP ≤2.5s, CLS ≤0.1
- [ ] Two-minute session on a phone with no thermal collapse

**Content**
- [ ] OG image is a real render, 1200×630 (link previews never show the 3D)
- [ ] Favicon, meta description, canonical URL
- [ ] Analytics firing
- [ ] 404 page exists and is on-brand

---

## Client handoff

This is where you protect your margin. Deliver a `HANDOFF.md` covering:

1. **What was built** — the scope sentence, section list, what 3D does
2. **How to run it** — install, dev, build, deploy commands
3. **What the client can change themselves** — copy, images, colours; be
   explicit about what they must not touch
4. **How to replace a 3D model** — the exact optimisation commands, with the
   budget numbers. If you skip this, they will drop a 40MB export in and then
   tell you the site broke.
5. **Asset budgets** — the numbers from the manifest, in plain language
6. **Browser support statement** — what is tested, what degrades
7. **Accessibility statement** — conformance target and known exceptions
8. **Hosting and bandwidth** — expected cost at their traffic level
9. **What's in scope for support** — 30 days of bug fixes; new features are a
   new engagement. Say this in writing.

Template in `references/handoff-template.md`.

The single highest-value item is #4. It converts "the site is broken" support
requests into the client following instructions.

---

## Ship gate

- [ ] Perf report passing on the mobile profile (`.web3d/perf-report.json`)
- [ ] QA checklist complete (`.web3d/qa-checklist.md`)
- [ ] Real-device testing done on at least three devices
- [ ] Assets on CDN with immutable caching and hashed filenames
- [ ] Lighthouse mobile ≥75 performance
- [ ] `HANDOFF.md` written and delivered
- [ ] Repo transferred or access granted
- [ ] Final invoice sent

---

## Anti-patterns

**Deploying without testing on a real phone.** Simulators do not reproduce
memory limits, thermal behaviour, or GPU differences.

**Serving unhashed assets with long cache headers.** You will not be able to
update the model without a query-string hack.

**Letting the canvas be the LCP element.** Guarantees a poor Lighthouse score
regardless of how fast the site actually feels.

**Handing over without model-replacement instructions.** The most predictable
source of unbilled support hours.

**No 30-day support boundary in writing.** "Can you just quickly…" for six
months.

**Shipping dev tooling.** `r3f-perf`, `<Stats />`, leva panels, `OrbitControls`
left in for debugging. Grep for them before the build.

---

## Composes with

- `web3d-performance-budget` — supplies the perf report the ship gate requires
- `web3d-interaction-ux` — supplies the fallback and accessibility items in QA
- `web3d-asset-pipeline` — asset hashing and CDN layout
- `web3d-build-orchestrator` — closes the final gate and archives the manifest
