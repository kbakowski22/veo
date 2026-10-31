import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import { AnalysisForm } from "./AnalysisForm";

export const metadata: Metadata = {
  title: "Bezpłatna analiza mieszkania",
  description: "Wyślij link do ogłoszenia lub opis mieszkania. W 24 godziny dostaniesz memo z liczbami, ryzykami i werdyktem.",
};

const POINTS = [
  "Koszty całkowite zakupu i remontu",
  "Najem w trzech scenariuszach",
  "Porównanie z danymi rynkowymi dla dzielnicy",
  "Lista ryzyk i rzeczy do sprawdzenia",
  "Werdykt: rozważ, negocjuj albo odrzuć",
];

export default function AnalysisPage() {
  return (
    <div className="container-rp py-16 sm:py-24">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div>
          <PageIntro
            label="Bezpłatna analiza"
            title="Sprawdź mieszkanie,"
            soft="zanim złożysz ofertę."
            lead="Wyślij link do ogłoszenia albo opis. W ciągu 24 godzin dostaniesz memo inwestycyjne przygotowane i sprawdzone przez nasz zespół."
          />
          <ul className="mt-10 flex flex-col border-t border-line">
            {POINTS.map((p) => (
              <li key={p} className="border-b border-line py-4 text-[15px] text-ink-2">
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] leading-relaxed text-ink-3">
            Memo ma charakter informacyjny i nie stanowi rekomendacji inwestycyjnej. Stan prawny
            nieruchomości zawsze wymaga weryfikacji.
          </p>
        </div>
        <AnalysisForm />
      </div>
    </div>
  );
}
