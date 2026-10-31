/**
 * Trzy rzymskie łuki rysowane linią. Środkowy wypełniony akcentem (opacity 0.12).
 * Linie rysują się przy wejściu (stroke-dashoffset, pathLength=1).
 */
const ARCHES = [
  "M45 400V205A60 60 0 0 1 165 205V400",
  "M195 400V180A65 65 0 0 1 325 180V400",
  "M355 400V205A60 60 0 0 1 475 205V400",
];

export function HeroArches({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 420"
      className={className}
      role="img"
      aria-label="Ilustracja: trzy rzymskie łuki"
      fill="none"
    >
      <path
        className="draw-fill"
        d="M195 400V180A65 65 0 0 1 325 180V400Z"
        fill="#1F3D2E"
        fillOpacity="0.12"
      />
      <g stroke="#121212" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path className="draw" style={{ "--i": 0 } as React.CSSProperties} pathLength={1} d="M10 40H510" />
        <path className="draw" style={{ "--i": 1 } as React.CSSProperties} pathLength={1} d="M10 70H510" />
        <path className="draw" style={{ "--i": 1 } as React.CSSProperties} pathLength={1} d="M10 40V400" />
        <path className="draw" style={{ "--i": 1 } as React.CSSProperties} pathLength={1} d="M510 40V400" />
        {ARCHES.map((d, i) => (
          <path
            key={d}
            className="draw"
            style={{ "--i": 2 + i } as React.CSSProperties}
            pathLength={1}
            d={d}
          />
        ))}
        <path
          className="draw"
          style={{ "--i": 5 } as React.CSSProperties}
          pathLength={1}
          stroke="#1F3D2E"
          d="M253 115H267"
        />
        <path className="draw" style={{ "--i": 5 } as React.CSSProperties} pathLength={1} d="M0 400H520" />
      </g>
    </svg>
  );
}
