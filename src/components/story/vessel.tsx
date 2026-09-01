import { C, ENZYME_PATH } from "@/components/hero/palette";

/**
 * The blood vessel, shared.
 *
 * Two scenes now show the same vessel — "Inside the body", where a standard
 * dose accumulates, and "Before the first dose", where the identical vessel
 * is replayed with a dose matched to the test result and stays clear. The
 * whole argument of the second scene is that NOTHING has changed except the
 * dose, so the two must be the same object, drawn from the same numbers. Two
 * copies of this geometry would drift within a week and quietly destroy the
 * comparison the section exists to make.
 *
 * Coordinates are the vessel's own space; callers render their contents inside
 * the same viewBox.
 */

export const W = 360;
export const H = 520;
export const TOP = 10;
export const BOT = 492;
/** Where the enzyme should be — the midpoint both scenes reference. */
export const EY = 272;

/** The lumen: two soft walls, drawn as one closed path so it can be filled. */
const LUMEN =
  "M32 0 C 12 130, 52 260, 32 390 C 18 460, 38 500, 32 520 L 328 520 C 322 500, 342 460, 328 390 C 308 260, 348 130, 328 0 Z";
const WALL_L = "M32 0 C 12 130, 52 260, 32 390 C 18 460, 38 500, 32 520";
const WALL_R = "M328 0 C 348 130, 308 260, 328 390 C 342 460, 322 500, 328 520";

/**
 * The enzyme's outline, at the origin; positioned by its parent.
 *
 * The shape itself now lives in palette.ts as ENZYME_PATH, because it is drawn
 * in three places and used to be drawn three different ways. See the comment
 * there. Re-exported under the local name so the scenes that already import it
 * from here do not have to care where it moved to.
 */
export const ENZYME = ENZYME_PATH;

/** Red cells drifting past, so the tube reads as a blood vessel. */
export const RBC = Array.from({ length: 11 }, (_, i) => ({
  x: ((i * 0.37) % 1) * 0.9,
  phase: (i * 0.143) % 1,
  r: 19 + ((i * 5) % 4) * 4,
  rot: (i * 53) % 180,
}));

/** A drug molecule, drawn natively in the vessel's units. */
export function Hex({
  x,
  y,
  r,
  tone,
  o = 1,
}: {
  x: number;
  y: number;
  r: number;
  tone: string;
  o?: number;
}) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r] as const;
  });
  return (
    <g opacity={o}>
      <polygon
        points={pts.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ")}
        fill={tone}
        stroke={C.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {pts.map((pt, i) => (
        <circle
          key={i}
          cx={pt[0]}
          cy={pt[1]}
          r={r * 0.22}
          fill={C.paper}
          stroke={C.ink}
          strokeWidth="1.6"
        />
      ))}
    </g>
  );
}

/**
 * The lumen, its walls and the cells drifting through it.
 *
 * `id` must be unique per instance: the fade mask is referenced by url(#…),
 * and two scenes mounted at once with the same id would have the second
 * silently steal the first's mask.
 */
export function VesselShell({
  id,
  lit,
  flow,
  phase,
}: {
  id: string;
  /** Brightens under the pointer, where a scene offers a hold. */
  lit?: boolean;
  flow: number;
  phase: number;
}) {
  return (
    <>
      <defs>
        {/*
          Fade top and bottom. Without it the lumen ends in two flat horizontal
          edges and reads as a cut-out strip rather than a vessel running on
          through the body.
        */}
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.14" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.86" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width={W} height={H} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>

      <g mask={`url(#${id}-mask)`}>
        {/* Lit, not tinted: a pink lumen on the pink ground vanished. */}
        <path
          d={LUMEN}
          fill={`${C.paper}${lit ? "9e" : "7a"}`}
          style={{ transition: "fill 300ms ease" }}
        />
        <path d={WALL_L} fill="none" stroke={C.ink} strokeWidth="3" />
        <path d={WALL_R} fill="none" stroke={C.ink} strokeWidth="3" />
      </g>

      {/*
        Red cells. The client called this "the enlarged vessel-like area" — she
        could not tell what it was, and a plain tube is not a blood vessel to
        anyone. Discs drifting past make it one instantly, and they are a
        different SHAPE from the drug, not just a different colour, so the two
        can never be confused at a glance.
      */}
      {flow > 0.01 &&
        RBC.map((c, i) => {
          const s = (((phase * 0.09 + c.phase) % 1) + 1) % 1;
          /*
            A LANE THAT IS NOT STRAIGHT.

            The cells used to fall down exact vertical lines, which is what made
            the lumen read as a container rather than as a vessel — the client's
            note. Each one now drifts sideways on its own slow sine, offset by
            its index, and rotates a little as it travels. It is a few pixels of
            movement and it is the difference between falling and flowing.
          */
          const sway = Math.sin(phase * 0.42 + i * 1.7) * 13;
          const cx = 60 + c.x * 240 + sway;
          const cy = TOP + s * (BOT - TOP);
          return (
            <g
              key={`r${i}`}
              opacity={flow * 0.5}
              transform={`rotate(${(c.rot + Math.sin(phase * 0.3 + i) * 9).toFixed(1)} ${cx} ${cy})`}
            >
              <ellipse cx={cx} cy={cy} rx={c.r} ry={c.r * 0.62} fill={C.pink} opacity="0.85" />
              <ellipse
                cx={cx}
                cy={cy}
                rx={c.r * 0.45}
                ry={c.r * 0.26}
                fill={C.red}
                opacity="0.18"
              />
            </g>
          );
        })}
    </>
  );
}
