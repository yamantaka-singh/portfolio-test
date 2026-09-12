export const ZONES = ['tunnel', 'pitch', 'scoreboard', 'stands', 'pavilion', 'boundary'];

const found = import.meta.glob('../assets/keyframes/*.jpg', { eager: true, import: 'default' });

/** @param {number} n 0-based zone index */
export function still(n) {
  const key = `../assets/keyframes/0${n + 1}-${ZONES[n]}.jpg`;
  if (!found[key]) throw new Error(`Missing keyframe src/${key.slice(3)} (Task 7)`);
  return found[key];
}
