"use client";

import { useId, useState } from "react";
import { LANDING_RANGES, landingEstimate } from "@/lib/calc";
import { formatPercent, formatPLN } from "@/lib/format";

type Key = keyof typeof LANDING_RANGES;

const FIELDS: { key: Key; label: string; suffix?: string }[] = [
  { key: "cena", label: "Cena mieszkania" },
  { key: "remont", label: "Remont i wyposażenie" },
  { key: "czynsz", label: "Czynsz najmu", suffix: " / mies." },
];

/** Skala paska: 10% zwrotu brutto = pełny pasek. */
const BAR_MAX = 0.1;

export function Calculator() {
  const baseId = useId();
  const [values, setValues] = useState<Record<Key, number>>({
    cena: LANDING_RANGES.cena.initial,
    remont: LANDING_RANGES.remont.initial,
    czynsz: LANDING_RANGES.czynsz.initial,
  });
  const result = landingEstimate(values);
  const barWidth = Math.min(result.zwrotBrutto / BAR_MAX, 1) * 100;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <div className="rounded-[var(--radius-card-lg)] border border-line bg-card p-6 shadow-[0_30px_60px_-40px_rgba(18,18,18,0.3)] sm:p-10">
        <div className="flex flex-col gap-9">
          {FIELDS.map(({ key, label, suffix }) => {
            const range = LANDING_RANGES[key];
            const id = `${baseId}-${key}`;
            const fill = ((values[key] - range.min) / (range.max - range.min)) * 100;
            return (
              <div key={key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label htmlFor={id} className="text-[15px] text-ink-2">
                    {label}
                  </label>
                  <output htmlFor={id} className="text-xl font-medium tracking-[-0.03em] tabular-nums sm:text-2xl">
                    {formatPLN(values[key])}
                    {suffix && <span className="text-base font-normal text-ink-3">{suffix}</span>}
                  </output>
                </div>
                <input
                  id={id}
                  type="range"
                  className="range mt-3"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={values[key]}
                  aria-valuetext={formatPLN(values[key])}
                  style={{ "--fill": `${fill}%` } as React.CSSProperties}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: Number(e.target.value) }))}
                />
                <div className="mt-1 flex justify-between text-xs text-ink-3 tabular-nums" aria-hidden="true">
                  <span>{formatPLN(range.min)}</span>
                  <span>{formatPLN(range.max)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="on-accent flex flex-col justify-between rounded-[var(--radius-card-lg)] bg-accent p-6 text-on-dark shadow-[0_30px_60px_-40px_rgba(18,18,18,0.45)] sm:p-10"
        aria-live="polite"
      >
        <div>
          <p className="label-mono text-accent-light">Zwrot brutto</p>
          <p className="mt-3 text-[clamp(64px,10vw,112px)] leading-none font-medium tracking-[-0.055em] tabular-nums">
            {formatPercent(result.zwrotBrutto)}
          </p>
          <div
            className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/15"
            role="meter"
            aria-label="Zwrot brutto na skali do 10%"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={Math.round(result.zwrotBrutto * 1000) / 10}
          >
            <div
              className="h-full rounded-full bg-accent-light transition-[width] duration-500 ease-out"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-accent-light tabular-nums" aria-hidden="true">
            <span>0%</span>
            <span>10%</span>
          </div>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
          <div>
            <dt className="text-sm text-accent-light">Przychód roczny</dt>
            <dd className="mt-1 text-xl font-medium tracking-[-0.03em] tabular-nums sm:text-2xl">
              {formatPLN(result.przychodRoczny)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-accent-light">Koszt zakupu i remontu</dt>
            <dd className="mt-1 text-xl font-medium tracking-[-0.03em] tabular-nums sm:text-2xl">
              {formatPLN(result.kosztCalkowity)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
