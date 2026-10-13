import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { BODY, C, DISPLAY, R, T } from "@/components/hero/palette";
import { Slot } from "@/components/story/EnzymeSlot";
import { PAGES } from "@/components/story/site-map";
import { useSeen } from "@/hooks/use-seen";
import { useStoryState } from "@/lib/story-state";

// What happens after the story ends: the page's ending, as opposed to the story's. The story resolves on "A more
// informed starting dose." and this is where the reader is told whose project that was and where to go next.
// It used to be a flat cream block that slid up from under an empty frame, headed "That is the whole idea." over
// a sixty-word paragraph and seven identical boxed cards. The client's reading was that an immersive story ended
// in a documentation menu. So it now opens on the name the story has just introduced, says one sentence, and lays
// the pages out as a composition: the two a reader is most likely to want are larger, each card carries one
// object from the story's own vocabulary, and nothing wears the hard shadow of a button.
// What it does not say is as deliberate as what it does. The method, what the test is and what it reports, is not
// written anywhere on this wiki on purpose: it is the team's to describe.

// The pages worth offering at the end. Not Attributions: it is a record, not a next step, and it is one click
// away in the footer below.
const ONWARD = PAGES.filter((p) => p.to !== "/" && p.to !== "/attributions");

// How the cards sit in the grid on a wide screen, by how many there are. Six columns. Seven cards go 3+3, 2+2+2,
// 3+3 and six go 3+3 three times, so every row is full and none is stranded. The layout follows the site map,
// because the main wiki has no play area and so one page fewer than this one. The first two are the lead cards.
const THREE = "lg:col-span-3";
const TWO = "lg:col-span-2";
const SPANS: Record<number, string[]> = {
  8: [THREE, THREE, TWO, TWO, TWO, TWO, TWO, TWO],
  7: [THREE, THREE, TWO, TWO, TWO, THREE, THREE],
  6: [THREE, THREE, THREE, THREE, THREE, THREE],
};

// The one object each card carries, from the story's own vocabulary. A page with no entry renders plain.
const CARD: Record<string, { art: ReactNode }> = {
  "/description": {
    // the letter the story turns on
    art: (
      <span
        className="grid h-11 w-10 place-items-center text-[24px] font-bold leading-none"
        style={{
          background: C.red,
          color: "#fff",
          border: `2.5px solid ${C.ink}`,
          borderRadius: R.sm,
        }}
      >
        A
      </span>
    ),
  },
  "/playground": {
    art: (
      <span className="flex items-end gap-1">
        <Molecule s={0.34} tone={C.coral} />
        <Molecule s={0.5} tone={C.coral} />
      </span>
    ),
  },
  "/engineering": { art: <Enzyme s={0.42} tone={C.green} /> },
  "/human-practices": { art: <Cell s={0.4} tone={C.pink} /> },
  "/education": { art: <Cell s={0.4} tone={C.blue} /> },
  // what was not looked for: the Safety page's own picture
  "/safety-and-security": {
    art: (
      <span
        className="grid h-9 w-9 place-items-center text-[18px] font-bold leading-none"
        style={{ border: `2px dashed ${C.ink}80`, borderRadius: R.sm, color: C.inkBody }}
      >
        ?
      </span>
    ),
  },
  "/team": {
    art: (
      <span className="flex items-end gap-1">
        <Cell s={0.26} tone={C.pink} />
        <Cell s={0.34} tone={C.blue} />
        <Cell s={0.26} tone={C.lavender} />
      </span>
    ),
  },
  // one made, one for whoever comes next
  "/contribution": {
    art: (
      <span className="flex items-center gap-1.5">
        <Slot made={1} small />
        <Slot made={0} small />
      </span>
    ),
  },
};

/** A small arrow, drawn: neither bundled typeface has one. It is what says "this goes somewhere". */
function Go() {
  return (
    <svg
      viewBox="0 0 34 14"
      className="h-3 w-7 shrink-0"
      aria-hidden="true"
      fill="none"
      stroke={C.ink}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 7H31M25 2l6 5-6 5" />
    </svg>
  );
}

export function Landing() {
  // The heading block is what is watched, not the section. Watching the section meant a quarter of something
  // several screens tall had to be in view before anything appeared: half a screen of blank cream on a laptop and
  // three quarters on a phone.
  const [ref, seen] = useSeen<HTMLDivElement>(true);
  const story = useStoryState();
  // Only shown to a reader who actually did something. Someone who scrolled straight through has no decisions to
  // be reminded of, and inventing a recap for them would be worse than leaving it out.
  const acted = story.standardGiven || story.adjustedGiven || story.sliderMoved;
  // One reveal, then hold, the rule the documentation pages follow.
  const rise = (i: number) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 520ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms`,
  });

  const did = [
    story.sliderMoved && {
      k: "slider",
      text: "You tried one dose for both patients. No setting gave both the expected exposure.",
    },
    story.standardGiven && {
      k: "standard",
      text: `You gave the standard dose without a result. The vessel filled to ${story.peakHeld} molecules.`,
    },
    story.adjustedGiven && {
      k: "adjusted",
      text: `You gave the adjusted dose with the result in hand. ${story.finalHeld} remained: it is still chemotherapy.`,
    },
  ].filter((d): d is { k: string; text: string } => Boolean(d));

  return (
    <section
      className="relative z-10 px-6 pb-20 pt-4 md:px-10 md:pb-28 md:pt-8"
      // It fades in over the story's last ground, which is the same cream, instead of arriving as a flat block with
      // a straight edge across the frame.
      style={{ background: `linear-gradient(to bottom, transparent, ${C.paper} 160px)` }}
    >
      <div className="mx-auto max-w-[68rem]">
        <div ref={ref}>
          <p
            className="text-[20px] font-black leading-none md:text-[24px]"
            style={{ ...rise(0), fontFamily: DISPLAY, letterSpacing: "-0.01em", color: C.ink }}
          >
            Chemo<span style={{ color: C.red }}>Guard</span>
            <span className="ml-3 align-middle text-[12px] font-bold uppercase tracking-[0.14em] md:text-[13px]">
              <span style={{ fontFamily: BODY, color: C.inkBody }}>NIS Kazakhstan · iGEM 2026</span>
            </span>
          </p>

          <h2
            className="mt-4 font-black md:mt-5"
            style={{ ...T.headline, ...rise(1), color: C.ink, maxWidth: "26ch" }}
          >
            Testing before the first dose.
          </h2>
        </div>

        <p
          className="mt-5 max-w-[58ch] text-[16px] leading-relaxed md:text-[18px]"
          style={{ ...rise(2), color: C.inkBody }}
        >
          Explore the science behind ChemoGuard, the engineering decisions that shaped our approach,
          and the people and research that brought the project to life.
        </p>

        {/* What the reader did, in their own numbers. The story is about a decision made with and without
            information, and the reader has just made it twice. Nothing here is a claim about biology: it counts
            presses and the molecules that were on screen, and says so. A row of short statements, not a box: boxed,
            it stood 346px tall on a phone and pushed the first page link most of a screen down. */}
        {did.length > 0 && acted && (
          <div className="mt-8 md:mt-10" style={rise(3)}>
            <p
              className="text-[12px] font-bold uppercase tracking-[0.14em]"
              style={{ color: C.inkBody }}
            >
              What you did
            </p>
            <ul className="mt-3 grid gap-x-8 gap-y-2.5 md:grid-flow-col md:auto-cols-fr">
              {did.map((d) => (
                <li
                  key={d.k}
                  className="pl-3.5 text-[14px] leading-snug md:text-[15px]"
                  style={{ color: C.ink, borderLeft: `3px solid ${C.coral}` }}
                >
                  {d.text}
                </li>
              ))}
            </ul>
            <p
              className="mt-2.5 text-[12px] leading-snug md:text-[13px]"
              style={{ color: C.inkBody }}
            >
              Counts of the molecules drawn on screen, not a clinical figure.
            </p>
          </div>
        )}

        {/* Generated from the site map, like every other list of pages here. A page that is not written yet still
            appears, dimmed and unlinked: a judge reading a greyed "Safety" learns the shape of the wiki, while a link
            that goes nowhere teaches them it is broken. */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-12 md:gap-4 lg:grid-cols-6">
          {ONWARD.map((page, i) => {
            const card = {
              span: SPANS[ONWARD.length]?.[i] ?? TWO,
              lead: i < 2,
              art: CARD[page.to]?.art ?? null,
            };
            const body = (
              <>
                <span className="flex items-start justify-between gap-4">
                  <span
                    className={`font-semibold leading-tight ${card.lead ? "text-[21px] md:text-[26px]" : "text-[18px] md:text-[20px]"}`}
                    style={{ fontFamily: DISPLAY, color: C.ink }}
                  >
                    {page.label}
                  </span>
                  <span aria-hidden="true" className="shrink-0">
                    {card.art}
                  </span>
                </span>
                <span
                  className={`mt-2 block leading-relaxed ${card.lead ? "max-w-[44ch] text-[15px] md:text-[16px]" : "text-[14px] md:text-[15px]"}`}
                  style={{ color: C.inkBody }}
                >
                  {page.blurb}
                </span>
              </>
            );
            const box = {
              ...rise(4 + i),
              // The lead cards sit on the palest lavender, the rest on cream: enough to say which two come first.
              background: card.lead
                ? `color-mix(in oklab, ${C.paper} 88%, ${C.lavender})`
                : C.paper,
              // A hairline, and no offset shadow. Seven hard black shadows in a grid was the heaviest thing on the
              // page; the arrow in the corner says "link" without one.
              border: `1.5px solid ${C.ink}3d`,
              borderRadius: R.md,
            } as const;

            return page.ready ? (
              <Link
                key={page.label}
                to={page.to}
                className={`group flex flex-col px-5 py-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[#241C2E]! md:px-6 md:py-6 ${card.span}`}
                style={box}
              >
                {body}
                <span className="mt-auto flex justify-end pt-4 transition-transform group-hover:translate-x-1">
                  <Go />
                </span>
              </Link>
            ) : (
              <div
                key={page.label}
                aria-disabled="true"
                className={`flex flex-col px-5 py-5 md:px-6 md:py-6 ${card.span}`}
                style={{ ...box, border: `1.5px dashed ${C.ink}59`, opacity: 0.72 }}
              >
                {body}
                <span
                  className="mt-3 inline-block text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: C.redDeep }}
                >
                  Not written yet
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
