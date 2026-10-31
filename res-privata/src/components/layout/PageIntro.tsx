import { SectionLabel } from "@/components/ui/SectionLabel";

export function PageIntro({
  label,
  title,
  soft,
  lead,
}: {
  label: string;
  title: string;
  soft?: string;
  lead?: React.ReactNode;
}) {
  return (
    <div className="rise" style={{ "--i": 0 } as React.CSSProperties}>
      <SectionLabel>{label}</SectionLabel>
      <h1 className="h2 mt-6">
        {title}
        {soft && <span className="headline-soft">{soft}</span>}
      </h1>
      {lead && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{lead}</div>}
    </div>
  );
}
