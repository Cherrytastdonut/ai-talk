"use client";

import { UI_COPY } from "@/lib/uiCopy";

type SessionResetButtonProps = {
  onReset: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function SessionResetButton({ onReset, disabled = false, compact = false }: SessionResetButtonProps) {
  const handleClick = () => {
    if (window.confirm(UI_COPY.resetConfirm)) {
      onReset();
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={UI_COPY.resetButton}
        className="reset-button reset-button--compact"
      >
        초기화
      </button>
    );
  }

  return (
    <div className="reset-card">
      <p>{UI_COPY.resetHelp}</p>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={UI_COPY.resetButton}
        className="reset-button"
      >
        {UI_COPY.resetButton}
      </button>
    </div>
  );
}
