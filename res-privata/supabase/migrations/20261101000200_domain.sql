-- ═════════════════════════════════════════════════════════════
-- Res Privata · 002 · Subskrypcje, okazje, analizy, rynek, raporty,
-- wydarzenia, partnerzy, portfele Private, Prześwietl ogłoszenie
-- ═════════════════════════════════════════════════════════════

-- ───────────── Subskrypcje (Stripe) ─────────────
create type public.subscription_plan as enum ('member_monthly', 'member_yearly', 'private_monthly');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  plan public.subscription_plan not null,
  status text not null, -- status ze Stripe: active, trialing, past_due, canceled, unpaid, incomplete...
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  founding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Idempotencja webhooków: każde zdarzenie przetwarzamy raz.
create table public.stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

-- ───────────── Okazje ─────────────
create type public.market_type as enum ('pierwotny', 'wtorny');
create type public.investment_goal as enum ('najem', 'odsprzedaz', 'nie_wiem');
create type public.verdict as enum ('rozwaz', 'negocjuj', 'odrzuc');
create type public.opportunity_status as enum ('szkic', 'opublikowana', 'zarezerwowana', 'zamknieta');

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 160),
  city text not null,
  district text,
  property_type text not null default 'mieszkanie',
  price numeric(12, 2) check (price >= 0),
  area_m2 numeric(8, 2) check (area_m2 > 0),
  rooms int check (rooms between 1 and 20),
  floor text,
  market public.market_type,
  goal public.investment_goal not null default 'najem',
  summary text,
  verdict public.verdict,
  verdict_note text,
  verdict_max_price numeric(12, 2),
  calc_json jsonb not null default '{}'::jsonb,
  memo_md text,
  status public.opportunity_status not null default 'szkic',
  notify_members boolean not null default true,
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index opportunities_status_idx on public.opportunities (status, published_at desc);
create trigger opportunities_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();

create table public.opportunity_photos (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  storage_path text not null,
  caption text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index opportunity_photos_opp_idx on public.opportunity_photos (opportunity_id, position);

create table public.opportunity_interests (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text check (char_length(message) <= 2000),
  created_at timestamptz not null default now(),
  unique (opportunity_id, user_id)
);

-- ───────────── Analizy mieszkań ─────────────
create type public.analysis_status as enum (
  'received',            -- Przyjęta
  'fetching',            -- W analizie: pobieranie ogłoszenia
  'needs_manual_input',  -- W analizie: admin musi wkleić treść
  'drafting',            -- W analizie: AI pisze szkic
  'draft_ready',         -- W analizie: szkic czeka na przegląd
  'approved',            -- Gotowa (zatwierdzona i wysłana)
  'failed'
);

create table public.analysis_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null check (email = lower(email)),
  listing_url text check (char_length(listing_url) <= 2000),
  description text check (char_length(description) <= 5000),
  goal public.investment_goal not null default 'najem',
  listing_text text,           -- treść ogłoszenia (pobrana lub wklejona ręcznie)
  status public.analysis_status not null default 'received',
  calc_json jsonb,
  draft_md text,
  admin_notes_md text,         -- „Do sprawdzenia przed wysłaniem” – tylko admin
  final_md text,
  version int not null default 0,
  public_token uuid not null default gen_random_uuid() unique, -- link do memo bez danych osobowych w URL
  attempts int not null default 0,
  last_error text,
  locked_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index analysis_requests_queue_idx on public.analysis_requests (status, created_at);
create index analysis_requests_user_idx on public.analysis_requests (user_id, created_at desc);
create trigger analysis_requests_updated_at before update on public.analysis_requests
  for each row execute function public.set_updated_at();

-- Zatwierdzone wersje memo (historia).
create table public.analysis_versions (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analysis_requests (id) on delete cascade,
  version int not null,
  final_md text not null,
  approved_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (analysis_id, version)
);

-- ───────────── Prześwietl ogłoszenie (szybki wynik w 60 s) ─────────────
create table public.listing_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text check (email = lower(email)),
  lead_id uuid references public.leads (id) on delete set null,
  listing_url text check (char_length(listing_url) <= 2000),
  input_text text,
  city text,
  district text,
  parsed_json jsonb,   -- dane odczytane z ogłoszenia (cena, metraż, piętro...)
  calc_json jsonb,     -- wyniki z lib/calc.ts
  signals_json jsonb,  -- sygnały do sprawdzenia
  public_token uuid not null default gen_random_uuid() unique,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index listing_checks_created_idx on public.listing_checks (created_at desc);

-- ───────────── Dane rynkowe ─────────────
create table public.market_snapshots (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  district text,                      -- null = całe miasto
  month date not null check (extract(day from month) = 1),
  avg_price_m2 numeric(10, 2),
  median_price_m2 numeric(10, 2),
  rent_m2 numeric(8, 2),
  listings_count int,
  source text not null,
  source_date date,
  created_at timestamptz not null default now()
);
create unique index market_snapshots_unique_idx
  on public.market_snapshots (city, coalesce(district, ''), month);

-- ───────────── Raporty miesięczne ─────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  month date not null check (extract(day from month) = 1),
  title text not null,
  summary text,
  body_md text,
  pdf_path text,
  status text not null default 'szkic' check (status in ('szkic', 'opublikowany')),
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city, month)
);
create trigger reports_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- ───────────── Wydarzenia ─────────────
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null check (kind in ('kolacja', 'webinar', 'inne')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  description text,
  capacity int check (capacity > 0),
  min_role public.app_role not null default 'member',
  status text not null default 'szkic' check (status in ('szkic', 'opublikowane', 'odwolane')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_starts_idx on public.events (starts_at);
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

create table public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'zapisany' check (status in ('zapisany', 'anulowany')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ───────────── Partnerzy ─────────────
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null, -- kancelaria, notariusz, doradca podatkowy, doradca kredytowy, ekipa remontowa...
  city text,
  description text,
  discount text,
  contact_url text,
  contact_email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger partners_updated_at before update on public.partners
  for each row execute function public.set_updated_at();

-- ───────────── Portfele Private ─────────────
create table public.portfolio_properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  city text not null,
  district text,
  address text,
  area_m2 numeric(8, 2),
  purchase_price numeric(12, 2),
  monthly_rent numeric(10, 2),
  status text not null default 'zakup'
    check (status in ('wyszukiwanie', 'zakup', 'remont', 'szukanie_najemcy', 'wynajete', 'sprzedane')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index portfolio_properties_owner_idx on public.portfolio_properties (owner_id);
create trigger portfolio_properties_updated_at before update on public.portfolio_properties
  for each row execute function public.set_updated_at();

create table public.portfolio_updates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.portfolio_properties (id) on delete cascade,
  kind text not null check (kind in ('remont', 'najem', 'dokument', 'przeglad', 'inne')),
  title text not null,
  body_md text,
  week_of date,
  photo_paths text[] not null default '{}',
  document_paths text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index portfolio_updates_property_idx on public.portfolio_updates (property_id, created_at desc);
