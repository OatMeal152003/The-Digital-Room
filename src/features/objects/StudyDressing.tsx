"use client";

// Static dressing for the study zone: drape panels framing the window bay
// and a wall shelf with a book stack by the desk. Nothing here is
// interactive and nothing moves — it is architecture, not exhibit.
export function StudyDressing() {
  return (
    <group>
      {/* drape panels, window bay */}
      {[-0.85, 3.25].map((x) => (
        <mesh key={x} position={[x, 1.4, -3.42]}>
          <boxGeometry args={[0.5, 2.7, 0.22]} />
          <meshStandardMaterial color="#161216" roughness={1} />
        </mesh>
      ))}
      {/* wall shelf by the desk */}
      <mesh position={[-2.2, 1.9, -3.42]} castShadow>
        <boxGeometry args={[1.2, 0.06, 0.3]} />
        <meshStandardMaterial color="#2a2118" roughness={0.8} />
      </mesh>
      {[-2.7, -1.7].map((x) => (
        <mesh key={x} position={[x, 1.75, -3.5]}>
          <boxGeometry args={[0.05, 0.25, 0.05]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.7} />
        </mesh>
      ))}
      {[
        { y: 1.968, c: "#3f4a5b" },
        { y: 2.041, c: "#5b4a3f" },
        { y: 2.114, c: "#4a5b43" },
      ].map((b, i) => (
        <mesh key={i} position={[-2.45, b.y, -3.42]} castShadow>
          <boxGeometry args={[0.34, 0.07, 0.24]} />
          <meshStandardMaterial color={b.c} roughness={0.75} />
        </mesh>
      ))}
      {/* small brass object beside the stack */}
      <mesh position={[-1.85, 1.99, -3.42]}>
        <cylinderGeometry args={[0.04, 0.05, 0.12, 16]} />
        <meshStandardMaterial color="#8a7340" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}
