# Section blueprints that sell

Five proven structures for Signature-tier 3D sites. Each is a full page plan:
what the camera does, what the object does, what the copy does, and where 3D
gets out of the way.

All of them assume **one persistent canvas** fixed behind the DOM, with sections
scrolling over it. See `web3d-scene-architect/references/persistent-canvas.md`.

---

## Blueprint A — The Reveal (physical products)

Best for: hardware, watches, audio, tools, anything with a shape.

| # | Section | Camera | Object | Copy |
|---|---------|--------|--------|------|
| 1 | Hero | fov 35, dolly out slowly | Closed, idle rotation 0.05 rad/s | Product name + one claim |
| 2 | Open | push in, orbit 40° | Opens / assembles / unfolds | Nothing — let it play |
| 3 | Detail | close crop, shallow DOF | Static, one feature lit | 3 specs, left half |
| 4 | Proof | object drifts to background, blurred | Slow idle only | Testimonials, specs table, price |
| 5 | Close | return to hero framing | Reassembles | CTA in accent colour |

The "Open" section is the whole product. Budget half your motion time there.

---

## Blueprint B — The Journey (services, agencies, story-led)

Best for: consultancies, studios, brands with a process to explain.

| # | Section | Camera | Scene |
|---|---------|--------|-------|
| 1 | Hero | wide, static | Full environment visible, ambient motion |
| 2–4 | Waypoints | camera flies along a spline, one stop per section | Elements light up / appear at each stop |
| 5 | Summit | camera pulls back to reveal the whole path | Everything visible at once |
| 6 | CTA | camera settles, scene dims | Form or booking link, 3D at 30% opacity |

Use a `CatmullRomCurve3` for the camera path and drive `curve.getPointAt(scroll)`
from scroll progress. Never animate camera position with raw lerps across six
sections — you will fight yourself on section three.

---

## Blueprint C — The Configurator (highest perceived value)

Best for: furniture, apparel, vehicles, anything with variants. Flagship tier,
but a cut-down version fits Signature.

| # | Section | Interaction |
|---|---------|-------------|
| 1 | Hero | Object on turntable, drag to rotate |
| 2 | Configure | Material/colour swatches; object updates instantly; price updates |
| 3 | Detail | Camera auto-focuses the changed part for 1.2s after each swap |
| 4 | Compare | Split view or A/B toggle |
| 5 | Order | Selection summarised in text; CTA carries the config in the URL |

Two rules that make configurators feel expensive:
- **Never reload the model on variant change.** Swap material properties on the
  existing mesh. A reload flash destroys the illusion.
- **Auto-focus the part that changed.** Users miss changes they didn't look at.

Encode state in the URL (`?finish=walnut&size=l`) — it makes the config shareable
and it is the feature clients demo to their own boss.

---

## Blueprint D — The Ambient (SaaS, B2B, content-heavy)

Best for: sites where content converts and 3D is credibility, not the product.

| # | Section | 3D role |
|---|---------|---------|
| 1 | Hero | Full-bleed abstract scene, slow, low-contrast |
| 2+ | Content | 3D fades to 15% opacity behind, or exits viewport entirely |
| Last | CTA | 3D returns at 60%, accent colour appears |

The discipline here is *subtraction*. The 3D exists to make the first three
seconds feel considered, then it must stop competing. Sites that keep an
animated scene behind pricing tables convert worse and clients rarely diagnose
why.

Mobile: consider serving a static poster for sections 2+ entirely.

---

## Blueprint E — The Single Moment (Accent tier, best value-for-effort)

One section. One idea. Everything else is a fast conventional page.

- Hero canvas, 100vh, object centred slightly off-axis
- Idle animation + pointer parallax (max 0.05 rad — subtlety is the point)
- One scroll-linked transition as the user leaves the hero (object recedes and
  fades, section 2 slides over it)
- No canvas below the fold at all

This ships in a week, loads in under two seconds, and clients regularly like it
more than the elaborate version. Offer it first.

---

## Section rhythm rules

**Never two "wow" moments in a row.** Impact needs contrast. Alternate high
motion with stillness.

**The fourth section is always the quiet one.** By section four the user has
decided whether they're interested. Give them information, not spectacle.

**Copy and object never occupy the same half of the screen.** Object left, copy
right, or vice versa — alternating down the page.

**Every section needs a reason to scroll past it.** If a section is visually
complete and self-contained, users stop there. Leave something entering frame at
the bottom edge.

---

## Mapping blueprint to scroll ranges

Write this table into `.web3d/direction.md`; `web3d-motion-choreography` consumes
it directly:

```
section 1  scroll 0.00 – 0.18   camera [0, 0.6, 5]   → [0, 0.6, 4.2]
section 2  scroll 0.18 – 0.42   camera [0, 0.6, 4.2] → [1.8, 0.2, 2.4]
section 3  scroll 0.42 – 0.62   camera [1.8, 0.2, 2.4] → [0.4, -0.3, 1.6]
section 4  scroll 0.62 – 0.84   camera [0.4, -0.3, 1.6] → [0, 0.8, 9]  (recede)
section 5  scroll 0.84 – 1.00   camera [0, 0.8, 9]   → [0, 0.6, 5]
```

Overlapping ranges by ~0.02 gives you crossfade room and prevents visible
snapping at boundaries.
