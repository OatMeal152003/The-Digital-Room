"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useRoomStore } from "../room/store";
import type { ExhibitId } from "../room/types";

const MARKERS: { id: ExhibitId; position: [number, number, number] }[] = [
  { id: "computer", position: [-2.2, 2.05, 0.4] },
  { id: "book", position: [2.5, 2.15, 0.2] },
  { id: "record", position: [2.3, 1.75, -2.2] },
  { id: "camera", position: [-1.5, 1.35, 0.5] },
  { id: "door", position: [-3.7, 2.5, -1.6] },
  { id: "window", position: [1.2, 3.0, -3.4] },
  { id: "drawer", position: [-0.85, 1.05, 0.4] },
];

// The wall switch is not an exhibit with a placard, so it tracks its own
// discovery: the marker retires the first time the lamps are flipped.
function SwitchMarker({ position, seed }: { position: [number, number, number]; seed: number }) {
  const touched = useRoomStore((s) => s.switchTouched);
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!group.current || !mat.current || touched) return;
    const t = clock.getElapsedTime() + seed * 1.7;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2);
    group.current.scale.setScalar(1 + 0.35 * pulse);
    mat.current.opacity = 0.25 + 0.45 * pulse;
  });

  if (touched) return null;

  return (
    <group ref={group} position={position}>
      <mesh>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial ref={mat} color="#ffe9c4" transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Marker({ id, position, seed }: { id: ExhibitId; position: [number, number, number]; seed: number }) {
  const visited = useRoomStore((s) => s.visited.includes(id));
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!group.current || !mat.current || visited) return;
    const t = clock.getElapsedTime() + seed * 1.7;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2);
    group.current.scale.setScalar(1 + 0.35 * pulse);
    mat.current.opacity = 0.25 + 0.45 * pulse;
  });

  if (visited) return null;

  return (
    <group ref={group} position={position}>
      <mesh>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial ref={mat} color="#ffe9c4" transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function ExhibitMarkers() {
  return (
    <group>
      {MARKERS.map((m, i) => (
        <Marker key={m.id} id={m.id} position={m.position} seed={i} />
      ))}
      <SwitchMarker position={[-3.95, 1.95, -0.5]} seed={MARKERS.length} />
    </group>
  );
}
