"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { useRoomStore } from "../room/store";

export function CameraObject() {
  const active = useRoomStore((s) => s.active);
  const setActive = useRoomStore((s) => s.setActive);
  const [hover, setHover] = useState(false);
  const flash = useRef<THREE.Mesh>(null);
  const on = active === "camera";

  useFrame((_, delta) => {
    if (!flash.current) return;
    const mat = flash.current.material as THREE.MeshBasicMaterial;
    const target = on ? 1 : 0;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 1 - Math.exp(-8 * delta));
  });

  return (
    <group position={[-1.5, 0.82, 0.5]}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <boxGeometry args={[0.34, 0.18, 0.22]} />
        <meshStandardMaterial
          color="#141416"
          roughness={0.5}
          metalness={0.5}
          emissive="#ffffff"
          emissiveIntensity={hover && !on ? 0.15 : 0}
        />
      </mesh>
      <mesh
        position={[0, 0.09, 0.16]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setActive("camera");
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
        <cylinderGeometry args={[0.09, 0.11, 0.12, 24]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.25} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.09, 0.225]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial
          color="#0e2a3d"
          roughness={0.15}
          metalness={0.6}
          emissive="#9fd8ff"
          emissiveIntensity={on ? 1.2 : hover ? 0.5 : 0.2}
        />
      </mesh>
      {/* flash quad */}
      <mesh ref={flash} position={[0, 0.3, 0.4]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}
