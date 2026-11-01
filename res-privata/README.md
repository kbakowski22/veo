# Res Privata

Platforma klubu inwestorów nieruchomości. „Inwestuj jak fundusz. Nie jak przypadkowy kupujący.”

> Pełna instrukcja krok po kroku dla osoby bez doświadczenia technicznego (konta, klucze,
> wdrożenie na Vercel, Stripe produkcyjny, rola admina, import danych) powstanie w etapie 9.
> Poniżej stan na bieżący etap.

## Status etapów

| Etap | Zakres | Status |
| --- | --- | --- |
| 1 | Szkielet, design, landing z kalkulatorem, strony prawne (szkielety), responsywność, animacje | gotowe |
| 2 | Supabase: schemat, RLS, logowanie linkiem, leady i zgody, maile powitalne | gotowe |
| 3 | Stripe: Checkout, webhooki, Customer Portal, kupon założycielski | – |
| 4 | Panel członka | – |
| 5 | Analiza z AI, `lib/calc.ts`, **Prześwietl ogłoszenie** (natychmiastowy wynik: cena maksymalna przy progu zwrotu, porównanie z dzielnicą, sygnały do sprawdzenia; pełne memo po podaniu e-maila) | – |
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
| `npm run test:db` | migracje + testy RLS na tymczasowym lokalnym PostgreSQL (bez konta Supabase) |

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
├─ src/app/auth/          potwierdzenie linku logowania, wylogowanie
├─ src/app/panel, admin/  panel członka i administratora (szkielety)
├─ src/emails/            szablony maili (React Email)
├─ src/proxy.ts           odświeżanie sesji, ochrona /panel i /admin
├─ supabase/migrations/   schemat bazy + RLS
├─ supabase/templates/    szablon maila logowania
├─ src/lib/
│  ├─ auth/               sesja, role i uprawnienia, magic link
│  ├─ supabase/           klienci bazy (użytkownik / serwis)
│  ├─ security/           limity prób, metadane żądania
│  ├─ email/              wysyłka przez Resend
│  ├─ content/            treści: pakiety, zgody, teksty strony
│  ├─ validation/         schematy zod (wspólne dla klienta i serwera)
│  ├─ calc.ts             obliczenia (etap 5: pełny zestaw)
│  └─ format.ts           formatowanie kwot pl-PL
└─ tests/unit, tests/e2e
```

## Konfiguracja Supabase (baza, logowanie)

1. Załóż konto na [supabase.com](https://supabase.com) i utwórz projekt. **Region: Central EU (Frankfurt)** – dane w UE.
2. Wejdź w *Project Settings → API* i skopiuj do `.env.local` (lokalnie) oraz do *Vercel → Settings → Environment Variables*:
   - *Project URL* → `NEXT_PUBLIC_SUPABASE_URL`
   - klucz *anon / publishable* → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - klucz *service_role / secret* → `SUPABASE_SERVICE_ROLE_KEY` (tajny – tylko serwer)
3. Utwórz tabele: *SQL Editor → New query*, wklej i uruchom po kolei pliki z `supabase/migrations/` (w kolejności nazw).
   Osoby techniczne mogą zamiast tego użyć `npx supabase link` i `npx supabase db push`.
4. *Authentication → URL Configuration*: *Site URL* = adres strony (np. `https://twojadomena.pl`),
   w *Redirect URLs* dodaj `https://twojadomena.pl/auth/confirm` i `http://localhost:3000/auth/confirm`.
5. *Authentication → Email Templates → Magic Link* (i *Confirm signup*): wklej treść
   `supabase/templates/magic-link.html`, temat „Twój link do logowania · Res Privata”.
6. *Authentication → SMTP Settings*: włącz własny SMTP z Resend (host `smtp.resend.com`, port 465,
   użytkownik `resend`, hasło = klucz API Resend), żeby maile logowania wychodziły z Twojej domeny.

### Jak nadać sobie rolę admina

Zaloguj się raz na stronie (żeby powstało konto), potem w Supabase: *SQL Editor*:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'twoj@email.pl');
```

## Konfiguracja Resend (maile)

1. Konto na [resend.com](https://resend.com), *Domains → Add domain*, dodaj rekordy DNS u rejestratora domeny.
2. *API Keys → Create* → `RESEND_API_KEY`.
3. `EMAIL_FROM` np. `Res Privata <klub@twojadomena.pl>`, `ADMIN_NOTIFY_EMAIL` – adres, na który przychodzą nowe leady.

Bez klucza Resend maile są pomijane (aplikacja działa, w logach widać „pominięto”).

## Bezpieczeństwo danych (skrót)

- Row Level Security na każdej tabeli; testy w `supabase/tests/rls_test.sql` (57 asercji: Circle, Member, Private, admin, niezalogowany).
- Członek nie może sam zmienić swojej roli, statusu założyciela ani danych Stripe (blokada w bazie).
- Szkice memo i notatki admina są niewidoczne dla członków nawet przy własnej analizie.
- `audit_log` tylko do dopisywania – wpisów nie da się edytować ani usuwać.
- Formularze: walidacja na serwerze (zod), pole-pułapka na boty, limity prób na IP i e-mail.
- Zgody RODO zapisywane z pełną treścią, wersją, datą, IP i przeglądarką.

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
- E-mail kontaktowy wyświetlany przy błędzie formularza (`src/app/(public)/actions.ts`)
- Formularz analizy: zapis do bazy (etap 5; `src/app/(public)/actions.ts`)
- Okres przechowywania zgód i leadów po usunięciu konta – decyzja prawnika (`supabase/migrations/…_core.sql`)
- Prześwietl ogłoszenie: potwierdzenie z prawnikiem, że publiczny wynik bez werdyktu nie jest rekomendacją inwestycyjną
