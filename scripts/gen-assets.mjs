/**
 * Generiše apple-touch-icon.png i og-default.jpg u public/.
 * Pokretanje:  node scripts/gen-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(__dirname, "..", "public");

const iconSvg = fs.readFileSync(path.join(PUB, "icon.svg"));

// apple-touch-icon 180x180
await sharp(iconSvg, { density: 384 })
  .resize(180, 180)
  .png()
  .toFile(path.join(PUB, "apple-touch-icon.png"));

// og-default.jpg 1200x630 — kamena podloga + monogram + naziv
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ece5d8"/>
  <rect x="0" y="0" width="1200" height="12" fill="#4f6f63"/>
  <g transform="translate(96,150)">
    <rect width="120" height="120" rx="26" fill="#4f6f63"/>
    <path d="M38 26h17v50a13 13 0 0 0 26 0V26h-5" fill="none" stroke="#f6f2e9" stroke-width="11" stroke-linecap="round"/>
    <circle cx="83" cy="38" r="9" fill="#f6f2e9"/>
  </g>
  <text x="96" y="360" font-family="Georgia, 'Times New Roman', serif" font-size="92" fill="#2a2420">Lumora</text>
  <text x="100" y="420" font-family="Arial, sans-serif" font-size="34" fill="#6e6459">Skulpturalne 3D dekoracije, izrađene u Srbiji</text>
  <text x="100" y="470" font-family="Arial, sans-serif" font-size="26" fill="#6e6459">Vaze · Figure · Svećnjaci · 7 boja</text>
</svg>`;

await sharp(Buffer.from(og)).jpeg({ quality: 86 }).toFile(path.join(PUB, "og-default.jpg"));

console.log("✓ public/apple-touch-icon.png");
console.log("✓ public/og-default.jpg");
