import { SectionLabel } from "@/components/ui/SectionLabel";
import { AUDIENCE } from "@/lib/content/site";

export function Audience() {
  return (
    <section aria-labelledby="audience-title" className="on-dark bg-dark py-24 text-on-dark sm:py-32">
      <div className="container-rp">
        <div data-reveal>
          <SectionLabel index="02" tone="dark">
            Dla kogo
          </SectionLabel>
          <h2 id="audience-title" className="h2 mt-6 max-w-5xl">
            Dla ludzi, którzy mają kapitał.
            <span className="headline-soft">I nie mają czasu.</span>
          </h2>
        </div>
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCE.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              className="lift flex min-h-[300px] flex-col justify-between rounded-[var(--radius-card)] border border-line-dark bg-white/[0.03] p-7 hover:border-accent-light/40"
            >
              <span className="label-mono text-accent-light">0{i + 1}</span>
              <div>
                <h3 className="h3">{item.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-on-dark-2">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
