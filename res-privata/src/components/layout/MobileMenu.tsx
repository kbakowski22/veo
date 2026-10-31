"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

type NavLink = { readonly href: string; readonly label: string };

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Zamknij po zmianie strony.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-full"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 8h16M4 16h16"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-[72px] border-b border-line bg-paper"
      >
        <nav aria-label="Menu mobilne" className="container-rp py-6">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href} className="border-b border-line">
                <Link
                  href={link.href}
                  onClick={close}
                  className="flex min-h-14 items-center text-xl font-medium tracking-[-0.03em]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-b border-line">
              <Link
                href="/logowanie"
                onClick={close}
                className="flex min-h-14 items-center text-xl font-medium tracking-[-0.03em]"
              >
                Zaloguj
              </Link>
            </li>
          </ul>
          <Link href="/#dolacz" onClick={close} className="btn btn-primary mt-6 w-full">
            Dołącz
          </Link>
        </nav>
      </div>
    </div>
  );
}
