"use client";

import { useEffect, useRef } from "react";
import { useRoomStore } from "../room/store";

export function useAmbience(): void {
  const muted = useRoomStore((s) => s.muted);
  // Lazily loaded so browsers without WebAudio and muted-by-default
  // mounts never touch the audio stack.
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    if (muted) {
      nodesRef.current?.gain.gain.setTargetAtTime(
        0,
        ctxRef.current?.currentTime ?? 0,
        0.4,
      );
      return;
    }
    try {
      if (!ctxRef.current) {
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AC) return;
        ctxRef.current = new AC();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      if (!nodesRef.current) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 55;
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        nodesRef.current = { osc, gain };
      }
      nodesRef.current.gain.gain.setTargetAtTime(0.035, ctx.currentTime, 0.8);
    } catch {
      // Audio is optional ambience; never break the room.
    }
  }, [muted]);

  useEffect(
    () => () => {
      try {
        nodesRef.current?.osc.stop();
        void ctxRef.current?.close();
      } catch {
        // ignore teardown errors
      }
    },
    [],
  );
}
