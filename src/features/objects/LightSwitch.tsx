"use client";

import { useState } from "react";
import { useRoomStore } from "../room/store";

export function LightSwitch() {
  const environment = useRoomStore((s) => s.environment);
  const toggleEnvironment = useRoomStore((s) => s.toggleEnvironment);
  const [hover, setHover] = useState(false);
  const studio = environment === "studio";

  return (
    <group position={[-4.17, 1.4, -0.5]} rotation={[0, Math.PI / 2, 0]}>
      {/* plate: ivory with a faint permanent read in the dark */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.44, 0.05]} />
        <meshStandardMaterial
          color="#e8e4dc"
          emissive="#fff8ec"
          emissiveIntensity={0.12}
          roughness={0.6}
        />
      </mesh>
      {/* toggle */}
      <mesh position={[0, studio ? 0.06 : -0.06, 0.04]}>
        <boxGeometry args={[0.14, 0.16, 0.05]} />
        <meshStandardMaterial
          color={studio ? "#ffb86b" : "#2a2a2e"}
          emissive="#ffb86b"
          emissiveIntensity={hover || studio ? 0.9 : 0.35}
          roughness={0.5}
        />
      </mesh>
      {/* pilot light: amber when lit, ember when dark */}
      <mesh position={[0, 0.17, 0.03]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial
          color={studio ? "#ffc06a" : "#5a3a20"}
          toneMapped={false}
        />
      </mesh>
      {/* generous invisible plate around the switch for easy flipping */}
      <mesh
        position={[0, 0, 0.08]}
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          toggleEnvironment();
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
        <boxGeometry args={[0.55, 0.75, 0.3]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
