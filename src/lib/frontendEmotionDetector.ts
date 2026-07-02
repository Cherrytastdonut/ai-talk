import { BUBBLE_COPY } from "./uiCopy";
import type { EmotionLabel, FrontendEmotionResult } from "./types";

const KEYWORDS = {
  stress: ["힘들어", "힘들다", "지쳤어", "지친다", "피곤해", "버겁다", "스트레스", "속상해"],
  sadness: ["우울해", "슬퍼", "울고 싶어", "마음이 무거워"],
  loneliness: ["외로워", "혼자인 것 같아", "아무도 없어"],
  anxiety: ["불안해", "무서워", "잠이 안 와", "걱정돼"],
  helplessness: ["아무것도 하기 싫어", "무기력해", "못하겠어", "포기하고 싶어"],
  risk: ["죽고 싶어", "사라지고 싶어", "끝내고 싶어", "자해", "살기 싫어"]
} satisfies Partial<Record<EmotionLabel, string[]>>;

const PRIVACY_PATTERN = /(\b\d{2,3}-\d{3,4}-\d{4}\b|\b\d{3,4}-\d{4}\b|전화번호|주소|주민등록|계좌번호)/;
const MEDICAL_PATTERN = /(진단|치료|약을|약 먹|병원|의사|처방|응급실|아파|통증)/;

function includesKeyword(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

function pickBubble(label: EmotionLabel, seed: string) {
  const candidates = BUBBLE_COPY[label];
  if (!candidates.length) {
    return null;
  }

  const index = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % candidates.length;
  return candidates[index];
}

function result(label: EmotionLabel, seed: string): FrontendEmotionResult {
  if (label === "risk") {
    return {
      mood: "safety",
      bubbleText: pickBubble(label, seed),
      estimatedSafetyLevel: 3,
      emotionLabel: label
    };
  }

  if (label === "neutral" || label === "privacy" || label === "medical") {
    return {
      mood: "idle",
      bubbleText: label === "neutral" ? null : pickBubble(label, seed),
      estimatedSafetyLevel: label === "neutral" ? 0 : 1,
      emotionLabel: label
    };
  }

  return {
    mood: "comforting",
    bubbleText: pickBubble(label, seed),
    estimatedSafetyLevel: label === "helplessness" ? 2 : 1,
    emotionLabel: label
  };
}

export function detectFrontendEmotion(message: string): FrontendEmotionResult {
  const normalized = message.trim().toLowerCase();

  if (!normalized) {
    return result("neutral", normalized);
  }

  if (includesKeyword(normalized, KEYWORDS.risk)) {
    return result("risk", normalized);
  }

  if (includesKeyword(normalized, KEYWORDS.helplessness)) {
    return result("helplessness", normalized);
  }

  if (includesKeyword(normalized, KEYWORDS.anxiety)) {
    return result("anxiety", normalized);
  }

  if (includesKeyword(normalized, KEYWORDS.loneliness)) {
    return result("loneliness", normalized);
  }

  if (includesKeyword(normalized, KEYWORDS.sadness)) {
    return result("sadness", normalized);
  }

  if (includesKeyword(normalized, KEYWORDS.stress)) {
    return result("stress", normalized);
  }

  if (PRIVACY_PATTERN.test(normalized)) {
    return result("privacy", normalized);
  }

  if (MEDICAL_PATTERN.test(normalized)) {
    return result("medical", normalized);
  }

  return result("neutral", normalized);
}
