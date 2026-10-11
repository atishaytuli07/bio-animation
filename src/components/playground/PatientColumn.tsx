import { Enzyme } from "@/components/hero/elements";
import { C, R } from "@/components/hero/palette";

import {
  BAND,
  CEILING,
  lookOf,
  nameOf,
  OVER,
  scale,
  STATUS,
  statusOf,
  type Patient,
} from "./model";

/** One drug molecule: the same hexagon the story's vessel is full of. */
export function Pip() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
      <polygon
        points="5.5,0.9 10,3.4 10,8.6 5.5,11.1 1,8.6 1,3.4"
        fill={C.coral}
        stroke={C.ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const HAIR = [
  "M21 17 C20 7 26 3 32 3 C38 3 44 7 43 17 C40 12 36 10 32 10 C28 10 24 12 21 17 Z",
  "M19 27 C15 9 24 2 32 2 C40 2 49 9 45 27 C44 17 40 11 32 11 C24 11 20 17 19 27 Z",
  "M21 17 C20 8 26 5 32 5 C38 5 44 8 43 17 C40 12 36 10.5 32 10.5 C28 10.5 24 12 21 17 Z",
  "M20 18 C17 12 20 6 25 6 C26 2 32 1 35 4 C40 2 45 6 44 11 C47 14 45 18 44 18 C41 13 36 10.5 32 10.5 C27 10.5 23 13 20 18 Z",
] as const;

/** Head and shoulders, so the column under it reads as a person's drug level and not a test tube. */
export function Avatar({ look, className }: { look: number; className?: string }) {
  const l = lookOf({ id: 0, activity: 0, look });
  return (
    <svg viewBox="0 0 64 52" className={className} aria-hidden="true">
      <rect
        x="27"
        y="24"
        width="10"
        height="11"
        fill={l.skin}
        stroke={C.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M5 52 C5 39 15 33 32 33 C49 33 59 39 59 52 Z"
        fill={l.tone}
        stroke={C.ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="17" r="11" fill={l.skin} stroke={C.ink} strokeWidth="2.4" />
      {look === 2 && (
        <circle cx="32" cy="3.6" r="3.6" fill={l.hair} stroke={C.ink} strokeWidth="1.6" />
      )}
      <path
        d={HAIR[look] ?? HAIR[0]}
        fill={l.hair}
        stroke={C.ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="18.5" r="1.3" fill={C.ink} />
      <circle cx="36" cy="18.5" r="1.3" fill={C.ink} />
      <path
        d="M28.6 22.4 Q32 25 35.4 22.4"
        fill="none"
        stroke={C.ink}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The patient's line as it is drawn on the chart. */
export function LineKey({ look, width = 18 }: { look: number; width?: number }) {
  const l = lookOf({ id: 0, activity: 0, look });
  return (
    <svg width={width} height="4" viewBox={`0 0 ${width} 4`} aria-hidden="true">
      <line
        x1="0"
        y1="2"
        x2={width}
        y2="2"
        stroke={l.tone}
        strokeWidth="3"
        strokeDasharray={l.dash}
      />
    </svg>
  );
}

// How wide a column may grow. Fewer patients, larger columns, so one patient does not sit alone in an empty panel.
const WIDTH: Record<number, string> = {
  1: "max-w-[150px] sm:max-w-[190px] lg:max-w-[220px]",
  2: "max-w-[140px] sm:max-w-[180px] lg:max-w-[200px]",
  3: "max-w-[124px] sm:max-w-[160px] lg:max-w-[176px]",
  4: "max-w-[110px] sm:max-w-[150px] lg:max-w-[158px]",
};

export function PatientColumn({
  patient,
  count,
  level,
  rate,
  dimmed,
  pinned,
  onPin,
  onActivity,
  onRemove,
  onFocus,
}: {
  patient: Patient;
  /** How many patients share the row. */
  count: number;
  level: number;
  /** How fast the level is changing: positive while it is still rising. */
  rate: number;
  dimmed: boolean;
  /** Whether this patient's line is held forward on the chart. */
  pinned: boolean;
  onPin: () => void;
  onActivity: (n: number) => void;
  onRemove: (() => void) | null;
  onFocus: (on: boolean) => void;
}) {
  const name = nameOf(patient);
  const status = STATUS[statusOf(level)];
  const drawn = Math.round(Math.min(level, CEILING) * 9);
  const moving = Math.abs(rate) > 0.012 && level < CEILING;
  const glow =
    statusOf(level) === "in" ? `${C.green}73` : statusOf(level) === "over" ? `${C.red}73` : null;
  const step = {
    background: "#fff",
    color: C.ink,
    border: `2px solid ${C.ink}`,
    borderRadius: R.sm,
  } as const;

  return (
    <div
      role="group"
      aria-label={`${name}: ${status.word}, simulated DPD activity ${patient.activity} of 5`}
      onMouseEnter={() => onFocus(true)}
      onMouseLeave={() => onFocus(false)}
      onFocus={() => onFocus(true)}
      onBlur={() => onFocus(false)}
      className={`${patient.out ? "bench-out" : "bench-in"} relative flex min-w-0 flex-1 flex-col items-stretch gap-1.5 transition-[max-width,opacity] duration-300 ${WIDTH[count] ?? WIDTH[4]}`}
      style={{ opacity: dimmed ? 0.55 : 1 }}
    >
      {/* Pressing the name holds this patient's line forward on the chart. */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onPin}
          aria-pressed={pinned}
          aria-label={`${name}: highlight on the chart`}
          className="flex min-h-6 items-center justify-center gap-1.5 px-1 py-0.5 sm:px-2"
          style={{
            borderRadius: R.full,
            border: `1.5px solid ${pinned ? C.ink : "transparent"}`,
            background: pinned ? "#fff" : "transparent",
          }}
        >
          <span
            className="whitespace-nowrap text-[12px] font-bold md:text-[13px]"
            style={{ color: C.ink }}
          >
            {name}
          </span>
          <span className={count > 3 ? "hidden xl:block" : "hidden sm:block"}>
            <LineKey look={patient.look} width={16} />
          </span>
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[14px] font-bold leading-none"
            style={{ color: C.inkBody, background: `${C.paper}cc` }}
          >
            ×
          </button>
        )}
      </div>

      <Avatar
        look={patient.look}
        className="relative z-10 -mb-3 h-[44px] w-[54px] shrink-0 self-center md:h-[52px] md:w-[64px]"
      />

      {/* The gauge: this patient's simulated exposure, against the two illustrative marks every patient shares. */}
      <div
        className="relative min-h-0 w-full flex-1 overflow-hidden transition-shadow duration-300"
        aria-hidden="true"
        style={{
          background: "#fffaf2",
          border: `2.5px solid ${C.ink}`,
          borderRadius: R.md,
          boxShadow: glow ? `0 0 0 5px ${glow}` : `0 0 0 0 ${C.green}00`,
        }}
      >
        <span
          className="absolute inset-x-0 top-0 block"
          style={{
            bottom: scale(OVER),
            background: `repeating-linear-gradient(135deg, ${C.red}26 0 2px, ${C.red}0d 2px 8px)`,
          }}
        />
        <span
          className="absolute inset-x-0 block"
          style={{ bottom: scale(OVER), height: 2.5, background: C.red }}
        />
        <span
          className="absolute inset-x-0 block"
          style={{
            bottom: scale(BAND.lo),
            height: scale(BAND.hi - BAND.lo),
            background: `${C.green}33`,
            borderTop: `1.5px dashed ${C.green}`,
            borderBottom: `1.5px dashed ${C.green}`,
          }}
        />
        {/* The level itself: a solid fill with a hard top edge, so it cannot be taken for one of the shaded marks. */}
        <span
          className="absolute inset-x-0 bottom-0 block"
          style={{
            height: scale(level),
            background: `${C.coral}59`,
            borderTop: level > 0.004 ? `3px solid ${C.coral}` : "none",
          }}
        />
        {/* Placed from the index rather than at random, so each molecule keeps its lane as the level moves. */}
        {Array.from({ length: drawn }, (_, i) => (
          <span
            key={i}
            className="absolute block"
            style={{
              left: `${6 + ((i * 53 + 17) % 72)}%`,
              bottom: `calc(${scale(level)} * ${(4 + ((i * 37 + 29) % 84)) / 100})`,
            }}
          >
            <Pip />
          </span>
        ))}
        {/* The two marks named where they are, so nobody has to find the key first. */}
        <span
          className="absolute right-1 text-[12px] font-semibold leading-none"
          style={{ bottom: `calc(${scale(OVER)} + 4px)`, color: C.ink }}
        >
          threshold
        </span>
        <span
          className="absolute right-1 text-[12px] font-semibold leading-none"
          style={{ bottom: `calc(${scale(BAND.hi)} - 16px)`, color: C.ink }}
        >
          target
        </span>
        {moving && (
          <span
            className="absolute left-1.5 text-[12px] font-black leading-none"
            style={{ bottom: `calc(${scale(level)} + 3px)`, color: C.ink }}
          >
            {rate > 0 ? "▲" : "▼"}
          </span>
        )}
      </div>

      <span
        className="flex min-h-[2.4em] items-start justify-center gap-1.5 text-center text-[12px] font-bold leading-tight sm:min-h-0 md:text-[13px]"
        style={{ color: C.ink }}
      >
        <span
          aria-hidden="true"
          className="mt-[2px] block h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300"
          style={{
            background: status.hollow ? "transparent" : status.tone,
            border: `2px solid ${status.hollow ? status.tone : C.ink}`,
          }}
        />
        {status.word}
      </span>

      {/* The one thing about this patient the reader can change, and only here. */}
      <div
        className="flex flex-col items-center gap-1 px-1 pb-1.5 pt-1"
        style={{ background: `${C.paper}d9`, borderRadius: R.sm, border: `1.5px solid ${C.ink}26` }}
      >
        <span
          className="text-center text-[12px] font-semibold leading-tight"
          style={{ color: C.inkBody }}
        >
          Simulated DPD activity
        </span>
        <span className="hidden items-end gap-0.5 sm:flex" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ opacity: i < patient.activity ? 1 : 0.4 }}>
              <Enzyme s={0.16} tone={i < patient.activity ? C.green : "transparent"} line={C.ink} />
            </span>
          ))}
        </span>
        <div className="flex w-full items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => onActivity(patient.activity - 1)}
            disabled={patient.activity === 0}
            aria-label={`${name}: lower simulated DPD activity`}
            className="grid h-7 w-7 shrink-0 place-items-center text-[15px] font-bold leading-none disabled:opacity-35"
            style={step}
          >
            −
          </button>
          <span className="whitespace-nowrap text-[13px] font-bold" style={{ color: C.ink }}>
            {patient.activity}/5
          </span>
          <button
            type="button"
            onClick={() => onActivity(patient.activity + 1)}
            disabled={patient.activity === 5}
            aria-label={`${name}: raise simulated DPD activity`}
            className="grid h-7 w-7 shrink-0 place-items-center text-[15px] font-bold leading-none disabled:opacity-35"
            style={step}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
