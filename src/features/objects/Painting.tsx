"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Painting as PaintingData } from "../../types/content";
import { usePrefersReducedMotion } from "../room/usePrefersReducedMotion";
import { useRoomStore } from "../room/store";

// A seeded pseudo-random generator so each painting is stable per evening.
function mulberry(seed: number): () => number {
  let a = seed * 1000 + 7;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Painting({ data, position }: { data: PaintingData; position: [number, number, number] }) {
  const setGallery = useRoomStore((s) => s.setGallery);
  const setActive = useRoomStore((s) => s.setActive);
  const gallery = useRoomStore((s) => s.gallery);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(false);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const photoRef = useRef<THREE.Texture | null>(null);
  const [ready, setReady] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const [hover, setHover] = useState(false);
  const selected = gallery?.kind === "painting" && gallery.no === data.no;
  // the canvas brightens under the cursor: hover always means "this opens"
  const glow = hover ? 0.8 : 0.55;

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rand = mulberry(data.seed);
    const [deep, mid, light] = data.palette;
    const grad = ctx.createLinearGradient(0, 0, 0, 96);
    grad.addColorStop(0, deep);
    grad.addColorStop(0.55, mid);
    grad.addColorStop(1, deep);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 96);
    // translucent strokes, like something remembered, not seen
    for (let i = 0; i < 42; i++) {
      ctx.fillStyle = rand() > 0.5 ? light : mid;
      ctx.globalAlpha = 0.05 + rand() * 0.12;
      const w = 6 + rand() * 40;
      const h = 1 + rand() * 5;
      ctx.fillRect(rand() * 128, rand() * 96, w, h);
    }
    ctx.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;
    setReady(true);
    return () => {
      texture.dispose();
      textureRef.current = null;
    };
  }, [data]);

  // A hung photograph replaces the generative study. If the file is
  // missing or corrupt, the study stays — the wall never goes blank.
  useEffect(() => {
    if (!data.image) return;
    const loader = new THREE.TextureLoader();
    let alive = true;
    loader.load(
      data.image,
      (tex) => {
        if (!alive) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        photoRef.current = tex;
        setPhotoReady(true);
      },
      undefined,
      () => {
        // keep the generative study
      },
    );
    return () => {
      alive = false;
      photoRef.current?.dispose();
      photoRef.current = null;
    };
  }, [data.image]);

  useFrame(({ clock }) => {
    if (photoRef.current) return; // photographs hang still, like a real museum
    const texture = textureRef.current;
    if (!texture || reducedRef.current) return;
    // almost imperceptible drift; visitors argue about whether it moved
    texture.offset.x = Math.sin(clock.getElapsedTime() * 0.05 + data.seed) * 0.012;
  });

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* gilt-dark frame */}
      <mesh castShadow>
        <boxGeometry args={[1.4, 1.0, 0.07]} />
        <meshStandardMaterial color="#3a2f1d" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh
        position={[0, 0, 0.048]}
        onClick={(e) => {
          e.stopPropagation();
          // active rides along so Esc closes the card before anything else;
          // setActive runs first because it toggles when handed its own state
          setActive(selected ? null : "painting");
          setGallery("painting", selected ? null : data.no);
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
        <planeGeometry args={[1.26, 0.86]} />
        {photoReady && photoRef.current ? (
          <meshStandardMaterial
            map={photoRef.current}
            emissiveMap={photoRef.current}
            emissive="#ffffff"
            emissiveIntensity={glow}
            roughness={0.9}
          />
        ) : ready && textureRef.current ? (
          <meshStandardMaterial
            map={textureRef.current}
            emissiveMap={textureRef.current}
            emissive="#ffffff"
            emissiveIntensity={glow}
            roughness={0.9}
          />
        ) : (
          <meshBasicMaterial color="#101418" toneMapped={false} />
        )}
      </mesh>
      {/* quiet highlight when chosen */}
      {selected ? (
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[1.36, 0.96]} />
          <meshBasicMaterial color="#ffe9c4" transparent opacity={0.08} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}
