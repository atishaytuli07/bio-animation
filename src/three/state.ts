/**
 * Plain mutable state for the WebGL hero.
 *
 * The story's scroll spring (useSmoothProgress) writes into this object every
 * frame and useFrame reads it. Never route three.js values through React state
 * — a setState per frame would re-render the whole tree at 60fps.
 */
export const sceneState = {
  camX: 0,
  camY: 0,
  camZ: 14,
  /** world-space y the camera looks at — raised to keep the variant centred */
  lookY: 0,
  focusDistance: 0.02,
  /** 0 = full colour, 1 = desaturated everywhere except the DPYD region */
  desat: 0,
  /** 0 = no variant, 1 = the variant base fully in signal red */
  variant: 0,
  /** extra scale applied to the variant base */
  variantScale: 0,
  /** 0 = helix at rest, 1 = fully unwound toward the camera */
  dive: 0,
};

/**
 * Bright palette. Tuned for a near-white page: the strand hardware reads as
 * light grey so the coloured bases carry all the contrast, and the variant
 * red is the only fully saturated thing on screen.
 */
export const PALETTE = {
  mistDeep: "#DCD5DE",
  signal: "#E03A3E",
  coral: "#FF7A6B",
  blush: "#FFD9DB",
  violet: "#7B5EA7",
  violetSoft: "#A88BD0",
  cyan: "#4FA8D8",
} as const;
