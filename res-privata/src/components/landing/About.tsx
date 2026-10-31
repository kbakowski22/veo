import { SectionLabel } from "@/components/ui/SectionLabel";
import { COMPARISON } from "@/lib/content/site";

export function About() {
  return (
    <section id="kim-jestesmy" aria-labelledby="about-title" className="py-24 sm:py-32">
      <div className="container-rp">
        <div data-reveal>
          <SectionLabel index="01">Kim jesteśmy</SectionLabel>
          <h2 id="about-title" className="h2 mt-6 max-w-5xl">
            Nie jesteśmy pośrednikiem.
            <span className="headline-soft">Pracujemy dla Ciebie.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">
            Res Privata to klub inwestycyjny dla prywatnych inwestorów nieruchomości. Dajemy dostęp
            do okazji, profesjonalną analizę, siłę negocjacyjną grupy i pełną obsługę. Zawsze po
            stronie kupującego.
          </p>
        </div>

        <div data-reveal className="mt-16 overflow-hidden rounded-[var(--radius-card-lg)] border border-line bg-card">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Porównanie: typowy pośrednik a Res Privata</caption>
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-line">
                <th scope="col" className="w-1/4 p-6 lg:p-8">
                  <span className="sr-only">Kryterium</span>
                </th>
                <th scope="col" className="label-mono w-[37.5%] p-6 font-normal text-ink-3 lg:p-8">
                  Typowy pośrednik
                </th>
                <th scope="col" className="label-mono w-[37.5%] bg-accent/[0.04] p-6 font-normal text-accent lg:p-8">
                  Res Privata
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr
                  key={row.label}
                  className="grid grid-cols-2 border-b border-line last:border-b-0 sm:table-row"
                >
                  <th
                    scope="row"
                    className="col-span-2 px-5 pt-5 pb-2 text-[15px] font-medium sm:p-6 lg:p-8"
                  >
                    {row.label}
                  </th>
                  <td className="px-5 pt-3 pb-5 text-[15px] text-ink-3 sm:p-6 sm:text-base lg:p-8">
                    <span className="label-mono mb-1 block text-[11px] sm:hidden">Pośrednik</span>
                    {row.agent}
                  </td>
                  <td className="bg-accent/[0.04] px-5 pt-3 pb-5 text-[15px] font-medium text-ink sm:p-6 sm:text-base lg:p-8">
                    <span className="label-mono mb-1 block text-[11px] font-normal text-accent sm:hidden">
                      Res Privata
                    </span>
                    {row.us}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
