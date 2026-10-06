"use client";

import { Html } from "@react-three/drei";
import { useRoomStore } from "./store";

export function EntranceLabel() {
  const visited = useRoomStore((s) => s.visited);
  const active = useRoomStore((s) => s.active);
  const location = useRoomStore((s) => s.location);
  if (visited.length > 0 || active || location !== "room") return null;

  return (
    <Html position={[0, 1.0, 4.4]} center distanceFactor={9} zIndexRange={[5, 0]}>
      <div
        style={{
          pointerEvents: "none",
          whiteSpace: "nowrap",
          fontSize: 11,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#8a8783",
          textAlign: "center",
        }}
      >
        Eight exhibits · please move quietly
      </div>
    </Html>
  );
}
