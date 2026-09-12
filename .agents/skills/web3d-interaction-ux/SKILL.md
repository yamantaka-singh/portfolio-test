---
name: web3d-interaction-ux
description: "Make a 3D website usable — pointer events and raycasting, constrained controls, hotspots, keyboard and screen-reader access, prefers-reduced-motion, no-WebGL fallbacks, loading sequences, and mobile touch behaviour. Use when: 3D site not accessible, canvas blocking clicks, orbit controls, raycasting, hover 3D object, hotspot, WebGL fallback, reduced motion 3D, loading screen 3D, touch gestures canvas."
license: MIT
---

# Web3D Interaction & UX

**Role**: Interaction designer for spatial interfaces.

3D websites fail usability in predictable, specific ways: the canvas eats
clicks, users can't tell an object is interactive, orbit controls let people get
lost, there's no keyboard path, and 8% of visitors get a black rectangle.

None of these are hard to fix. All of them are routinely shipped.

This is also the difference between a site the client shows their board and a
site the client quietly replaces in six months.

---

## Rule 1 — the canvas must not eat the DOM

```css
.canvas-root { pointer-events: none; }
```

Then opt in per-object:

```tsx
<group onPointerOver={...} style={{ pointerEvents: 'auto' }}>
```

Or, more reliably, toggle the wrapper only while the pointer is over an
interactive region:

```tsx
const [interactive, setInteractive] = useState(false);
<div className="canvas-root" style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
```

**Test every single CTA on the page after adding the canvas.** A full-viewport
canvas with default pointer events silently kills every button underneath it,
and it will not show up until someone tries to submit the contact form.

---

## Rule 2 — raycasting is expensive, scope it

Every pointer move raycasts against every mesh with a handler. On a 200-object
scene that is real cost.

```tsx
// Bad: handlers on the whole model
<primitive object={scene} onPointerOver={...} />

// Good: an invisible low-poly proxy
<mesh visible={false} onPointerOver={...}>
  <boxGeometry args={[1.2, 0.6, 1.2]} />
</mesh>
```

Also:

```tsx
<AdaptiveEvents />                        // drei: throttles raycasts during movement
<mesh raycast={() => null} />             // opt a mesh out of raycasting entirely
```

Set `raycast={() => null}` on everything decorative. It is the cheapest
interaction optimisation available.

---

## Rule 3 — signal interactivity

Users do not know a 3D object is clickable. Three signals, use at least two:

```tsx
onPointerOver={(e) => {
  e.stopPropagation();               // prevents parent handlers double-firing
  setHovered(true);
  document.body.style.cursor = 'pointer';   // 1. cursor
}}
```

2. **Visual response** — scale 1.05, an emissive lift, or an outline. Damped,
   0.15s.
3. **A persistent affordance** — a hotspot dot, a label, a subtle pulse.
   Necessary if the interaction is core to the page.

```tsx
// Hotspot that stays readable at any camera angle
<Html center distanceFactor={8} occlude position={[0.5, 0.3, 0.2]}>
  <button className="hotspot" aria-label="Sapphire crystal">
    <span className="hotspot__dot" />
  </button>
</Html>
```

Always clean up the cursor on unmount — a stuck `cursor: pointer` after
navigating away is a small bug that reads as sloppiness.

---

## Rule 4 — constrain controls, or don't ship them

`<OrbitControls />` with defaults lets users flip the camera under the floor,
zoom into the interior, and lose the art direction entirely. If you need user
rotation:

```tsx
<OrbitControls
  enableZoom={false}
  enablePan={false}
  minPolarAngle={Math.PI * 0.35}
  maxPolarAngle={Math.PI * 0.6}
  minAzimuthAngle={-Math.PI * 0.35}
  maxAzimuthAngle={Math.PI * 0.35}
  rotateSpeed={0.4}
  enableDamping
  dampingFactor={0.08}
  makeDefault
/>
```

Plus auto-return to the hero framing after 2.5s of idle — this is what stops a
turntable from ending up at a bad angle in every screenshot the client takes.
Implementation in `assets/ConstrainedControls.tsx`.

Better still: a **drag-to-rotate on the object only**, not on the whole canvas.
Then vertical drag still scrolls the page, which is what mobile users expect.

---

## Rule 5 — mobile touch

The conflict: vertical drag means "scroll the page" to a user and "rotate the
object" to `OrbitControls`. Resolve it explicitly.

```tsx
<OrbitControls
  enableRotate
  touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
/>
```

But better for a marketing site: **horizontal drag rotates, vertical drag
scrolls**.

```tsx
const start = useRef({ x: 0, y: 0, axis: null as null | 'x' | 'y' });

onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY, axis: null }; }}
onPointerMove={(e) => {
  const dx = e.clientX - start.current.x;
  const dy = e.clientY - start.current.y;
  if (!start.current.axis && Math.hypot(dx, dy) > 8) {
    start.current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  }
  if (start.current.axis === 'x') {
    e.stopPropagation();
    rotateBy(dx);
  }
  // axis 'y': do nothing, let the page scroll
}}
```

Also: **touch targets ≥ 44×44 CSS pixels.** A 3D hotspot rendered as an 8px dot
is unhittable on a phone. Give the `<Html>` button padding even if the visible
dot is small.

---

## Rule 6 — accessibility

3D content is invisible to assistive technology. The canvas is
`aria-hidden="true"` and everything meaningful must exist in the DOM.

```tsx
<div className="canvas-root" aria-hidden="true">
  <Canvas>...</Canvas>
</div>

{/* The real, accessible content */}
<section>
  <h2>Aerospace-grade titanium case</h2>
  <p>Machined from a single billet, 8.4mm thin.</p>
</section>
```

For interactive 3D, provide a parallel DOM control path:

```tsx
<div role="group" aria-label="Product finish">
  {finishes.map((f) => (
    <button
      key={f.id}
      aria-pressed={finish === f.id}
      onClick={() => setFinish(f.id)}
    >
      {f.label}
    </button>
  ))}
</div>
<p aria-live="polite" className="sr-only">Finish changed to {currentLabel}.</p>
```

Every 3D interaction needs a keyboard-reachable equivalent. A hotspot on the
model is fine as long as there's also a list of the same hotspots in the DOM.

Full checklist in `references/accessibility.md`.

---

## Rule 7 — reduced motion

```tsx
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}
```

What to change (not "turn everything off" — that leaves a dead page):

| Keep | Remove |
|------|--------|
| State-change transitions (short) | Continuous rotation and float |
| Discrete camera framing per section | Scroll-scrubbed camera movement |
| Fades and opacity | Parallax, pointer-follow |
| Hover feedback | Auto-playing sequences |

Roughly 3–5% of users have this preference set, and for some of them heavy
scroll-linked 3D causes actual nausea.

---

## Rule 8 — fallbacks

Three failure modes, three fallbacks:

```tsx
// 1. No WebGL (old browsers, some corporate/locked-down devices, ~1-2%)
if (!hasWebGL()) return <Poster />;

// 2. Context lost (memory pressure, backgrounded tab, driver reset)
gl.domElement.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();            // WITHOUT this, the context never restores
  setShowPoster(true);
});
gl.domElement.addEventListener('webglcontextrestored', () => setShowPoster(false));

// 3. Load failure (CDN hiccup, 404, corrupt GLB)
<ErrorBoundary fallback={<Poster />}>
  <Suspense fallback={null}><Model /></Suspense>
</ErrorBoundary>
```

The poster is **the same image in all three cases** and it should be a real
render of the hero frame — so the fallback looks like a design decision rather
than an error state. Generate it once with `renderer.domElement.toDataURL()`
during development and save it as WebP.

---

## The loading sequence

The first 2 seconds decide whether the site feels premium or broken.

| Time | What the user sees |
|------|--------------------|
| 0ms | Poster image (server-rendered, LCP element) + headline text, already readable |
| 0–400ms | Nothing new. No spinner. |
| 400ms+ | Thin determinate progress line, accent colour, bottom edge |
| 100% | Hold 150ms |
| +150ms | Cross-fade poster → canvas, 600ms |
| after fade | Hero animation begins |

Details and code in `web3d-asset-pipeline/references/loaders.md`.

**Never a centred spinning percentage.** It puts a clock on the user's wait.
**Never a fake progress bar.** People recognise it.

---

## Anti-patterns

**A canvas that intercepts every click.** Covered above, and it happens on most
first builds.

**Orbit controls with defaults in production.** Users end up looking at the
underside of a shoe and think the site is broken.

**No visible affordance for interactive objects.** If it's clickable and looks
like it isn't, it isn't.

**Scroll-jacking on mobile.** Taking over touch scroll is the fastest way to
make a phone user leave.

**Cursor left as `pointer` after unmount.** Reset it in the cleanup.

**Autoplaying audio with the 3D.** Never, on any commercial site, without an
explicit control.

**Text rendered inside the 3D scene as geometry.** It is unselectable,
unsearchable, invisible to screen readers, and blurry. Use `<Html>` or, better,
real DOM over the canvas.

**No focus-visible styles on `<Html>` buttons.** Keyboard users land on an
invisible target.

---

## Composes with

- `web3d-scene-architect` — the pointer-events setup on the canvas wrapper
- `web3d-motion-choreography` — consumes reduced-motion state
- `web3d-asset-pipeline` — supplies the progress source for the loading sequence
- `web3d-performance-budget` — `<AdaptiveEvents />` and raycast scoping overlap
- `web3d-ship-deploy` — the QA pass verifies every item here
