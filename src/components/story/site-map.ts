/**
 * Every page this wiki will have, in one list, with whether it exists yet.
 *
 * The navigation used to be a hard-coded array of five labels rendered as
 * <button>s that did nothing — "Project", "Wet Lab", "Dry Lab", "Human
 * Practices", "Team" all went nowhere, on every screen of the site. A judge
 * clicking one got silence, which is worse than not offering the link: it
 * reads as a broken wiki rather than an unfinished one.
 *
 * So the nav is generated from this, and a page that is not `ready` is shown
 * as plainly not-yet-written rather than as a link that lies. When a page
 * lands, its flag flips here and both the desktop and mobile navs pick it up —
 * there is no second list to keep in step.
 *
 * The set of pages is not arbitrary. iGEM's Best Wiki criteria are largely
 * content-based, and these are the pages the judging form expects to find.
 */

export type Page = {
  /** Nav label. */
  label: string;
  /** Route path, once it exists. */
  to: string;
  /** False while the page has not been written. */
  ready: boolean;
  /**
   * One line on what is there, for the cards that close the story.
   *
   * It lives here rather than beside those cards because a second list of page
   * names is exactly the drift this file exists to prevent — it has already
   * happened twice, once to the navigation and once to the static exporter.
   */
  blurb: string;
};

export const PAGES: Page[] = [
  {
    label: "The story",
    to: "/new",
    ready: true,
    blurb: "The variant, the enzyme, two people and the dose — the whole argument, in one scroll.",
  },
  {
    label: "Description",
    to: "/description",
    ready: true,
    blurb:
      "What the problem is, what one letter of DNA does, and why the timing of a test decides whether it helps.",
  },
  {
    label: "Engineering",
    to: "/engineering",
    ready: true,
    blurb: "Design, build, test, learn — including the passes that failed and what they changed.",
  },
  {
    label: "Human Practices",
    to: "/human-practices",
    ready: true,
    blurb:
      "Who this is for, who we asked, and the decisions we made differently because of what they said.",
  },
  {
    label: "Safety",
    to: "/safety",
    ready: true,
    blurb:
      "What we worked with, how we contained it, and what a test that informs a dose has to be careful about.",
  },
  {
    label: "Team",
    to: "/team",
    ready: true,
    blurb: "The students at NIS Kazakhstan who built it, and who worked on what.",
  },
  {
    label: "Attributions",
    to: "/attributions",
    ready: true,
    blurb: "Who did which part, what came from elsewhere, and where AI was used.",
  },
];

/** What the header shows. Attributions lives in the footer, not the nav. */
export const NAV = PAGES.filter((p) => p.to !== "/attributions");
