/**
 * Zgoda na pliki cookie. Domyślnie tylko niezbędne.
 * Narzędzie analityczne ładujemy wyłącznie, gdy `hasAnalyticsConsent()` zwraca true.
 * [DO UZUPEŁNIENIA] wybór narzędzia analitycznego (np. Plausible / Vercel Analytics).
 */
export const CONSENT_COOKIE = "rp_cookie_consent";
export type CookieChoice = "necessary" | "analytics";

export function readCookieChoice(): CookieChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return value === "necessary" || value === "analytics" ? value : null;
}

export function saveCookieChoice(choice: CookieChoice) {
  const maxAge = 60 * 60 * 24 * 180; // 6 miesięcy
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`;
  window.dispatchEvent(new CustomEvent("rp:cookie-consent", { detail: choice }));
}

export function hasAnalyticsConsent(): boolean {
  return readCookieChoice() === "analytics";
}
