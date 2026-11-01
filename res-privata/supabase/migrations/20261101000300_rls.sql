-- ═════════════════════════════════════════════════════════════
-- Res Privata · 003 · Row Level Security, uprawnienia, funkcje RPC
--
-- Zasady:
--  * RLS włączone na KAŻDEJ tabeli. Brak polityki = brak dostępu.
--  * anon (niezalogowany) nie ma dostępu do tabel poza publicznymi ustawieniami.
--  * Formularze publiczne zapisują przez klucz serwisowy (service_role) po walidacji na serwerze.
--  * Kolumny wrażliwe (szkice memo, notatki admina) nie są dostępne dla członków nawet
--    przy poprawnym wierszu – członkowie czytają je przez funkcje zwracające wybrane kolumny.
--  * Nowe tabele w kolejnych migracjach: pamiętaj o `enable row level security` i grantach.
-- ═════════════════════════════════════════════════════════════

-- ───────────── Uprawnienia bazowe ─────────────
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
-- Tabele wyłącznie serwerowe:
revoke all on public.rate_limits, public.stripe_events from authenticated;
-- Jedyna tabela czytelna bez logowania (filtrowana polityką is_public):
grant select on public.settings to anon;

-- Funkcje pomocnicze używane w politykach:
grant execute on function
  public.role_rank(public.app_role),
  public.current_app_role(),
  public.has_role_at_least(public.app_role),
  public.is_admin()
to anon, authenticated;

grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- ───────────── Włączenie RLS ─────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'settings', 'audit_log', 'consents', 'leads', 'rate_limits',
    'subscriptions', 'stripe_events', 'opportunities', 'opportunity_photos', 'opportunity_interests',
    'analysis_requests', 'analysis_versions', 'listing_checks', 'market_snapshots', 'reports',
    'events', 'event_rsvps', 'partners', 'portfolio_properties', 'portfolio_updates'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ───────────── profiles ─────────────
create policy "profiles: własny lub admin – odczyt" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "profiles: własny lub admin – edycja" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- Członek może zmienić tylko imię, telefon i zgodę marketingową. Rola, status założyciela
-- i identyfikator Stripe zmieniają się wyłącznie przez admina lub serwer (webhook).
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.founding_member is distinct from old.founding_member
     or new.stripe_customer_id is distinct from old.stripe_customer_id
     or new.welcome_sent_at is distinct from old.welcome_sent_at
     or new.id is distinct from old.id then
    raise exception 'Brak uprawnień do zmiany tego pola' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_protect_columns before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ───────────── settings ─────────────
create policy "settings: publiczne dla wszystkich, reszta dla admina" on public.settings
  for select to anon, authenticated using (is_public or public.is_admin());
create policy "settings: admin – zapis" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── audit_log (tylko dopisywanie) ─────────────
create policy "audit_log: admin – odczyt" on public.audit_log
  for select to authenticated using (public.is_admin());
create policy "audit_log: admin – dopisanie własnych wpisów" on public.audit_log
  for insert to authenticated with check (public.is_admin() and actor_id = (select auth.uid()));

-- ───────────── consents ─────────────
create policy "consents: własne lub admin – odczyt" on public.consents
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "consents: dopisanie własnej zgody/wycofania" on public.consents
  for insert to authenticated with check (user_id = (select auth.uid()));

-- ───────────── leads ─────────────
create policy "leads: admin" on public.leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── subscriptions ─────────────
create policy "subscriptions: własne lub admin – odczyt" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

-- ───────────── opportunities ─────────────
create policy "opportunities: Member+ widzi opublikowane, admin wszystko" on public.opportunities
  for select to authenticated
  using (public.is_admin() or (status <> 'szkic' and public.has_role_at_least('member')));
create policy "opportunities: admin – zapis" on public.opportunities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "opportunity_photos: jak okazja" on public.opportunity_photos
  for select to authenticated
  using (exists (select 1 from public.opportunities o where o.id = opportunity_id));
create policy "opportunity_photos: admin – zapis" on public.opportunity_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "opportunity_interests: własne lub admin – odczyt" on public.opportunity_interests
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "opportunity_interests: Member+ zgłasza zainteresowanie" on public.opportunity_interests
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.has_role_at_least('member')
    and exists (select 1 from public.opportunities o where o.id = opportunity_id and o.status = 'opublikowana')
  );
create policy "opportunity_interests: wycofanie własnego" on public.opportunity_interests
  for delete to authenticated using (user_id = (select auth.uid()));

-- Zajawki okazji dla Circle: bez liczb, memo i zdjęć.
create or replace function public.get_opportunity_teasers()
returns table (
  id uuid, title text, city text, district text, property_type text,
  goal public.investment_goal, status public.opportunity_status, published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.title, o.city, o.district, o.property_type, o.goal, o.status, o.published_at
  from public.opportunities o
  where o.status <> 'szkic' and public.has_role_at_least('circle')
  order by o.published_at desc nulls last;
$$;
grant execute on function public.get_opportunity_teasers() to authenticated;

-- ───────────── analysis_requests ─────────────
-- Tabela tylko dla admina; członek czyta swoje analizy przez funkcję (bez szkiców i notatek admina).
create policy "analysis_requests: admin" on public.analysis_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "analysis_versions: admin" on public.analysis_versions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.get_my_analyses()
returns table (
  id uuid, listing_url text, description text, goal public.investment_goal,
  status public.analysis_status, final_md text, public_token uuid,
  created_at timestamptz, approved_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, a.listing_url, a.description, a.goal, a.status,
         case when a.status = 'approved' then a.final_md end,
         case when a.status = 'approved' then a.public_token end,
         a.created_at, a.approved_at
  from public.analysis_requests a
  where a.user_id = auth.uid()
  order by a.created_at desc;
$$;
grant execute on function public.get_my_analyses() to authenticated;

-- Memo po tokenie z maila (działa także dla osób bez konta). Tylko zatwierdzone.
create or replace function public.get_analysis_memo(p_token uuid)
returns table (final_md text, goal public.investment_goal, approved_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.final_md, a.goal, a.approved_at
  from public.analysis_requests a
  where a.public_token = p_token and a.status = 'approved';
$$;
grant execute on function public.get_analysis_memo(uuid) to anon, authenticated;

-- ───────────── listing_checks ─────────────
create policy "listing_checks: admin – odczyt" on public.listing_checks
  for select to authenticated using (public.is_admin());

-- ───────────── market_snapshots, reports ─────────────
create policy "market_snapshots: członkowie – odczyt" on public.market_snapshots
  for select to authenticated using (public.has_role_at_least('circle'));
create policy "market_snapshots: admin – zapis" on public.market_snapshots
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "reports: członkowie widzą opublikowane" on public.reports
  for select to authenticated
  using (public.is_admin() or (status = 'opublikowany' and public.has_role_at_least('circle')));
create policy "reports: admin – zapis" on public.reports
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── events, event_rsvps ─────────────
create policy "events: widoczne wg poziomu członkostwa" on public.events
  for select to authenticated
  using (public.is_admin() or (status <> 'szkic' and public.has_role_at_least(min_role)));
create policy "events: admin – zapis" on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "event_rsvps: własne lub admin – odczyt" on public.event_rsvps
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "event_rsvps: admin – zapis" on public.event_rsvps
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Zapis na wydarzenie z kontrolą poziomu i limitu miejsc (blokada wiersza wydarzenia).
create or replace function public.rsvp_event(p_event_id uuid, p_attend boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_event public.events%rowtype;
  v_taken int;
begin
  if v_uid is null then
    raise exception 'Wymagane logowanie' using errcode = '42501';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found or v_event.status <> 'opublikowane' or not public.has_role_at_least(v_event.min_role) then
    raise exception 'Wydarzenie niedostępne' using errcode = '42501';
  end if;

  if not p_attend then
    update public.event_rsvps set status = 'anulowany' where event_id = p_event_id and user_id = v_uid;
    return 'anulowany';
  end if;

  if v_event.starts_at < now() then
    raise exception 'Zapisy zamknięte' using errcode = 'P0001';
  end if;

  if v_event.capacity is not null then
    select count(*) into v_taken from public.event_rsvps
      where event_id = p_event_id and status = 'zapisany' and user_id <> v_uid;
    if v_taken >= v_event.capacity then
      return 'brak_miejsc';
    end if;
  end if;

  insert into public.event_rsvps (event_id, user_id, status) values (p_event_id, v_uid, 'zapisany')
  on conflict (event_id, user_id) do update set status = 'zapisany';
  return 'zapisany';
end;
$$;
grant execute on function public.rsvp_event(uuid, boolean) to authenticated;

-- ───────────── partners ─────────────
create policy "partners: Member+ – odczyt aktywnych" on public.partners
  for select to authenticated using (public.is_admin() or (active and public.has_role_at_least('member')));
create policy "partners: admin – zapis" on public.partners
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── portfolio ─────────────
create policy "portfolio_properties: właściciel Private lub admin" on public.portfolio_properties
  for select to authenticated
  using (public.is_admin() or (owner_id = (select auth.uid()) and public.has_role_at_least('private')));
create policy "portfolio_properties: admin – zapis" on public.portfolio_properties
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "portfolio_updates: jak mieszkanie" on public.portfolio_updates
  for select to authenticated
  using (exists (select 1 from public.portfolio_properties p where p.id = property_id));
create policy "portfolio_updates: admin – zapis" on public.portfolio_updates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────────── Licznik miejsc założycielskich (publiczny) ─────────────
create or replace function public.founding_seats_left()
returns table (seats_left int, seats_total int)
language sql
stable
security definer
set search_path = ''
as $$
  with total as (
    select coalesce((select (value #>> '{}')::int from public.settings where key = 'founding_seats_total'), 10) as n
  )
  select greatest(total.n - (select count(*)::int from public.profiles where founding_member), 0), total.n
  from total;
$$;
grant execute on function public.founding_seats_left() to anon, authenticated;
