// Every page this wiki will have, in one list, with whether it exists yet.
// The navigation used to be a hard-coded array of five labels rendered as buttons that did nothing. A judge
// clicking one got silence, which reads as a broken wiki rather than an unfinished one.
// The nav is generated from this, and a page that is not `ready` is shown as plainly not-yet-written rather than
// as a link that lies. When a page lands, its flag flips here and both navs pick it up.
// The set of pages is not arbitrary: iGEM's Best Wiki criteria are largely content-based, and these are the
// pages the judging form expects to find.

export type Page = {
  /** Nav label. */
  label: string;
  /** Route path, once it exists. */
  to: string;
  /** False while the page has not been written. */
  ready: boolean;
  /**
   * One line on what is there, for the cards that close the story. It lives here rather than beside those cards
   * because a second list of page names is the drift this file exists to prevent; that has happened twice
   * already, once to the navigation and once to the static exporter.
   */
  blurb: string;
};

export const PAGES: Page[] = [
  {
    label: "The story",
    to: "/",
    ready: true,
    blurb: "The variant, the enzyme, two people and the dose: the whole argument, in one scroll.",
  },
  {
    label: "Try it",
    to: "/playground",
    ready: true,
    blurb:
      "You watched two people. Now set the dose yourself, for up to four patients, and see where the same dose lands in each.",
  },
  {
    label: "Description",
    to: "/description",
    ready: true,
    blurb:
      "What the problem is, what one letter of DNA can do, and why testing before treatment matters.",
  },
  {
    label: "Engineering",
    to: "/engineering",
    ready: true,
    blurb: "Design, build, test, learn, including the passes that failed and what they changed.",
  },
  {
    label: "Human Practices",
    to: "/human-practices",
    ready: true,
    blurb:
      "What patients and four experts told us, where they disagreed, and what we changed because of it.",
  },
  {
    label: "Education",
    to: "/education",
    ready: true,
    blurb:
      "What we taught, from a kindergarten to a library for the blind, and what each audience taught us back.",
  },
  {
    label: "Safety",
    to: "/safety-and-security",
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
    label: "Contribution",
    to: "/contribution",
    ready: true,
    blurb: "What this project leaves behind for future iGEM teams, and why it is useful to them.",
  },
  {
    label: "Attributions",
    to: "/attributions",
    ready: true,
    blurb: "Who did which part, and what came from elsewhere.",
  },
];

// A page can answer at more than one address, and the standard URL is the one that must hold the real page.
// iGEM's judging rules say so outright: "You must use the correct Standard URL Pages on your Team Wiki to
// document your project. Do not use redirects to bypass the Standard URLs." The safety page therefore lives at
// /safety-and-security, which is the Standard URL for the Safety and Security award, and /safety redirects to
// it so older links still land. The story is the same case: it lives at the root, and /new, where it was
// built and first shared, redirects to it. A static host cannot redirect for us, so the export writes the document; the
// build and the static check both read this list rather than keeping their own.
export const ALIASES = [
  { from: "/safety", to: "/safety-and-security" },
  { from: "/new", to: "/" },
];

// What the header shows. Six items, three of them menus: each menu's label goes to its first page, and the menu
// lists the pages in the group. Sections are not listed: the client asked for the main pages only. Grouping is what lets every page, including
// Contribution and Attributions, be reached from the bar without it running out of room at 1024px.
export type MenuItem = {
  label: string;
  /** Routes in this group, first one being where the label itself goes. */
  pages: readonly string[];
};

const page = (to: string) => PAGES.find((p) => p.to === to);

export const MENU: MenuItem[] = (
  [
    { label: "The story", pages: ["/"] },
    { label: "Try it", pages: ["/playground"] },
    { label: "Project", pages: ["/description", "/engineering", "/contribution"] },
    { label: "Human Practices", pages: ["/human-practices", "/education"] },
    { label: "Safety", pages: ["/safety-and-security"] },
    { label: "Team", pages: ["/team", "/attributions"] },
  ] satisfies MenuItem[]
)
  // a page this wiki does not have is dropped, and a group left empty goes with it
  .map((item) => ({ ...item, pages: item.pages.filter((to) => page(to)?.ready) }))
  .filter((item) => item.pages.length > 0);

/** The page behind a route in a menu. */
export const pageAt = (to: string) => page(to) as Page;
