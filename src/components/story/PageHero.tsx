import type { CSSProperties, ReactNode } from "react";

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

/**
 * THE ONE OBJECT A PAGE CARRIES, instead of a scatter.
 *
 * The client's note was that floating icons read as random, and she asked for
 * fewer, larger, more meaningful elements — but explicitly not four pages
 * wearing the same picture: "I don't want every hero to look identical. Each
 * page can still have its own visual identity."
 *
 * So each piece is drawn from the site's own vocabulary and says what ITS page
 * is about:
 *
 *   dock    Description  DPD with 5-FU in its cleft — the page's whole subject
 *   cycle   Engineering  the enzyme inside a loop — design, build, test, learn
 *   voices  Human Practices  people of different sizes around one test
 *   result  Safety       a variant found, beside what a partial test never saw
 *   crew    Team         the team's own emblem, at the size of an illustration
 *   handoff Contribution one built thing and its dashed twin — what the next
 *                        team can rebuild from what this one leaves behind
 *
 * Where a page has a character plate the piece is anchored to the figure (see
 * the plate block below); where it has none it sits in the empty right band.
 */
export type Piece = "dock" | "cycle" | "voices" | "result" | "crew" | "handoff";

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
  /** Draw DPD with 5-FU in its cleft beside the figure. See <Dock>. */
  dock?: boolean;
};

/**
 * The arrangement each page uses. Deliberately few, and never behind the copy.
 *
 * WHEN A PAGE HAS A CHARACTER PLATE, THE OBJECTS MOVE rather than scatter over
 * her. (Two later rules narrow this, both measured: on a character page they
 * appear only from xl, where there is room beside the figure; and Description
 * replaces its scatter with one composed object, see <Dock>.) The original
 * fault was placement. These coordinates are percentages of the right-hand 42% band, and
 * the figure occupies roughly x 47→100 of that same band, so anything past 45
 * lands ON her — which is how a molecule ended up in her hair and a cell beside
 * her head.
 *
 * So a plate page keeps its objects and confines them to x 8→42: the corridor
 * between the copy column and the figure, where they read as the space she is
 * standing in rather than as debris stuck to her.
 */
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
  description: { src: "hero-description.webp", lead: 0.5, dock: true },
  /*
    lead 0.5, not 0.55: he holds the test device out in front of him, so his
    painted pixels start earlier than the figure itself. Measured against the
    plate's alpha, the piece beside him overlapped his hands by 237 px at every
    width from 1280 up while `lead` said there was room.
  */
  engineering: { src: "hero-engineering.webp", lead: 0.5 },
} satisfies Record<string, Plate>;

/**
 * DPD with 5-FU in its cleft, labelled.
 *
 * The page's whole subject is one relationship — this enzyme breaks down this
 * drug — and the site already owns both shapes: the green enzyme with its
 * single cleft, the coral pyrimidine ring. Put together they say that before a
 * word is read, which is the difference between an illustration and a
 * decoration.
 *
 * THE LABELS ARE ANNOTATIONS, NOT CHIPS. Paper type with a hairline leader, the
 * way the story labels what it points at. A boxed label with an offset shadow
 * would look pressable, and on this site the offset shadow means exactly that.
 *
 * Geometry: the enzyme is drawn at 1.8×, so its cleft sits at (117, 103) in its
 * own box; the molecule's centre sits 40px right of that and 5px up, which is
 * the fit the prototype was judged on.
 */
function Dock() {
  const label = `${L.note} absolute whitespace-nowrap leading-none`;
  return (
    <div data-dock data-piece className="relative" style={{ width: 230, height: 250 }}>
      <div
        className="absolute"
        style={{ left: 0, top: 28, filter: "drop-shadow(0 8px 14px rgba(36,28,46,0.26))" }}
      >
        <Enzyme s={1.8} tone={C.green} />
      </div>
      <div
        className="absolute"
        style={{ left: 110, top: 78, filter: "drop-shadow(0 6px 10px rgba(36,28,46,0.24))" }}
      >
        <Molecule s={0.95} tone={C.coral} />
      </div>

      {/* 5-FU, above the molecule */}
      <span data-dock-label className={label} style={{ left: 142, top: 30, color: C.paper }}>
        5-FU
      </span>
      <span
        className="absolute block w-[1.5px]"
        style={{ left: 157, top: 46, height: 38, background: `${C.paper}b3` }}
      />

      {/* DPD, below the enzyme */}
      <span
        className="absolute block w-[1.5px]"
        style={{ left: 91, top: 196, height: 20, background: `${C.paper}b3` }}
      />
      <span data-dock-label className={label} style={{ left: 76, top: 222, color: C.paper }}>
        DPD
      </span>
    </div>
  );
}

/** A label in the hero's annotation voice: paper type on a hairline leader. */
function Tag({ children, style }: { children: ReactNode; style: React.CSSProperties }) {
  return (
    <span
      data-piece-label
      className={`${L.note} absolute whitespace-nowrap leading-none`}
      style={{ color: C.paper, ...style }}
    >
      {children}
    </span>
  );
}

function Leader({ style }: { style: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      className="absolute block w-[1.5px]"
      style={{ background: `${C.paper}b3`, ...style }}
    />
  );
}

/**
 * Engineering: the enzyme inside the loop.
 *
 * The page is judged on whether the team went round the design–build–test–learn
 * cycle more than once, and the loop is the shape that says so. The arrow is
 * drawn open, with its head just short of the tail, because a closed ring reads
 * as a logo and an open one reads as motion returning.
 */
function Cycle() {
  return (
    <div data-piece className="relative" style={{ width: 230, height: 230 }}>
      <svg
        viewBox="0 0 230 230"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 8px 14px rgba(36,28,46,0.26))" }}
      >
        <defs>
          <marker
            id="hero-cycle-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={C.paper} />
          </marker>
        </defs>
        <path
          d="M 187 84 A 78 78 0 1 1 84 43"
          fill="none"
          stroke={C.paper}
          strokeOpacity="0.92"
          strokeWidth="4"
          strokeLinecap="round"
          markerEnd="url(#hero-cycle-head)"
        />
      </svg>
      <div className="absolute" style={{ left: 50, top: 50 }}>
        <Enzyme s={1.3} tone={C.green} />
      </div>
      <Leader style={{ left: 115, top: 182, height: 20 }} />
      <Tag style={{ left: 74, top: 208 }}>again</Tag>
    </div>
  );
}

/**
 * Human Practices: the people around one test.
 *
 * Three cells at three sizes, overlapping the way a group does rather than
 * spaced like a diagram. The page's own subject is who the test reaches — the
 * patient, the clinician who acts on the result, the lab that runs it — so the
 * sizes differ and none of them is the same shape twice.
 */
function Voices() {
  return (
    <div data-piece className="relative" style={{ width: 250, height: 210 }}>
      <div
        className="absolute"
        style={{ left: 0, top: 22, filter: "drop-shadow(0 8px 14px rgba(36,28,46,0.24))" }}
      >
        <Cell s={1.15} tone={C.pink} />
      </div>
      <div
        className="absolute"
        style={{ left: 96, top: 0, filter: "drop-shadow(0 6px 12px rgba(36,28,46,0.22))" }}
      >
        <Cell s={0.82} tone={C.blue} />
      </div>
      <div
        className="absolute"
        style={{ left: 120, top: 84, filter: "drop-shadow(0 6px 12px rgba(36,28,46,0.22))" }}
      >
        <Cell s={0.62} tone={C.lavender} />
      </div>
      {/* centred under the group: hung off the left cell it read as a label
          for that one cell rather than for the three of them */}
      <Leader style={{ left: 96, top: 152, height: 22 }} />
      <Tag style={{ left: 42, top: 182 }}>who it reaches</Tag>
    </div>
  );
}

/**
 * Safety: what the test found, and what it never looked at.
 *
 * The same red base tile the story and Figure 1 use, beside an empty dashed
 * one. The page says it plainly — "screening a set of variants tells you about
 * those variants and nothing else" — and this is that sentence as a picture.
 */
function Result() {
  const tile = {
    width: "3.6rem",
    height: "3.9rem",
    fontSize: "2rem",
  } as const;
  return (
    <div data-piece className="relative" style={{ width: 250, height: 200 }}>
      <span
        className="absolute inline-flex items-center justify-center rounded-[8px] font-mono font-bold"
        style={{
          ...tile,
          left: 24,
          top: 40,
          background: C.red,
          color: "#fff",
          border: `3px solid ${C.ink}`,
          boxShadow: `4px 4px 0 ${C.ink}`,
        }}
      >
        A
      </span>
      <span
        className="absolute inline-flex items-center justify-center rounded-[8px] font-mono font-bold"
        style={{
          ...tile,
          left: 118,
          top: 40,
          color: `${C.paper}66`,
          border: `3px dashed ${C.paper}80`,
        }}
      >
        ?
      </span>
      {/* one baseline for both, equal leaders: the pair is a comparison, and
          staggering them read as a layout accident rather than a composition */}
      <Leader style={{ left: 53, top: 110, height: 22 }} />
      <Tag style={{ left: 12, top: 140 }}>screened</Tag>
      <Leader style={{ left: 160, top: 110, height: 22 }} />
      <Tag style={{ left: 108, top: 140 }}>not screened</Tag>
    </div>
  );
}

/**
 * Team: the emblem, as an illustration rather than as chrome.
 *
 * Every other page's piece is drawn from the science; this page is about the
 * people, and the one mark that belongs to them is their own. It sits on the
 * white chip the header uses, because the supplied artwork is transparent
 * wherever it should be white and loses its structure on the purple field.
 */
function Crew() {
  return (
    <div
      data-piece
      className="relative grid place-items-center overflow-hidden rounded-full"
      style={{
        width: 190,
        height: 190,
        background: "#fff",
        boxShadow: `0 18px 30px rgba(36,28,46,0.28), 0 0 0 3px ${C.ink}1f`,
      }}
    >
      <img
        src={asset("logo-mark.webp")}
        alt=""
        draggable={false}
        className="h-[150px] w-auto select-none"
      />
    </div>
  );
}

/**
 * Contribution: the built thing, and its dashed twin.
 *
 * Bronze #3 asks what a future team can take and use. Solid is what this team
 * made; dashed is the same shape in someone else's hands, which is the whole
 * point of documenting it. The dashed outline is the vocabulary the story
 * already uses for an enzyme slot that is not filled yet.
 */
function Handoff() {
  return (
    <div data-piece className="relative" style={{ width: 240, height: 200 }}>
      <div
        className="absolute"
        style={{ left: 0, top: 24, filter: "drop-shadow(0 8px 14px rgba(36,28,46,0.26))" }}
      >
        <Enzyme s={1.15} tone={C.green} />
      </div>
      <div className="absolute" style={{ left: 104, top: 24, opacity: 0.55 }}>
        <Enzyme s={1.15} tone="transparent" line={`${C.paper}cc`} />
      </div>
      <Leader style={{ left: 58, top: 150, height: 20 }} />
      <Tag style={{ left: 20, top: 178 }}>ours</Tag>
      <Leader style={{ left: 162, top: 150, height: 20 }} />
      <Tag style={{ left: 120, top: 178 }}>theirs to reuse</Tag>
    </div>
  );
}

function PieceArt({ piece }: { piece: Piece }) {
  if (piece === "handoff") return <Handoff />;
  if (piece === "cycle") return <Cycle />;
  if (piece === "voices") return <Voices />;
  if (piece === "result") return <Result />;
  if (piece === "crew") return <Crew />;
  return <Dock />;
}

export function PageHero({
  title,
  lede,
  plate,
  piece,
}: {
  title: string;
  lede: string;
  /** The one composed object this page carries. See Piece above. */
  piece?: Piece | undefined;
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
    /*
      A NAMED REGION. The hero sits outside <main>, so without a name its badge,
      title and lede belong to no landmark at all and a screen reader reaches
      them only by walking the whole document. Named by its own <h1>.
    */
    <section
      aria-labelledby="page-hero-title"
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
      {/*
        SHE APPEARS ON PHONES TOO.

        This was `hidden md:block`, so a phone got badge, title, two rules and a
        lede panel on flat purple with nothing else — the emptiest screen on the
        site, on the device most readers will use. The figure is the reason
        these heroes stopped looking templated, and hiding it below 768px threw
        that away exactly where it was needed most.

        She is smaller there and anchored to the bottom-right corner, and the
        copy block carries extra bottom padding on mobile so the two occupy
        different bands instead of the same one.
      */}
      {plate && (
        <div
          aria-hidden={plate.alt ? undefined : "true"}
          /*
            TABLETS STAND HER IN THE CORNER, like phones do.

            Full height began at md, and at 768px that put her DNA and arm
            across the right third of the lede panel — measured, the plate
            reached x 446 against a lede ending at 651. From lg the copy and
            the figure fit side by side; below it they cannot, so she stands
            under the copy instead of on it.
          */
          className="pointer-events-none absolute bottom-0 right-0 block h-[152px] md:h-[250px] lg:h-[92%]"
        >
          {piece && (
            /*
              ANCHORED TO THE FIGURE, NOT TO THE PAGE.

              `lead` is where she starts inside the plate, so the pair's right
              edge is placed a fixed gap left of that — wherever the plate
              lands, the pair cannot land on her. Placed by percentage of the
              page instead, the old scattered objects ended up on her chest at
              1024px and on the lede panel at 768px.

              Shown from xl only. Measured, the space between the lede and her
              is 288px at 1280, 445 at 1440 and 700 at 1920 — and below 1280 it
              is nothing: the plate already reaches the copy. An object with no
              room is the clutter this replaced, so below xl there is none.
            */
            <div
              className="absolute hidden xl:block"
              style={{
                right: `calc(${((1 - (plate.lead ?? 0.5)) * 100).toFixed(1)}% + 28px)`,
                top: "26%",
                transform: `translateY(${(Math.sin(t * 0.32 + 1.7) * 6).toFixed(2)}px) rotate(${(Math.sin(t * 0.22) * 1.6).toFixed(2)}deg)`,
              }}
            >
              <PieceArt piece={piece} />
            </div>
          )}
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
        A PAGE WITHOUT A CHARACTER still gets its one object, centred in the
        band the scatter used to fill. From lg: at 768 the copy column is the
        full width and the band overlaps it.
      */}
      {piece && !plate && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-1/2 hidden lg:block xl:right-[10%]"
          style={{
            transform: `translateY(-50%) translateY(${(Math.sin(t * 0.32 + 1.7) * 6).toFixed(2)}px) rotate(${(Math.sin(t * 0.22) * 1.4).toFixed(2)}deg)`,
          }}
        >
          <PieceArt piece={piece} />
        </div>
      )}

      {/*
        AND IT STANDS IN THE CORNER ON SMALL SCREENS, the way a character does.

        Below lg the piece cannot sit beside the copy — the column is the full
        width — and for a while that meant a phone got badge, title, two rules
        and a lede panel on flat purple with nothing else. That is the emptiest
        screen on the site, on the device most readers use, and it is the same
        mistake the character plates already had to undo.

        Scaled from its bottom-right corner so the drawing keeps its
        proportions, and the copy block below carries the matching padding so
        the two occupy different bands rather than the same one.
      */}
      {piece && !plate && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-5 right-5 origin-bottom-right scale-[0.6] md:scale-[0.78] lg:hidden"
          style={{
            // Tailwind v4 scales with the `scale` property, so this is drift only
            transform: `translateY(${(Math.sin(t * 0.32 + 1.7) * 4).toFixed(2)}px)`,
          }}
        >
          <PieceArt piece={piece} />
        </div>
      )}

      {/*
        `pb-40` on mobile only when a plate is present: it is the band the
        figure stands in, so the lede is not sharing a corner with her.
      */}
      <div
        className={`relative mx-auto max-w-[92rem] px-6 pt-14 md:px-10 md:py-20 ${plate ? "pb-40 md:pb-[17rem]" : piece ? "pb-[11rem] md:pb-[13rem]" : "pb-14 md:pb-20"} lg:pb-20`}
      >
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

          <h1
            id="page-hero-title"
            className="mt-6 font-black md:mt-8"
            style={{ ...T.display, color: C.paper }}
          >
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
