import { UI_COPY } from "@/lib/uiCopy";

export function PrivacyNotice() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-700">
      {UI_COPY.privacy}
    </section>
  );
}
