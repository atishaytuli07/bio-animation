import { Link } from "@tanstack/react-router";

import { C, DISPLAY, L, R, T } from "@/components/hero/palette";
import { PAGES } from "@/components/story/site-map";
import { useSeen } from "@/hooks/use-seen";
import { useStoryState } from "@/lib/story-state";

// What happens after the story ends. The scroll resolved on "A safer starting dose." and then handed the reader
// a 118px cream strip with one link, to the least important page on the wiki. Every documentation page closed
// better than the homepage, which is the wrong way round.
// This is not a tenth beat. The spine is locked at nine and the story is over before any of this is on screen.
// What was missing is the page's ending as opposed to the story's: the answer the reader has earned, and
// somewhere to go with it.
// What it does not say is as deliberate as what it does. The method, what the test is and what it reports, is
// not written anywhere on this wiki on purpose: it is the team's to describe, and this project has already had
// to undo one invented claim. The closing statement restates the thesis and hands off.

// The pages worth offering at the end, in the order a reader should meet them. Not Attributions: it is a
// record, not a next step, and it is one click away in the footer below. It also keeps the grid whole, since
// with Contribution added, seven cards left one stranded on a row of its own.
const ONWARD = PAGES.filter((p) => p.to !== "/" && p.to !== "/attributions");

export function Landing() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const story = useStoryState();
  // Only shown to a reader who actually did something. Someone who scrolled straight through has no decisions to
  // be reminded of, and inventing a recap for them would be worse than leaving it out.
  const acted = story.standardGiven || story.adjustedGiven || story.sliderMoved;
  // One reveal, then hold, the rule the documentation pages follow. Motion that replays every time you scroll
  // past is the clearest tell of a generated site, and this is the last thing on the page.
  const rise = (i: number) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 520ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms, transform 520ms cubic-bezier(0.22,1,0.36,1) ${i * 70}ms`,
  });

  return (
    <section
      ref={ref}
      className="relative z-10 px-6 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32"
      style={{ background: C.paper }}
    >
      <div className="mx-auto max-w-[68rem]">
        <span className={L.note} style={{ ...rise(0), color: C.redDeep, display: "block" }}>
          The project
        </span>

        <h2
          className="mt-4 font-black"
          style={{ ...T.headline, ...rise(1), fontFamily: DISPLAY, color: C.ink, maxWidth: "18ch" }}
        >
          That is the whole idea.
        </h2>

        <p
          className="mt-5 max-w-[54ch] text-[16px] leading-relaxed md:text-[18px]"
          style={{ ...rise(2), color: C.inkBody }}
        >
          A variant nobody can see, a dose decided before anyone can watch it work, and a test that
          belongs in between the two. ChemoGuard is the iGEM 2026 project of NIS Kazakhstan, and
          everything the story just argued is written out properly on the pages below — the science,
          how it was built, who it is for, and who built it.
        </p>

        {/* What the reader did, in their own numbers. The story is about a decision made with and without
            information, and the reader has just made it twice; people remember what they did longer than what they
            read. Nothing here is a claim about biology: it counts presses and the molecules that were on screen. */}
        {acted && (
          <div
            className="mt-10 rounded-[10px] px-5 py-4 md:px-6 md:py-5"
            style={{
              ...rise(3),
              background: `${C.lavender}14`,
              border: `2px solid ${C.ink}1f`,
            }}
          >
            <span className={L.note} style={{ color: C.redDeep }}>
              What you did
            </span>
            <ul className="mt-3 space-y-1.5">
              {story.sliderMoved && (
                <li className="text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
                  You looked for one dose that suited both patients. There is not one — which is why
                  a result before treatment matters.
                </li>
              )}
              {story.standardGiven && (
                <li className="text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
                  You gave the standard dose with nothing to go on, and{" "}
                  <strong style={{ color: C.ink }}>{story.peakHeld} molecules</strong> stayed in his
                  bloodstream.
                </li>
              )}
              {story.adjustedGiven && (
                <li className="text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
                  You gave the adjusted dose with the result in hand, and it came down to{" "}
                  <strong style={{ color: C.ink }}>{story.finalHeld}</strong> — fewer, not none. It
                  is still chemotherapy.
                </li>
              )}
            </ul>
            <span className={`mt-3 block ${L.sub}`} style={{ color: C.inkNote }}>
              Counts of the molecules drawn on screen, not a clinical figure.
            </span>
          </div>
        )}

        {/* Generated from the site map, like every other list of pages here. A page that is not written yet still
            appears, dimmed and unlinked: a judge reading a greyed "Safety" learns the shape of the wiki, while a link
            that goes nowhere teaches them it is broken. */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ONWARD.map((page, i) => {
            const body = (
              <>
                <span
                  className="text-[17px] font-black md:text-[19px]"
                  style={{ fontFamily: DISPLAY, color: C.ink }}
                >
                  {page.label}
                </span>
                <p
                  className="mt-2 text-[14px] leading-relaxed md:text-[15px]"
                  style={{ color: C.inkBody }}
                >
                  {page.blurb}
                </p>
              </>
            );
            const box = {
              ...rise(4 + i),
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              borderRadius: R.md,
              boxShadow: `4px 4px 0 ${C.ink}`,
            } as const;

            return page.ready ? (
              <Link
                key={page.label}
                to={page.to}
                className="block px-5 py-5 transition-transform hover:-translate-y-0.5"
                style={box}
              >
                {body}
              </Link>
            ) : (
              <div
                key={page.label}
                aria-disabled="true"
                className="px-5 py-5"
                style={{
                  ...box,
                  border: `2.5px dashed ${C.ink}59`,
                  boxShadow: "none",
                  opacity: 0.72,
                }}
              >
                {body}
                <span className={`mt-3 inline-block ${L.note}`} style={{ color: C.redDeep }}>
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
