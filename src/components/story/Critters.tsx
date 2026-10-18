import { useId, type CSSProperties, type ReactNode } from "react";

import { C, ENZYME_PATH } from "@/components/hero/palette";

// The cast: the project's own actors, given faces. The DPD enzyme, the 5-FU molecule, a chromosome carrying the
// gene, the cells the drug reaches, and a drop of the medicine itself. Each keeps the colour it has everywhere else
// on the site (green is the enzyme, coral the drug, lavender genetics, red only the variant), so a reader who has
// seen the story recognises them, and the drawings stay in the story's language: ink outline, flat fill, one
// highlight. They bob and blink, slowly; prefers-reduced-motion stills them (styles.css).

const INK = C.ink;

/** Eyes, cheeks and a smile, centred on (x, y). `s` scales the whole face. */
function Face({
  x,
  y,
  s = 1,
  mouth = "smile",
}: {
  x: number;
  y: number;
  s?: number;
  mouth?: "smile" | "open";
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="critter-blink">
        <ellipse cx={-8} cy={0} rx={3.1} ry={4.1} fill={INK} />
        <ellipse cx={8} cy={0} rx={3.1} ry={4.1} fill={INK} />
        <circle cx={-9} cy={-1.6} r={1.25} fill="#fff" />
        <circle cx={7} cy={-1.6} r={1.25} fill="#fff" />
      </g>
      <ellipse cx={-14.5} cy={6} rx={4.2} ry={2.5} fill={C.pink} opacity={0.75} />
      <ellipse cx={14.5} cy={6} rx={4.2} ry={2.5} fill={C.pink} opacity={0.75} />
      {mouth === "open" ? (
        <path
          d="M-4.2 5 Q0 11.5 4.2 5 Z"
          fill={INK}
          stroke={INK}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M-4.4 5.2 Q0 9.6 4.4 5.2"
          fill="none"
          stroke={INK}
          strokeWidth={1.9}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** A group that bobs on its own clock, so a cast never moves in step. */
function Bob({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  return (
    <g className="critter-bob" style={{ animationDelay: `${-delay}s` } as CSSProperties}>
      {children}
    </g>
  );
}

/** DPD, the enzyme: the story's lock-shaped silhouette, with a face and two small feet. */
export function EnzymeBody({
  x,
  y,
  k = 3,
  dashed = false,
}: {
  x: number;
  y: number;
  k?: number;
  dashed?: boolean;
}) {
  const w = 3.4 / k;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse
        cx={31}
        cy={71.5}
        rx={4.6}
        ry={2.6}
        fill={dashed ? "none" : INK}
        stroke={dashed ? `${C.paper}cc` : INK}
        strokeWidth={w}
      />
      <ellipse
        cx={47}
        cy={71.5}
        rx={4.6}
        ry={2.6}
        fill={dashed ? "none" : INK}
        stroke={dashed ? `${C.paper}cc` : INK}
        strokeWidth={w}
      />
      <path
        d={ENZYME_PATH}
        fill={dashed ? `${C.paper}22` : C.green}
        stroke={dashed ? `${C.paper}cc` : INK}
        strokeWidth={w}
        strokeDasharray={dashed ? `${6 / k} ${4 / k}` : undefined}
        strokeLinejoin="round"
      />
      {!dashed && (
        <ellipse
          cx={27}
          cy={23}
          rx={7}
          ry={3.6}
          fill={C.paper}
          opacity={0.38}
          transform="rotate(-30 27 23)"
        />
      )}
      <g opacity={dashed ? 0.55 : 1}>
        <Face x={33} y={40} s={0.62} />
      </g>
    </g>
  );
}

/** 5-FU: a coral pyrimidine ring with atoms at its corners and a small face. */
export function MoleculeBody({ x, y, r = 30 }: { x: number; y: number; r?: number }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r] as const;
  });
  const sw = Math.max(2.4, r * 0.11);
  return (
    <g>
      <polygon
        points={pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ")}
        fill={C.coral}
        stroke={INK}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      <ellipse
        cx={x - r * 0.32}
        cy={y - r * 0.5}
        rx={r * 0.22}
        ry={r * 0.12}
        fill={C.paper}
        opacity={0.4}
        transform={`rotate(-30 ${x - r * 0.32} ${y - r * 0.5})`}
      />
      {pts.map(([a, b], i) => (
        <circle
          key={i}
          cx={a}
          cy={b}
          r={r * 0.2}
          fill={C.paper}
          stroke={INK}
          strokeWidth={sw * 0.8}
        />
      ))}
      <Face x={x} y={y + r * 0.05} s={r / 30} mouth="open" />
    </g>
  );
}

/** A cell: membrane, a nucleus up and to one side, and the face below it. */
export function CellBody({
  x,
  y,
  r = 50,
  tone = C.pink,
}: {
  x: number;
  y: number;
  r?: number;
  tone?: string;
}) {
  const sw = Math.max(2.6, r * 0.08);
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={tone} stroke={INK} strokeWidth={sw} />
      {[
        [-0.5, 0.42],
        [0.55, 0.38],
        [-0.15, 0.7],
        [0.66, -0.12],
      ].map(([dx = 0, dy = 0], i) => (
        <circle key={i} cx={x + dx * r} cy={y + dy * r} r={r * 0.04} fill={INK} opacity={0.3} />
      ))}
      <circle
        cx={x + r * 0.34}
        cy={y - r * 0.42}
        r={r * 0.24}
        fill={C.lavender}
        stroke={INK}
        strokeWidth={sw * 0.8}
      />
      <circle cx={x + r * 0.38} cy={y - r * 0.46} r={r * 0.07} fill={INK} opacity={0.45} />
      <ellipse
        cx={x - r * 0.42}
        cy={y - r * 0.46}
        rx={r * 0.17}
        ry={r * 0.09}
        fill={C.paper}
        opacity={0.5}
        transform={`rotate(-34 ${x - r * 0.42} ${y - r * 0.46})`}
      />
      <Face x={x - r * 0.06} y={y + r * 0.12} s={r / 40} />
    </g>
  );
}

/** A chromosome, the gene's home: two lavender chromatids, banded, with the variant as one red band. */
export function ChromosomeBody({ x, y, h = 170 }: { x: number; y: number; h?: number }) {
  // ids per instance: the closing band draws one on every page, and Engineering's hero draws another
  const uid = useId().replace(/:/g, "");
  const w = h * 0.25;
  const sw = Math.max(2.8, h * 0.02);
  const arm = (deg: number, id: string, bands: [number, string][]) => (
    <g transform={`rotate(${deg} ${x} ${y})`}>
      <clipPath id={id}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2} />
      </clipPath>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2} fill={C.lavender} />
      <g clipPath={`url(#${id})`}>
        {bands.map(([at, tone]) => (
          <rect
            key={at}
            x={x - w / 2}
            y={y - h / 2 + at * h}
            width={w}
            height={h * 0.055}
            fill={tone}
          />
        ))}
      </g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={w / 2}
        fill="none"
        stroke={INK}
        strokeWidth={sw}
      />
      <ellipse
        cx={x - w * 0.18}
        cy={y - h * 0.38}
        rx={w * 0.12}
        ry={h * 0.06}
        fill={C.paper}
        opacity={0.45}
      />
    </g>
  );
  const shade = C.lavenderDeep;
  return (
    <g>
      {arm(-17, `${uid}a`, [
        [0.14, shade],
        [0.27, shade],
        [0.7, C.red],
        [0.82, shade],
      ])}
      {arm(17, `${uid}b`, [
        [0.14, shade],
        [0.3, shade],
        [0.72, shade],
        [0.85, shade],
      ])}
      {/* the centromere: where the two chromatids are held, and where the face sits */}
      <ellipse
        cx={x}
        cy={y}
        rx={w * 0.95}
        ry={h * 0.13}
        fill={C.lavender}
        stroke={INK}
        strokeWidth={sw}
      />
      <Face x={x} y={y - h * 0.01} s={h / 210} />
    </g>
  );
}

/** A drop of the medicine, holding a shield. Coral, because the drug is coral everywhere on this site. */
export function DropBody({ x, y, h = 190 }: { x: number; y: number; h?: number }) {
  const k = h / 190;
  const sw = 3.6 * k;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path
        d="M0 -95 C 6 -80, 70 -12, 70 32 A 70 70 0 0 1 -70 32 C -70 -12, -6 -80, 0 -95 Z"
        fill={C.coral}
        stroke={INK}
        strokeWidth={sw / k}
        strokeLinejoin="round"
      />
      <path
        d="M-36 -10 C -42 6, -44 20, -42 32"
        fill="none"
        stroke={C.paper}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <Face x={-4} y={26} s={1.9} />
      {/* the shield, held up at the side: safety, without a word on it */}
      <g transform="translate(58 54) rotate(10)">
        <path
          d="M0 -30 L 24 -21 C 24 2, 15 17, 0 26 C -15 17, -24 2, -24 -21 Z"
          fill={C.paper}
          stroke={INK}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        <path
          d="M-10 -2 L -2 7 L 11 -10"
          fill="none"
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

// ── Page heroes: one cast per page, each about what that page is about ──────────────────────────────────

/** Description: DPD with 5-FU held in its cleft, the whole mechanism in one picture. */
export function DockCast() {
  return (
    <svg viewBox="0 0 270 250" className="h-full w-full overflow-visible" aria-hidden="true">
      <Bob>
        <EnzymeBody x={10} y={10} k={3.2} />
      </Bob>
      <Bob delay={1.3}>
        <MoleculeBody x={210} y={152} r={30} />
      </Bob>
    </svg>
  );
}

/** Engineering: the chromosome inside an open loop, because the page is about going round the cycle again. */
export function CycleCast() {
  return (
    <svg viewBox="0 0 260 260" className="h-full w-full overflow-visible" aria-hidden="true">
      <defs>
        <marker
          id="cast-cycle-head"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4.5"
          markerHeight="4.5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={C.paper} />
        </marker>
      </defs>
      <path
        d="M 214 92 A 100 100 0 1 1 92 34"
        fill="none"
        stroke={C.paper}
        strokeOpacity="0.9"
        strokeWidth="5"
        strokeLinecap="round"
        markerEnd="url(#cast-cycle-head)"
      />
      <Bob>
        <ChromosomeBody x={130} y={132} h={170} />
      </Bob>
    </svg>
  );
}

/** Human Practices: three cells of different sizes, huddled, the people a test reaches. */
export function VoicesCast() {
  return (
    <svg viewBox="0 0 290 240" className="h-full w-full overflow-visible" aria-hidden="true">
      <Bob delay={0.8}>
        <CellBody x={196} y={72} r={50} tone={C.blue} />
      </Bob>
      <Bob delay={2.1}>
        <CellBody x={226} y={170} r={42} tone={C.lavender} />
      </Bob>
      <Bob>
        <CellBody x={96} y={146} r={74} tone={C.pink} />
      </Bob>
    </svg>
  );
}

/** Safety: a drop of the medicine behind its shield. */
export function DropCast() {
  return (
    <svg viewBox="0 0 230 250" className="h-full w-full overflow-visible" aria-hidden="true">
      <Bob>
        <DropBody x={104} y={128} h={210} />
      </Bob>
    </svg>
  );
}

/** Contribution: our enzyme, and its dashed twin in the next team's hands. */
export function HandoffCast() {
  return (
    <svg viewBox="0 0 340 230" className="h-full w-full overflow-visible" aria-hidden="true">
      <Bob>
        <EnzymeBody x={0} y={6} k={2.6} />
      </Bob>
      <Bob delay={1.6}>
        <EnzymeBody x={164} y={6} k={2.6} dashed />
      </Bob>
    </svg>
  );
}

// ── The closing band: the cast leaning in from both edges of every content page ──────────────────────────

export function ClosingCast({ side }: { side: "left" | "right" }) {
  return side === "left" ? (
    <svg viewBox="0 0 300 200" className="h-full w-auto overflow-visible" aria-hidden="true">
      <Bob delay={0.4}>
        <ChromosomeBody x={206} y={120} h={150} />
      </Bob>
      <Bob>
        <CellBody x={90} y={140} r={78} tone={C.pink} />
      </Bob>
    </svg>
  ) : (
    <svg viewBox="0 0 300 200" className="h-full w-auto overflow-visible" aria-hidden="true">
      <Bob delay={2.4}>
        <MoleculeBody x={152} y={44} r={17} />
      </Bob>
      <Bob delay={1.1}>
        <EnzymeBody x={-6} y={40} k={2.2} />
      </Bob>
      <Bob>
        <DropBody x={234} y={118} h={170} />
      </Bob>
    </svg>
  );
}
