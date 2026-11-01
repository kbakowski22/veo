import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/redirect";

describe("safeNextPath", () => {
  it("przepuszcza ścieżki wewnętrzne", () => {
    expect(safeNextPath("/panel/okazje")).toBe("/panel/okazje");
  });
  it("blokuje przekierowania na zewnątrz", () => {
    expect(safeNextPath("https://zly.pl")).toBe("/panel");
    expect(safeNextPath("//zly.pl")).toBe("/panel");
    expect(safeNextPath("/\\zly.pl")).toBe("/panel");
    expect(safeNextPath("/panel\r\nSet-Cookie: x")).toBe("/panel");
  });
  it("używa domyślnej ścieżki", () => {
    expect(safeNextPath(null)).toBe("/panel");
    expect(safeNextPath("", "/admin")).toBe("/admin");
  });
});
