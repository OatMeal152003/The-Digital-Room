"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useRoomStore } from "../room/store";

export function DrawerObject() {
  const active = useRoomStore((s) => s.active);
  const setActive = useRoomStore((s) => s.setActive);
  const [hover, setHover] = useState(false);
  const drawer = useRef<THREE.Group>(null);
  const open = active === "drawer";

  useFrame((_, delta) => {
    if (!drawer.current) return;
    drawer.current.position.z = THREE.MathUtils.lerp(
      drawer.current.position.z,
      open ? 0.55 : 0,
      1 - Math.exp(-4 * delta),
    );
  });

  return (
    <group position={[-2.2, 0, 0.4]}>
      {/* cabinet under desk */}
      <mesh position={[1.35, 0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.8]} />
        <meshStandardMaterial color="#1a1a1d" roughness={0.8} />
      </mesh>
      <group ref={drawer} position={[1.35, 0.42, 0]}>
        <mesh
          position={[0, 0, 0.05]}
          onClick={(e) => {
            e.stopPropagation();
            setActive("drawer");
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
          <boxGeometry args={[0.5, 0.22, 0.6]} />
          <meshStandardMaterial
            color="#232327"
            roughness={0.7}
            emissive="#7dd8a8"
            emissiveIntensity={open ? 0.35 : hover ? 0.12 : 0}
          />
        </mesh>
        {/* hidden glow object */}
        <mesh position={[0, 0.05, 0.1]} visible={open}>
          <octahedronGeometry args={[0.09]} />
          <meshStandardMaterial
            color="#7dd8a8"
            emissive="#7dd8a8"
            emissiveIntensity={1.4}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}
