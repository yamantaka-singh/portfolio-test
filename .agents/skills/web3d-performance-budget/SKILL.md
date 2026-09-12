---
name: web3d-performance-budget
description: "Hit frame-rate and load budgets on real devices — device tiering, adaptive DPR and quality, instancing, draw-call reduction, memory disposal, profiling with renderer.info and Spector, and mobile GPU limits. Use when: three.js slow, low fps, 3D site laggy on mobile, WebGL performance, too many draw calls, instancing, GPU memory, frame drops, site crashes on phone, adaptive quality."
license: MIT
---

# Web3D Performance Budget

**Role**: Performance engineer.

A 3D site that stutters is worth less than a static page. Clients cannot
articulate why a site feels cheap, but frame drops are usually the reason.

Two truths shape everything here:

1. **Your machine is not the target.** A MacBook Pro renders scenes a Pixel 6a
   cannot. Test on the real device before phase 7, not during it.
2. **Measure, then fix.** Every hour spent optimising the wrong thing is an hour
   of the client's budget. `renderer.info` tells you where the cost is in
   thirty seconds.

---

## Budgets

Signature tier, per `.web3d/build.json`:

| Metric | Desktop | Mobile mid-tier | How to measure |
|--------|---------|-----------------|----------------|
| Frame rate | 60fps sustained | ≥30fps sustained | Stats panel over a full scroll |
| Frame time | ≤16.6ms | ≤33ms | DevTools Performance |
| Draw calls | ≤120 | ≤80 | `gl.info.render.calls` |
| Triangles | ≤500k | ≤250k | `gl.info.render.triangles` |
| Programs (shaders) | ≤25 | ≤15 | `gl.info.programs.length` |
| Texture VRAM | ≤12MB | ≤8MB | audit-glb + `gl.info.memory` |
| JS bundle (gz) | ≤350KB | same | `next build` output |
| LCP | ≤2.0s | ≤2.5s | Lighthouse, throttled |
| Time to first frame | ≤2.5s on 4G | ≤3.5s | Manual, throttled |

Write these into the manifest. A budget nobody wrote down is a preference.

---

## Step 1 — measure before touching anything

```tsx
import { Perf } from 'r3f-perf';        // npm i -D r3f-perf
{process.env.NODE_ENV === 'development' && <Perf position="top-left" />}
```

Or read the numbers directly:

```tsx
useFrame(({ gl }) => {
  if (frame++ % 60 === 0) {
    console.table({
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      programs: gl.info.programs?.length,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    });
  }
});
```

Read the diagnosis table:

| Symptom | Likely cause | Go to |
|---------|-------------|-------|
| High `calls` (>150) | Too many separate meshes/materials | Instancing & merging |
| High `triangles` (>800k) | Unoptimised geometry | `web3d-asset-pipeline` |
| High `programs` (>30) | Too many unique materials, or shader recompiles | Material reuse |
| `geometries`/`textures` climbing over time | Memory leak | Disposal |
| Low fps, low everything else | Fragment-bound: DPR, post-processing, or overdraw | Fill rate |
| Stutter every few seconds | GC — allocations in `useFrame` | Allocation audit |
| One-off 200ms freeze | Shader compilation | Preload / warm-up |

**Fragment-bound is the most common case on mobile and the least intuitive.**
Your draw calls and triangles look fine, and the phone still crawls, because
you're rendering 1.5 megapixels through four post-processing passes.

---

## Step 2 — device tiering

Detect once at startup, then let everything read the tier.

```tsx
export type Tier = 'low' | 'mid' | 'high';

export function detectTier(gl: THREE.WebGLRenderer): Tier {
  const dbg = gl.getContext().getExtension('WEBGL_debug_renderer_info');
  const renderer = dbg ? gl.getContext().getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as any).deviceMemory ?? 4;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (/Apple (M\d|GPU)/i.test(renderer) && !mobile) return 'high';
  if (mobile && (mem <= 3 || cores <= 4)) return 'low';
  if (mobile) return 'mid';
  if (cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}
```

Static detection gets you started; **measured fallback is what actually works**.
Watch real frame times for the first 2 seconds and demote if the device can't
keep up. Full implementation in `assets/useDeviceTier.ts`.

What each tier changes:

| | low | mid | high |
|---|---|---|---|
| DPR cap | 1.0 | 1.5 | 2.0 |
| Post-processing | none | bloom + SMAA | full stack |
| Shadows | baked plane only | ContactShadows `frames={1}` | real shadow map 2048 |
| Environment | 256² or Lightformers | 512² | 1024² HDRI |
| Model LOD | low | mid | high |
| Transmission material | replaced with opaque | replaced | enabled |
| Idle animation | off | on | on |

---

## Step 3 — adaptive quality

Static tiering is not enough — thermal throttling drops a phone's performance
40% after 90 seconds. React to actual frame times.

```tsx
<AdaptiveDpr pixelated />       // drei: lowers DPR under load, restores when idle
<AdaptiveEvents />              // drei: throttles raycasting while moving
```

`AdaptiveDpr` responds to R3F's internal performance regression signal. Tune the
trigger:

```tsx
<Canvas performance={{ min: 0.5, max: 1, debounce: 200 }}>
```

`min: 0.5` means it may drop to half resolution under sustained load. With
`pixelated` this is surprisingly acceptable; without it, the resolution change
is visible as a soft blur.

Custom controller for degrading more than just DPR in
`assets/useAdaptiveQuality.ts`.

---

## Step 4 — the fixes, in order of payoff

### Reduce draw calls

Each unique geometry+material pair is a draw call.

**Instancing** — hundreds of identical objects for the cost of one:

```tsx
<Instances limit={500} range={count}>
  <sphereGeometry args={[0.05, 12, 12]} />
  <meshStandardMaterial color="#C8CDD4" />
  {positions.map((p, i) => <Instance key={i} position={p} />)}
</Instances>
```

**Merging** — static geometry that shares a material:

```tsx
import { Merged } from '@react-three/drei';
// or at build time: gltf-transform join
```

**Material sharing** — twelve meshes with twelve identical materials is twelve
programs. Hoist to one material instance.

### Reduce fill rate (the mobile killer)

- Cap DPR at 2, or 1.5 on mid tier. This is the single biggest mobile lever.
- Cut post-processing passes. Each is a full-screen read+write.
- Eliminate overdraw: transparent objects stacked on transparent objects render
  every layer. Sort, or make them opaque.
- Shrink the canvas: rendering at `0.8` scale and CSS-upscaling is often
  invisible and 36% cheaper.

### Reduce shadow cost

```tsx
// Instead of a real shadow map
<ContactShadows frames={1} resolution={512} />   // bakes once
```

`frames={1}` is often 3–5fps on mobile. A 2048² shadow map re-rendered every
frame costs more than most scenes' entire geometry pass.

For a static object, bake the shadow into a texture in Blender and use a plane.
Free, and it looks better.

### Fix allocations

```tsx
// BAD — 3,600 allocations per second
useFrame(() => {
  const v = new THREE.Vector3(x, y, z);
  mesh.position.copy(v);
});

// GOOD — module scope
const _v = new THREE.Vector3();
useFrame(() => {
  mesh.position.copy(_v.set(x, y, z));
});
```

Find them: DevTools → Memory → Allocation instrumentation on timeline. A
sawtooth pattern means per-frame garbage.

### Fix shader compilation stalls

A material that first appears mid-scroll compiles then, freezing for 100–300ms.

```tsx
<Preload all />                          // drei: compiles everything during load
// or explicitly:
gl.compile(scene, camera);
```

### Fix memory leaks

```tsx
useEffect(() => () => {
  geometry.dispose();
  material.dispose();
  texture.dispose();
  renderTarget.dispose();
}, []);
```

R3F auto-disposes on unmount for declarative objects. Manually created ones,
render targets, and `useGLTF` cache entries are yours. Verify:
`gl.info.memory.geometries` should return to baseline after navigating away.

---

## Step 5 — pause when invisible

Free performance, and the difference between a site that drains a battery and
one that doesn't:

```tsx
// Pause the loop when the canvas leaves the viewport
const [visible, setVisible] = useState(true);
useEffect(() => {
  const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
  io.observe(canvasWrapper.current!);
  return () => io.disconnect();
}, []);

<Canvas frameloop={visible ? 'always' : 'never'} />
```

Also handle `visibilitychange` for backgrounded tabs. Browsers throttle RAF, but
not to zero, and a 3D site left open in a tab is a real complaint.

---

## Profiling tools

| Tool | Use for |
|------|---------|
| `r3f-perf` | Live fps, draw calls, memory, in-scene |
| Chrome DevTools Performance | Frame timeline, GC, long tasks, main-thread blocking |
| Spector.js | Frame-by-frame WebGL command capture — what is actually being drawn |
| Lighthouse (throttled) | LCP, TBT, bundle size |
| Safari Web Inspector via cable | The only accurate way to profile a real iPhone |
| Chrome remote debugging | Same for Android |

**Throttle properly.** DevTools "Mid-tier mobile" CPU throttling (4× slowdown)
plus "Fast 3G" is roughly a Pixel 6a on a train. That is your test condition,
not your desk.

---

## Anti-patterns

**Optimising before measuring.** Instancing a scene whose bottleneck is post-
processing wastes a day.

**Uncapped `devicePixelRatio`.** On a 3× phone that is 9× the fragments of DPR 1.
This is the most common single cause of "3D is fine on desktop, unusable on
mobile".

**Testing on a flagship phone.** An iPhone 16 Pro is not a representative
device. Test on a mid-tier Android that's two years old.

**Ignoring thermals.** A phone throttles after 60–90 seconds of sustained 3D.
Your 30-second test passed; the user's two-minute session did not.

**Adding `<Stats />` and calling it profiling.** FPS tells you *that* it's slow.
`renderer.info` tells you *why*.

**Shipping the dev build's `Perf` overlay.** Gate on `NODE_ENV`.

**Treating 30fps mobile as failure.** 30fps stable is fine and feels smooth.
60fps that drops to 24 is worse. Consistency beats peak.

---

## Perf gate

Close the `perf` gate only when, **on the real target device**:

- [ ] Sustained ≥30fps across the entire scroll, twice through
- [ ] No frame over 100ms after the loading sequence
- [ ] Draw calls, triangles, VRAM all inside budget (`gl.info`)
- [ ] `gl.info.memory` returns to baseline after a route change
- [ ] Two minutes of continuous use with no thermal collapse
- [ ] Lighthouse mobile: LCP ≤2.5s, TBT ≤200ms, CLS ≤0.1
- [ ] Report written to `.web3d/perf-report.json`

```bash
node scripts/perf-audit.mjs --url http://localhost:3000
```

---

## Composes with

- `web3d-asset-pipeline` — most triangle and VRAM problems are solved there
- `web3d-material-shader-lab` — post-processing is the mobile bottleneck
- `web3d-scene-architect` — renderer config and the static/driven split
- `web3d-ship-deploy` — perf report feeds the QA gate
