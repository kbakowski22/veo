/**
 * Formatowanie liczb i kwot w konwencji pl-PL.
 *
 * Uwaga: w pl-PL liczby czterocyfrowe domyślnie nie dostają separatora tysięcy
 * (3490 zamiast 3 490). Dla czytelności cen wymuszamy grupowanie zawsze.
 */
const NUMBER_OPTIONS = {
  maximumFractionDigits: 0,
  useGrouping: "always",
} as Intl.NumberFormatOptions;

/** 3490 -> "3 490" (z twardą spacją jako separatorem tysięcy). */
export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("pl-PL", {
    ...NUMBER_OPTIONS,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** 3490 -> "3 490 zł" */
export function formatPLN(value: number, fractionDigits = 0): string {
  return `${formatNumber(value, fractionDigits)} zł`;
}

/** 0.0612 -> "6,1%" */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  if (!Number.isFinite(ratio)) return "–";
  return ratio.toLocaleString("pl-PL", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
