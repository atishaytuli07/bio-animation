import { useEffect, useState } from "react";

/**
 * The page's colour grade.
 *
 * Each act owns a canvas colour and the background crossfades between them as
 * the story moves — the site changes mood with the narrative rather than
 * sitting on one flat backdrop.
 *
 * It also writes the active colour to `--paper` on <html>, so every scrim and
 * surface that pools "the page colour" behind text follows the act instead of
 * staying a stale white.
 */
const ACTS = [
  // setup: hero → "one dose doesn't fit everyone" → Emma
  { anchor: null, token: "--act-setup" },
  { anchor: "problem", token: "--act-setup" },
  // alarm: the drug enters → the zoom to the variant → accumulation → silence
  // (ChapterSilence lays --night over this, so the alarm deepens to near-black
  // at the low point without needing a fourth canvas)
  { anchor: "why", token: "--act-alarm" },
  { anchor: "discovery", token: "--act-alarm" },
  // hope: test first → results → the future → the work behind it
  { anchor: "solution", token: "--act-hope" },
  { anchor: "results", token: "--act-hope" },
  { anchor: "future", token: "--act-hope" },
  { anchor: "work", token: "--act-hope" },
] as const;

export function StoryCanvas() {
  const [token, setToken] = useState<string>(ACTS[0].token);

  useEffect(() => {
    const onScroll = () => {
      // The act you are in is the last one whose anchor has passed the middle
      // of the viewport — the same rule the chapter rail uses, so the colour
      // and the rail can never disagree about where you are.
      const mid = window.innerHeight * 0.45;
      let current: string = ACTS[0].token;
      for (const act of ACTS) {
        if (!act.anchor) continue;
        const el = document.getElementById(act.anchor);
        if (el && el.getBoundingClientRect().top <= mid) current = act.token;
      }
      setToken(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(token).trim();
    if (value) root.style.setProperty("--paper", value);
    // The hope act is cream, so the foreground has to invert with it.
    root.classList.toggle("act-light", token === "--act-hope");
  }, [token]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{
        backgroundColor: `var(${token})`,
        transition: "background-color 1200ms cubic-bezier(.4,0,.2,1)",
      }}
    />
  );
}
