// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { SITE } from "./src/data/site.ts";

// Kada se gradi za GitHub Pages: DEPLOY_TARGET=pages
const PAGES = process.env.DEPLOY_TARGET === "pages";
const PAGES_SITE = "https://zeljko012.github.io";
const PAGES_BASE = "/Lumora";

// https://astro.build/config
export default defineConfig({
  site: PAGES ? PAGES_SITE : SITE.url,
  base: PAGES ? PAGES_BASE : "/",
  output: "static",
  adapter: PAGES ? undefined : vercel(),
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/kasa") &&
        !page.includes("/hvala") &&
        !page.includes("/korpa"),
    }),
  ],
  build: {
    inlineStylesheets: "auto",
  },
});
