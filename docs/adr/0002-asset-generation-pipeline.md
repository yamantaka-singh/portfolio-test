# ADR-0002: Manual Gemini stills → Flow "Frames to Video" transitions → exported frames

## Status
Accepted — 2026-09-12. Replaces the earlier draft (Gemini concept art
informing a 3D scene).

## Context
The stadium journey is a scroll-scrubbed video (ADR-0001), and there is no 3D
model. The user wants Gemini to create the assets and chose to generate them
**by hand in Google's apps**, not via API or ComfyUI:
- ComfyUI isn't installed on this machine.
- A 16 GB M5 can't run video models locally.

Veo 3.1's first-and-last-frame mode ("Frames to Video") is available in
**Google Flow on the web** (verified 2026-09-12). That makes chaining clips
between fixed keyframes possible without a 3D model.

## Decision
1. **Style bible + keyframe prompts (agent writes, Pro tier)**
   - The agent writes `assets/prompts/keyframes.md`:
     - palette words, lighting (floodlit dusk), lens, grain, mood
     - a prompt and a camera position for each of the six zones
   - Camera positions are designed as **one continuous camera path**:
     tunnel → walk out onto the pitch → tilt up to the scoreboard → sweep
     across the stands → track to the pavilion → pull back to the boundary
     rope.
   - That way each neighbouring pair is a plausible single move for Veo.
2. **Style lock (human gate)**
   - The user generates keyframe 1 in the Gemini app and approves it.
   - It then becomes the reference image for keyframes 2–6.
   - Then all six are approved together.
3. **Composition rule for phones**
   - Keyframes are 16:9, with the key action kept inside the **centre third**.
   - Portrait phones get a centre crop and desktop gets the full frame.
   - This avoids generating everything twice.
4. **Transitions (manual in Flow)**
   - Five clips, made with Frames to Video: first = keyframe N, last =
     keyframe N+1.
   - The prompt describes only the camera move.
   - Generate several takes and the user picks one each (human gate).
   - Download at highest quality and **strip audio** (no sound in v1).
5. **Frame export (agent, Flash tier)**
   - `scripts/export-frames.sh` uses ffmpeg to sample each clip to the frame
     budget in ADR-0001.
   - It scales to desktop and mobile widths and writes AVIF, falling back to
     WebP if the local ffmpeg lacks an AV1 encoder.
   - Output goes to `public/frames/<zone>/<tier>/NNN.avif`.
6. **Provenance log**
   - Every prompt, the chosen take, and date go into
     `assets/prompts/log.md`.
   - Manual generation isn't reproducible, so the log is the only way to redo
     one zone later in the same style.

## Alternatives Considered
- **Gemini API script (Nano Banana + Veo)**: reproducible and recommended
  during grilling, but declined. Also, Frames to Video is currently
  Flow-only, so the API would need separate checks.
- **ComfyUI via comfy-mcp**: the user's first choice, reversed once it turned
  out ComfyUI isn't installed and no Gemini/Veo partner model was confirmed.
- **Blender/Spline render or stock footage**: reintroduces 3D modelling, or
  isn't exclusive.

## Consequences
- **Style drift** across six manual generations is the main visual risk.
  The style-lock gate and reference-image reuse reduce it but don't remove
  it.
- **Watermarks**: Google outputs always carry an invisible SynthID watermark.
  Whether Flow exports carry a **visible** watermark depends on the user's
  plan tier. Check in Phase 0 before any clip is made for real.
- **Centre-third framing** limits keyframe composition. If a zone can't work
  that way, it gets a separate 9:16 keyframe and clip, as a per-zone
  exception rather than the default.
- **Frame budget**: Veo clip length (~8s) sets how much scroll distance each
  transition covers, and so the page's pacing.
- **Human bottleneck**: the user runs this lane by hand, so it's the serial
  bottleneck of the build. Agent lanes are planned to run in parallel around
  it (ADR-0004).
