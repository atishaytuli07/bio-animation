import type { CSSProperties, ReactNode } from "react";

import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { asset, C, L, T } from "@/components/hero/palette";
import { SlideBackdrop, SlideFrame, type Slide } from "@/components/story/HeroCarousel";
import { useCarousel } from "@/hooks/use-carousel";
import { useTime } from "@/hooks/use-scroll-progress";

// The hero every documentation page opens with: badge, title, two rules, lede panel, and one drawn object.
// It uses the story's own shapes and colours so the pages read as one site.

// The one object a page carries. Each page gets a different one, because the client asked for fewer and
// larger elements but not four heroes that look the same.
//   dock     Description       DPD with 5-FU in its cleft
//   cycle    Engineering       the enzyme inside a loop: design, build, test, learn
//   voices   Human Practices   three people of different sizes around one test
//   result   Safety            a variant screened, beside what the test never looked at
//   handoff  Contribution      one built thing and its dashed twin, for the next team
// With a character it hangs beside the figure; without one it sits in the empty right band.
export type Piece = "dock" | "cycle" | "voices" | "result" | "handoff";

// An illustrated character for a page hero. Never use a plate with the page name drawn into the artwork:
// image text cannot be read by a screen reader, blurs when scaled and cannot follow the site's typeface.
// Plates are cutouts with real transparency, so they stand on the purple field instead of sitting in a box.
export type Plate = {
  /** Path in public/, resolved through asset() for the wiki's base path. */
  src: string;
  // Empty: the picture is decorative and the heading beside it carries the meaning.
  alt?: string;
  // Where the figure's painted pixels start, as a fraction of the image width. The piece beside it is placed from this.
  lead?: number;
};

// The character each page opens with. A plate has to say something about its own page: a scientist holding
// a DNA strand belongs on Description, whose subject is what one letter of it does.
export const PLATE = {
  description: { src: "hero-description.webp", lead: 0.5 },
  // lead 0.5, not 0.55: he holds the device out in front of him. At 0.55 the piece overlapped his hands by 237px.
  engineering: { src: "hero-engineering.webp", lead: 0.5 },
} satisfies Record<string, Plate>;

// Description: DPD with 5-FU in its cleft. Labels are plain text on a thin line, not boxes, because a box
// with an offset shadow means "pressable" everywhere else on this site.
// The enzyme is drawn at 1.8x, so its cleft sits at (117, 103) and the molecule centre 40px right, 5px up.
function Dock() {
  const label = `${L.note} absolute whitespace-nowrap leading-none`;
  return (
    <div data-piece className="relative" style={{ width: 230, height: 250 }}>
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

      {/* 5-FU, above the molecule. */}
      <span data-piece-label className={label} style={{ left: 142, top: 30, color: C.paper }}>
        5-FU
      </span>
      <span
        className="absolute block w-[1.5px]"
        style={{ left: 157, top: 46, height: 38, background: `${C.paper}b3` }}
      />

      {/* DPD, below the enzyme. */}
      <span
        className="absolute block w-[1.5px]"
        style={{ left: 91, top: 196, height: 20, background: `${C.paper}b3` }}
      />
      <span data-piece-label className={label} style={{ left: 76, top: 222, color: C.paper }}>
        DPD
      </span>
    </div>
  );
}

// A label for a piece: paper-coloured text on a thin line.
function Tag({ children, style }: { children: ReactNode; style: CSSProperties }) {
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

// Engineering: the enzyme inside a loop. The page is judged on going round the cycle more than once, so the
// arrow is left open rather than closed: a closed ring reads as a logo, an open one as motion coming back.
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

// Human Practices: three cells at three sizes, overlapping like a group rather than spaced like a diagram.
// The page is about who the test reaches: the patient, the clinician who acts on the result, the lab that runs it.
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
      {/* Centred under the group: off to one side it looked like a label for one cell. */}
      <Leader style={{ left: 96, top: 152, height: 22 }} />
      <Tag style={{ left: 42, top: 182 }}>who it reaches</Tag>
    </div>
  );
}

// Safety: the red base tile from the story beside an empty dashed one. It is the page's own sentence as a
// picture: screening a set of variants tells you about those variants and nothing else.
function Result() {
  const tile = {
    width: "3.6rem",
    height: "3.9rem",
    fontSize: "2rem",
  } as const;
  return (
    <div data-piece className="relative" style={{ width: 250, height: 200 }}>
      <span
        className="absolute inline-flex items-center justify-center rounded-[6px] font-mono font-bold"
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
        className="absolute inline-flex items-center justify-center rounded-[6px] font-mono font-bold"
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
      {/* One baseline for both: staggered, they read as a layout accident rather than a comparison. */}
      <Leader style={{ left: 53, top: 110, height: 22 }} />
      <Tag style={{ left: 12, top: 140 }}>screened</Tag>
      <Leader style={{ left: 160, top: 110, height: 22 }} />
      <Tag style={{ left: 108, top: 140 }}>not screened</Tag>
    </div>
  );
}

// Contribution: solid is what this team made, dashed is the same thing in a future team's hands.
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
  return <Dock />;
}

export function PageHero({
  title,
  lede,
  plate,
  piece,
  slides,
}: {
  title: string;
  lede: string;
  // Photographs to open on instead of the purple field. See HeroCarousel.
  slides?: readonly Slide[] | undefined;
  // The one drawn object this page carries. See Piece above.
  piece?: Piece | undefined;
  // `| undefined` is explicit because exactOptionalPropertyTypes is on: a caller passing an absent plate
  // is passing undefined, not leaving the key out.
  plate?: Plate | undefined;
}) {
  // A slow drift, the only motion on a documentation page. Small on purpose: alive, but not distracting.
  const t = useTime(true);
  const show = useCarousel(slides?.length ?? 0);

  return (
    // Named by its own h1: the hero sits outside <main>, so without a name a screen reader finds no landmark here.
    <section
      aria-labelledby="page-hero-title"
      className="relative overflow-hidden"
      style={{
        background: slides
          ? C.ink
          : `linear-gradient(158deg, ${C.lavenderDeep}, color-mix(in oklab, ${C.lavenderDeep} 76%, ${C.ink}))`,
      }}
    >
      {slides && <SlideBackdrop slides={slides} at={show.at} />}
      {/* The stripes from the story's field, so this reads as the same place. The pattern itself is declared in
          styles.css, beside the drifting copy the story uses. */}
      {!slides && <div aria-hidden="true" className="hero-stripes absolute inset-0" />}
      {/* Light from above, the same as the story's ground. */}
      {!slides && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 70% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
          }}
        />
      )}

      {/* The character, anchored bottom-right and running to the floor of the section, so she stands in the
          hero rather than in a box on it. No mask over her: a blend gradient was tried and it ate the DNA
          strand she is holding. She shows on phones too, smaller, with the copy padded clear of her. */}
      {plate && (
        <div
          aria-hidden={plate.alt ? undefined : "true"}
          // Tablets put her in the corner like phones do. At full height on 768px she reached x 446 against a
          // lede ending at 651, so her arm crossed the text. Side by side only from lg.
          className="pointer-events-none absolute bottom-0 right-0 block h-[152px] md:h-[250px] lg:h-[92%]"
        >
          {piece && (
            // Placed from `lead`, so it follows the figure at any width instead of landing on her.
            // From xl only: the gap between the copy and the figure is 288px at 1280, 445 at 1440, 700 at 1920,
            // and nothing below 1280.
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
              // The same drift as the object beside her, so she is not a sticker on a moving background.
              transform: `translateY(${(Math.sin(t * 0.26) * 4).toFixed(2)}px)`,
              filter: "drop-shadow(0 18px 26px rgba(36,28,46,0.28))",
            }}
          />
        </div>
      )}

      {/* No character: the object sits in the empty right band, from lg. At 768 the copy fills the width. */}
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

      {/* Below lg it stands in the corner instead, under the copy, the way a character does. Without this a
          phone got an empty purple hero. Scaled from the bottom-right corner so the drawing keeps its shape. */}
      {piece && !plate && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-5 right-5 origin-bottom-right scale-[0.6] md:scale-[0.78] lg:hidden"
          style={{
            // Tailwind v4 scales with the `scale` property, so this sets only the drift.
            transform: `translateY(${(Math.sin(t * 0.32 + 1.7) * 4).toFixed(2)}px)`,
          }}
        >
          <PieceArt piece={piece} />
        </div>
      )}

      {/* Extra bottom padding when something stands in the corner, so the lede does not share it. */}
      <div
        className={`relative mx-auto max-w-[92rem] px-6 pt-14 md:px-10 md:py-20 ${plate ? "pb-40 md:pb-[17rem]" : piece ? "pb-[11rem] md:pb-[13rem]" : "pb-14 md:pb-20"} lg:pb-20 ${slides ? "lg:flex lg:items-center lg:gap-14" : ""}`}
      >
        <div className="max-w-[46rem] lg:flex-1">
          {/* The badge, in the site's paper and ink language. */}
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

          {/* Two offset rules under the title: what makes it read as designed rather than typed. */}
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
              // over a photograph the panel does more of the work, because the ground behind it is not one colour
              background: `${C.ink}${slides ? "8c" : "3d"}`,
              border: `2px solid ${C.paper}3d`,
              color: C.paper,
            }}
          >
            {lede}
          </p>
        </div>

        {/* The photographs: beside the copy on a wide screen, under it on a narrow one. */}
        {slides && (
          <div className="mt-10 lg:mt-0 lg:w-[46%] lg:max-w-[640px] lg:shrink-0">
            <SlideFrame slides={slides} show={show} />
          </div>
        )}
      </div>
    </section>
  );
}
