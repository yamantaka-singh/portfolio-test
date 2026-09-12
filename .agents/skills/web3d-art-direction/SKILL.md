---
name: web3d-art-direction
description: "Decide what a 3D website should look and feel like before any code is written — concept sentence, palette, lighting mood, motion adjectives, and the section blueprint. Turns 'make it cool' into a spec a developer can build against. Use when: 3D site concept, what should the hero look like, art direction for WebGL site, choosing a look for a three.js site, the 3D site looks cheap, reference-driven design."
license: MIT
---

# Web3D Art Direction

**Role**: Art director for 3D web.

Most 3D websites fail on direction, not on code. The geometry renders, the
scroll works, and it still looks like a tech demo. The difference between a
$600-looking site and a $3,000-looking site is almost entirely **restraint,
lighting, and one committed idea** — not polygon count.

Your job is to leave behind a written spec so specific that the scene,
material, and motion skills have nothing left to guess.

---

## When to use this standalone

- A 3D site exists and "looks cheap" — run the diagnostic below
- Starting any new build (this is Phase 1)
- Client rejected a direction and you need to move deliberately, not randomly

---

## Output: the direction spec

Produce exactly this, write it to `.web3d/direction.md` and mirror the key
fields into `.web3d/build.json` under `art`.

```markdown
# Direction — <project>

## Concept sentence
One sentence. Subject, object, behaviour. No adjectives yet.

## Why 3D
The specific thing a flat page cannot do here. If you can't answer, downgrade
to an Accent tier or drop 3D.

## Palette
- Background:  #0B0B0F   (the single most important colour on a 3D site)
- Surface:     #16161C
- Object:      #C8CDD4
- Accent:      #FF5B2E   (used once, deliberately)
- Light warm:  #FFE8CC
- Light cool:  #7FA8FF

## Lighting mood
One of: studio / golden / moonlit / clinical / neon / overcast
Key direction, rim presence, shadow softness, HDRI choice.

## Material language
Two or three words that constrain every material: e.g. "brushed, matte, cold"
or "wet, glossy, saturated".

## Motion adjectives
Three words. e.g. "heavy, inevitable, unhurried" or "crisp, snappy, precise".
These become easing curves and durations downstream.

## Section blueprint
| # | Section | Camera | Object state | Copy role |
|---|---------|--------|--------------|-----------|
| 1 | Hero | ... | ... | ... |

## References
3–5 links, each with ONE sentence on what specifically to take from it.

## Explicitly not doing
The list that saves the project. e.g. "no particles, no bloom, no orbit
controls, no autoplaying audio."
```

---

## The concept sentence

Write it before anything else, in this shape:

> "A [object] that [transforms] as you [action]."

Good:
- "A titanium watch case that assembles itself as you scroll."
- "A city block that lights up window by window as you read the case study."
- "A single liquid droplet that becomes the product silhouette on hover."

Bad:
- "A modern immersive 3D experience with particles." (no object, no behaviour)
- "Floating abstract shapes." (this is what every failed 3D site is)

If the client's product has a physical shape, the shape *is* the concept. Do not
invent abstraction to avoid the work of getting a good model.

---

## Palette, for 3D specifically

Web3D palettes are not web palettes. Three rules:

1. **The background is 70% of the frame.** Pick it first. Near-black
   (`#0B0B0F`–`#141419`) flatters almost every material and hides polygon
   artefacts. Off-white (`#F4F2EE`) reads premium and editorial but exposes
   every lighting mistake — only choose it if you will actually tune the
   lighting.
2. **The object should be low-saturation.** Colour comes from *light*, not from
   albedo. A grey object under a warm key and cool rim looks expensive; a bright
   blue object under white light looks like a default material.
3. **One accent, used once.** On the CTA, or on a single emissive detail. Two
   accents halve the impact of both.

See `references/palettes.md` for six tested 3D palettes with hex values,
matching HDRI suggestions, and what each one signals.

---

## Lighting mood

Lighting is where cheapness lives. Full reference in
`references/lighting-moods.md`; the short version:

| Mood | Signals | Rig |
|------|---------|-----|
| Studio | Product, trustworthy, clean | Large soft key 45°, fill at 0.3, rim behind at 1.2, `studio` HDRI at 0.4 |
| Golden | Warm, human, lifestyle | Low warm key, long soft shadows, `sunset` HDRI, slight bloom |
| Moonlit | Premium, mysterious, tech | Cool rim-dominant, key at 0.4, deep background, hard falloff |
| Clinical | Medical, precise, editorial | Even top light, near-zero shadow, white background, no bloom |
| Neon | Nightlife, gaming, youth | Two coloured area lights opposing, emissive geometry, heavy bloom |
| Overcast | Architectural, calm, Scandinavian | Uniform sky HDRI, ambient-dominant, soft contact shadows only |

Pick one. Do not blend two — that is how a scene ends up looking muddy and
directionless.

---

## Motion adjectives

Three words, chosen now, enforced later by `web3d-motion-choreography`:

| Adjectives | Duration | Easing | Feel |
|-----------|----------|--------|------|
| heavy, inevitable, unhurried | 1.2–2.0s | `power2.inOut` | Luxury, architecture |
| crisp, snappy, precise | 0.3–0.5s | `power3.out` | SaaS, tools, tech |
| floating, organic, drifting | 2.0–4.0s | `sine.inOut` | Wellness, art, nature |
| mechanical, staged, deliberate | 0.6–0.9s | `power4.inOut` + stagger | Engineering, hardware |

Writing this down is what prevents the "every animation is 0.8s ease-out"
default that makes a site feel generic.

---

## Section blueprint

A Signature-tier site is 4–6 sections sharing **one persistent canvas**. Never
mount a new Canvas per section — the flash of remount is instantly cheap-looking.

Standard blueprint that sells (details in `references/section-blueprints.md`):

1. **Hero** — object centre-frame, slow idle, one line of copy, no scroll cue
   competing with the object
2. **Reveal** — camera pushes in or the object opens; the "oh" moment
3. **Detail** — object off-centre, copy takes the other half, close crop on a
   material or feature
4. **Proof** — 3D recedes to background ambience; testimonials/specs take over.
   *This section is why the site converts.* Do not let 3D fight it.
5. **Close** — object returns to hero framing, CTA, accent colour appears

The rhythm is: impress → explain → prove → ask. 3D owns impress and explain,
gets out of the way for prove, and returns for ask.

---

## Diagnostic: "it looks cheap"

Run in order. Stop at the first yes.

1. **Is the background pure `#000000` or pure `#ffffff`?** → Move to `#0B0B0F`
   or `#F4F2EE`. Pure values look unconsidered and crush material detail.
2. **Is there any environment map?** → No HDRI means no reflections means
   plastic. Add `<Environment preset="city" />` and see it change instantly.
3. **Is the only light an `ambientLight` + one `directionalLight` at default
   intensity?** → That is the default-material look. Build a three-point rig.
4. **Are there contact shadows?** → Without them the object floats and reads as
   a sticker. `<ContactShadows>` or a shadow-catcher plane.
5. **Is the camera FOV 75?** → 75 is the Three.js default and it distorts.
   Product shots want 30–40. Wide environments want 45–55.
6. **Is the object dead-centre with equal margins?** → Off-centre by a third.
   Symmetry reads as unresolved.
7. **Is tone mapping still `NoToneMapping`?** → Switch to `ACESFilmicToneMapping`.
   This one line does more for perceived quality than a week of shader work.
8. **Does everything animate at once on load?** → Stagger. Simultaneity reads
   as amateur.

Nine times out of ten the fix is in this list, not in a custom shader.

---

## Anti-patterns

**Floating abstract shapes as a substitute for an idea.** If the client's
product isn't in the scene and there's no narrative reason, you are decorating,
and the client will feel it without being able to name it.

**Copying an award-site's complexity instead of its restraint.** The sites you
admire usually have *fewer* elements than you think, lit better.

**Choosing the palette in a 2D tool.** Colours behave differently under tone
mapping and an environment map. Validate in the actual scene.

**Direction by adjective pile.** "Modern, sleek, immersive, futuristic,
premium" constrains nothing. Three words maximum, and they must exclude things.

**Letting 3D fight the conversion section.** If the proof/pricing section has a
rotating object behind it, the client's leads go down and no one will know why.

---

## Composes with

- `web3d-build-orchestrator` — writes `art` block to the manifest, closes the art gate
- `web3d-scene-architect` — consumes lighting mood + FOV as a concrete rig
- `web3d-material-shader-lab` — consumes material language + palette
- `web3d-motion-choreography` — consumes motion adjectives as easing/duration presets
