# Pre-launch QA — 3D website

Copy into `.web3d/qa-checklist.md` and tick as you go. The ship gate requires
this file to exist and be complete.

Tester: ______________  Date: ______________  Build: ______________

---

## 1. Function with the canvas mounted

- [ ] Every button, link, and form on the page is clickable
- [ ] Contact/lead form submits and the confirmation is visible
- [ ] Nav links scroll to the right sections
- [ ] Anchor links (`#section`) work with smooth scroll enabled
- [ ] Browser back/forward restores scroll position sensibly
- [ ] Refreshing at 50% scroll doesn't leave the 3D in a broken state
- [ ] Text is selectable everywhere it should be
- [ ] Browser find-in-page (Cmd/Ctrl+F) finds and scrolls to text
- [ ] Right-click works (the canvas doesn't swallow context menu)

> The canvas eating clicks is the most common launch-day bug. Test every
> interactive element, not a sample.

## 2. Full scroll pass

- [ ] Top → bottom → top with no visual break, snap, or flash
- [ ] Camera never ends up somewhere unintended
- [ ] No section where the object disappears unexpectedly
- [ ] Objects load before their section is reached (no pop-in)
- [ ] Fast scroll (flick to bottom) doesn't break state
- [ ] Slow scroll shows continuous, not stepped, motion

## 3. Devices — real hardware only

| Device | Loads | 30fps+ | Layout | Touch | Notes |
|--------|-------|--------|--------|-------|-------|
| iPhone (2 gens old) | ☐ | ☐ | ☐ | ☐ | |
| Mid-tier Android | ☐ | ☐ | ☐ | ☐ | |
| iPad | ☐ | ☐ | ☐ | ☐ | |
| Windows + integrated GPU | ☐ | ☐ | ☐ | — | |
| MacBook | ☐ | ☐ | ☐ | — | |

- [ ] Vertical drag scrolls the page (doesn't rotate the model)
- [ ] Pinch-zoom is not disabled
- [ ] Touch targets ≥44px
- [ ] Landscape orientation doesn't break the layout
- [ ] Safari `100dvh` — no jump when the URL bar hides

## 4. Browsers

- [ ] Chrome desktop
- [ ] Safari macOS
- [ ] **Safari iOS** (the one that breaks)
- [ ] Firefox
- [ ] Chrome Android
- [ ] Edge

Check specifically: colours match across browsers, custom shaders render
identically, no Firefox precision artefacts.

## 5. Resilience

- [ ] WebGL disabled (`chrome://flags` → Disable WebGL) → poster shows, page
      still communicates everything
- [ ] Slow 3G throttling → poster + readable headline within 3s
- [ ] `prefers-reduced-motion: reduce` → no scrubbed camera, no parallax, page
      still complete and navigable
- [ ] Forced context loss (DevTools → Rendering, or the
      `WEBGL_lose_context` extension) → recovers or shows the poster
- [ ] A 404 on the GLB → poster, not a black canvas
- [ ] Tab backgrounded for 5 minutes, then restored → still works
- [ ] Two minutes of continuous scrolling on a phone → no thermal collapse,
      no tab reload

## 6. Accessibility

- [ ] Full keyboard traverse of the page, no trap
- [ ] Focus-visible ring is visible against the dark canvas
- [ ] Screen reader (VoiceOver/NVDA) reads the whole page coherently
- [ ] Canvas is `aria-hidden`
- [ ] Every 3D interaction has a DOM equivalent
- [ ] Text contrast passes at the brightest frame of the scroll
- [ ] Zoom to 200% — nothing clipped or overlapping
- [ ] Nothing flashes more than 3× per second

## 7. Performance

- [ ] `node perf-audit.mjs --url <staging>` passes on the mobile profile
- [ ] Lighthouse mobile: Performance ≥75
- [ ] LCP ≤2.5s · CLS ≤0.1 · TBT ≤200ms
- [ ] Draw calls, triangles, VRAM within manifest budgets
- [ ] `gl.info.memory` returns to baseline after navigating away and back
- [ ] Bundle within budget (`ANALYZE=true npm run build`)

## 8. Assets and caching

- [ ] All GLBs compressed (Meshopt or Draco) and verified with `audit-glb.mjs`
- [ ] Textures KTX2 or WebP, ≤2048
- [ ] Filenames content-hashed
- [ ] `Cache-Control: public, max-age=31536000, immutable` on `/models` and `/hdri`
- [ ] `Content-Type: model/gltf-binary` served correctly
- [ ] CORS headers present if assets are on a separate domain
- [ ] Poster image ≤120KB, WebP, `fetchPriority="high"`

## 9. Content and SEO

- [ ] Page title and meta description
- [ ] OG image is a real 1200×630 render (link previews never show WebGL)
- [ ] Twitter card tags
- [ ] Canonical URL
- [ ] Favicon set (including 180×180 apple-touch-icon)
- [ ] `robots.txt` and sitemap
- [ ] All copy proofread by the client
- [ ] 404 page exists and is on-brand
- [ ] Analytics firing (verify a real event, don't assume)
- [ ] Cookie/consent banner if required, and it doesn't sit under the canvas

## 10. Dev tooling removed

Grep the codebase:

- [ ] `r3f-perf` / `<Perf` — removed or `NODE_ENV` gated
- [ ] `<Stats` — removed
- [ ] `leva` — removed
- [ ] `<OrbitControls` — removed, or constrained and intentional
- [ ] `<axesHelper` / `<gridHelper` / `<Grid` — removed
- [ ] `console.log` — removed
- [ ] `<Environment background>` left on by accident
- [ ] Source maps — decide deliberately whether to ship them

```bash
grep -rnE "r3f-perf|<Stats|leva|axesHelper|gridHelper|console\.log" src/
```

## 11. Handoff

- [ ] `HANDOFF.md` written and delivered
- [ ] Repository transferred or access granted
- [ ] Environment variables documented
- [ ] Deploy credentials handed over
- [ ] Model-replacement instructions included with exact commands
- [ ] Support boundary stated in writing (30 days bugs; features = new scope)
- [ ] Final invoice sent

---

## Sign-off

Everything above ticked, or exceptions listed here with rationale:

```
Exception:
Rationale:
Agreed by:
```
