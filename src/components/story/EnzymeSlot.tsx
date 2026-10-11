import { C, ENZYME_PATH } from "@/components/hero/palette";

// One DPD enzyme as it is drawn everywhere outside the vessel itself: in the enzyme scene's two rows, on each
// patient's label, and in every key that explains the dashed outline. One component, so the key always matches
// the thing it is a key to.

/**
 * Solid green when the enzyme is made, a dashed outline when it is not. `made` runs 1 to 0, so a slot can be
 * shown losing its enzyme.
 */
export function Slot({ made, small }: { made: number; small?: boolean }) {
  const gone = made < 0.5;
  return (
    <svg
      // the path's own box, with room for the stroke
      viewBox="9 8 62 67"
      className={small ? "w-4 shrink-0 md:w-5" : "w-9 shrink-0 md:w-[52px]"}
      aria-hidden="true"
    >
      <path
        d={ENZYME_PATH}
        fill={C.green}
        // quantised, like every other scroll-driven fade here: a step nobody can see is a repaint saved
        fillOpacity={Math.round(made * 20) / 20}
        stroke={C.ink}
        strokeWidth="4"
        strokeDasharray={gone ? "8 8" : undefined}
        strokeLinejoin="round"
        strokeOpacity={gone ? 0.75 : 1}
      />
    </svg>
  );
}
