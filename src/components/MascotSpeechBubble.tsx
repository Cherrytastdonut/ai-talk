"use client";

import { useEffect, useState } from "react";

const DISPLAY_MS = 4800;
const FADE_MS = 260;
const TYPEWRITER_THRESHOLD = 84;
const TYPEWRITER_TICK_MS = 30;

type MascotSpeechBubbleProps = {
  speech?: string | null;
  speechToken?: number;
  safety?: boolean;
  autoHide?: boolean;
  onExpired?: () => void;
};

export function MascotSpeechBubble({
  speech,
  speechToken = 0,
  safety = false,
  autoHide = true,
  onExpired
}: MascotSpeechBubbleProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [displayedSpeech, setDisplayedSpeech] = useState("");

  useEffect(() => {
    if (!speech) {
      setDisplayedSpeech("");
      return;
    }

    const characters = Array.from(speech);

    if (characters.length <= TYPEWRITER_THRESHOLD) {
      setDisplayedSpeech(speech);
      return;
    }

    let nextIndex = 0;
    const chunkSize = characters.length > 260 ? 4 : characters.length > 160 ? 3 : 2;

    setDisplayedSpeech("");

    const printTimer = window.setInterval(() => {
      nextIndex = Math.min(nextIndex + chunkSize, characters.length);
      setDisplayedSpeech(characters.slice(0, nextIndex).join(""));

      if (nextIndex >= characters.length) {
        window.clearInterval(printTimer);
      }
    }, TYPEWRITER_TICK_MS);

    return () => window.clearInterval(printTimer);
  }, [speech, speechToken]);

  useEffect(() => {
    if (!speech) {
      setVisible(false);
      setLeaving(false);
      return;
    }

    setVisible(true);
    setLeaving(false);

    if (!autoHide) {
      return;
    }

    const characters = Array.from(speech).length;
    const chunkSize = characters > 260 ? 4 : characters > 160 ? 3 : 2;
    const printDelay =
      characters > TYPEWRITER_THRESHOLD ? Math.ceil(characters / chunkSize) * TYPEWRITER_TICK_MS : 0;
    const holdDelay = DISPLAY_MS + printDelay;

    const leaveTimer = window.setTimeout(() => setLeaving(true), holdDelay);
    const expireTimer = window.setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      onExpired?.();
    }, holdDelay + FADE_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(expireTimer);
    };
  }, [autoHide, onExpired, speech, speechToken]);

  if (!speech || !visible) {
    return null;
  }

  const speechLength = Array.from(speech).length;
  const bubbleSize = speechLength <= 32 ? "short" : speechLength <= 120 ? "medium" : "long";
  const isPrinting = displayedSpeech.length < speech.length;

  return (
    <div
      className="speech-bubble"
      data-leaving={leaving ? "true" : "false"}
      data-safety={safety ? "true" : "false"}
      data-size={bubbleSize}
      role={safety ? "alert" : "status"}
      aria-live={safety ? "assertive" : "polite"}
    >
      <div className="speech-bubble__content">
        {displayedSpeech}
        {isPrinting ? <span className="speech-bubble__cursor" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}
