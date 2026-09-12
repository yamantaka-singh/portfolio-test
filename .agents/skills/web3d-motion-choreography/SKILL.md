---
name: web3d-motion-choreography
description: "Choreograph movement on a 3D website — scroll-scrubbed camera paths, GSAP ScrollTrigger with Lenis smooth scroll, useFrame animation, state transitions, GLTF animation clips, and easing that matches the art direction. Use when: scroll animation 3D, gsap scrolltrigger three.js, lenis smooth scroll, camera moves on scroll, animation feels janky, scroll scrub, useFrame animation, parallax 3D, animate the model."
license: MIT
---

# Web3D Motion Choreography

**Role**: Motion director.

Motion is where a 3D site earns its price and where most of them break. Two
things separate good from bad, and neither is about which library you pick:

1. **Everything is driven by one clock.** One scroll source, one frame loop.
   Two animation systems fighting over the same object is the cause of nearly
   every "it's janky and I don't know why".
2. **Motion is frame-rate independent.** A `lerp(a, b, 0.1)` inside `useFrame`
   moves twice as fast on a 120Hz laptop as on a 60Hz one. Your site literally
   feels different on different hardware and you cannot see it on your own
   machine.

---

## The stack

```bash
npm i gsap lenis
```

| Layer | Tool | Owns |
|-------|------|------|
| Scroll normalisation | **Lenis** | Smooth scroll, one progress value |
| Timeline / sequencing | **GSAP + ScrollTrigger** | DOM animation, discrete beats, scrubbed timelines |
| Per-frame 3D | **useFrame + maath easing** | Camera, object transforms, damped follows |
| Baked animation | **GLTF clips via useAnimations** | Character/mechanism animation authored in Blender |

Do **not** also add Framer Motion for 3D, and do not use drei's
`<ScrollControls>` alongside Lenis. Pick one scroll owner.

---

## Wiring Lenis + GSAP + R3F to one clock

This is the setup. Get it right once and everything downstream is easy.

```tsx
// lib/useSmoothScroll.ts
'use client';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useSmoothScroll() {
  const progress = useRef(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });

    lenis.on('scroll', (e: { progress: number }) => { progress.current = e.progress; });
    // Let ScrollTrigger read Lenis's virtual scroll position
    lenis.on('scroll', ScrollTrigger.update);

    // One RAF driving both. GSAP's ticker is the single clock.
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return progress;
}
```

**`gsap.ticker.lagSmoothing(0)`** is essential. By default GSAP detects a lag
spike and skips time forward to "catch up", which makes a scrubbed 3D scene
teleport after any hitch. Disabling it keeps scrub and scroll in lockstep.

R3F reads `progress.current` inside `useFrame`. It is a ref, so scroll never
triggers a React render.

Full implementation: `assets/useSmoothScroll.ts`.

---

## The scroll → 3D contract

The art-direction spec gives you a section table. Turn it into keyframes and
sample them:

```ts
const PATH = [
  { at: 0.00, pos: [0, 0.6, 5.0] },
  { at: 0.42, pos: [1.8, 0.2, 2.4] },
  { at: 1.00, pos: [0, 0.6, 5.0] },
];
```

Then damp toward the sampled value rather than snapping to it:

```tsx
useFrame((state, delta) => {
  const dt = Math.min(delta, 1 / 30);      // clamp after tab-restore spikes
  sample(progress.current, out);
  easing.damp3(state.camera.position, out.pos, 0.28, dt);
});
```

Damping on top of Lenis's own smoothing gives the "heavy camera on a dolly"
feel. Without it, the camera is welded to the scroll bar and feels cheap.

`smoothTime` values: 0.1 crisp · 0.25 default · 0.5 heavy · 1.0 dreamlike.
Match these to the motion adjectives from the direction spec.

---

## Easing, mapped to art direction

| Adjectives | GSAP ease | maath smoothTime | Duration |
|-----------|-----------|------------------|----------|
| crisp, snappy, precise | `power3.out` | 0.12 | 0.3–0.5s |
| heavy, inevitable, unhurried | `power2.inOut` | 0.45 | 1.2–2.0s |
| floating, organic, drifting | `sine.inOut` | 0.8 | 2.0–4.0s |
| mechanical, staged, deliberate | `power4.inOut` | 0.2 | 0.6–0.9s |

Rules that hold regardless:

- **Entrances use `out` easing. Exits use `in`.** Things arrive decisively and
  leave reluctantly.
- **Never `linear`** except for continuous rotation and scroll scrub.
- **Never `elastic` or `bounce` on a premium site.** They read as playful, which
  is almost never the brief for a $3,000 build.
- **Stagger everything.** 60–120ms between siblings. Simultaneous animation is
  the loudest signal of an amateur build.

---

## Four motion patterns

Full code in `assets/motion-patterns.tsx`.

### 1. Scrubbed camera path

Camera position driven directly by scroll, damped. The backbone of Blueprint A
and B sites. Covered above.

### 2. Section beats (discrete, not scrubbed)

Some things should *happen* at a scroll position rather than track it:

```tsx
useEffect(() => {
  const st = ScrollTrigger.create({
    trigger: '#section-3',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      gsap.to(materialRef.current, {
        emissiveIntensity: 2.4, duration: 0.9, ease: 'power3.out',
      });
    },
  });
  return () => st.kill();
}, []);
```

`once: true` matters. Re-triggering a reveal every time the user scrolls back up
makes the site feel twitchy.

### 3. Idle life

A completely static object reads as a broken image. Give it minimum viable life:

```tsx
useFrame((state) => {
  const t = state.clock.elapsedTime;
  ref.current.rotation.y = t * 0.06;                 // slow, constant
  ref.current.position.y = Math.sin(t * 0.6) * 0.03; // barely perceptible float
});
```

If the idle animation is *noticeable*, it is too strong. It should register only
when it stops.

### 4. State transitions (configurator, hover, focus)

Never `if (hovered) scale = 1.1`. Always damp:

```tsx
useFrame((_, dt) => {
  easing.damp3(ref.current.scale, hovered ? 1.06 : 1.0, 0.15, dt);
  easing.dampC(materialRef.current.color, hovered ? '#FF5B2E' : '#C8CDD4', 0.2, dt);
});
```

---

## GLTF animation clips

For mechanisms and characters authored in Blender:

```tsx
const { scene, animations } = useGLTF('/models/watch.glb');
const { actions, mixer } = useAnimations(animations, scene);

useEffect(() => {
  const a = actions['Assemble'];
  if (!a) return;
  a.play();
  a.paused = true;                     // we scrub it manually
  a.clampWhenFinished = true;
}, [actions]);

useFrame(() => {
  const a = actions['Assemble'];
  if (!a) return;
  const p = sectionProgress(progress.current, 0.18, 0.42);
  a.time = a.getClip().duration * p;   // scrub the clip with scroll
  mixer.update(0);                     // 0 delta: we set time directly
});
```

Scrubbing a baked clip is far more reliable than reimplementing a mechanism's
motion in code, and it lets the client's 3D artist own the animation.

`mixer.update(0)` after setting `time` is required — without it the pose does
not refresh.

---

## Page transitions

On a persistent-canvas site, route changes should not remount the canvas. Fade
the DOM, move the camera:

```tsx
const router = useRouter();
const go = (href: string) => {
  const tl = gsap.timeline();
  tl.to('main', { opacity: 0, duration: 0.35, ease: 'power2.in' })
    .call(() => router.push(href))
    .to('main', { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 });
  // camera target changes via the rig reading the new route's keyframes
};
```

The 3D staying alive across a route change is a detail that costs an hour and
reads as expensive.

---

## Debugging janky motion

Work down this list in order:

1. **Is scroll progress in React state?** → Move it to a ref. This is the
   single most common cause.
2. **Is anything using raw `lerp` with a fixed alpha in `useFrame`?** → Replace
   with `easing.damp*`.
3. **Is `gsap.ticker.lagSmoothing(0)` set?** → Without it, every hitch causes a
   time jump.
4. **Are objects allocated inside `useFrame`?** → `new THREE.Vector3()` at 60fps
   is 3,600 allocations/second and guaranteed GC stutter. Hoist to module scope.
5. **Are two systems writing the same property?** → GSAP tween and `useFrame`
   both setting `camera.position` will fight silently. One owner.
6. **Is `delta` clamped?** → After a backgrounded tab, delta can be seconds and
   objects teleport.
7. **Is `frameloop="demand"` set on a continuously animating scene?** → It will
   only animate on pointer move.
8. **Are ScrollTriggers being killed on unmount?** → Orphaned triggers in an SPA
   accumulate and each one runs every scroll event.

If all eight are clean and it still stutters, it is a render cost problem, not a
motion problem — go to `web3d-performance-budget`.

---

## Reduced motion

```tsx
const reduced = useReducedMotion();

// Not "disable all animation" — that leaves a dead page.
// Keep state changes, remove continuous and parallax motion.
useFrame((state, dt) => {
  if (reduced) {
    easing.damp3(camera.position, staticFramingForSection(progress.current), 0.05, dt);
    return;                      // no idle rotation, no pointer parallax
  }
  // full choreography
});
```

Reduced motion means fewer, smaller, faster movements — not a static page. Jump
cuts between section framings are fine; continuous scrubbing and parallax are
not.

---

## Anti-patterns

**Two scroll systems.** Lenis + `<ScrollControls>`, or Lenis + native anchor
scrolling, will fight. One owner.

**Animating on every scroll event without RAF.** Scroll events fire faster than
frames on some browsers. Always read the value in `useFrame`/RAF.

**Scroll-jacking.** Hijacking scroll so one wheel gesture advances a whole
section makes users feel trapped and hurts every metric. Smooth scroll is fine;
taking scroll away is not.

**Animation that blocks reading.** If copy is still moving when the user's eye
arrives, they wait. Text should be settled within 400ms of entering the
viewport.

**Everything animating at once on load.** Stagger by 80–120ms. The hero
sequence should have a visible order.

**Long scrub distances.** If the user scrolls three viewport heights and the
camera moves ten centimetres, they will think the page is broken. Every
viewport-height of scroll needs visible change.

---

## Composes with

- `web3d-art-direction` — supplies motion adjectives and the section table
- `web3d-scene-architect` — supplies `CameraRig` and `useScrollProgress`
- `web3d-interaction-ux` — reduced-motion source, pointer state
- `web3d-performance-budget` — motion is usually where dropped frames surface first
