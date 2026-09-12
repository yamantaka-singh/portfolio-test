'use client';

/**
 * Four motion patterns that cover almost every 3D marketing site.
 *
 *  1. ScrubbedPath      camera tracks scroll along keyframes, damped
 *  2. SectionBeat       something HAPPENS at a scroll position (discrete)
 *  3. IdleLife          minimum viable movement so a static object isn't dead
 *  4. StateTransition   hover / configurator changes, always damped
 *
 * All are frame-rate independent and allocation-free inside useFrame.
 */

import { useRef, useEffect, useState, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

import { sectionProgress, type ScrollState } from './useSmoothScroll';

// Module-level scratch. NEVER allocate inside useFrame.
const _v = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

// ─── 1. Scrubbed camera path ────────────────────────────────────────────────

type Key = { at: number; pos: [number, number, number]; look: [number, number, number] };

export function ScrubbedPath({
  scroll,
  keys,
  smoothTime = 0.28,
}: {
  scroll: MutableRefObject<ScrollState>;
  keys: Key[];
  smoothTime?: number;
}) {
  const look = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = THREE.MathUtils.clamp(scroll.current.progress, 0, 1);

    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].at) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const k = THREE.MathUtils.smoothstep((t - a.at) / (b.at - a.at || 1), 0, 1);

    _v.copy(_a.set(...a.pos)).lerp(_b.set(...b.pos), k);
    easing.damp3(state.camera.position, _v, smoothTime, dt);

    _v.copy(_a.set(...a.look)).lerp(_b.set(...b.look), k);
    easing.damp3(look.current, _v, smoothTime * 1.25, dt);
    state.camera.lookAt(look.current);
  });

  return null;
}

// ─── 2. Section beat (discrete trigger) ─────────────────────────────────────

export function useSectionBeat(
  triggerSelector: string,
  onEnter: () => void,
  { start = 'top 60%', once = true }: { start?: string; once?: boolean } = {}
) {
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: triggerSelector,
      start,
      once,
      onEnter,
    });
    return () => st.kill();
  }, [triggerSelector, start, once, onEnter]);
}

/** Example: an emissive detail lights up when section 3 arrives. */
export function RevealingDetail({ scroll }: { scroll: MutableRefObject<ScrollState> }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useSectionBeat('#section-3', () => {
    if (!mat.current) return;
    gsap.to(mat.current, {
      emissiveIntensity: 2.4,
      duration: 0.9,
      ease: 'power3.out',
    });
  });

  return (
    <mesh>
      <boxGeometry args={[0.4, 0.05, 0.4]} />
      <meshStandardMaterial
        ref={mat}
        color="#0B0B0F"
        emissive="#FF5B2E"
        emissiveIntensity={0}
        toneMapped={false}          // required for bloom to pick it up
      />
    </mesh>
  );
}

// ─── 3. Idle life ───────────────────────────────────────────────────────────

/**
 * If you can *notice* the idle animation, it's too strong. It should only
 * register when it stops.
 */
export function IdleLife({
  children,
  spin = 0.06,
  bob = 0.03,
  bobSpeed = 0.6,
  enabled = true,
}: {
  children: React.ReactNode;
  spin?: number;
  bob?: number;
  bobSpeed?: number;
  enabled?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const baseY = useRef(0);

  useFrame((state) => {
    if (!ref.current || !enabled) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * spin;
    ref.current.position.y = baseY.current + Math.sin(t * bobSpeed) * bob;
  });

  return <group ref={ref}>{children}</group>;
}

// ─── 4. State transition ────────────────────────────────────────────────────

const FINISHES = {
  titanium: { color: '#C8CDD4', metalness: 0.95, roughness: 0.28 },
  gold:     { color: '#D4AF6A', metalness: 1.0,  roughness: 0.32 },
  matte:    { color: '#1C1C20', metalness: 0.9,  roughness: 0.55 },
} as const;

export function ConfigurableMesh({ finish }: { finish: keyof typeof FINISHES }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    if (!mesh.current || !mat.current) return;

    // Hover: small, fast, damped. Never a hard set.
    easing.damp3(mesh.current.scale, hovered ? 1.05 : 1.0, 0.15, dt);

    // Finish swap: damped, so it reads as a material changing rather than a
    // model reloading. This is the detail that makes configurators feel costly.
    const f = FINISHES[finish];
    easing.dampC(mat.current.color, f.color, 0.3, dt);
    easing.damp(mat.current, 'metalness', f.metalness, 0.3, dt);
    easing.damp(mat.current, 'roughness', f.roughness, 0.3, dt);
  });

  return (
    <mesh
      ref={mesh}
      castShadow
      receiveShadow
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <torusKnotGeometry args={[0.7, 0.24, 128, 32]} />
      <meshStandardMaterial ref={mat} color="#C8CDD4" metalness={0.95} roughness={0.28} envMapIntensity={1.2} />
    </mesh>
  );
}

// ─── Bonus: staggered entrance ──────────────────────────────────────────────

/**
 * Stagger is the difference between "animated" and "choreographed".
 * 60–120ms between siblings.
 */
export function StaggeredGroup({ items, active }: { items: THREE.Vector3[]; active: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    refs.current.forEach((m, i) => {
      if (!m) return;
      const delay = i * 0.09;
      const local = active ? Math.max(0, state.clock.elapsedTime - delay) : 0;
      const target = active && local > 0 ? 1 : 0;
      easing.damp3(m.scale, target, 0.22, dt);
    });
  });

  return (
    <>
      {items.map((p, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }} position={p} scale={0}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial color="#C8CDD4" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </>
  );
}
