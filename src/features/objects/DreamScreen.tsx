"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "../room/usePrefersReducedMotion";

interface Dot {
  x: number;
  y: number;
  s: number;
  v: number;
}

export function DreamScreen({ on }: { on: boolean }) {
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(false);
  const onRef = useRef(on);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    onRef.current = on;
  }, [on]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#050c14";
    ctx.fillRect(0, 0, 160, 96);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    dotsRef.current = Array.from({ length: 26 }, () => ({
      x: Math.random() * 160,
      y: Math.random() * 96,
      s: Math.random() * 1.6 + 0.4,
      v: Math.random() * 8 + 3,
    }));
    canvasRef.current = canvas;
    textureRef.current = texture;
    setReady(true);
    return () => {
      texture.dispose();
      textureRef.current = null;
      canvasRef.current = null;
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture || reducedRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const live = onRef.current;
    ctx.fillStyle = "rgba(5,12,20,0.28)";
    ctx.fillRect(0, 0, 160, 96);
    const speed = live ? 1.8 : 0.7;
    ctx.fillStyle = live ? "#cfeaff" : "#4a6a86";
    for (const d of dotsRef.current) {
      d.y -= d.v * speed * delta;
      if (d.y < 0) {
        d.y = 96;
        d.x = Math.random() * 160;
      }
      ctx.fillRect(d.x, d.y, d.s, d.s);
    }
    ctx.fillStyle = live ? "rgba(159,216,255,0.5)" : "rgba(90,120,150,0.35)";
    ctx.fillRect(0, 60 + Math.sin(clock.getElapsedTime() * 0.6) * 4, 160, 1);
    texture.needsUpdate = true;
  });

  return (
    // recessed into the bezel: the head group carries position and tilt
    <mesh position={[0, 0, 0.028]}>
      <planeGeometry args={[1.18, 0.68]} />
      {ready && textureRef.current ? (
        <meshBasicMaterial
          map={textureRef.current}
          toneMapped={false}
          color={on ? "#ffffff" : "#9db8cc"}
        />
      ) : (
        <meshBasicMaterial color="#0e1a26" toneMapped={false} />
      )}
    </mesh>
  );
}
