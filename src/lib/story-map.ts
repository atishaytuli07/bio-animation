// Story coordinates: where the reader is in the story, 0 to 1, in the units every timing constant is written in.
// The background's keyframes, the chapter thresholds, the scene handovers and the ambient density are all page
// fractions, and they were all measured when the three scenes travelled 320, 480 and 760vh. "Inside the body"
// has since been cut to about four fifths of that, at the client's request. Rescaling some seventy constants
// by hand to match would have been seventy chances to move a colour change off the beat it belongs to, so the
// conversion happens once, here: real scroll position in, the story's own coordinate out.
// Anything that needs to know where the reader is asks usePageProgress, which calls this. Nothing else should
// divide scrollY by the document's height.

/** Scroll travel of "Inside the body" and "Before the first dose", in vh. The section is this plus 100. */
export const WHY_TRAVEL = 600;

/** What the constants were measured against: 800vh before the last scene, 760vh inside it, 1560 in all. */
const BEFORE = 800;
const WHY_WAS = 760;

/** A position inside the last scene, in vh from its start, as a story coordinate. */
export const whyAt = (vh: number) => (BEFORE + (vh * WHY_WAS) / WHY_TRAVEL) / (BEFORE + WHY_WAS);

/** Real progress through the story's scroll, 0 to 1, as a story coordinate. */
export function toStory(raw: number) {
  const vh = raw * (BEFORE + WHY_TRAVEL);
  const then = vh <= BEFORE ? vh : BEFORE + ((vh - BEFORE) * WHY_WAS) / WHY_TRAVEL;
  return then / (BEFORE + WHY_WAS);
}
