import { SectionLabel } from "@/components/ui/SectionLabel";
import { Calculator } from "./Calculator";

export function CalculatorSection() {
  return (
    <section id="kalkulator" aria-labelledby="calc-title" className="bg-paper-alt py-24 sm:py-32">
      <div className="container-rp">
        <div data-reveal className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <div>
            <SectionLabel index="03">Kalkulator</SectionLabel>
            <h2 id="calc-title" className="h2 mt-6">
              Policz, zanim
              <span className="headline-soft">zaczniesz oglądać.</span>
            </h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-ink-2 lg:justify-self-end">
            Przesuń suwaki i zobacz, ile mieszkanie może zarabiać w relacji do całego zaangażowanego
            kapitału. Członkowie dostają rozszerzoną wersję z podatkiem, pustostanem i kosztami.
          </p>
        </div>
        <div data-reveal className="mt-14">
          <Calculator />
        </div>
        <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-ink-3">
          Szacunek poglądowy, przed podatkiem, okresami bez najemcy i kosztami utrzymania. Nie
          stanowi rekomendacji inwestycyjnej.
        </p>
      </div>
    </section>
  );
}
