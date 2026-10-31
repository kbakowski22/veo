import Link from "next/link";
import { HONEYPOT_FIELD } from "@/lib/validation/forms";

type Tone = "light" | "accent";

function errorClass(tone: Tone) {
  return tone === "accent" ? "text-error-on-dark" : "text-error";
}

export function FieldError({ id, message, tone = "light" }: { id: string; message?: string; tone?: Tone }) {
  if (!message) return null;
  return (
    <p id={id} className={`mt-2 text-sm ${errorClass(tone)}`}>
      {message}
    </p>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  error?: string;
  tone?: Tone;
  multiline?: boolean;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;

export function TextField({ name, label, error, tone = "light", multiline, hint, id, ...rest }: TextFieldProps) {
  const fieldId = id ?? `f-${name}`;
  const errId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id: fieldId,
    name,
    className: "field",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };
  return (
    <div>
      <label htmlFor={fieldId} className="field-label">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...common}
          defaultValue={rest.defaultValue as string | undefined}
          placeholder={rest.placeholder}
          required={rest.required}
          maxLength={rest.maxLength}
        />
      ) : (
        <input {...common} {...rest} />
      )}
      {hint && (
        <p id={hintId} className={`mt-2 text-sm ${tone === "accent" ? "text-accent-light" : "text-ink-3"}`}>
          {hint}
        </p>
      )}
      <FieldError id={errId} message={error} tone={tone} />
    </div>
  );
}

export function ConsentCheckbox({
  name = "consent",
  text,
  error,
  tone = "light",
  defaultChecked,
}: {
  name?: string;
  text: string;
  error?: string;
  tone?: Tone;
  defaultChecked?: boolean;
}) {
  const id = `f-${name}`;
  const errId = `${id}-error`;
  return (
    <div>
      <div className="flex gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          required
          defaultChecked={defaultChecked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={`mt-1 size-5 shrink-0 cursor-pointer rounded ${tone === "accent" ? "accent-accent-light" : "accent-accent"}`}
        />
        <label htmlFor={id} className={`text-[13px] leading-relaxed ${tone === "accent" ? "text-on-dark-2" : "text-ink-2"}`}>
          {text}{" "}
          <Link href="/polityka-prywatnosci" className="underline underline-offset-2">
            Czytaj Politykę prywatności
          </Link>
          <span className="sr-only"> (wymagane)</span>
        </label>
      </div>
      <FieldError id={errId} message={error} tone={tone} />
    </div>
  );
}

/** Ukryte pole-pułapka na boty. */
export function Honeypot() {
  return (
    <div className="hp-field" aria-hidden="true">
      <label htmlFor={`f-${HONEYPOT_FIELD}`}>Nie wypełniaj tego pola</label>
      <input id={`f-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FormStatus({ state, tone = "light" }: { state: { status: string; message?: string }; tone?: Tone }) {
  return (
    <div aria-live="polite" role="status">
      {state.status === "error" && state.message && (
        <p className={`text-sm ${errorClass(tone)}`}>{state.message}</p>
      )}
    </div>
  );
}
