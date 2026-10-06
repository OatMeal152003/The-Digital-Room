"use client";

import { ContactShadows } from "@react-three/drei";

export function RoomShell() {
  return (
    <group>
      <fog attach="fog" args={["#060607", 9, 20]} />
      {/* Floor — runs forward past the entrance pose so the reveal dolly is
          always over floor, never over the void */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3]} receiveShadow>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#131315" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.6]} receiveShadow>
        <planeGeometry args={[6.4, 4.6]} />
        <meshStandardMaterial color="#1d1d20" roughness={1} />
      </mesh>
      {/* Runner: the floor leads the eye from the rug to the exhibition hall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.67, 0.015, -1.6]} receiveShadow>
        <planeGeometry args={[0.95, 1.0]} />
        <meshStandardMaterial color="#2b2320" roughness={1} />
      </mesh>
      {/* Skirting, same profile as the hall */}
      {[
        { p: [0, 0.09, -3.57] as const, r: [0, 0, 0] as const, w: 8.4 },
        { p: [4.17, 0.09, 1.5] as const, r: [0, -Math.PI / 2, 0] as const, w: 10 },
        { p: [-4.17, 0.09, -2.925] as const, r: [0, Math.PI / 2, 0] as const, w: 1.15 },
        { p: [-4.17, 0.09, 2.825] as const, r: [0, Math.PI / 2, 0] as const, w: 7.35 },
      ].map((s, i) => (
        <mesh key={i} position={[s.p[0], s.p[1], s.p[2]]} rotation={[s.r[0], s.r[1], s.r[2]]} receiveShadow>
          <boxGeometry args={[s.w, 0.18, 0.04]} />
          <meshStandardMaterial color="#232227" roughness={0.7} />
        </mesh>
      ))}
      {/* Brass threshold in the doorway */}
      <mesh position={[-4.2, 0.01, -1.6]}>
        <boxGeometry args={[0.3, 0.02, 1.4]} />
        <meshStandardMaterial color="#8a7340" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* Portal architrave, room side */}
      {[
        { p: [-4.16, 1.35, -2.36] as const, s: [0.06, 2.7, 0.1] as const },
        { p: [-4.16, 1.35, -0.84] as const, s: [0.06, 2.7, 0.1] as const },
        { p: [-4.16, 2.75, -1.6] as const, s: [0.06, 0.1, 1.62] as const },
      ].map((t, i) => (
        <mesh key={i} position={[t.p[0], t.p[1], t.p[2]]}>
          <boxGeometry args={[t.s[0], t.s[1], t.s[2]]} />
          <meshStandardMaterial color="#1e1e22" roughness={0.6} />
        </mesh>
      ))}
      {/* Back wall */}
      <mesh position={[0, 2.2, -3.6]} receiveShadow>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial color="#101013" roughness={0.95} />
      </mesh>
      {/* Left wall (door wall) with a real opening for the exhibition hall.
          Opening: z -2.3..-0.9, y 0..2.7 */}
      <mesh position={[-4.2, 2.2, -4.15]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3.7, 4.4]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.95} />
      </mesh>
      <mesh position={[-4.2, 2.2, 5.55]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[12.9, 4.4]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.95} />
      </mesh>
      <mesh position={[-4.2, 3.55, -1.6]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[1.4, 1.7]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[4.2, 2.2, 3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[18, 4.4]} />
        <meshStandardMaterial color="#0d0d0f" roughness={0.95} />
      </mesh>
      {/* Ceiling hint */}
      <mesh position={[0, 4.1, 3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 18]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      {/* Floor lamp pole + shade */}
      <group position={[2.9, 0, 1.8]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.05, 2.2, 12]} />
          <meshStandardMaterial color="#2a2a2e" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 2.25, 0]}>
          <coneGeometry args={[0.42, 0.5, 24, 1, true]} />
          <meshStandardMaterial
            color="#f5c98a"
            emissive="#ffb86b"
            emissiveIntensity={0.55}
            side={2}
            roughness={0.6}
          />
        </mesh>
      </group>
      <ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={12} blur={2.4} far={4} />
    </group>
  );
}
