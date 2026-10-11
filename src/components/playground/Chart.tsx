import { C, L, R } from "@/components/hero/palette";

import { LineKey } from "./PatientColumn";
import { BAND, CEILING, lookOf, nameOf, OVER, SAMPLES, type Mark, type Patient } from "./model";

const W = 1000;
const H = 300;
const y = (v: number) => H - (Math.min(v, CEILING) / CEILING) * H;
const top = (v: number) => `${(y(v) / H) * 100}%`;

function path(xs: readonly (number | null)[]) {
  let d = "";
  let pen = false;
  xs.forEach((v, i) => {
    if (v === null) {
      pen = false;
      return;
    }
    d += `${pen ? "L" : "M"}${((i / (SAMPLES - 1)) * W).toFixed(1)},${y(v).toFixed(1)} `;
    pen = true;
  });
  return d;
}

/**
 * Every patient's simulated exposure over the last twenty seconds, on the same vertical scale as the gauges.
 *
 * Samples not taken for a patient, because they joined later, are gaps rather than zeroes, so a new patient's
 * line starts where they joined.
 */
export function Chart({
  patients,
  lines,
  marks,
  active,
  pinned,
  onHover,
  onPin,
}: {
  patients: readonly Patient[];
  lines: readonly (readonly (number | null)[])[];
  /** What the reader changed, as a fraction across the plot. */
  marks: readonly (Mark & { x: number })[];
  /** The patient whose line stands out, if any. */
  active: number | null;
  pinned: number | null;
  onHover: (id: number | null) => void;
  onPin: (id: number) => void;
}) {
  const axis = "text-[12px] font-semibold leading-none";
  const tag = "absolute right-1.5 px-1 text-[12px] font-semibold leading-none";

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <span className={L.note} style={{ color: C.inkBody }}>
          Simulated exposure over time
        </span>
        {/* The legend is also the control: point at a patient, or press, and their line comes forward. */}
        <span className="flex flex-wrap gap-1.5">
          {patients.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={pinned === p.id}
              onClick={() => onPin(p.id)}
              onMouseEnter={() => onHover(p.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(p.id)}
              onBlur={() => onHover(null)}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] font-bold leading-none transition-colors"
              style={{
                color: C.ink,
                background: active === p.id ? "#fff" : `${C.paper}b3`,
                border: `1.5px solid ${active === p.id ? C.ink : `${C.ink}40`}`,
                borderRadius: R.full,
              }}
            >
              <LineKey look={p.look} />
              {nameOf(p)}
            </button>
          ))}
        </span>
      </figcaption>

      <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 gap-y-1">
        <div className="flex items-stretch gap-1" style={{ color: C.inkBody }}>
          <span
            className={`${axis} self-center whitespace-nowrap`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Relative drug exposure
          </span>
          <span className={`${axis} flex flex-col justify-between py-0.5 text-right`}>
            <span>high</span>
            <span>0</span>
          </span>
        </div>

        <div
          className="relative h-[120px] overflow-hidden sm:h-[136px] lg:h-[clamp(112px,17vh,168px)]"
          style={{ background: "#fffaf2", border: `2px solid ${C.ink}`, borderRadius: R.sm }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 block h-full w-full"
            role="img"
            aria-label="A chart of each patient's simulated drug exposure over the last twenty seconds, drawn as you work."
          >
            <rect x="0" y="0" width={W} height={y(OVER)} fill={`${C.red}12`} />
            <rect
              x="0"
              y={y(BAND.hi)}
              width={W}
              height={y(BAND.lo) - y(BAND.hi)}
              fill={`${C.green}33`}
            />
            {[BAND.lo, BAND.hi].map((v) => (
              <line
                key={v}
                x1="0"
                y1={y(v)}
                x2={W}
                y2={y(v)}
                stroke={C.green}
                strokeWidth="1.5"
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1="0"
              y1={y(OVER)}
              x2={W}
              y2={y(OVER)}
              stroke={C.red}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            {marks.map((m) => (
              <line
                key={`${m.kind}${m.at}`}
                x1={m.x * W}
                y1="0"
                x2={m.x * W}
                y2={H}
                stroke={C.ink}
                strokeOpacity="0.45"
                strokeWidth="1.2"
                strokeDasharray="2 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {patients.map((p, i) => {
              const l = lookOf(p);
              const on = active === null || active === p.id;
              return (
                <path
                  key={p.id}
                  d={path(lines[i] ?? [])}
                  fill="none"
                  stroke={l.tone}
                  strokeOpacity={on ? 1 : 0.22}
                  strokeWidth={active === p.id ? 4.5 : 2.8}
                  strokeLinejoin="round"
                  strokeDasharray={l.dash}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          <span className={tag} style={{ top: `calc(${top(OVER)} - 16px)`, color: C.ink }}>
            threshold
          </span>
          <span className={tag} style={{ top: `calc(${top(BAND.hi)} + 4px)`, color: C.ink }}>
            target range
          </span>
          {/* What the reader did, at the moment they did it, so a bend in a curve has its cause above it. */}
          {marks.map((m, i) => (
            <span
              key={`${m.kind}${m.at}`}
              className="absolute -translate-x-1/2 whitespace-nowrap px-1 text-[12px] font-semibold leading-none"
              style={{
                // every other one sits a line lower, so two changes close together do not print over each other
                top: i % 2 ? 16 : 2,
                left: `${Math.max(17, Math.min(83, m.x * 100))}%`,
                color: C.ink,
                background: "#fffaf2cc",
              }}
            >
              {m.kind === "dose"
                ? "dose changed"
                : m.kind === "DPD"
                  ? "DPD changed"
                  : "patient added"}
            </span>
          ))}
        </div>

        <span />
        <div className={`${axis} flex justify-between`} style={{ color: C.inkBody }}>
          <span>20 s ago</span>
          <span>Time →</span>
          <span>now</span>
        </div>
        <span />
        <p className="text-[12.5px] leading-snug" style={{ color: C.inkBody }}>
          The same vertical scale as the columns above. It is relative and has no units: it shows
          higher and lower, not an amount.
        </p>
      </div>
    </figure>
  );
}
