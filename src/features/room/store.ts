"use client";

import { create } from "zustand";
import type { ExhibitId, GalleryKind, Mix, RoomState } from "./types";

const MIX_KEY = "digital-room-mix";
const VISITS_KEY = "digital-room-visits";

function loadMix(): Mix {
  const fallback: Mix = [0.7, 0.5, 0.3];
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(MIX_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.length === 3 &&
      parsed.every((n) => typeof n === "number" && n >= 0 && n <= 1)
    ) {
      return [parsed[0], parsed[1], parsed[2]];
    }
  } catch {
    // corrupted memory starts the evening fresh
  }
  return fallback;
}

function loadVisits(): number {
  try {
    if (typeof window === "undefined" || !window.localStorage) return 0;
    const raw = window.localStorage.getItem(VISITS_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function visit(list: ExhibitId[], id: ExhibitId): ExhibitId[] {
  return list.includes(id) ? list : [...list, id];
}

function reducedMotion(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

const walkTimers: number[] = [];

function clearWalkTimers(): void {
  walkTimers.forEach((t) => window.clearTimeout(t));
  walkTimers.length = 0;
}

export interface RoomStateWithMix extends RoomState {
  mix: Mix;
  visits: number;
  setMix: (next: Mix) => void;
  registerVisit: () => void;
  reveal: () => void;
}

export const useRoomStore = create<RoomStateWithMix>((set, get) => ({
  active: null,
  activeBookId: null,
  gallery: null,
  visited: [],
  environment: "dark",
  muted: true,
  playing: false,
  switchTouched: false,
  enteredAt: null,
  doorAjar: false,
  location: "room",
  walkPhase: "idle",
  walkDir: null,
  seated: false,
  toggleSeated: () => set((s) => ({ seated: !s.seated })),
  mix: loadMix(),
  visits: loadVisits(),
  setActive: (next) =>
    set((s) => ({
      active: s.active === next ? null : next,
      activeBookId: next === "book" ? s.activeBookId : null,
      gallery:
        next === "painting" || next === "sculpture" ? s.gallery : null,
      visited: next && s.active !== next ? visit(s.visited, next) : s.visited,
    })),
  setActiveBook: (id) =>
    set((s) => ({
      activeBookId: id,
      active: id ? "book" : null,
      visited: id ? visit(s.visited, "book") : s.visited,
    })),
  setGallery: (kind: GalleryKind, no: string | null) =>
    set((s) => ({
      gallery: no ? { kind, no } : null,
      active: no ? kind : null,
      visited: no ? visit(s.visited, kind) : s.visited,
    })),
  toggleEnvironment: () =>
    set((s) => ({
      environment: s.environment === "dark" ? "studio" : "dark",
      switchTouched: true,
    })),
  // choosing the light at the threshold is not the same as flipping the
  // switch on the wall, so it leaves the discovery marker standing
  setEnvironment: (next) => set({ environment: next }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  close: () => set({ active: null, activeBookId: null, gallery: null }),
  setMix: (next) => {
    set({ mix: next });
    try {
      window.localStorage.setItem(MIX_KEY, JSON.stringify(next));
    } catch {
      // the evening keeps the mix even if storage refuses it
    }
  },
  registerVisit: () => {
    try {
      if (window.sessionStorage.getItem("dr-session")) return;
      window.sessionStorage.setItem("dr-session", "1");
    } catch {
      return;
    }
    set((s) => {
      const visits = s.visits + 1;
      try {
        window.localStorage.setItem(VISITS_KEY, String(visits));
      } catch {
        // untracked evenings still count while they last
      }
      return { visits };
    });
  },
  // The click on "Enter now": this is the moment the evening properly
  // starts, so the reveal — and the count of the visit — belong here rather
  // than to mounting the room, which now happens earlier and invisibly.
  reveal: () => {
    if (get().enteredAt !== null) return;
    set({ enteredAt: Date.now() });
    get().registerVisit();
  },
  startWalkIn: () => {
    const s = get();
    if (s.location !== "room" || s.walkPhase !== "idle") return;
    clearWalkTimers();
    set({
      active: null,
      activeBookId: null,
      gallery: null,
      doorAjar: true,
      visited: visit(s.visited, "door"),
    });
    if (reducedMotion()) {
      set({ location: "hall" });
      return;
    }
    set({ walkPhase: "approach", walkDir: "in" });
    walkTimers.push(window.setTimeout(() => set({ walkPhase: "cross" }), 1500));
    walkTimers.push(window.setTimeout(() => set({ walkPhase: "arrive" }), 3000));
    walkTimers.push(
      window.setTimeout(
        () => set({ walkPhase: "idle", walkDir: null, location: "hall" }),
        4500,
      ),
    );
  },
  startWalkOut: () => {
    const s = get();
    if (s.location !== "hall" || s.walkPhase !== "idle") return;
    clearWalkTimers();
    set({ active: null, activeBookId: null, gallery: null, seated: false });
    if (reducedMotion()) {
      set({ location: "room", doorAjar: false });
      return;
    }
    set({ walkPhase: "approach", walkDir: "out" });
    walkTimers.push(window.setTimeout(() => set({ walkPhase: "cross" }), 1500));
    walkTimers.push(window.setTimeout(() => set({ walkPhase: "arrive" }), 3000));
    walkTimers.push(
      window.setTimeout(
        () =>
          set({
            walkPhase: "idle",
            walkDir: null,
            location: "room",
            doorAjar: false,
          }),
        4500,
      ),
    );
  },
}));
