import type { ReactNode } from "react";

import { C, L, R } from "@/components/hero/palette";
import { useSeen } from "@/hooks/use-seen";

/**
 * A figure on a content page.
 *
 * The judging reality this is built for: a judge opens dozens of wikis in a
 * day, and almost all of them are a hero image followed by walls of prose that
 * re-explain what their homepage already showed. The pages that stand out are
 * the ones where a diagram does the work a paragraph was doing.
 *
 * We are in an unusual position to do that, because the story already contains
 * the diagrams. Reusing them here — small, still, in place — is worth more
 * than describing them again, and it makes the documentation feel like part of
 * the same project rather than an appendix to it.
 *
 * ON THE ANIMATION. Everything reveals ONCE, on entry, and then stops. The
 * giveaway of a generated site is every paragraph fading up on scroll; motion
 * that repeats every time you pass it is noise. A figure that draws itself the
 * first time you reach it is a reward for arriving. Nothing else on these
 * pages moves, and prefers-reduced-motion turns even this off.
 */

export function Figure({
  label,
  caption,
  children,
}: {
  /** The figure's short name, e.g. "Figure 1 · the splice site". */
  label: string;
  caption: string;
  children: ReactNode;
}) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <figure
      ref={ref}
      className="my-8 md:my-10"
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "translateY(0)" : "translateY(10px)",
        transition:
          "opacity 600ms cubic-bezier(.22,1,.36,1), transform 600ms cubic-bezier(.22,1,.36,1)",
      }}
    >
      <div
        className="overflow-hidden rounded-[10px]"
        style={{ background: `${C.lavender}14`, border: `2px solid ${C.ink}1f` }}
      >
        <div className="px-4 py-7 md:px-7 md:py-9">{children}</div>
      </div>
      <figcaption className="mt-3">
        <span className={L.note} style={{ color: C.redDeep }}>
          {label}
        </span>
        <span
          className="mt-1 block max-w-[58ch] text-[14px] leading-relaxed md:text-[15px]"
          style={{ color: C.inkNote }}
        >
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}
