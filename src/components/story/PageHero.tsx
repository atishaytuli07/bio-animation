import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { asset, C, L, T, R } from "@/components/hero/palette";
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

/**
 * An illustrated character plate for a page hero.
 *
 * THE TITLE IS NEVER PART OF THE IMAGE. Several of these were generated with
 * the page name drawn into the artwork — a person holding a "DESCRIPTION" sign
 * — and they cannot be used that way. Raster type is invisible to a screen
 * reader, soft at any size but its native one, locked to a typeface that is not
 * ours, and impossible to change when the display face is chosen. The plate
 * carries the picture; the heading stays live HTML on top of it.
 *
 * The plates are cutouts with real alpha, so they sit on the purple field
 * rather than in a box on it. `lead` is the horizontal share of the image the
 * figure actually occupies, which is how the copy column knows how much room it
 * has before the two would collide.
 */
export type Plate = {
  /** Path in public/, resolved through asset() for the wiki's base path. */
  src: string;
  /** Empty: this is decorative and the heading beside it carries the meaning. */
  alt?: string;
  /** Roughly where the figure starts, as a fraction of the plate's width. */
  lead?: number;
};

/**
 * The arrangement each page uses. Deliberately few, and never behind the copy.
 *
 * WHEN A PAGE HAS A CHARACTER PLATE, THE OBJECTS MOVE — they do not disappear.
 * Removing them entirely was tried and it was the wrong fix: the page lost the
 * depth that ties it to the story's travelling world. The actual fault was
 * placement. These coordinates are percentages of the right-hand 42% band, and
 * the figure occupies roughly x 47→100 of that same band, so anything past 45
 * lands ON her — which is how a molecule ended up in her hair and a cell beside
 * her head.
 *
 * So a plate page keeps its objects and confines them to x 8→42: the corridor
 * between the copy column and the figure, where they read as the space she is
 * standing in rather than as debris stuck to her.
 */
export const ART = {
  description: [
    { k: "cell", x: 14, y: 22, s: 0.92, tone: C.pink },
    { k: "mol", x: 34, y: 12, s: 0.6, tone: C.coral },
    { k: "enz", x: 8, y: 62, s: 0.66, tone: C.green },
    { k: "mol", x: 30, y: 78, s: 0.5, tone: C.coral },
    { k: "cell", x: 42, y: 44, s: 0.46, tone: C.blue },
  ],
  engineering: [
    { k: "enz", x: 16, y: 20, s: 0.86, tone: C.green },
    { k: "enz", x: 38, y: 40, s: 0.5, tone: C.green },
    { k: "mol", x: 10, y: 62, s: 0.62, tone: C.coral },
    { k: "cell", x: 32, y: 80, s: 0.54, tone: C.lavender },
    { k: "mol", x: 40, y: 10, s: 0.44, tone: C.coral },
  ],
  generic: [
    { k: "cell", x: 30, y: 26, s: 1.0, tone: C.pink },
    { k: "mol", x: 66, y: 20, s: 0.75, tone: C.coral },
    { k: "enz", x: 60, y: 62, s: 0.85, tone: C.green },
    { k: "cell", x: 24, y: 72, s: 0.62, tone: C.blue },
  ],
} satisfies Record<string, Art>;

/**
 * The character plate each page opens with, where one exists.
 *
 * One rule decides whether a plate earns its place: it has to say something
 * about THIS page before the reader has read a word. A scientist holding a DNA
 * strand belongs on Description, whose whole subject is what one letter of it
 * does. The same figure holding a sign that reads "Description" would say only
 * what the heading beside it already says, which is decoration.
 */
export const PLATE = {
  description: { src: "hero-description.webp", lead: 0.5 },
  engineering: { src: "hero-engineering.webp", lead: 0.55 },
} satisfies Record<string, Plate>;

export function PageHero({
  title,
  lede,
  art,
  plate,
}: {
  title: string;
  lede: string;
  art: Art;
  /* `| undefined` explicitly: exactOptionalPropertyTypes is on, so a caller
     forwarding an absent plate is passing undefined, not omitting the key. */
  plate?: Plate | undefined;
}) {
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

      {/*
        THE CHARACTER PLATE.

        Anchored to the bottom-right and allowed to run to the section's floor,
        so she stands IN the hero rather than floating in a panel on it. The
        left half of the plate is transparent, which is where the badge, the
        heading and the lede sit — the composition is the reason this particular
        plate was chosen over the others.

        NO MASK. There was a left-to-right gradient here to blend the cutout's
        glow into the field, and it was eating the DNA strand she is holding —
        the one part of the plate that carries the page's meaning. The alpha the
        generator produced is already soft at the edges, so there is nothing to
        blend; the mask was solving a problem that did not exist and creating
        one that did.
      */}
      {plate && (
        <div
          aria-hidden={plate.alt ? undefined : "true"}
          className="pointer-events-none absolute bottom-0 right-0 hidden h-[92%] md:block"
        >
          <img
            src={asset(plate.src)}
            alt={plate.alt ?? ""}
            draggable={false}
            className="h-full w-auto select-none object-contain object-bottom"
            style={{
              /*
                A whisper of drift, on the same clock and at the same amplitude
                as the objects around her. Without it she is a sticker on a
                moving background; with it she is in the same room.
              */
              transform: `translateY(${(Math.sin(t * 0.26) * 4).toFixed(2)}px)`,
              filter: "drop-shadow(0 18px 26px rgba(36,28,46,0.28))",
            }}
          />
        </div>
      )}

      {/*
        The scattered elements. They stay on plate pages — see ART above for why
        their coordinates change instead. On a plate page they sit slightly back
        so the figure stays the subject, but they are still there: they are what
        connects this hero to the world travelling through the whole story.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] md:block"
        style={plate ? { opacity: 0.72 } : undefined}
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
            className={`inline-block rounded-[6px] px-3 py-1.5 ${L.note}`}
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
            className="mt-7 max-w-[54ch] rounded-[10px] px-5 py-4 text-[15px] leading-relaxed md:mt-9 md:text-[17px]"
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
