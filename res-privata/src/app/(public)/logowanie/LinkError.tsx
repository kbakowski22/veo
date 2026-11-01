"use client";

import { useSearchParams } from "next/navigation";

export function LinkError() {
  const params = useSearchParams();
  if (params.get("blad") !== "link") return null;
  return (
    <p role="alert" className="mt-6 rounded-2xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
      Link logowania wygasł lub został już użyty. Wyślij nowy poniżej.
    </p>
  );
}
