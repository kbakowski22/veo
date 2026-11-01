import "server-only";

/**
 * Dostęp do zmiennych środowiskowych po stronie serwera.
 * Brak kluczy nie wywraca aplikacji: funkcje zwracają czytelny błąd lub tryb „pominięty”,
 * żeby stronę dało się uruchomić lokalnie bez kont zewnętrznych.
 */
export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Res Privata <onboarding@resend.dev>",
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? "",
  /** Sól do haszowania adresów IP w kluczach limitów (dowolny długi losowy ciąg). */
  rateLimitSalt: process.env.RATE_LIMIT_SALT ?? "res-privata-dev-salt",
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey && env.supabaseServiceRoleKey);
}
