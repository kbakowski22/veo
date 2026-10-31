import { describe, expect, it } from "vitest";
import { analysisSchema, formDataToObject, joinSchema, toFieldErrors } from "@/lib/validation/forms";

const validJoin = { fullName: "Jan Kowalski", email: "Jan@Example.pl ", plan: "member", consent: true };

describe("joinSchema", () => {
  it("akceptuje poprawne dane i normalizuje e-mail", () => {
    const r = joinSchema.parse(validJoin);
    expect(r.email).toBe("jan@example.pl");
  });

  it("wymaga zgody RODO", () => {
    const r = joinSchema.safeParse({ ...validJoin, consent: false });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).consent).toBe("Ta zgoda jest wymagana.");
  });

  it("odrzuca nieznany pakiet i błędny e-mail", () => {
    const r = joinSchema.safeParse({ ...validJoin, plan: "vip", email: "nie-email" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errors = toFieldErrors(r.error);
      expect(errors.plan).toBeDefined();
      expect(errors.email).toBe("Podaj poprawny adres e-mail.");
    }
  });

  it("odrzuca wypełnione pole-pułapkę", () => {
    expect(joinSchema.safeParse({ ...validJoin, website: "spam" }).success).toBe(false);
  });
});

describe("analysisSchema", () => {
  const base = { goal: "najem", email: "a@b.pl", consent: true };

  it("wymaga linku albo opisu", () => {
    const r = analysisSchema.safeParse({ ...base, listingUrl: "", description: "" });
    expect(r.success).toBe(false);
  });

  it("akceptuje sam link", () => {
    expect(analysisSchema.safeParse({ ...base, listingUrl: "https://www.otodom.pl/oferta/x" }).success).toBe(true);
  });

  it("akceptuje sam opis (min. 20 znaków)", () => {
    expect(
      analysisSchema.safeParse({ ...base, description: "Kraków, Podgórze, 42 m², 3 piętro, 690 tys." }).success,
    ).toBe(true);
  });

  it("odrzuca link bez http(s)", () => {
    expect(analysisSchema.safeParse({ ...base, listingUrl: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("formDataToObject", () => {
  it("zamienia checkboxy na boolean", () => {
    const fd = new FormData();
    fd.set("email", "a@b.pl");
    fd.set("consent", "on");
    expect(formDataToObject(fd, ["consent", "other"])).toEqual({ email: "a@b.pl", consent: true, other: false });
  });
});
