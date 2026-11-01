/** Bezpieczny adres powrotu po logowaniu: tylko ścieżki wewnętrzne (bez open redirect). */
export function safeNextPath(next: string | null | undefined, fallback = "/panel"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\r\n]/.test(next)) return fallback;
  return next;
}
