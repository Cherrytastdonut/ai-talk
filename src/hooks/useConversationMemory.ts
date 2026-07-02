"use client";

import { useCallback, useReducer } from "react";
import { CHARACTER_PROFILE } from "@/lib/uiCopy";
import type { ChatMessage, EmotionLabel, SafetyLevel } from "@/lib/types";

type MemoryState = {
  messages: ChatMessage[];
  sessionMemorySummary: string;
  currentEmotion: EmotionLabel;
  safetyLevel: SafetyLevel;
};

type BuildPromptOverrides = Partial<Pick<MemoryState, "messages" | "sessionMemorySummary" | "safetyLevel">>;

type MemoryAction =
  | { type: "add_message"; message: ChatMessage }
  | { type: "set_summary"; summary: string }
  | { type: "set_emotion"; emotion: EmotionLabel }
  | { type: "set_safety"; level: SafetyLevel }
  | { type: "clear" };

const initialState: MemoryState = {
  messages: [],
  sessionMemorySummary: "",
  currentEmotion: "neutral",
  safetyLevel: 0
};

function memoryReducer(state: MemoryState, action: MemoryAction): MemoryState {
  switch (action.type) {
    case "add_message":
      return {
        ...state,
        messages: [...state.messages, action.message]
      };
    case "set_summary":
      return {
        ...state,
        sessionMemorySummary: action.summary
      };
    case "set_emotion":
      return {
        ...state,
        currentEmotion: action.emotion
      };
    case "set_safety":
      return {
        ...state,
        safetyLevel: action.level
      };
    case "clear":
      return initialState;
    default:
      return state;
  }
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "message-" + Date.now() + "-" + Math.random().toString(36).slice(2);

  return {
    id,
    role,
    content,
    createdAt: Date.now()
  };
}

export function useConversationMemory() {
  const [state, dispatch] = useReducer(memoryReducer, initialState);

  const addUserMessage = useCallback((content: string) => {
    const message = createMessage("user", content);
    dispatch({ type: "add_message", message });
    return message;
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    const message = createMessage("assistant", content);
    dispatch({ type: "add_message", message });
    return message;
  }, []);

  const updateSessionMemorySummary = useCallback((summary: string) => {
    dispatch({ type: "set_summary", summary });
  }, []);

  const updateCurrentEmotion = useCallback((emotion: EmotionLabel) => {
    dispatch({ type: "set_emotion", emotion });
  }, []);

  const updateSafetyLevel = useCallback((level: SafetyLevel) => {
    dispatch({ type: "set_safety", level });
  }, []);

  const clearMemory = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const buildPromptContext = useCallback(
    (overrides: BuildPromptOverrides = {}) => ({
      conversationHistory: overrides.messages ?? state.messages,
      sessionMemorySummary: overrides.sessionMemorySummary ?? state.sessionMemorySummary,
      safetyLevel: overrides.safetyLevel ?? state.safetyLevel,
      characterProfile: CHARACTER_PROFILE
    }),
    [state.messages, state.safetyLevel, state.sessionMemorySummary]
  );

  return {
    ...state,
    addUserMessage,
    addAssistantMessage,
    updateSessionMemorySummary,
    updateCurrentEmotion,
    updateSafetyLevel,
    clearMemory,
    buildPromptContext
  };
}
