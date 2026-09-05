import { Link } from "@tanstack/react-router";

import { C, DISPLAY, L, R, T } from "@/components/hero/palette";
import { PAGES } from "@/components/story/site-map";
import { useSeen } from "@/hooks/use-seen";
import { useStoryState } from "@/lib/story-state";

/**
 * What happens after the story ends.
 *
 * The scroll resolved on "A dose that fits." and then handed the reader a
 * 118px cream strip reading "ChemoGuard · iGEM 2026 · Attributions" — three
 * elements, one link, and that link went to the least important page on the
 * wiki. Sixteen screens of argument, and then nothing to do with it.
 *
 * Every documentation page already closed better than the homepage did, which
 * is the wrong way round: they end on a composed band with two figures and a
 * full site map, and the page a judge actually lands on ended on a copyright
 * line.
 *
 * THIS IS NOT A TENTH BEAT. The spine is locked at nine and this does not
 * touch it — the story is over before any of this is on screen. What was
 * missing is not another scene, it is the page's ending as opposed to the
 * story's ending: the answer the reader has earned, and somewhere to go with
 * it.
 *
 * WHAT IT DOES NOT SAY is as deliberate as what it does. The method — what the
 * test is, what it measures, what it reports — is not written anywhere on this
 * wiki, on purpose, because it is the team's to describe and this project has
 * already had to undo one invented claim. So the closing statement restates
 * the thesis the story just made and hands off. It does not describe an assay.
 */

/** The pages worth offering at the end, in the order a reader should meet them. */
const ONWARD = PAGES.filter((p) => p.to !== "/new");

export function Landing() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const story = useStoryState();
  /*
    Only shown to a reader who actually did something. Someone who scrolled
    straight through has no decisions to be reminded of, and inventing a
    recap for them would be worse than leaving it out.
  */
  const acted = story.standardGiven || story.matchedGiven || story.sliderMoved;
  /*
    One reveal, then hold — the rule the documentation pages already follow.
    Motion that replays every time you scroll past is the clearest tell of a
    generated site, and this is the last thing on the page.
  */
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

        {/*
          WHAT THE READER DID, in their own numbers.

          The story is about a decision made with and without information, and
          the reader has just made it twice. Playing their own figures back is
          worth more than any summary we could write — people remember what
          they did far longer than what they read.

          Nothing here is a claim about biology. It counts presses and the
          molecules that were on screen, and it says so.
        */}
        {acted && (
          <div
            className="mt-10 rounded-xl px-5 py-4 md:px-6 md:py-5"
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
                  You looked for one dose that suited both patients. There is not one — that is what
                  a matched dose means.
                </li>
              )}
              {story.standardGiven && (
                <li className="text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
                  You gave the standard dose with nothing to go on, and{" "}
                  <strong style={{ color: C.ink }}>{story.peakHeld} molecules</strong> stayed in his
                  bloodstream.
                </li>
              )}
              {story.matchedGiven && (
                <li className="text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
                  You gave the matched dose with the result in hand, and it came down to{" "}
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

        {/*
          Generated from the site map, like every other list of pages on this
          site. A page that is not written yet still appears, dimmed and
          unlinked, because a judge reading a greyed "Safety" learns the shape
          of the wiki while a link that goes nowhere teaches them it is broken.
        */}
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
