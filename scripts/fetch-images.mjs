/**
 * Skida slike proizvoda sa Shopify CDN-a i konvertuje ih u WebP
 * u public/images/products/<slug>/<n>.webp  (+ <n>-lg.webp za zoom).
 *
 * Pokretanje:  npm run images
 * Bezbedno je pokrenuti više puta — preskače ono što već postoji.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public/images/products");
const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, "images.json"), "utf8"));

const FORCE = process.argv.includes("--force");
const WIDTH = 1200;
const WIDTH_LG = 2000;

fs.mkdirSync(OUT, { recursive: true });

async function download(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 LumoraBuild" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

let ok = 0;
let skip = 0;
let fail = 0;

for (const job of jobs) {
  const dir = path.join(OUT, job.slug);
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < job.urls.length; i++) {
    const n = i + 1;
    const base = path.join(dir, `${n}.webp`);
    const lg = path.join(dir, `${n}-lg.webp`);
    if (!FORCE && fs.existsSync(base) && fs.existsSync(lg)) {
      skip++;
      continue;
    }
    try {
      const buf = await download(job.urls[i]);
      const img = sharp(buf).flatten({ background: "#ece5d8" });
      await img
        .clone()
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(base);
      await img
        .clone()
        .resize({ width: WIDTH_LG, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(lg);
      ok++;
      process.stdout.write(`  ✓ ${job.slug}/${n}.webp\n`);
    } catch (e) {
      fail++;
      process.stdout.write(`  ✗ ${job.slug}/${n}  — ${e.message}\n`);
    }
  }
}

console.log(`\nGotovo. novih: ${ok}, preskočeno: ${skip}, greške: ${fail}`);
if (fail > 0) process.exitCode = 1;
