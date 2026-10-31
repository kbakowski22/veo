import { SectionLabel } from "@/components/ui/SectionLabel";
import { STEPS } from "@/lib/content/site";

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="bg-paper-alt py-24 sm:py-32">
      <div className="container-rp">
        <div data-reveal>
          <SectionLabel index="05">Jak to działa</SectionLabel>
          <h2 id="how-title" className="h2 mt-6">
            Cztery kroki.
            <span className="headline-soft">Jeden opiekun procesu.</span>
          </h2>
        </div>
        <ol className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              className="flex min-h-[260px] flex-col bg-paper-alt p-7 sm:p-8"
            >
              <span className="text-[56px] leading-none font-light tracking-[-0.05em] text-accent" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="h3 mt-auto pt-10">
                <span className="sr-only">Krok {i + 1}: </span>
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
