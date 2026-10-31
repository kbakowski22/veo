import { PageIntro } from "./PageIntro";

export type LegalSection = { title: string; body?: string };

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <div className="container-rp py-16 sm:py-24">
      <PageIntro
        label="Dokument"
        title={title}
        lead={
          <p className="rounded-2xl border border-line bg-card px-5 py-4 text-base">
            Wersja robocza. Treść zostanie przygotowana przez prawnika:{" "}
            <strong className="font-medium">[DO UZUPEŁNIENIA PRZEZ PRAWNIKA]</strong>
          </p>
        }
      />
      <ol className="mt-14 flex max-w-3xl flex-col gap-10">
        {sections.map((s, i) => (
          <li key={s.title}>
            <h2 className="text-xl font-medium tracking-[-0.03em]">
              §{i + 1}. {s.title}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-2">{s.body ?? "[DO UZUPEŁNIENIA PRZEZ PRAWNIKA]"}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
