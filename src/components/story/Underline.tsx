import { C } from "@/components/hero/palette";

// The mark under the page you are on, and under a link you are pointing at.
// A straight ink rule. It used to be a hand-drawn coral squiggle, a different wobble for every item: the only
// wavy line on a site drawn entirely in straight hairlines and ink outlines, and in the colour that means the
// drug everywhere else. The client's note was that it should belong to the same system as everything around it.
// It lives here because two headers need it. The parent must be relative and leave room below the text (pb-2),
// since this is absolutely positioned.
export function Underline({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 block h-[2.5px] origin-left rounded-full transition-[opacity,transform] duration-300"
      style={{
        background: C.ink,
        opacity: active ? 1 : 0,
        transform: active ? "scaleX(1)" : "scaleX(0.55)",
      }}
      data-underline=""
    />
  );
}
