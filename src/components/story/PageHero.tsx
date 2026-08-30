import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { C, L, T } from "@/components/hero/palette";
import { useTime } from "@/hooks/use-scroll-progress";

/**
 * The header block every content page opens with.
 *
 * The first version of these pages went straight to an <h1> on cream. It was
 * honest and it was plain, and the client's note was exactly right: the
 * documentation pages do not need the homepage's scroll-storytelling, but they
 * do need to look like they belong to the same site. Competing 2026 wikis open
 * every page with a composed hero — a badge, a display title with a rule
 * treatment, an illustration — and next to those a bare heading reads as a
 * draft.
 *
 * So this is a hero built from vocabulary the site already owns: the lavender
 * field from the story's opening screen, the ink-outlined cells, molecules and
 * enzymes that travel through the whole animation, and the same badge, rule
 * and offset-shadow language. No new visual ideas — a reader arriving here
 * from the story should recognise the place immediately.
 *
 * The illustration is code-drawn from those same elements rather than a new
 * asset per page, so a page costs a config object and nothing else.
 */

/** Per-page illustration, composed from the shared elements. */
export type Art = { k: "cell" | "mol" | "enz"; x: number; y: number; s: number; tone: string }[];

/** The arrangement each page uses. Deliberately few, and never behind the copy. */
export const ART = {
  description: [
    { k: "cell", x: 26, y: 24, s: 1.15, tone: C.pink },
    { k: "mol", x: 62, y: 14, s: 0.8, tone: C.coral },
    { k: "enz", x: 72, y: 52, s: 0.9, tone: C.green },
    { k: "mol", x: 38, y: 68, s: 0.62, tone: C.coral },
    { k: "cell", x: 82, y: 80, s: 0.7, tone: C.blue },
  ],
  engineering: [
    { k: "enz", x: 30, y: 22, s: 1.05, tone: C.green },
    { k: "enz", x: 66, y: 30, s: 0.7, tone: C.green },
    { k: "mol", x: 46, y: 56, s: 0.9, tone: C.coral },
    { k: "cell", x: 76, y: 70, s: 0.85, tone: C.lavender },
    { k: "mol", x: 22, y: 74, s: 0.6, tone: C.coral },
  ],
  generic: [
    { k: "cell", x: 30, y: 26, s: 1.0, tone: C.pink },
    { k: "mol", x: 66, y: 20, s: 0.75, tone: C.coral },
    { k: "enz", x: 60, y: 62, s: 0.85, tone: C.green },
    { k: "cell", x: 24, y: 72, s: 0.62, tone: C.blue },
  ],
} satisfies Record<string, Art>;

export function PageHero({ title, lede, art }: { title: string; lede: string; art: Art }) {
  /*
    The elements drift, slowly, the way they do on the homepage. This is the
    only motion on a content page and it is nearly imperceptible by design —
    enough that the header is alive rather than a screenshot, not enough to
    pull the eye off the title. Everything else here is still.
  */
  const t = useTime(true);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(158deg, ${C.lavenderDeep}, color-mix(in oklab, ${C.lavenderDeep} 76%, ${C.ink}))`,
      }}
    >
      {/* the stripes the story's field carries, so this reads as the same room */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(102deg, rgba(255,255,255,0.06) 0 3px, transparent 3px 26px)",
        }}
      />
      {/* light from above the subject, the same rule the story's ground uses */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 70% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
        }}
      />

      {/* the illustration, right half only, never under the copy */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] md:block"
      >
        {art.map((a, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${a.x}%`,
              top: `${a.y}%`,
              transform: `translate(-50%,-50%) translateY(${(Math.sin(t * 0.32 + i * 1.7) * 7).toFixed(2)}px) rotate(${((i * 47) % 40) - 20 + Math.sin(t * 0.22 + i) * 2}deg)`,
              filter: `drop-shadow(0 6px 12px rgba(36,28,46,0.22))`,
            }}
          >
            {a.k === "cell" ? (
              <Cell s={a.s} tone={a.tone} />
            ) : a.k === "mol" ? (
              <Molecule s={a.s} tone={a.tone} />
            ) : (
              <Enzyme s={a.s} tone={a.tone} />
            )}
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-[92rem] px-6 py-14 md:px-10 md:py-20">
        <div className="max-w-[46rem]">
          {/* the badge, in the site's paper/ink/offset-shadow language */}
          <span
            className={`inline-block rounded-md px-3 py-1.5 ${L.note}`}
            style={{
              background: C.paper,
              color: C.ink,
              border: `2.5px solid ${C.ink}`,
              boxShadow: `3px 3px 0 ${C.ink}`,
            }}
          >
            ChemoGuard · iGEM 2026
          </span>

          <h1 className="mt-6 font-black md:mt-8" style={{ ...T.display, color: C.paper }}>
            {title}
          </h1>

          {/*
            Two rules under the title, offset from each other. The competing
            wikis all use some version of this and it is what makes a title
            read as designed rather than typed; here it is in our own red and
            paper rather than their orange and blue.
          */}
          <div className="mt-5 space-y-1.5 md:mt-7">
            <div
              className="h-[5px] w-[min(26rem,80%)] rounded-full"
              style={{ background: C.red }}
            />
            <div
              className="h-[5px] w-[min(20rem,64%)] rounded-full"
              style={{ background: `${C.paper}88` }}
            />
          </div>

          <p
            className="mt-7 max-w-[54ch] rounded-lg px-5 py-4 text-[15px] leading-relaxed md:mt-9 md:text-[17px]"
            style={{
              background: `${C.ink}3d`,
              border: `2px solid ${C.paper}3d`,
              color: C.paper,
            }}
          >
            {lede}
          </p>
        </div>
      </div>
    </section>
  );
}
