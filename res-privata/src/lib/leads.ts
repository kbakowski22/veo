import "server-only";
import type { ConsentDefinition } from "@/lib/content/consents";
import type { PlanId } from "@/lib/content/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { RequestMeta } from "@/lib/security/request";

type LeadSource = "dolacz" | "analiza" | "przeswietl" | "inne";
const OPEN_STATUSES = ["nowy", "kontakt", "rozmowa"];

/** Zapis zgody z pełną treścią, wersją, datą (domyślnie now()) i IP. */
export async function recordConsent(params: {
  email: string;
  consent: ConsentDefinition;
  source: string;
  meta: RequestMeta;
  userId?: string | null;
}) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("consents").insert({
    email: params.email,
    user_id: params.userId ?? null,
    type: params.consent.type,
    version: params.consent.version,
    text: params.consent.text,
    granted: true,
    source: params.source,
    ip: params.meta.ip,
    user_agent: params.meta.userAgent,
  });
  if (error) throw new Error(`Zapis zgody nie powiódł się: ${error.message}`);
}

/**
 * Tworzy lead albo aktualizuje otwarty lead z tym samym e-mailem (bez duplikatów w CRM).
 * Dla Member i Private ustawia przypomnienie „zadzwoń w 48 h”.
 */
export async function upsertLead(params: {
  email: string;
  fullName: string;
  plan: PlanId;
  source: LeadSource;
}): Promise<{ id: string; callBy: Date | null; isNew: boolean }> {
  const db = createSupabaseAdminClient();
  const callBy = params.plan === "circle" ? null : new Date(Date.now() + 48 * 60 * 60 * 1000);

  const { data: existing, error: findError } = await db
    .from("leads")
    .select("id, plan_interest, next_contact_at")
    .eq("email", params.email)
    .in("status", OPEN_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) throw new Error(`Odczyt leadu nie powiódł się: ${findError.message}`);

  if (existing) {
    const { error } = await db
      .from("leads")
      .update({
        full_name: params.fullName,
        plan_interest: params.plan,
        next_contact_at: existing.next_contact_at ?? callBy?.toISOString() ?? null,
      })
      .eq("id", existing.id);
    if (error) throw new Error(`Aktualizacja leadu nie powiodła się: ${error.message}`);
    return { id: existing.id, callBy, isNew: false };
  }

  const { data, error } = await db
    .from("leads")
    .insert({
      email: params.email,
      full_name: params.fullName,
      plan_interest: params.plan,
      source: params.source,
      next_contact_at: callBy?.toISOString() ?? null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Zapis leadu nie powiódł się: ${error?.message}`);
  return { id: data.id, callBy, isNew: true };
}

/** Po pierwszym zalogowaniu łączymy wcześniejsze zgłoszenia i zgody z kontem. */
export async function linkSubmissionsToUser(userId: string, email: string) {
  const db = createSupabaseAdminClient();
  await Promise.all([
    db.from("consents").update({ user_id: userId }).eq("email", email).is("user_id", null),
    db.from("leads").update({ user_id: userId }).eq("email", email).is("user_id", null),
    db.from("analysis_requests").update({ user_id: userId }).eq("email", email).is("user_id", null),
  ]);
}
