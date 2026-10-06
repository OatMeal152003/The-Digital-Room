"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import projectsRaw from "../../content/projects.json";
import { exhibitSchema } from "../../types/content";
import { useRoomStore } from "../room/store";

const exhibits = projectsRaw.map((p) => exhibitSchema.parse(p));

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Tab = "room" | "collection" | "visit";

const TABS: { id: Tab; label: string }[] = [
  { id: "room", label: "Room" },
  { id: "collection", label: "Collection" },
  { id: "visit", label: "Visit" },
];

const VISIT_LINES: [string, string][] = [
  ["Look", "the room leans toward the cursor."],
  ["Touch", "anything that glows opens."],
  ["Enter", "the door walks through to the Long Hall."],
  ["Play", "the tonearm mixes the lamps."],
  ["Light", "the switch beside the door works the lamps."],
  ["Leave", "Esc steps back."],
];

// A small browser found open on the desk: the room's own minimalist site,
// browsed from inside the collection.
export function BrowserOverlay() {
  const active = useRoomStore((s) => s.active);
  const close = useRoomStore((s) => s.close);
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("room");

  const open = active === "computer";

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !open || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-browser-backdrop]",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-browser-window]",
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
        "[data-browser-page]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }, el);
    return () => ctx.revert();
  }, [open, tab]);

  if (!open) return null;

  return (
    <div
      ref={root}
      className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="The Digital Room website, in the desk browser"
    >
      <button
        type="button"
        data-browser-backdrop
        aria-label="Close the browser"
        onClick={close}
        className="absolute inset-0 cursor-default bg-void/60 backdrop-blur-sm"
      />
      <div
        data-browser-window
        className="relative w-[min(94vw,44rem)] overflow-hidden rounded-xl border border-white/12 bg-[#0b0d10]/90 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        {/* browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <div aria-hidden className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5b3f4a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#5b4a3f]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4a5b43]" />
          </div>
          <p className="hidden text-[11px] tracking-[0.2em] text-dim uppercase sm:block">
            The Digital Room
          </p>
          <p className="mx-auto w-full max-w-xs truncate rounded-full border border-white/10 bg-black/40 px-4 py-1 text-center text-xs text-dim">
            https://digital.room
          </p>
          <span className="w-10" aria-hidden />
        </div>
        {/* site nav */}
        <div className="flex gap-1 border-b border-white/10 px-4 pt-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={`rounded-t-lg px-4 py-2 text-xs tracking-[0.2em] uppercase transition-colors ${
                tab === t.id
                  ? "bg-white/[0.06] text-bone"
                  : "text-dim hover:text-bone"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* site pages */}
        <div data-browser-page className="max-h-[62vh] overflow-y-auto p-6 sm:p-8">
          {tab === "room" && (
            <div className="py-4 text-center">
              <p className="text-[11px] tracking-[0.45em] text-dim uppercase">
                Now browsing
              </p>
              <h2 className="mt-3 font-display text-4xl text-bone sm:text-5xl">
                THE DIGITAL ROOM
              </h2>
              <div
                aria-hidden
                className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-lamp/70 to-transparent"
              />
              <p className="mx-auto mt-5 max-w-md font-display text-base text-bone/75 italic">
                A small museum that remembers your evenings.
              </p>
              <p className="mt-4 text-xs tracking-[0.25em] text-dim uppercase">
                Eight exhibits · Please move quietly
              </p>
              <p className="mt-6 text-[11px] text-dim/70 italic">
                Browsing from inside the collection.
              </p>
            </div>
          )}
          {tab === "collection" && (
            <ul className="space-y-3">
              {exhibits.map((p) => (
                <li key={p.no} className="border-l border-white/20 pl-3">
                  <p className="text-[11px] tracking-[0.25em] text-dim uppercase">
                    No. {p.no}
                  </p>
                  <p className="mt-0.5 font-display text-lg text-bone">
                    {p.title}
                  </p>
                  <p className="text-xs text-dim">
                    {p.medium}, {p.year}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {tab === "visit" && (
            <ul className="mx-auto max-w-md space-y-2.5 text-sm leading-relaxed text-dim">
              {VISIT_LINES.map(([k, v]) => (
                <li key={k}>
                  <span className="text-bone">{k} —</span> {v}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
          <p className="text-[11px] text-dim/70 italic">
            Best viewed from inside.
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Return to the room"
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-bone hover:border-white/40"
          >
            Return · Esc
          </button>
        </div>
      </div>
    </div>
  );
}
