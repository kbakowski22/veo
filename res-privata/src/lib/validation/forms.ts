import { z } from "zod";
import { PLAN_IDS } from "@/lib/content/plans";

/** Nazwa ukrytego pola-pułapki na boty. Prawdziwy użytkownik go nie widzi i nie wypełnia. */
export const HONEYPOT_FIELD = "website";

const email = z
  .string({ error: "Podaj adres e-mail." })
  .trim()
  .toLowerCase()
  .min(1, "Podaj adres e-mail.")
  .max(254, "Adres e-mail jest za długi.")
  .pipe(z.email({ error: "Podaj poprawny adres e-mail." }));

const consent = z.literal(true, { error: "Ta zgoda jest wymagana." });

const honeypot = z.string().max(0).optional();

export const joinSchema = z.object({
  fullName: z
    .string({ error: "Podaj imię i nazwisko." })
    .trim()
    .min(3, "Podaj imię i nazwisko.")
    .max(120, "Imię i nazwisko jest za długie."),
  email,
  plan: z.enum(PLAN_IDS, { error: "Wybierz pakiet." }),
  consent,
  [HONEYPOT_FIELD]: honeypot,
});

export const ANALYSIS_GOALS = [
  { value: "najem", label: "Najem" },
  { value: "odsprzedaz", label: "Odsprzedaż" },
  { value: "nie_wiem", label: "Nie wiem" },
] as const;

export const analysisSchema = z
  .object({
    listingUrl: z
      .string()
      .trim()
      .max(2000, "Link jest za długi.")
      .optional()
      .transform((v) => (v ? v : undefined))
      .pipe(
        z
          .url({ protocol: /^https?$/, error: "Podaj pełny link zaczynający się od https://" })
          .optional(),
      ),
    description: z
      .string()
      .trim()
      .max(5000, "Opis jest za długi (maks. 5000 znaków).")
      .optional()
      .transform((v) => (v ? v : undefined)),
    goal: z.enum(["najem", "odsprzedaz", "nie_wiem"], { error: "Wybierz cel inwestycji." }),
    email,
    consent,
    [HONEYPOT_FIELD]: honeypot,
  })
  .refine((d) => d.listingUrl || (d.description && d.description.length >= 20), {
    path: ["listingUrl"],
    message: "Wklej link do ogłoszenia albo opisz mieszkanie (min. 20 znaków).",
  });

export const loginSchema = z.object({
  email,
  [HONEYPOT_FIELD]: honeypot,
});

export type JoinInput = z.infer<typeof joinSchema>;
export type AnalysisInput = z.infer<typeof analysisSchema>;

/** Zamienia FormData na zwykły obiekt; checkboxy ("on") na boolean. */
export function formDataToObject(
  formData: FormData,
  checkboxes: readonly string[] = [],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION")) continue;
    if (typeof value === "string") out[key] = value;
  }
  for (const key of checkboxes) out[key] = formData.get(key) === "on";
  return out;
}

export type FieldErrors = Partial<Record<string, string>>;

/** Pierwszy komunikat błędu dla każdego pola. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: FieldErrors; values?: Record<string, unknown> };

export const initialFormState: FormState = { status: "idle" };
