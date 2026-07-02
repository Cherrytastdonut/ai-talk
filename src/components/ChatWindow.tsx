"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { SafetyNotice } from "./SafetyNotice";
import { UI_COPY } from "@/lib/uiCopy";
import type { ChatMessage as ChatMessageType, SafetyLevel } from "@/lib/types";

type ChatWindowProps = {
  messages: ChatMessageType[];
  loading: boolean;
  safetyLevel: SafetyLevel;
  riskReason?: string | null;
  onSubmit: (content: string) => void | Promise<void>;
  onTyping?: (content: string) => void;
};

export function ChatWindow({
  messages,
  loading,
  safetyLevel,
  riskReason,
  onSubmit,
  onTyping
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, safetyLevel]);

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-soft backdrop-blur">
      <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-ink-900">몽글이와 대화</h2>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
        <SafetyNotice safetyLevel={safetyLevel} riskReason={riskReason} />
        {messages.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-cloud-50 px-5 text-center text-sm leading-6 text-slate-600">
            {UI_COPY.empty}
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        {loading ? (
          <div className="flex justify-start">
            <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm sm:max-w-[76%]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-meadow-500" />
                {UI_COPY.loading}
              </span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>
      <MessageInput loading={loading} onSubmit={onSubmit} onTyping={onTyping} />
    </section>
  );
}
