# Six tested 3D web palettes

Each has been checked for: background dominance, low-saturation object colour,
one accent, and text contrast at WCAG AA on the surface colour.

Copy the block into `.web3d/direction.md` and into your CSS/Tailwind tokens so
the DOM layer and the WebGL layer never drift.

---

## 1. Obsidian Studio — premium hardware, watches, audio

```
background  #0B0B0F
surface     #16161C
object      #C8CDD4   (low-sat metal grey)
accent      #FF5B2E
text        #EDEDF0
muted       #8A8A96
keyLight    #FFF3E6  intensity 2.4
rimLight    #7FA8FF  intensity 1.6
```
HDRI: `studio` or a custom softbox. Tone mapping: ACESFilmic, exposure 1.0.
Signals: engineered, expensive, considered. The safest premium default.

---

## 2. Bone Editorial — fashion, architecture, design studios

```
background  #F4F2EE
surface     #FFFFFF
object      #D9D4CB
accent      #1A1A1A
text        #1A1A1A
muted       #6E6A63
keyLight    #FFFFFF  intensity 1.8
fillLight   #EDE9E2  intensity 0.9
```
HDRI: `apartment` or `city` at low intensity. Needs real contact shadows or the
object floats. Unforgiving of lighting mistakes — budget an extra day.
Signals: gallery, editorial, confident.

---

## 3. Deep Ocean — SaaS, fintech, data products

```
background  #070B14
surface     #0F1626
object      #A9B6CC
accent      #4ADE80
text        #E6EDF7
muted       #7C8BA3
keyLight    #DCE9FF  intensity 2.0
rimLight    #4ADE80  intensity 0.8
```
HDRI: `night` or `dawn`. Slight bloom on the accent only.
Signals: technical, trustworthy, modern. Reads well behind dense UI.

---

## 4. Golden Hour — lifestyle, food, travel, wellness

```
background  #14100C
surface     #1F1913
object      #D6C3A8
accent      #E8944A
text        #F5EDE2
muted       #A3907A
keyLight    #FFD9A0  intensity 2.6
rimLight    #FF9B5C  intensity 1.2
```
HDRI: `sunset`. Longer shadows, exposure 1.1, subtle bloom threshold 0.85.
Signals: warm, human, aspirational. Very forgiving of imperfect models.

---

## 5. Clinical White — medical, science, precision instruments

```
background  #FAFBFC
surface     #FFFFFF
object      #C4CBD4
accent      #0066FF
text        #0A0E14
muted       #5A6472
keyLight    #FFFFFF  intensity 2.2
fillLight   #FFFFFF  intensity 1.4
```
HDRI: none or a uniform white studio. Near-zero shadow, no bloom, no vignette.
Signals: accurate, sterile, authoritative. Hardest to make look expensive —
every material flaw is visible.

---

## 6. Signal Neon — gaming, music, youth brands, launches

```
background  #05040A
surface     #0E0A18
object      #8B8FA8
accent      #FF2E88
accent2     #00E5FF
text        #F0EEF8
muted       #7A7492
```
Two opposing area lights in `accent` and `accent2`, emissive geometry, bloom
intensity 0.8 / threshold 0.7.
Signals: loud, nocturnal, energetic. The only palette here that permits two
accents, because the opposition *is* the idea.

---

## Applying a palette

```tsx
// tokens.ts — single source shared by DOM and WebGL
export const palette = {
  background: '#0B0B0F',
  surface: '#16161C',
  object: '#C8CDD4',
  accent: '#FF5B2E',
  text: '#EDEDF0',
  keyLight: '#FFF3E6',
  rimLight: '#7FA8FF',
} as const;
```

```tsx
<Canvas gl={{ toneMapping: THREE.ACESFilmicToneMapping }}>
  <color attach="background" args={[palette.background]} />
  <fog attach="fog" args={[palette.background, 8, 24]} />
</Canvas>
```

Matching the fog colour to the background is the cheapest way to make a scene
feel like it has depth rather than a backdrop.

## Contrast check

Body text goes on `surface`, not on the canvas. Text placed directly over a 3D
scene fails contrast the moment the object moves. If copy must overlay the
canvas, put a gradient scrim behind it:

```css
.scrim { background: linear-gradient(to right, rgb(11 11 15 / .85), transparent 60%); }
```
