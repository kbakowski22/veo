-- ═════════════════════════════════════════════════════════════
-- Testy RLS i uprawnień. Uruchamiane przez scripts/test-db.sh na czystej bazie
-- (atrapa Supabase + wszystkie migracje). Każda asercja przerywa skrypt przy błędzie.
-- ═════════════════════════════════════════════════════════════
\set ON_ERROR_STOP 1
\set QUIET 1

-- Asercje
create or replace function pg_temp.eq(actual bigint, expected bigint, label text) returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'NIEZALICZONE: % (oczekiwano %, jest %)', label, expected, actual;
  end if;
  raise notice 'ok: %', label;
end $$;
create or replace function pg_temp.denied(sql text, label text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when insufficient_privilege or check_violation then
    raise notice 'ok: % (odmowa)', label;
    return;
  when others then
    if sqlerrm like '%row-level security%' or sqlerrm like 'Brak uprawnień%' or sqlerrm like 'Wymagane logowanie%' or sqlerrm like 'Wydarzenie niedostępne%' then
      raise notice 'ok: % (odmowa)', label;
      return;
    end if;
    raise;
  end;
  raise exception 'NIEZALICZONE: % – operacja powinna zostać odrzucona', label;
end $$;
grant execute on all functions in schema pg_temp to anon, authenticated, service_role;

-- ───────────── Dane testowe (jako superuser) ─────────────
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000c', 'circle@test.pl',  '{"full_name":"Cyryl Circle"}'),
  ('00000000-0000-0000-0000-00000000000b', 'member@test.pl',  '{"full_name":"Maria Member"}'),
  ('00000000-0000-0000-0000-00000000000e', 'member2@test.pl', '{}'),
  ('00000000-0000-0000-0000-00000000000f', 'private@test.pl', '{}'),
  ('00000000-0000-0000-0000-0000000000f2', 'private2@test.pl','{}'),
  ('00000000-0000-0000-0000-00000000000a', 'admin@test.pl',   '{}');

select pg_temp.eq((select count(*) from public.profiles), 6, 'trigger tworzy profil dla każdego użytkownika');
select pg_temp.eq((select count(*) from public.profiles where full_name = 'Cyryl Circle' and role = 'circle'), 1, 'profil dostaje imię z metadanych i rolę circle');

update public.profiles set role = 'member' where id in ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-00000000000e');
update public.profiles set role = 'private' where id in ('00000000-0000-0000-0000-00000000000f', '00000000-0000-0000-0000-0000000000f2');
update public.profiles set role = 'admin', founding_member = true where id = '00000000-0000-0000-0000-00000000000a';

insert into public.opportunities (id, title, city, price, status, memo_md) values
  ('10000000-0000-0000-0000-000000000001', 'Mokotów 2 pok.', 'Warszawa', 690000, 'opublikowana', '# memo'),
  ('10000000-0000-0000-0000-000000000002', 'Szkic', 'Kraków', 500000, 'szkic', null);
insert into public.opportunity_photos (opportunity_id, storage_path) values
  ('10000000-0000-0000-0000-000000000001', 'a.jpg'), ('10000000-0000-0000-0000-000000000002', 'b.jpg');
insert into public.analysis_requests (id, user_id, email, description, status, draft_md, admin_notes_md) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'member@test.pl', 'opis', 'draft_ready', 'SZKIC', 'NOTATKA');
insert into public.reports (city, month, title, status) values
  ('Warszawa', '2026-10-01', 'Październik', 'opublikowany'), ('Warszawa', '2026-11-01', 'Listopad', 'szkic');
insert into public.market_snapshots (city, month, median_price_m2, source) values ('Warszawa', '2026-10-01', 17500, 'test');
insert into public.events (id, title, kind, starts_at, capacity, min_role, status) values
  ('30000000-0000-0000-0000-000000000001', 'Kolacja', 'kolacja', now() + interval '10 days', 1, 'member', 'opublikowane'),
  ('30000000-0000-0000-0000-000000000002', 'Webinar', 'webinar', now() + interval '5 days', null, 'circle', 'opublikowane');
insert into public.partners (name, category) values ('Kancelaria X', 'kancelaria');
insert into public.leads (email, plan_interest) values ('lead@test.pl', 'member');
insert into public.portfolio_properties (id, owner_id, title, city) values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000f', 'Moje 1', 'Gdańsk'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000f2', 'Cudze', 'Gdynia');
insert into public.portfolio_updates (property_id, kind, title) values
  ('40000000-0000-0000-0000-000000000001', 'remont', 'Tydzień 1'), ('40000000-0000-0000-0000-000000000002', 'remont', 'Cudzy');
insert into storage.objects (bucket_id, name) values
  ('portfolio', '00000000-0000-0000-0000-00000000000f/40000000-0000-0000-0000-000000000001/zdjecie.jpg'),
  ('portfolio', '00000000-0000-0000-0000-0000000000f2/40000000-0000-0000-0000-000000000002/zdjecie.jpg'),
  ('reports', 'warszawa-2026-10.pdf');

-- ───────────── anon ─────────────
set role anon;
select pg_temp.denied('select * from public.profiles', 'anon nie czyta profili');
select pg_temp.denied('select * from public.leads', 'anon nie czyta leadów');
select pg_temp.denied('insert into public.leads (email) values (''x@y.pl'')', 'anon nie zapisuje leadów bezpośrednio');
select pg_temp.eq((select count(*) from public.settings), 2, 'anon widzi tylko publiczne ustawienia');
select pg_temp.eq((select seats_left from public.founding_seats_left()), 9, 'licznik miejsc założycielskich (10 - 1)');
select pg_temp.eq((select count(*) from public.get_analysis_memo('00000000-0000-0000-0000-000000000000')), 0, 'memo po nieistniejącym tokenie');
select pg_temp.denied('select public.rate_limit_hit(''k'', 1, 60)', 'anon nie wywołuje rate_limit_hit');
reset role;

-- ───────────── circle ─────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', false);
select pg_temp.eq((select count(*) from public.profiles), 1, 'circle widzi tylko swój profil');
select pg_temp.eq((select count(*) from public.opportunities), 0, 'circle nie widzi pełnych okazji');
select pg_temp.eq((select count(*) from public.opportunity_photos), 0, 'circle nie widzi zdjęć okazji');
select pg_temp.eq((select count(*) from public.get_opportunity_teasers()), 1, 'circle widzi zajawki opublikowanych okazji');
select pg_temp.eq((select count(*) from public.reports), 1, 'circle widzi tylko opublikowane raporty');
select pg_temp.eq((select count(*) from public.market_snapshots), 1, 'circle widzi dane rynkowe');
select pg_temp.eq((select count(*) from public.partners), 0, 'circle nie widzi partnerów');
select pg_temp.eq((select count(*) from public.events), 1, 'circle widzi tylko wydarzenia dla Circle');
select pg_temp.denied('update public.profiles set role = ''admin'' where id = auth.uid()', 'circle nie nadaje sobie roli');
select pg_temp.denied('update public.profiles set founding_member = true where id = auth.uid()', 'circle nie zostaje założycielem');
update public.profiles set full_name = 'Cyryl Nowy', marketing_opt_in = true where id = auth.uid();
select pg_temp.eq((select count(*) from public.profiles where full_name = 'Cyryl Nowy'), 1, 'circle zmienia swoje imię');
select pg_temp.denied('select public.rsvp_event(''30000000-0000-0000-0000-000000000001'', true)', 'circle nie zapisuje się na kolację Member');
select pg_temp.eq((select count(*) from public.rsvp_event('30000000-0000-0000-0000-000000000002', true)), 1, 'circle zapisuje się na webinar');
select pg_temp.denied('insert into public.consents (user_id, email, type, version, text) values (''00000000-0000-0000-0000-00000000000b'', ''a@b.pl'', ''t'', ''1'', ''x'')', 'nie można dopisać zgody za kogoś');
select pg_temp.eq((select count(*) from storage.objects where bucket_id = 'reports'), 1, 'circle pobiera raporty PDF');
select pg_temp.eq((select count(*) from storage.objects where bucket_id = 'portfolio'), 0, 'circle nie widzi plików portfeli');
reset role;

-- ───────────── member ─────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.eq((select count(*) from public.opportunities), 1, 'member widzi opublikowane okazje (bez szkiców)');
select pg_temp.eq((select count(*) from public.opportunity_photos), 1, 'member widzi zdjęcia tylko opublikowanych okazji');
select pg_temp.eq((select count(*) from public.partners), 1, 'member widzi partnerów');
select pg_temp.eq((select count(*) from public.events), 2, 'member widzi kolację i webinar');
select pg_temp.eq((select count(*) from public.leads), 0, 'member nie widzi leadów');
select pg_temp.eq((select count(*) from public.analysis_requests), 0, 'member nie czyta tabeli analiz bezpośrednio');
select pg_temp.eq((select count(*) from public.get_my_analyses()), 1, 'member widzi swoją analizę przez funkcję');
select pg_temp.eq((select count(*) from public.get_my_analyses() where final_md is null and public_token is null), 1, 'niezatwierdzona analiza bez memo i tokenu');
select pg_temp.eq((select count(*) from public.portfolio_properties), 0, 'member nie widzi portfeli');
insert into public.opportunity_interests (opportunity_id, user_id) values ('10000000-0000-0000-0000-000000000001', auth.uid());
select pg_temp.eq((select count(*) from public.opportunity_interests), 1, 'member zgłasza zainteresowanie');
select pg_temp.denied('insert into public.opportunity_interests (opportunity_id, user_id) values (''10000000-0000-0000-0000-000000000002'', auth.uid())', 'nie można zgłosić zainteresowania szkicem');
select pg_temp.denied('insert into public.opportunity_interests (opportunity_id, user_id) values (''10000000-0000-0000-0000-000000000001'', ''00000000-0000-0000-0000-00000000000e'')', 'nie można zgłosić zainteresowania za kogoś');
select pg_temp.eq((select count(*) from public.rsvp_event('30000000-0000-0000-0000-000000000001', true) r where r = 'zapisany'), 1, 'member zapisuje się na kolację');
update public.opportunities set price = 1;
reset role;
select pg_temp.eq((select count(*) from public.opportunities where price = 1), 0, 'member nie może edytować okazji (0 zmienionych wierszy)');

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000e', false);
select pg_temp.eq((select count(*) from public.rsvp_event('30000000-0000-0000-0000-000000000001', true) r where r = 'brak_miejsc'), 1, 'limit miejsc na kolacji działa');
select pg_temp.eq((select count(*) from public.opportunity_interests), 0, 'member nie widzi cudzych zgłoszeń zainteresowania');
reset role;

-- ───────────── private ─────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000f', false);
select pg_temp.eq((select count(*) from public.portfolio_properties), 1, 'private widzi tylko swoje mieszkania');
select pg_temp.eq((select count(*) from public.portfolio_updates), 1, 'private widzi tylko raporty ze swoich mieszkań');
select pg_temp.eq((select count(*) from storage.objects where bucket_id = 'portfolio'), 1, 'private pobiera tylko swoje pliki');
select pg_temp.eq((select count(*) from public.opportunities), 1, 'private widzi okazje (wszystko z Member)');
reset role;

-- Private zdegradowany do Member traci dostęp do portfela.
update public.profiles set role = 'member' where id = '00000000-0000-0000-0000-00000000000f';
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000f', false);
select pg_temp.eq((select count(*) from public.portfolio_properties), 0, 'po zmianie na Member portfel jest niewidoczny');
reset role;

-- ───────────── admin ─────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
select pg_temp.eq((select count(*) from public.profiles), 6, 'admin widzi wszystkie profile');
select pg_temp.eq((select count(*) from public.leads), 1, 'admin widzi leady');
select pg_temp.eq((select count(*) from public.opportunities), 2, 'admin widzi szkice okazji');
select pg_temp.eq((select count(*) from public.analysis_requests where draft_md = 'SZKIC'), 1, 'admin widzi szkic analizy');
select pg_temp.eq((select count(*) from public.settings), 4, 'admin widzi wszystkie ustawienia');
update public.profiles set role = 'private' where id = '00000000-0000-0000-0000-00000000000f';
select pg_temp.eq((select count(*) from public.profiles where id = '00000000-0000-0000-0000-00000000000f' and role = 'private'), 1, 'admin zmienia rolę');
insert into public.audit_log (actor_id, action, entity) values (auth.uid(), 'role.update', 'profiles');
select pg_temp.denied('insert into public.audit_log (actor_id, action, entity) values (''00000000-0000-0000-0000-00000000000b'', ''x'', ''y'')', 'admin nie podszywa się pod innego autora w audit_log');
update public.audit_log set action = 'zmienione';
delete from public.audit_log;
select pg_temp.eq((select count(*) from public.audit_log where action = 'role.update'), 1, 'audit_log jest niezmienialny (bez edycji i usuwania)');
select pg_temp.eq((select count(*) from storage.objects where bucket_id = 'portfolio'), 2, 'admin widzi pliki wszystkich portfeli');
reset role;

-- ───────────── service_role: limity ─────────────
set role service_role;
select pg_temp.eq((select count(*) from (select public.rate_limit_hit('test:ip', 2, 3600) union all select public.rate_limit_hit('test:ip', 2, 3600)) t), 2, 'rate limit: 2 wywołania');
select pg_temp.eq((select case when public.rate_limit_hit('test:ip', 2, 3600) then 1 else 0 end), 0, 'rate limit: trzecie wywołanie odrzucone');
reset role;

\echo 'Wszystkie testy RLS zaliczone.'
