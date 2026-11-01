-- ═════════════════════════════════════════════════════════════
-- Res Privata · 005 · Domyślne ustawienia (edytowalne w panelu admina)
-- ═════════════════════════════════════════════════════════════

insert into public.settings (key, value, is_public, description) values
  ('return_threshold', '0.06', false, 'Próg zwrotu brutto dla ceny maksymalnej (6%)'),
  ('tax_rates', '{"lumpSumLow": 0.085, "lumpSumHigh": 0.125, "threshold": 100000}', false,
     'Ryczałt od najmu prywatnego – ZWERYFIKOWAĆ AKTUALNE PRZEPISY'),
  ('founding_seats_total', '10', true, 'Liczba miejsc dla członków założycieli'),
  ('display_prices', '{"memberMonthly": 349, "memberYearly": 3490, "privateMonthly": 990}', true,
     'Ceny pakietów wyświetlane na stronie')
on conflict (key) do nothing;
