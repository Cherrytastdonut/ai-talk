"use client";

import { useCallback } from "react";
import { detectFrontendEmotion } from "@/lib/frontendEmotionDetector";

export function useEmotionTrigger() {
  return useCallback((content: string) => detectFrontendEmotion(content), []);
}
