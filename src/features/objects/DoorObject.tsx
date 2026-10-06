"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { roomEvents } from "../room/roomEvents";
import { useRoomStore } from "../room/store";

export function DoorObject() {
  const active = useRoomStore((s) => s.active);
  const doorAjar = useRoomStore((s) => s.doorAjar);
  const startWalkIn = useRoomStore((s) => s.startWalkIn);
  const [hover, setHover] = useState(false);
  const panel = useRef<THREE.Group>(null);
  const slit = useRef<THREE.MeshBasicMaterial>(null);
  const open = active === "door" || doorAjar;

  useFrame((_, delta) => {
    if (!panel.current) return;
    // the door breathes: 5 degrees ajar for three seconds, then settles
    const breathing = Date.now() - roomEvents.breathAt < 3000;
    panel.current.rotation.y = THREE.MathUtils.lerp(
      panel.current.rotation.y,
      open ? -1.15 : breathing ? -0.09 : 0,
      1 - Math.exp(-2.2 * delta),
    );
    if (slit.current) {
      slit.current.opacity = THREE.MathUtils.lerp(
        slit.current.opacity,
        open ? 0.5 : 0.14,
        1 - Math.exp(-3 * delta),
      );
    }
  });

  return (
    <group position={[-4.15, 0, -1.6]} rotation={[0, Math.PI / 2, 0]}>
      {/* frame */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[1.3, 2.7, 0.14]} />
        <meshStandardMaterial color="#191920" roughness={0.8} />
      </mesh>
      {/* the hall beyond supplies its own light; no backing plane */}
      {/* rotating panel */}
      <group ref={panel} position={[-0.52, 0, 0.02]}>
        <mesh
          position={[0.52, 1.3, 0.05]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            startWalkIn();
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
          <boxGeometry args={[1.0, 2.45, 0.08]} />
          <meshStandardMaterial
            color="#232329"
            roughness={0.7}
            emissive="#ffe9c4"
            emissiveIntensity={open ? 0.12 : hover ? 0.15 : 0}
          />
        </mesh>
        <mesh position={[0.85, 1.3, 0.1]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#c9a86a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* light under the door: a slit when closed, a beckoning pour when open */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0.15]}>
        <planeGeometry args={[1.2, 0.25]} />
        <meshBasicMaterial ref={slit} color="#ffdf9e" transparent opacity={0.14} toneMapped={false} />
      </mesh>
    </group>
  );
}
