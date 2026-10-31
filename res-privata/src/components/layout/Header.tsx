import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NAV_LINKS } from "@/lib/content/site";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="container-rp flex h-[72px] items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Główna nawigacja" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[15px] text-ink-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-6 lg:flex">
          <Link href="/logowanie" className="text-[15px] text-ink-2 transition-colors hover:text-ink">
            Zaloguj
          </Link>
          <Link href="/#dolacz" className="btn btn-primary btn-sm">
            Dołącz
          </Link>
        </div>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  );
}
