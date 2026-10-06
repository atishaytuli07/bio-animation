import { C } from "@/components/hero/palette";

// A hand-drawn underline, the signature detail of Wuxi's navigation. The point is that it is not a straight
// rule: the control points are derived from the item's index so no two squiggles match, and it overshoots the
// word at both ends the way a marker stroke does.
// It lives here because two headers need it. Defined inside the story route, the documentation pages, which are
// the ones a reader actually navigates between, had no way to say which page they were on.
// The parent must be relative and leave room below the text (pb-2), since this is absolutely positioned.
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
