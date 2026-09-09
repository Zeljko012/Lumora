// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { SITE } from "./src/data/site.ts";

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  output: "static",
  adapter: vercel(),
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
