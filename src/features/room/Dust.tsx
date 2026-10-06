"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { roomEvents } from "./roomEvents";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function Dust({ count = 220 }: { count?: number }) {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(false);
  const points = useRef<THREE.Points>(null);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // spread from the Digital Room through the Long Hall
      pos[i * 3] = (Math.random() - 0.5) * 14 - 2.5;
      pos[i * 3 + 1] = Math.random() * 3.2 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!points.current || reducedRef.current) return;
    // a gust passes through when the room performs
    const gust = Date.now() - roomEvents.gustAt < 2000 ? 8 : 1;
    points.current.rotation.y += delta * 0.012 * gust;
    points.current.position.y = Math.sin(Date.now() * 0.0002) * 0.06;
  });

  return (
    <points ref={points}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={0.02}
        color="#ffe9c4"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
