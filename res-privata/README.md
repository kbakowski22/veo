# Res Privata

Platforma klubu inwestorów nieruchomości. „Inwestuj jak fundusz. Nie jak przypadkowy kupujący.”

> Pełna instrukcja krok po kroku dla osoby bez doświadczenia technicznego (konta, klucze,
> wdrożenie na Vercel, Stripe produkcyjny, rola admina, import danych) powstanie w etapie 9.
> Poniżej stan na bieżący etap.

## Status etapów

| Etap | Zakres | Status |
| --- | --- | --- |
| 1 | Szkielet, design, landing z kalkulatorem, strony prawne (szkielety), responsywność, animacje | gotowe |
| 2 | Supabase: schemat, RLS, logowanie linkiem, leady i zgody, maile powitalne | – |
| 3 | Stripe: Checkout, webhooki, Customer Portal, kupon założycielski | – |
| 4 | Panel członka | – |
| 5 | Analiza z AI, `lib/calc.ts` | – |
| 6 | Panel admina | – |
| 7 | Portfele Private | – |
| 8 | E2E, bezpieczeństwo, dostępność, wydajność | – |
| 9 | Dane demo, pełne README | – |

## Uruchomienie lokalne

Wymagany Node.js 20 lub nowszy.

```bash
cd res-privata
npm install
cp .env.example .env.local
npm run dev
```

Strona będzie dostępna pod adresem http://localhost:3000.

## Polecenia

| Polecenie | Co robi |
| --- | --- |
| `npm run dev` | serwer deweloperski |
| `npm run build` / `npm start` | wersja produkcyjna |
| `npm run lint` | ESLint |
| `npm run typecheck` | sprawdzenie typów TypeScript |
| `npm test` | testy jednostkowe (Vitest) |
| `npm run test:e2e` | testy przeglądarkowe (Playwright; najpierw `npm run build`) |
| `npm run check` | lint + typy + testy jednostkowe |

## Struktura

```
res-privata/
├─ src/app/(public)/      landing, /analiza, /logowanie, /regulamin, /polityka-prywatnosci
│  └─ actions.ts          akcje serwerowe formularzy (walidacja zod, honeypot)
├─ src/components/
│  ├─ brand/              logo
│  ├─ landing/            sekcje strony głównej, kalkulator
│  ├─ layout/             nagłówek, menu mobilne, stopka, baner cookies
│  ├─ forms/              pola formularzy
│  └─ ui/                 drobne elementy wspólne
├─ src/lib/
│  ├─ content/            treści: pakiety, zgody, teksty strony
│  ├─ validation/         schematy zod (wspólne dla klienta i serwera)
│  ├─ calc.ts             obliczenia (etap 5: pełny zestaw)
│  └─ format.ts           formatowanie kwot pl-PL
└─ tests/unit, tests/e2e
```

Wdrożenie na Vercel: aplikacja leży w podkatalogu `res-privata/` repozytorium, więc w ustawieniach
projektu Vercel trzeba ustawić **Root Directory = `res-privata`**.

## Lista [DO UZUPEŁNIENIA]

- Regulamin – pełna treść (`src/app/(public)/regulamin/page.tsx`) – **prawnik**
- Polityka prywatności – pełna treść, lista podmiotów przetwarzających (`src/app/(public)/polityka-prywatnosci/page.tsx`) – **prawnik**
- Dane administratora danych / firmy: pełna nazwa, adres, NIP (`src/lib/content/consents.ts`)
- Ostateczna prowizja Private od ceny zakupu – roboczo 1,5–2% (`src/lib/content/plans.ts`, `BUSINESS_TERMS`)
- Ostateczna stawka zarządzania najmem – roboczo 10–12% czynszu (jw.)
- Docelowa domena (`NEXT_PUBLIC_SITE_URL`)
- Grafika Open Graph 1200×630 (`src/app/opengraph-image.png`)
- Wybór narzędzia analitycznego ładowanego po zgodzie (`src/lib/cookie-consent.ts`)
- Formularze: zapis do bazy, rate limiting, maile (etap 2 i 5; `src/app/(public)/actions.ts`)
- Licznik miejsc założycielskich z bazy (etap 2–3; `src/lib/config.ts`)
