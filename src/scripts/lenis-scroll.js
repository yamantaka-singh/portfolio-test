import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis;

export function initLenis() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(pointer: coarse)').matches) return; // Leave native touch gestures on phones/tablets for zero lag

  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.0,
    infinite: false,
  });

  if (typeof window !== 'undefined') {
    window.__lenis = lenis;
  }

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(500, 33);
}

export function getLenis() {
  return lenis;
}
