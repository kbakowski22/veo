import { MARQUEE_ITEMS } from "@/lib/content/site";

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {MARQUEE_ITEMS.map((item) => (
        <li key={item} className="flex items-center">
          <span className="px-6 text-2xl font-light tracking-[-0.03em] whitespace-nowrap text-accent sm:text-3xl">
            {item}
          </span>
          <span aria-hidden="true" className="text-lg text-accent">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Marquee() {
  return (
    <section aria-label="Co dostajesz" className="marquee overflow-hidden border-y border-line py-6">
      <div className="marquee-track flex w-max">
        <Group />
        <Group hidden />
      </div>
    </section>
  );
}
