"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { lookOffset } from "./lookOffset";
import { useRoomStore } from "./store";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const HOME = new THREE.Vector3(0, 1.7, 6.8);
const LOOK_HOME = new THREE.Vector3(0, 1.15, 0);

const FOCUS: Record<string, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  computer: {
    pos: new THREE.Vector3(-1.6, 1.5, 2.6),
    look: new THREE.Vector3(-2.2, 1.15, 0.4),
  },
  book: {
    pos: new THREE.Vector3(1.4, 1.5, 2.8),
    look: new THREE.Vector3(2.4, 1.3, 0.2),
  },
  record: {
    pos: new THREE.Vector3(1.2, 1.4, -1.4),
    look: new THREE.Vector3(2.3, 0.9, -2.2),
  },
  camera: {
    pos: new THREE.Vector3(-0.4, 1.5, 1.6),
    look: new THREE.Vector3(-1.5, 1.0, 0.5),
  },
  door: {
    pos: new THREE.Vector3(-0.6, 1.6, 0.6),
    look: new THREE.Vector3(-4.4, 1.3, -1.6),
  },
  window: {
    pos: new THREE.Vector3(0.4, 1.6, 2.4),
    look: new THREE.Vector3(1.2, 1.5, -3.4),
  },
  drawer: {
    pos: new THREE.Vector3(-0.6, 1.1, 2.2),
    look: new THREE.Vector3(-0.85, 0.6, 0.4),
  },
};

// The walk through the doorway, in three beats.
function walkPose(
  phase: string,
  dir: string | null,
  out: { pos: THREE.Vector3; look: THREE.Vector3 },
): boolean {
  if (phase === "approach" && dir === "in") {
    out.pos.set(-2.8, 1.6, -0.2);
    out.look.set(-4.4, 1.3, -1.6);
    return true;
  }
  if (phase === "cross" && dir === "in") {
    out.pos.set(-4.4, 1.55, -1.6);
    out.look.set(-6.5, 1.3, -1.6);
    return true;
  }
  if (phase === "arrive" && dir === "in") {
    out.pos.set(-5.0, 1.55, -1.6);
    out.look.set(-9.2, 1.35, -1.6);
    return true;
  }
  if (phase === "approach" && dir === "out") {
    out.pos.set(-4.6, 1.55, -1.6);
    out.look.set(-1.5, 1.4, -0.6);
    return true;
  }
  if (phase === "cross" && dir === "out") {
    out.pos.set(-2.6, 1.6, -0.8);
    out.look.set(0, 1.2, 0.5);
    return true;
  }
  if (phase === "arrive" && dir === "out") {
    out.pos.copy(HOME);
    out.look.copy(LOOK_HOME);
    return true;
  }
  return false;
}

const HALL_POS = new THREE.Vector3(-5.0, 1.55, -1.6);
const HALL_LOOK = new THREE.Vector3(-9.2, 1.35, -1.6);
const SEAT_POS = new THREE.Vector3(-7.0, 1.05, 0.1);
const SEAT_LOOK = new THREE.Vector3(-7.3, 1.0, -3.35);
// the room mounts in deep doorway shadow; the first three seconds are
// spent stepping inside toward the entrance pose
const INTRO_FROM = new THREE.Vector3(0, 1.8, 9.5);
// The reveal glides once, straight, positioned rather than chased — the old
// build eased the target and then damped after it, so the move arrived hidden
// behind the overlay and only its dead tail was ever on screen. It is timed
// from the click, not from mounting, and starts just as the black begins to
// lift, so the visitor meets a camera already in motion.
const INTRO_DELAY = 150;
const INTRO_DURATION = 3200;

export function CameraRig() {
  const { camera, pointer } = useThree();
  const active = useRoomStore((s) => s.active);
  const location = useRoomStore((s) => s.location);
  const walkPhase = useRoomStore((s) => s.walkPhase);
  const walkDir = useRoomStore((s) => s.walkDir);
  const seated = useRoomStore((s) => s.seated);
  const enteredAt = useRoomStore((s) => s.enteredAt);
  const reduced = usePrefersReducedMotion();
  const target = useRef(new THREE.Vector3().copy(HOME));
  const look = useRef(new THREE.Vector3().copy(LOOK_HOME));
  const lookAt = useRef(new THREE.Vector3().copy(LOOK_HOME));
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const scratchLook = useMemo(() => new THREE.Vector3(), []);
  const introScratch = useMemo(() => new THREE.Vector3(), []);

  // eslint-disable-next-line react-hooks/immutability -- react-three-fiber passes the live camera into useFrame; driving it imperatively there is the framework's contract, not a stale-render hazard
  useFrame((_, delta) => {
    const walking = walkPhase !== "idle";
    const inHall = location === "hall";

    // drag-look from touch decays back to rest on its own
    lookOffset.x *= Math.exp(-1.5 * delta);
    lookOffset.y *= Math.exp(-1.5 * delta);

    let destPos: THREE.Vector3 = HOME;
    let destLook: THREE.Vector3 = LOOK_HOME;
    if (walking && walkPose(walkPhase, walkDir, { pos: scratch, look: scratchLook })) {
      destPos = scratch;
      destLook = scratchLook;
    } else if (seated && inHall) {
      destPos = SEAT_POS;
      destLook = scratchLook.copy(SEAT_LOOK);
      if (!reduced) {
        // seated looking: a smaller range, like turning the head
        destLook.x += pointer.x * 0.5;
        destLook.y += pointer.y * 0.25;
      }
    } else if (inHall) {
      destPos = HALL_POS;
      destLook = scratchLook.copy(HALL_LOOK);
      if (!reduced) {
        // look around the collection with the mouse; a normal sweep
        // reaches the end paintings and the sculpture row
        destLook.x += pointer.x * 1.6;
        destLook.y += pointer.y * 0.7;
      }
    } else {
      const key = active ?? "home";
      const focus = FOCUS[key];
      destPos = focus ? focus.pos : HOME;
      destLook = focus ? focus.look : LOOK_HOME;
    }

    // The reveal: one direct glide, positioned rather than chased, so it
    // neither starts hidden nor crawls to a stop.
    let introPos: THREE.Vector3 | null = null;
    if (!reduced && !active && !walking && !inHall) {
      if (enteredAt === null) {
        // still behind the title card — hold the opening pose, so the glide
        // begins from a standstill instead of leaping across the room
        introPos = introScratch.copy(INTRO_FROM);
      } else {
        const t = (Date.now() - enteredAt - INTRO_DELAY) / INTRO_DURATION;
        if (t < 1) {
          const c = t > 0 ? t : 0;
          const e = c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
          introPos = introScratch.copy(INTRO_FROM).lerp(HOME, e);
        }
      }
    }

    const px = active || reduced || walking || inHall ? 0 : pointer.x * 0.35;
    const py = active || reduced || walking || inHall ? 0 : pointer.y * 0.22;
    const speed = reduced ? 10 : 3.2;
    const k = 1 - Math.exp(-speed * delta);

    if (introPos) {
      target.current.copy(introPos);
    } else {
      scratch.set(
        destPos.x + px + lookOffset.x,
        destPos.y + py + lookOffset.y,
        destPos.z,
      );
      target.current.lerp(scratch, k);
    }
    look.current.lerp(destLook, k);
    camera.position.copy(target.current);
    lookAt.current.copy(look.current);
    camera.lookAt(lookAt.current);
    // the hall gets a wider gallery lens; the room keeps its intimate one
    const persp = camera as THREE.PerspectiveCamera;
    if (typeof persp.fov === "number") {
      const targetFov =
        inHall || (walking && walkDir === "in") ? 55 : 42;
      if (Math.abs(persp.fov - targetFov) > 0.05) {
        // eslint-disable-next-line react-hooks/immutability -- same contract: the gallery lens is animated per frame on R3F's own camera
        persp.fov = THREE.MathUtils.lerp(persp.fov, targetFov, k);
        persp.updateProjectionMatrix();
      }
    }
  });

  return null;
}
