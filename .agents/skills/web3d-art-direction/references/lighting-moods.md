# Lighting moods — concrete rigs

Lighting is the single highest-leverage variable in perceived quality. Each mood
below is a complete, copy-ready R3F rig. Pick one, tune intensities, do not blend.

Universal setup for all moods:

```tsx
<Canvas
  shadows
  dpr={[1, 2]}
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
  camera={{ fov: 35, position: [0, 0.6, 5] }}
>
```

`ACESFilmicToneMapping` is non-negotiable. `NoToneMapping` is why untouched
Three.js scenes look flat and blown out.

---

## Studio — product, trustworthy, clean

```tsx
import { Environment, ContactShadows } from '@react-three/drei';

<>
  <Environment preset="studio" environmentIntensity={0.45} />
  <directionalLight
    position={[4, 6, 4]} intensity={2.4} color="#FFF3E6"
    castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}
  />
  <directionalLight position={[-5, 2, -3]} intensity={1.6} color="#7FA8FF" />
  <ambientLight intensity={0.25} />
  <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={12} blur={2.4} far={4} />
</>
```

Key at 45° above and to the side. Rim from behind-opposite at ~65% of key —
this is the light that separates the object from the background and it is the
one beginners omit.

---

## Golden — warm, human, lifestyle

```tsx
<>
  <Environment preset="sunset" environmentIntensity={0.7} />
  <directionalLight
    position={[6, 2.5, 3]} intensity={2.6} color="#FFD9A0"
    castShadow shadow-mapSize={[2048, 2048]} shadow-normalBias={0.02}
  />
  <directionalLight position={[-4, 1, -4]} intensity={1.2} color="#FF9B5C" />
  <ambientLight intensity={0.35} color="#FFE8CC" />
  <ContactShadows position={[0, -1, 0]} opacity={0.35} scale={16} blur={3.5} far={5} />
</>
```

Low key angle = long shadows. Raise `toneMappingExposure` to 1.1. Add bloom at
threshold 0.85, intensity 0.4 — enough to feel the light, not enough to smear.

---

## Moonlit — premium, mysterious, tech

```tsx
<>
  <Environment preset="night" environmentIntensity={0.3} />
  <directionalLight position={[-3, 4, -5]} intensity={2.8} color="#9DB8FF" castShadow />
  <directionalLight position={[3, 1, 4]} intensity={0.5} color="#FFFFFF" />
  <ambientLight intensity={0.12} />
  <fog attach="fog" args={['#0B0B0F', 6, 22]} />
</>
```

Rim-dominant: the *back* light is the key. Keep the front fill low — 0.4–0.6 —
so the silhouette does the work. The most forgiving mood for mediocre geometry,
because half the model is in shadow.

---

## Clinical — medical, precise, editorial

```tsx
<>
  <Environment preset="warehouse" environmentIntensity={0.9} />
  <directionalLight position={[0, 8, 2]} intensity={2.2} />
  <directionalLight position={[0, 2, 6]} intensity={1.4} />
  <directionalLight position={[-6, 3, -2]} intensity={1.0} />
  <ambientLight intensity={0.6} />
</>
```

Near-shadowless, even, no bloom, no vignette, `toneMappingExposure` 0.95.
Everything is visible, which means every material and topology flaw is visible.
Only choose this mood if the model is genuinely clean.

---

## Neon — nightlife, gaming, youth

```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing';

<>
  <color attach="background" args={['#05040A']} />
  <rectAreaLight position={[-4, 2, 2]} width={6} height={6} intensity={8} color="#FF2E88" />
  <rectAreaLight position={[4, 2, -2]} width={6} height={6} intensity={8} color="#00E5FF" />
  <ambientLight intensity={0.08} />
  <EffectComposer>
    <Bloom intensity={0.8} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
  </EffectComposer>
</>
```

`rectAreaLight` requires `RectAreaLightUniformsLib.init()` in vanilla Three.js;
R3F handles it via drei's `<Lightformer>` inside `<Environment>` if you prefer.
Bloom is the point here, but `mipmapBlur` is what keeps it from looking like a
2009 glow filter.

---

## Overcast — architectural, calm, Scandinavian

```tsx
<>
  <Environment preset="city" environmentIntensity={1.1} background blur={0.8} />
  <directionalLight position={[2, 8, 4]} intensity={0.9} castShadow shadow-bias={-0.0005} />
  <ambientLight intensity={0.5} />
  <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={20} blur={4} far={6} />
</>
```

Ambient-dominant, one weak directional for a hint of direction. `background blur`
on the Environment gives a soft gradient backdrop for free.

---

## Custom lightformers (when presets aren't enough)

drei's `<Lightformer>` lets you build an environment out of shapes — this is how
the good agency sites get bespoke reflections in metal:

```tsx
<Environment resolution={512}>
  <Lightformer form="rect" intensity={4} position={[0, 4, -6]} scale={[10, 4, 1]} color="#FFF3E6" />
  <Lightformer form="rect" intensity={2} position={[-6, 1, 2]} scale={[3, 8, 1]} rotation-y={Math.PI / 2} color="#7FA8FF" />
  <Lightformer form="circle" intensity={3} position={[4, 3, 3]} scale={2} />
</Environment>
```

Long thin rects produce the elongated highlight streaks that read as "studio
photography" on curved metal. This is a two-hour investment with an outsized
effect on perceived value.

---

## Shadow debugging

| Symptom | Cause | Fix |
|---------|-------|-----|
| Shadow acne (stripes) | Bias too low | `shadow-bias={-0.0004}`, `shadow-normalBias={0.02}` |
| Peter-panning (detached) | Bias too high | Reduce magnitude |
| Blocky shadow edges | Low map size | `shadow-mapSize={[2048, 2048]}` (not 4096 — cost is quadratic) |
| No shadow at all | Missing `castShadow`/`receiveShadow` or `shadows` on Canvas | Add all three |
| Shadow cuts off | Camera frustum too tight | Tune `shadow-camera-{left,right,top,bottom,far}` |

On mobile, prefer `<ContactShadows>` or a baked shadow plane over real shadow
maps. A 2048 shadow map costs more than most people's entire frame budget on a
mid-tier Android.
