"use client";

import { useSyncExternalStore } from "react";

const GUIDE_SEEN_KEY = "digital-room-guide-seen";

function subscribe() {
  return () => {};
}

// The tab glows until its first opening, then retires forever. localStorage
// is an external store, so it hydrates as "seen" and reveals the glow on the
// client only when this is genuinely the first evening.
function hasSeen(): boolean {
  try {
    return window.localStorage.getItem(GUIDE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function VisitGuide({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const seen = useSyncExternalStore(subscribe, hasSeen, () => true);

  function toggle() {
    try {
      window.localStorage.setItem(GUIDE_SEEN_KEY, "1");
    } catch {
      // the tab keeps glowing; harmless
    }
    onToggle();
  }

  return (
    <div className="pointer-events-none absolute top-16 right-5 z-20 flex flex-col items-end gap-2">
      {!open ? (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={false}
          aria-label="Open the visitor guide"
          className={`pointer-events-auto rounded-full border border-lamp/60 bg-lamp/15 px-4 py-1 text-xs tracking-[0.2em] text-bone uppercase shadow-[0_0_24px_rgba(255,184,107,0.25)] backdrop-blur-md hover:border-lamp hover:bg-lamp/25 ${
            seen ? "" : "animate-pulse"
          }`}
        >
          Guide
        </button>
      ) : null}
      <div
        className={`pointer-events-auto w-72 origin-top-right rounded-2xl border border-white/10 bg-black/75 p-5 backdrop-blur-md transition-all duration-300 ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none absolute top-10 right-0 scale-90 opacity-0"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <p className="text-[11px] tracking-[0.3em] text-dim uppercase">
            How to visit
          </p>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={true}
            aria-label="Close the visitor guide"
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-bone hover:border-white/40"
          >
            Fold · Esc
          </button>
        </div>
        <ul className="space-y-2.5 text-xs leading-relaxed text-dim">
          <li>
            <span className="text-bone">Look —</span> move the mouse, or drag a
            finger. The room leans toward you.
          </li>
          <li>
            <span className="text-bone">Touch —</span> click anything that
            glows. Eight exhibits here, seven through the door.
          </li>
          <li>
            <span className="text-bone">Enter —</span> the door walks you into
            the Long Hall. The bench sits you down. The brass plate brings
            you back.
          </li>
          <li>
            <span className="text-bone">Play —</span> drag the record&apos;s
            tonearm to mix the lamps. The drawer hides the guestbook.
          </li>
          <li>
            <span className="text-bone">Light —</span> the switch above works
            the room&apos;s lamps. The brass switch beside the door works
            too.
          </li>
          <li>
            <span className="text-bone">Leave —</span> Esc steps back: placard,
            stand up, walk out.
          </li>
        </ul>
        <p className="mt-3 border-t border-white/10 pt-2 text-[11px] text-dim/70 italic">
          The room remembers your evenings.
        </p>
      </div>
    </div>
  );
}
