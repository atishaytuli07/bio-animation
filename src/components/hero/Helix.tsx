import { useEffect, useRef } from "react";

import {
  BASES,
  C,
  HBOT,
  HR,
  HTOP,
  HX,
  PAIRS,
  PAIR_LETTERS,
  TURNS,
  VARIANT,
  VARIANT_LETTERS,
} from "./palette";

/**
 * The interactive strand.
 *
 * Three interactions, each of which has to earn its place by teaching
 * something or making the object feel real — the project's own rule is that an
 * animation which does neither gets removed:
 *
 *   · DRAG to spin it. Direct manipulation with inertia, so it reads as an
 *     object you are holding rather than a looping animation played at you.
 *   · HOVER a rung and the pair names itself (A·T, G·C). This teaches the
 *     base-pair notation the entire visual system is derived from — and it is
 *     how a visitor discovers that the red one says something different.
 *   · CURSOR PARALLAX, eased, so the strand has weight.
 *
 * Everything per-frame is written straight to the DOM through refs. React
 * state here would mean a re-render every frame for no benefit.
 */
/** Radians of strand rotation per pixel of pointer travel. */
const DRAG_SENS = 0.012;

/**
 * The pairs the descent turns to and names, in order.
 *
 * HOVER WAS THE ONLY WAY TO SEE THESE, which meant most readers never did: it
 * needs a pointer, it needs the reader to guess that a thin rung is a target,
 * and it is unavailable on every phone. The notation the entire colour system
 * is built on was hidden behind a gesture. Now the scroll walks them.
 *
 * THEY ARE ADJACENT, AND THEY SIT NEXT TO THE VARIANT. Spread stops (2, 5, 8,
 * 11) read better on paper and are unusable in motion: the camera scales about
 * the variant, so by the time the reader reaches the third stop a rung near the
 * top of the strand has been pushed off the frame entirely — at k=2.3, rung 2
 * lands at y=-362 in a 760-tall viewBox. Neighbours of the variant stay in
 * shot at every zoom the descent reaches.
 *
 * Indices 11-14 are also the four DISTINCT pairs — 11%4 through 14%4 covers
 * C·G, A·T, T·A and G·C — so the reader meets the whole notation, once each,
 * with nothing repeated.
 *
 * The fifth stop is the variant, and it is deliberately NOT named. The strand
 * turns to present it and the label stays away, because the mutation is the
 * sequence's reveal three beats later; naming it here would spend the payoff
 * early and then spend it again. The reader learns the grammar on four pairs
 * and arrives at a fifth that does not get a caption.
 */
const AIM = [11, 12, 13, 14, VARIANT];
/** Stops that show a label. The last (the variant) is silent. */
const NAMED = AIM.length - 1;
/** Resting lean, in degrees. A perfectly upright strand reads as a diagram;
 *  a tilted one reads as an object sitting in space. */
const BASE_TILT = 9;

/**
 * How far the camera travels into the strand at full zoom. The variant sits at
 * the centre of the scale, so the journey ends with it filling the frame.
 */
const MAX_ZOOM = 2.9;

export function Helix({
  onFirstDrag,
  zoom = 0,
  focus = 0,
  flatten = 0,
  read = 0,
}: {
  onFirstDrag: () => void;
  /** 0 = the hero's whole strand · 1 = arrived at the variant. */
  zoom?: number;
  /** 0 = every base equal · 1 = only the variant matters. */
  focus?: number;
  /**
   * The reader's progress through the pairs, 0 → 1.
   *
   * Drives both halves of the same gesture: the strand TURNS to bring each
   * pair to the front, and the pair names itself when it gets there. Scroll is
   * the crank. See AIM above for which pairs and why.
   */
  read?: number;
  /**
   * 0 = a helix · 1 = collapsed to nothing, handing the frame to the readable
   * sequence. The two backbones converge on the axis and the rungs shorten to
   * points, so the structure appears to fold shut rather than simply fade —
   * the strand gives way to the letters instead of being swapped for them.
   */
  flatten?: number;
}) {
  const rungs = useRef<(SVGGElement | null)[]>([]);
  const hits = useRef<(SVGLineElement | null)[]>([]);
  const nodesA = useRef<(SVGCircleElement | null)[]>([]);
  const nodesB = useRef<(SVGCircleElement | null)[]>([]);
  const pathA = useRef<SVGPathElement>(null);
  const pathB = useRef<SVGPathElement>(null);
  const tilt = useRef<SVGGElement>(null);
  const label = useRef<SVGGElement>(null);
  const labelText = useRef<SVGTextElement>(null);

  const leader = useRef<SVGPathElement>(null);
  const castRef = useRef<SVGPathElement>(null);
  const calloutRef = useRef<SVGGElement>(null);
  const root = useRef<SVGGElement>(null);

  const hover = useRef<number | null>(null);
  // `pending` accumulates raw pointer movement between frames. While the
  // pointer is down the strand turns by exactly that much — 1:1 and unbounded,
  // so you can keep spinning it forever. Only on release does it become
  // velocity and decay.
  const drag = useRef({ active: false, lastX: 0, pending: 0, vel: 0, moved: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  /** Whether the pointer is over the strand — gates the hit-target updates. */
  const overRef = useRef(false);
  // The rAF closure is created once, so the scroll-driven values reach it
  // through refs rather than by tearing down and rebuilding the loop.
  const nav = useRef({ zoom: 0, focus: 0, flatten: 0, read: 0 });
  nav.current.zoom = zoom;
  nav.current.focus = focus;
  nav.current.flatten = flatten;
  nav.current.read = read;
  /** Cached bounding box; invalidated on resize rather than read per event. */
  const rect = useRef<DOMRect | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    let phase = 0;
    let last = performance.now();
    let tx = 0;
    let ty = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const z = nav.current.zoom;
      const foc = nav.current.focus;
      const flat = nav.current.flatten;
      const rd = nav.current.read;

      /*
        WHERE THE READER IS AMONG THE PAIRS.

        `rd` is split into equal stops. Within a stop, `local` runs 0 → 1, and
        the label's opacity is a tent over it — up at the start, down at the
        end — so each pair announces itself and then hands over rather than one
        caption cutting to another mid-word. The ×5 makes the fade about a
        tenth of a stop at each end: quick enough not to feel like waiting,
        slow enough not to blink.
      */
      const pos = Math.min(0.9999, Math.max(0, rd)) * AIM.length;
      const si = Math.min(AIM.length - 1, Math.floor(pos));
      const local = pos - si;
      const aim = AIM[si]!;
      const naming =
        rd > 0.001 && si < NAMED ? Math.max(0, Math.min(1, Math.min(local, 1 - local) * 5)) : 0;

      if (!reduced) {
        if (drag.current.active) {
          // Direct manipulation: the strand turns by exactly what the hand
          // moved this frame, with no decay and no limit. Previously the drag
          // fed a decaying velocity, so holding and turning slowly made the
          // strand stall against you instead of following.
          const step = drag.current.pending * DRAG_SENS;
          phase += step;
          drag.current.pending = 0;
          // Remember the last real movement so releasing throws it.
          drag.current.vel = step * 0.6 + drag.current.vel * 0.4;
        } else {
          /*
            THE IDLE DRIFT STANDS DOWN ONCE THE SCROLL TAKES OVER.

            A constant 0.42 rad/s was the whole of the strand's motion, and it
            kept running underneath the descent — so the reader's scroll and a
            metronome were turning the same object at once, and every attempt
            to bring a specific pair to the front had to out-pull a spin that
            never stopped. That is why the arrival used to look like it drifted
            into place rather than being aimed.

            Below, the drift fades out as `read` or `zoom` engages and the
            scroll becomes the crank. A tenth is left running so a strand the
            reader has stopped scrolling still breathes instead of freezing
            mid-turn.
          */
          const driven = Math.min(1, Math.max(z, rd) * 1.4);
          phase += dt * 0.42 * (1 - driven * 0.9) + drag.current.vel;
          drag.current.vel *= 0.94;
        }
      }

      // The helix closes: radius shrinks to nothing and the whole group goes
      // with it, so the sequence inherits a frame that has been vacated
      // rather than one that was cross-faded over.
      const radius = HR * (1 - flat);
      const visible = Math.max(0, 1 - flat * 1.25);
      root.current?.setAttribute("opacity", visible.toFixed(3));
      // Once the strand has folded away there is nothing to draw, but the loop
      // was still writing ~340 attributes a frame into an invisible group.
      // Skip the geometry entirely; the sequence owns the frame now.
      if (visible <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      /*
        Travelling in. The strand's rotation is eased to the angle that
        presents the pair being read to the front, and the camera scales about
        the variant — so the journey ends with the one wrong base filling the
        frame rather than wherever the spin happened to leave it.

        THE AIM IS NOW THE READING CURSOR, not always the variant. It used to
        lock onto the variant the moment the descent began, which meant the
        strand reached its final angle within a few percent of scroll and then
        held it for the rest of the descent — a still image with a caption
        moving over it. Following the cursor makes every stop a quarter-turn
        the reader drives: rung 11 comes round, names itself, and the next
        scroll turns the strand to 12. The last stop is the variant, so the
        old behaviour is the end of the new one rather than a special case.

        Drag always wins. A hand on the strand must not be fighting an easing.
      */
      const present = rd > 0.001 ? aim : z > 0.001 ? VARIANT : -1;
      if (present >= 0 && !drag.current.active) {
        const vt = present / (PAIRS - 1);
        const want = -vt * TURNS * Math.PI * 2; // puts cos(angle) at 1
        const d = want - phase;
        // shortest way round, so it never unwinds the long way
        phase += Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(0.12, 0.045 + z * 0.09);
      }

      tx += (pointer.current.x * 5 - tx) * 0.06;
      ty += (pointer.current.y * -4 - ty) * 0.06;

      // The lean straightens as we arrive: a tilted strand reads as an object
      // on a shelf, an upright one as somewhere you are standing inside.
      const lean = (BASE_TILT + ty) * (1 - z * 0.85);
      const k = 1 + z * (MAX_ZOOM - 1);
      const vt2 = VARIANT / (PAIRS - 1);
      const vy = HTOP + vt2 * (HBOT - HTOP);
      // The variant orbits the axis, so the scale has to be centred on the
      // BASE, not on the helix's centreline. Centring on the axis left the
      // strand walking off the right of the frame as the zoom deepened.
      const vx = HX + Math.cos(vt2 * TURNS * Math.PI * 2 + phase) * radius;
      tilt.current?.setAttribute(
        "transform",
        `translate(${(vx - vx * k).toFixed(1)} ${(vy - vy * k).toFixed(1)}) scale(${k.toFixed(3)}) rotate(${lean.toFixed(2)} ${HX} 380) skewY(${(tx * (1 - z)).toFixed(2)})`,
      );

      let da = "";
      let db = "";
      const h = hover.current;

      for (let i = 0; i < PAIRS; i++) {
        const t = i / (PAIRS - 1);
        const y = HTOP + t * (HBOT - HTOP);
        const a = t * TURNS * Math.PI * 2 + phase;
        const cos = Math.cos(a);
        const xa = HX + cos * radius;
        const xb = HX - cos * radius;
        const near = (Math.sin(a) + 1) / 2;
        const lifted = h === i || (naming > 0.15 && i === aim);
        /*
          `focus` fades every rung but the variant. The pair currently being
          read is exempt: without this, the last two stops are named while
          being dimmed by 58%, so the strand argues with its own caption.
        */
        const held = i === VARIANT || (naming > 0.05 && i === aim);

        da += `${i ? "L" : "M"}${xa.toFixed(1)},${y.toFixed(1)}`;
        db += `${i ? "L" : "M"}${xb.toFixed(1)},${y.toFixed(1)}`;

        const g = rungs.current[i];
        if (g) {
          const line = g.firstElementChild as SVGLineElement | null;
          if (line) {
            line.setAttribute("x1", xa.toFixed(1));
            line.setAttribute("x2", xb.toFixed(1));
            line.setAttribute("y1", y.toFixed(1));
            line.setAttribute("y2", y.toFixed(1));
            line.setAttribute("stroke-width", lifted ? "14" : i === VARIANT ? "13" : "6");
          }
          // Rungs edge-on are nearly invisible; the hovered one is always full.
          const base = 0.18 + Math.abs(cos) * 0.82;
          // Focus fades every rung but the variant, so arriving at the gene
          // means the rest of the genome quietly gets out of the way.
          const dimmed = held ? base : base * (1 - foc * 0.58);
          g.setAttribute("opacity", lifted ? "1" : dimmed.toFixed(3));
        }

        const hit = hits.current[i];
        if (hit && overRef.current) {
          hit.setAttribute("x1", xa.toFixed(1));
          hit.setAttribute("x2", xb.toFixed(1));
          hit.setAttribute("y1", y.toFixed(1));
          hit.setAttribute("y2", y.toFixed(1));
        }

        const ca = nodesA.current[i];
        if (ca) {
          ca.setAttribute("cx", xa.toFixed(1));
          ca.setAttribute("cy", y.toFixed(1));
          ca.setAttribute("r", (lifted ? 13 : 6.5 + near * 5).toFixed(1));
          // Depth by value as well as size: a base at the back of the turn is
          // dimmer, which is what stops the strand reading as a flat zigzag.
          const oa = (0.55 + near * 0.45) * (held ? 1 : 1 - foc * 0.58);
          ca.setAttribute("opacity", lifted ? "1" : oa.toFixed(2));
        }
        const cb = nodesB.current[i];
        if (cb) {
          cb.setAttribute("cx", xb.toFixed(1));
          cb.setAttribute("cy", y.toFixed(1));
          cb.setAttribute("r", (lifted ? 13 : 11.5 - near * 5).toFixed(1));
          const ob = (1 - near * 0.45) * (held ? 1 : 1 - foc * 0.58);
          cb.setAttribute("opacity", lifted ? "1" : ob.toFixed(2));
        }
      }

      /*
        The label, named once rather than inside the rung loop.

        IT COUNTER-SCALES. The label lives inside the tilt group so it stays
        locked to its rung, which also means it inherits the camera's zoom —
        harmless when the only way to see it was to hover the un-zoomed hero,
        and not harmless now that the scroll shows it at k up to 2.9. A caption
        that grows to three times its size as you scroll is not a caption. The
        1/k on its own transform holds it at a constant size on screen while
        the strand behind it keeps growing.

        A hovered rung outranks the reading cursor: a hand on the object beats
        a schedule.
      */
      const showIdx = h !== null ? h : naming > 0.02 ? aim : null;
      if (showIdx === null || !label.current || !labelText.current) {
        label.current?.setAttribute("opacity", "0");
      } else {
        const inv = 1 / k;
        const ly = HTOP + (showIdx / (PAIRS - 1)) * (HBOT - HTOP);
        label.current.setAttribute(
          "transform",
          `translate(${(HX - 46 * inv).toFixed(1)} ${(ly - 58 * inv).toFixed(1)}) scale(${inv.toFixed(3)})`,
        );
        label.current.setAttribute("opacity", (h !== null ? 1 : naming).toFixed(3));
        labelText.current.textContent =
          showIdx === VARIANT ? VARIANT_LETTERS : PAIR_LETTERS[showIdx % PAIR_LETTERS.length]!;
        labelText.current.setAttribute("fill", showIdx === VARIANT ? C.red : C.ink);
      }

      // The leader line follows the variant around its orbit instead of
      // pointing at a fixed spot the base has already left. Anchored end stays
      // put so the label remains readable; only the tip tracks.
      {
        const vt = VARIANT / (PAIRS - 1);
        const va = vt * TURNS * Math.PI * 2 + phase;
        const vx = HX + Math.cos(va) * radius;
        const vyNow = HTOP + vt * (HBOT - HTOP);
        leader.current?.setAttribute(
          "d",
          `M-96 ${vyNow} C -40 ${vyNow}, ${(vx - 78).toFixed(1)} ${(vyNow - 24).toFixed(1)}, ${(vx - 16).toFixed(1)} ${(vyNow - 4).toFixed(1)}`,
        );
      }

      calloutRef.current?.setAttribute("opacity", Math.max(0, 1 - z * 3).toFixed(2));

      pathA.current?.setAttribute("d", da);
      castRef.current?.setAttribute("d", da);
      pathB.current?.setAttribute("d", db);
      if (foc > 0.001) {
        pathA.current?.setAttribute("opacity", (1 - foc * 0.32).toFixed(2));
        pathB.current?.setAttribute("opacity", (0.3 * (1 - foc * 0.32)).toFixed(2));
        castRef.current?.setAttribute("opacity", (0.22 * (1 - foc)).toFixed(2));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const invalidate = () => {
      rect.current = null;
    };
    window.addEventListener("resize", invalidate);
    window.addEventListener("scroll", invalidate, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("scroll", invalidate);
    };
  }, []);

  // Static first paint, identical maths at phase 0 — there is never a frame
  // without a strand, and hydration has nothing to correct. Values are rounded
  // because unrounded Math.cos output differs between server and client and
  // trips a hydration mismatch.
  const initial = Array.from({ length: PAIRS }, (_, i) => {
    const t = i / (PAIRS - 1);
    const a = t * TURNS * Math.PI * 2;
    const r1 = (v: number) => Math.round(v * 10) / 10;
    return {
      y: r1(HTOP + t * (HBOT - HTOP)),
      xa: r1(HX + Math.cos(a) * HR),
      xb: r1(HX - Math.cos(a) * HR),
      cos: Math.round(Math.cos(a) * 1000) / 1000,
    };
  });

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    // Without this the browser begins a native text selection, which then
    // steals the pointer stream — the drag dies mid-gesture and will not
    // restart until you click elsewhere to clear the selection.
    e.preventDefault();
    drag.current.active = true;
    drag.current.lastX = e.clientX;
    drag.current.moved = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // The rect is cached, not measured per event. Reading it on every
    // pointermove forced a layout ~60 times a second during a drag; the box
    // only changes on resize, so it is measured there instead.
    const r = (rect.current ??= e.currentTarget.getBoundingClientRect());
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    drag.current.moved += Math.abs(dx);
    drag.current.pending += dx;
    if (drag.current.moved > 24) onFirstDrag();
  };
  const release = () => {
    drag.current.active = false;
  };

  const variantY = HTOP + (VARIANT / (PAIRS - 1)) * (HBOT - HTOP);

  return (
    <svg
      ref={svg}
      viewBox="-260 0 680 760"
      className="h-full w-full cursor-grab touch-none select-none overflow-visible active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerEnter={() => {
        overRef.current = true;
      }}
      onPointerLeave={() => {
        release();
        overRef.current = false;
        hover.current = null;
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <defs>
        <linearGradient id="strand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.paper} />
          <stop offset="50%" stopColor="#E8DCFB" />
          <stop offset="100%" stopColor={C.paper} />
        </linearGradient>
        <filter id="variantGlow" x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grab surface. Covers the entire viewBox so the strand can be taken
          hold of anywhere, not only where a rung happens to be painted. */}
      <rect x={-260} y={0} width={680} height={760} fill="transparent" />

      <g ref={root}>
        <g ref={tilt}>
          {/*
          Hand-drawn emphasis marks — the little dashes Wuxi scatters around
          its kidney. Cartoon shorthand for "look here", almost free to draw,
          and one of the strongest signals that a person made the picture
          rather than a generator. They sit behind the strand so they read as
          annotation on the page, not decoration on the object.
        */}
          {[
            { x: 24, y: 132, r: -26, w: 30 },
            { x: 40, y: 154, r: -26, w: 20 },
            { x: 372, y: 246, r: 24, w: 26 },
            { x: 388, y: 270, r: 24, w: 17 },
            { x: 16, y: 566, r: 22, w: 24 },
            { x: 380, y: 612, r: -20, w: 28 },
          ].map((m, i) => (
            <line
              key={`mark${i}`}
              x1={m.x}
              y1={m.y}
              x2={m.x + m.w}
              y2={m.y}
              stroke={C.paper}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.42}
              transform={`rotate(${m.r} ${m.x} ${m.y})`}
              style={{
                animation: `popIn 420ms cubic-bezier(0.22,1,0.36,1) ${900 + i * 70}ms both`,
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            />
          ))}

          {/* far backbone */}
          <path
            ref={pathB}
            d={initial.map((p, i) => `${i ? "L" : "M"}${p.xb},${p.y}`).join("")}
            fill="none"
            stroke="url(#strand)"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.3}
          />

          {initial.map((p, i) => {
            const isVariant = i === VARIANT;
            return (
              <g
                key={i}
                ref={(el) => {
                  rungs.current[i] = el;
                }}
                opacity={Math.round((0.25 + Math.abs(p.cos) * 0.75) * 1000) / 1000}
              >
                <line
                  x1={p.xa}
                  y1={p.y}
                  x2={p.xb}
                  y2={p.y}
                  stroke={isVariant ? C.red : BASES[i % BASES.length]}
                  strokeWidth={isVariant ? 13 : 6}
                  strokeLinecap="round"
                  filter={isVariant ? "url(#variantGlow)" : undefined}
                />
              </g>
            );
          })}

          {/*
          The near strand's cast shadow, drawn rather than filtered: the same
          path offset down and painted dark underneath. An SVG drop-shadow on
          geometry that is rewritten every frame re-rasterises the filter every
          frame; a second stroke costs nothing.
        */}
          <path
            ref={castRef}
            d={initial.map((p, i) => `${i ? "L" : "M"}${p.xa},${p.y}`).join("")}
            fill="none"
            stroke="#2A1857"
            strokeWidth={13}
            strokeLinecap="round"
            opacity={0.22}
            transform="translate(0 7)"
          />

          {/* near backbone */}
          <path
            ref={pathA}
            d={initial.map((p, i) => `${i ? "L" : "M"}${p.xa},${p.y}`).join("")}
            fill="none"
            stroke="url(#strand)"
            strokeWidth={12}
            strokeLinecap="round"
          />

          {/*
          The annotated callout, in the strand's own coordinate space so it
          stays locked to the variant at every viewport. It draws itself —
          ring, then leader line, then label — because an authored gesture with
          a beginning and an end is what separates designed motion from the
          ambient loops that make a page read as generated.

          NOTE: positioning and animation must live on SEPARATE elements. A CSS
          transform in a keyframe overrides an SVG transform attribute, which
          teleports the label to the top of the frame.
        */}
          {/*
            NO RING. There was a dashed circle here around the variant, and it
            was the FOURTH marker on the same rung: the rung is red, it carries
            a glow filter, and a leader line runs to a labelled callout. The
            ring added nothing the other three were not already saying.

            It was also the one device the client had rejected — in the body
            scene, where a dashed circle read as a zoom target on a hip. On a
            diagram it would not have read that way, but keeping the thing she
            asked to have removed, in a different place, on the first screen
            she sees, is not worth an element that was redundant anyway.
          */}
          <g ref={calloutRef}>
            {/* A curved leader, not a straight rule. Wuxi's "Renal artery" and
            "Renal vein" both hook toward what they name — a straight line is
            a diagram, a curved one looks drawn. */}
            <path
              ref={leader}
              d={`M-96 ${variantY} C -40 ${variantY}, ${HX - 130} ${variantY - 26}, ${HX - 64} ${variantY - 8}`}
              fill="none"
              stroke={C.paper}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              style={{ animation: "draw 520ms cubic-bezier(0.65,0,0.35,1) 1400ms both" }}
            />
            <g transform={`translate(-250, ${variantY - 19})`}>
              <g
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animation: "popIn 460ms cubic-bezier(0.22,1,0.36,1) 1820ms both",
                }}
              >
                <rect
                  width={150}
                  height={38}
                  rx={5}
                  fill={C.paper}
                  stroke={C.ink}
                  strokeWidth={3}
                />
                <text
                  x={75}
                  y={25}
                  textAnchor="middle"
                  fill={C.ink}
                  style={{ font: "700 17px system-ui, sans-serif", letterSpacing: "0.16em" }}
                >
                  DPYD
                </text>
              </g>
            </g>
          </g>

          {initial.map((p, i) => {
            const isVariant = i === VARIANT;
            const fill = isVariant ? C.red : BASES[i % BASES.length];
            return (
              <g key={`n${i}`}>
                <circle
                  ref={(el) => {
                    nodesB.current[i] = el;
                  }}
                  cx={p.xb}
                  cy={p.y}
                  r={9}
                  fill={fill}
                  opacity={0.5}
                />
                <circle
                  ref={(el) => {
                    nodesA.current[i] = el;
                  }}
                  cx={p.xa}
                  cy={p.y}
                  r={9}
                  fill={fill}
                  filter={isVariant ? "url(#variantGlow)" : undefined}
                />
              </g>
            );
          })}

          {/* the hovered pair names itself */}
          <g ref={label} opacity={0} style={{ pointerEvents: "none" }}>
            <rect width={92} height={34} rx={5} fill={C.paper} stroke={C.ink} strokeWidth={3} />
            <text
              ref={labelText}
              x={46}
              y={23}
              textAnchor="middle"
              style={{ font: "700 16px ui-monospace, monospace", letterSpacing: "0.06em" }}
            />
          </g>

          {/* Transparent hit targets, drawn last so they sit above everything. */}
          {initial.map((p, i) => (
            <line
              key={`h${i}`}
              ref={(el) => {
                hits.current[i] = el;
              }}
              x1={p.xa}
              y1={p.y}
              x2={p.xb}
              y2={p.y}
              stroke="transparent"
              strokeWidth={24}
              strokeLinecap="round"
              style={{ pointerEvents: "stroke" }}
              onPointerEnter={() => {
                hover.current = i;
              }}
              onPointerLeave={() => {
                if (hover.current === i) hover.current = null;
              }}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
