import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BUSINESS_TERMS, PLANS, type Plan } from "@/lib/content/plans";
import { getFoundingSeatsLeft } from "@/lib/config";

const STYLES: Record<Plan["id"], { card: string; muted: string; check: string; btn: string; dark: boolean }> = {
  circle: {
    card: "bg-paper-alt border border-line",
    muted: "text-ink-2",
    check: "text-accent",
    btn: "btn-secondary",
    dark: false,
  },
  member: {
    card: "bg-card border-2 border-accent shadow-[0_30px_60px_-40px_rgba(31,61,46,0.45)]",
    muted: "text-ink-2",
    check: "text-accent",
    btn: "btn-primary",
    dark: false,
  },
  private: {
    card: "on-dark bg-dark text-on-dark border border-dark",
    muted: "text-on-dark-2",
    check: "text-accent-light",
    btn: "btn-light",
    dark: true,
  },
};

function Check({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`mt-1 size-4 shrink-0 ${className}`} aria-hidden="true">
      <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const s = STYLES[plan.id];
  return (
    <li
      data-reveal
      style={{ "--i": index } as React.CSSProperties}
      className={`lift relative flex flex-col rounded-[var(--radius-card-lg)] p-7 sm:p-9 ${s.card}`}
    >
      {plan.badge && (
        <p className="label-mono absolute -top-3.5 left-7 rounded-full bg-accent px-3.5 py-1.5 text-[11px] text-on-dark sm:left-9">
          {plan.badge}
        </p>
      )}
      <h3 className="text-[28px] font-medium tracking-[-0.04em]">{plan.name}</h3>
      <p className={`mt-2 text-[15px] leading-relaxed ${s.muted}`}>{plan.tagline}</p>
      <div className={`mt-8 border-t pt-6 ${s.dark ? "border-line-dark" : "border-line"}`}>
        <p className="text-[40px] leading-none font-medium tracking-[-0.05em]">{plan.price}</p>
        {plan.priceNote && <p className={`mt-2 text-sm ${s.muted}`}>{plan.priceNote}</p>}
      </div>
      <ul className="mt-8 flex flex-1 flex-col gap-3.5">
        {plan.features.map((f) => (
          <li key={f} className={`flex gap-3 text-[15px] leading-relaxed ${s.dark ? "text-on-dark" : "text-ink"}`}>
            <Check className={s.check} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={`#dolacz-${plan.id}`} className={`btn mt-10 w-full ${s.btn}`}>
        {plan.cta}
      </Link>
    </li>
  );
}

async function FoundingBar() {
  const { left, total } = await getFoundingSeatsLeft();
  return (
    <div
      data-reveal
      className="mt-6 flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div>
        <p className="label-mono text-accent">Członkowie założyciele</p>
        <p className="mt-2 max-w-xl text-[17px] leading-relaxed">
          Pierwszych {total} osób otrzymuje −{BUSINESS_TERMS.foundingDiscountPercent}% na abonament,
          na zawsze.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-8 w-2 rounded-full ${i < total - left ? "bg-line" : "bg-accent"}`} />
          ))}
        </div>
        <p className="text-sm text-ink-2">
          <span className="text-2xl font-medium tracking-[-0.04em] text-ink tabular-nums">{left}</span> z {total}{" "}
          miejsc wolnych
        </p>
      </div>
    </div>
  );
}

export function Membership() {
  return (
    <section id="czlonkostwo" aria-labelledby="membership-title" className="py-24 sm:py-32">
      <div className="container-rp">
        <div data-reveal>
          <SectionLabel index="04">Członkostwo</SectionLabel>
          <h2 id="membership-title" className="h2 mt-6">
            Co dostajesz.
            <span className="headline-soft">Czarno na białym.</span>
          </h2>
        </div>
        <ul className="mt-16 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </ul>
        <FoundingBar />
      </div>
    </section>
  );
}
