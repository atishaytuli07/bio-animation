/**
 * The ChemoGuard visual system, in one place.
 *
 * The governing rule from the Production Brief: a colour means the same thing
 * on every screen. Lavender is always genetics, coral is always the drug,
 * green is always a validated result, and RED IS ONLY EVER THE VARIANT (plus
 * the brand mark itself). If colour is decorative on one screen and meaningful
 * on another, the whole system reads as decoration.
 */
export const C = {
  red: "#E03A3E",
  /**
   * Button surfaces only. White on the brand red measures 4.34:1, under the
   * 4.5:1 WCAG AA threshold for text at this size; this is deep enough to
   * clear it. The brand red itself is unchanged everywhere else.
   */
  redDeep: "#C42A2E",
  /** Warm cream, not white — Wuxi's ground is beige too. Beige was never the
   *  problem; low contrast and emptiness were. */
  paper: "#FBF3E7",
  coral: "#F0653C",
  pink: "#F2839C",
  blue: "#4E92CF",
  /** The field behind the strand: lavender means genetics, so the DNA sits
   *  literally inside its own meaning.
   *
   *  Lightened one step at the client's request — she liked the hue and did
   *  not want the palette changed, only the weight of it. The deep tone moved
   *  with it so the two still read as one family, and so the handover into the
   *  pink section is a shorter distance to travel. */
  lavender: "#A084DD",
  lavenderDeep: "#7355B4",
  green: "#3FA877",
  /*
    Tints for type set ON the deep field. The mid-tone red and green are built
    for cream and go muddy against purple, so headlines were reaching for
    hand-written hex — #FFC9C4 and #9BE8C4 appeared inline in three different
    components. Same meanings, legible ground: these are the on-field variants
    of red and green, and nothing should invent another one.
  */
  redOnField: "#FFC9C4",
  greenOnField: "#9BE8C4",
  /** Deep warm near-black. Every outline and every word uses it — this weight
   *  is what the reference wikis have and a pastel page does not. */
  ink: "#241C2E",
  /*
    Ink at reduced strength, named. An audit of every visible string found ink
    running at THREE different alphas — c4, a0 and a hand-written 0.66 — for
    what is really two jobs: body copy that sits under a headline, and a note
    that sits under a title. Two tokens, so a third can never appear.
  */
  inkBody: "#241C2Ec4",
  inkNote: "#241C2Ea0",
};

/**
 * The type scale.
 *
 * Every headline on the site was hand-tuned before this existed: five sizes and
 * four different letter-spacings across three sections, and the largest type on
 * the whole page was the single word "Why?" — bigger than the hero. Sizes are
 * now picked from this scale and nowhere else.
 *
 * One rule ties the two together: the bigger the type, the tighter the
 * tracking. Large display type needs negative tracking to hold together; small
 * type needs air to stay legible. So each step carries its own pairing and a
 * headline can never be given the wrong one.
 *
 * The hierarchy is fixed and deliberate:
 *   display  — the hero, and only the hero. The largest thing on the site.
 *   headline — every stop's headline. All equal to each other, one step down.
 *   sub      — the line that answers a headline, or closes a beat.
 *   label    — chapter labels, diagram labels. Uppercase, letterspaced.
 *   caption  — the small explanatory line under a diagram.
 */
export const T = {
  display: {
    fontSize: "clamp(2.7rem, 5.9vw, 5rem)",
    lineHeight: 0.94,
    letterSpacing: "-0.042em",
  },
  headline: {
    fontSize: "clamp(2rem, 4.8vw, 3.8rem)",
    lineHeight: 1,
    letterSpacing: "-0.034em",
  },
  sub: {
    fontSize: "clamp(1.35rem, 2.9vw, 2.3rem)",
    lineHeight: 1.12,
    letterSpacing: "-0.024em",
  },
} as const;

/**
 * Layout constants, so a reader scrolling from one stop to the next never sees
 * a heading jump. The headline sat at 24vh in stop two and 16vh in stop three;
 * consecutive sections moved their own copy by 8vh.
 */
/**
 * Corner radii. Three values, and no fourth.
 *
 * An audit of the rendered pages found 6px, 8px, 10px and 14px all in use for
 * what are really two jobs — a small pressable thing and a panel — plus the
 * pill. Nobody chose four; each component reached for whatever looked right on
 * its own, which is how a system stops being one.
 */
export const R = {
  /** Buttons, badges, chips, small boxed letters. */
  sm: 6,
  /** Panels, cards, figures, menus. */
  md: 10,
  /** Pills and the logo chip. */
  full: 9999,
} as const;

export const L = {
  /** Chapter label, pinned identically on every stop stage. */
  label: "absolute left-6 top-24 z-20 md:left-10 md:top-28",
  /** Chapter label typography — uppercase, letterspaced, always this size. */
  labelType: "inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em]",
  /*
    In-scene uppercase annotation — a hint, a state, a unit. Distinct from the
    chapter label on purpose: that is chrome and wears wider tracking, this is
    part of the picture. The audit found these running at 10px/0.18em in one
    place and 11px/0.18em in another, which is drift rather than intent.
  */
  note: "text-[11px] font-bold uppercase tracking-[0.18em]",
  /** The small explanatory line under a title. Was 11px, 12px, and two
   *  different trackings, for one job. */
  sub: "text-[11px] font-semibold leading-snug tracking-normal",
  /** Where a stop's headline sits. One coordinate, every stop. */
  headline:
    "pointer-events-none absolute inset-x-0 top-[12vh] z-20 flex justify-center px-6 md:top-[14vh]",
} as const;

/**
 * Base-pair colours, bright enough to hold on the deep field.
 *
 * Red is absent because it belongs to the variant. Coral is absent because at
 * this size it reads AS red — with coral in the set, the single wrong rung
 * disappeared into a crowd of near-red ones.
 */
export const BASES = ["#5FD3A0", "#FF9EB5", "#C9A6FF", "#7CC0FF"];

/**
 * Letters matched to BASES by index. Hovering a rung reveals them, so the
 * interaction teaches the notation the whole site is built on rather than
 * merely reacting to the pointer.
 *
 * The variant reads "G→A" — what actually happens at DPYD c.1905+1G>A. Three
 * characters is a reward for curiosity, not the jargon dump the client
 * objected to when she said the story "starts too deep in the science".
 */
export const PAIR_LETTERS = ["A·T", "T·A", "G·C", "C·G"];
export const VARIANT_LETTERS = "G→A";

/* --- strand geometry, in the SVG's own coordinate space ------------------ */
export const PAIRS = 26;
export const TURNS = 2.1;
/** The one rung that is wrong. */
export const VARIANT = 15;
export const HX = 210;
export const HTOP = 40;
export const HBOT = 720;
export const HR = 132;

/**
 * Resolve a file in public/ against the wiki's base path.
 *
 * An iGEM wiki is served from /<team-slug>/, so a literal "/logo.webp" points
 * outside it. Rewriting the SSR HTML is not enough: React re-renders on
 * hydration and puts the literal path straight back. BASE_URL is "/" during
 * development and for root-hosted deploys, so this is a no-op there.
 */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
