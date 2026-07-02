"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { UI_COPY } from "@/lib/uiCopy";

type MessageInputProps = {
  loading: boolean;
  onSubmit: (content: string) => void | Promise<void>;
  onTyping?: (content: string) => void;
  maxLength?: number;
  variant?: "default" | "dock";
};

export function MessageInput({
  loading,
  onSubmit,
  onTyping,
  maxLength = 500,
  variant = "default"
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const trimmedValue = value.trim();
  const disabled = loading || !trimmedValue;
  const isDock = variant === "dock";

  const submitMessage = () => {
    if (disabled) {
      return;
    }

    const content = trimmedValue;
    setValue("");
    onTyping?.("");
    void onSubmit(content);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={isDock ? "composer composer--dock" : "composer"}>
      <div className="composer__inner">
        <div className="composer__field">
          <textarea
            aria-label="몽글이에게 보낼 메시지"
            className="composer__textarea"
            maxLength={maxLength}
            onChange={(event) => {
              setValue(event.target.value);
              onTyping?.(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={UI_COPY.inputPlaceholder}
            rows={isDock ? 1 : 3}
            value={value}
            disabled={loading}
          />
          <span className="composer__count" aria-live="polite">
            {value.length}/{maxLength}
          </span>
        </div>
        <button type="submit" aria-label="메시지 보내기" disabled={disabled} className="composer__send">
          보내기
        </button>
      </div>
    </form>
  );
}
