import { NextRequest, NextResponse } from "next/server";
import { createFallbackChatResponse } from "@/lib/chatApiClient";
import type { ChatApiRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<ChatApiRequest>;

  if (!body.message || typeof body.message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const apiRequest: ChatApiRequest = {
    message: body.message,
    conversationHistory: body.conversationHistory ?? [],
    sessionMemorySummary: body.sessionMemorySummary ?? "",
    characterProfile: body.characterProfile ?? {
      name: "몽글이",
      role: "AI 정서 친구",
      tone: "귀엽지만 가볍지 않은 다정한 말투",
      safetyRule: "위기 상황에서는 캐릭터성보다 안전 안내를 우선한다."
    },
    safetyLevel: body.safetyLevel ?? 0,
    ageGroup: body.ageGroup ?? "unknown"
  };

  return NextResponse.json(createFallbackChatResponse(apiRequest));
}
