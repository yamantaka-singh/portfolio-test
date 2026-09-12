'use client';

/**
 * Device tiering with measured fallback.
 *
 * Static detection (GPU string, cores, memory) gets you a starting guess.
 * Measured frame times are what actually protect the user — a device that
 * *looks* capable but thermally throttles will be demoted automatically.
 *
 *   const tier = useDeviceTier();
 *   const q = QUALITY[tier];
 *   <Canvas dpr={[1, q.dpr]}> ... {q.post && <Effects />} </Canvas>
 */

import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

export type Tier = 'low' | 'mid' | 'high';

export const QUALITY = {
  low: {
    dpr: 1.0,
    post: false,
    shadows: false as const,
    contactShadows: false,
    envResolution: 256,
    shadowMapSize: 0,
    transmission: false,
    idleAnimation: false,
    maxLights: 2,
  },
  mid: {
    dpr: 1.5,
    post: 'minimal' as const,
    shadows: 'contact' as const,
    contactShadows: true,
    envResolution: 512,
    shadowMapSize: 1024,
    transmission: false,
    idleAnimation: true,
    maxLights: 3,
  },
  high: {
    dpr: 2.0,
    post: 'full' as const,
    shadows: 'full' as const,
    contactShadows: true,
    envResolution: 1024,
    shadowMapSize: 2048,
    transmission: true,
    idleAnimation: true,
    maxLights: 5,
  },
} as const;

// ─── static detection ───────────────────────────────────────────────────────

export function detectTierStatic(gl?: THREE.WebGLRenderer): Tier {
  if (typeof window === 'undefined') return 'mid';

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let renderer = '';
  try {
    const ctx = gl?.getContext();
    const dbg = ctx?.getExtension('WEBGL_debug_renderer_info');
    if (ctx && dbg) renderer = String(ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL));
  } catch { /* extension blocked — fall back to heuristics */ }

  // Known-good desktop GPUs
  if (!mobile && /Apple M\d|RTX [3-5]\d|Radeon RX [67]\d/i.test(renderer)) return 'high';

  // Known-weak mobile GPUs
  if (/Mali-G5\d|Mali-T|Adreno \(TM\) [45]\d\d|PowerVR/i.test(renderer)) return 'low';

  if (mobile) {
    if (mem <= 3 || cores <= 4) return 'low';
    return 'mid';
  }

  if (cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

// ─── measured demotion ──────────────────────────────────────────────────────

/**
 * Mount inside <Canvas>. Samples frame times and demotes the tier if the
 * device cannot sustain the target. Never promotes — a device that starts
 * struggling will keep struggling once it heats up.
 */
export function useDeviceTier({
  sampleMs = 2000,
  targetFps = 45,
  recheckMs = 20000,
}: { sampleMs?: number; targetFps?: number; recheckMs?: number } = {}) {
  const { gl } = useThree();
  const [tier, setTier] = useState<Tier>(() => detectTierStatic(gl));

  const frames = useRef(0);
  const elapsed = useRef(0);
  const nextCheck = useRef(0);
  const settled = useRef(false);

  useFrame((_, delta) => {
    frames.current++;
    elapsed.current += delta;

    const window = settled.current ? recheckMs / 1000 : sampleMs / 1000;
    if (elapsed.current < window) return;

    const fps = frames.current / elapsed.current;
    frames.current = 0;
    elapsed.current = 0;
    settled.current = true;

    setTier((current) => {
      // Demote only. Thermal throttling means capability decreases over time.
      if (fps < targetFps * 0.55 && current !== 'low') return 'low';
      if (fps < targetFps && current === 'high') return 'mid';
      return current;
    });
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[web3d] device tier: ${tier}`, QUALITY[tier]);
    }
  }, [tier]);

  return tier;
}

// ─── outside the Canvas ─────────────────────────────────────────────────────

/**
 * For components that need the tier but live in the DOM (e.g. deciding whether
 * to mount the Canvas at all). No renderer available, so static detection only.
 */
export function useDeviceTierDOM() {
  const [tier, setTier] = useState<Tier>('mid');
  useEffect(() => { setTier(detectTierStatic()); }, []);
  return tier;
}

/**
 * Save-Data and metered-connection respect. On a metered connection, a 3.5MB
 * GLB is a real cost to the user — serve the poster instead.
 */
export function shouldServePosterOnly() {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as unknown as {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;
  if (!conn) return false;
  return Boolean(conn.saveData) || conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
}
