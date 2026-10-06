"use client";

import { useEffect } from "react";
import { roomEvents } from "./roomEvents";
import { useRoomStore } from "./store";

// Fires one small deniable event every 25–45 seconds, only while the
// visitor is idle (no open exhibit), the tab is visible, and motion is
// welcome. The room performs; the visitor argues about whether it did.
export function useRoomEvents(): void {
  useEffect(() => {
    const lastFire = { at: 0 };
    const nextIn = { ms: 18000 };
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const s = useRoomStore.getState();
      if (s.active !== null) return;
      if (s.location !== "room") return;
      const now = Date.now();
      if (now - lastFire.at < nextIn.ms) return;
      lastFire.at = now;
      nextIn.ms = 25000 + Math.random() * 20000;
      const roll = Math.random();
      if (roll < 0.22) roomEvents.flickerAt = now;
      else if (roll < 0.44) roomEvents.pulseAt = now;
      else if (roll < 0.62) roomEvents.breathAt = now;
      else if (roll < 0.82) roomEvents.gustAt = now;
      else roomEvents.skipAt = now;
    }, 4000);
    return () => window.clearInterval(id);
  }, []);
}
