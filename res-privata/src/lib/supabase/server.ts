import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Klient Supabase w imieniu zalogowanego użytkownika (klucz publiczny + sesja z ciasteczek).
 * Wszystkie zapytania przechodzą przez RLS.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Wywołanie z komponentu serwerowego – odświeżeniem sesji zajmuje się proxy.
        }
      },
    },
  });
}
