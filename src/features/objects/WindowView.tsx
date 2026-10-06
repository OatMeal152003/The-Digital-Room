"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import linksRaw from "../../content/links.json";
import { signalSchema } from "../../types/content";
import { roomEvents } from "../room/roomEvents";
import { useRoomStore } from "../room/store";

const links = linksRaw.map((l) => signalSchema.parse(l));

export function WindowView() {
  const active = useRoomStore((s) => s.active);
  const setActive = useRoomStore((s) => s.setActive);
  const [hover, setHover] = useState(false);
  const city = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!city.current) return;
    const t = clock.getElapsedTime();
    const now = Date.now();
    const mix2 = useRoomStore.getState().mix[2] ?? 0.3;
    // a pulse wave crosses the courtyard when the room performs
    const waveAge = now - roomEvents.pulseAt;
    const wavePos = waveAge < 2400 ? (waveAge / 2400) * (links.length + 4) - 2 : -99;
    city.current.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const base = 0.35 + 0.3 * mix2 + 0.25 * Math.sin(t * (0.6 + i * 0.23) + i * 1.7);
      const wave = Math.exp(-((i - wavePos) ** 2) / 1.5) * 0.9;
      m.opacity = Math.min(1, Math.max(0.15, base + wave));
    });
  });

  return (
    <group position={[1.2, 1.7, -3.55]}>
      {/* frame */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          setActive("window");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[3.4, 2.1, 0.12]} />
        <meshStandardMaterial
          color="#141417"
          roughness={0.7}
          emissive="#8fb4ff"
          emissiveIntensity={active === "window" ? 0.25 : hover ? 0.1 : 0}
        />
      </mesh>
      {/* glass / sky */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.1, 1.8]} />
        <meshBasicMaterial color="#070b16" toneMapped={false} />
      </mesh>
      {/* distant city lights */}
      <group ref={city} position={[0, -0.3, 0.09]}>
        {links.map((link, i) => (
          <mesh key={link.no} position={[-1 + i * 1.0, (i % 2) * 0.25, 0]}>
            <boxGeometry args={[0.5, 0.5 + (i % 3) * 0.3, 0.02]} />
            <meshBasicMaterial color="#ffd9a0" transparent opacity={0.8} toneMapped={false} />
          </mesh>
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh
            key={`star-${i}`}
            position={[(i * 0.37) % 3 - 1.5, ((i * 0.53) % 1.4) - 0.2, 0]}
          >
            <planeGeometry args={[0.03, 0.03]} />
            <meshBasicMaterial color="#9fd8ff" transparent opacity={0.7} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* mullions */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.05, 1.8, 0.02]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[3.1, 0.05, 0.02]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.6} />
      </mesh>
    </group>
  );
}
