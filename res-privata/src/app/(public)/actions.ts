"use server";

import { sendMagicLink } from "@/lib/auth/magic-link";
import { CONSENTS } from "@/lib/content/consents";
import { getPlan } from "@/lib/content/plans";
import { sendAdminLeadNotification } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/env";
import { recordConsent, upsertLead } from "@/lib/leads";
import { checkRateLimit, LIMITS } from "@/lib/security/rate-limit";
import { getRequestMeta, hashKey } from "@/lib/security/request";
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
const TOO_MANY = "Zbyt wiele prób w krótkim czasie. Spróbuj ponownie za godzinę.";
const UNAVAILABLE =
  "Nie udało się wysłać formularza. Spróbuj ponownie za chwilę lub napisz do nas: [DO UZUPEŁNIENIA: e-mail kontaktowy].";

function isBot(raw: Record<string, unknown>) {
  return typeof raw[HONEYPOT_FIELD] === "string" && raw[HONEYPOT_FIELD] !== "";
}

/** Formularz „Dołącz”: lead + zgoda RODO, link aktywacyjny (Circle/Member), powiadomienie admina. */
export async function submitJoin(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formDataToObject(formData, ["consent"]);
  if (isBot(raw)) return { status: "success", message: "Dziękujemy. Odezwiemy się wkrótce." };

  const parsed = joinSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: GENERIC_ERROR, fieldErrors: toFieldErrors(parsed.error), values: raw };
  }
  const { fullName, email, plan } = parsed.data;

  if (!isSupabaseConfigured()) {
    console.warn("[dolacz] Supabase nie jest skonfigurowany – zgłoszenie nie zostało zapisane.");
    return { status: "error", message: UNAVAILABLE, values: raw };
  }

  const meta = await getRequestMeta();
  const [ipOk, emailOk] = await Promise.all([
    checkRateLimit(`join:ip:${meta.ipHash}`, LIMITS.joinPerIp.limit, LIMITS.joinPerIp.window),
    checkRateLimit(`join:email:${hashKey(email)}`, LIMITS.joinPerEmail.limit, LIMITS.joinPerEmail.window),
  ]);
  if (!ipOk || !emailOk) return { status: "error", message: TOO_MANY, values: raw };

  try {
    await recordConsent({ email, consent: CONSENTS.joinRodo, source: "dolacz", meta });
    const lead = await upsertLead({ email, fullName, plan, source: "dolacz" });

    if (plan === "circle" || plan === "member") {
      const { error } = await sendMagicLink({ email, fullName, createUser: true });
      if (error) console.error("[dolacz] magic link:", error);
    }
    if (lead.callBy) {
      await sendAdminLeadNotification({
        fullName,
        email,
        plan: getPlan(plan).name,
        source: "Formularz Dołącz",
        callBy: lead.callBy,
      });
    }
  } catch (e) {
    console.error("[dolacz]", e instanceof Error ? e.message : e);
    return { status: "error", message: UNAVAILABLE, values: raw };
  }

  const message =
    plan === "circle"
      ? "Dziękujemy. Sprawdź skrzynkę – wysłaliśmy link aktywujący konto Circle."
      : plan === "member"
        ? "Dziękujemy. Sprawdź skrzynkę – po kliknięciu w link przejdziesz do bezpiecznej płatności."
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

/** Logowanie linkiem e-mail. Odpowiedź zawsze taka sama (nie zdradzamy, czy konto istnieje). */
export async function requestMagicLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = formDataToObject(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: GENERIC_ERROR, fieldErrors: toFieldErrors(parsed.error), values: raw };
  }
  const success: FormState = {
    status: "success",
    message: "Jeśli adres jest zarejestrowany, za chwilę dostaniesz link do logowania.",
  };
  if (isBot(raw)) return success;

  if (!isSupabaseConfigured()) {
    console.warn("[logowanie] Supabase nie jest skonfigurowany.");
    return { status: "error", message: UNAVAILABLE, values: raw };
  }

  const { email } = parsed.data;
  const meta = await getRequestMeta();
  const [ipOk, emailOk] = await Promise.all([
    checkRateLimit(`login:ip:${meta.ipHash}`, LIMITS.loginPerIp.limit, LIMITS.loginPerIp.window),
    checkRateLimit(`login:email:${hashKey(email)}`, LIMITS.loginPerEmail.limit, LIMITS.loginPerEmail.window),
  ]);
  if (!ipOk || !emailOk) return { status: "error", message: TOO_MANY, values: raw };

  const { error } = await sendMagicLink({ email, createUser: false });
  // Błąd „użytkownik nie istnieje” celowo ukrywamy.
  if (error && !/signups not allowed|not found/i.test(error)) console.error("[logowanie]", error);
  return success;
}
