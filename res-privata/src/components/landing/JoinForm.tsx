"use client";

import { useActionState, useEffect, useState } from "react";
import { submitJoin } from "@/app/(public)/actions";
import { ConsentCheckbox, FieldError, FormStatus, Honeypot, TextField } from "@/components/forms/Fields";
import { CONSENTS } from "@/lib/content/consents";
import { PLANS, type PlanId } from "@/lib/content/plans";
import { initialFormState } from "@/lib/validation/forms";

const PLAN_LABELS: Record<PlanId, string> = {
  circle: "0 zł",
  member: "od 349 zł / mies.",
  private: "990 zł / mies.",
};

function planFromHash(): PlanId | null {
  const match = window.location.hash.match(/^#dolacz-(circle|member|private)$/);
  return (match?.[1] as PlanId | undefined) ?? null;
}

export function JoinForm() {
  const [state, action, pending] = useActionState(submitJoin, initialFormState);
  const [plan, setPlan] = useState<PlanId>("circle");

  // Przyciski w kartach pakietów prowadzą do #dolacz-<pakiet>: ustawiamy wybór i przewijamy do formularza.
  useEffect(() => {
    const apply = () => {
      const p = planFromHash();
      if (!p) return;
      setPlan(p);
      document.getElementById("dolacz")?.scrollIntoView({ block: "start" });
      document.getElementById("f-fullName")?.focus({ preventScroll: true });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-white/20 p-8">
        <p className="label-mono text-accent-light">Zgłoszenie przyjęte</p>
        <p className="mt-3 text-xl leading-relaxed">{state.message}</p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form action={action} noValidate className="flex flex-col gap-6">
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="fullName"
          label="Imię i nazwisko"
          autoComplete="name"
          required
          tone="accent"
          defaultValue={(values.fullName as string) ?? ""}
          error={errors.fullName}
        />
        <TextField
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          inputMode="email"
          required
          tone="accent"
          defaultValue={(values.email as string) ?? ""}
          error={errors.email}
        />
      </div>

      <fieldset aria-describedby={errors.plan ? "f-plan-error" : undefined}>
        <legend className="field-label">Pakiet</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/25 px-4 py-3.5 transition-colors hover:border-white/60 has-[:checked]:border-accent-light has-[:checked]:bg-white/[0.07] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-light"
            >
              <input
                type="radio"
                name="plan"
                value={p.id}
                checked={plan === p.id}
                onChange={() => setPlan(p.id)}
                className="size-4 accent-accent-light"
              />
              <span className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-accent-light">{PLAN_LABELS[p.id]}</span>
              </span>
            </label>
          ))}
        </div>
        <FieldError id="f-plan-error" message={errors.plan} tone="accent" />
      </fieldset>

      <ConsentCheckbox text={CONSENTS.joinRodo.text} tone="accent" error={errors.consent} />

      <FormStatus state={state} tone="accent" />

      <div>
        <button type="submit" className="btn btn-light w-full sm:w-auto" disabled={pending}>
          {pending ? "Wysyłanie…" : plan === "private" ? "Umów rozmowę" : "Dołącz do klubu"}
        </button>
      </div>
    </form>
  );
}
