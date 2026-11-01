-- ═════════════════════════════════════════════════════════════
-- Res Privata · 001 · Typy, funkcje pomocnicze, profile, zgody, leady
-- ═════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ───────────── Typy ─────────────
create type public.app_role as enum ('circle', 'member', 'private', 'admin');
create type public.plan_interest as enum ('circle', 'member', 'private');
create type public.lead_status as enum ('nowy', 'kontakt', 'rozmowa', 'czlonek', 'odrzucony');
create type public.lead_source as enum ('dolacz', 'analiza', 'przeswietl', 'inne');

-- ───────────── Wspólny trigger updated_at ─────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────── Profile ─────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 32),
  role public.app_role not null default 'circle',
  founding_member boolean not null default false,
  stripe_customer_id text unique,
  marketing_opt_in boolean not null default false,
  welcome_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Profil użytkownika (1:1 z auth.users). Rolę zmienia tylko admin lub webhook Stripe.';

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Ranking ról: circle < member < private < admin
create or replace function public.role_rank(r public.app_role)
returns int
language sql
immutable
set search_path = ''
as $$
  select case r
    when 'circle' then 1
    when 'member' then 2
    when 'private' then 3
    when 'admin' then 4
  end;
$$;

-- Rola zalogowanego użytkownika (null dla anonimowych).
-- security definer: czyta profiles z pominięciem RLS, więc polityki mogą z niej korzystać bez rekurencji.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

create or replace function public.has_role_at_least(min_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.role_rank(public.current_app_role()) >= public.role_rank(min_role), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_app_role() = 'admin';
$$;

-- Nowy użytkownik w auth.users → profil z rolą circle.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(left(new.raw_user_meta_data ->> 'full_name', 120), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────── Ustawienia (panel admina) ─────────────
create table public.settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
comment on table public.settings is 'Konfiguracja edytowalna w panelu admina. is_public = widoczne bez logowania.';

create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ───────────── Dziennik działań admina ─────────────
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

-- ───────────── Zgody (RODO) ─────────────
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  email text not null check (email = lower(email)),
  type text not null,
  version text not null,
  text text not null,
  granted boolean not null default true,
  source text,
  ip inet,
  user_agent text check (char_length(user_agent) <= 512),
  created_at timestamptz not null default now()
);
comment on table public.consents is 'Każda zgoda z pełną treścią, wersją, datą i IP. Wycofanie = nowy wiersz z granted = false.';
create index consents_email_idx on public.consents (email);
create index consents_user_idx on public.consents (user_id);

-- ───────────── Leady (CRM) ─────────────
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text check (char_length(full_name) <= 120),
  email text not null check (email = lower(email)),
  phone text,
  plan_interest public.plan_interest,
  source public.lead_source not null default 'dolacz',
  status public.lead_status not null default 'nowy',
  notes text,
  next_contact_at timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_status_idx on public.leads (status, created_at desc);
create index leads_email_idx on public.leads (email);
create index leads_next_contact_idx on public.leads (next_contact_at) where status in ('nowy', 'kontakt', 'rozmowa');

create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

-- ───────────── Limity zapytań (formularze) ─────────────
create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 1,
  primary key (key, window_start)
);

create index rate_limits_window_idx on public.rate_limits (window_start);

-- Zwraca true, jeśli zapytanie mieści się w limicie (i je zlicza). Okno stałe.
create or replace function public.rate_limit_hit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits int;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning hits into v_hits;

  -- Sprzątanie starych okien (tanie, przy okazji).
  delete from public.rate_limits where window_start < now() - interval '2 days';

  return v_hits <= p_limit;
end;
$$;
