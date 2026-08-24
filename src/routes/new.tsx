import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Helix } from "@/components/hero/Helix";
import { C } from "@/components/hero/palette";

/**
 * /new — the hero concept, built to the Production Brief.
 *
 * Everything here is drawn in code as SVG. No three.js: the old WebGL helix was
 * slow to load and read as generic, and an SVG strand can morph, recolour and
 * animate — which is what "the visuals carry the story" actually requires.
 *
 * The composition follows the client's hero checklist literally:
 *   · a large, immediately recognisable DNA visual
 *   · ChemoGuard branding
 *   · a short headline, not a page dominated by text
 *   · red/white identity plus coral, pink, blue, lavender, green
 *   · sophisticated illustrated scientific elements
 *   · much less empty background
 *
 * The notation idea from the brief is applied here: the rungs are coloured by
 * base-pair convention, and exactly ONE rung is ChemoGuard red — the variant.
 * Red is never used decoratively anywhere on this page, so the eye finds the
 * one thing that is wrong without a word of explanation. No jargon in the hero;
 * the reader should be curious, not taught.
 */

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [{ title: "ChemoGuard — hero concept" }, { name: "robots", content: "noindex" }],
  }),
  component: HeroConcept,
});

/**
 * Display stack.
 *
 * INTERIM. The single biggest remaining gap versus the reference wikis is that
 * they all have a real display face with personality — Wuxi's marker, KCIS's
 * custom lettering, GlycoGarden's rounded geometric — and this is a stack of
 * whatever happens to be installed. It prefers geometric-rounded faces so the
 * page leans warm rather than neutral, but it will render differently on every
 * machine, which is not acceptable for a design-critical page.
 *
 * The fix is one self-hosted font file. iGEM bans external CDNs (Google Fonts
 * included), so it has to be self-hosted regardless — this is required work,
 * not a nice-to-have.
 */
const DISPLAY =
  '"Avenir Next", Avenir, "Century Gothic", "URW Gothic", Futura, "Trebuchet MS", ui-rounded, system-ui, sans-serif';

/**
 * A hand-drawn underline, the signature detail of Wuxi's navigation.
 *
 * The point is that it is NOT a straight rule. Each one is a slightly
 * different squiggle — the control points are derived from the item's index so
 * no two match — which is what makes it read as drawn by a person rather than
 * generated. It also overshoots the word at both ends, the way a marker
 * stroke does.
 */
function Underline({ index, active = false }: { index: number; active?: boolean }) {
  const wob = ((index * 37) % 7) - 3; // −3…3, deterministic per item
  const lift = ((index * 23) % 5) - 2;
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-8%] bottom-0 h-[9px] w-[116%] origin-left transition-[opacity,transform] duration-300"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "scaleX(1)" : "scaleX(0.55)",
      }}
      data-underline=""
    >
      <path
        d={`M2 ${6 + lift * 0.3} C 24 ${3 + wob}, 48 ${8 - wob * 0.6}, 72 ${5 + wob * 0.4} S 92 ${7 - lift * 0.4}, 98 ${5 + lift * 0.2}`}
        fill="none"
        stroke={C.coral}
        strokeWidth={3.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* -------------------------------------------- illustrated science elements */

/** A cell: membrane, cytoplasm, nucleus. Reads at 40px and at 200px. */
function Cell({ s = 1, tone = C.pink }: { s?: number; tone?: string }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100 * s, height: 100 * s }} aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill={tone} />
      {/* stipple: the texture that makes an illustration look drawn rather
          than generated. Wuxi's kidney is covered in it. */}
      {[
        [36, 32],
        [64, 30],
        [30, 50],
        [44, 66],
        [70, 58],
        [58, 78],
        [26, 66],
        [76, 44],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={1.9} fill={C.ink} opacity={0.28} />
      ))}
      <circle cx="50" cy="50" r="42" fill="none" stroke={C.ink} strokeWidth="4" />
      <circle cx="57" cy="44" r="16" fill={C.lavender} stroke={C.ink} strokeWidth="3.5" />
      {/* nucleolus + highlight */}
      <circle cx="60" cy="41" r="4.5" fill={C.ink} opacity={0.4} />
      <ellipse
        cx="38"
        cy="34"
        rx="7"
        ry="4.5"
        fill={C.paper}
        opacity={0.45}
        transform="rotate(-28 38 34)"
      />
      <circle cx="33" cy="64" r="5" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="67" cy="71" r="3.5" fill={C.paper} stroke={C.ink} strokeWidth="2" />
    </svg>
  );
}

/**
 * The drug: a pyrimidine ring. 5-FU is a fluorinated uracil — the same family
 * of molecule as the letters of the genome, which is exactly why the enzyme
 * that clears nucleic-acid bases is the one that clears it. Drawn as a
 * hexagon so it reads as "molecule" instantly.
 */
function Molecule({ s = 1, tone = C.coral }: { s?: number; tone?: string }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(50 + Math.cos(a) * 30).toFixed(1)},${(50 + Math.sin(a) * 30).toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100 * s, height: 100 * s }} aria-hidden="true">
      <polygon
        points={pts.join(" ")}
        fill={tone}
        stroke={C.ink}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* the inner ring line every structural formula has */}
      <circle cx="50" cy="50" r="17" fill="none" stroke={C.ink} strokeWidth="2.5" opacity={0.5} />
      <ellipse
        cx="41"
        cy="36"
        rx="6"
        ry="3.5"
        fill={C.paper}
        opacity={0.4}
        transform="rotate(-30 41 36)"
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={6} fill={C.paper} stroke={C.ink} strokeWidth="3" />;
      })}
    </svg>
  );
}

/** The enzyme that clears the drug — a notched shape, so it reads as a lock. */
function Enzyme({ s = 1, tone = C.green }: { s?: number; tone?: string }) {
  const d =
    "M18 30 Q18 14 34 14 L66 14 Q82 14 82 30 L82 42 Q64 42 64 54 Q64 66 82 66 L82 78 Q82 94 66 94 L34 94 Q18 94 18 78 Z";
  return (
    <svg viewBox="0 0 100 100" style={{ width: 100 * s, height: 100 * s }} aria-hidden="true">
      <path d={d} fill={tone} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      {/* hatching across the body — a drawn surface, not a filled shape */}
      {[26, 38, 50, 62, 74].map((y, i) => (
        <line
          key={i}
          x1={24}
          y1={y}
          x2={i % 2 ? 56 : 48}
          y2={y}
          stroke={C.ink}
          strokeWidth="2"
          opacity={0.22}
        />
      ))}
      <circle cx="40" cy="34" r="4" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
    </svg>
  );
}

/** Scattered field of scientific elements — the "much less empty background". */
const FIELD = [
  /*
    Positions are percentages of the viewport, and the layout changes shape at
    md: side-by-side above it, stacked below. Objects tuned for the seam
    therefore land on the copy once the columns stack, so the ones that would
    collide are marked `hideSm` and simply do not render on phones. Fewer
    objects on a small screen is the right answer anyway.

    depth: 0 = far (small, soft, barely moves) … 1 = near (large, sharp, moves most)
  */
  { k: "cell", x: 11, y: 87, s: 0.86, r: -6, tone: C.pink, depth: 1, hideSm: true },
  { k: "mol", x: 30, y: 94, s: 0.6, r: 12, tone: C.coral, depth: 0.82 },
  { k: "enz", x: 15, y: 15, s: 0.5, r: 10, tone: C.green, depth: 0.5 },
  { k: "cell", x: 34, y: 12, s: 0.44, r: -8, tone: C.blue, depth: 0.28 },

  /*
    Straddling the seam. The field's edge sits near x = 42%, so these sit ON
    it: half on cream, half on the purple. That is what stops the boundary
    reading as a wall — the world carries across it. They are the nearest
    objects in the scene, so they travel furthest with the pointer and read as
    being in front of both sides.
  */
  { k: "mol", x: 43, y: 20, s: 0.74, r: -14, tone: C.coral, depth: 1 },
  { k: "cell", x: 41, y: 79, s: 0.72, r: 8, tone: C.pink, depth: 0.92, hideSm: true },
  { k: "enz", x: 56, y: 47, s: 0.42, r: 16, tone: C.green, depth: 0.36, hideSm: true },

  // deep in the field: small, soft, slow
  { k: "cell", x: 95, y: 72, s: 0.5, r: -8, tone: C.blue, depth: 0.3 },
  { k: "mol", x: 90, y: 16, s: 0.38, r: 20, tone: C.coral, depth: 0.2 },
] as const;

/** Small drifting particles — the drug moving through the frame. */
const DOTS = Array.from({ length: 7 }, (_, i) => ({
  // biased to the outer thirds so none land on the headline or paragraph
  x: i % 2 === 0 ? ((i * 13) % 26) + 2 : ((i * 17) % 30) + 66,
  y: (i * 67 + 13) % 100,
  r: 3 + ((i * 11) % 4),
  tone: [C.coral, C.pink, C.blue, C.green][i % 4],
  d: 6 + ((i * 7) % 8),
  delay: (i % 9) * 0.7,
}));

/* --------------------------------------------------------------- the page */

function HeroConcept() {
  const stage = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = stage.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const target = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const tick = () => {
      tx += (target.x - tx) * 0.05;
      ty += (target.y - ty) * 0.05;
      el.style.setProperty("--px", (tx * 26).toFixed(2) + "px");
      el.style.setProperty("--py", (ty * 18).toFixed(2) + "px");
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // The affordance hint retires the moment the visitor proves they don't need
  // it — the same move as Wuxi's "Scroll to follow the signal".
  const [dragged, setDragged] = useState(false);
  const [menu, setMenu] = useState(false);

  return (
    <main
      ref={stage}
      className="relative min-h-screen overflow-hidden [&_*]:[-webkit-tap-highlight-color:transparent]"
      style={
        {
          background: C.paper,
          color: C.ink,
          "--paper-c": C.paper,
          "--ink-c": C.ink,
        } as React.CSSProperties
      }
    >
      {/*
        A committed colour field with a hard edge, not a gradient mesh. Every
        reference wiki does this — GlycoGarden meets green to blue on a crisp
        horizon, KCIS is one flat blue, Wuxi is flat cream. A soft pastel wash
        is what a page looks like when it has not decided on a colour, and it
        is the single strongest "AI-generated" tell.

        The field is lavender because lavender means genetics everywhere on
        this site — so the strand sits literally inside its own meaning.
      */}
      <div
        aria-hidden="true"
        className="field pointer-events-none absolute"
        style={{
          // Striping layered over the field, the way GlycoGarden stripes its
          // green. It is barely visible and it is the difference between a
          // colour and a surface.
          //
          // It also drifts, very slowly. This is the one exception to the
          // "no ambient motion" rule and it earns it: a continuous surface
          // moving reads as LIGHT passing over the scene, where discrete
          // objects bobbing read as things jiggling. 48s per cycle, so you
          // register it as atmosphere rather than as animation.
          backgroundImage: `repeating-linear-gradient(102deg, rgba(255,255,255,0.05) 0 3px, transparent 3px 26px), linear-gradient(160deg, ${C.lavender}, ${C.lavenderDeep})`,
          backgroundSize: "180px 180px, 100% 100%",
          animation: "sheen 48s linear infinite",
        }}
      />
      {/* a thin ink keyline along the field edge — the reference wikis all
          outline their shapes rather than letting them dissolve */}
      <div
        aria-hidden="true"
        className="field pointer-events-none absolute"
        style={{ border: `3px solid ${C.ink}`, opacity: 0.14 }}
      />

      {/* Grain over everything. Every reference wiki has surface texture; a
          perfectly clean gradient is the giveaway of a generated page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          mixBlendMode: "soft-light",
          opacity: 0.5,
        }}
      />

      {/* the scientific world, drifting */}
      <div aria-hidden="true" className="absolute inset-0">
        {FIELD.map((f, i) => (
          <div
            key={i}
            className={`parallax absolute enter${"hideSm" in f && f.hideSm ? " max-md:hidden" : ""}`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              // Custom properties: the entrance keyframe restores the object's
              // own rotation instead of flattening it, and --d drives how far
              // this object travels with the pointer.
              ["--rot" as string]: `${f.r}deg`,
              ["--d" as string]: f.depth,
              transform: `translate(-50%,-50%) rotate(${f.r}deg)`,
              animationDelay: `${240 + i * 90}ms`,
              // Far objects sit back: softer, slightly desaturated, blurred a
              // touch. Near objects are sharp and cast a shadow.
              opacity: 0.45 + f.depth * 0.55,
              filter:
                f.depth > 0.7
                  ? `drop-shadow(0 ${(6 * f.depth).toFixed(1)}px ${(10 * f.depth).toFixed(1)}px rgba(36,28,46,0.22))`
                  : `blur(${((1 - f.depth) * 1.6).toFixed(2)}px)`,
            }}
          >
            {f.k === "cell" ? (
              <Cell s={f.s} tone={f.tone} />
            ) : f.k === "mol" ? (
              <Molecule s={f.s} tone={f.tone} />
            ) : (
              <Enzyme s={f.s} tone={f.tone} />
            )}
          </div>
        ))}
        {DOTS.map((d, i) => (
          <span
            key={`d${i}`}
            className="absolute block rounded-full float"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.r * 2,
              height: d.r * 2,
              background: d.tone,
              opacity: 0.9,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.d}s`,
            }}
          />
        ))}
      </div>

      {/* ---------------------------------------------------------- nav */}
      <header className="relative z-20 mx-auto flex max-w-[92rem] items-center justify-between px-6 py-4 md:px-10 md:py-6">
        <div className="flex items-center gap-2.5">
          {/*
            The team's own emblem — DNA dissolving into hexagons above a
            handheld reader, held in two hands. Note it already contains the
            same two ideas this hero is built on: the strand and the molecule.
            White keyed out of the supplied JPEG and un-premultiplied, so the
            edges stay red instead of going pink on a coloured ground.
          */}
          <img
            src="/logo.webp"
            alt="ChemoGuard — NIS Kazakhstan, iGEM 2026"
            width={34}
            height={41}
            className="h-[34px] w-auto shrink-0 md:h-[40px]"
            style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.35))" }}
          />
          <span
            className="text-[21px] font-extrabold leading-none text-[color:var(--mark)] [--mark:var(--paper-c)] md:[--mark:var(--ink-c)]"
            style={{ fontFamily: DISPLAY, letterSpacing: "-0.01em" }}
          >
            Chemo<span style={{ color: C.red }}>Guard</span>
          </span>
          <span
            className="hidden text-[10px] tracking-[0.22em] text-[color:var(--mark)] opacity-60 [--mark:var(--paper-c)] sm:inline md:[--mark:var(--ink-c)]"
            style={{ fontFamily: DISPLAY }}
          >
            iGEM 2026
          </span>
        </div>
        {/* These links sit over the deep field, so they are paper-white, not
            ink — dark type on the purple was unreadable. */}
        <nav
          className="hidden items-center gap-9 md:flex"
          style={{ color: C.paper, fontFamily: DISPLAY }}
        >
          {["Project", "Wet Lab", "Dry Lab", "Human Practices", "Team"].map((l, i) => (
            <button
              key={l}
              type="button"
              className="group relative cursor-pointer whitespace-nowrap pb-2 text-[16px] font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
              style={{ letterSpacing: "0.01em", fontFamily: "inherit", color: "inherit" }}
            >
              {l}
              <Underline index={i} active={i === 0} />
            </button>
          ))}
        </nav>

        {/* Phones had no navigation at all — the links were simply hidden below
            md. For an iGEM wiki that is the worst possible thing to drop on
            small screens, since findability is a judging criterion. */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
          className="flex size-10 items-center justify-center md:hidden"
          style={{
            background: C.paper,
            border: `2.5px solid ${C.ink}`,
            borderRadius: 8,
            boxShadow: `3px 3px 0 ${C.ink}`,
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
            {(menu ? [7] : [1, 7, 13]).map((y, i) => (
              <line
                key={i}
                x1="1"
                y1={y}
                x2="17"
                y2={y}
                stroke={C.ink}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </button>
      </header>

      {menu && (
        <div
          className="relative z-20 mx-6 mb-2 md:hidden"
          style={{
            background: C.paper,
            border: `2.5px solid ${C.ink}`,
            borderRadius: 10,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          {["Project", "Wet Lab", "Dry Lab", "Human Practices", "Team"].map((l, i) => (
            <button
              key={l}
              type="button"
              className="block w-full cursor-pointer px-5 py-3 text-left text-[15px] font-bold"
              style={{
                fontFamily: DISPLAY,
                color: C.ink,
                borderTop: i ? `1.5px solid ${C.ink}22` : undefined,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* --------------------------------------------------------- hero */}
      <div className="relative z-10 mx-auto grid max-w-[92rem] items-center gap-3 px-6 pb-8 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-10 md:pb-24">
        <div className="order-2 md:order-1">
          {/*
            A chapter label, not a control. It used to carry the same paper
            fill, ink border and hard offset shadow as the secondary button —
            two different affordances wearing one appearance, which made the
            page ambiguous about what could be pressed. The offset shadow now
            means exactly one thing: pressable.

            Neither reference wiki boxes its chapter label. Wuxi's "02 · HOW
            THE KIDNEY WORKS" and GlycoGarden's "ACT I — WHY GLYCANS MATTER"
            are plain letterspaced colour, and so is this.
          */}
          <span
            className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ fontFamily: DISPLAY, color: C.redDeep }}
          >
            <span className="block h-0.5 w-7" style={{ background: C.red }} />
            01 · Pharmacogenomics
          </span>

          <h1
            className="mt-4 font-black md:mt-7"
            style={{
              fontSize: "clamp(2.7rem, 5.9vw, 5rem)",
              lineHeight: 0.94,
              letterSpacing: "-0.042em",
            }}
          >
            Your genes <br />
            decide <br />
            your <span style={{ color: C.red }}>dose.</span>
          </h1>

          <p
            className="mt-4 max-w-md text-[16px] font-medium leading-relaxed md:mt-6 md:text-[17px]"
            style={{ color: `${C.ink}c4` }}
          >
            One gene decides how your body clears a widely used chemotherapy drug. For some people,
            the standard dose is the danger.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
            <button
              className="px-6 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: DISPLAY,
                background: C.redDeep,
                border: `2.5px solid ${C.ink}`,
                borderRadius: 6,
                boxShadow: `4px 4px 0 ${C.ink}`,
              }}
            >
              Follow the gene
            </button>
            <button
              className="px-6 py-3 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
              style={{
                fontFamily: DISPLAY,
                background: C.paper,
                color: C.ink,
                border: `2.5px solid ${C.ink}`,
                borderRadius: 6,
                boxShadow: `4px 4px 0 ${C.ink}`,
              }}
            >
              Explore the project
            </button>
          </div>
        </div>

        {/* the strand */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative h-[34vh] w-full max-w-[520px] md:h-[82vh]">
            <Helix onFirstDrag={() => setDragged(true)} />
            <div
              className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center"
              style={{
                opacity: dragged ? 0 : 1,
                transition: "opacity 500ms ease",
              }}
            >
              <span
                className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: C.paper, opacity: 0.75 }}
              >
                <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
                  <path
                    d="M2 5h22M2 5l4-3.5M2 5l4 3.5M24 5l-4-3.5M24 5l-4 3.5"
                    stroke={C.paper}
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="md:hidden">Drag the strand</span>
                <span className="hidden md:inline">Drag the strand · hover a pair</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /*
          One authored entrance with anticipation and overshoot, instead of
          eight objects bobbing on infinite sine loops. Ambient motion
          everywhere is what makes a page read as generated; the reference
          wikis hold still and move one thing deliberately.
        */
        @keyframes enter {
          0%   { opacity: 0; transform: translate(-50%,-50%) rotate(var(--rot,0deg)) scale(0.6); }
          70%  { opacity: 1; transform: translate(-50%,-50%) rotate(var(--rot,0deg)) scale(1.06); }
          100% { opacity: 1; transform: translate(-50%,-50%) rotate(var(--rot,0deg)) scale(1); }
        }

        /*
          Depth parallax. Each object offsets by its own --d, so near objects
          travel and far ones barely move — the cue that actually reads as
          space. The transform runs only after the entrance has finished, so
          the two never fight over the same property.
        */
        .parallax {
          transform: translate(-50%, -50%)
            translate(calc(var(--px, 0px) * var(--d, 0.5)), calc(var(--py, 0px) * var(--d, 0.5)))
            rotate(var(--rot, 0deg));
          transition: none;
        }
        .parallax.enter { animation-fill-mode: backwards; }
        .enter {
          animation: enter 760ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Particles in suspension actually drift, so this motion is earned. */
        @keyframes float {
          0%, 100% { transform: translate(-50%,-50%) translateY(0); }
          50%      { transform: translate(-50%,-50%) translateY(-10px); }
        }
        .float {
          animation: float ease-in-out infinite;
        }

        /* The callout draws itself, the way a diagram is annotated. */
        /*
          Portrait: the field is a band across the TOP, curving away at its
          lower edge, with the strand inside it and the copy on cream below.
          Landscape: it returns to the right-hand column.
        */
        .field {
          inset: 0 0 auto 0;
          width: 100%;
          height: 46%;
          clip-path: ellipse(150% 100% at 50% 0%);
        }
        @media (min-width: 768px) {
          .field {
            inset: 0 0 0 auto;
            width: 58%;
            height: 100%;
            clip-path: ellipse(96% 128% at 88% 42%);
          }
        }

        /* The field's stripes drift — light moving across the scene. */
        @keyframes sheen {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 180px -180px, 0 0; }
        }

        /* Hover paints the marker stroke on, left to right. */
        .group:hover [data-underline] { opacity: 1 !important; transform: scaleX(1) !important; }

        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.82); }
          70%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .enter, .float { animation: none; }
          [style*="sheen"] { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
