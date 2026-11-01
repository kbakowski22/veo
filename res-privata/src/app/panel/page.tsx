import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/roles";

async function Welcome() {
  const user = await requireUser();
  const firstName = user.fullName?.split(/\s+/)[0];
  return (
    <div>
      <p className="label-mono text-ink-3">Pulpit</p>
      <h1 className="h2 mt-6">
        {firstName ? `Dzień dobry, ${firstName}.` : "Dzień dobry."}
        <span className="headline-soft">Poziom: {ROLE_LABELS[user.role]}.</span>
      </h1>
      {user.foundingMember && (
        <p className="mt-6 inline-flex rounded-full bg-accent px-4 py-2 text-sm text-on-dark">Członek założyciel</p>
      )}
      <p className="mt-8 max-w-xl leading-relaxed text-ink-2">
        Pełny pulpit z okazjami, raportami, kalkulatorem i wydarzeniami pojawi się w etapie 4.
      </p>
    </div>
  );
}

export default function PanelPage() {
  return (
    <Suspense fallback={<p className="text-ink-3">Wczytywanie…</p>}>
      <Welcome />
    </Suspense>
  );
}
