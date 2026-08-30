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
};

export const PAGES: Page[] = [
  { label: "The story", to: "/new", ready: true },
  { label: "Description", to: "/description", ready: true },
  { label: "Engineering", to: "/engineering", ready: true },
  { label: "Human Practices", to: "/human-practices", ready: false },
  { label: "Safety", to: "/safety", ready: false },
  { label: "Team", to: "/team", ready: false },
  { label: "Attributions", to: "/attributions", ready: true },
];

/** What the header shows. Attributions lives in the footer, not the nav. */
export const NAV = PAGES.filter((p) => p.to !== "/attributions");
