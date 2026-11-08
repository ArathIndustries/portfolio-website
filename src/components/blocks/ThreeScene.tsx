"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

/** Winding numbers must be finite integers >= 1 or the geometry fills with NaN. */
function winding(n: unknown, fallback: number): number {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(1, Math.round(v)) : fallback;
}

function Knot({ p, q }: { p: number; q: number }) {
  const ref = useRef<Mesh>(null);
  const P = winding(p, 2);
  const Q = winding(q, 3);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * 0.3;
      ref.current.rotation.y += dt * 0.45;
    }
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry key={`${P}-${Q}`} args={[1.1, 0.32, 220, 24, P, Q]} />
      <meshStandardMaterial color="#FF8800" emissive="#994400" emissiveIntensity={0.35} roughness={0.35} metalness={0.4} />
    </mesh>
  );
}

export default function ThreeScene({ p, q }: { p: number; q: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={40} color="#ffffff" />
      <pointLight position={[-4, -2, 2]} intensity={15} color="#FF8800" />
      <Knot p={p} q={q} />
    </Canvas>
  );
}
