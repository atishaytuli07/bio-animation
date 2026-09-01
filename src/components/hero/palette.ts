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
  /*
    The closing sign-off, and only that.

    A page's last word is set quieter than its content — it closes rather than
    adds — but "quieter" was being read as "nearly invisible": the wordmark ran
    at 12% alpha and painted 1.29:1 against the band, which is a smudge. These
    two are picked against the threshold instead. Both clear the 3:1 AA floor
    for large text (3.7:1 and 3.1:1 measured), which is the floor rather than
    the target: they are as quiet as a thing is allowed to be while still being
    a word.

    THE TWO HALVES CANNOT SHARE ONE ALPHA. Red tops out at 3.79:1 on cream even
    at full strength, so it needs 85% to clear the floor, while ink reaches the
    same contrast by 40%. One opacity on the wrapper either loses the red or
    turns the ink into a headline.
  */
  inkSignoff: "#241C2E8c",
  redSignoff: "#E03A3Ed9",
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
  /**
   * Where a stop's headline sits. One coordinate, every stop.
   *
   * A PIXEL FLOOR ON PHONES ONLY. Desktop stays a pure fraction, and the
   * difference is not arbitrary.
   *
   * The chapter label sits at a fixed `top-24` / `md:top-28` — 96px and 112px.
   * On a phone the headline wraps to the FULL WIDTH, so it runs straight
   * through that label: measured, "03 · Two people" over "The same treatment."
   * at 93% on a 360px phone, and "05 · Before the first dose" over "What if we
   * knew first?" at 100%. The 140px floor clears it.
   *
   * A floor was tried on desktop too, and it was worse than the bug. At 156px
   * on a 1366x768 laptop the headline dropped 49px and landed on the IV stands
   * in the two-patient scene — a headline over the artwork is more visible than
   * a headline near a small label. Desktop headlines are centred and the label
   * is far left, so vertically they can share a band without touching.
   *
   * THE SHORT-DESKTOP CASE IS SOLVED SIDEWAYS, not downwards.
   *
   * At 1024x768 a long headline — "…doesn't mean the same outcome." — is wide
   * enough that its centred box reaches back to the label on the left, measured
   * at 45% of the label's area. Two conditions have to hold at once: SHORT, so
   * 14vh falls under the label's 112px, and WIDE, so the line is long enough to
   * get there.
   *
   * Pushing it down is what put a headline on the IV stands. So it is capped
   * instead, and only on short viewports: the line wraps to two, stays centred,
   * and its left edge lands clear of the label. `100vw - 34rem` leaves 272px of
   * margin each side, which clears the widest chapter name at every width where
   * the media query applies. Tall screens never see the cap.
   */
  headline:
    "pointer-events-none absolute inset-x-0 top-[max(140px,19vh)] z-20 flex justify-center px-6 md:top-[14vh]",
  /**
   * Applied to the headline's own <p>, beside T.headline.
   *
   * Keeps a centred line clear of the chapter label on short desktops without
   * moving it down into the artwork. See `headline` above for why the cap is
   * conditioned on viewport HEIGHT.
   */
  headlineWidth: "md:[@media(max-height:900px)]:max-w-[calc(100vw-34rem)]",
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
 * The same four bases, for type set directly on the deep field.
 *
 * The rung colours are strokes laid over a paper-white backbone, which is what
 * carries them. The sequence reuses them as 51px LETTERS on bare lavenderDeep,
 * where there is no backbone underneath and three of the four fall below the
 * 3:1 AA floor for large text — measured 2.82:1 for G, 2.93:1 for T and 2.94:1
 * for C, against a 3.07:1 for A that only just clears.
 *
 * Each is mixed 35% toward paper, which puts all four at 3.5–3.65:1 while
 * keeping the hue plainly the same colour the reader met on the strand. Same
 * decision as `redOnField` and `greenOnField`: one meaning, two grounds, and
 * neither component allowed to invent its own tint.
 */
export const BASES_ON_FIELD: Record<string, string> = {
  A: "#96DEB9",
  T: "#FEBCC7",
  G: "#DBC1F7",
  C: "#A8D2F7",
};

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

/**
 * The display stack, for brand chrome: the wordmark, the navigation, buttons
 * and chapter labels.
 *
 * IT LIVED IN THE STORY ROUTE, which meant it was applied on exactly one page.
 * Measured, the wordmark rendered in Avenir Next at 21px/800/-0.21px on /new
 * and in Instrument Sans at -0.24px on /description and /engineering — the same
 * two words, two typefaces, one click apart. A logo that changes face when you
 * navigate is the loudest possible statement that a site was assembled from
 * parts.
 *
 * INTERIM, and the caveat has not changed: this is a stack of whatever happens
 * to be installed, so it renders differently on every machine. The fix is one
 * self-hosted file — iGEM bans external CDNs, so it has to be self-hosted
 * regardless. Sharing the stack means that decision now lands in one place
 * instead of one page. See TYPEFACE-DECISION.md.
 */
export const DISPLAY =
  '"Avenir Next", Avenir, "Century Gothic", "URW Gothic", Futura, "Trebuchet MS", ui-rounded, system-ui, sans-serif';

/**
 * DPD, drawn once for the whole site.
 *
 * THERE WERE THREE OF THESE. The client's note was that the enzyme "reads
 * slightly like a container/bowl rather than a protein/enzyme", and the redraw
 * that answered it reached exactly one of the three places the enzyme is
 * drawn: the bloodstream scene. The two-patient scene kept its own inline
 * rounded rectangle with a notch — the literal shape she was describing — and
 * the ambient/footer element kept a third copy of it at another scale. So the
 * reader met "this shape is DPD" in scene two and a different object in scene
 * three, which is worse than either shape on its own.
 *
 * Worth naming the process failure too: the check written to prove the fix
 * only looked inside the bloodstream scene, so it passed while two thirds of
 * the defect stood. A check scoped to the place you just edited cannot tell
 * you the edit was incomplete.
 *
 * Globular with a single cleft on the right for a molecule to meet. Every
 * curve is smooth and there is exactly ONE concavity, because this shape has
 * to survive being drawn dashed as well as filled — several lobes look more
 * protein-like and break a dash into disconnected arcs.
 *
 * Bounding box x 13→66, y 12→71.
 */
export const ENZYME_PATH =
  "M40 12 C 54 12, 65 21, 64 33 C 63 39, 55 39, 52 44 C 49 49, 55 55, 63 57 C 66 66, 53 71, 40 70 C 27 69, 15 65, 14 53 C 13 44, 18 40, 17 32 C 16 21, 27 12, 40 12 Z";

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
