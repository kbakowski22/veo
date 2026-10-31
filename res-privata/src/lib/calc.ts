/**
 * Funkcje obliczeniowe Res Privata.
 *
 * Etap 1: szacunek z kalkulatora na stronie głównej.
 * Etap 5: pełny zestaw (PCC, podatek ryczałtowy, koszty roczne, zwrot netto,
 * cena maksymalna dla progu, scenariusze) – patrz specyfikacja w README.
 */

export type LandingInput = {
  /** Cena zakupu w zł */
  cena: number;
  /** Remont i wyposażenie w zł */
  remont: number;
  /** Miesięczny czynsz najmu w zł */
  czynsz: number;
};

export type LandingResult = {
  przychodRoczny: number;
  kosztCalkowity: number;
  /** Zwrot brutto jako ułamek, np. 0.061 = 6,1% */
  zwrotBrutto: number;
};

/** Zakresy suwaków kalkulatora na landingu. */
export const LANDING_RANGES = {
  cena: { min: 250_000, max: 1_500_000, step: 10_000, initial: 650_000 },
  remont: { min: 0, max: 250_000, step: 5_000, initial: 60_000 },
  czynsz: { min: 1_500, max: 8_000, step: 100, initial: 3_600 },
} as const;

/**
 * Poglądowy zwrot brutto: roczny przychód z najmu / (cena + remont).
 * Przed podatkiem, pustostanem i kosztami utrzymania.
 */
export function landingEstimate({ cena, remont, czynsz }: LandingInput): LandingResult {
  const przychodRoczny = czynsz * 12;
  const kosztCalkowity = cena + remont;
  const zwrotBrutto = kosztCalkowity > 0 ? przychodRoczny / kosztCalkowity : 0;
  return { przychodRoczny, kosztCalkowity, zwrotBrutto };
}
