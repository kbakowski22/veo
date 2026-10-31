"use client";

import { useActionState } from "react";
import { submitAnalysis } from "../actions";
import { ConsentCheckbox, FieldError, FormStatus, Honeypot, TextField } from "@/components/forms/Fields";
import { CONSENTS } from "@/lib/content/consents";
import { ANALYSIS_GOALS, initialFormState } from "@/lib/validation/forms";

export function AnalysisForm() {
  const [state, action, pending] = useActionState(submitAnalysis, initialFormState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius-card-lg)] border border-line bg-card p-8 sm:p-10">
        <p className="label-mono text-accent">Zgłoszenie przyjęte</p>
        <p className="mt-3 text-xl leading-relaxed">{state.message}</p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form
      action={action}
      noValidate
      className="flex flex-col gap-7 rounded-[var(--radius-card-lg)] border border-line bg-card p-6 sm:p-10"
    >
      <Honeypot />
      <TextField
        name="listingUrl"
        type="url"
        inputMode="url"
        label="Link do ogłoszenia"
        placeholder="https://"
        defaultValue={(values.listingUrl as string) ?? ""}
        error={errors.listingUrl}
      />
      <TextField
        name="description"
        label="Albo opis mieszkania"
        multiline
        maxLength={5000}
        hint="Miasto, dzielnica, metraż, piętro, cena, stan. Jeśli mieszkanie nie jest wystawione na portalu, opisz je tutaj."
        defaultValue={(values.description as string) ?? ""}
        error={errors.description}
      />
      <fieldset aria-describedby={errors.goal ? "f-goal-error" : undefined}>
        <legend className="field-label">Cel inwestycji</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {ANALYSIS_GOALS.map((g) => (
            <label
              key={g.value}
              className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border border-line px-4 transition-colors hover:border-ink-3 has-[:checked]:border-accent has-[:checked]:bg-accent/[0.05] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input
                type="radio"
                name="goal"
                value={g.value}
                defaultChecked={(values.goal ?? "najem") === g.value}
                className="size-4 accent-accent"
              />
              <span>{g.label}</span>
            </label>
          ))}
        </div>
        <FieldError id="f-goal-error" message={errors.goal} />
      </fieldset>
      <TextField
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        label="E-mail, na który wyślemy analizę"
        required
        defaultValue={(values.email as string) ?? ""}
        error={errors.email}
      />
      <ConsentCheckbox text={CONSENTS.analysisRodo.text} error={errors.consent} />
      <FormStatus state={state} />
      <div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
          {pending ? "Wysyłanie…" : "Zamów bezpłatną analizę"}
        </button>
      </div>
    </form>
  );
}
