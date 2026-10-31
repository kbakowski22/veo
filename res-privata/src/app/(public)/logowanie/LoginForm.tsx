"use client";

import { useActionState } from "react";
import { requestMagicLink } from "../actions";
import { FormStatus, Honeypot, TextField } from "@/components/forms/Fields";
import { initialFormState } from "@/lib/validation/forms";

export function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initialFormState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-paper p-6">
        <p className="label-mono text-accent">Sprawdź skrzynkę</p>
        <p className="mt-2 leading-relaxed">{state.message}</p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <Honeypot />
      <TextField
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        label="E-mail"
        required
        defaultValue={(values.email as string) ?? ""}
        error={errors.email}
      />
      <FormStatus state={state} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Wysyłanie…" : "Wyślij link logowania"}
      </button>
    </form>
  );
}
