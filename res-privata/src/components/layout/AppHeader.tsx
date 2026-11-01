import { Logo } from "@/components/brand/Logo";

/** Nagłówek części dla zalogowanych (panel, admin). */
export function AppHeader({ area }: { area: "panel" | "admin" }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="container-rp flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo href={area === "admin" ? "/admin" : "/panel"} />
          {area === "admin" && (
            <span className="label-mono rounded-full border border-line px-3 py-1 text-[11px] text-ink-3">
              Admin
            </span>
          )}
        </div>
        <form action="/auth/wyloguj" method="post">
          <button type="submit" className="btn btn-secondary btn-sm">
            Wyloguj
          </button>
        </form>
      </div>
    </header>
  );
}
