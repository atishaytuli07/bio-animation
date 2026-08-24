import { createFileRoute, redirect } from "@tanstack/react-router";
import { TopNav } from "@/components/story/TopNav";
import { StoryCanvas } from "@/components/story/StoryCanvas";
import { StoryAppendix } from "@/components/story/StoryAppendix";
import { Atmosphere } from "@/components/story/visuals";
import { ChapterHero } from "@/components/story/ChapterHero";
import { StoryOpening } from "@/components/story/StoryOpening";
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

const TITLE = "ChemoGuard — Precision starts in your DNA";
const DESCRIPTION =
  "An interactive story about DPYD gene variants, DPD deficiency and fluoropyrimidine chemotherapy toxicity — and the pre-treatment test that prevents it.";

/**
 * The root currently REDIRECTS to /new.
 *
 * /new is the approved-direction hero concept and the only thing being shown
 * to the client. Everything below this line is the previous visual direction,
 * which the client rejected — if she landed on it by trimming the URL she
 * would reasonably conclude nothing had changed.
 *
 * To bring the old story back, delete the `beforeLoad` below. Nothing else
 * about this route has been touched.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/new" });
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "ChemoGuard — iGEM 2026" },
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

function Story() {
  // True once the hero's stage exists — GL context live, or the SVG fallback
  // confirmed as the stage on machines that won't get WebGL.

  return (
    <main className="min-h-screen">
      <StoryCanvas />
      <Atmosphere />
      <TopNav />

      {/* One continuous opening: the strand alone, then ChemoGuard beside it,
          then the camera pulls out of the nucleus to the two patients it was
          inside. Visual leads; the thesis lands last. */}
      <StoryOpening />

      <ChapterOpen />
      <ChapterEmma />
      <ChapterDrug />
      <ChapterZoom />
      {/* The 3D dive now lives at The Discovery — the payoff of travelling
          into the body, not an abstract splash. */}
      <ChapterHero />
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
