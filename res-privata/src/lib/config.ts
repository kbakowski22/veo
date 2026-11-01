import { cacheLife, cacheTag } from "next/cache";
import { BUSINESS_TERMS } from "@/lib/content/plans";

export const FOUNDING_SEATS_TAG = "founding-seats";

/**
 * Wolne miejsca dla członków założycieli (funkcja `founding_seats_left` w bazie).
 * Wynik w pamięci podręcznej na kilka minut; webhook Stripe (etap 3) odświeża go tagiem.
 * Bez konfiguracji Supabase zwraca pełną pulę.
 */
export async function getFoundingSeatsLeft(): Promise<{ left: number; total: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag(FOUNDING_SEATS_TAG);

  const fallback = { left: BUSINESS_TERMS.foundingSeatsTotal, total: BUSINESS_TERMS.foundingSeatsTotal };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return fallback;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await db.rpc("founding_seats_left").single<{ seats_left: number; seats_total: number }>();
    if (error || !data) return fallback;
    return { left: data.seats_left, total: data.seats_total };
  } catch {
    return fallback;
  }
}
