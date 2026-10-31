import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Polityka prywatności" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Polityka prywatności"
      sections={[
        { title: "Administrator danych i kontakt" },
        { title: "Zakres przetwarzanych danych" },
        { title: "Cele i podstawy prawne przetwarzania" },
        { title: "Odbiorcy danych (podmioty przetwarzające)" },
        {
          title: "Przekazywanie danych poza EOG",
          body: "Dane przechowujemy w regionie UE. [DO UZUPEŁNIENIA PRZEZ PRAWNIKA: lista dostawców i podstawy przekazania, np. Stripe, Resend, Anthropic, Vercel]",
        },
        { title: "Okres przechowywania danych" },
        { title: "Prawa osoby, której dane dotyczą (w tym usunięcie konta i danych)" },
        {
          title: "Pliki cookie",
          body: "Domyślnie używamy wyłącznie niezbędnych plików cookie. Narzędzia analityczne uruchamiamy tylko po wyrażeniu zgody w banerze. [DO UZUPEŁNIENIA PRZEZ PRAWNIKA]",
        },
        { title: "Zmiany polityki prywatności" },
      ]}
    />
  );
}
