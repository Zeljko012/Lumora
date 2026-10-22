// Pravi vercel.json sa preusmerenjima (301) sa starih Shopify adresa na nove, da se Google pozicije ne izgube.
// Pokretanje: node scripts/gen-redirects.mjs   (posle promene proizvoda / slug-ova)
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../src/data/products.ts", import.meta.url), "utf8");
const pairs = [];
for (const m of src.matchAll(/"slug":\s*"([^"]+)"[\s\S]*?"sourceHandle":\s*"([^"]+)"/g)) pairs.push([m[2], m[1]]);

const redirects = [];
const add = (source, destination) => redirects.push({ source, destination, permanent: true });

for (const [handle, slug] of pairs) {
  add(`/products/${handle}`, `/proizvod/${slug}`);
  add(`/collections/:c/products/${handle}`, `/proizvod/${slug}`);
}
// ostalo sa starog sajta
add("/collections/vaze", "/kategorija/vaze");
add("/collections/figure", "/kategorija/figure");
add("/collections/svecnjaci", "/kategorija/svecnjaci");
add("/collections/all", "/prodavnica");
add("/collections/:slug*", "/prodavnica");
add("/products/:slug*", "/prodavnica");
add("/cart", "/korpa");
add("/pages/contact", "/kontakt");
add("/pages/kontakt", "/kontakt");
add("/pages/:slug*", "/");
add("/blogs/:slug*", "/vodic");
add("/account/:slug*", "/");
add("/account", "/");

const out = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  framework: "astro",
  buildCommand: "npm run build",
  redirects,
  // slike proizvoda se retko menjaju: dugi keš ubrzava ponovne posete (30 dana)
  headers: [
    {
      source: "/images/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
    },
  ],
};
writeFileSync(new URL("../vercel.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`${pairs.length} proizvoda, ${redirects.length} preusmerenja`);
