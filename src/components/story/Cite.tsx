import type { ReactNode } from "react";

import { C } from "@/components/hero/palette";
import { Awaiting } from "@/components/story/PageShell";

/**
 * Numbered inline citations, and the list they point at.
 *
 * The client asked for superscript numbers in the text rather than a reference
 * list that floats free of the claims it supports. A judge checking a sentence
 * should be one click from its source.
 *
 * A SOURCE THE TEAM HAS NOT SUPPLIED IS SHOWN AS MISSING, never filled in. The
 * list names what each source has to support, under one notice saying how many
 * are still needed. Writing a plausible-looking reference here would be the one
 * thing worse than having none: iGEM requires that nothing on a wiki be
 * unverifiable.
 *
 * THE MISSING STATE LIVES IN THE LIST, NOT IN THE MARK. The first version drew
 * pending marks with a dotted underline, and at superscript size that is a
 * smudge beside a number rather than a signal. The mark looks the same either
 * way; its accessible name says whether the source exists.
 *
 * Numbers come from the order of the list, which is the order of first use in
 * the text — so the list is written in reading order, and citing a source twice
 * repeats its number rather than taking a new one.
 */

export type Source = {
  id: string;
  /** What the source has to establish. Shown while `cite` is still empty. */
  supports: string;
  /** The full reference, once the team has supplied it. */
  cite?: ReactNode | undefined;
};

export function CiteMark({ sources, id }: { sources: readonly Source[]; id: string }) {
  const i = sources.findIndex((s) => s.id === id);
  if (i < 0) throw new Error(`No source with id "${id}"`);
  const pending = !sources[i]?.cite;
  return (
    <sup className="ml-[0.1em] text-[0.68em] font-bold leading-none">
      <a
        href={`#ref-${i + 1}`}
        aria-label={pending ? `Reference ${i + 1}, source not added yet` : `Reference ${i + 1}`}
        className="underline-offset-2 hover:underline focus-visible:underline"
        style={{ color: C.redDeep }}
      >
        {i + 1}
      </a>
    </sup>
  );
}

export function SourceList({ sources }: { sources: readonly Source[] }) {
  const missing = sources.filter((s) => !s.cite).length;
  return (
    <div className="space-y-6">
      {missing > 0 && (
        <Awaiting what={`Needs the team: ${missing} of ${sources.length} sources`}>
          Each number on this page points to a claim below. Until the team adds the reference it
          relied on, the claim is listed by what its source has to support.
        </Awaiting>
      )}
      <ol className="space-y-3">
        {sources.map((s, i) => (
          <li
            key={s.id}
            id={`ref-${i + 1}`}
            // focusable by script, so a screen reader moves to the entry the mark points at
            tabIndex={-1}
            className="grid scroll-mt-28 grid-cols-[1.75rem_1fr] outline-none items-baseline gap-x-2 text-[14px] leading-relaxed md:text-[15px]"
          >
            <span className="text-right font-bold tabular-nums" style={{ color: C.redDeep }}>
              {i + 1}.
            </span>
            {s.cite ? (
              <span style={{ color: C.inkBody }}>{s.cite}</span>
            ) : (
              <span style={{ color: C.inkNote }}>
                <span
                  className="mr-2 inline-block rounded-[4px] px-1.5 text-[10px] font-bold uppercase leading-[1.6] tracking-[0.14em]"
                  style={{ color: C.redDeep, border: `1.5px dashed ${C.red}88` }}
                >
                  needed
                </span>
                {s.supports}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
