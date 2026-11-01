import "server-only";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Wysyła link logowania (Supabase Auth). Treść maila ustawiasz w Supabase:
 * Authentication → Email Templates → Magic Link (szablon: supabase/templates/magic-link.html).
 * Link prowadzi do /auth/confirm, które weryfikuje token (działa także na innym urządzeniu).
 */
export async function sendMagicLink(params: { email: string; fullName?: string; createUser: boolean }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: params.email,
    options: {
      shouldCreateUser: params.createUser,
      emailRedirectTo: `${env.siteUrl}/auth/confirm`,
      data: params.fullName ? { full_name: params.fullName } : undefined,
    },
  });
  return { error: error?.message ?? null };
}
