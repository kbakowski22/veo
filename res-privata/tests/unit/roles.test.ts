import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analysisLimit, can, canRequestAnalysis, hasRoleAtLeast, isRole, ROLES } from "@/lib/auth/roles";

describe("hierarchia ról", () => {
  it("circle < member < private < admin", () => {
    expect(hasRoleAtLeast("member", "circle")).toBe(true);
    expect(hasRoleAtLeast("circle", "member")).toBe(false);
    expect(hasRoleAtLeast("private", "member")).toBe(true);
    expect(hasRoleAtLeast("member", "private")).toBe(false);
    expect(hasRoleAtLeast("admin", "private")).toBe(true);
    expect(hasRoleAtLeast(null, "circle")).toBe(false);
  });

  it("role w kodzie są zgodne z typem app_role w bazie", () => {
    const sql = readFileSync("supabase/migrations/20261101000100_core.sql", "utf8");
    const match = sql.match(/create type public\.app_role as enum \(([^)]+)\)/);
    const dbRoles = match?.[1].split(",").map((s) => s.trim().replace(/'/g, ""));
    expect(dbRoles).toEqual([...ROLES]);
  });

  it("rozpoznaje poprawne role", () => {
    expect(isRole("member")).toBe(true);
    expect(isRole("superadmin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

describe("uprawnienia wg specyfikacji", () => {
  it("Circle: raporty i zajawki, bez pełnych okazji i partnerów", () => {
    expect(can.viewReports("circle")).toBe(true);
    expect(can.viewOpportunityTeasers("circle")).toBe(true);
    expect(can.viewFullOpportunities("circle")).toBe(false);
    expect(can.viewPartners("circle")).toBe(false);
    expect(can.viewPortfolio("circle")).toBe(false);
  });

  it("Member: pełne okazje, partnerzy, wydarzenia; bez portfela", () => {
    expect(can.viewFullOpportunities("member")).toBe(true);
    expect(can.expressInterest("member")).toBe(true);
    expect(can.viewPartners("member")).toBe(true);
    expect(can.rsvpMemberEvents("member")).toBe(true);
    expect(can.viewPortfolio("member")).toBe(false);
  });

  it("Private: wszystko z Member + portfel i opiekun", () => {
    expect(can.viewFullOpportunities("private")).toBe(true);
    expect(can.viewPortfolio("private")).toBe(true);
    expect(can.contactAdvisor("private")).toBe(true);
    expect(can.accessAdmin("private")).toBe(false);
  });

  it("panel admina tylko dla admina", () => {
    expect(can.accessAdmin("admin")).toBe(true);
    expect(can.accessAdmin(null)).toBe(false);
  });

  it("limit analiz: Circle 1, reszta bez limitu", () => {
    expect(analysisLimit("circle")).toBe(1);
    expect(canRequestAnalysis("circle", 0)).toBe(true);
    expect(canRequestAnalysis("circle", 1)).toBe(false);
    expect(canRequestAnalysis("member", 250)).toBe(true);
    expect(canRequestAnalysis(null, 0)).toBe(false);
  });
});
