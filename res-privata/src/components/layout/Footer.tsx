import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SITE } from "@/lib/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="container-rp py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-ink-3">
              Polska · © {SITE.year} {SITE.name}
            </p>
          </div>
          <nav aria-label="Dokumenty">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-2">
              <li>
                <Link href="/analiza" className="hover:text-ink">
                  Bezpłatna analiza
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="hover:text-ink">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="hover:text-ink">
                  Polityka prywatności
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-ink-3">{SITE.disclaimer}</p>
      </div>
    </footer>
  );
}
