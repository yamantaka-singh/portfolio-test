import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { initLenis } from './lenis-scroll.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initializes premium magnetic button interactions without jitter.
 * Anchors the bounding box at mouseenter so moving the element doesn't mutate coordinates.
 */
export function initMagneticButtons() {
  if (matchMedia('(pointer: coarse)').matches) return;
  const magnets = document.querySelectorAll('.magnetic');
  
  magnets.forEach((magnet) => {
    let bounds = null;

    magnet.addEventListener('mouseenter', () => {
      bounds = magnet.getBoundingClientRect();
    });

    magnet.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = magnet.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = (e.clientX - centerX) * 0.22;
      const deltaY = (e.clientY - centerY) * 0.22;
      
      gsap.to(magnet, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
    
    magnet.addEventListener('mouseleave', () => {
      bounds = null;
      gsap.to(magnet, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    });
  });
}

/**
 * Initializes 3D card tilt effect for .tilt-card elements
 */
export function initTiltCards() {
  if (matchMedia('(pointer: coarse)').matches) return;
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    let bounds = null;
    // GSAP writes rotationX/Y into the element's inline `transform`, which
    // always beats a CSS `:hover { transform: scale(...) }` rule on the same
    // property (inline style wins regardless of selector specificity) --
    // .tilt-pop cards fold their "pop out" scale into this same tween
    // instead of fighting it from CSS, so it's the one thing driving transform.
    const pop = card.classList.contains('tilt-pop') ? 1.06 : 1;
    const y0 = pop > 1 ? -6 : 0;

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      if (pop > 1) {
        gsap.to(card, { y: y0, scale: pop, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      }
    });

    card.addEventListener('mousemove', (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - bounds.top) / bounds.height - 0.5;

      gsap.to(card, {
        rotationY: x * 10,
        rotationX: -y * 10,
        transformPerspective: 1000,
        y: y0,
        scale: pop,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });

    card.addEventListener('mouseleave', () => {
      bounds = null;
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    });
  });
}

/**
 * Initializes custom luxury cursor with GPU quickSetters, hover state, and dynamic text badges.
 */
export function initCursor() {
  if (matchMedia('(pointer: coarse)').matches) return;
  if (document.querySelector('.custom-cursor')) return;
  
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  
  gsap.set(cursor, { opacity: 0, xPercent: -50, yPercent: -50 });
  
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  const speed = 0.25;
  
  const xSet = gsap.quickSetter(cursor, 'x', 'px');
  const ySet = gsap.quickSetter(cursor, 'y', 'px');
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    gsap.to(cursor, { opacity: 1, duration: 0.2 });
  }, { once: true });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    gsap.to(cursor, { opacity: 0, duration: 0.2 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to(cursor, { opacity: 1, duration: 0.2 });
  });
  
  gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
    pos.x += (mouse.x - pos.x) * dt;
    pos.y += (mouse.y - pos.y) * dt;
    xSet(pos.x);
    ySet(pos.y);
  });
  
  // Interactive hover targets with optional data-cursor-text
  const interactives = document.querySelectorAll('a, button, .magnetic, .tilt-card, [data-cursor-text]');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      const text = el.getAttribute('data-cursor-text');
      if (text) {
        cursor.textContent = text;
        cursor.classList.add('has-text');
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
      cursor.classList.remove('has-text');
      cursor.textContent = '';
    });
  });
}

/**
 * Initializes staggered text reveals via SplitType and GSAP.
 */
export function initTextReveals() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const elements = document.querySelectorAll('.reveal-text');

  elements.forEach((el) => {
    try {
      const split = new SplitType(el, { types: 'lines, words' });
      if (!split.words || !split.words.length) return;

      const tweenVars = {
        y: '80%',
        opacity: 0,
        duration: 0.6,
        stagger: 0.015,
        ease: 'power3.out',
      };

      // An element already on screen at load doesn't need a scroll trigger
      // at all -- that dependency is exactly what races against web-font
      // swap-in (font-display: swap) reflowing the page after
      // ScrollTrigger has already cached a pixel-based trigger position,
      // leaving above-the-fold text stuck at its pre-animation opacity.
      // Below-the-fold text has no such race: the user must scroll,
      // which is itself a layout-settled, correctly-measured event.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        gsap.from(split.words, tweenVars);
      } else {
        gsap.from(split.words, {
          ...tweenVars,
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        });
      }
    } catch {
      // Fallback silently if already split or unsupported
    }
  });
}

export function initAllInteractions() {
  initLenis();
  initCursor();
  initMagneticButtons();
  initTiltCards();

  // SplitType measures word widths at call time, and the custom display
  // fonts swap in later (font-display: swap), reflowing the page after
  // ScrollTrigger has already cached "top 92%" as a pixel position --
  // stuck-invisible text above the fold that never gets scrolled past its
  // (now-wrong) trigger point. Wait for the real fonts before splitting
  // and creating the triggers, instead of creating them wrong and patching
  // after (a later ScrollTrigger.refresh() just replays the tween in slow
  // motion instead of fixing this).
  (document.fonts?.ready ?? Promise.resolve()).then(initTextReveals);
}
