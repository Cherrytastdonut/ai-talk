import { UI_COPY } from "@/lib/uiCopy";
import type { SafetyLevel } from "@/lib/types";

type SafetyNoticeProps = {
  safetyLevel: SafetyLevel;
  riskReason?: string | null;
};

export function SafetyNotice({ safetyLevel, riskReason }: SafetyNoticeProps) {
  if (safetyLevel < 3) {
    return null;
  }

  return (
    <section role="alert" aria-live="assertive" className="safety-notice">
      <p className="safety-notice__title">지금은 안전을 먼저 확인할게요.</p>
      <p className="safety-notice__body">{UI_COPY.safety}</p>
      {riskReason ? <p className="safety-notice__reason">감지된 신호: {riskReason}</p> : null}
    </section>
  );
}
