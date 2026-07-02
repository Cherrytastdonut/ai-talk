"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MascotSpeechBubble } from "./MascotSpeechBubble";
import type { MascotMood } from "@/lib/types";

type MascotFriendProps = {
  mood: MascotMood;
  isWaving: boolean;
  speech?: string | null;
  speechToken?: number;
  bubbleAutoHide?: boolean;
  variant?: "floating" | "center";
  onSpeechExpired?: () => void;
  onClick?: () => void;
};

function sourceForMood(_mood: MascotMood) {
  return "/mascot-custom.png";
}

function MascotCssFace() {
  return (
    <div className="mascot-css-body" aria-hidden="true">
      <span className="mascot-eye mascot-eye-left" />
      <span className="mascot-eye mascot-eye-right" />
      <span className="mascot-mouth" />
      <span className="mascot-blush mascot-blush-left" />
      <span className="mascot-blush mascot-blush-right" />
      <span className="mascot-arm mascot-arm-left" />
      <span className="mascot-arm mascot-arm-right" />
    </div>
  );
}

export function MascotFriend({
  mood,
  isWaving,
  speech,
  speechToken,
  bubbleAutoHide = true,
  variant = "floating",
  onSpeechExpired,
  onClick
}: MascotFriendProps) {
  const [failedSources, setFailedSources] = useState<Record<string, true>>({});
  const imageSource = sourceForMood(mood);
  const useImage = !failedSources[imageSource];
  const safety = mood === "safety";
  const stageClass = variant === "center" ? "mascot-stage mascot-stage--center" : "mascot-stage";

  const mascotCore = useMemo(
    () => (
      <div className="mascot" data-mood={mood} data-waving={isWaving ? "true" : "false"}>
        {useImage ? (
          <Image
            src={imageSource}
            alt="몽글이 AI 정서 친구"
            width={360}
            height={360}
            priority={variant === "center"}
            className="mascot-image"
            onError={() => {
              setFailedSources((current) => ({ ...current, [imageSource]: true }));
            }}
          />
        ) : (
          <MascotCssFace />
        )}
      </div>
    ),
    [imageSource, isWaving, mood, useImage, variant]
  );

  return (
    <aside className={stageClass} aria-label="몽글이 캐릭터 영역">
      <MascotSpeechBubble
        speech={speech}
        speechToken={speechToken}
        safety={safety}
        autoHide={bubbleAutoHide}
        onExpired={onSpeechExpired}
      />
      {onClick ? (
        <button type="button" className="mascot-button" aria-label="몽글이 AI 정서 친구" onClick={onClick}>
          {mascotCore}
        </button>
      ) : (
        <div className="mascot-button" role="img" aria-label="몽글이 AI 정서 친구">
          {mascotCore}
        </div>
      )}
    </aside>
  );
}
