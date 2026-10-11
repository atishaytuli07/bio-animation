import { useEffect, useRef, useState } from "react";

// True once the element has been scrolled into view, and it never flips back. Motion that replays every time
// you pass it is noise, and the single most recognisable tell of a generated site. A figure that draws itself
// the first time a reader reaches it is a reward for arriving.
// Honours prefers-reduced-motion by reporting seen immediately, so the content is present rather than animated.
// `eager` reports seen as soon as any of the element is on screen, for a block that should not make the reader
// scroll an empty frame before it appears.
export function useSeen<T extends HTMLElement>(eager = false) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      eager ? { threshold: 0 } : { rootMargin: "0px 0px -12% 0px", threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  return [ref, seen] as const;
}
