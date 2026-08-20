import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ProgressRail } from "@/components/story/ProgressRail";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { StoryLoader } from "@/components/story/StoryLoader";
import { StoryAppendix } from "@/components/story/StoryAppendix";
import { Atmosphere } from "@/components/story/visuals";
import { ChapterHero } from "@/components/story/ChapterHero";
import { ChapterOpening } from "@/components/story/ChapterOpening";
import {
  ChapterOpen,
  ChapterEmma,
  ChapterDrug,
  ChapterZoom,
  ChapterAccumulation,
  ChapterSilence,
} from "@/components/story/ActOne";
import {
  ChapterSolution,
  ChapterSplit,
  ChapterResults,
  ChapterFuture,
  ChapterStatistics,
  StoryFooter,
} from "@/components/story/ActTwo";

const TITLE = "Precision Starts in Your DNA — DPYD Diagnostics";
const DESCRIPTION =
  "An interactive story about DPYD gene variants, DPD deficiency and fluoropyrimidine chemotherapy toxicity — and the pre-treatment test that prevents it.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "DPYD Diagnostics — iGEM 2026" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: Story,
});

/** Thin bar across the top: how far through the story you are. */
function FilmProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div
        className="h-full"
        style={{
          // scaleX would compress a gradient into a smear at low progress —
          // grow by width instead so the colour ramp stays put.
          width: `${p * 100}%`,
          background: "linear-gradient(90deg, var(--violet), var(--coral), var(--signal))",
        }}
      />
    </div>
  );
}

function Story() {
  // True once the hero's stage exists — GL context live, or the SVG fallback
  // confirmed as the stage on machines that won't get WebGL.
  // The opening scene is SVG — nothing heavy to wait for. The 3D dive is
  // mid-page and mounts on approach, so the gate opens on the min-hold alone.
  const [stageReady, setStageReady] = useState(true);
  const onStageReady = useCallback(() => setStageReady(true), []);

  return (
    <main className="min-h-screen">
      <StoryLoader ready={stageReady} />
      <StoryCanvas />
      <Atmosphere />
      <FilmProgress />
      <ProgressRail />

      {/* Visual-first opening: two patients, same dose, diverging outcomes.
          Zero jargon — the science is earned chapter by chapter. */}
      <ChapterOpening />

      <ChapterOpen />
      <ChapterEmma />
      <ChapterDrug />
      <ChapterZoom />
      {/* The 3D dive now lives at The Discovery — the payoff of travelling
          into the body, not an abstract splash. */}
      <ChapterHero onStageReady={onStageReady} />
      <ChapterAccumulation />
      <ChapterSilence />

      <ChapterSolution />
      <ChapterSplit />
      <ChapterResults />
      <ChapterFuture />
      <ChapterStatistics />
      <StoryAppendix />
      <StoryFooter />
    </main>
  );
}
