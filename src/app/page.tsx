"use client";

import { useCallback, useMemo, useState } from "react";
import { MessageInput } from "@/components/MessageInput";
import { MascotFriend } from "@/components/MascotFriend";
import { SafetyNotice } from "@/components/SafetyNotice";
import { SessionResetButton } from "@/components/SessionResetButton";
import { UserMessageHistory } from "@/components/UserMessageHistory";
import { useBubbleCooldown } from "@/hooks/useBubbleCooldown";
import { useConversationMemory } from "@/hooks/useConversationMemory";
import { useEmotionTrigger } from "@/hooks/useEmotionTrigger";
import { useMascotState } from "@/hooks/useMascotState";
import { sendChatMessage } from "@/lib/chatApiClient";
import { UI_COPY } from "@/lib/uiCopy";
import type { ChatMessage, SafetyLevel } from "@/lib/types";

function coerceSafetyLevel(level: number): SafetyLevel {
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

function getLatestAssistantMessage(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "assistant") {
      return messages[index];
    }
  }

  return null;
}

export default function Home() {
  const memory = useConversationMemory();
  const detectEmotion = useEmotionTrigger();
  const mascot = useMascotState();
  const bubble = useBubbleCooldown();
  const [loading, setLoading] = useState(false);
  const [riskReason, setRiskReason] = useState<string | null>(null);

  const latestAssistantMessage = useMemo(() => getLatestAssistantMessage(memory.messages), [memory.messages]);
  const speechText = loading
    ? UI_COPY.loading
    : latestAssistantMessage?.content ?? bubble.speech ?? "오늘 마음에 남은 일을 편하게 말해줘.";
  const speechAutoHide = !loading && !latestAssistantMessage && Boolean(bubble.speech);

  const handleSubmit = useCallback(
    async (content: string) => {
      if (loading) {
        return;
      }

      const userMessage = memory.addUserMessage(content);
      const detection = detectEmotion(content);
      const nextSafetyLevel = coerceSafetyLevel(Math.max(memory.safetyLevel, detection.estimatedSafetyLevel));
      const nextMessages = [...memory.messages, userMessage];

      memory.updateCurrentEmotion(detection.emotionLabel);
      memory.updateSafetyLevel(nextSafetyLevel);

      if (detection.mood === "safety") {
        mascot.setMood("safety");
        bubble.showBubble(detection.bubbleText, { force: true });
      } else if (detection.mood === "comforting") {
        mascot.setMood("comforting");
        bubble.showBubble(detection.bubbleText);
      } else {
        mascot.setMood("thinking");
      }

      setLoading(true);

      const promptContext = memory.buildPromptContext({
        messages: nextMessages,
        safetyLevel: nextSafetyLevel
      });

      const response = await sendChatMessage({
        message: content,
        conversationHistory: promptContext.conversationHistory,
        sessionMemorySummary: promptContext.sessionMemorySummary,
        characterProfile: promptContext.characterProfile,
        safetyLevel: promptContext.safetyLevel,
        ageGroup: "unknown"
      });

      memory.addAssistantMessage(response.text_response);
      memory.updateSessionMemorySummary(response.session_memory_summary);
      memory.updateCurrentEmotion(response.emotion_detected);
      memory.updateSafetyLevel(response.safety_level);
      setRiskReason(response.risk_reason);

      if (response.bubble_text) {
        bubble.showBubble(response.bubble_text, { force: response.safety_level >= 3 });
      }

      if (response.safety_level >= 3 || response.response_style === "safety_mode") {
        mascot.setMood("safety");
      } else if (response.response_style === "privacy_guard" || response.response_style === "medical_refusal") {
        mascot.setMood("listening");
        mascot.returnToIdleAfter(5200);
      } else if (response.emotion_detected !== "neutral") {
        mascot.setMood("comforting");
        mascot.returnToIdleAfter(5600);
      } else {
        mascot.resetToIdle();
      }

      setLoading(false);
    },
    [bubble, detectEmotion, loading, mascot, memory]
  );

  const handleTyping = useCallback(
    (value: string) => {
      if (loading) {
        return;
      }

      mascot.setListeningFromText(value, memory.safetyLevel >= 3);
    },
    [loading, mascot, memory.safetyLevel]
  );

  const handleReset = useCallback(() => {
    memory.clearMemory();
    bubble.clearBubble();
    mascot.resetToIdle();
    setRiskReason(null);
    setLoading(false);
  }, [bubble, mascot, memory]);

  return (
    <main className="wellness-app">
      <div className="ambient-layer" aria-hidden="true" />
      <div className="app-shell">
        <header className="topbar">
          <div className="brand-lockup" aria-label="몽글이 로고">
            <span className="brand-mark">M</span>
            <div>
              <p className="brand-kicker">AI emotional friend</p>
              <h1>몽글이</h1>
            </div>
          </div>

          <div className="topbar-copy">
            <p>전문 상담이나 의료 진단이 아닌, 오늘의 감정을 정리하는 작은 대화 공간이에요.</p>
            <p>새로고침하면 현재 대화는 저장되지 않고 사라져요.</p>
          </div>

          <SessionResetButton onReset={handleReset} disabled={loading && memory.messages.length === 0} compact />
        </header>

        <section className="workspace" aria-label="몽글이 대화 화면">
          <UserMessageHistory messages={memory.messages} />

          <section className="conversation-stage" aria-label="몽글이와 답변">
            <div className="stage-toolbar">
              <div>
                <p className="stage-kicker">오늘의 마음</p>
                <h2>천천히 말해도 괜찮아요</h2>
              </div>
              <span className="session-pill">화면 안에서만 유지</span>
            </div>

            <div className="companion-canvas">
              <MascotFriend
                mood={mascot.mood}
                isWaving={mascot.isWaving}
                speech={speechText}
                speechToken={bubble.speechToken + memory.messages.length}
                bubbleAutoHide={speechAutoHide}
                variant="center"
                onSpeechExpired={speechAutoHide ? bubble.clearBubble : undefined}
                onClick={() => {
                  if (memory.safetyLevel >= 3) {
                    mascot.setMood("safety");
                    bubble.showBubble("지금은 혼자 버티지 않는 게 중요해.", { force: true });
                    return;
                  }

                  mascot.setMood("comforting");
                  bubble.showBubble("천천히 말해줘도 괜찮아.", { force: true });
                  mascot.returnToIdleAfter(5200);
                }}
              />
            </div>

            <div className="stage-footnote">
              이름, 전화번호, 주소 같은 개인정보는 입력하지 않는 것이 좋아요.
            </div>

            <div className="stage-safety">
              <SafetyNotice safetyLevel={memory.safetyLevel} riskReason={riskReason} />
            </div>
          </section>
        </section>
      </div>

      <div className="composer-dock" aria-label="메시지 입력 영역">
        <MessageInput loading={loading} onSubmit={handleSubmit} onTyping={handleTyping} variant="dock" />
      </div>
    </main>
  );
}
