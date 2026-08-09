/**
 * One requestAnimationFrame loop for the whole page.
 *
 * Every chapter used to run its own rAF; a dozen chapters meant a dozen loops
 * competing each frame. They all share this one instead. The loop only exists
 * while something is subscribed, and it parks itself when the tab is hidden —
 * a backgrounded tab should not be integrating springs.
 */
type Tick = (dt: number, now: number) => void;

const subscribers = new Set<Tick>();
let raf = 0;
let last = 0;

function frame(now: number) {
  // Clamp dt so a stalled tab (or a breakpoint) can't fire one enormous step
  // that flings every spring past its target.
  const dt = Math.min(0.048, (now - last) / 1000);
  last = now;
  for (const cb of subscribers) cb(dt, now);
  raf = requestAnimationFrame(frame);
}

function start() {
  if (raf || !subscribers.size) return;
  if (typeof document !== "undefined" && document.hidden) return;
  last = performance.now();
  raf = requestAnimationFrame(frame);
}

function stop() {
  if (!raf) return;
  cancelAnimationFrame(raf);
  raf = 0;
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
}

export function subscribe(cb: Tick) {
  subscribers.add(cb);
  start();
  return () => {
    subscribers.delete(cb);
    if (!subscribers.size) stop();
  };
}
