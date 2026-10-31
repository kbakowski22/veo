"use server";

import {
  analysisSchema,
  formDataToObject,
  HONEYPOT_FIELD,
  joinSchema,
  loginSchema,
  toFieldErrors,
  type FormState,
} from "@/lib/validation/forms";

const GENERIC_ERROR = "Sprawdź zaznaczone pola i spróbuj ponownie.";

function isBot(raw: Record<string, unknown>) {
  return typeof raw[HONEYPOT_FIELD] === "string" && raw[HONEYPOT_FIELD] !== "";
}

/**
 * Formularz „Dołącz”.
 * [DO UZUPEŁNIENIA – etap 2] zapis do `leads` + `consents` (z datą, treścią i IP),
 * rate limiting, mail powitalny przez Resend.
 */
export async function submitJoin(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formDataToObject(formData, ["consent"]);
  if (isBot(raw)) return { status: "success", message: "Dziękujemy. Odezwiemy się wkrótce." };

  const parsed = joinSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: GENERIC_ERROR, fieldErrors: toFieldErrors(parsed.error), values: raw };
  }

  const { plan } = parsed.data;
  const message =
    plan === "circle"
      ? "Dziękujemy. Sprawdź skrzynkę – wysłaliśmy link do aktywacji konta Circle."
      : plan === "member"
        ? "Dziękujemy. Za chwilę przekierujemy Cię do bezpiecznej płatności."
        : "Dziękujemy. Odezwiemy się w ciągu jednego dnia roboczego, aby umówić rozmowę.";
  return { status: "success", message };
}

/**
 * Formularz bezpłatnej analizy.
 * [DO UZUPEŁNIENIA – etap 5] zapis do `analysis_requests` ze statusem `received`.
 */
export async function submitAnalysis(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formDataToObject(formData, ["consent"]);
  if (isBot(raw)) return { status: "success", message: "Dziękujemy. Zgłoszenie przyjęte." };

  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: GENERIC_ERROR, fieldErrors: toFieldErrors(parsed.error), values: raw };
  }
  return {
    status: "success",
    message: "Dziękujemy. Zgłoszenie przyjęte – analizę wyślemy na podany adres w ciągu 24 godzin.",
  };
}

/**
 * Logowanie linkiem e-mail.
 * [DO UZUPEŁNIENIA – etap 2] Supabase Auth: signInWithOtp.
 */
export async function requestMagicLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formDataToObject(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: GENERIC_ERROR, fieldErrors: toFieldErrors(parsed.error), values: raw };
  }
  // Ta sama odpowiedź niezależnie od tego, czy konto istnieje (brak wycieku informacji).
  return {
    status: "success",
    message: "Jeśli adres jest zarejestrowany, za chwilę dostaniesz link do logowania.",
  };
}
