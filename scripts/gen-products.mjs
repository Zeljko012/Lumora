/**
 * Generiše src/data/products.ts i scripts/images.json
 * iz scratchpad/products.json (parsiran Shopify izvoz).
 *
 * Pokretanje:  node scripts/gen-products.mjs <putanja-do-products.json>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SRC =
  process.argv[2] ||
  path.resolve(
    ROOT,
    "..",
    "AppData/Local/Temp/claude/C--Users-Zeljko/718d3b35-ca53-490d-ba12-e048eaaa1521/scratchpad/products.json",
  );

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));

// ── handle -> clean display name ────────────────────────────────────────
const NAME = {
  "krofna-vaza": "Donut Vaza",
  "bez-vaza": "Harmony Vaza",
  "u-vaza": "Arch Vaza",
  "bubble-vaza": "Bubble Vaza",
  "duo-vaza-1": "Duo Vaza",
  "list-vaza": "List Vaza",
  "vaza-vaza": "Split Vaza",
  "duo-vaza": "Duet Vaza",
  "mesec-vaza": "Vaza Luna",
  "spiralna-vaza": "Spiralna Vaza",
  "vrecica-vaza": "Vrećica Vaza",
  "srce-svecnjak": "Srce Svećnjak",
  "rasorsivac-svecnjak": "Hvatač Svetlosti Svećnjak",
  "booble-svecnjak": "Bubble Svećnjak",
  "skupljac-svetla-svecnjak": "Rebrasti Svećnjak",
  "uvijeni-svecnjak": "Spiralni Svećnjak",
  "home-roze-figura": "Home Roze Figura",
  "home-figura": "Home Figura",
  maska: "Maska Figura",
  "zaljubljeni-par-figura": "Zaljubljeni Par Figura",
  "mislilac-figura": "Mislilac Figura",
  "maca-mreza": "Maca Mreža Figura",
  "maca-figura-1": "Uspavana Maca Figura",
  "labrador-figura": "Labrador Figura",
  "zaljubljene-mace": "Zaljubljene Mace Figura",
  "maca-figura": "Maca Figura",
  "zagljeni-par-figura": "Zagrljaj Ljubavi Figura",
  "skulptura-sa-srcem": "Figura sa Srcem",
  "home-za-vrata": "Home Za Vrata",
  "drvo-vaza": "Drvo Saksija",
  "sapica-vaza": "Šapica Saksija",
  "kesa-vaza": "Papir Saksija",
};

// ── handle -> category ─────────────────────────────────────────────────
const CATEGORY = {
  "krofna-vaza": "vaze",
  "bez-vaza": "vaze",
  "u-vaza": "vaze",
  "bubble-vaza": "vaze",
  "duo-vaza-1": "vaze",
  "list-vaza": "vaze",
  "vaza-vaza": "vaze",
  "duo-vaza": "vaze",
  "mesec-vaza": "vaze",
  "spiralna-vaza": "vaze",
  "vrecica-vaza": "vaze",
  "srce-svecnjak": "svecnjaci",
  "rasorsivac-svecnjak": "svecnjaci",
  "booble-svecnjak": "svecnjaci",
  "skupljac-svetla-svecnjak": "svecnjaci",
  "uvijeni-svecnjak": "svecnjaci",
  "home-roze-figura": "figure",
  "home-figura": "figure",
  maska: "figure",
  "zaljubljeni-par-figura": "figure",
  "mislilac-figura": "figure",
  "maca-mreza": "figure",
  "maca-figura-1": "figure",
  "labrador-figura": "figure",
  "zaljubljene-mace": "figure",
  "maca-figura": "figure",
  "zagljeni-par-figura": "figure",
  "skulptura-sa-srcem": "figure",
  "home-za-vrata": "dom",
  "drvo-vaza": "dom",
  "sapica-vaza": "dom",
  "kesa-vaza": "dom",
};

// ── jedinstveni copy po proizvodu ─────────────────────────────────────
const COPY = {
  "krofna-vaza": {
    lead: "Savršen krug sa otvorenom sredinom — skulptura koja privlači pogled i kada je prazna i kada nosi buket.",
    forWhom: "Za ljubitelje modernog minimalizma i kao upečatljiv poklon za useljenje.",
  },
  "bez-vaza": {
    lead: "Čiste linije i mekana silueta koja se uklapa u svaki enterijer — od skandinavskog do toplog rustik stila.",
    forWhom: "Za one koji vole nenametljiv, tih dizajn i neutralne tonove.",
  },
  "u-vaza": {
    lead: "Lučna forma inspirisana arhitekturom — stoji sama kao mala skulptura ili nosi granu suvog cveća.",
    forWhom: "Za ljubitelje arhitektonskih detalja i kao poklon za novi stan.",
  },
  "bubble-vaza": {
    lead: "Mehurićasta tekstura koja hvata svetlo i senku i menja izgled tokom dana.",
    forWhom: "Za one koji vole razigrane, taktilne detalje u domu.",
  },
  "duo-vaza-1": {
    lead: "Set od dve vaze različitih visina koje rade zajedno — na komodi, polici ili trpezarijskom stolu.",
    forWhom: "Kao zaokružen poklon ili za one koji vole kompozicije, a ne pojedinačne komade.",
  },
  "list-vaza": {
    lead: "Oblik lista pretočen u 3D formu — organska silueta sa mekim, prepoznatljivim obrisom.",
    forWhom: "Za ljubitelje prirodnih motiva i botaničke dekoracije.",
  },
  "vaza-vaza": {
    lead: "Presečena, asimetrična forma koja izgleda drugačije iz svakog ugla.",
    forWhom: "Za one koji traže neobičan, skulpturalan komad koji pokreće razgovor.",
  },
  "duo-vaza": {
    lead: "Dve povezane forme u jednom komadu — dvostruki otvor za dva mala aranžmana.",
    forWhom: "Kao poklon za parove i godišnjice ili za dupli buket suvog cveća.",
  },
  "mesec-vaza": {
    lead: "Silueta polumeseca — nežna, zaobljena forma koja unosi mirnu, večernju notu u prostor.",
    forWhom: "Za ljubitelje nebeskih motiva i kao topao poklon za dom.",
  },
  "spiralna-vaza": {
    lead: "Spiralni presek koji se penje uvis i daje utisak pokreta i kada vaza mirno stoji.",
    forWhom: "Za one koji vole dinamične, moderne forme.",
  },
  "vrecica-vaza": {
    lead: "Oblik zgužvane papirne kese, iznenađujuće elegantan u mat završnici — trend forma koja se traži.",
    forWhom: "Za ljubitelje wabi-sabi estetike i nesavršenih, ručnih formi.",
  },
  "srce-svecnjak": {
    lead: "Svećnjak u obliku srca za jednu čajnu svećicu — mali gest sa velikim značenjem.",
    forWhom: "Poklon za Dan zaljubljenih, godišnjicu ili „bez razloga”.",
  },
  "rasorsivac-svecnjak": {
    lead: "Perforirana forma koja lomi plamen svećice u desetine sitnih odsjaja po zidu i plafonu.",
    forWhom: "Za one koji vole atmosferu sveća i toplu večernju svetlost.",
  },
  "booble-svecnjak": {
    lead: "Zaobljeni, mehurićasti svećnjak koji staje na dlan — najpristupačniji način da uneseš Lumora detalj u dom.",
    forWhom: "Kao sitan poklon, dodatak na sto za proslavu ili prvi komad iz kolekcije.",
  },
  "skupljac-svetla-svecnjak": {
    lead: "Vertikalna rebra bacaju pravilne senke i daju svećnjaku arhitektonski, kolonadni izgled.",
    forWhom: "Za ljubitelje čistih linija i simetrije.",
  },
  "uvijeni-svecnjak": {
    lead: "Uvrnuta, spiralna forma koja se poigrava sa svetlom iz svakog ugla.",
    forWhom: "Za one koji vole skulpturalne svećnjake koji rade i kada sveća ne gori.",
  },
  "home-roze-figura": {
    lead: "Natpis „HOME” kao mala skulptura za policu ili ulazni deo stana.",
    forWhom: "Klasičan poklon za useljenje u novi dom.",
  },
  "home-figura": {
    lead: "Reč „HOME” u čvrstoj 3D formi — jednostavna poruka koja stoji na komodi, polici ili prozoru.",
    forWhom: "Poklon za useljenje, iznajmljeni stan ili prvi zajednički dom.",
  },
  maska: {
    lead: "Stilizovano lice inspirisano pozorišnim i plemenskim maskama — dekorativna skulptura za zid ili policu.",
    forWhom: "Za ljubitelje umetnosti i etno detalja u enterijeru.",
  },
  "zaljubljeni-par-figura": {
    lead: "Dve isprepletane figure u zagrljaju — apstraktna skulptura o bliskosti.",
    forWhom: "Poklon za godišnjicu, veridbu ili venčanje.",
  },
  "mislilac-figura": {
    lead: "Sedeća figura u pozi razmišljanja, sa jasnim odjekom Rodenovog „Mislioca”.",
    forWhom: "Za radni sto, biblioteku ili kao poklon nekome ko voli umetnost.",
  },
  "maca-mreza": {
    lead: "Mačka izvedena kao otvorena mrežasta struktura — puna forma, a prozračna.",
    forWhom: "Za ljubitelje mačaka koji vole savremen, dizajnerski predmet.",
  },
  "maca-figura-1": {
    lead: "Sklupčana mačka u snu — mekana, zaobljena silueta koja smiruje prostor.",
    forWhom: "Poklon za svakog vlasnika mačke.",
  },
  "labrador-figura": {
    lead: "Prepoznatljiva silueta labradora u sedećem stavu, svedena na čiste linije.",
    forWhom: "Poklon za ljubitelje pasa i vlasnike labradora.",
  },
  "zaljubljene-mace": {
    lead: "Dve mačke naslonjene jedna na drugu — nežan duo za policu.",
    forWhom: "Za parove ljubitelja mačaka i kao poklon za Dan zaljubljenih.",
  },
  "maca-figura": {
    lead: "Uspravna mačka svedena na osnovni oblik — sitna skulptura sa karakterom.",
    forWhom: "Poklon za ljubitelje mačaka i početak kolekcije figura.",
  },
  "zagljeni-par-figura": {
    lead: "Par u čvrstom zagrljaju, izveden kao jedna neprekinuta linija.",
    forWhom: "Poklon za godišnjicu i za sve koji vole apstraktnu skulpturu.",
  },
  "skulptura-sa-srcem": {
    lead: "Figura koja u rukama drži srce — jednostavna poruka pažnje i ljubavi.",
    forWhom: "Poklon za najdražu osobu, za svaku priliku.",
  },
  "home-za-vrata": {
    lead: "Natpis „HOME” oblikovan da stoji uz ulazna vrata ili na polici u hodniku — prvi detalj koji se vidi pri ulasku.",
    forWhom: "Poklon za useljenje i za sve koji vole uređen ulazni prostor.",
  },
  "drvo-vaza": {
    lead: "Saksija u obliku stilizovanog stabla, sa otvorom za drenažu — dom za sukulente i male biljke.",
    forWhom: "Za ljubitelje biljaka i zelenih detalja na radnom stolu.",
  },
  "sapica-vaza": {
    lead: "Saksija u obliku mačje šapice — simpatičan dom za sukulent ili kaktus.",
    forWhom: "Poklon za ljubitelje mačaka i biljaka istovremeno.",
  },
  "kesa-vaza": {
    lead: "Oblik presavijene papirne kese u čvrstoj formi — moderni omot za saksiju ili suvo cveće.",
    forWhom: "Za ljubitelje wabi-sabi stila i neobičnih kaša za biljke.",
  },
};

const FEATURED = new Set([
  "krofna-vaza",
  "duo-vaza-1",
  "u-vaza",
  "vrecica-vaza",
]);
const BESTSELLER = new Set([
  "krofna-vaza",
  "srce-svecnjak",
  "skulptura-sa-srcem",
  "zaljubljeni-par-figura",
  "booble-svecnjak",
  "spiralna-vaza",
  "drvo-vaza",
  "maca-figura",
]);

// ── helpers ───────────────────────────────────────────────────────────
function slugify(s) {
  const map = { č: "c", ć: "c", đ: "dj", š: "s", ž: "z", Č: "c", Ć: "c", Đ: "dj", Š: "s", Ž: "z" };
  return s
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const COLOR_ORDER = ["white", "beige", "gray", "black", "pink", "green", "red"];

function dimensionFrom(blocks) {
  const tech = blocks?.[12] || "";
  const first = tech.split("\n")[0]?.trim();
  if (first && /^(Visina|Širina|Prečnik|Dužina)/i.test(first)) return first;
  return "Visina: 18 cm";
}

function cleanImgAlt(alt, name, i) {
  const a = (alt || "").trim();
  if (a && !a.startsWith('"')) return a;
  return `${name} — 3D štampana dekoracija Lumora (${i + 1}/3)`;
}

// ── build ─────────────────────────────────────────────────────────────
const items = [];
const imageJobs = [];

for (const p of raw) {
  if (p.status !== "active") continue;
  if (!NAME[p.handle]) {
    console.warn("PRESKAČEM (nema mapiranja):", p.handle);
    continue;
  }
  const name = NAME[p.handle];
  const slug = slugify(name);
  const category = CATEGORY[p.handle];
  const price = Math.round(parseFloat(p.price || "0"));
  const compareAt = p.compare_at ? Math.round(parseFloat(p.compare_at)) : null;
  const copy = COPY[p.handle] || { lead: "", forWhom: "" };
  const colors = COLOR_ORDER.filter((c) => (p.colors || []).includes(c));

  const images = (p.images || [])
    .filter((im) => im.src)
    .slice(0, 4)
    .map((im, i) => ({
      src: `/images/products/${slug}/${i + 1}.webp`,
      alt: cleanImgAlt(im.alt, name, i),
    }));

  imageJobs.push({
    slug,
    urls: (p.images || []).filter((im) => im.src).slice(0, 4).map((im) => im.src),
  });

  items.push({
    slug,
    name,
    category,
    price,
    compareAt,
    lead: copy.lead,
    forWhom: copy.forWhom,
    dimension: dimensionFrom(p.body_blocks),
    colors,
    images,
    seoTitle: (p.seo_title || `${name} — 3D dekoracija | Lumora`).replace(/\s+/g, " ").trim(),
    seoDescription: (p.seo_description || copy.lead).replace(/\s+/g, " ").trim(),
    featured: FEATURED.has(p.handle),
    bestseller: BESTSELLER.has(p.handle),
    sourceHandle: p.handle,
  });
}

// stabilan redosled: po kategoriji pa po imenu
const catOrder = { vaze: 0, figure: 1, svecnjaci: 2, dom: 3 };
items.sort(
  (a, b) => catOrder[a.category] - catOrder[b.category] || a.name.localeCompare(b.name, "sr"),
);

// ── emit products.ts ──────────────────────────────────────────────────
const header = `// ⚠️  GENERISANO iz Shopify izvoza — ne menjati ručno.
// Regeneriši sa:  node scripts/gen-products.mjs
// Jedinstveni opisi (lead / forWhom) se uređuju u scripts/gen-products.mjs → COPY.

export type Category = "vaze" | "figure" | "svecnjaci" | "dom";

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  category: Category;
  /** Cena u dinarima (ceo broj) */
  price: number;
  /** Precrtana \"stara\" cena ili null */
  compareAt: number | null;
  /** Jedinstven uvodni tekst (1–2 rečenice) */
  lead: string;
  /** Za koga je / poklon ugao */
  forWhom: string;
  /** npr. \"Visina: 18 cm\" */
  dimension: string;
  /** Ključevi boja (v. PRODUCT_COLORS u site.ts) */
  colors: string[];
  images: ProductImage[];
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  bestseller: boolean;
  /** Originalni Shopify handle — samo za referencu */
  sourceHandle: string;
}

export const CATEGORY_META: Record<
  Category,
  { slug: Category; title: string; heading: string; intro: string; seoDescription: string }
> = {
  vaze: {
    slug: "vaze",
    title: "Vaze",
    heading: "3D štampane vaze",
    intro:
      "Skulpturalne vaze štampane sloj po sloj i ručno dovršene. Za suvo cveće, pampas travu ili same za sebe — u 7 boja.",
    seoDescription:
      "3D štampane vaze ručne izrade — Donut, Arch, Bubble, Duo i druge forme. 7 boja, dostava po celoj Srbiji, besplatno poklon pakovanje. Lumora.",
  },
  figure: {
    slug: "figure",
    title: "Figure",
    heading: "Dekorativne figure i skulpture",
    intro:
      "Male skulpture za policu, radni sto ili komodu — mačke, parovi, apstraktne forme. Svaka u 7 boja, spremna za poklon.",
    seoDescription:
      "3D štampane dekorativne figure — mačke, parovi u zagrljaju, apstraktne skulpture. Idealan poklon. 7 boja. Dostava po Srbiji. Lumora.",
  },
  svecnjaci: {
    slug: "svecnjaci",
    title: "Svećnjaci",
    heading: "3D štampani svećnjaci",
    intro:
      "Svećnjaci za čajne svećice koji oblikuju svetlo — mehurići, rebra, spirale, srce. Topla večernja atmosfera u 7 boja.",
    seoDescription:
      "3D štampani svećnjaci za čajne svećice — Bubble, Rebrasti, Spiralni, Srce. 7 boja, dostava po Srbiji, poklon pakovanje. Lumora.",
  },
  dom: {
    slug: "dom",
    title: "Dom",
    heading: "Detalji za dom",
    intro:
      "Natpisi za ulaz i saksije za male biljke — praktični komadi sa istim skulpturalnim potpisom. U 7 boja.",
    seoDescription:
      "3D štampani detalji za dom — natpis HOME, saksije u obliku stabla i mačje šapice. 7 boja. Dostava po Srbiji. Lumora.",
  },
};

export const PRODUCTS: Product[] = ${JSON.stringify(items, null, 2)};

export const getProduct = (slug: string): Product | undefined =>
  PRODUCTS.find((p) => p.slug === slug);

export const productsByCategory = (c: Category): Product[] =>
  PRODUCTS.filter((p) => p.category === c);

export const featuredProducts = (): Product[] => PRODUCTS.filter((p) => p.featured);

export const bestsellers = (): Product[] => PRODUCTS.filter((p) => p.bestseller);

export function relatedProducts(p: Product, n = 4): Product[] {
  const same = PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug);
  const rest = PRODUCTS.filter((x) => x.category !== p.category && x.slug !== p.slug);
  return [...same, ...rest].slice(0, n);
}

export const priceRange = (): [number, number] => {
  const ps = PRODUCTS.map((p) => p.price);
  return [Math.min(...ps), Math.max(...ps)];
};
`;

fs.writeFileSync(path.join(ROOT, "src/data/products.ts"), header, "utf8");
fs.writeFileSync(
  path.join(ROOT, "scripts/images.json"),
  JSON.stringify(imageJobs, null, 2),
  "utf8",
);

console.log(`✓ ${items.length} proizvoda -> src/data/products.ts`);
for (const c of ["vaze", "figure", "svecnjaci", "dom"]) {
  console.log(`  ${c}: ${items.filter((i) => i.category === c).length}`);
}
console.log(`✓ ${imageJobs.length} setova slika -> scripts/images.json`);
