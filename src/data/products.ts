// ⚠️  GENERISANO iz Shopify izvoza — ne menjati ručno.
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
  /** Precrtana "stara" cena ili null */
  compareAt: number | null;
  /** Jedinstven uvodni tekst (1–2 rečenice) */
  lead: string;
  /** Za koga je / poklon ugao */
  forWhom: string;
  /** npr. "Visina: 18 cm" */
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
      "Skulpturalne vaze, štampane sloj po sloj u boji koju izaberete. Za suvo cveće, pampas travu ili same za sebe — u 7 boja.",
    seoDescription:
      "3D štampane vaze — Donut, Arch, Bubble, Duo i druge forme. 7 boja, dostava po celoj Srbiji, besplatno poklon pakovanje. Lumora.",
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

export const PRODUCTS: Product[] = [
  {
    "slug": "arch-vaza",
    "name": "Arch Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Lučna forma inspirisana arhitekturom — stoji sama kao mala skulptura ili nosi granu suvog cveća.",
    "forWhom": "Za ljubitelje arhitektonskih detalja i kao poklon za novi stan.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/arch-vaza/1.webp",
        "alt": "Arch Vaza lučna 3D štampana dekoracija Lumora"
      },
      {
        "src": "/images/products/arch-vaza/2.webp",
        "alt": "Arch Vaza bočni prikaz lučna 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/arch-vaza/3.webp",
        "alt": "Arch Vaza 3D skulpturalna dekoracija za dom Lumora Srbija"
      }
    ],
    "seoTitle": "Arch Vaza – Elegantna Lučna 3D Dekoracija | Lumora",
    "seoDescription": "Arch Vaza od Lumore – elegantna 3D štampana vaza lučnog oblika. Skulpturalna dekoracija za policu ili komodu. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "u-vaza"
  },
  {
    "slug": "bubble-vaza",
    "name": "Bubble Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Mehurićasta tekstura koja hvata svetlo i senku i menja izgled tokom dana.",
    "forWhom": "Za one koji vole razigrane, taktilne detalje u domu.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/bubble-vaza/1.webp",
        "alt": "Bubble Vaza 3D štampana vaza mehurićasta tekstura Lumora"
      },
      {
        "src": "/images/products/bubble-vaza/2.webp",
        "alt": "Bubble Vaza bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/bubble-vaza/3.webp",
        "alt": "Bubble Vaza 3D ukras za policu Lumora Srbija"
      }
    ],
    "seoTitle": "Bubble Vaza – 3D Dekoracija sa Mehurićima | Lumora",
    "seoDescription": "Bubble Vaza od Lumore – 3D štampana vaza sa mehurićastim teksturama. Moderni dekor za dom. 7 boja, besplatno poklon pakovanje. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "bubble-vaza"
  },
  {
    "slug": "donut-vaza",
    "name": "Donut Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Savršen krug sa otvorenom sredinom — skulptura koja privlači pogled i kada je prazna i kada nosi buket.",
    "forWhom": "Za ljubitelje modernog minimalizma i kao upečatljiv poklon za useljenje.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/donut-vaza/1.webp",
        "alt": "Donut Vaza kružni oblik 3D štampa Lumora"
      },
      {
        "src": "/images/products/donut-vaza/2.webp",
        "alt": "Donut Vaza bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/donut-vaza/3.webp",
        "alt": "Donut Vaza 3D ukras za policu Lumora Srbija"
      }
    ],
    "seoTitle": "Donut Vaza – Unikatna 3D Dekoracija Kružnog Oblika | Lumora",
    "seoDescription": "Donut Vaza od Lumore – 3D štampana vaza kružnog oblika poput krofne. Jedinstven dekor za policu ili sto. 7 boja. Dostava po Srbiji.",
    "featured": true,
    "bestseller": true,
    "sourceHandle": "krofna-vaza"
  },
  {
    "slug": "duet-vaza",
    "name": "Duet Vaza",
    "category": "vaze",
    "price": 3600,
    "compareAt": null,
    "lead": "Dve povezane forme u jednom komadu — dvostruki otvor za dva mala aranžmana.",
    "forWhom": "Kao poklon za parove i godišnjice ili za dupli buket suvog cveća.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/duet-vaza/1.webp",
        "alt": "Duet Vaza — 3D štampana dekoracija Lumora (1/3)"
      },
      {
        "src": "/images/products/duet-vaza/2.webp",
        "alt": "Duet Vaza — 3D štampana dekoracija Lumora (2/3)"
      },
      {
        "src": "/images/products/duet-vaza/3.webp",
        "alt": "Duet Vaza — 3D štampana dekoracija Lumora (3/3)"
      }
    ],
    "seoTitle": "Duet Vaza – Set od Dve 3D Dekorativne Vaze | Lumora",
    "seoDescription": "Duet Vaza od Lumore – set od dve 3D štampane vaze različitih tekstura. Idealan poklon ili dekoracija za dnevnu sobu. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "duo-vaza"
  },
  {
    "slug": "duo-vaza",
    "name": "Duo Vaza",
    "category": "vaze",
    "price": 3600,
    "compareAt": null,
    "lead": "Set od dve vaze različitih visina koje rade zajedno — na komodi, polici ili trpezarijskom stolu.",
    "forWhom": "Kao zaokružen poklon ili za one koji vole kompozicije, a ne pojedinačne komade.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/duo-vaza/1.webp",
        "alt": "Duo Vaza set dve moderne 3D vaze Lumora"
      },
      {
        "src": "/images/products/duo-vaza/2.webp",
        "alt": "Duo Vaza bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/duo-vaza/3.webp",
        "alt": "Duo Vaza 3D ukras za dnevnu sobu Lumora Srbija"
      }
    ],
    "seoTitle": "Duo Vaza – Set od Dve Moderne 3D Vaze | Lumora",
    "seoDescription": "Duo Vaza od Lumore – set od dve 3D štampane vaze modernog dizajna. Savršen poklon za useljenje ili rođendan. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "duo-vaza-1"
  },
  {
    "slug": "harmony-vaza",
    "name": "Harmony Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Čiste linije i mekana silueta koja se uklapa u svaki enterijer — od skandinavskog do toplog rustik stila.",
    "forWhom": "Za one koji vole nenametljiv, tih dizajn i neutralne tonove.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/harmony-vaza/1.webp",
        "alt": "Harmony Vaza minimalist 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/harmony-vaza/2.webp",
        "alt": "Harmony Vaza bočni prikaz 3D štampa Lumora"
      },
      {
        "src": "/images/products/harmony-vaza/3.webp",
        "alt": "Harmony Vaza 3D ukras za dom Lumora Srbija"
      }
    ],
    "seoTitle": "Harmony Vaza – Minimalist 3D Dekoracija za Dom | Lumora",
    "seoDescription": "Harmony Vaza od Lumore – 3D štampana vaza minimalističnog dizajna. Savršena dekoracija za sve prostore. 7 boja. Besplatno poklon pakovanje. Srbija.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "bez-vaza"
  },
  {
    "slug": "list-vaza",
    "name": "List Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Oblik lista pretočen u 3D formu — organska silueta sa mekim, prepoznatljivim obrisom.",
    "forWhom": "Za ljubitelje prirodnih motiva i botaničke dekoracije.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/list-vaza/1.webp",
        "alt": "List Vaza 3D štampana vaza u obliku lista Lumora"
      },
      {
        "src": "/images/products/list-vaza/2.webp",
        "alt": "List Vaza bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/list-vaza/3.webp",
        "alt": "List Vaza 3D ukras za dom Lumora Srbija"
      }
    ],
    "seoTitle": "List Vaza – 3D Dekoracija u Obliku Lista | Lumora",
    "seoDescription": "List Vaza od Lumore – 3D štampana vaza u obliku lista. Elegantna dekoracija za dom, idealna za suvo cveće i pampas travu. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "list-vaza"
  },
  {
    "slug": "spiralna-vaza",
    "name": "Spiralna Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Spiralni presek koji se penje uvis i daje utisak pokreta i kada vaza mirno stoji.",
    "forWhom": "Za one koji vole dinamične, moderne forme.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/spiralna-vaza/1.webp",
        "alt": "Spiralna Vaza — 3D štampana dekoracija Lumora (1/3)"
      },
      {
        "src": "/images/products/spiralna-vaza/2.webp",
        "alt": "Bela spiralna vaza 3D štampa Lumora brend dekoracija za police\"."
      },
      {
        "src": "/images/products/spiralna-vaza/3.webp",
        "alt": "Spiralna Vaza — 3D štampana dekoracija Lumora (3/3)"
      }
    ],
    "seoTitle": "Spiralna Vaza – Moderna 3D Dekoracija za Dom | Lumora",
    "seoDescription": "Spiralna Vaza od Lumore – unikatna 3D štampana dekoracija spiralnog oblika. 7 boja, domaća izrada, besplatno poklon pakovanje. Dostava po Srbiji 3–5 dana.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "spiralna-vaza"
  },
  {
    "slug": "split-vaza",
    "name": "Split Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Presečena, asimetrična forma koja izgleda drugačije iz svakog ugla.",
    "forWhom": "Za one koji traže neobičan, skulpturalan komad koji pokreće razgovor.",
    "dimension": "Visina: od 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/split-vaza/1.webp",
        "alt": "Split Vaza moderna 3D dekoracija za dom Lumora"
      },
      {
        "src": "/images/products/split-vaza/2.webp",
        "alt": "Split Vaza 3D štampa bočni prikaz Lumora"
      },
      {
        "src": "/images/products/split-vaza/3.webp",
        "alt": "Split Vaza 3D dekoracija za policu Lumora Srbija"
      }
    ],
    "seoTitle": "Split Vaza – Moderna 3D Dekoracija za Dom | Lumora",
    "seoDescription": "Split Vaza od Lumore – moderna 3D štampana vaza sa podeljenim dizajnom. Unikatna dekoracija za policu ili trpezarijski sto. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "vaza-vaza"
  },
  {
    "slug": "vaza-luna",
    "name": "Vaza Luna",
    "category": "vaze",
    "price": 2000,
    "compareAt": null,
    "lead": "Silueta polumeseca — nežna, zaobljena forma koja unosi mirnu, večernju notu u prostor.",
    "forWhom": "Za ljubitelje nebeskih motiva i kao topao poklon za dom.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/vaza-luna/1.webp",
        "alt": "Vaza Luna — 3D štampana dekoracija Lumora (1/3)"
      },
      {
        "src": "/images/products/vaza-luna/2.webp",
        "alt": "Vaza Luna — 3D štampana dekoracija Lumora (2/3)"
      },
      {
        "src": "/images/products/vaza-luna/3.webp",
        "alt": "Vaza Luna — 3D štampana dekoracija Lumora (3/3)"
      }
    ],
    "seoTitle": "Vaza Luna – 3D Dekoracija Polumesec za Dom | Lumora",
    "seoDescription": "Vaza Luna od Lumore – dekorativna 3D štampana vaza u obliku polumeseca. Savršen ukras za radni sto ili komodu. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "mesec-vaza"
  },
  {
    "slug": "vrecica-vaza",
    "name": "Vrećica Vaza",
    "category": "vaze",
    "price": 2400,
    "compareAt": null,
    "lead": "Oblik zgužvane papirne kese, iznenađujuće elegantan u mat završnici — trend forma koja se traži.",
    "forWhom": "Za ljubitelje wabi-sabi estetike i nesavršenih, ručnih formi.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/vrecica-vaza/1.webp",
        "alt": "Vrećica Vaza — 3D štampana dekoracija Lumora (1/3)"
      },
      {
        "src": "/images/products/vrecica-vaza/2.webp",
        "alt": "Vrećica Vaza — 3D štampana dekoracija Lumora (2/3)"
      },
      {
        "src": "/images/products/vrecica-vaza/3.webp",
        "alt": "Vrećica Vaza 3D štampana dekoracija Lumora bela"
      }
    ],
    "seoTitle": "Vrećica Vaza – Unikatna 3D Dekoracija za Dom | Lumora",
    "seoDescription": "Vrećica Vaza od Lumore – elegantna 3D štampana dekoracija za policu ili sto. Dostupna u 7 boja. Besplatno poklon pakovanje. Dostava širom Srbije 3–5 dana.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "vrecica-vaza"
  },
  {
    "slug": "figura-sa-srcem",
    "name": "Figura sa Srcem",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Figura koja u rukama drži srce — jednostavna poruka pažnje i ljubavi.",
    "forWhom": "Poklon za najdražu osobu, za svaku priliku.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/figura-sa-srcem/1.webp",
        "alt": "Figura sa Srcem 3D skulptura srca poklon Lumora"
      },
      {
        "src": "/images/products/figura-sa-srcem/2.webp",
        "alt": "Figura sa Srcem bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/figura-sa-srcem/3.webp",
        "alt": "Figura sa Srcem 3D ukras za dom poklon ljubav Lumora"
      }
    ],
    "seoTitle": "Figura sa Srcem – 3D Skulptura Poklon za Ljubav | Lumora",
    "seoDescription": "Figura sa Srcem od Lumore – 3D štampana skulptura srca. Idealan poklon za rođendan, godišnjicu ili Valentinovo. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "skulptura-sa-srcem"
  },
  {
    "slug": "home-figura",
    "name": "Home Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Reč „HOME” u čvrstoj 3D formi — jednostavna poruka koja stoji na komodi, polici ili prozoru.",
    "forWhom": "Poklon za useljenje, iznajmljeni stan ili prvi zajednički dom.",
    "dimension": "Širina: do 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/home-figura/1.webp",
        "alt": "Home Figura slova HOME 3D štampa poklon useljenje Lumora"
      },
      {
        "src": "/images/products/home-figura/2.webp",
        "alt": "Home Figura bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/home-figura/3.webp",
        "alt": "Home Figura 3D ukras za dom poklon Lumora Srbija"
      }
    ],
    "seoTitle": "Home Figura – 3D Dekoracija HOME Poklon za Useljenje | Lumora",
    "seoDescription": "Home Figura od Lumore – 3D štampana figura slova HOME. Savršen poklon za useljenje u novi dom. 7 boja. Besplatno pakovanje. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "home-figura"
  },
  {
    "slug": "home-roze-figura",
    "name": "Home Roze Figura",
    "category": "figure",
    "price": 2000,
    "compareAt": null,
    "lead": "Natpis „HOME” kao mala skulptura za policu ili ulazni deo stana.",
    "forWhom": "Klasičan poklon za useljenje u novi dom.",
    "dimension": "Širina: do 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/home-roze-figura/1.webp",
        "alt": "Home Roze Figura roze HOME 3D štampa poklon Lumora"
      },
      {
        "src": "/images/products/home-roze-figura/2.webp",
        "alt": "Home Roze Figura bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/home-roze-figura/3.webp",
        "alt": "Home Roze Figura 3D ukras za dom Lumora Srbija"
      }
    ],
    "seoTitle": "Home Roze Figura – 3D Dekoracija HOME u Roze Boji | Lumora",
    "seoDescription": "Home Roze Figura od Lumore – 3D štampana figura HOME u roze boji. Poklon za useljenje i dekoracija doma. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "home-roze-figura"
  },
  {
    "slug": "labrador-figura",
    "name": "Labrador Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Prepoznatljiva silueta labradora u sedećem stavu, svedena na čiste linije.",
    "forWhom": "Poklon za ljubitelje pasa i vlasnike labradora.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/labrador-figura/1.webp",
        "alt": "Labrador Figura 3D štampana figura psa poklon Lumora"
      },
      {
        "src": "/images/products/labrador-figura/2.webp",
        "alt": "Labrador Figura bočni prikaz 3D skulptura Lumora"
      },
      {
        "src": "/images/products/labrador-figura/3.webp",
        "alt": "Labrador 3D ukras za dom ljubitelji pasa Lumora Srbija"
      }
    ],
    "seoTitle": "Labrador Figura – 3D Skulptura Psa Poklon | Lumora",
    "seoDescription": "Labrador Figura od Lumore – 3D štampana figura Labrador psa. Savršen poklon za ljubitelje pasa. Ukras za dom. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "labrador-figura"
  },
  {
    "slug": "maca-figura",
    "name": "Maca Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Uspravna mačka svedena na osnovni oblik — sitna skulptura sa karakterom.",
    "forWhom": "Poklon za ljubitelje mačaka i početak kolekcije figura.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/maca-figura/1.webp",
        "alt": "Maca Figura 3D štampana figura mačke poklon Lumora"
      },
      {
        "src": "/images/products/maca-figura/2.webp",
        "alt": "Maca Figura bočni prikaz 3D skulptura Lumora"
      },
      {
        "src": "/images/products/maca-figura/3.webp",
        "alt": "Maca Figura 3D ukras za dom ljubitelji mačaka Lumora"
      }
    ],
    "seoTitle": "Maca Figura – 3D Skulptura Mačke Poklon | Lumora",
    "seoDescription": "Maca Figura od Lumore – slatka 3D štampana figura mačke. Savršen poklon za ljubitelje mačaka. Ukras za policu ili sto. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "maca-figura"
  },
  {
    "slug": "maca-mreza-figura",
    "name": "Maca Mreža Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Mačka izvedena kao otvorena mrežasta struktura — puna forma, a prozračna.",
    "forWhom": "Za ljubitelje mačaka koji vole savremen, dizajnerski predmet.",
    "dimension": "Širina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/maca-mreza-figura/1.webp",
        "alt": "Maca Mreža Figura mačka mrežasti dizajn 3D štampa Lumora"
      },
      {
        "src": "/images/products/maca-mreza-figura/2.webp",
        "alt": "Maca Mreža bočni prikaz 3D skulptura Lumora"
      },
      {
        "src": "/images/products/maca-mreza-figura/3.webp",
        "alt": "Maca Mreža 3D ukras za dom Lumora Srbija"
      }
    ],
    "seoTitle": "Maca Mreža – 3D Figura Mačke Mrežastog Dizajna | Lumora",
    "seoDescription": "Maca Mreža Figura od Lumore – 3D štampana figura mačke sa mrežastim dizajnom. Ukras za dom, poklon za ljubitelje mačaka. 7 boja. Srbija.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "maca-mreza"
  },
  {
    "slug": "maska-figura",
    "name": "Maska Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Stilizovano lice inspirisano pozorišnim i plemenskim maskama — dekorativna skulptura za zid ili policu.",
    "forWhom": "Za ljubitelje umetnosti i etno detalja u enterijeru.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/maska-figura/1.webp",
        "alt": "Maska Figura 3D štampana dekorativna maska Lumora"
      },
      {
        "src": "/images/products/maska-figura/2.webp",
        "alt": "Maska Figura bočni prikaz 3D skulptura Lumora"
      },
      {
        "src": "/images/products/maska-figura/3.webp",
        "alt": "Maska 3D ukras za zid ili policu Lumora Srbija"
      }
    ],
    "seoTitle": "Maska Figura – 3D Dekorativna Skulptura Maske | Lumora",
    "seoDescription": "Maska Figura od Lumore – 3D štampana dekorativna maska. Unikatni ukras za zid ili policu. Savršen poklon za ljubitelje umetnosti. 7 boja. Srbija.",
    "featured": true,
    "bestseller": false,
    "sourceHandle": "maska"
  },
  {
    "slug": "mislilac-figura",
    "name": "Mislilac Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Sedeća figura u pozi razmišljanja, sa jasnim odjekom Rodenovog „Mislioca”.",
    "forWhom": "Za radni sto, biblioteku ili kao poklon nekome ko voli umetnost.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/mislilac-figura/1.webp",
        "alt": "Mislilac Figura 3D skulptura inspirisana Rodenom Lumora"
      },
      {
        "src": "/images/products/mislilac-figura/2.webp",
        "alt": "Mislilac Figura bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/mislilac-figura/3.webp",
        "alt": "Mislilac 3D ukras za radnu sobu poklon Lumora Srbija"
      }
    ],
    "seoTitle": "Mislilac Figura – 3D Skulptura Inspirisana Rodenovim Delom | Lumora",
    "seoDescription": "Mislilac Figura od Lumore – 3D štampana skulptura u stilu Rodenovog Mislilaca. Jedinstven ukras za radnu sobu ili policu. 7 boja. Srbija.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "mislilac-figura"
  },
  {
    "slug": "uspavana-maca-figura",
    "name": "Uspavana Maca Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Sklupčana mačka u snu — mekana, zaobljena silueta koja smiruje prostor.",
    "forWhom": "Poklon za svakog vlasnika mačke.",
    "dimension": "Širina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/uspavana-maca-figura/1.webp",
        "alt": "Uspavana Maca Figura mačka koja spava 3D štampa Lumora"
      },
      {
        "src": "/images/products/uspavana-maca-figura/2.webp",
        "alt": "Uspavana Maca bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/uspavana-maca-figura/3.webp",
        "alt": "Uspavana Maca 3D skulptura mačke Lumora Srbija"
      }
    ],
    "seoTitle": "Uspavana Maca – 3D Figura Mačke koja Spava | Lumora",
    "seoDescription": "Uspavana Maca Figura od Lumore – 3D štampana figura mačke koja spava. Slatki poklon za ljubitelje mačaka. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "maca-figura-1"
  },
  {
    "slug": "zagrljaj-ljubavi-figura",
    "name": "Zagrljaj Ljubavi Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Par u čvrstom zagrljaju, izveden kao jedna neprekinuta linija.",
    "forWhom": "Poklon za godišnjicu i za sve koji vole apstraktnu skulpturu.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/zagrljaj-ljubavi-figura/1.webp",
        "alt": "Zagrljaj Ljubavi Figura 3D skulptura para poklon Lumora"
      },
      {
        "src": "/images/products/zagrljaj-ljubavi-figura/2.webp",
        "alt": "Zagrljaj Ljubavi 3D dekoracija poklon za godišnjicu Lumora"
      }
    ],
    "seoTitle": "Zagrljaj Ljubavi – 3D Skulptura Para Poklon | Lumora",
    "seoDescription": "Zagrljaj Ljubavi Figura od Lumore – 3D štampana skulptura para u zagrljaju. Savršen poklon za godišnjicu ili venčanje. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "zagljeni-par-figura"
  },
  {
    "slug": "zaljubljene-mace-figura",
    "name": "Zaljubljene Mace Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Dve mačke naslonjene jedna na drugu — nežan duo za policu.",
    "forWhom": "Za parove ljubitelja mačaka i kao poklon za Dan zaljubljenih.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/zaljubljene-mace-figura/1.webp",
        "alt": "Zaljubljene Mace Figura dve mačke 3D štampa Lumora"
      },
      {
        "src": "/images/products/zaljubljene-mace-figura/2.webp",
        "alt": "Zaljubljene Mace bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/zaljubljene-mace-figura/3.webp",
        "alt": "Zaljubljene Mace 3D skulptura mačaka Lumora Srbija"
      }
    ],
    "seoTitle": "Zaljubljene Mace – 3D Skulptura Dve Mačke | Lumora",
    "seoDescription": "Zaljubljene Mace Figura od Lumore – 3D štampane dve mačke u zagrljaju. Poklon za ljubitelje mačaka i ljubav. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "zaljubljene-mace"
  },
  {
    "slug": "zaljubljeni-par-figura",
    "name": "Zaljubljeni Par Figura",
    "category": "figure",
    "price": 1800,
    "compareAt": null,
    "lead": "Dve isprepletane figure u zagrljaju — apstraktna skulptura o bliskosti.",
    "forWhom": "Poklon za godišnjicu, veridbu ili venčanje.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/zaljubljeni-par-figura/1.webp",
        "alt": "Zaljubljeni Par Figura 3D skulptura para poklon Lumora"
      },
      {
        "src": "/images/products/zaljubljeni-par-figura/2.webp",
        "alt": "Zaljubljeni Par bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/zaljubljeni-par-figura/3.webp",
        "alt": "Zaljubljeni Par 3D ukras za dom poklon godišnjica Lumora"
      }
    ],
    "seoTitle": "Zaljubljeni Par – 3D Skulptura Para Poklon za Ljubav | Lumora",
    "seoDescription": "Zaljubljeni Par Figura od Lumore – 3D štampana skulptura para. Savršen poklon za godišnjicu, venčanje ili rođendan. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "zaljubljeni-par-figura"
  },
  {
    "slug": "bubble-svecnjak",
    "name": "Bubble Svećnjak",
    "category": "svecnjaci",
    "price": 700,
    "compareAt": null,
    "lead": "Zaobljeni, mehurićasti svećnjak koji staje na dlan — najpristupačniji način da uneseš Lumora detalj u dom.",
    "forWhom": "Kao sitan poklon, dodatak na sto za proslavu ili prvi komad iz kolekcije.",
    "dimension": "",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/bubble-svecnjak/1.webp",
        "alt": "Bubble Svećnjak mehurićasti dizajn 3D štampa Lumora"
      },
      {
        "src": "/images/products/bubble-svecnjak/2.webp",
        "alt": "Bubble Svećnjak bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/bubble-svecnjak/3.webp",
        "alt": "Bubble Svećnjak 3D ukras za dom poklon Lumora Srbija"
      }
    ],
    "seoTitle": "Bubble Svećnjak – 3D Svećnjak Mehurićastog Dizajna | Lumora",
    "seoDescription": "Bubble Svećnjak od Lumore – 3D štampani svećnjak sa mehurićastim dizajnom. Savršen poklon i dekor za dom. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "booble-svecnjak"
  },
  {
    "slug": "hvatac-svetlosti-svecnjak",
    "name": "Hvatač Svetlosti Svećnjak",
    "category": "svecnjaci",
    "price": 1800,
    "compareAt": null,
    "lead": "Perforirana forma koja lomi plamen svećice u desetine sitnih odsjaja po zidu i plafonu.",
    "forWhom": "Za one koji vole atmosferu sveća i toplu večernju svetlost.",
    "dimension": "",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/hvatac-svetlosti-svecnjak/1.webp",
        "alt": "Hvatač Svetlosti Svećnjak 3D štampa lomi svetlost Lumora"
      },
      {
        "src": "/images/products/hvatac-svetlosti-svecnjak/2.webp",
        "alt": "Hvatač Svetlosti bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/hvatac-svetlosti-svecnjak/3.webp",
        "alt": "Hvatač Svetlosti 3D svećnjak ukras za dom Lumora Srbija"
      }
    ],
    "seoTitle": "Hvatač Svetlosti Svećnjak – 3D Dekorativni Svećnjak | Lumora",
    "seoDescription": "Hvatač Svetlosti Svećnjak od Lumore – 3D štampani svećnjak koji lomi i raspršuje svetlost. Magija u vreme sveća. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "rasorsivac-svecnjak"
  },
  {
    "slug": "rebrasti-svecnjak",
    "name": "Rebrasti Svećnjak",
    "category": "svecnjaci",
    "price": 1000,
    "compareAt": null,
    "lead": "Vertikalna rebra bacaju pravilne senke i daju svećnjaku arhitektonski, kolonadni izgled.",
    "forWhom": "Za ljubitelje čistih linija i simetrije.",
    "dimension": "",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/rebrasti-svecnjak/1.webp",
        "alt": "Rebrasti Svećnjak rebra tekstura 3D štampa Lumora"
      },
      {
        "src": "/images/products/rebrasti-svecnjak/2.webp",
        "alt": "Rebrasti Svećnjak bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/rebrasti-svecnjak/3.webp",
        "alt": "Rebrasti Svećnjak 3D ukras za dom Lumora Srbija"
      }
    ],
    "seoTitle": "Rebrasti Svećnjak – 3D Dekorativni Svećnjak | Lumora",
    "seoDescription": "Rebrasti Svećnjak od Lumore – 3D štampani svećnjak sa rebrastom teksturom. Dekoracija za dom. 7 boja. Besplatno poklon pakovanje. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "skupljac-svetla-svecnjak"
  },
  {
    "slug": "spiralni-svecnjak",
    "name": "Spiralni Svećnjak",
    "category": "svecnjaci",
    "price": 1800,
    "compareAt": null,
    "lead": "Uvrnuta, spiralna forma koja se poigrava sa svetlom iz svakog ugla.",
    "forWhom": "Za one koji vole skulpturalne svećnjake koji rade i kada sveća ne gori.",
    "dimension": "",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/spiralni-svecnjak/1.webp",
        "alt": "Spiralni Svećnjak 3D štampani spiralni svecnjak Lumora"
      },
      {
        "src": "/images/products/spiralni-svecnjak/2.webp",
        "alt": "Spiralni Svećnjak bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/spiralni-svecnjak/3.webp",
        "alt": "Spiralni Svećnjak 3D ukras za dom poklon Lumora Srbija"
      }
    ],
    "seoTitle": "Spiralni Svećnjak – 3D Dekorativni Svećnjak | Lumora",
    "seoDescription": "Spiralni Svećnjak od Lumore – 3D štampani svećnjak spiralnog dizajna. Moderni dekor za dom i poklon. 7 boja. Besplatno pakovanje. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "uvijeni-svecnjak"
  },
  {
    "slug": "srce-svecnjak",
    "name": "Srce Svećnjak",
    "category": "svecnjaci",
    "price": 1800,
    "compareAt": null,
    "lead": "Svećnjak u obliku srca za jednu čajnu svećicu — mali gest sa velikim značenjem.",
    "forWhom": "Poklon za Dan zaljubljenih, godišnjicu ili „bez razloga”.",
    "dimension": "",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/srce-svecnjak/1.webp",
        "alt": "Srce Svećnjak oblik srca 3D štampa Lumora"
      },
      {
        "src": "/images/products/srce-svecnjak/2.webp",
        "alt": "Srce Svećnjak bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/srce-svecnjak/3.webp",
        "alt": "Srce Svećnjak 3D ukras poklon Valentinovo Lumora Srbija"
      }
    ],
    "seoTitle": "Srce Svećnjak – 3D Svećnjak u Obliku Srca Poklon | Lumora",
    "seoDescription": "Srce Svećnjak od Lumore – 3D štampani svećnjak u obliku srca. Savršen poklon za Valentinovo i godišnjicu. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "srce-svecnjak"
  },
  {
    "slug": "drvo-saksija",
    "name": "Drvo Saksija",
    "category": "dom",
    "price": 2400,
    "compareAt": null,
    "lead": "Saksija u obliku stilizovanog stabla, sa otvorom za drenažu — dom za sukulente i male biljke.",
    "forWhom": "Za ljubitelje biljaka i zelenih detalja na radnom stolu.",
    "dimension": "Visina: do 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/drvo-saksija/1.webp",
        "alt": "Drvo Saksija 3D štampana saksija u obliku stabla Lumora"
      },
      {
        "src": "/images/products/drvo-saksija/2.webp",
        "alt": "Drvo Saksija bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/drvo-saksija/3.webp",
        "alt": "Drvo Saksija 3D ukras za dom i biljke Lumora Srbija"
      }
    ],
    "seoTitle": "Drvo Saksija – 3D Dekoracija u Obliku Stabla | Lumora",
    "seoDescription": "Drvo Saksija od Lumore – 3D štampana saksija u obliku stabla. Unikatna dekoracija za biljke i dom. 7 boja, domaća izrada. Dostava po Srbiji.",
    "featured": false,
    "bestseller": true,
    "sourceHandle": "drvo-vaza"
  },
  {
    "slug": "home-za-vrata",
    "name": "Home Za Vrata",
    "category": "dom",
    "price": 1800,
    "compareAt": null,
    "lead": "Natpis „HOME” oblikovan da stoji uz ulazna vrata ili na polici u hodniku — prvi detalj koji se vidi pri ulasku.",
    "forWhom": "Poklon za useljenje i za sve koji vole uređen ulazni prostor.",
    "dimension": "Visina: 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/home-za-vrata/1.webp",
        "alt": "Home Za Vrata 3D štampana dekoracija za ulazna vrata Lumora"
      },
      {
        "src": "/images/products/home-za-vrata/2.webp",
        "alt": "Home Za Vrata bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/home-za-vrata/3.webp",
        "alt": "Home Za Vrata 3D ukras poklon useljenje Lumora Srbija"
      }
    ],
    "seoTitle": "Home Za Vrata – 3D Dekoracija za Ulazna Vrata | Lumora",
    "seoDescription": "Home Za Vrata od Lumore – 3D štampana dekoracija za ulazna vrata. Savršen poklon za useljenje. 7 boja. Besplatno poklon pakovanje. Srbija.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "home-za-vrata"
  },
  {
    "slug": "papir-saksija",
    "name": "Papir Saksija",
    "category": "dom",
    "price": 2400,
    "compareAt": null,
    "lead": "Oblik presavijene papirne kese u čvrstoj formi — moderni omot za saksiju ili suvo cveće.",
    "forWhom": "Za ljubitelje wabi-sabi stila i neobičnih kaša za biljke.",
    "dimension": "Visina: do 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/papir-saksija/1.webp",
        "alt": "Papir Saksija 3D štampana dekoracija Lumora"
      },
      {
        "src": "/images/products/papir-saksija/2.webp",
        "alt": "Papir Saksija bočni prikaz 3D štampa Lumora"
      },
      {
        "src": "/images/products/papir-saksija/3.webp",
        "alt": "Papir Saksija 3D dekoracija za biljke Lumora Srbija"
      }
    ],
    "seoTitle": "Papir Saksija – Unikatna 3D Dekoracija za Dom | Lumora",
    "seoDescription": "Papir Saksija od Lumore – 3D štampana saksija u obliku papirne kese. Originalan dekor za biljke i suvo cveće. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "kesa-vaza"
  },
  {
    "slug": "sapica-saksija",
    "name": "Šapica Saksija",
    "category": "dom",
    "price": 2200,
    "compareAt": null,
    "lead": "Saksija u obliku mačje šapice — simpatičan dom za sukulent ili kaktus.",
    "forWhom": "Poklon za ljubitelje mačaka i biljaka istovremeno.",
    "dimension": "Visina: do 18 cm",
    "colors": [
      "white",
      "beige",
      "gray",
      "black",
      "pink",
      "green",
      "red"
    ],
    "images": [
      {
        "src": "/images/products/sapica-saksija/1.webp",
        "alt": "Šapica Saksija mačiji trag 3D štampa Lumora"
      },
      {
        "src": "/images/products/sapica-saksija/2.webp",
        "alt": "Šapica Saksija bočni prikaz 3D dekoracija Lumora"
      },
      {
        "src": "/images/products/sapica-saksija/3.webp",
        "alt": "Šapica Saksija 3D ukras za biljke Lumora Srbija"
      }
    ],
    "seoTitle": "Šapica Saksija – 3D Dekoracija u Obliku Mačijeg Traga | Lumora",
    "seoDescription": "Šapica Saksija od Lumore – slatka 3D štampana saksija u obliku šapice. Savršen poklon za ljubitelje mačaka. 7 boja. Dostava po Srbiji.",
    "featured": false,
    "bestseller": false,
    "sourceHandle": "sapica-vaza"
  }
];

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
