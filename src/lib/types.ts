export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type MascotMood =
  | "idle"
  | "listening"
  | "thinking"
  | "comforting"
  | "safety";

export type SafetyLevel = 0 | 1 | 2 | 3 | 4;

export type EmotionLabel =
  | "neutral"
  | "stress"
  | "sadness"
  | "loneliness"
  | "anxiety"
  | "helplessness"
  | "anger"
  | "privacy"
  | "medical"
  | "risk";

export type ResponseStyle =
  | "cute_friend"
  | "calm_support"
  | "medical_refusal"
  | "privacy_guard"
  | "prompt_injection_refusal"
  | "safety_mode";

export type CharacterProfile = {
  name: "몽글이";
  role: "AI 정서 친구";
  tone: string;
  safetyRule: string;
};

export type ChatApiRequest = {
  message: string;
  conversationHistory: ChatMessage[];
  sessionMemorySummary: string;
  characterProfile: CharacterProfile;
  safetyLevel: SafetyLevel;
  ageGroup?: "under_14" | "teen" | "adult" | "unknown";
};

export type ChatApiResponse = {
  text_response: string;
  emotion_detected: EmotionLabel;
  emotion_confidence: number;
  safety_level: SafetyLevel;
  risk_reason: string | null;
  should_escalate: boolean;
  suggested_followup: string;
  bubble_text: string | null;
  session_memory_summary: string;
  needs_human_support: boolean;
  response_style: ResponseStyle;
};

export type FrontendEmotionResult = {
  mood: Extract<MascotMood, "idle" | "comforting" | "safety">;
  bubbleText: string | null;
  estimatedSafetyLevel: 0 | 1 | 2 | 3;
  emotionLabel: EmotionLabel;
};
