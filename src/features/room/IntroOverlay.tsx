"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";
import { useRoomStore } from "./store";

const SLOGAN = "A small museum that remembers your evenings.";

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Each word rides in behind its own mask so it reads as a slide, not a fade.
function TitleWord({ text }: { text: string }) {
  return (
    <span className="inline-block overflow-hidden pb-1 align-bottom">
      <span data-intro-word className="inline-block">
        {text}
      </span>
    </span>
  );
}

// A button that leans toward the cursor and presses with a little weight —
// pure GSAP, no layout thrash, and it stands down under reduced motion.
function MagneticButton({
  children,
  onClick,
  primary,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  ariaLabel?: string;
}) {
  const el = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const btn = el.current;
    if (!btn) return;
    if (prefersReduced()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.32);
      yTo((e.clientY - r.top - r.height / 2) * 0.42);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    const down = () => {
      gsap.to(btn, { scale: 0.95, duration: 0.12, ease: "power2.out" });
    };
    const up = () => {
      gsap.to(btn, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
    };

    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerleave", leave);
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", leave);
    return () => {
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerleave", leave);
      btn.removeEventListener("pointerdown", down);
      btn.removeEventListener("pointerup", up);
      btn.removeEventListener("pointercancel", leave);
      gsap.killTweensOf(btn);
    };
  }, []);

  return (
    <button
      ref={el}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={
        primary
          ? "rounded-full border border-lamp/50 bg-lamp/10 px-9 py-3 text-sm tracking-[0.25em] text-bone uppercase shadow-[0_0_36px_rgba(255,184,107,0.22)] backdrop-blur-sm transition-colors hover:border-lamp hover:bg-lamp/25"
          : "rounded-full border border-white/20 px-6 py-3 text-sm tracking-[0.25em] text-dim uppercase backdrop-blur-sm transition-colors hover:border-white/45 hover:text-bone"
      }
    >
      {children}
    </button>
  );
}

export function IntroOverlay({
  variant,
  onMountRoom,
  onDone,
}: {
  variant: "full" | "short";
  onMountRoom: () => void;
  onDone: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const animTl = useRef<gsap.core.Timeline | null>(null);

  const environment = useRoomStore((s) => s.environment);
  const setEnvironment = useRoomStore((s) => s.setEnvironment);
  const reveal = useRoomStore((s) => s.reveal);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReduced()) return;

    const q = (sel: string) =>
      Array.from(el.querySelectorAll<HTMLElement>(sel));
    const words = q("[data-intro-word]");
    const eyebrow = q("[data-intro-eyebrow]");
    const slogan = q("[data-intro-slogan]");
    const late = q("[data-intro-late]");
    const rule = q("[data-intro-rule]");
    const rising = [...eyebrow, ...slogan, ...late];

    const ctx = gsap.context(() => {
      // everything is set to its hidden state before the first paint, so
      // there is never a frame of the finished page flashing through
      gsap.set(words, { xPercent: -110 });
      gsap.set(rising, { opacity: 0, y: 18 });
      gsap.set(rule, { scaleX: 0 });

      const tl = gsap.timeline();
      if (variant === "short") {
        // the same gestures, tightened — the visitor has seen this before
        tl.to(words, { xPercent: 0, duration: 0.7, stagger: 0.07, ease: "expo.out" }, 0.05)
          .to(rising, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.12)
          .to(rule, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 0.3);
      } else {
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.35)
          .to(words, { xPercent: 0, duration: 0.95, stagger: 0.1, ease: "expo.out" }, 0.5)
          // the hairline rule draws outward from centre, placard-style
          .to(rule, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 1.05)
          .to(slogan, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, 1.3)
          .to(late, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out" }, 1.6);
      }
      animTl.current = tl;
    }, el);

    return () => {
      ctx.revert();
      animTl.current?.kill();
    };
  }, [variant]);

  function flip() {
    setEnvironment(environment === "dark" ? "studio" : "dark");
  }

  function enter() {
    if (leaving.current) return;
    leaving.current = true;
    const el = root.current;
    // the evening starts here: the reveal is stamped and the visit counted,
    // which is what the camera glide and the room's memory both wait for
    reveal();
    // the room mounts behind the black while the transition runs
    onMountRoom();

    if (!el || prefersReduced()) {
      onDone();
      return;
    }

    animTl.current?.kill();

    const q = (sel: string) =>
      Array.from(el.querySelectorAll<HTMLElement>(sel));
    const words = q("[data-intro-word]");
    const rising = [
      ...q("[data-intro-eyebrow]"),
      ...q("[data-intro-slogan]"),
      ...q("[data-intro-late]"),
    ];
    const rule = q("[data-intro-rule]");
    const sweep = el.querySelector("[data-intro-sweep]");
    const veil = el.querySelector("[data-intro-veil]");

    // the room is live behind the card by now: let the pointer through so
    // the dissolve never feels like a locked screen
    el.style.pointerEvents = "none";

    const tl = gsap.timeline({ onComplete: () => onDone() });
    tl.to(rising, {
      opacity: 0,
      y: -30,
      duration: 0.5,
      ease: "power2.in",
      stagger: 0.05,
    })
      .to(rule, { scaleX: 0, duration: 0.55, ease: "power3.inOut" }, 0.08)
      .to(words, { xPercent: -110, duration: 0.65, stagger: 0.06, ease: "power3.in" }, 0.12)
      // a band of lamplight crosses the whole transition, carrying the eye
      // from the title to the room so there is never a black beat between
      .fromTo(
        sweep,
        { xPercent: -105 },
        { xPercent: 175, duration: 1.5, ease: "power1.inOut" },
        0.1,
      )
      .to(sweep, { opacity: 0.9, duration: 0.2, ease: "power1.out" }, 0.1)
      .to(sweep, { opacity: 0, duration: 0.5, ease: "power2.in" }, 1.05)
      // the veil dissolves underneath the title, so the room is already
      // arriving while the words are still leaving — a cross, not a cut
      .to(veil, { opacity: 0, duration: 1.2, ease: "power2.inOut" }, 0.3);
    animTl.current = tl;
  }

  const studio = environment === "studio";

  return (
    <div ref={root} className="absolute inset-0 z-50 overflow-hidden">
      {/* the black veil is the only surface that dissolves — the room
          arrives underneath the title, not after it */}
      <div data-intro-veil aria-hidden className="absolute inset-0 bg-void" />
      {/* the sweep: warm when you enter to lamps on, cool when dark */}
      <div
        aria-hidden
        data-intro-sweep
        className={`pointer-events-none absolute inset-y-0 left-0 w-[55%] opacity-0 ${
          studio
            ? "bg-gradient-to-r from-transparent via-lamp/30 to-transparent"
            : "bg-gradient-to-r from-transparent via-screen/15 to-transparent"
        }`}
      />
      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <p
          data-intro-eyebrow
          className="text-[11px] tracking-[0.5em] text-dim uppercase"
        >
          {variant === "full" ? "Now entering" : "Welcome back"}
        </p>

        <h1 className="mt-5 font-display text-4xl leading-none font-medium tracking-[0.14em] text-bone sm:text-6xl lg:text-7xl">
          <TitleWord text="THE DIGITAL" /> <TitleWord text="ROOM" />
        </h1>

        <div
          data-intro-rule
          aria-hidden
          className="mt-7 h-px w-[min(72vw,34rem)] bg-gradient-to-r from-transparent via-lamp/70 to-transparent"
        />

        <p data-intro-slogan className="mt-6 font-display text-base text-bone/75 italic sm:text-lg">
          {SLOGAN}
        </p>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <div data-intro-late>
            <MagneticButton
              primary
              onClick={enter}
              ariaLabel="Enter the Digital Room"
            >
              Enter now
            </MagneticButton>
          </div>
          <div data-intro-late>
            <MagneticButton
              onClick={flip}
              ariaLabel={`Turn the lamps ${studio ? "off" : "on"}`}
            >
              Lights: {studio ? "on" : "off"}
            </MagneticButton>
          </div>
        </div>

        <p
          data-intro-late
          className="mt-6 text-[11px] tracking-[0.3em] text-dim/70 uppercase"
        >
          Please move quietly
        </p>
      </div>
    </div>
  );
}
