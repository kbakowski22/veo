import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Odświeża sesję Supabase i wstępnie chroni /panel oraz /admin (przekierowanie na logowanie).
 * To tylko filtr optymistyczny – właściwe sprawdzenie uprawnień robią strony (requireRole) i RLS.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const loginUrl = new URL("/logowanie", request.url);
  if (!url || !key) return NextResponse.redirect(loginUrl);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return NextResponse.redirect(loginUrl);
  return response;
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
};
