# Accessibility for 3D websites

A WebGL canvas is a single opaque element to assistive technology. Everything
meaningful must also exist in the DOM. This is not optional for commercial work —
in the EU, the European Accessibility Act applies to consumer-facing
e-commerce, and in the US, ADA Title III web claims are routine. Clients who
sell to enterprise will be asked for a VPAT.

## The core principle

**The canvas is decoration. The DOM is the content.**

```tsx
<div className="canvas-root" aria-hidden="true" role="presentation">
  <Canvas>{/* 3D */}</Canvas>
</div>

<main>
  <h1>The Meridian 38</h1>
  <p>Machined from a single billet of grade-5 titanium. 8.4mm thin.</p>
  {/* Everything the 3D communicates, also said here */}
</main>
```

If you remove the canvas entirely, the page should still make complete sense.
That is the test.

## Checklist

### Structure
- [ ] Canvas wrapper has `aria-hidden="true"`
- [ ] Every claim the 3D makes visually is also in text
- [ ] Heading order is correct and uninterrupted by the canvas
- [ ] Page is fully usable with CSS and JS disabled (poster + text)

### Keyboard
- [ ] Every interactive 3D element has a DOM equivalent that is tabbable
- [ ] Focus order follows visual order
- [ ] `:focus-visible` styles are present and visible against the dark canvas
- [ ] No keyboard trap in the canvas or in `<Html>` overlays
- [ ] Escape closes any 3D-triggered overlay

```css
/* Focus rings need to survive a dark 3D background */
:focus-visible {
  outline: 2px solid #FF5B2E;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgb(255 91 46 / .25);
}
```

### Motion
- [ ] `prefers-reduced-motion: reduce` removes continuous and scroll-scrubbed motion
- [ ] Nothing flashes more than 3 times per second (seizure risk — WCAG 2.3.1)
- [ ] No autoplaying video-like sequence longer than 5s without a pause control
- [ ] Parallax and pointer-follow disabled under reduced motion

### Contrast
- [ ] Text is never placed directly on a moving 3D background without a scrim
- [ ] Body text ≥ 4.5:1, large text ≥ 3:1, against the *worst case* frame
- [ ] UI controls and focus indicators ≥ 3:1

```css
/* Scrim behind copy that overlays the canvas */
.scrim {
  background: linear-gradient(to right, rgb(11 11 15 / .88), rgb(11 11 15 / .0) 65%);
}
```

Check contrast against the brightest frame the 3D produces, not against your
static screenshot. Scrub the whole scroll and screenshot the worst case.

### Touch
- [ ] Interactive targets ≥ 44×44 CSS px (WCAG 2.5.8 AAA / Apple HIG)
- [ ] Vertical page scroll is never captured by the canvas
- [ ] Pinch-zoom is not disabled (`user-scalable=no` is a WCAG failure)

### Announcements
- [ ] State changes driven by 3D interaction are announced

```tsx
<p aria-live="polite" className="sr-only">
  {finishLabel} finish selected.
</p>
```

```css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

## Parallel control paths

Anything a user can do by dragging the model, they must also be able to do with
a button.

```tsx
{/* 3D path */}
<DragRotate>
  <Product />
</DragRotate>

{/* Equivalent DOM path — visible, not hidden */}
<div role="group" aria-label="View product from">
  <button onClick={() => setView('front')} aria-pressed={view === 'front'}>Front</button>
  <button onClick={() => setView('side')}  aria-pressed={view === 'side'}>Side</button>
  <button onClick={() => setView('back')}  aria-pressed={view === 'back'}>Back</button>
</div>
```

Making these visible rather than screen-reader-only helps everyone — plenty of
sighted mouse users never discover that a model is draggable.

## Hotspots

A hotspot on the model is fine as an enhancement. It is not sufficient on its
own.

```tsx
{/* In-scene */}
{features.map((f) => <Hotspot key={f.id} {...f} />)}

{/* In-DOM: the same list, real content */}
<ul>
  {features.map((f) => (
    <li key={f.id}>
      <h3>{f.label}</h3>
      <p>{f.description}</p>
    </li>
  ))}
</ul>
```

## Testing

| What | How |
|------|-----|
| Keyboard | Unplug the mouse. Complete the primary task. |
| Screen reader | VoiceOver (Cmd+F5) on macOS, NVDA on Windows. Listen to the whole page. |
| Reduced motion | macOS: System Settings → Accessibility → Display → Reduce motion |
| No WebGL | Chrome: `--disable-3d-apis`, or `chrome://flags` → Disable WebGL |
| Contrast | Scrub the full scroll, screenshot the brightest frame, run it through a contrast checker |
| Zoom | Browser zoom to 200%. Nothing should be clipped or overlap. |
| Automated | axe DevTools or Lighthouse — catches maybe 30% of issues, do the manual passes too |

## What automated tools will not catch

- Text over a 3D background that only fails contrast at certain scroll positions
- An interactive object with no affordance
- Motion that causes nausea
- A keyboard path that technically exists but is 40 tab stops from the content
- A `<Html>` tooltip that is reachable but announces nothing useful

These are the ones that matter, and they need a human running the checklist.

## Delivering the artifact

For commercial work, leave the client an accessibility statement listing what
was tested, what conforms, and what does not. It is 20 minutes of writing and it
is what a procurement team asks for. Include:

- Conformance target (WCAG 2.1 AA)
- Known exceptions with rationale
- Test date, browsers, and assistive tech used
- Contact route for accessibility issues
