export function SectionLabel({
  children,
  index,
  tone = "default",
}: {
  children: React.ReactNode;
  index?: string;
  tone?: "default" | "dark" | "accent";
}) {
  const color =
    tone === "dark" ? "text-on-dark-2" : tone === "accent" ? "text-accent-light" : "text-ink-3";
  return (
    <p className={`label-mono flex items-center gap-3 ${color}`}>
      {index && <span aria-hidden="true">{index}</span>}
      {index && <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />}
      <span>{children}</span>
    </p>
  );
}
