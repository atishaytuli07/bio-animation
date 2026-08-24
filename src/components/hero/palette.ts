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
   *  literally inside its own meaning. */
  lavender: "#8B6BD1",
  lavenderDeep: "#5B3E9E",
  green: "#3FA877",
  /** Deep warm near-black. Every outline and every word uses it — this weight
   *  is what the reference wikis have and a pastel page does not. */
  ink: "#241C2E",
};

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
