"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { IntroOverlay } from "@/features/room/IntroOverlay";
import { RoomExperience } from "@/features/room/RoomExperience";
import { useRoomStore } from "@/features/room/store";

const VISITS_KEY = "digital-room-visits";

function readVisits(): number {
  try {
    const raw = window.localStorage.getItem(VISITS_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

// Nothing subscribes — the count only changes when the visitor walks in,
// and this component mounts the room itself. Returning a stable subscription
// keeps the read honest with React's external-store contract.
function subscribe() {
  return () => {};
}

export default function Home() {
  const [roomMounted, setRoomMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const enteredAt = useRoomStore((s) => s.enteredAt);

  // hydrated from the server as a first visit, then snaps to the real count
  const visits = useSyncExternalStore(subscribe, readVisits, () => 0);
  const variant = visits > 0 ? "short" : "full";

  // The room starts building itself as soon as the title has finished
  // arriving, hidden behind the card. The click then only has to run the
  // transition against a scene that is already compiled and warm — which is
  // what used to make the reveal hitch. A visitor who clicks before this
  // timer fires simply mounts it now, exactly as before.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduced ? 0 : variant === "full" ? 2600 : 1100;
    const id = window.setTimeout(() => setRoomMounted(true), delay);
    return () => window.clearTimeout(id);
  }, [variant]);

  // One positioned stage: the room sits underneath and the title card sits
  // on top of it. Stacking them in flow put the room below the fold, where
  // it was clipped away until the card unmounted — which is why the reveal
  // read as a cut rather than a dissolve.
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-void">
      {roomMounted ? <RoomExperience live={enteredAt !== null} /> : null}
      {!entered ? (
        <IntroOverlay
          variant={variant}
          onMountRoom={() => setRoomMounted(true)}
          onDone={() => setEntered(true)}
        />
      ) : null}
    </div>
  );
}
