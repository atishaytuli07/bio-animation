// The ChemoGuard visual system, in one place. The rule from the Production Brief is that a colour means the
// same thing on every screen: lavender is genetics, coral is the drug, green is a validated result, and red is
// only ever the variant, plus the brand mark. A colour that is decorative on one screen and meaningful on
// another makes the whole system read as decoration.
export const C = {
  red: "#E03A3E",
  /**
   * Button surfaces only. White on the brand red measures 4.34:1, under the 4.5:1 AA threshold for text at this
   * size; this is deep enough to clear it. The brand red is unchanged everywhere else.
   */
  redDeep: "#C42A2E",
  /** Warm cream, not white. Beige was never the problem; low contrast and emptiness were. */
  paper: "#FBF3E7",
  coral: "#F0653C",
  pink: "#F2839C",
  blue: "#4E92CF",
  /**
   * The field behind the strand: lavender means genetics, so the DNA sits inside its own meaning. Lightened one
   * step at the client's request, and the deep tone moved with it so the two still read as one family and the
   * handover into the pink section is a shorter distance to travel.
   */
  lavender: "#A084DD",
  lavenderDeep: "#7355B4",
  green: "#3FA877",
  // Tints for type set on the deep field. The mid-tone red and green are built for cream and go muddy against
  // purple, so headlines were reaching for hand-written hex: #FFC9C4 and #9BE8C4 appeared inline in three
  // components. Same meanings, legible ground, and nothing should invent another one.
  redOnField: "#FFC9C4",
  greenOnField: "#9BE8C4",
  /** Deep warm near-black. Every outline and every word uses it; this weight is what a pastel page does not have. */
  ink: "#241C2E",
  // Ink at reduced strength, named. An audit of every visible string found ink running at three different alphas,
  // c4, a0 and a hand-written 0.66, for what is really two jobs: body copy under a headline, and a note under a
  // title. Two tokens, so a third cannot appear.
  inkBody: "#241C2Ec4",
  inkNote: "#241C2Ea0",
  // The closing sign-off, and only that. A page's last word is set quieter than its content, but quieter was
  // being read as nearly invisible: the wordmark ran at 12% alpha and painted 1.29:1 against the band. These two
  // are picked against the threshold instead, measuring 3.7:1 and 3.1:1 against the 3:1 floor for large text.
  // The two halves cannot share one alpha. Red tops out at 3.79:1 on cream even at full strength, so it needs 85%
  // to clear the floor, while ink reaches the same contrast by 40%: one opacity on the wrapper either loses the
  // red or turns the ink into a headline.
  inkSignoff: "#241C2E8c",
  redSignoff: "#E03A3Ed9",
};

// The type scale. Every headline was hand-tuned before this existed: five sizes and four letter-spacings across
// three sections, and the largest type on the page was the single word "Why?", bigger than the hero.
// One rule ties the steps together: the bigger the type, the tighter the tracking. Each step carries its own
// pairing, so a headline cannot be given the wrong one.
//   display   the hero, and only the hero
//   headline  every stop's headline, all equal to each other
//   sub       the line that answers a headline, or closes a beat
//   label     chapter labels and diagram labels, uppercase and letterspaced
//   caption   the small explanatory line under a diagram
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

// Corner radii. Three values, and no fourth. An audit of the rendered pages found 6px, 8px, 10px and 14px in use
// for what are really two jobs, a small pressable thing and a panel, plus the pill: nobody chose four, each
// component reached for whatever looked right on its own. The strays are gone — four tags moved from 8px and one
// chip from 4px onto sm, and the three floating cards from 14px onto md.
// Anything set in a style attribute reads these; a Tailwind class writes the same number as rounded-[6px] or
// rounded-[10px], so a grep for either finds every corner on the site.
export const R = {
  /** Buttons, badges, chips, small boxed letters. */
  sm: 6,
  /** Panels, cards, figures, menus. */
  md: 10,
  /** Pills and the logo chip. */
  full: 9999,
} as const;

// Layout constants, so a reader scrolling from one stop to the next never sees a heading jump. The headline sat
// at 24vh in stop two and 16vh in stop three, and consecutive sections moved their own copy by 8vh.
export const L = {
  /** Chapter label, pinned identically on every stop stage. */
  label: "absolute left-6 top-24 z-20 md:left-10 md:top-28",
  /** Chapter label typography — uppercase, letterspaced, always this size. */
  labelType: "inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em]",
  // In-scene uppercase annotation: a hint, a state, a unit. Distinct from the chapter label on purpose, since
  // that is chrome and wears wider tracking while this is part of the picture. The audit found these at
  // 10px/0.18em in one place and 11px/0.18em in another.
  note: "text-[11px] font-bold uppercase tracking-[0.18em]",
  /** The small explanatory line under a title. Was 11px, 12px and two different trackings, for one job. */
  sub: "text-[11px] font-semibold leading-snug tracking-normal",
  /**
   * Where a stop's headline sits. One coordinate, every stop, with a pixel floor on phones only.
   * The chapter label sits at a fixed top-24 / md:top-28, 96px and 112px. On a phone the headline wraps to the
   * full width and runs straight through it: measured, "03 - Two people" over "The same treatment." at 93% on a
   * 360px phone, and "05 - Before the first dose" over "What if we knew first?" at 100%. The 140px floor clears
   * both.
   * A floor on desktop was worse than the bug. At 156px on a 1366x768 laptop the headline dropped 49px and
   * landed on the IV stands in the two-patient scene. Desktop headlines are centred and the label is far left,
   * so they can share a band without touching.
   * The short-desktop case is solved sideways, not downwards. At 1024x768 a long headline is wide enough that
   * its centred box reaches back to the label, measured at 45% of the label's area, and two conditions have to
   * hold at once: short, so 14vh falls under the label's 112px, and wide, so the line is long enough to get
   * there. So it is capped instead, and only on short viewports: the line wraps to two, stays centred, and its
   * left edge lands clear. 100vw - 34rem leaves 272px of margin each side, which clears the widest chapter name
   * at every width where the media query applies.
   */
  headline:
    "pointer-events-none absolute inset-x-0 top-[max(140px,19vh)] z-20 flex justify-center px-6 md:top-[14vh]",
  /**
   * Applied to the headline's own <p>, beside T.headline. Keeps a centred line clear of the chapter label on
   * short desktops without moving it down into the artwork. See `headline` above for why the cap is conditioned
   * on viewport height.
   */
  headlineWidth: "md:[@media(max-height:900px)]:max-w-[calc(100vw-34rem)]",
} as const;

// Base-pair colours, bright enough to hold on the deep field. Red is absent because it belongs to the variant,
// and coral is absent because at this size it reads as red: with coral in the set, the single wrong rung
// disappeared into a crowd of near-red ones.
export const BASES = ["#5FD3A0", "#FF9EB5", "#C9A6FF", "#7CC0FF"];

// The same four bases, for type set directly on the deep field. The rung colours are strokes laid over a
// paper-white backbone, which is what carries them; the sequence reuses them as 51px letters on bare
// lavenderDeep, where three of the four fall below the 3:1 floor for large text, measured 2.82:1 for G, 2.93:1
// for T and 2.94:1 for C against A's 3.07:1.
// Each is mixed 35% toward paper, which puts all four at 3.5 to 3.65:1 while keeping the hue plainly the colour
// the reader met on the strand. Same decision as redOnField and greenOnField: one meaning, two grounds.
export const BASES_ON_FIELD: Record<string, string> = {
  A: "#96DEB9",
  T: "#FEBCC7",
  G: "#DBC1F7",
  C: "#A8D2F7",
};

// Letters matched to BASES by index. Hovering a rung reveals them, so the interaction teaches the notation the
// site is built on rather than merely reacting to the pointer. The variant reads "G to A", what happens at DPYD
// c.1905+1G>A: a reward for curiosity, not the jargon dump the client objected to.
export const PAIR_LETTERS = ["A·T", "T·A", "G·C", "C·G"];
export const VARIANT_LETTERS = "G→A";

// The display stack, for brand chrome: the wordmark, the navigation, buttons and chapter labels.
// It lived in the story route, so it applied on exactly one page. Measured, the wordmark rendered in Avenir Next
// at 21px/800/-0.21px on the story and in Instrument Sans at -0.24px on /description: the same two words, two
// typefaces, one click apart.
// Interim. This is a stack of whatever happens to be installed, so it renders differently on every machine. The
// fix is one self-hosted file, which iGEM requires anyway since external CDNs are banned. Sharing the stack
// means that decision lands in one place. See TYPEFACE-DECISION.md.
export const DISPLAY =
  '"Avenir Next", Avenir, "Century Gothic", "URW Gothic", Futura, "Trebuchet MS", ui-rounded, system-ui, sans-serif';

// DPD, drawn once for the whole site. There were three of these. The client's note was that the enzyme "reads
// slightly like a container/bowl rather than a protein/enzyme", and the redraw that answered it reached one of
// the three places it is drawn. The two-patient scene kept its own rounded rectangle with a notch, the literal
// shape she was describing, and the ambient element kept a third copy at another scale.
// The check written to prove the fix only looked inside the bloodstream scene, so it passed while two thirds of
// the defect stood. A check scoped to the place you just edited cannot tell you the edit was incomplete.
// Globular with a single cleft on the right for a molecule to meet. Every curve is smooth and there is exactly
// one concavity, because the shape has to survive being drawn dashed as well as filled: several lobes break a
// dash into disconnected arcs.
// Bounding box x 13 to 66, y 12 to 71.
export const ENZYME_PATH =
  "M40 12 C 54 12, 65 21, 64 33 C 63 39, 55 39, 52 44 C 49 49, 55 55, 63 57 C 66 66, 53 71, 40 70 C 27 69, 15 65, 14 53 C 13 44, 18 40, 17 32 C 16 21, 27 12, 40 12 Z";

// strand geometry, in the SVG's own coordinate space
export const PAIRS = 26;
export const TURNS = 2.1;
/** The one rung that is wrong. */
export const VARIANT = 15;
export const HX = 210;
export const HTOP = 40;
export const HBOT = 720;
export const HR = 132;

// Resolve a file in public/ against the wiki's base path. An iGEM wiki is served from /<team-slug>/, so a
// literal "/logo.webp" points outside it. Rewriting the SSR HTML is not enough, because React re-renders on
// hydration and puts the literal path back. BASE_URL is "/" in development and for root-hosted deploys.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
