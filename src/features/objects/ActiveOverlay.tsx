"use client";

import { useState, useSyncExternalStore } from "react";
import booksRaw from "../../content/books.json";
import linksRaw from "../../content/links.json";
import notesRaw from "../../content/notes.json";
import rotationRaw from "../../content/rotation.json";
import sculpturesRaw from "../../content/sculptures.json";
import secretsRaw from "../../content/secrets.json";
import tracksRaw from "../../content/tracks.json";
import {
  bookSchema,
  exhibitSchema,
  rotationSchema,
  sculptureSchema,
  signalSchema,
  trackSchema,
} from "../../types/content";
import { useRoomStore } from "../room/store";

const books = booksRaw.map((b) => bookSchema.parse(b));
const tracks = tracksRaw.map((t) => trackSchema.parse(t));
const signals = linksRaw.map((l) => signalSchema.parse(l));
const rotation = rotationRaw.map((r) => rotationSchema.parse(r));
const filedNotes = notesRaw.map((n) => exhibitSchema.parse(n));
const sculptures = sculpturesRaw.map((s) => sculptureSchema.parse(s));
const stored = secretsRaw[0];

function Placard({
  no,
  title,
  medium,
  year,
  note,
}: {
  no: string;
  title: string;
  medium: string;
  year: string;
  note?: string;
}) {
  return (
    <li className="border-l border-white/20 pl-3">
      <p className="text-[11px] tracking-[0.25em] text-dim uppercase">No. {no}</p>
      <p className="mt-0.5 font-display text-base text-bone">{title}</p>
      <p className="text-xs text-dim">
        {medium}, {year}
      </p>
      {note ? <p className="mt-1 text-xs text-dim/90">{note}</p> : null}
    </li>
  );
}

const GUESTBOOK_KEY = "digital-room-guestbook";
const EMPTY_NAMES: string[] = [];

function subscribe() {
  return () => {};
}
// getSnapshot must return the same reference while nothing changes, so the
// signatures are parsed once per raw string
let cachedRaw: string | null = null;
let cachedNames: string[] = EMPTY_NAMES;

function readNames(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(GUESTBOOK_KEY);
  } catch {
    return EMPTY_NAMES;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedNames = EMPTY_NAMES;
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) cachedNames = parsed as string[];
      } catch {
        cachedNames = EMPTY_NAMES;
      }
    }
  }
  return cachedNames;
}

function writeNames(next: string[]) {
  cachedNames = next;
  cachedRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(GUESTBOOK_KEY, cachedRaw);
  } catch {
    // private mode keeps the signature for the evening only
  }
}

function Guestbook() {
  const names = useSyncExternalStore(subscribe, readNames, () => EMPTY_NAMES);
  const [value, setValue] = useState("");

  function sign(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim().slice(0, 40);
    if (!name) return;
    writeNames([...names, name].slice(-12));
    setValue("");
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <p className="text-[11px] tracking-[0.25em] text-dim uppercase">Guestbook</p>
      {names.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {names.map((n, i) => (
            <li key={`${n}-${i}`} className="text-xs text-dim">
              {n}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-dim/80">No signatures yet this evening.</p>
      )}
      <form onSubmit={sign} className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Sign quietly"
          aria-label="Sign the guestbook"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-3 py-1 text-xs text-bone placeholder:text-dim/60 focus:border-white/40 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-bone hover:border-white/40"
        >
          Sign
        </button>
      </form>
    </div>
  );
}

export function ActiveOverlay() {
  const active = useRoomStore((s) => s.active);
  const activeBookId = useRoomStore((s) => s.activeBookId);
  const gallery = useRoomStore((s) => s.gallery);
  const location = useRoomStore((s) => s.location);
  const startWalkOut = useRoomStore((s) => s.startWalkOut);
  const playing = useRoomStore((s) => s.playing);
  const mix = useRoomStore((s) => s.mix);
  const visits = useRoomStore((s) => s.visits);
  const close = useRoomStore((s) => s.close);

  if (!active || active === "painting" || active === "computer" || active === "camera") return null;

  const keeperLine =
    visits >= 25
      ? "The keeper notes: it knows your evenings."
      : visits >= 5
        ? "The keeper notes: it brightens when you return."
        : "The keeper notes: it is greener when the room is quiet.";

  const filed =
    visits >= 3 ? filedNotes[Math.floor(visits / 3) % filedNotes.length] : undefined;

  return (
    <section
      aria-live="polite"
      className="pointer-events-auto absolute bottom-6 left-1/2 w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur-md"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <p className="text-[11px] tracking-[0.3em] text-dim uppercase">
          {active === "book" && "Study collection"}
          {active === "record" && "Listening station"}
          {active === "door" && "Special exhibition hall"}
          {active === "sculpture" && "Long Hall — sculpture"}
          {active === "window" && "Courtyard overlook"}
          {active === "drawer" && "Visible storage"}
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

      {active === "book" && (
        <ul className="space-y-3">
          {books
            .filter((b) => !activeBookId || b.no === activeBookId)
            .map((b) => (
              <Placard key={b.no} {...b} />
            ))}
        </ul>
      )}

      {active === "record" && (
        <div>
          <p className="text-xs text-dim">
            {playing
              ? "Drag the arm across the record. The lamps are the meters."
              : "Press the record to play the room, then drag the arm."}
          </p>
          <div className="mt-3 space-y-2">
            {tracks.map((t, i) => (
              <div key={t.no} className="flex items-center gap-3">
                <p className="w-28 shrink-0 truncate text-xs text-dim">
                  <span className="text-bone/80">No. {t.no}</span> · {t.title}
                </p>
                <div
                  role="meter"
                  aria-valuenow={Math.round((mix[i] ?? 0) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${t.title} level`}
                  className="h-1 flex-1 rounded-full bg-white/10"
                >
                  <div
                    className="h-1 rounded-full bg-lamp/70"
                    style={{ width: `${Math.round((mix[i] ?? 0) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active === "door" && (
        <div>
          <p className="text-[11px] tracking-[0.25em] text-dim uppercase">
            Now showing — {rotation[0]?.until ?? ""}
          </p>
          <ul className="mt-3 space-y-3">
            {rotation.map((r) => (
              <Placard key={r.no} {...r} />
            ))}
          </ul>
          <p className="mt-3 text-xs text-dim/90 italic">{keeperLine}</p>
          {location === "hall" ? (
            <button
              type="button"
              onClick={() => {
                close();
                startWalkOut();
              }}
              className="mt-3 rounded-full border border-lamp/40 px-4 py-1.5 text-xs text-bone hover:border-lamp"
            >
              Walk back — return to the Digital Room
            </button>
          ) : null}
        </div>
      )}

      {active === "sculpture" && (
        <ul className="space-y-3">
          {sculptures
            .filter((s) => !gallery || gallery.no === s.no)
            .map((s) => (
              <Placard key={s.no} no={s.no} title={s.title} medium={s.medium} year={s.year} note={s.note} />
            ))}
        </ul>
      )}

      {active === "window" && (
        <ul className="space-y-3">
          {signals.map((l) => (
            <Placard
              key={l.no}
              no={l.no}
              title={l.label}
              medium="Observed light"
              year="Ongoing"
              note={l.note}
            />
          ))}
        </ul>
      )}

      {active === "drawer" && (
        <div>
          {stored ? (
            <ul className="space-y-3">
              <Placard
                no={stored.no}
                title={stored.title}
                medium={stored.medium}
                year={stored.year}
                note={stored.note}
              />
            </ul>
          ) : null}
          {filed ? (
            <div className="mt-4">
              <p className="mb-2 text-[11px] tracking-[0.25em] text-dim uppercase">
                Newly filed
              </p>
              <ul className="space-y-3">
                <Placard
                  no={filed.no}
                  title={filed.title}
                  medium={filed.medium}
                  year={filed.year}
                  note={filed.note}
                />
              </ul>
            </div>
          ) : null}
          <Guestbook />
        </div>
      )}
    </section>
  );
}
