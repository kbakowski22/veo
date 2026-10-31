import { describe, expect, it } from "vitest";
import { formatNumber, formatPercent, formatPLN } from "@/lib/format";

const NBSP = " ";

describe("formatowanie pl-PL", () => {
  it("grupuje tysiące także dla liczb czterocyfrowych", () => {
    expect(formatNumber(3490)).toBe(`3${NBSP}490`);
    expect(formatNumber(1_500_000)).toBe(`1${NBSP}500${NBSP}000`);
  });

  it("formatuje kwoty w złotych", () => {
    expect(formatPLN(349)).toBe(`349${NBSP}zł`);
    expect(formatPLN(650_000)).toBe(`650${NBSP}000${NBSP}zł`);
  });

  it("formatuje procenty z przecinkiem dziesiętnym", () => {
    expect(formatPercent(0.0612)).toMatch(/^6,1\s?%$/);
    expect(formatPercent(Number.NaN)).toBe("–");
  });
});
