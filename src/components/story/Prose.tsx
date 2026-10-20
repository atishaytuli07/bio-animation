import type { ReactNode } from "react";

import { asset, C, L, R } from "@/components/hero/palette";

// The blocks a long written page is made of, beyond a paragraph: photographs with captions, a table, a quoted
// sentence, a list, and the note that says what the team changed. One set, so two pages of the team's own writing
// look like the same site.

export type Shot = {
  /** Path in public/, without the extension. */
  file: string;
  w: number;
  h: number;
  alt: string;
};

/** One photograph, or two side by side, over one caption. */
export function Figure({ shots, caption }: { shots: readonly Shot[]; caption?: string }) {
  const pair = shots.length > 1;
  return (
    <figure className="my-6 md:my-8">
      <div className={pair ? "grid grid-cols-2 items-start gap-3 md:gap-4" : ""}>
        {shots.map((s) => (
          <img
            key={s.file}
            src={asset(`${s.file}.webp`)}
            alt={s.alt}
            width={s.w}
            height={s.h}
            loading="lazy"
            decoding="async"
            // a tall photograph on its own is held narrower, so it does not fill a screen and a half
            className={`h-auto w-full ${!pair && s.h > s.w ? "max-w-[22rem]" : ""}`}
            style={{ border: `2px solid ${C.ink}`, borderRadius: R.md, background: "#fff" }}
          />
        ))}
      </div>
      {caption && (
        <figcaption
          className="mt-2.5 max-w-[62ch] text-[13.5px] leading-snug md:text-[14.5px]"
          style={{ color: C.inkNote }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** A table that scrolls sideways inside its own frame on a narrow screen instead of pushing the page wide. */
export function DataTable({
  label,
  head,
  rows,
}: {
  /** What the table is, for a screen reader arriving at the scrolling frame. */
  label: string;
  head: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="my-6 overflow-x-auto"
      style={{ border: `2px solid ${C.ink}`, borderRadius: R.md, background: "#fffaf2" }}
    >
      <table className="w-full min-w-[34rem] border-collapse text-left text-[14px] leading-snug md:text-[15px]">
        <thead>
          <tr style={{ background: `${C.lavender}33` }}>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className={`px-3.5 py-2.5 ${L.note}`}
                style={{ color: C.ink }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join("|")} style={{ borderTop: `1.5px solid ${C.ink}26` }}>
              {r.map((cell, i) =>
                i === 0 ? (
                  <th
                    key={i}
                    scope="row"
                    className="px-3.5 py-2.5 align-top font-bold"
                    style={{ color: C.ink }}
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={i} className="px-3.5 py-2.5 align-top" style={{ color: C.inkBody }}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Someone's own words, set apart from the team's account of them. */
export function Quote({ by, children }: { by: string; children: ReactNode }) {
  return (
    <figure
      className="my-6 max-w-[62ch] py-1 pl-5"
      style={{ borderLeft: `5px solid ${C.lavenderDeep}` }}
    >
      <blockquote
        className="text-[18px] font-semibold leading-snug md:text-[21px]"
        style={{ color: C.ink }}
      >
        {children}
      </blockquote>
      <figcaption className={`mt-2 ${L.note}`} style={{ color: C.inkNote }}>
        {by}
      </figcaption>
    </figure>
  );
}

/** What the project does differently because of the conversation above it. */
export function Changed({ children }: { children: ReactNode }) {
  return (
    <div
      className="my-6 px-4 py-3.5 md:px-5 md:py-4"
      style={{
        background: `${C.green}1f`,
        border: `2px solid ${C.ink}`,
        borderRadius: R.md,
      }}
    >
      <span className={L.note} style={{ color: C.ink }}>
        What we changed
      </span>
      <p
        className="mt-1.5 max-w-[62ch] text-[15px] leading-relaxed md:text-[17px]"
        style={{ color: C.ink }}
      >
        {children}
      </p>
    </div>
  );
}

export function Bullets({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul className="max-w-[62ch] space-y-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 text-[15px] leading-relaxed md:text-[17px]"
          style={{ color: C.inkBody }}
        >
          <span
            aria-hidden="true"
            className="mt-[0.62em] block h-2 w-2 shrink-0 rounded-full"
            style={{ background: C.lavenderDeep }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A smaller heading inside a section. */
export function Sub({ children }: { children: ReactNode }) {
  return (
    <h3
      className="pt-2 text-[19px] font-bold leading-tight md:text-[22px]"
      style={{ color: C.ink }}
    >
      {children}
    </h3>
  );
}
