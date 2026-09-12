import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pickTier, frameUrl, coverRect, transitionsToLoad, pickFrame } from '../lib/scrub-math.js';

gsap.registerPlugin(ScrollTrigger);

/** @param {HTMLCanvasElement | null} canvas */
export function initScrub(canvas) {
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /** @type {{ id: string, desktop: number, mobile: number }[]} */
  const transitions = JSON.parse(canvas.dataset.frames ?? '[]');
  const zones = [...document.querySelectorAll('[data-zone]')];
  if (zones.length !== transitions.length + 1) {
    console.warn(`scrub: ${zones.length} zones but ${transitions.length} transitions; need exactly one more zone`);
    return;
  }

  const root = document.documentElement;
  const ctx = canvas.getContext('2d');
  const tier = pickTier(innerWidth); // ponytail: tier fixed at load; re-pick on resize only if rotation proves it matters
  const counts = transitions.map((tr) => tr[tier]);
  /** @type {HTMLImageElement[][]} */
  const images = transitions.map(() => []);
  /** @type {gsap.core.Tween[]} */
  let tweens = [];
  let current = { t: 0, i: 0 };
  let failed = false;

  function draw() {
    const img = images[current.t][current.i];
    if (failed || !img?.complete || !img.naturalWidth) return;
    const r = coverRect(img.naturalWidth, img.naturalHeight, canvas.width, canvas.height);
    ctx.drawImage(img, r.x, r.y, r.w, r.h);
    root.classList.add('scrub-on');
  }

  function fail() {
    if (failed) return;
    failed = true;
    root.classList.remove('scrub-on');
    tweens.forEach((tw) => tw.scrollTrigger?.kill());
  }

  function load(t) {
    if (images[t].length) return;
    images[t] = Array.from({ length: counts[t] }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => current.t === t && current.i === i && draw();
      img.onerror = fail;
      img.src = frameUrl(transitions[t].id, tier, i);
      return img;
    });
  }

  function sync() {
    current = pickFrame(tweens.map((tw) => tw.progress()), counts);
    transitionsToLoad(current.t, transitions.length).forEach(load);
    draw();
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    draw();
  }

  tweens = transitions.map((_, t) =>
    gsap.to(
      { p: 0 },
      {
        p: 1,
        ease: 'none',
        onUpdate: sync,
        scrollTrigger: { trigger: zones[t + 1], start: 'top bottom', end: 'top top', scrub: 1 },
      },
    ),
  );

  ScrollTrigger.addEventListener('refresh', sync);
  addEventListener('resize', resize);
  resize();
  sync();
}
