import { detectFrontendEmotion } from "./frontendEmotionDetector";
import type { ChatApiRequest, ChatApiResponse, EmotionLabel, ResponseStyle, SafetyLevel } from "./types";

const CHAT_TIMEOUT_MS = 10000;
const PRIVACY_PATTERN = /(\b\d{2,3}-\d{3,4}-\d{4}\b|\b\d{3,4}-\d{4}\b|전화번호|주소|주민등록|계좌번호)/;
const MEDICAL_PATTERN = /(진단|치료|약을|약 먹|병원|의사|처방|응급실|아파|통증)/;

function clampSafetyLevel(level: number): SafetyLevel {
  if (level >= 4) {
    return 4;
  }
  if (level >= 3) {
    return 3;
  }
  if (level >= 2) {
    return 2;
  }
  if (level >= 1) {
    return 1;
  }
  return 0;
}

function buildMemorySummary(previous: string, emotion: EmotionLabel, safetyLevel: SafetyLevel) {
  const safetyText = safetyLevel >= 3 ? "안전 안내가 우선인 대화 흐름" : "일상 감정 대화 흐름";
  const nextSummary = previous
    ? previous + " / 최근 감정: " + emotion + ", 상태: " + safetyText
    : "최근 감정: " + emotion + ", 상태: " + safetyText;

  return nextSummary.slice(0, 240);
}

function responseTextFor(label: EmotionLabel, style: ResponseStyle) {
  if (style === "safety_mode") {
    return "지금은 이 이야기를 혼자 안고 있지 않는 게 가장 중요해요. 가까운 보호자, 선생님, 친구처럼 바로 연락할 수 있는 사람에게 지금 상태를 알려주세요. 지역의 공식 도움 자원도 함께 확인해 주세요.";
  }

  if (style === "privacy_guard") {
    return "전화번호나 주소 같은 개인정보는 여기에 적지 않아도 괜찮아요. 현재 화면의 대화는 새로고침하면 사라지지만, 안전을 위해 민감한 정보는 빼고 마음만 말해줘도 충분해요.";
  }

  if (style === "medical_refusal") {
    return "건강이나 약, 몸의 증상에 관한 판단은 여기서 대신할 수 없어요. 불편함이 계속되거나 걱정된다면 신뢰할 수 있는 사람과 함께 공식 의료 자원을 확인해 주세요. 나는 지금 느끼는 마음을 차분히 들어줄게요.";
  }

  if (label === "anxiety") {
    return "시험 생각 때문에 마음이 계속 긴장했겠어요. 지금 당장 모든 걸 해결하려 하기보다, 숨을 천천히 고르고 가장 작은 한 가지부터 골라봐도 괜찮아요.";
  }

  if (label === "sadness") {
    return "마음이 무거운 날에는 말로 꺼내는 것만으로도 꽤 큰 일이에요. 천천히, 떠오르는 만큼만 이야기해줘도 괜찮아요.";
  }

  if (label === "loneliness") {
    return "혼자 버티는 느낌이 들면 하루가 더 길게 느껴질 수 있어요. 지금은 네 이야기가 여기 있다는 것부터 함께 붙잡아볼게요.";
  }

  if (label === "helplessness") {
    return "아무것도 하기 싫은 날에는 아주 작은 움직임도 충분히 의미가 있어요. 물 한 모금, 창문 열기처럼 부담이 작은 것부터 시작해도 괜찮아요.";
  }

  if (label === "stress") {
    return "오늘 많이 버거웠겠어요. 바로 답을 찾지 않아도 괜찮으니, 어떤 일이 제일 마음에 남았는지부터 천천히 말해줘요.";
  }

  return "말해줘서 고마워요. 오늘 마음에 남은 장면을 조금 더 들려주면, 몽글이가 차분히 함께 정리해볼게요.";
}

export function createFallbackChatResponse(request: ChatApiRequest): ChatApiResponse {
  const detected = detectFrontendEmotion(request.message);
  const hasPrivacy = PRIVACY_PATTERN.test(request.message);
  const hasMedical = MEDICAL_PATTERN.test(request.message);
  const safetyLevel = clampSafetyLevel(Math.max(request.safetyLevel, detected.estimatedSafetyLevel));
  const responseStyle: ResponseStyle = safetyLevel >= 3
    ? "safety_mode"
    : hasPrivacy
      ? "privacy_guard"
      : hasMedical
        ? "medical_refusal"
        : detected.emotionLabel === "neutral"
          ? "cute_friend"
          : "calm_support";
  const emotion = hasPrivacy ? "privacy" : hasMedical ? "medical" : detected.emotionLabel;
  const finalSafetyLevel = responseStyle === "safety_mode" ? clampSafetyLevel(Math.max(safetyLevel, 3)) : safetyLevel;

  return {
    text_response: responseTextFor(emotion, responseStyle),
    emotion_detected: emotion,
    emotion_confidence: detected.emotionLabel === "neutral" ? 0.52 : 0.82,
    safety_level: finalSafetyLevel,
    risk_reason: finalSafetyLevel >= 3 ? "risk_signal_detected" : null,
    should_escalate: finalSafetyLevel >= 3,
    suggested_followup: finalSafetyLevel >= 3
      ? "지금 연락할 수 있는 가까운 사람을 떠올려 주세요."
      : "조금 더 이야기해도 괜찮아요.",
    bubble_text: responseStyle === "safety_mode"
      ? "지금은 혼자 버티지 않는 게 중요해."
      : detected.bubbleText,
    session_memory_summary: buildMemorySummary(request.sessionMemorySummary, emotion, finalSafetyLevel),
    needs_human_support: finalSafetyLevel >= 3,
    response_style: responseStyle
  };
}

export async function sendChatMessage(
  request: ChatApiRequest,
  timeoutMs = CHAT_TIMEOUT_MS
): Promise<ChatApiResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error("Chat API request failed");
    }

    return (await response.json()) as ChatApiResponse;
  } catch {
    return createFallbackChatResponse(request);
  } finally {
    window.clearTimeout(timeout);
  }
}
