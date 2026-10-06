"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { roomEvents } from "./roomEvents";
import { useRoomStore } from "./store";

export function Lighting() {
  const environment = useRoomStore((s) => s.environment);
  const active = useRoomStore((s) => s.active);
  const playing = useRoomStore((s) => s.playing);
  const location = useRoomStore((s) => s.location);
  const ambient = useRef<THREE.AmbientLight>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const screen = useRef<THREE.PointLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const warm = useRef(new THREE.Color("#ffb86b"));
  const green = useRef(new THREE.Color("#a8e6c3"));

  useFrame((_, delta) => {
    const studio = environment === "studio" ? 1 : 0;
    const mix = useRoomStore.getState().mix;
    const k = 1 - Math.exp(-2.5 * delta);
    // lamp flicker: the room denies it afterwards
    const flicker = Date.now() - roomEvents.flickerAt < 400 ? 0.3 : 1;
    if (ambient.current) {
      ambient.current.intensity = THREE.MathUtils.lerp(
        ambient.current.intensity,
        0.22 + studio * 0.55 + (location === "hall" ? 0.25 : 0),
        k,
      );
    }
    if (lamp.current) {
      lamp.current.intensity =
        THREE.MathUtils.lerp(
          lamp.current.intensity,
          6 + mix[1] * 9 + (active === "record" || playing ? 4 : 0) + studio * 8,
          k,
        ) * flicker;
      // the lamps listen: drift warm while the piece plays
      lamp.current.color.lerp(playing ? green.current : warm.current, k * 0.6);
    }
    if (screen.current) {
      screen.current.intensity = THREE.MathUtils.lerp(
        screen.current.intensity,
        1.2 + mix[0] * 3 + (active === "computer" ? 3 : 0),
        k,
      );
    }
    if (moon.current) {
      moon.current.intensity = THREE.MathUtils.lerp(
        moon.current.intensity,
        0.4 + mix[2] * 1.2 + studio * 0.9,
        k,
      );
    }
  });

  return (
    <group>
      <ambientLight ref={ambient} intensity={0.22} color="#cfd4dc" />
      <pointLight
        ref={lamp}
        position={[2.6, 2.2, 1.6]}
        color="#ffb86b"
        intensity={9}
        distance={12}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        ref={screen}
        position={[-2.2, 1.5, 1.1]}
        color="#9fd8ff"
        intensity={2.2}
        distance={5}
        decay={2}
      />
      <directionalLight
        ref={moon}
        position={[1.5, 3.2, -4.5]}
        color="#8fb4ff"
        intensity={0.5}
      />
      <pointLight
        position={[-3.4, 2.2, -1.6]}
        color="#ffe9c4"
        intensity={active === "door" ? 6 : 0.6}
        distance={6}
      />
    </group>
  );
}
