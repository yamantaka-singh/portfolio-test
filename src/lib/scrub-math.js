/** @param {number} viewportWidth CSS px */
export const pickTier = (viewportWidth) => (viewportWidth < 768 ? 'mobile' : 'desktop');

/**
 * @param {string} transitionId
 * @param {'mobile' | 'desktop'} tier
 * @param {number} index 0-based
 */
export const frameUrl = (transitionId, tier, index) =>
  `/frames/${transitionId}/${tier}/${String(index + 1).padStart(3, '0')}.avif`;

/** object-fit: cover, centred. All values in the same units (canvas px). */
export function coverRect(imgW, imgH, boxW, boxH) {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
}

/** @param {number} active @param {number} total */
export const transitionsToLoad = (active, total) => [active, active + 1].filter((i) => i >= 0 && i < total);

/**
 * The frame to show, computed from every transition's (possibly lagging) progress,
 * so no single tween can overwrite another's frame. The last transition that has
 * started owns the canvas; if none has, show the very first frame.
 * @param {number[]} progresses 0..1 per transition
 * @param {number[]} counts frames per transition
 */
export function pickFrame(progresses, counts) {
  const t = progresses.findLastIndex((p) => p > 0);
  if (t < 0) return { t: 0, i: 0 };
  return { t, i: Math.round(Math.min(1, progresses[t]) * (counts[t] - 1)) };
}
