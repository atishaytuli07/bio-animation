import { C } from "@/components/hero/palette";

// First-order elimination and nothing more. What arrives is the shared dose; what leaves is proportional to the
// level and to this patient's simulated DPD activity. A patient settles where the two are equal, so the resting
// level is dose / clearance, and clearance is K at five of five and a fifth less for each step down.
export const K = 0.6;
export const BAND = { lo: 0.35, hi: 0.75 };
export const OVER = 1;
export const CEILING = 1.4;
export const MAX_PATIENTS = 4;
/** Ten samples a second, twenty seconds of history. */
export const SAMPLES = 200;
/** How long a state has to hold before a step counts it as found rather than passed through. */
export const SETTLE = 2.5;

export type Patient = {
  id: number;
  /** Simulated DPD activity, 0 to 5. */
  activity: number;
  /** Which name, colour and face this patient keeps for as long as they are on the page. */
  look: number;
  /** Leaving: still drawn for the length of the exit, no longer simulated. */
  out?: boolean;
};

export const clearanceOf = (p: Patient) => (p.activity / 5) * K;
export const inBand = (c: number) => c >= BAND.lo && c <= BAND.hi;
export const scale = (v: number) => `${(Math.min(v, CEILING) / CEILING) * 100}%`;

export type Status = "below" | "in" | "above" | "over";
export const statusOf = (c: number): Status =>
  c > OVER ? "over" : c > BAND.hi ? "above" : c >= BAND.lo ? "in" : "below";

// Colour marks the state and the word carries it. The drug keeps coral to itself, so no state uses it: below is
// the interface's neutral lavender, the target is green, and anything past the target is red, hollow until it
// crosses the threshold.
export const STATUS: Record<Status, { word: string; tone: string; hollow?: boolean }> = {
  below: { word: "Below range", tone: C.lavender },
  in: { word: "In range", tone: C.green },
  above: { word: "Above range", tone: C.red, hollow: true },
  over: { word: "Over threshold", tone: C.red },
};

// One identity per patient: the shirt, the line on the chart and its dash are the same colour, so the two can be
// matched at a glance. None of them is green, red or coral, which mean the target, the threshold and the drug.
export const LOOKS = [
  { tone: "#2F6FBF", dash: "", skin: "#F2C6A0", hair: "#3A2A22" },
  { tone: C.lavenderDeep, dash: "7 4", skin: "#C98E62", hair: "#1F1A1A" },
  { tone: C.ink, dash: "2 4", skin: "#F6D7BD", hair: "#8A4B2A" },
  { tone: "#8A5A1E", dash: "11 3 2 3", skin: "#8C5A3C", hair: "#2A1D18" },
] as const;

export const lookOf = (p: Patient) => LOOKS[p.look] ?? LOOKS[0];
export const nameOf = (p: Patient) => `Patient ${p.look + 1}`;

// Each step is one idea: what to do, why, and the line that replaces it once the reader has seen it happen.
export const STEPS = [
  {
    id: "dose",
    title: "Choose a dose",
    ask: "Move the shared dose until Patient 1 sits in the green range.",
    why: "The green band is the illustrative target range. The dose flows in, DPD clears it, and the level takes a moment to come to rest.",
    found: "In this model, a steady dose settles at a steady level.",
  },
  {
    id: "compare",
    title: "Compare patients",
    ask: "Keep that dose and add a patient. Their simulated DPD activity is 2/5.",
    why: "Two people, one dose. The only difference is how fast each one clears the drug.",
    found: "Same dose, lower simulated DPD activity: here this patient’s exposure settles higher.",
  },
  {
    id: "difference",
    title: "Find the difference",
    ask: "Can one dose keep both in the green range? Lower it until the 2/5 patient is in range.",
    why: "Watch what happens to the first patient as you do.",
    found: "For these two simulated patients, no single dose keeps both in range.",
  },
  {
    id: "why",
    title: "Discover why",
    ask: "Lower one patient’s simulated DPD activity and watch their exposure.",
    why: "This dial exists only in the simulation. Treatment does not change a patient’s DPD activity.",
    found: "In this simulation, less DPD activity means slower clearance and higher exposure.",
  },
  {
    id: "group",
    title: "Widen the group",
    ask: "Add patients until there are four, each with a different activity. How many can one dose keep in range?",
    why: "Hold a dose that puts at least two of them in the green.",
    found: "",
  },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

/**
 * The most patients one dose can hold in the band at once.
 *
 * A patient is in the band when dose / clearance is, so the patients one dose can hold together are those whose
 * activities sit within the band's own ratio of each other. A patient with none is never among them.
 */
export function mostInRange(patients: readonly Patient[]) {
  const ratio = BAND.hi / BAND.lo;
  let best = 0;
  for (const low of patients) {
    if (low.activity === 0) continue;
    const n = patients.filter(
      (p) => p.activity >= low.activity && p.activity <= low.activity * ratio + 1e-9,
    ).length;
    if (n > best) best = n;
  }
  return best;
}

/** Something the reader did, marked on the chart so a bend in a curve has a cause beside it. */
export type Mark = { at: number; kind: "dose" | "DPD" | "added" };
