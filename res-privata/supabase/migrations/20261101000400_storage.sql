-- ═════════════════════════════════════════════════════════════
-- Res Privata · 004 · Storage: raporty PDF, zdjęcia okazji, portfele
-- Wszystkie kosze prywatne; pliki wydajemy przez podpisane linki lub RLS.
-- ═════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('reports', 'reports', false),
  ('opportunity-photos', 'opportunity-photos', false),
  ('portfolio', 'portfolio', false)
on conflict (id) do nothing;

-- Raporty: każdy zalogowany członek (Circle+).
create policy "storage reports: członkowie – odczyt" on storage.objects
  for select to authenticated
  using (bucket_id = 'reports' and public.has_role_at_least('circle'));

-- Zdjęcia okazji: Member+.
create policy "storage opportunity-photos: Member+ – odczyt" on storage.objects
  for select to authenticated
  using (bucket_id = 'opportunity-photos' and public.has_role_at_least('member'));

-- Portfel: ścieżka {owner_id}/{property_id}/plik – tylko właściciel (Private).
create policy "storage portfolio: właściciel – odczyt" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'portfolio'
    and public.has_role_at_least('private')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Admin: pełny dostęp do trzech koszy.
create policy "storage: admin – wszystko" on storage.objects
  for all to authenticated
  using (bucket_id in ('reports', 'opportunity-photos', 'portfolio') and public.is_admin())
  with check (bucket_id in ('reports', 'opportunity-photos', 'portfolio') and public.is_admin());
