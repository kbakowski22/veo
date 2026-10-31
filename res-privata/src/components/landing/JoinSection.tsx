import { SectionLabel } from "@/components/ui/SectionLabel";
import { JoinForm } from "./JoinForm";

export function JoinSection() {
  return (
    <section id="dolacz" aria-labelledby="join-title" className="py-6 sm:py-10">
      <div className="container-rp">
        <div className="on-accent grid gap-12 rounded-[var(--radius-card-lg)] bg-accent px-6 py-14 text-on-dark sm:px-12 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-16">
          <div data-reveal>
            <SectionLabel index="06" tone="accent">
              Dołącz
            </SectionLabel>
            <h2 id="join-title" className="h2 mt-6">
              Zacznij od Circle.
              <span className="headline-soft">Resztę zdecydujesz później.</span>
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-on-dark-2">
              Rejestracja w Circle jest bezpłatna. Member uruchamiasz od razu, do Private zapraszamy
              po krótkiej rozmowie.
            </p>
          </div>
          <div data-reveal>
            <JoinForm />
          </div>
        </div>
      </div>
    </section>
  );
}
