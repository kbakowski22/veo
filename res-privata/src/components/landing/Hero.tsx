import Link from "next/link";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { HeroArches } from "./HeroArches";

const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden">
      <div className="container-rp pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-24">
        <p
          className="rise label-mono inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 text-ink-2"
          style={step(0)}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          Klub inwestorów nieruchomości
        </p>

        <h1 id="hero-title" className="h1 mt-8 max-w-[14ch] lg:max-w-none">
          <span className="rise block" style={step(1)}>
            Inwestuj jak fundusz.
          </span>
          <span className="rise headline-soft" style={step(2)}>
            Nie jak przypadkowy kupujący.
          </span>
        </h1>

        <div className="mt-12 grid items-end gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="rise max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl" style={step(3)}>
              Analiza, okazje spoza portali, siła negocjacyjna grupy i pełna obsługa. Wszystko, co
              dotąd miały tylko fundusze, teraz dla prywatnych inwestorów.
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={step(4)}>
              <Link href="/#dolacz" className="btn btn-primary">
                Dołącz za darmo
                <ArrowIcon />
              </Link>
              <Link href="/#kalkulator" className="btn btn-secondary">
                Policz zwrot z mieszkania
              </Link>
            </div>
          </div>
          <HeroArches className="mx-auto w-full max-w-[520px] lg:ml-auto lg:mr-0" />
        </div>
      </div>
    </section>
  );
}
