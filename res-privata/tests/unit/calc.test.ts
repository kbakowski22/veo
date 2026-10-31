import { describe, expect, it } from "vitest";
import { LANDING_RANGES, landingEstimate } from "@/lib/calc";

describe("landingEstimate", () => {
  it("liczy przychód roczny i zwrot brutto", () => {
    const r = landingEstimate({ cena: 600_000, remont: 0, czynsz: 3_000 });
    expect(r.przychodRoczny).toBe(36_000);
    expect(r.kosztCalkowity).toBe(600_000);
    expect(r.zwrotBrutto).toBeCloseTo(0.06, 10);
  });

  it("wlicza remont w koszt", () => {
    const r = landingEstimate({ cena: 500_000, remont: 100_000, czynsz: 3_000 });
    expect(r.kosztCalkowity).toBe(600_000);
    expect(r.zwrotBrutto).toBeCloseTo(0.06, 10);
  });

  it("nie dzieli przez zero", () => {
    expect(landingEstimate({ cena: 0, remont: 0, czynsz: 3_000 }).zwrotBrutto).toBe(0);
  });

  it("wartości startowe mieszczą się w zakresach i krokach suwaków", () => {
    for (const r of Object.values(LANDING_RANGES)) {
      expect(r.initial).toBeGreaterThanOrEqual(r.min);
      expect(r.initial).toBeLessThanOrEqual(r.max);
      expect((r.initial - r.min) % r.step).toBe(0);
    }
  });
});
