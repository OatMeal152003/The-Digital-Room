"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAmbience } from "../audio/ambience";
import { ActiveOverlay } from "../objects/ActiveOverlay";
import { BrowserOverlay } from "../objects/BrowserOverlay";
import { CameraGallery } from "../objects/CameraGallery";
import { PaintingCard } from "../objects/PaintingCard";
import { lookOffset } from "./lookOffset";
import { RoomScene } from "./RoomScene";
import { useRoomStore } from "./store";
import { useRoomEvents } from "./useRoomEvents";
import { VisitGuide } from "./VisitGuide";

export function RoomExperience({ live = true }: { live?: boolean }) {
  const close = useRoomStore((s) => s.close);
  const environment = useRoomStore((s) => s.environment);
  const toggleEnvironment = useRoomStore((s) => s.toggleEnvironment);
  const muted = useRoomStore((s) => s.muted);
  const toggleMuted = useRoomStore((s) => s.toggleMuted);
  const active = useRoomStore((s) => s.active);
  const enteredAt = useRoomStore((s) => s.enteredAt);
  const touchLast = useRef<{ x: number; y: number } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  useAmbience();
  useRoomEvents();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (guideOpen) {
        setGuideOpen(false);
        return;
      }
      const s = useRoomStore.getState();
      if (s.active) {
        s.close();
      } else if (s.seated) {
        s.toggleSeated();
      } else if (s.location === "hall") {
        s.startWalkOut();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, guideOpen]);

  return (
    <main
      className={`absolute inset-0 overflow-hidden bg-void${
        // settles into place as the card dissolves, so the room arrives
        // rather than appearing
        enteredAt !== null ? " room-settle" : ""
      }`}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) touchLast.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchMove={(e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest("input,textarea,button,a,form")) return;
        const t = e.touches[0];
        const last = touchLast.current;
        if (!t || !last) return;
        const dx = t.clientX - last.x;
        const dy = t.clientY - last.y;
        touchLast.current = { x: t.clientX, y: t.clientY };
        lookOffset.x = Math.max(-0.7, Math.min(0.7, lookOffset.x + dx * 0.0025));
        lookOffset.y = Math.max(-0.45, Math.min(0.45, lookOffset.y - dy * 0.0025));
      }}
      onTouchEnd={() => {
        touchLast.current = null;
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        // while the title card is up the scene only redraws when it is told
        // to — it still compiles and uploads everything once on mount, then
        // sits idle instead of spinning at 60fps behind an opaque screen
        frameloop={live ? "always" : "demand"}
        camera={{ position: [0, 1.7, 6.8], fov: 42 }}
        gl={{ antialias: true }}
        onPointerMissed={() => {
          if (active) close();
        }}
        fallback={
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="max-w-sm text-sm text-dim">
              This exhibit needs WebGL, and this browser declined to provide
              it. Please try a browser with hardware acceleration enabled.
            </p>
          </div>
        }
      >
        <Suspense fallback={null}>
          <RoomScene />
        </Suspense>
      </Canvas>

      <header className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 text-center">
        <h1 className="text-[11px] tracking-[0.45em] text-dim uppercase">
          The Digital Room
        </h1>
        <p className="mt-1 text-xs text-dim/80">
          Please move quietly · Click an exhibit · Esc to step back
        </p>
      </header>

      <div className="absolute top-5 right-5 flex gap-2">
        <button
          type="button"
          onClick={toggleMuted}
          aria-pressed={!muted}
          className="pointer-events-auto rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs text-bone backdrop-blur hover:border-white/40"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={toggleEnvironment}
          aria-pressed={environment === "studio"}
          aria-label="Toggle the room lamps"
          className="pointer-events-auto rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs text-bone backdrop-blur hover:border-white/40"
        >
          {environment === "dark" ? "Lights: off" : "Lights: on"}
        </button>
      </div>

      <VisitGuide open={guideOpen} onToggle={() => setGuideOpen((v) => !v)} />

      <ActiveOverlay />
      <PaintingCard />
      <BrowserOverlay />
      <CameraGallery />
    </main>
  );
}
