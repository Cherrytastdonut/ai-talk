import type { ChatMessage } from "@/lib/types";

type UserMessageHistoryProps = {
  messages: ChatMessage[];
};

export function UserMessageHistory({ messages }: UserMessageHistoryProps) {
  const userMessages = messages.filter((message) => message.role === "user");

  return (
    <aside className="history-panel" aria-label="내가 보낸 말 확인">
      <div className="history-panel__header">
        <p className="history-panel__eyebrow">대화 기록</p>
        <h2 className="history-panel__title">내가 보낸 말</h2>
      </div>
      <div className="history-panel__list">
        {userMessages.length === 0 ? (
          <p className="history-panel__empty">아직 보낸 말이 없어요.</p>
        ) : (
          userMessages.map((message, index) => (
            <article key={message.id} className="history-item">
              <span className="history-item__count">{String(index + 1).padStart(2, "0")}</span>
              <p>{message.content}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
