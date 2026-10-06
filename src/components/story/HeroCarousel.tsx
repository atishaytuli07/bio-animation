import { asset, C, L, R } from "@/components/hero/palette";
import { HOLD, type Carousel } from "@/hooks/use-carousel";

// A hero made of photographs instead of the purple field. The Team page uses it: the team's own pictures are
// the best thing that page has, and they were sitting halfway down it.
// Each photograph is shown whole, in a frame, and a blurred, darkened copy of it fills the hero behind. The
// pictures are group shots 1280px wide, so stretching one across a wide screen would soften every face and
// crop the back row; the copy behind can be any size because it is only colour.
// It moves on its own, so it can be stopped: there is a pause button, it waits while the pointer or the
// keyboard is on it, and it does not start at all for a reader who has asked for less motion.

export type Slide = {
  /** Base name in public/, served as `<file>-800.webp` and `<file>-1280.webp`. */
  file: string;
  alt: string;
  caption: string;
};

/** The hero's ground: the photograph in view, out of focus and darkened so the title reads on any picture. */
export function SlideBackdrop({ slides, at }: { slides: readonly Slide[]; at: number }) {
  return (
    <div aria-hidden="true" className="absolute inset-0" style={{ background: C.ink }}>
      {slides.map((s, i) => (
        <img
          key={s.file}
          src={asset(`${s.file}-800.webp`)}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full scale-110 select-none object-cover transition-opacity duration-1000 motion-reduce:transition-none"
          style={{ opacity: i === at ? 1 : 0, filter: "blur(26px) saturate(1.1)" }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(100deg, ${C.ink}d1 0%, ${C.ink}8c 50%, ${C.ink}4d 100%)`,
        }}
      />
    </div>
  );
}

export function SlideFrame({ slides, show }: { slides: readonly Slide[]; show: Carousel }) {
  const { at, playing, canPlay, go, toggle, hold } = show;
  const current = slides[at];
  const control =
    "grid h-9 w-9 shrink-0 place-items-center text-[15px] font-bold leading-none transition-transform active:translate-y-[1px]";
  const controlStyle = {
    background: C.paper,
    color: C.ink,
    border: `2.5px solid ${C.ink}`,
    borderRadius: R.sm,
    boxShadow: `3px 3px 0 ${C.ink}`,
  } as const;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Team photographs"
      onPointerEnter={() => hold(true)}
      onPointerLeave={() => hold(false)}
      onFocus={() => hold(true)}
      onBlur={() => hold(false)}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{
          background: C.ink,
          border: `3px solid ${C.paper}`,
          borderRadius: R.md,
          boxShadow: "0 22px 40px rgba(0,0,0,0.38)",
        }}
      >
        {slides.map((s, i) => (
          <img
            key={s.file}
            src={asset(`${s.file}-1280.webp`)}
            srcSet={`${asset(`${s.file}-800.webp`)} 800w, ${asset(`${s.file}-1280.webp`)} 1280w`}
            sizes="(min-width: 1024px) 640px, 100vw"
            width={1280}
            height={960}
            alt={i === at ? s.alt : ""}
            aria-hidden={i === at ? undefined : "true"}
            // the first is the page's opening picture; the rest are not seen for six seconds
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            // The picture in view eases in very slightly over the time it stays, so a still photograph does not
            // sit dead between changes.
            className="absolute inset-0 h-full w-full select-none object-cover transition-[opacity,transform] ease-out motion-reduce:transition-none"
            style={{
              opacity: i === at ? 1 : 0,
              transform: i === at && playing ? "scale(1.045)" : "scale(1)",
              transitionDuration: `900ms, ${HOLD + 900}ms`,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(at - 1)}
              aria-label="Previous photograph"
              className={control}
              style={controlStyle}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(at + 1)}
              aria-label="Next photograph"
              className={control}
              style={controlStyle}
            >
              →
            </button>
          </>
        )}
        {canPlay && (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause the photographs" : "Play the photographs"}
            className={control}
            style={controlStyle}
          >
            <span aria-hidden="true" className="text-[12px]">
              {playing ? "❚❚" : "▶"}
            </span>
          </button>
        )}
        <p
          // announced only when the reader changed it; while it plays on its own a screen reader is left alone
          aria-live={playing ? "off" : "polite"}
          // its own dark backing: the ground behind it is a photograph, lighter in some than in others
          className="min-w-0 flex-1 rounded-[6px] px-2.5 py-1.5 text-[14px] leading-snug md:text-[15px]"
          style={{ color: C.paper, background: `${C.ink}99` }}
        >
          <span className={`${L.note} mr-2`} style={{ color: `${C.paper}cc` }}>
            {at + 1} / {slides.length}
          </span>
          {current?.caption}
        </p>
      </div>
    </div>
  );
}
