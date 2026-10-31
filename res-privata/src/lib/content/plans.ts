/**
 * Pakiety członkostwa – jedyne źródło treści o pakietach.
 * Ceny do wyświetlania trafią w etapie 6 do tabeli `settings` (panel admina);
 * do tego czasu obowiązują wartości poniżej.
 */
export type PlanId = "circle" | "member" | "private";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  priceNote?: string;
  tagline: string;
  badge?: string;
  features: string[];
  cta: string;
};

/** Wartości wymagające decyzji biznesowej – patrz lista [DO UZUPEŁNIENIA] w README. */
export const BUSINESS_TERMS = {
  /** [DO UZUPEŁNIENIA] Ostateczna prowizja Private od ceny zakupu (zakres roboczy 1,5–2%). */
  privateSuccessFee: "1,5–2%",
  /** [DO UZUPEŁNIENIA] Ostateczna stawka zarządzania najmem (zakres roboczy 10–12% czynszu). */
  rentalManagementFee: "10–12%",
  memberMonthly: 349,
  memberYearly: 3490,
  privateMonthly: 990,
  foundingDiscountPercent: 40,
  foundingSeatsTotal: 10,
} as const;

export const PLANS: Plan[] = [
  {
    id: "circle",
    name: "Circle",
    price: "0 zł",
    priceNote: "rejestracja e-mailem",
    tagline: "Dla tych, którzy dopiero budują portfel i chcą rozumieć rynek.",
    features: [
      "Raport rynku największych miast do 5. dnia każdego miesiąca: Warszawa, Kraków, Wrocław, Poznań, Trójmiasto, Łódź (ceny za m², stawki najmu, zwrot)",
      "Kalkulator opłacalności bez limitu",
      "1 bezpłatna analiza mieszkania w 24 godziny",
      "Webinar co kwartał",
      "Podgląd okazji dostępnych dla członków (zamazane szczegóły)",
    ],
    cta: "Dołącz za darmo",
  },
  {
    id: "member",
    name: "Member",
    price: "349 zł / mies.",
    priceNote: "lub 3 490 zł rocznie",
    tagline: "Dla inwestorów, którzy chcą regularnie dostawać przeanalizowane okazje.",
    badge: "Najczęściej wybierany",
    features: [
      "Minimum 2 okazje miesięcznie, każda z pełnym memo",
      "Pierwszeństwo przed rynkiem",
      "Bez limitu analiz mieszkań, odpowiedź w 24 h",
      "Zamknięta grupa członków, odpowiedź w jeden dzień roboczy",
      "Kolacja inwestycyjna co kwartał",
      "Sieć partnerów ze zniżkami (kancelaria, notariusz, doradca podatkowy i kredytowy, ekipy remontowe)",
      "Gwarancja 90 dni: brak wartościowej okazji = zwrot pieniędzy",
    ],
    cta: "Wybieram Member",
  },
  {
    id: "private",
    name: "Private",
    price: "990 zł / mies.",
    priceNote: `+ ${BUSINESS_TERMS.privateSuccessFee} ceny przy zakupie`,
    tagline: "Liczba miejsc ograniczona, wejście po rozmowie.",
    features: [
      "Wszystko z Member",
      "Osobisty opiekun, odpowiedź tego samego dnia",
      "Indywidualna strategia, okazje szyte na miarę",
      "Pełna obsługa zakupu na miejscu z siecią lokalnych partnerów",
      "Koordynacja remontu z raportem ze zdjęciami co tydzień",
      "Najemca i umowa, roczny przegląd portfela",
      `Opcjonalnie zarządzanie najmem ${BUSINESS_TERMS.rentalManagementFee} czynszu`,
    ],
    cta: "Umów rozmowę",
  },
];

export const PLAN_IDS = PLANS.map((p) => p.id) as [PlanId, ...PlanId[]];

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Nieznany pakiet: ${id}`);
  return plan;
}
