"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

let mq: MediaQueryList | null = null;

function query(): MediaQueryList {
  if (!mq) mq = window.matchMedia(QUERY);
  return mq;
}

function subscribe(onChange: () => void): () => void {
  const q = query();
  q.addEventListener("change", onChange);
  return () => q.removeEventListener("change", onChange);
}

// Read synchronously rather than effecting into state, so the very first
// frame already knows: a camera that eases into place under reduced motion
// is exactly the motion the preference asked us to drop.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => query().matches, () => false);
}
