import { useSyncExternalStore } from "react";

// What the reader did, remembered across the story. Scene three hands the reader the dose twice, once with
// nothing to go on and once with the result in hand, and the closing section replays their own decisions with
// their own numbers. That needs one place both can reach that survives the scene unmounting: a module-level
// store rather than a context, because there is one story per page and the two ends are not in the same tree.
// Nothing here is science. It is a record of presses and molecule counts on screen, and the closing section
// says so.
type StoryState = {
  /** The reader held the first control and gave the standard dose. */
  standardGiven: boolean;
  /** The reader held the second control and gave the adjusted dose. */
  adjustedGiven: boolean;
  /** Most molecules held in the vessel at once, before the turn. */
  peakHeld: number;
  /** Molecules still held once the scene has resolved. */
  finalHeld: number;
  /** The reader moved the two-patient dose slider. */
  sliderMoved: boolean;
};

let state: StoryState = {
  standardGiven: false,
  adjustedGiven: false,
  peakHeld: 0,
  finalHeld: 0,
  sliderMoved: false,
};
const listeners = new Set<() => void>();

// exactOptionalPropertyTypes is on, so Partial<StoryState> refuses an explicit undefined, and callers want to
// pass exactly that for "no change this time", which the loop below already ignores.
type StoryPatch = { [K in keyof StoryState]?: StoryState[K] | undefined };

/** Merge a partial update; identical values are ignored so callers can write freely. */
export function recordStory(patch: StoryPatch) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof StoryState)[]) {
    const v = patch[k];
    if (v !== undefined && v !== state[k]) changed = true;
  }
  if (!changed) return;
  const next = { ...state };
  for (const k of Object.keys(patch) as (keyof StoryState)[]) {
    const v = patch[k];
    if (v !== undefined) (next as Record<string, unknown>)[k] = v;
  }
  state = next;
  for (const l of listeners) l();
}

export function useStoryState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state,
    () => state,
  );
}
