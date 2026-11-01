import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Limit zapytań oparty o tabelę `rate_limits` (działa między instancjami Vercel).
 * Zwraca true, gdy zapytanie mieści się w limicie. Przy awarii bazy przepuszcza (fail-open),
 * bo formularze i tak chroni walidacja, honeypot i limity Supabase Auth.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("rate_limit_hit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data === true;
  } catch (e) {
    console.error("[rate-limit] błąd", e instanceof Error ? e.message : e);
    return true;
  }
}

export const LIMITS = {
  joinPerIp: { limit: 5, window: 60 * 60 },
  joinPerEmail: { limit: 3, window: 60 * 60 },
  loginPerIp: { limit: 10, window: 60 * 60 },
  loginPerEmail: { limit: 4, window: 60 * 60 },
} as const;
