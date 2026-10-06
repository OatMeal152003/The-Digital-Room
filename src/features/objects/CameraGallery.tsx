"use client";

import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import paintingsRaw from "../../content/paintings.json";
import photosRaw from "../../content/photos.json";
import { momentSchema, paintingSchema } from "../../types/content";
import { useRoomStore } from "../room/store";

const paintings = paintingsRaw.map((p) => paintingSchema.parse(p));
const moments = photosRaw.map((p) => momentSchema.parse(p));

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The viewing device opens a contact sheet: the hanging paintings as
// thumbnails, each enlarging to a full wall label, with the camera's field
// notes kept underneath.
export function CameraGallery() {
  const active = useRoomStore((s) => s.active);
  const close = useRoomStore((s) => s.close);
  const root = useRef<HTMLDivElement>(null);
  const [selectedNo, setSelectedNo] = useState<string | null>(null);

  const open = active === "camera";
  const selected = paintings.find((p) => p.no === selectedNo) ?? null;

  useEffect(() => {
    if (!open) return;
    // every opening starts at the contact sheet, not last visit's print
    const id = window.setTimeout(() => setSelectedNo(null), 0);
    return () => window.clearTimeout(id);
  }, [open ]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !open || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-gallery-backdrop]",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-gallery-panel]",
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "expo.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [open ]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !open || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-gallery-page]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [open, selectedNo]);

  if (!open) return null;

  function dismiss() {
    setSelectedNo(null);
    close();
  }

  return (
    <div
      ref={root}
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="The viewing device contact sheet"
    >
      <button
        type="button"
        data-gallery-backdrop
        aria-label="Close the contact sheet"
        onClick={dismiss}
        className="absolute inset-0 cursor-default bg-void/60 backdrop-blur-sm"
      />
      <div
        data-gallery-panel
        className="relative w-[min(94vw,48rem)] overflow-hidden rounded-2xl border border-white/12 bg-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:px-6">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-dim uppercase">
              Viewing device — contact sheet
            </p>
            <div
              aria-hidden
              className="mt-2 h-px w-24 bg-gradient-to-r from-lamp/70 to-transparent"
            />
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Return to the room"
            className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-bone hover:border-white/40"
          >
            Return · Esc
          </button>
        </div>

        <div
          data-gallery-page
          className="max-h-[70vh] overflow-y-auto p-5 sm:px-6"
        >
          {selected ? (
            <div>
              <div className="flex items-center justify-center bg-black/40 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- collection PNGs are served as-is; the optimizer would add provider cost for no visible gain */}
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="max-h-[46vh] w-auto rounded-md border border-white/10 object-contain"
                />
              </div>
              <p className="mt-4 text-[11px] tracking-[0.25em] text-dim uppercase">
                No. {selected.no} · Long Hall — west wall
              </p>
              <h2 className="mt-1 font-display text-3xl text-bone">
                {selected.title}
              </h2>
              <p className="mt-2 text-sm text-dim">
                {selected.medium}, {selected.year}
              </p>
              {selected.note ? (
                <p className="mt-2 text-sm leading-relaxed text-bone/85">
                  {selected.note}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedNo(null)}
                className="mt-4 rounded-full border border-white/15 px-4 py-1.5 text-xs text-bone hover:border-white/40"
              >
                Back to contact sheet
              </button>
            </div>
          ) : (
            <div>
              <ul className="grid grid-cols-2 gap-3">
                {paintings.map((p) => (
                  <li key={p.no}>
                    <button
                      type="button"
                      onClick={() => setSelectedNo(p.no)}
                      aria-label={`Enlarge ${p.title}`}
                      className="group block w-full rounded-lg border border-white/10 bg-black/40 p-2 text-left transition-colors hover:border-lamp/50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- collection PNGs are served as-is; the optimizer would add provider cost for no visible gain */}
                      <img
                        src={p.image}
                        alt=""
                        className="aspect-[4/3] w-full rounded object-cover"
                      />
                      <p className="mt-2 text-[11px] tracking-[0.2em] text-dim uppercase">
                        No. {p.no}
                      </p>
                      <p className="font-display text-base text-bone group-hover:text-white">
                        {p.title}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-white/10 pt-3">
                <p className="text-[11px] tracking-[0.25em] text-dim uppercase">
                  Field notes — seen through the viewing device
                </p>
                <ul className="mt-2 space-y-1.5">
                  {moments.map((m) => (
                    <li key={m.no} className="text-xs text-dim">
                      <span className="text-bone/80">No. {m.no}</span> ·{" "}
                      {m.title} — {m.note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
