import type { ChatMessage as ChatMessageType } from "@/lib/types";

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const rowClass = isUser ? "justify-end" : "justify-start";
  const bubbleClass = isUser
    ? "bg-ink-900 text-white rounded-br-sm"
    : "bg-white text-ink-900 border border-slate-200 rounded-bl-sm";
  const label = isUser ? "나" : "몽글이";
  const createdAt = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(message.createdAt));

  return (
    <div className={"flex " + rowClass}>
      <article className="max-w-[88%] sm:max-w-[76%]">
        <div className="mb-1 flex items-center gap-2 px-1 text-xs text-slate-500">
          <span>{label}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(message.createdAt).toISOString()}>{createdAt}</time>
        </div>
        <p className={"whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:text-[0.95rem] " + bubbleClass}>
          {message.content}
        </p>
      </article>
    </div>
  );
}
