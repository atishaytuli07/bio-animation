import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { asset, C, L, T } from "@/components/hero/palette";
import { band, range, useSmoothProgress, useTime } from "@/hooks/use-scroll-progress";

/**
 * Stop two — "Two people".
 *
 * The descent ended on a letter. This is what that letter means for a person.
 * Two patients, the same drug, the same dose, at the same time — and for a
 * deliberately long stretch nothing separates them. Then one body clears the
 * drug and the other cannot, and only once the reader has watched that happen
 * does the sentence finish: "…doesn't mean the same outcome."
 *
 * The characters are illustrated plates (AI-generated, to be declared in
 * Attributions). Everything that moves is drawn in code on top: the IV
 * hardware, the dose travelling, and — the mechanic that carries the beat —
 * the drug visibly filling one body, using the plate's own alpha as a CSS
 * mask so the tint is inside the person rather than a rectangle over them.
 *
 * The room warms as B's load climbs. It does NOT go dark: the client rejected
 * near-black sections outright, and the brief's rule is that the emotional
 * arc is carried by saturation and hue, never by darkness.
 */

const q = (v: number) => Math.round(v * 20) / 20;

/** The world, placed. Figures occupy roughly x 22–78%; copy sits at y 14–28%. */
const FIELD2 = [
  // hideSm: the ones that land behind a head or on the label once the figures
  // sit close together on a phone
  { k: "cell", x: 8, y: 34, s: 0.62, r: -6, tone: C.pink, depth: 0.9, hideSm: true },
  { k: "mol", x: 14, y: 12, s: 0.44, r: 12, tone: C.coral, depth: 0.5, hideSm: true },
  { k: "enz", x: 9, y: 54, s: 0.4, r: -12, tone: C.green, depth: 0.35, hideSm: true },
  { k: "mol", x: 50, y: 52, s: 0.5, r: -8, tone: C.coral, depth: 0.8 },
  { k: "cell", x: 91, y: 36, s: 0.56, r: 8, tone: C.blue, depth: 0.8, hideSm: true },
  { k: "enz", x: 88, y: 12, s: 0.42, r: 14, tone: C.green, depth: 0.4 },
  { k: "mol", x: 93, y: 56, s: 0.36, r: 20, tone: C.coral, depth: 0.3, hideSm: true },
] as const;

/** IV stand, bag, drip chamber and line — all SVG, so the dose can move. */
/**
 * The drug in the bag is ALWAYS coral, on both stands, all the way through.
 * The whole point of the beat is that the treatment is identical — only the
 * body's response differs — so tinting one bag would quietly tell the wrong
 * story.
 */
function IV({ dose, flow, flip }: { dose: number; flow: number; flip: boolean }) {
  const t = useTime(flow > 0.01);
  const fluid = 1 - dose * 0.85;
  const drug = C.coral;
  return (
    <svg
      viewBox="0 0 120 420"
      className="h-full w-auto overflow-visible"
      aria-hidden="true"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* pole + base */}
      <line x1="30" y1="40" x2="30" y2="400" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M8 404 Q30 392 52 404"
        fill="none"
        stroke={C.ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line x1="30" y1="40" x2="74" y2="40" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      {/* bag */}
      <rect
        x="56"
        y="48"
        width="36"
        height="76"
        rx="8"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="3.5"
      />
      <rect
        x="59"
        y={51 + (1 - fluid) * 70}
        width="30"
        height={fluid * 70}
        rx="6"
        fill={drug}
        opacity={0.85}
      />
      {/* drip chamber */}
      <rect
        x="66"
        y="132"
        width="16"
        height="30"
        rx="5"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="3"
      />
      {flow > 0.01 && (
        <circle cx="74" cy={140 + ((t * 1.4) % 1) * 16} r="2.6" fill={drug} opacity={flow} />
      )}
      {/* line to the arm */}
      <path
        d="M74 162 C 74 240, 20 250, -34 318"
        fill="none"
        stroke={`${C.ink}55`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="-42"
        y="312"
        width="14"
        height="6"
        rx="3"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="2.5"
      />
      {/* the dose travelling */}
      {flow > 0.01 &&
        [0, 0.22, 0.41, 0.63, 0.84].map((off, i) => {
          const s = (((t * 0.28 + off) % 1) + 1) % 1;
          // sample the cubic that draws the line
          const P = (u: number): [number, number] => {
            const k = 1 - u;
            const b0 = k * k * k,
              b1 = 3 * k * k * u,
              b2 = 3 * k * u * u,
              b3 = u * u * u;
            return [
              b0 * 74 + b1 * 74 + b2 * 20 + b3 * -34,
              b0 * 162 + b1 * 240 + b2 * 250 + b3 * 318,
            ];
          };
          const [x, y] = P(s);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.4"
              fill={drug}
              opacity={flow * (0.35 + 0.65 * Math.sin(s * Math.PI))}
            />
          );
        })}
    </svg>
  );
}

/** A patient: plate + the drug inside them, masked to their silhouette. */
function Patient({
  src,
  fill,
  alarm,
  flip,
}: {
  src: string;
  fill: number;
  alarm: number;
  flip: boolean;
}) {
  const level = fill * 100;
  const tint = alarm > 0.01 ? `color-mix(in oklab, ${C.red} ${alarm * 100}%, ${C.coral})` : C.coral;
  const mask = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  } as const;
  return (
    <div className="relative h-full" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <img src={src} alt="" draggable={false} className="h-full w-auto select-none" />
      {fill > 0.004 && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            ...mask,
            background: `linear-gradient(to top, ${tint} 0%, ${tint} ${level}%, transparent ${Math.min(100, level + 18)}%)`,
            opacity: q(0.42 + alarm * 0.3),
            mixBlendMode: "multiply",
          }}
        />
      )}
      {/* contact shadow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-full h-3 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{ background: `${C.ink}2e`, filter: "blur(4px)" }}
      />
    </div>
  );
}

export function TwoPeople() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>(0.1);

  /* ---- beats ---------------------------------------------------------------
     enter → the same treatment → IDENTICAL, held → one clears, one fills →
     the sentence finishes. The hold is the point: the split only hurts if the
     reader has had time to believe there was no difference.                 */
  const enter = range(p, 0.02, 0.16);
  const title = band(p, 0.12, 0.2, 0.6, 0.68);
  const flow = band(p, 0.2, 0.26, 0.88, 0.94);
  const dose = range(p, 0.2, 0.9);
  const uptake = 0.34 * range(p, 0.24, 0.5); // both, identically
  const clearA = range(p, 0.54, 0.74);
  const buildB = range(p, 0.54, 0.8);
  const alarm = range(p, 0.6, 0.82);
  const warm = range(p, 0.58, 0.86);
  const outcome = range(p, 0.82, 0.94);

  const fillA = uptake * (1 - clearA);
  const fillB = uptake + 0.36 * buildB;

  return (
    <section
      id="two-people"
      ref={ref}
      style={{ height: "460vh" }}
      className="relative"
      data-active={String(active)}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden [--fig2:36vh] md:[--fig2:min(52vh,600px)]"
        style={{ background: C.paper }}
      >
        {/*
          The room. A committed field with a hard bottom edge — the same
          language as the hero, so this reads as the next room of one world
          and not a different site. It warms from lavender toward coral as B's
          load climbs: hotter and more saturated, never dark, because the
          client rejected near-black sections outright.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0"
          style={{
            height: "62%",
            backgroundImage: `repeating-linear-gradient(102deg, rgba(255,255,255,0.05) 0 3px, transparent 3px 26px), linear-gradient(160deg, color-mix(in oklab, ${C.coral} ${q(warm) * 55}%, ${C.lavender}), color-mix(in oklab, ${C.red} ${q(warm) * 40}%, ${C.lavenderDeep}))`,
          }}
        />
        {/* the floor: a tonal shift, no horizon line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "38%",
            background: `linear-gradient(to bottom, ${C.paper}, color-mix(in oklab, ${C.pink} ${8 + q(warm) * 14}%, ${C.paper}))`,
          }}
        />

        {/* the shared illustrated world, at depth */}
        {FIELD2.map((f, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={`absolute${"hideSm" in f && f.hideSm ? " max-md:hidden" : ""}`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              transform: `translate(-50%,-50%) rotate(${f.r}deg)`,
              opacity: q(enter) * (0.5 + f.depth * 0.5),
              filter:
                f.depth > 0.7
                  ? `drop-shadow(0 6px 10px rgba(36,28,46,0.2))`
                  : `blur(${((1 - f.depth) * 1.4).toFixed(2)}px)`,
            }}
          >
            {f.k === "cell" ? (
              <Cell s={f.s} tone={f.tone} />
            ) : f.k === "mol" ? (
              <Molecule s={f.s} tone={f.tone} />
            ) : (
              <Enzyme s={f.s} tone={f.tone} />
            )}
          </div>
        ))}
        {/* chapter label */}
        <div className={L.label}>
          <span className={L.labelType} style={{ color: C.paper, opacity: q(enter) }}>
            <span className="block h-0.5 w-7" style={{ background: C.paper }} />
            02 · Two people
          </span>
        </div>

        {/* the two patients, facing each other */}
        <div
          className="absolute inset-x-0 flex items-end justify-center gap-[5vw] md:gap-[12vw]"
          style={{
            bottom: "16vh",
            opacity: q(enter),
            transform: `translateY(${((1 - enter) * 30).toFixed(1)}px)`,
          }}
        >
          <div className="flex items-end gap-2 md:gap-4" style={{ height: "var(--fig2)" }}>
            <Patient src={asset("patient-a.webp")} fill={fillA} alarm={0} flip={false} />
            <div className="h-[92%]">
              <IV dose={dose} flow={flow} flip={false} />
            </div>
          </div>
          <div className="flex items-end gap-2 md:gap-4" style={{ height: "var(--fig2)" }}>
            <div className="h-[92%]">
              <IV dose={dose} flow={flow} flip />
            </div>
            <Patient src={asset("patient-b.webp")} fill={fillB} alarm={alarm} flip={false} />
          </div>
        </div>

        {/* "The same treatment." — arrives with the drip, leaves before the split */}
        <div className={L.headline} style={{ opacity: q(title) }}>
          <p
            className="text-center font-black"
            style={{
              ...T.headline,
              color: C.paper,
              textShadow: `0 4px 24px ${C.lavenderDeep}88`,
              transform: `translateY(${((1 - title) * 16).toFixed(1)}px)`,
            }}
          >
            The same treatment.
          </p>
        </div>

        {/* "…doesn't mean the same outcome." — only after the split has happened */}
        <div className={L.headline} style={{ opacity: q(outcome) }}>
          <p
            className="text-center font-black"
            style={{
              ...T.headline,
              color: C.paper,
              textShadow: `0 4px 24px ${C.lavenderDeep}88`,
              transform: `translateY(${((1 - outcome) * 16).toFixed(1)}px)`,
            }}
          >
            &hellip;doesn&rsquo;t mean the <span style={{ color: "#FFC9C4" }}>same outcome.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
