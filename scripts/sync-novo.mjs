/**
 * Dodaje proizvode iz src/data/novo.json u katalog Lumora Admin aplikacije (admin/src/data/catalog.json),
 * da se novi proizvodi pojave u aplikaciji pri porudžbini. Postojeći proizvodi se ne diraju.
 * Pokretanje (posle izmene novo.json):  node scripts/sync-novo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const novo = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/novo.json"), "utf8")).products;
const file = path.join(ROOT, "admin/src/data/catalog.json");
const cat = JSON.parse(fs.readFileSync(file, "utf8"));

const COLOR = { white: "bela", beige: "bež", gray: "siva", black: "crna", pink: "roze", green: "maslinasto zelena", red: "crvena" };
for (const p of novo) {
  const entry = {
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    colors: p.colors.map((k) => ({ key: k, label: COLOR[k] ?? k })),
    image: p.images[0] ? p.images[0].src.replace(/^\//, "") : "",
  };
  const i = cat.products.findIndex((x) => x.slug === p.slug);
  if (i >= 0) cat.products[i] = entry;
  else cat.products.push(entry);
}
cat.version = parseInt(crypto.createHash("sha1").update(JSON.stringify(cat.products)).digest("hex").slice(0, 7), 16);
fs.writeFileSync(file, JSON.stringify(cat, null, 1), "utf8");
console.log(`✓ ${novo.length} novih proizvoda u katalogu aplikacije (v${cat.version}); ukupno ${cat.products.length}`);
