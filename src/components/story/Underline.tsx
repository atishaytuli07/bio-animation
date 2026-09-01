import { C } from "@/components/hero/palette";

/**
 * A hand-drawn underline, the signature detail of Wuxi's navigation.
 *
 * The point is that it is NOT a straight rule. Each one is a slightly
 * different squiggle — the control points are derived from the item's index so
 * no two match — which is what makes it read as drawn by a person rather than
 * generated. It also overshoots the word at both ends, the way a marker stroke
 * does.
 *
 * IT LIVES HERE BECAUSE TWO HEADERS NEED IT. It was defined inside the story
 * route, so the documentation pages — which are the ones a reader actually
 * navigates between — had no way to say which page they were on. The site had
 * a "you are here" mark on the one page that does not need it and none on the
 * five that do.
 *
 * The parent must be `relative` and leave room below the text (`pb-2`), since
 * this is absolutely positioned against it.
 */
export function Underline({ index, active = false }: { index: number; active?: boolean }) {
  const wob = ((index * 37) % 7) - 3; // −3…3, deterministic per item
  const lift = ((index * 23) % 5) - 2;
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-8%] bottom-0 h-[9px] w-[116%] origin-left transition-[opacity,transform] duration-300"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "scaleX(1)" : "scaleX(0.55)",
      }}
      data-underline=""
    >
      <path
        d={`M2 ${6 + lift * 0.3} C 24 ${3 + wob}, 48 ${8 - wob * 0.6}, 72 ${5 + wob * 0.4} S 92 ${7 - lift * 0.4}, 98 ${5 + lift * 0.2}`}
        fill="none"
        stroke={C.coral}
        strokeWidth={3.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
