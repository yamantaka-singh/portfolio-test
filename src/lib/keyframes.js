import placeholder from '../assets/placeholder-still.jpg';

export const ZONES = ['tunnel', 'pitch', 'scoreboard', 'stands', 'pavilion', 'boundary'];

const found = import.meta.glob('../assets/keyframes/*.jpg', { eager: true, import: 'default' });

/** @param {number} n 0-based zone index */
// ponytail: placeholder only so lane C can ship before G3; Task 19 removes the fallback
export const still = (n) => found[`../assets/keyframes/0${n + 1}-${ZONES[n]}.jpg`] ?? placeholder;
