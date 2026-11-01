/**
 * Role i uprawnienia. Te same reguły egzekwuje baza (RLS, funkcje has_role_at_least),
 * a ten moduł służy do sprawdzeń po stronie serwera i do budowania interfejsu.
 */
export const ROLES = ["circle", "member", "private", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  circle: "Circle",
  member: "Member",
  private: "Private",
  admin: "Administrator",
};

const RANK: Record<Role, number> = { circle: 1, member: 2, private: 3, admin: 4 };

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function hasRoleAtLeast(role: Role | null | undefined, min: Role): boolean {
  if (!role) return false;
  return RANK[role] >= RANK[min];
}

export const can = {
  viewReports: (r: Role | null) => hasRoleAtLeast(r, "circle"),
  viewOpportunityTeasers: (r: Role | null) => hasRoleAtLeast(r, "circle"),
  viewFullOpportunities: (r: Role | null) => hasRoleAtLeast(r, "member"),
  expressInterest: (r: Role | null) => hasRoleAtLeast(r, "member"),
  viewPartners: (r: Role | null) => hasRoleAtLeast(r, "member"),
  rsvpMemberEvents: (r: Role | null) => hasRoleAtLeast(r, "member"),
  viewPortfolio: (r: Role | null) => hasRoleAtLeast(r, "private"),
  contactAdvisor: (r: Role | null) => hasRoleAtLeast(r, "private"),
  accessAdmin: (r: Role | null) => r === "admin",
};

/** Limit analiz mieszkań: Circle 1, wyższe pakiety bez limitu. */
export function analysisLimit(role: Role | null): number {
  if (!role) return 0;
  return role === "circle" ? 1 : Number.POSITIVE_INFINITY;
}

export function canRequestAnalysis(role: Role | null, alreadyRequested: number): boolean {
  return alreadyRequested < analysisLimit(role);
}
