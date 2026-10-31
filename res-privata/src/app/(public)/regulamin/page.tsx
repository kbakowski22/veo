import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Regulamin" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Regulamin"
      sections={[
        { title: "Postanowienia ogólne i dane usługodawcy" },
        { title: "Definicje" },
        { title: "Rodzaje członkostwa: Circle, Member, Private" },
        { title: "Zawarcie umowy i rejestracja konta" },
        { title: "Płatności, okres rozliczeniowy i odnowienie subskrypcji" },
        { title: "Gwarancja 90 dni w pakiecie Member" },
        { title: "Wynagrodzenie od transakcji w pakiecie Private" },
        { title: "Charakter informacyjny materiałów (brak rekomendacji inwestycyjnej)" },
        { title: "Odstąpienie od umowy i rezygnacja" },
        { title: "Reklamacje" },
        { title: "Odpowiedzialność" },
        { title: "Postanowienia końcowe" },
      ]}
    />
  );
}
