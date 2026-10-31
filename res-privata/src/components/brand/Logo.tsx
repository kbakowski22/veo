import Link from "next/link";

/** Znak Res Privata: kwadrat z wyciętym rzymskim łukiem. */
export function LogoMark({
  className = "size-7",
  color = "#1F3D2E",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path fill={color} fillRule="evenodd" d="M0 0H32V32H0Z M11 32V17A5 5 0 0 1 21 17V32Z" />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  href = "/",
}: {
  tone?: "dark" | "light";
  href?: string;
}) {
  const light = tone === "light";
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
      aria-label="Res Privata – strona główna"
    >
      <LogoMark color={light ? "#A8C3B3" : "#1F3D2E"} />
      <span
        className={`text-[13px] font-semibold tracking-[0.24em] ${light ? "text-on-dark" : "text-ink"}`}
      >
        RES PRIVATA
      </span>
    </Link>
  );
}
