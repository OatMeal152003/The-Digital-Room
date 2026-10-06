"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { clamp01, mixControl, mixFromT, tFromMix } from "../room/mixControl";
import { roomEvents } from "../room/roomEvents";
import { useRoomStore } from "../room/store";

export function RecordPlayer() {
  const playing = useRoomStore((s) => s.playing);
  const togglePlaying = useRoomStore((s) => s.togglePlaying);
  const setActive = useRoomStore((s) => s.setActive);
  const active = useRoomStore((s) => s.active);
  const [hover, setHover] = useState(false);
  const vinyl = useRef<THREE.Mesh>(null);
  const arm = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (vinyl.current && playing) {
      vinyl.current.rotation.y += delta * 2.2;
    }
    if (arm.current) {
      const k = 1 - Math.exp(-6 * delta);
      arm.current.rotation.y = THREE.MathUtils.lerp(
        arm.current.rotation.y,
        -1.05 + mixControl.t * 0.9,
        k,
      );
      // crackle-skip: the arm disagrees with itself for half a second
      if (Date.now() - roomEvents.skipAt < 600) {
        arm.current.rotation.y += Math.sin(Date.now() * 0.05) * 0.05;
      }
    }
  });

  function beginDrag(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    mixControl.dragging = true;
    mixControl.px = e.nativeEvent.clientX;
    mixControl.t = tFromMix(useRoomStore.getState().mix);
    if (useRoomStore.getState().active !== "record") {
      useRoomStore.getState().setActive("record");
    }
  }

  function continueDrag(e: ThreeEvent<PointerEvent>) {
    if (!mixControl.dragging) return;
    e.stopPropagation();
    const dx = e.nativeEvent.clientX - mixControl.px;
    mixControl.px = e.nativeEvent.clientX;
    mixControl.t = clamp01(mixControl.t + dx * 0.003);
    const next = mixFromT(mixControl.t);
    const prev = useRoomStore.getState().mix;
    if (
      Math.abs(next[0] - prev[0]) > 0.01 ||
      Math.abs(next[1] - prev[1]) > 0.01 ||
      Math.abs(next[2] - prev[2]) > 0.01
    ) {
      useRoomStore.getState().setMix(next);
    }
  }

  function endDrag(e: ThreeEvent<PointerEvent>) {
    if (!mixControl.dragging) return;
    e.stopPropagation();
    mixControl.dragging = false;
  }

  return (
    <group position={[2.3, 0, -2.2]}>
      {/* sideboard */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.9, 0.9]} />
        <meshStandardMaterial color="#1b1b1e" roughness={0.8} />
      </mesh>
      {/* plinth */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#26262b" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* vinyl */}
      <mesh
        ref={vinyl}
        position={[-0.12, 1.02, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setActive("record");
          togglePlaying();
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
        <cylinderGeometry args={[0.3, 0.3, 0.03, 40]} />
        <meshStandardMaterial
          color="#0b0b0d"
          roughness={0.35}
          metalness={0.4}
          emissive="#7dd8a8"
          emissiveIntensity={playing ? 0.25 : hover ? 0.12 : 0}
        />
      </mesh>
      {/* label */}
      <mesh position={[-0.12, 1.04, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.035, 24]} />
        <meshStandardMaterial color="#c96f3b" roughness={0.6} />
      </mesh>
      {/* tonearm */}
      <group ref={arm} position={[0.35, 1.02, -0.25]} rotation={[0, -1.05, 0]}>
        <mesh position={[0, 0, 0.3]}>
          <boxGeometry args={[0.04, 0.03, 0.55]} />
          <meshStandardMaterial color="#c9c9ce" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      {/* generous invisible grip around the arm for dragging the mix */}
      <mesh
        position={[0.35, 1.05, 0]}
        visible={false}
        onPointerDown={beginDrag}
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "ew-resize";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[0.5, 0.35, 0.95]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
