'use client';

/**
 * useSmoothScroll — Lenis + GSAP ScrollTrigger + R3F on ONE clock.
 *
 * Returns a ref holding scroll progress 0..1. Read it inside useFrame; never
 * put it in React state (that re-renders the tree 60× a second).
 *
 * Mount this ONCE, high in the tree. Two Lenis instances will fight.
 *
 *   npm i lenis gsap
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type ScrollState = {
  /** 0..1 across the whole document */
  progress: number;
  /** pixels per second, signed */
  velocity: number;
  /** 1 = down, -1 = up */
  direction: number;
};

export function useSmoothScroll(enabled = true) {
  const state = useRef<ScrollState>({ progress: 0, velocity: 0, direction: 1 });

  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      lerp: reduced ? 1 : 0.1,     // lerp 1 = no smoothing
      smoothWheel: !reduced,
      syncTouch: false,            // native momentum on touch feels better than synced
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
      infinite: false,
    });

    const onScroll = (e: { progress: number; velocity: number; direction: number }) => {
      state.current.progress = e.progress;
      state.current.velocity = e.velocity;
      state.current.direction = e.direction;
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    // Single ticker. GSAP drives Lenis; R3F's own loop reads the ref.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);

    // CRITICAL: without this, GSAP "catches up" after a lag spike and any
    // scrubbed 3D scene teleports.
    gsap.ticker.lagSmoothing(0);

    // Let ScrollTrigger measure against Lenis's virtual scroll
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value != null) lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });
    ScrollTrigger.refresh();

    // Anchor links must still work
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: reduced ? 0 : 1.1 });
    };
    document.addEventListener('click', onClick);

    // Pause smooth scroll while a modal is open, otherwise the background scrolls
    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener('web3d:lock-scroll', stop);
    window.addEventListener('web3d:unlock-scroll', start);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('web3d:lock-scroll', stop);
      window.removeEventListener('web3d:unlock-scroll', start);
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.clearScrollMemory();
    };
  }, [enabled]);

  return state;
}

/** Normalise global progress into a 0..1 range for one section. */
export function sectionProgress(global: number, start: number, end: number) {
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (global - start) / (end - start)));
}

/** Ease a 0..1 with a cosine curve — removes the visible corner at range edges. */
export function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
