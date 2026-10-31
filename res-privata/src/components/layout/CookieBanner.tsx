"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readCookieChoice, saveCookieChoice, type CookieChoice } from "@/lib/cookie-consent";

function subscribe(cb: () => void) {
  window.addEventListener("rp:cookie-consent", cb);
  return () => window.removeEventListener("rp:cookie-consent", cb);
}

export function CookieBanner() {
  // Na serwerze zakładamy, że wybór już jest – baner pojawia się dopiero w przeglądarce.
  const choice = useSyncExternalStore<CookieChoice | null | "server">(
    subscribe,
    readCookieChoice,
    () => "server",
  );
  if (choice !== null) return null;

  return (
    <div
      role="region"
      aria-label="Pliki cookie"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-[20px] border border-line bg-card p-5 shadow-[0_20px_50px_-24px_rgba(18,18,18,0.35)] sm:inset-x-6 sm:bottom-6"
    >
      <p className="text-sm text-ink-2">
        Używamy wyłącznie niezbędnych plików cookie. Analitykę włączymy tylko za Twoją zgodą.{" "}
        <Link href="/polityka-prywatnosci" className="underline underline-offset-2 hover:text-ink">
          Szczegóły
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => saveCookieChoice("necessary")}>
          Tylko niezbędne
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => saveCookieChoice("analytics")}>
          Zgadzam się na analitykę
        </button>
      </div>
    </div>
  );
}
