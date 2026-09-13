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

export function initAnchorScroll() {
  if (typeof document === 'undefined') return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#' || href.length <= 1) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (lenis && !prefersReduced) {
      lenis.scrollTo(target, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }

    if (history.pushState) {
      history.pushState(null, '', href);
    }
  });
}

export function getLenis() {
  return lenis;
}

