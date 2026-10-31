export const SITE = {
  name: "Res Privata",
  tagline: "Inwestuj jak fundusz. Nie jak przypadkowy kupujący.",
  description:
    "Klub inwestorów nieruchomości. Analiza, okazje spoza portali, siła negocjacyjna grupy i pełna obsługa – po stronie inwestora.",
  /** [DO UZUPEŁNIENIA] Docelowa domena. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  year: 2026,
  disclaimer:
    "Informacje i kalkulacje na stronie mają charakter poglądowy i nie stanowią rekomendacji inwestycyjnej ani oferty w rozumieniu przepisów prawa.",
} as const;

export const NAV_LINKS = [
  { href: "/#kim-jestesmy", label: "Kim jesteśmy" },
  { href: "/#kalkulator", label: "Kalkulator" },
  { href: "/#czlonkostwo", label: "Członkostwo" },
] as const;

export const MARQUEE_ITEMS = [
  "Raport rynku co miesiąc",
  "Okazje spoza portali",
  "Memo do każdej inwestycji",
  "Siła negocjacyjna grupy",
  "Pełna obsługa klucz w rękę",
  "Jesteśmy po Twojej stronie",
] as const;

export const COMPARISON = [
  {
    label: "Pracuje dla",
    agent: "sprzedającego",
    us: "inwestora",
  },
  {
    label: "Zależy mu na",
    agent: "jak najwyższej cenie",
    us: "jak najlepszym zakupie dla Ciebie",
  },
  {
    label: "Pokazuje",
    agent: "to, co ma w ofercie",
    us: "tylko przeanalizowane okazje, także spoza portali",
  },
  {
    label: "Po transakcji",
    agent: "znika",
    us: "zostaje: remont, najemca, roczny przegląd",
  },
] as const;

export const AUDIENCE = [
  {
    title: "Sportowcy zawodowi",
    text: "Kariera trwa krótko, a obozy i mecze nie zostawiają czasu na oglądanie mieszkań. Budujemy portfel, który pracuje także po zakończeniu kariery.",
  },
  {
    title: "Przedsiębiorcy",
    text: "Nadwyżki z firmy warto ulokować poza nią. Dostajesz proces znany z funduszy: selekcję, analizę, negocjacje i nadzór, bez angażowania własnego czasu.",
  },
  {
    title: "Specjaliści i menedżerowie",
    text: "Dobrze zarabiasz, ale kalendarz jest pełny. Decydujesz na podstawie memo, a całą resztą zajmujemy się my i nasi partnerzy.",
  },
  {
    title: "Polacy za granicą",
    text: "Inwestujesz w Polsce bez przylotów na każde oglądanie. Zakup, remont i najem prowadzimy na miejscu, a Ty dostajesz cotygodniowe raporty.",
  },
] as const;

export const STEPS = [
  {
    title: "Rozmowa",
    text: "Poznajemy Twój budżet, cel i horyzont. Ustalamy, czego szukamy i czego na pewno nie.",
  },
  {
    title: "Okazje i memo",
    text: "Pokazujemy tylko przeanalizowane mieszkania, także spoza portali. Każde z memo: liczby, ryzyka i werdykt.",
  },
  {
    title: "Zakup i remont",
    text: "Negocjujemy, sprawdzamy stan prawny z kancelarią i koordynujemy remont z cotygodniowym raportem.",
  },
  {
    title: "Najem i przegląd",
    text: "Znajdujemy najemcę, przygotowujemy umowę i raz w roku przeglądamy z Tobą cały portfel.",
  },
] as const;
