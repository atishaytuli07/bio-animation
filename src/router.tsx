import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () =>
  createRouter({
    routeTree,
    /*
      Must match vite's base. Without it the router builds every link from /
      while the wiki is served from /<team-slug>/, so the first client-side
      navigation leaves the wiki and the router throws "Invariant failed".
      import.meta.env.BASE_URL is what vite's `base` compiles down to.
    */
    basepath: import.meta.env.BASE_URL,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
