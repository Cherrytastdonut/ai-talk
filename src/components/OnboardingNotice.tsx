import { UI_COPY } from "@/lib/uiCopy";

export function OnboardingNotice() {
  return (
    <section className="grid gap-3 rounded-lg border border-slate-200 bg-white/80 p-4 text-sm leading-6 text-slate-700 shadow-sm sm:grid-cols-3">
      <p>{UI_COPY.serviceNotice}</p>
      <p>{UI_COPY.supportNotice}</p>
      <p>{UI_COPY.sessionNotice}</p>
    </section>
  );
}
