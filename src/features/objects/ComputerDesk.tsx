"use client";

import { useState } from "react";
import { useRoomStore } from "../room/store";
import { DreamScreen } from "./DreamScreen";

export function ComputerDesk() {
  const active = useRoomStore((s) => s.active);
  const setActive = useRoomStore((s) => s.setActive);
  const [hover, setHover] = useState(false);
  const on = active === "computer";

  return (
    <group position={[-2.2, 0, 0.4]}>
      {/* desk top */}
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.08, 1.0]} />
        <meshStandardMaterial color="#232326" roughness={0.7} />
      </mesh>
      {/* legs */}
      {[[-1, 0.3], [1, 0.3], [-1, -0.3], [1, -0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.38, z]}>
          <boxGeometry args={[0.07, 0.76, 0.07]} />
          <meshStandardMaterial color="#17171a" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {/* monitor foot + neck */}
      <mesh position={[0, 0.84, -0.14]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.32]} />
        <meshStandardMaterial color="#101012" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, -0.2]}>
        <boxGeometry args={[0.1, 0.3, 0.08]} />
        <meshStandardMaterial color="#101012" roughness={0.6} />
      </mesh>
      {/* monitor head: bezel with the living screen recessed into it,
          tilted back the way displays sit */}
      <group position={[0, 1.34, -0.22]} rotation={[-0.06, 0, 0]}>
        <mesh
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            setActive("computer");
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
          <boxGeometry args={[1.3, 0.8, 0.05]} />
          <meshStandardMaterial
            color="#0a0a0c"
            roughness={0.4}
            emissive="#9fd8ff"
            emissiveIntensity={on ? 0.5 : hover ? 0.25 : 0.08}
          />
        </mesh>
        {/* living screen face */}
        <DreamScreen on={on} />
        {/* power LED: amber standby, green when the browser is open */}
        <mesh position={[0.58, -0.36, 0.028]}>
          <boxGeometry args={[0.04, 0.015, 0.01]} />
          <meshBasicMaterial
            color={on ? "#7dd8a8" : "#ffb86b"}
            toneMapped={false}
          />
        </mesh>
      </group>
      {/* keyboard */}
      <mesh position={[0, 0.84, 0.22]}>
        <boxGeometry args={[0.9, 0.04, 0.3]} />
        <meshStandardMaterial color="#151518" roughness={0.8} />
      </mesh>
      {/* desk lamp glow dot */}
      <mesh position={[0.95, 1.05, -0.2]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#ffb86b" toneMapped={false} />
      </mesh>
    </group>
  );
}
