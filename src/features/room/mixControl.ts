import type { Mix } from "./types";

// Transient mixer control: written by tonearm drag handlers, read by the
// arm visual. The persisted result lives in the store as `mix`.
export const mixControl = { dragging: false, t: 0.5, px: 0 };

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function mixFromT(t: number): Mix {
  return [
    round3(Math.max(0.08, Math.min(1, 1 - t * 1.6))),
    round3(Math.max(0.08, Math.min(1, 1 - Math.abs(t - 0.5) * 1.8))),
    round3(Math.max(0.08, Math.min(1, 0.2 + (t - 0.15) * 1.6))),
  ];
}

export function tFromMix(m: Mix): number {
  return clamp01(0.5 + (m[2] - m[0]) * 0.6);
}
