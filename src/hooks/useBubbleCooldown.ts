"use client";

import { useCallback, useRef, useState } from "react";

const COOLDOWN_MS = 5000;

type BubbleState = {
  text: string | null;
  token: number;
};

type ShowBubbleOptions = {
  force?: boolean;
};

export function useBubbleCooldown() {
  const [bubble, setBubble] = useState<BubbleState>({ text: null, token: 0 });
  const lastShownAtRef = useRef(0);

  const showBubble = useCallback((text: string | null, options: ShowBubbleOptions = {}) => {
    if (!text) {
      setBubble((current) => ({ text: null, token: current.token }));
      return false;
    }

    const now = Date.now();
    if (!options.force && now - lastShownAtRef.current < COOLDOWN_MS) {
      return false;
    }

    lastShownAtRef.current = now;
    setBubble((current) => ({ text, token: current.token + 1 }));
    return true;
  }, []);

  const clearBubble = useCallback(() => {
    setBubble((current) => ({ text: null, token: current.token }));
  }, []);

  return {
    speech: bubble.text,
    speechToken: bubble.token,
    showBubble,
    clearBubble
  };
}
