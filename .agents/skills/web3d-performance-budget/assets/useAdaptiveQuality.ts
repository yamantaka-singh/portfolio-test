'use client';

/**
 * Adaptive quality controller — degrades more than just DPR when frame times
 * slip, and pauses the loop when the canvas is off-screen or the tab is hidden.
 *
 * drei's <AdaptiveDpr /> only touches resolution. This also lets you disable
 * post-processing, shadows, and idle animation under sustained load, which is
 * what actually recovers a struggling mid-tier phone.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

export type QualityLevel = 0 | 1 | 2 | 3;   // 0 = crisis, 3 = full

export type QualitySettings = {
  level: QualityLevel;
  dpr: number;
  post: boolean;
  postPasses: number;
  shadows: boolean;
  idleAnimation: boolean;
  renderScale: number;
};

const LEVELS: Record<QualityLevel, Omit<QualitySettings, 'level'>> = {
  3: { dpr: 2.0, post: true,  postPasses: 4, shadows: true,  idleAnimation: true,  renderScale: 1.0 },
  2: { dpr: 1.5, post: true,  postPasses: 2, shadows: true,  idleAnimation: true,  renderScale: 1.0 },
  1: { dpr: 1.0, post: true,  postPasses: 1, shadows: false, idleAnimation: true,  renderScale: 0.9 },
  0: { dpr: 1.0, post: false, postPasses: 0, shadows: false, idleAnimation: false, renderScale: 0.75 },
};

export function useAdaptiveQuality({
  startLevel = 3 as QualityLevel,
  targetMs = 20,            // ~50fps; leaves headroom before the 33ms floor
  criticalMs = 40,          // ~25fps
  windowSize = 60,          // frames per evaluation
  recoverAfterMs = 12000,   // try one level back up after a calm period
}: {
  startLevel?: QualityLevel;
  targetMs?: number;
  criticalMs?: number;
  windowSize?: number;
  recoverAfterMs?: number;
} = {}) {
  const { gl, setDpr } = useThree();
  const [level, setLevel] = useState<QualityLevel>(startLevel);

  const times = useRef<number[]>([]);
  const lastChange = useRef(performance.now());
  const floorHit = useRef(false);

  useFrame((_, delta) => {
    const ms = delta * 1000;
    const t = times.current;
    t.push(ms);
    if (t.length < windowSize) return;

    // Median, not mean — one 200ms GC spike shouldn't demote the whole session.
    const sorted = [...t].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    t.length = 0;

    const now = performance.now();
    const sinceChange = now - lastChange.current;
    if (sinceChange < 1500) return;   // let the last change settle

    setLevel((cur) => {
      if (p95 > criticalMs && cur > 0) {
        lastChange.current = now;
        floorHit.current = true;
        return (cur - 1) as QualityLevel;
      }
      if (median > targetMs && cur > 0) {
        lastChange.current = now;
        return (cur - 1) as QualityLevel;
      }
      // Cautious recovery, and never back to the level that already failed
      if (
        median < targetMs * 0.6 &&
        cur < startLevel &&
        !floorHit.current &&
        sinceChange > recoverAfterMs
      ) {
        lastChange.current = now;
        return (cur + 1) as QualityLevel;
      }
      return cur;
    });
  });

  useEffect(() => {
    const s = LEVELS[level];
    setDpr(Math.min(window.devicePixelRatio, s.dpr));
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[web3d] quality → level ${level}`, s);
    }
  }, [level, setDpr, gl]);

  return { level, ...LEVELS[level] } as QualitySettings;
}

/**
 * Pause the render loop when the canvas is off-screen or the tab is hidden.
 * Free performance and the difference between a site that drains a battery and
 * one that doesn't.
 */
export function useRenderGate(wrapperRef: React.RefObject<HTMLElement>) {
  const [active, setActive] = useState(true);
  const onVis = useCallback(() => setActive(!document.hidden), []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting && !document.hidden), {
      threshold: 0,
    });
    io.observe(el);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [wrapperRef, onVis]);

  // <Canvas frameloop={active ? 'always' : 'never'} />
  return active;
}

/**
 * Log a snapshot of renderer.info. Call from a dev-only key handler.
 * Copy the output into .web3d/perf-report.json for the perf gate.
 */
export function useRendererReport(key = 'p') {
  const { gl, scene } = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== key || e.metaKey || e.ctrlKey) return;
      let meshes = 0;
      scene.traverse((o) => { if ((o as { isMesh?: boolean }).isMesh) meshes++; });
      const report = {
        at: new Date().toISOString(),
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        points: gl.info.render.points,
        lines: gl.info.render.lines,
        programs: gl.info.programs?.length ?? 0,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        meshes,
        dpr: gl.getPixelRatio(),
        size: gl.getSize({ x: 0, y: 0 } as never),
      };
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(report, null, 2));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gl, scene, key]);
}
