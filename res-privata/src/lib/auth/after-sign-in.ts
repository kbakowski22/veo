import "server-only";
import { sendWelcomeEmail } from "@/lib/email";
import { linkSubmissionsToUser } from "@/lib/leads";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isRole } from "./roles";

/**
 * Po każdym zalogowaniu: łączy wcześniejsze zgłoszenia z kontem; przy pierwszym – wysyła
 * mail powitalny. Błędy nie blokują logowania.
 */
export async function afterSignIn(user: { id: string; email?: string | null }) {
  if (!user.email) return;
  const email = user.email.toLowerCase();
  try {
    await linkSubmissionsToUser(user.id, email);

    const db = createSupabaseAdminClient();
    const { data: profile } = await db
      .from("profiles")
      .select("full_name, role, founding_member, welcome_sent_at")
      .eq("id", user.id)
      .single();
    if (!profile || profile.welcome_sent_at) return;

    // Najpierw oznaczamy (warunkowo), potem wysyłamy – brak podwójnych maili przy równoległych logowaniach.
    const { data: claimed } = await db
      .from("profiles")
      .update({ welcome_sent_at: new Date().toISOString() })
      .eq("id", user.id)
      .is("welcome_sent_at", null)
      .select("id");
    if (!claimed?.length) return;

    await sendWelcomeEmail({
      to: email,
      fullName: profile.full_name,
      role: isRole(profile.role) ? profile.role : "circle",
      founding: profile.founding_member,
    });
  } catch (e) {
    console.error("[after-sign-in]", e instanceof Error ? e.message : e);
  }
}
