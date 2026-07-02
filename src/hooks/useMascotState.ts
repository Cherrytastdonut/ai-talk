"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MascotMood } from "@/lib/types";

export function useMascotState() {
  const [mood, setMoodValue] = useState<MascotMood>("idle");
  const [isWaving, setIsWaving] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const setMood = useCallback(
    (nextMood: MascotMood) => {
      clearIdleTimer();
      setMoodValue(nextMood);
      setIsWaving(nextMood === "comforting");
    },
    [clearIdleTimer]
  );

  const resetToIdle = useCallback(() => {
    clearIdleTimer();
    setMoodValue("idle");
    setIsWaving(false);
  }, [clearIdleTimer]);

  const returnToIdleAfter = useCallback(
    (delayMs = 5600) => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        setMoodValue("idle");
        setIsWaving(false);
        idleTimerRef.current = null;
      }, delayMs);
    },
    [clearIdleTimer]
  );

  const setListeningFromText = useCallback(
    (value: string, lockedSafety = false) => {
      if (lockedSafety) {
        setMood("safety");
        return;
      }

      if (value.trim()) {
        setMood("listening");
      } else {
        resetToIdle();
      }
    },
    [resetToIdle, setMood]
  );

  useEffect(() => clearIdleTimer, [clearIdleTimer]);

  return {
    mood,
    isWaving,
    setMood,
    resetToIdle,
    returnToIdleAfter,
    setListeningFromText
  };
}
