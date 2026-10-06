"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";
import paintingsRaw from "../../content/paintings.json";
import { paintingSchema } from "../../types/content";
import { useRoomStore } from "../room/store";

const paintings = paintingsRaw.map((p) => paintingSchema.parse(p));

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The wall label, enlarged: a frosted-glass card with the photograph at a
// size the wall never allows, the tombstone beside it, and a sheen that
// follows the cursor — the edge-light idea, rebuilt for a modal card.
export function PaintingCard() {
  const gallery = useRoomStore((s) => s.gallery);
  const close = useRoomStore((s) => s.close);
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);

  const painting =
    gallery?.kind === "painting"
      ? (paintings.find((p) => p.no === gallery.no) ?? null)
      : null;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !painting) return;
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-card-backdrop]",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-card-panel]",
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [painting]);

  useLayoutEffect(() => {
    const panel = card.current;
    const glow = sheen.current;
    if (!panel || !glow || !painting) return;
    if (prefersReduced()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const xTo = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = panel.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    };
    panel.addEventListener("pointermove", move);
    return () => {
      panel.removeEventListener("pointermove", move);
      gsap.killTweensOf(glow);
    };
  }, [painting]);

  if (!painting) return null;

  return (
    <div
      ref={root}
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${painting.title}, wall label`}
    >
      <button
        type="button"
        data-card-backdrop
        aria-label="Close the wall label"
        onClick={close}
        className="absolute inset-0 cursor-default bg-void/60 backdrop-blur-sm"
      />
      <div
        ref={card}
        data-card-panel
        className="relative w-[min(94vw,46rem)] overflow-hidden rounded-2xl border border-white/12 bg-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        {/* reactive edge light */}
        <div
          ref={sheen}
          aria-hidden
          className="pointer-events-none absolute -top-1/3 -left-1/4 h-[80%] w-[60%] bg-gradient-to-r from-transparent via-lamp/12 to-transparent blur-2xl"
        />
        <div className="relative flex max-h-[86vh] flex-col overflow-y-auto sm:flex-row">
          <div className="flex items-center justify-center bg-black/40 p-4 sm:w-[55%] sm:p-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- collection PNGs are served as-is at wall-label size; the optimizer would add provider cost for no visible gain */}
            <img
              src={painting.image}
              alt={painting.title}
              className="max-h-[38vh] w-auto rounded-md border border-white/10 object-contain sm:max-h-[60vh]"
            />
          </div>
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] tracking-[0.3em] text-dim uppercase">
                Long Hall — west wall
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Return to the room"
                className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-bone hover:border-white/40"
              >
                Return · Esc
              </button>
            </div>
            <p className="mt-4 text-[11px] tracking-[0.25em] text-dim uppercase">
              No. {painting.no}
            </p>
            <h2 className="mt-1 font-display text-3xl text-bone">
              {painting.title}
            </h2>
            <div
              aria-hidden
              className="mt-3 h-px w-24 bg-gradient-to-r from-lamp/70 to-transparent"
            />
            <p className="mt-3 text-sm text-dim">
              {painting.medium}, {painting.year}
            </p>
            {painting.note ? (
              <p className="mt-3 text-sm leading-relaxed text-bone/85">
                {painting.note}
              </p>
            ) : null}
            <p className="mt-auto pt-4 text-[11px] text-dim/70 italic">
              From the evening collection. Best viewed from the bench.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
