import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Logowanie", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="container-rp flex justify-center py-16 sm:py-28">
      <div className="rise w-full max-w-md rounded-[var(--radius-card-lg)] border border-line bg-card p-7 sm:p-10">
        <LogoMark className="size-9" />
        <h1 className="mt-8 text-4xl font-medium tracking-[-0.045em]">Zaloguj się</h1>
        <p className="mt-3 leading-relaxed text-ink-2">
          Bez hasła. Wyślemy Ci jednorazowy link do logowania.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-8 border-t border-line pt-6 text-sm text-ink-2">
          Nie masz jeszcze konta?{" "}
          <Link href="/#dolacz" className="font-medium text-accent underline underline-offset-2">
            Dołącz za darmo
          </Link>
        </p>
      </div>
    </div>
  );
}
