"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import paintingsRaw from "../../content/paintings.json";
import sculpturesRaw from "../../content/sculptures.json";
import { paintingSchema, sculptureSchema } from "../../types/content";
import { Painting } from "../objects/Painting";
import { Sculpture } from "../objects/Sculpture";
import { useRoomStore } from "./store";

const paintings = paintingsRaw.map((p) => paintingSchema.parse(p));
const sculptures = sculpturesRaw.map((s) => sculptureSchema.parse(s));

const PAINTING_POS = [
  { z: -2.3, y: 2.15 },
  { z: -0.6, y: 2.15 },
  { z: -2.3, y: 0.9 },
  { z: -0.6, y: 0.9 },
];
const SCULPTURE_X = [-6.3, -7.3, -8.3];
const SCULPTURE_Z = -3.35;

function TrackLights() {
  const lights = useRef<(THREE.PointLight | null)[]>([]);

  useFrame((_, delta) => {
    const mix1 = useRoomStore.getState().mix[1] ?? 0.5;
    const k = 1 - Math.exp(-2.5 * delta);
    for (const l of lights.current) {
      if (!l) continue;
      l.intensity = THREE.MathUtils.lerp(l.intensity, 2.5 + mix1 * 5, k);
    }
  });

  return (
    <group>
      {SCULPTURE_X.map((x, i) => (
        <pointLight
          key={`s-${i}`}
          ref={(l) => {
            lights.current[i] = l;
          }}
          position={[x, 2.6, SCULPTURE_Z]}
          color="#ffe9c4"
          intensity={4}
          distance={5}
          decay={2}
        />
      ))}
      <pointLight
        ref={(l) => {
          lights.current[3] = l;
        }}
        position={[-8.4, 2.6, -1.6]}
        color="#ffe9c4"
        intensity={4}
        distance={6}
        decay={2}
      />
    </group>
  );
}

// Warm spill through the doorway: a slit when closed, a pour when open.
function DoorSpill() {
  const spill = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (!spill.current) return;
    const ajar = useRoomStore.getState().doorAjar;
    const k = 1 - Math.exp(-3 * delta);
    spill.current.intensity = THREE.MathUtils.lerp(
      spill.current.intensity,
      ajar ? 6 : 0.5,
      k,
    );
  });

  return (
    <pointLight
      ref={spill}
      position={[-4.7, 1.8, -1.6]}
      color="#ffe9c4"
      intensity={0.75}
      distance={5}
      decay={2}
    />
  );
}

function ReturnPlacard() {
  const setActive = useRoomStore((s) => s.setActive);
  const [hover, setHover] = useState(false);
  return (
    <mesh
      position={[-4.32, 1.5, -0.72]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setActive("door");
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
      <boxGeometry args={[0.34, 0.22, 0.03]} />
      <meshStandardMaterial
        color="#8a7340"
        metalness={0.8}
        roughness={0.35}
        emissive="#ffe9c4"
        emissiveIntensity={hover ? 0.55 : 0.25}
      />
    </mesh>
  );
}

function WallLabel({ z, y, no }: { z: number; y: number; no: string }) {
  const setActive = useRoomStore((s) => s.setActive);
  const setGallery = useRoomStore((s) => s.setGallery);
  const [hover, setHover] = useState(false);
  return (
    <mesh
      position={[-9.28, y, z]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        // setActive first: it toggles when handed its own state
        setActive("painting");
        setGallery("painting", no);
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
      <planeGeometry args={[0.22, 0.14]} />
      <meshBasicMaterial color={hover ? "#ffe9c4" : "#c9b98a"} toneMapped={false} />
    </mesh>
  );
}

export function GalleryHall() {
  const [benchHover, setBenchHover] = useState(false);
  return (
    <group>
      {/* floor */}
      <mesh position={[-6.8, -0.04, -1.4]} receiveShadow>
        <boxGeometry args={[5.2, 0.08, 4.8]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.6} />
      </mesh>
      {/* runner rug down the center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.8, 0.005, -1.4]} receiveShadow>
        <planeGeometry args={[4.4, 1.3]} />
        <meshStandardMaterial color="#2b2320" roughness={1} />
      </mesh>
      {/* ceiling + track rail + spot heads */}
      <mesh position={[-6.8, 3.0, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 4.8]} />
        <meshStandardMaterial color="#0b0b0d" roughness={1} />
      </mesh>
      <mesh position={[-6.8, 2.9, -1.6]}>
        <boxGeometry args={[4.6, 0.06, 0.1]} />
        <meshStandardMaterial color="#232326" metalness={0.7} roughness={0.4} />
      </mesh>
      {[-8.4, -7.5, -6.6, -5.8].map((x) => (
        <mesh key={x} position={[x, 2.84, -1.9]}>
          <cylinderGeometry args={[0.05, 0.07, 0.12, 12]} />
          <meshStandardMaterial
            color="#111114"
            emissive="#ffe9c4"
            emissiveIntensity={1.2}
            roughness={0.5}
          />
        </mesh>
      ))}
      {/* far wall: the collection hangs here */}
      <mesh position={[-9.4, 1.5, -1.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.8, 3.0]} />
        <meshStandardMaterial color="#16161a" roughness={0.9} />
      </mesh>
      {/* side walls */}
      <mesh position={[-6.8, 1.5, -3.8]}>
        <planeGeometry args={[5.2, 3.0]} />
        <meshStandardMaterial color="#121215" roughness={0.9} />
      </mesh>
      <mesh position={[-6.8, 1.5, 1.0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[5.2, 3.0]} />
        <meshStandardMaterial color="#121215" roughness={0.9} />
      </mesh>
      {/* baseboards */}
      {[
        { p: [-9.38, 0.09, -1.4] as const, r: [0, Math.PI / 2, 0] as const, w: 4.8 },
        { p: [-6.8, 0.09, -3.78] as const, r: [0, 0, 0] as const, w: 5.2 },
        { p: [-6.8, 0.09, 0.98] as const, r: [0, 0, 0] as const, w: 5.2 },
      ].map((b, i) => (
        <mesh key={i} position={[b.p[0], b.p[1], b.p[2]]} rotation={[b.r[0], b.r[1], b.r[2]]}>
          <boxGeometry args={[b.w, 0.18, 0.04]} />
          <meshStandardMaterial color="#232227" roughness={0.7} />
        </mesh>
      ))}
      {/* warm wall washers so the walls read as surfaces */}
      {[
        [-5.4, -3.3],
        [-8.2, -3.3],
        [-5.4, 0.5],
        [-8.2, 0.5],
      ].map(([x, z], i) => (
        <pointLight
          key={i}
          position={[x, 2.2, z]}
          color="#ffd9a8"
          intensity={2.2}
          distance={4.5}
          decay={2}
        />
      ))}
      {/* doorway jambs */}
      <mesh position={[-4.3, 1.35, -2.3]}>
        <boxGeometry args={[0.3, 2.7, 0.12]} />
        <meshStandardMaterial color="#191920" roughness={0.8} />
      </mesh>
      <mesh position={[-4.3, 1.35, -0.9]}>
        <boxGeometry args={[0.3, 2.7, 0.12]} />
        <meshStandardMaterial color="#191920" roughness={0.8} />
      </mesh>
      {/* portal architrave, hall side */}
      {[
        { p: [-4.47, 1.35, -2.42] as const, s: [0.08, 2.7, 0.1] as const },
        { p: [-4.47, 1.35, -0.78] as const, s: [0.08, 2.7, 0.1] as const },
        { p: [-4.47, 2.75, -1.6] as const, s: [0.08, 0.1, 1.74] as const },
      ].map((t, i) => (
        <mesh key={i} position={[t.p[0], t.p[1], t.p[2]]}>
          <boxGeometry args={[t.s[0], t.s[1], t.s[2]]} />
          <meshStandardMaterial color="#1e1e22" roughness={0.6} />
        </mesh>
      ))}

      <TrackLights />
      <DoorSpill />

      {/* museum bench: click to sit and face the sculptures */}
      <group position={[-7.0, 0, 0.1]}>
        <mesh
          position={[0, 0.45, 0]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            const s = useRoomStore.getState();
            s.close();
            s.toggleSeated();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setBenchHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setBenchHover(false);
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[1.4, 0.1, 0.45]} />
          <meshStandardMaterial
            color="#241f1a"
            roughness={0.8}
            emissive="#ffe9c4"
            emissiveIntensity={benchHover ? 0.18 : 0}
          />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.4, 0.4]} />
            <meshStandardMaterial color="#17171a" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* north-wall ledge: an oak console with book stacks and one green
          stone, for the bench-sitter to discover over a shoulder */}
      <group>
        <mesh position={[-6.8, 0.85, 0.825]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.08, 0.35]} />
          <meshStandardMaterial color="#2a2118" roughness={0.8} />
        </mesh>
        {[-8.0, -5.6].map((x) => (
          <mesh key={x} position={[x, 0.41, 0.9]}>
            <boxGeometry args={[0.08, 0.84, 0.08]} />
            <meshStandardMaterial color="#1a1a1e" roughness={0.7} />
          </mesh>
        ))}
        {[
          { x: -7.6, y: 0.928, r: 0.05, c: "#5b4a3f" },
          { x: -7.58, y: 0.998, r: -0.04, c: "#3f4a5b" },
          { x: -7.62, y: 1.068, r: 0.08, c: "#4a5b43" },
          { x: -6.1, y: 0.928, r: -0.06, c: "#5b3f4a" },
          { x: -6.08, y: 0.998, r: 0.03, c: "#5b4a3f" },
        ].map((b, i) => (
          <mesh key={i} position={[b.x, b.y, 0.825]} rotation={[0, b.r, 0]} castShadow>
            <boxGeometry args={[0.34, 0.07, 0.24]} />
            <meshStandardMaterial color={b.c} roughness={0.75} />
          </mesh>
        ))}
        {/* the ledge stone: kin of the drawer's, quieter */}
        <mesh position={[-6.85, 0.95, 0.825]}>
          <octahedronGeometry args={[0.06]} />
          <meshStandardMaterial
            color="#7dd8a8"
            emissive="#7dd8a8"
            emissiveIntensity={1.1}
            roughness={0.2}
          />
        </mesh>
      </group>

      {paintings.map((p, i) => {
        const pos = PAINTING_POS[i] ?? { z: -1.6, y: 1.6 };
        return <Painting key={p.no} data={p} position={[-9.3, pos.y, pos.z]} />;
      })}
      {paintings.map((p, i) => {
        const pos = PAINTING_POS[i] ?? { z: -1.6, y: 1.6 };
        return <WallLabel key={p.no} z={pos.z} y={pos.y - 0.68} no={p.no} />;
      })}
      {sculptures.map((s, i) => (
        <Sculpture key={s.no} data={s} position={[SCULPTURE_X[i] ?? -6.4, 0, SCULPTURE_Z]} />
      ))}
      {/* uplight discs under each pedestal */}
      {SCULPTURE_X.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, SCULPTURE_Z]}>
          <circleGeometry args={[0.5, 24]} />
          <meshBasicMaterial color="#3a2f1d" toneMapped={false} />
        </mesh>
      ))}
      {/* the Twin's niche: a lit recess so the far row ends in a destination */}
      <mesh position={[-8.3, 1.3, -3.78]}>
        <planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial color="#1d2b22" toneMapped={false} />
      </mesh>

      <ReturnPlacard />
    </group>
  );
}
