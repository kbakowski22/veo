import "server-only";
import { notFound, redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasRoleAtLeast, isRole, type Role } from "./roles";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  foundingMember: boolean;
};

/** Zalogowany użytkownik z profilem albo null. Weryfikuje sesję po stronie Supabase. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, founding_member")
    .eq("id", data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    fullName: profile?.full_name ?? null,
    role: isRole(profile?.role) ? profile.role : "circle",
    foundingMember: Boolean(profile?.founding_member),
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");
  return user;
}

/** Brak uprawnień = 404 (nie zdradzamy istnienia zasobu). */
export async function requireRole(min: Role): Promise<CurrentUser> {
  const user = await requireUser();
  if (!hasRoleAtLeast(user.role, min)) notFound();
  return user;
}
