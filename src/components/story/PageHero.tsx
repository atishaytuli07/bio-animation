import type { ReactNode } from "react";

import { asset, C, L, T } from "@/components/hero/palette";
import {
  CycleCast,
  DockCast,
  DropCast,
  HandoffCast,
  VoicesCast,
} from "@/components/story/Critters";
import { SlideBackdrop, SlideFrame, type Slide } from "@/components/story/HeroCarousel";
import { useCarousel } from "@/hooks/use-carousel";
import { useTime } from "@/hooks/use-scroll-progress";

// The hero every documentation page opens with: badge, title, two rules, lede panel, and one drawn cast.
// It uses the story's own shapes and colours so the pages read as one site.

// The cast a page carries: the project's own actors with faces, each about what its page is about. They replaced
// the generated scientist figures, which the client found generic: a cartoon scientist could open any team's wiki.
//   dock     Description       DPD holding 5-FU in its cleft
//   cycle    Engineering       the chromosome inside an open loop: design, build, test, learn, again
//   voices   Human Practices   three cells of different sizes, the people a test reaches
//   result   Safety            a drop of the medicine behind a shield
//   handoff  Contribution      our enzyme and its dashed twin, for the next team
export type Piece = "dock" | "cycle" | "voices" | "result" | "handoff";

/** The drawing's box, so the layout can keep it clear of the copy. */
const SIZE: Record<Piece, { w: number; h: number }> = {
  dock: { w: 300, h: 278 },
  cycle: { w: 286, h: 286 },
  voices: { w: 320, h: 265 },
  result: { w: 246, h: 268 },
  handoff: { w: 340, h: 230 },
};

/** A label on the drawing: paper text on a thin line. Only Description has them, because there they name science. */
function Tag({ children, x, y }: { children: ReactNode; x: string; y: string }) {
  return (
    <span
      data-piece-label
      className={`${L.note} absolute whitespace-nowrap leading-none`}
      style={{ left: x, top: y, color: C.paper }}
    >
      {children}
    </span>
  );
}

function PieceArt({ piece }: { piece: Piece }) {
  const { w, h } = SIZE[piece];
  return (
    <div data-piece className="relative" style={{ width: w, height: h }}>
      {piece === "dock" && (
        <>
          <DockCast />
          <Tag x="40%" y="101%">
            DPD
          </Tag>
          <Tag x="71%" y="80%">
            5-FU
          </Tag>
        </>
      )}
      {piece === "cycle" && <CycleCast />}
      {piece === "voices" && <VoicesCast />}
      {piece === "result" && <DropCast />}
      {piece === "handoff" && <HandoffCast />}
    </div>
  );
}

export function PageHero({
  title,
  lede,
  piece,
  slides,
  photo,
}: {
  title: string;
  lede: string;
  // Photographs to open on instead of the purple field. See HeroCarousel.
  slides?: readonly Slide[] | undefined;
  // Photographs as the whole hero: full width, sharp, one after another, the title over them. See Team.
  photo?: readonly Slide[] | undefined;
  // The cast this page carries. See Piece above. `| undefined` because exactOptionalPropertyTypes is on.
  piece?: Piece | undefined;
}) {
  // A slow drift, the only motion on a documentation page. Small on purpose: alive, but not distracting.
  const t = useTime(true);
  const show = useCarousel(slides?.length ?? photo?.length ?? 0);

  return (
    // Named by its own h1: the hero sits outside <main>, so without a name a screen reader finds no landmark here.
    <section
      aria-labelledby="page-hero-title"
      className="relative overflow-hidden"
      style={{
        background:
          slides || photo
            ? C.ink
            : `linear-gradient(158deg, ${C.lavenderDeep}, color-mix(in oklab, ${C.lavenderDeep} 76%, ${C.ink}))`,
      }}
    >
      {slides && <SlideBackdrop slides={slides} at={show.at} />}

      {/* The photographs are the hero, one after another. They are anchored a little right of centre so the people stay in view beside the
          copy, and a dark fade from the left, and from below on a phone, keeps the title and lede readable on it. */}
      {photo && (
        <>
          {photo.map((ph, i) => (
            <img
              key={ph.file}
              src={asset(`${ph.file}-1280.webp`)}
              srcSet={`${asset(`${ph.file}-800.webp`)} 800w, ${asset(`${ph.file}-1280.webp`)} 1280w`}
              sizes="100vw"
              alt={i === show.at ? ph.alt : ""}
              aria-hidden={i === show.at ? undefined : "true"}
              width={1280}
              height={936}
              // the first is the page's opening picture; the rest are not seen for six seconds
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              data-hero-photo=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none"
              style={{ objectPosition: "62% 42%", opacity: i === show.at ? 1 : 0 }}
            />
          ))}
          <div
            aria-hidden="true"
            className="absolute inset-0 lg:hidden"
            style={{
              background: `linear-gradient(180deg, ${C.ink}33 0%, ${C.ink}66 35%, ${C.ink}e6 100%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden lg:block"
            style={{
              // the copy sits at the foot of the picture, so the fade runs up from the bottom-left corner
              background: `linear-gradient(90deg, ${C.ink}cc 0%, ${C.ink}80 32%, ${C.ink}00 62%), linear-gradient(0deg, ${C.ink}d9 0%, ${C.ink}66 30%, ${C.ink}00 55%)`,
            }}
          />
        </>
      )}
      {/* The stripes from the story's field, so this reads as the same place. The pattern itself is declared in
          styles.css, beside the drifting copy the story uses. */}
      {!slides && !photo && <div aria-hidden="true" className="hero-stripes absolute inset-0" />}
      {/* Light from above, the same as the story's ground. */}
      {!slides && !photo && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 70% at 70% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)",
          }}
        />
      )}

      {/* The cast sits in the empty right band from lg, a little smaller until xl. At 768 the copy fills the width. */}
      {piece && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[5%] top-1/2 hidden origin-right scale-[0.8] lg:block xl:right-[9%] xl:scale-100"
          style={{
            transform: `translateY(-50%) translateY(${(Math.sin(t * 0.32 + 1.7) * 6).toFixed(2)}px) rotate(${(Math.sin(t * 0.22) * 1.4).toFixed(2)}deg)`,
          }}
        >
          <PieceArt piece={piece} />
        </div>
      )}

      {/* Below lg it stands in the corner instead, under the copy, the way a character does. Without this a
          phone got an empty purple hero. Scaled from the bottom-right corner so the drawing keeps its shape. */}
      {piece && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-5 right-5 origin-bottom-right scale-[0.56] md:scale-[0.64] lg:hidden"
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
        className={`relative mx-auto max-w-[92rem] px-6 pt-14 md:px-10 md:py-20 ${piece ? "pb-[11rem] md:pb-[14rem]" : "pb-14 md:pb-20"} lg:pb-20 ${photo ? "flex min-h-[86vh] flex-col justify-end pt-[38vh] lg:min-h-[84vh] lg:pb-14 lg:pt-20" : ""} ${slides ? "lg:flex lg:items-center lg:gap-14" : ""}`}
      >
        <div className={`max-w-[46rem] ${photo ? "" : "lg:flex-1"}`}>
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
              background: `${C.ink}${slides || photo ? "8c" : "3d"}`,
              border: `2px solid ${C.paper}3d`,
              color: C.paper,
            }}
          >
            {lede}
          </p>
        </div>

        {/* The photographs: beside the copy on a wide screen, under it on a narrow one. */}
        {slides && (
          <div className="mt-10 lg:mt-0 lg:w-[52%] lg:max-w-[780px] lg:shrink-0">
            <SlideFrame slides={slides} show={show} />
          </div>
        )}
      </div>
      {/* The photographs change on their own every six seconds, so they must be possible to stop (WCAG 2.2.2). */}
      {photo && show.canPlay && (
        <button
          type="button"
          onClick={show.toggle}
          aria-label={show.playing ? "Pause the photographs" : "Play the photographs"}
          className="absolute bottom-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full text-[12px] leading-none md:bottom-6 md:right-6"
          style={{ background: `${C.ink}b3`, color: C.paper, border: `2px solid ${C.paper}99` }}
        >
          <span aria-hidden="true">{show.playing ? "\u275a\u275a" : "\u25b6"}</span>
        </button>
      )}
    </section>
  );
}
