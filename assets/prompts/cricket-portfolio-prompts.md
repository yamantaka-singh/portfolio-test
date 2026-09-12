# Elite Prompt Engineering Guide — Abhishek Pandey Cricket Portfolio

Engineered following the **senior-prompt-engineer** and **premium-web-design** standards.

## 1. System Prompt Architecture

Every visual asset is defined across 7 distinct orthogonal parameters to guarantee aesthetic consistency, zero AI slop, and production-grade fidelity:

```
[Camera & Optics] + [Subject Focus] + [Environment & Architecture] + [Lighting Blueprint] + [Atmospheric Physics] + [Color Grading] + [Render Constraints & Negatives]
```

---

## 2. Master Palette & Cinematic Style Tokens

* **Dominant Atmosphere**: Match night in an empty, grand cricket cathedral. Humidity, dusk-to-night gradient, quiet electric tension before 80,000 spectators arrive.
* **Palette Anchors**:
  - `Night Turf`: `#0E1F17` (deep cool shadowed outfield)
  - `Willow & Clay`: `#D9B98A` (22-yard clay wicket, raw bat wood, warm timber balconies)
  - `Cherry Red`: `#B3261E` (boundary rope, leather seam, red accents)
  - `Floodlight White`: `#F4F1E6` (warm halogen & metal-halide beams, chalk crease lines)
  - `Scoreboard Amber`: `#FFB020` (warm LED matrix glow)
* **Optical Profile**: 35mm / 85mm prime lenses, f/1.4 to f/2.8, subtle natural chromatic aberration, 35mm Kodak Vision3 500T film grain texture, zero neon purple AI artifacts, zero distorted hands/faces.

---

## 3. Production Prompts: Stadium Zones (16:9)

### Keyframe 01: The Walkout (Intro / Hero)
> **Prompt**:
> Wide-angle cinematic 35mm still of the player walkout tunnel of a world-class cricket stadium at night. Looking from inside the shadowed concrete tunnel through the arched portal into the brightly floodlit cricket ground. Four towering floodlight gantries illuminate the lush green pitch in the distance. Cherry-red racing stripe along the concrete walls. Atmospheric ground haze catching volumetric halogen light beams. Raw sports architectural photography, shot on ARRI Alexa Mini LF, 8k resolution, photorealistic textures, quiet electric atmosphere.
> **Negative Prompt**:
> blurry, cartoon, illustration, neon purple, crowd, players, distorted geometry, watermark, text, logos, low-res.
> **Parameters**: `--ar 16:9 --style raw --v 6.1`

### Keyframe 02: The Pitch (22 Yards)
> **Prompt**:
> Low-angle cinematic sports photography standing at the bowling crease looking straight down a 22-yard cricket pitch under intense night floodlights. Textured clay wicket with visible rolling marks and chalk-white crease markings. Wooden stumps and bails standing sharply in the foreground with shallow depth of field. Dew glistening on the surrounding dark emerald outfield grass. Volumetric stadium lighting slicing through evening mist. Hasselblad H6D-100c, 50mm f/1.8 lens, hyper-detailed turf blades, dramatic shadow contrast.
> **Negative Prompt**:
> plastic grass, neon colors, CGI, 3D render, cartoon, baseball diamond, soccer pitch, football markings, distorted stumps, text, watermark.
> **Parameters**: `--ar 16:9 --style raw --v 6.1`

### Keyframe 03: The Scoreboard
> **Prompt**:
> Architectural upward-angle shot of a massive vintage-modern electronic cricket scoreboard towering above the grandstands at dusk. The matrix panels cast a warm amber LED glow (#FFB020) illuminating stadium mist and steel lattice truss architecture. Deep navy and midnight green sky behind. Outfield grass in dark shadow below. Kodachrome film color grade, 35mm f/2.0, high dynamic range, industrial sports architecture, authentic cricket ground ambience.
> **Negative Prompt**:
> readable sponsor logos, commercial advertisements, generic soccer stadium, cartoon, high saturation purple, blurry, low resolution.
> **Parameters**: `--ar 16:9 --style raw --v 6.1`

### Keyframe 04: The Stands
> **Prompt**:
> Sweeping panoramic view of empty tiered grandstands in a major cricket stadium at night. Dark forest-green and timber spectator seating curving in grand concentric arcs. Atmospheric floodlight beams cutting through hazy night air, casting long graphic shadows across concrete stairways and stadium aisles. Moody brutalist sports architecture, cinematic 24mm lens, clean composition, crisp geometric lines.
> **Negative Prompt**:
> crowd, messy trash, cartoon, neon magenta, oversaturated, distorted seats, CGI video game look, watermark.
> **Parameters**: `--ar 16:9 --style raw --v 6.1`

### Keyframe 05: The Members' Pavilion
> **Prompt**:
> Exterior view of a prestigious, historic cricket club pavilion clubhouse at twilight. Dark timber balconies with heritage white balustrades, warm incandescent glow radiating from floor-to-ceiling French windows. Manicured lawn in foreground bordered by a traditional boundary rope. Elegant sports clubhouse architecture, 50mm lens, cinematic twilight atmosphere, rich dark wood and slate tones, sophisticated editorial photography.
> **Negative Prompt**:
> modern glass skyscraper, soccer stadium, neon signs, cartoon, generic house, overexposed, low contrast.
> **Parameters**: `--ar 16:9 --style raw --v 6.1`

### Keyframe 06: The Boundary Rope
> **Prompt**:
> Extreme low-angle macro-depth-of-field shot of a thick traditional braided cricket boundary rope resting on immaculate freshly mown turf grass. Individual dew drops on grass blades catching floodlight highlights. In the soft bokeh background, the immense illuminated stadium bowl and floodlight towers glow warmly against the night sky. 85mm f/1.4 lens, razor-sharp foreground focus, creamy sports bokeh, cinematic luxury aesthetic.
> **Negative Prompt**:
> plastic fence, soccer goal, blurry foreground, cartoon, artificial neon turf, oversaturated colors, watermark.
> **Parameters**: `--ar 16:9 --style raw --v 6.1`

---

## 4. Production Prompts: Creator Portraits & Action (3:4)

### Photo 01: Match Analysis & Tactical Breakdown
> **Prompt**:
> High-end editorial portrait of a sharp, modern South Asian cricket analyst (early 30s) in a dark high-tech broadcast studio. He is studying cricket bowling trajectories on a large glowing vertical interactive display screen showing field placements and seam angles. Clean tailored charcoal overshirt. Warm rim lighting outlining his silhouette, soft key light on focused expression. Leica SL2, 50mm f/1.4, cinematic film grade, documentary authority.
> **Negative Prompt**:
> cartoon, funny expression, messy background, extra fingers, distorted facial features, oversaturated neon, cheap webcam look.
> **Parameters**: `--ar 3:4 --style raw --v 6.1`

### Photo 02: Batting Mechanics & Net Practice
> **Prompt**:
> Dynamic high-speed action photography of an athletic South Asian cricket batsman in outdoor practice nets under evening floodlights. Wearing modern matte-black batting helmet, white and gold batting pads, holding a premium English willow cricket bat in a balanced stance. Net mesh softly blurred in background with floodlight halation. Fast shutter speed freezing fine chalk dust on contact. Canon EOS R5, 85mm f/1.8, authentic sports grit, professional athlete editorial.
> **Negative Prompt**:
> baseball bat, baseball glove, cartoon, distorted limbs, multiple bats, awkward pose, blurry face, low quality.
> **Parameters**: `--ar 3:4 --style raw --v 6.1`

### Photo 03: Studio Podcast & Media
> **Prompt**:
> Intimate, high-end editorial portrait of a cricket creator in a broadcast podcast studio. He is seated comfortably before a professional Shure SM7B studio microphone on a low-profile boom arm. Behind him, acoustic slat-wood panels decorated with historic vintage cricket bats and cricket ball memorabilia softly lit by warm amber studio lamps. Confident and engaging expression, shallow depth of field, 85mm f/1.2, rich cinematic tones.
> **Negative Prompt**:
> radio DJ headphones, loud clutter, neon gamer RGB, cartoon, distorted eyes, extra hands, amateur lighting.
> **Parameters**: `--ar 3:4 --style raw --v 6.1`
