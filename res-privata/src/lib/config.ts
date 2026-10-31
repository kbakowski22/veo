import { BUSINESS_TERMS } from "@/lib/content/plans";

/**
 * Liczba wolnych miejsc dla członków założycieli.
 * Etap 1: wartość tymczasowa. Etap 2–3: odczyt z bazy (`settings` + liczba
 * aktywnych subskrypcji z kuponem założycielskim).
 */
export async function getFoundingSeatsLeft(): Promise<{ left: number; total: number }> {
  const total = BUSINESS_TERMS.foundingSeatsTotal;
  return { left: total, total };
}
