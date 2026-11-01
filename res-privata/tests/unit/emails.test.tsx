import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import AdminNewLead from "@/emails/AdminNewLead";
import { DISCLAIMER } from "@/emails/BrandLayout";
import WelcomeCircle from "@/emails/WelcomeCircle";
import WelcomeMember from "@/emails/WelcomeMember";
import WelcomePrivate from "@/emails/WelcomePrivate";

const cases = [
  ["Powitanie Circle", <WelcomeCircle key="c" {...WelcomeCircle.PreviewProps} />, "Otwórz najnowszy raport"],
  ["Powitanie Member", <WelcomeMember key="m" {...WelcomeMember.PreviewProps} />, "Gwarancja 90 dni"],
  ["Powitanie Private", <WelcomePrivate key="p" {...WelcomePrivate.PreviewProps} />, "Mój portfel"],
  ["Lead dla admina", <AdminNewLead key="a" {...AdminNewLead.PreviewProps} />, "Zadzwoń do"],
] as const;

describe("szablony maili", () => {
  it.each(cases)("%s: treść, marka i zastrzeżenie", async (_name, element, expected) => {
    const html = await render(element);
    expect(html).toContain("RES PRIVATA");
    expect(html).toContain(expected);
    expect(html).toContain(DISCLAIMER);
    expect(html).not.toMatch(/gwarantowany zysk/i);
    // Ton marki: bez wykrzykników w treści (sprawdzamy tekst, nie znaczniki HTML).
    const text = await render(element, { plainText: true });
    expect(text).not.toContain("!");
  });

  it("powitanie Circle bez linku do Prześwietl, gdy narzędzie nie jest jeszcze dostępne", async () => {
    const html = await render(<WelcomeCircle reportUrl="https://x.pl/panel/raporty" />);
    expect(html).not.toContain("Prześwietl ogłoszenie");
  });

  it("link do wypisania pojawia się tylko w mailach marketingowych", async () => {
    const html = await render(<WelcomeMember {...WelcomeMember.PreviewProps} />);
    expect(html).not.toContain("Wypisz się");
  });
});
