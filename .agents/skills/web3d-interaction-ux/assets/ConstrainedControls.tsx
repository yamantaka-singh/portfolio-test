'use client';

/**
 * Interaction primitives for commercial 3D sites.
 *
 *  ConstrainedControls — OrbitControls that can't ruin the art direction
 *  DragRotate          — horizontal drag rotates, vertical drag still scrolls
 *  Hotspot             — accessible, keyboard-reachable point of interest
 *  WebGLGuard          — no-WebGL + context-loss fallback wrapper
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { easing } from 'maath';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// ─── ConstrainedControls ────────────────────────────────────────────────────

/**
 * Orbit controls that stay inside the art direction, and return to the hero
 * framing after idle so the scene is never left at a bad angle.
 */
export function ConstrainedControls({
  idleReturnMs = 2500,
  home = [0, 0, 0] as [number, number, number],
  polar = [Math.PI * 0.35, Math.PI * 0.6] as [number, number],
  azimuth = [-Math.PI * 0.35, Math.PI * 0.35] as [number, number],
}) {
  const ref = useRef<OrbitControlsImpl>(null);
  const lastInteract = useRef(0);
  const homeAz = useRef(0);
  const homePol = useRef(Math.PI * 0.48);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    homeAz.current = c.getAzimuthalAngle();
    homePol.current = c.getPolarAngle();
    const onStart = () => { lastInteract.current = performance.now(); };
    const onChange = () => { lastInteract.current = performance.now(); };
    c.addEventListener('start', onStart);
    c.addEventListener('change', onChange);
    return () => {
      c.removeEventListener('start', onStart);
      c.removeEventListener('change', onChange);
    };
  }, []);

  useFrame((_, delta) => {
    const c = ref.current;
    if (!c) return;
    const idle = performance.now() - lastInteract.current > idleReturnMs;
    if (!idle) return;

    const dt = Math.min(delta, 1 / 30);
    // Nudge back toward home without fighting the user
    const az = c.getAzimuthalAngle();
    const pol = c.getPolarAngle();
    const nextAz = THREE.MathUtils.damp(az, homeAz.current, 1.4, dt);
    const nextPol = THREE.MathUtils.damp(pol, homePol.current, 1.4, dt);
    c.setAzimuthalAngle(nextAz);
    c.setPolarAngle(nextPol);
    c.update();
  });

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={home}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={polar[0]}
      maxPolarAngle={polar[1]}
      minAzimuthAngle={azimuth[0]}
      maxAzimuthAngle={azimuth[1]}
      rotateSpeed={0.4}
      enableDamping
      dampingFactor={0.08}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
    />
  );
}

// ─── DragRotate ─────────────────────────────────────────────────────────────

/**
 * Horizontal drag rotates the object. Vertical drag falls through to the page
 * scroll — which is what phone users expect and what OrbitControls breaks.
 */
export function DragRotate({
  children,
  sensitivity = 0.008,
  damping = 0.92,
}: {
  children: React.ReactNode;
  sensitivity?: number;
  damping?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, y: 0, axis: null as null | 'x' | 'y' });
  const velocity = useRef(0);

  const onDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    drag.current = { active: true, x: e.clientX, y: e.clientY, axis: null };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, []);

  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    // Lock the axis once the gesture is clearly one or the other
    if (!drag.current.axis && Math.hypot(dx, dy) > 8) {
      drag.current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (drag.current.axis !== 'x') return;   // vertical: let the page scroll

    e.stopPropagation();
    velocity.current = dx * sensitivity;
    if (group.current) group.current.rotation.y += velocity.current;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
  }, [sensitivity]);

  const onUp = useCallback(() => { drag.current.active = false; }, []);

  useFrame(() => {
    if (drag.current.active || !group.current) return;
    // Inertia after release — small detail, big perceived-quality difference
    velocity.current *= damping;
    if (Math.abs(velocity.current) > 1e-4) group.current.rotation.y += velocity.current;
  });

  return (
    <group
      ref={group}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerOver={() => { document.body.style.cursor = 'grab'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {children}
    </group>
  );
}

// ─── Hotspot ────────────────────────────────────────────────────────────────

/**
 * A point of interest on the model. Keyboard reachable, screen-reader labelled,
 * with a ≥44px touch target regardless of the visible dot size.
 *
 * Pair every hotspot with a DOM list of the same items elsewhere on the page —
 * assistive tech cannot see the canvas at all.
 */
export function Hotspot({
  position,
  label,
  description,
  onActivate,
}: {
  position: [number, number, number];
  label: string;
  description?: string;
  onActivate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Html position={position} center distanceFactor={8} occlude="blending" zIndexRange={[10, 0]}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => { setOpen((v) => !v); onActivate?.(); }}
        style={{
          // 44px touch target, small visible dot
          width: 44, height: 44,
          display: 'grid', placeItems: 'center',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
        }}
      >
        <span
          aria-hidden
          style={{
            width: 12, height: 12, borderRadius: 999,
            background: '#FF5B2E',
            boxShadow: '0 0 0 4px rgba(255,91,46,.25)',
            transition: 'transform .2s ease',
            transform: open ? 'scale(1.4)' : 'scale(1)',
          }}
        />
      </button>

      {open && description && (
        <div role="tooltip" style={{
          position: 'absolute', left: 52, top: 8, width: 220,
          background: 'rgba(22,22,28,.92)', color: '#EDEDF0',
          padding: '10px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.45,
          backdropFilter: 'blur(8px)',
        }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>{label}</strong>
          {description}
        </div>
      )}
    </Html>
  );
}

// ─── WebGLGuard ─────────────────────────────────────────────────────────────

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Attach inside <Canvas> to survive context loss (memory pressure, driver reset). */
export function ContextLossGuard({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => {
      // WITHOUT preventDefault the context never restores and the canvas stays black.
      e.preventDefault();
      onLost();
    };
    const restored = () => onRestored();
    el.addEventListener('webglcontextlost', lost);
    el.addEventListener('webglcontextrestored', restored);
    return () => {
      el.removeEventListener('webglcontextlost', lost);
      el.removeEventListener('webglcontextrestored', restored);
    };
  }, [gl, onLost, onRestored]);
  return null;
}
