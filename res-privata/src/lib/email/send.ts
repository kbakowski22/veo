import "server-only";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { env } from "@/lib/env";

export type SendResult = { ok: true; id?: string; skipped?: boolean } | { ok: false; error: string };

let client: Resend | null = null;

/**
 * Wysyłka maila przez Resend. Bez RESEND_API_KEY mail jest pomijany (log bez danych osobowych),
 * dzięki czemu lokalnie wszystko działa bez konta.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
  tag?: string;
}): Promise<SendResult> {
  if (!env.resendApiKey) {
    console.info(`[email] pominięto (brak RESEND_API_KEY): „${params.subject}”`);
    return { ok: true, skipped: true };
  }
  client ??= new Resend(env.resendApiKey);
  try {
    const { data, error } = await client.emails.send({
      from: env.emailFrom,
      to: params.to,
      subject: params.subject,
      react: params.react,
      replyTo: params.replyTo,
      tags: params.tag ? [{ name: "type", value: params.tag }] : undefined,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Nieznany błąd wysyłki" };
  }
}
