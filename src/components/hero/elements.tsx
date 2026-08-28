import { C } from "./palette";

/**
 * The illustrated scientific elements — one set, shared by every stop, so the
 * whole site is one world rather than a different vocabulary per section.
 * Ink outlines, solid fills, stipple and hatching: drawn, not generated.
 */

/** A cell: membrane, cytoplasm, nucleus. Reads at 40px and at 200px. */
export function Cell({ s = 1, tone = C.pink }: { s?: number; tone?: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100 * s, height: 100 * s }} aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill={tone} />
      {/* stipple: the texture that makes an illustration look drawn rather
          than generated. Wuxi's kidney is covered in it. */}
      {[
        [36, 32],
        [64, 30],
        [30, 50],
        [44, 66],
        [70, 58],
        [58, 78],
        [26, 66],
        [76, 44],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.9} fill={C.ink} opacity={0.28} />
      ))}
      <circle cx="50" cy="50" r="42" fill="none" stroke={C.ink} strokeWidth="4" />
      <circle cx="57" cy="44" r="16" fill={C.lavender} stroke={C.ink} strokeWidth="3.5" />
      {/* nucleolus + highlight */}
      <circle cx="60" cy="41" r="4.5" fill={C.ink} opacity={0.4} />
      <ellipse
        cx="38"
        cy="34"
        rx="7"
        ry="4.5"
        fill={C.paper}
        opacity={0.45}
        transform="rotate(-28 38 34)"
      />
      <circle cx="33" cy="64" r="5" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="67" cy="71" r="3.5" fill={C.paper} stroke={C.ink} strokeWidth="2" />
    </svg>
  );
}

/**
 * The drug: a pyrimidine ring. 5-FU is a fluorinated uracil — the same family
 * of molecule as the letters of the genome, which is exactly why the enzyme
 * that clears nucleic-acid bases is the one that clears it. Drawn as a
 * hexagon so it reads as "molecule" instantly.
 */
export function Molecule({ s = 1, tone = C.coral }: { s?: number; tone?: string }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(50 + Math.cos(a) * 30).toFixed(1)},${(50 + Math.sin(a) * 30).toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100 * s, height: 100 * s }} aria-hidden="true">
      <polygon
        points={pts.join(" ")}
        fill={tone}
        stroke={C.ink}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* the inner ring line every structural formula has */}
      <circle cx="50" cy="50" r="17" fill="none" stroke={C.ink} strokeWidth="2.5" opacity={0.5} />
      <ellipse
        cx="41"
        cy="36"
        rx="6"
        ry="3.5"
        fill={C.paper}
        opacity={0.4}
        transform="rotate(-30 41 36)"
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={6} fill={C.paper} stroke={C.ink} strokeWidth="3" />;
      })}
    </svg>
  );
}

/** The enzyme that clears the drug — a notched shape, so it reads as a lock. */
export function Enzyme({ s = 1, tone = C.green }: { s?: number; tone?: string }) {
  const d =
    "M18 30 Q18 14 34 14 L66 14 Q82 14 82 30 L82 42 Q64 42 64 54 Q64 66 82 66 L82 78 Q82 94 66 94 L34 94 Q18 94 18 78 Z";
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100 * s, height: 100 * s }} aria-hidden="true">
      <path d={d} fill={tone} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      {/* hatching across the body — a drawn surface, not a filled shape */}
      {[26, 38, 50, 62, 74].map((y, i) => (
        <line
          key={i}
          x1={24}
          y1={y}
          x2={i % 2 ? 56 : 48}
          y2={y}
          stroke={C.ink}
          strokeWidth="2"
          opacity={0.22}
        />
      ))}
      <circle cx="40" cy="34" r="4" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
    </svg>
  );
}
