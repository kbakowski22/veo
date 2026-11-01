import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Klient z kluczem serwisowym – OMIJA RLS. Tylko po stronie serwera, tylko po wcześniejszej
 * walidacji danych i sprawdzeniu uprawnień (formularze publiczne, webhooki, zadania w tle).
 */
export function createSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Brak konfiguracji Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Klient anonimowy bez sesji – do publicznych funkcji RPC (np. licznik miejsc). */
export function createSupabasePublicClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
