import { Suspense } from "react";
import { requireRole } from "@/lib/auth/session";

async function AdminHome() {
  await requireRole("admin");
  return (
    <div>
      <p className="label-mono text-ink-3">Administracja</p>
      <h1 className="h2 mt-6">
        Panel administratora.
        <span className="headline-soft">Wkrótce: CRM, okazje, analizy.</span>
      </h1>
      <p className="mt-8 max-w-xl leading-relaxed text-ink-2">Moduły administracyjne powstaną w etapach 5–7.</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-ink-3">Wczytywanie…</p>}>
      <AdminHome />
    </Suspense>
  );
}
