"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Sculpture as SculptureData } from "../../types/content";
import { roomEvents } from "../room/roomEvents";
import { usePrefersReducedMotion } from "../room/usePrefersReducedMotion";
import { useRoomStore } from "../room/store";

export function Sculpture({ data, position }: { data: SculptureData; position: [number, number, number] }) {
  const setGallery = useRoomStore((s) => s.setGallery);
  const gallery = useRoomStore((s) => s.gallery);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(false);
  const hoverRef = useRef(false);
  const [hover, setHover] = useState(false);
  const piece = useRef<THREE.Group>(null);
  const twinMat = useRef<THREE.MeshStandardMaterial>(null);
  const selected = gallery?.kind === "sculpture" && gallery.no === data.no;

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useFrame(({ clock }, delta) => {
    if (reducedRef.current) return;
    if (piece.current) {
      piece.current.rotation.y += delta * 0.25;
    }
    if (twinMat.current) {
      // the twin pulses when the courtyard does; no wire found
      const echo = Date.now() - roomEvents.pulseAt < 1200 ? 1.2 : 0;
      twinMat.current.emissiveIntensity =
        1.4 +
        Math.sin(clock.getElapsedTime() * 0.8) * 0.15 +
        echo +
        (hoverRef.current ? 0.35 : 0);
    }
  });

  function select(e: { stopPropagation: () => void }) {
    e.stopPropagation();
    setGallery("sculpture", selected ? null : data.no);
  }

  function over(e: { stopPropagation: () => void }) {
    e.stopPropagation();
    setHover(true);
    document.body.style.cursor = "pointer";
  }

  function out() {
    setHover(false);
    document.body.style.cursor = "auto";
  }

  return (
    <group position={position}>
      {/* pedestal */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.36, 0.9, 24]} />
        <meshStandardMaterial color="#1e1e22" roughness={0.6} />
      </mesh>
      <group ref={piece} position={[0, 1.25, 0]}>
        {data.form === "knot" ? (
          <mesh castShadow onClick={select} onPointerOver={over} onPointerOut={out}>
            <torusKnotGeometry args={[0.16, 0.05, 100, 16]} />
            <meshStandardMaterial
              color="#8a6f3b"
              metalness={0.85}
              roughness={0.3}
              emissive="#ffe9c4"
              emissiveIntensity={selected || hover ? 0.25 : 0}
            />
          </mesh>
        ) : null}
        {data.form === "stack" ? (
          <group>
            {[
              { y: -0.14, r: 0.17 },
              { y: 0.05, r: 0.13 },
              { y: 0.21, r: 0.09 },
            ].map((s, i) => (
              <mesh
                key={i}
                position={[0, s.y, 0]}
                castShadow
                onClick={select}
                onPointerOver={over}
                onPointerOut={out}
              >
                <icosahedronGeometry args={[s.r, 0]} />
                <meshStandardMaterial
                  color="#4a4a52"
                  roughness={0.7}
                  emissive="#ffffff"
                  emissiveIntensity={selected || hover ? 0.18 : 0}
                />
              </mesh>
            ))}
          </group>
        ) : null}
        {data.form === "twin" ? (
          <mesh castShadow onClick={select} onPointerOver={over} onPointerOut={out}>
            <octahedronGeometry args={[0.13]} />
            <meshStandardMaterial
              ref={twinMat}
              color="#7dd8a8"
              emissive="#7dd8a8"
              emissiveIntensity={1.4}
              roughness={0.2}
            />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}
