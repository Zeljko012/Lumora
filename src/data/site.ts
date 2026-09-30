/**
 * Centralno mesto za sve podatke o brendu i prodavnici.
 * Izmeni ovde -> menja se svuda na sajtu.
 */

const rawUrl =
  (typeof process !== "undefined" && process.env?.PUBLIC_SITE_URL) ||
  "https://www.homedecorlumora.com";

export const SITE = {
  name: "Lumora",
  legalName: "Lumora",
  /** Puni URL bez kose crte na kraju */
  url: rawUrl.replace(/\/$/, ""),
  /** Kratak opis za SEO (meta description na naslovnoj) */
  description:
    "Lumora — 3D štampane dekoracije za dom izrađene u Srbiji. Vaze, figure i svećnjaci u 7 boja. Dostava 3–5 radnih dana, plaćanje pouzećem.",
  tagline: "Skulpturalne 3D dekoracije, izrađene u Srbiji",

  email: "homedecorlumora@gmail.com",
  phone: "+381 69 400 70 70",
  phoneHref: "tel:+381694007070",
  /** Bez grada/sedišta namerno — samo zemlja proizvodnje i dostave. */
  address: {
    country: "Srbija",
    countryCode: "RS",
  },

  social: {
    instagram: "https://www.instagram.com/home_decor_lumora/",
    instagramHandle: "@home_decor_lumora",
  },

  /** Prag za besplatnu dostavu u dinarima */
  freeShippingThreshold: 6000,
  /**
   * Cena dostave ispod praga namerno nije definisana — dok se ne potpiše
   * ugovor sa kurirskom službom, naplaćuje se po njihovoj ceni ("Po ceni
   * kurirske službe" na sajtu).
   */
  deliveryTime: "3–5 radnih dana",
  paymentNote: "Plaćanje pouzećem — gotovinom kuriru pri preuzimanju.",

  currency: "RSD",
  locale: "sr-RS",

  /** Godina osnivanja — za \"© 20xx\" i About stranu */
  foundedYear: 2023,
} as const;

/** Boje u kojima se štampaju proizvodi (vrednost = ključ, label = prikaz, hex = swatch) */
export const PRODUCT_COLORS = [
  { key: "white", label: "Bela", hex: "#EFECE6" },
  { key: "beige", label: "Bež", hex: "#D9C7AC" },
  { key: "gray", label: "Siva", hex: "#8C8B87" },
  { key: "black", label: "Crna", hex: "#26241F" },
  { key: "pink", label: "Roze", hex: "#E7B7C0" },
  { key: "green", label: "Maslinasto zelena", hex: "#6B7256" },
  { key: "red", label: "Crvena", hex: "#B23B2E" },
] as const;

export type ColorKey = (typeof PRODUCT_COLORS)[number]["key"];

export function colorLabel(key: string): string {
  return PRODUCT_COLORS.find((c) => c.key === key)?.label ?? key;
}

export const NAV = [
  { label: "Vaze", href: "/kategorija/vaze" },
  { label: "Figure", href: "/kategorija/figure" },
  { label: "Svećnjaci", href: "/kategorija/svecnjaci" },
  { label: "Dom", href: "/kategorija/dom" },
  { label: "O nama", href: "/o-nama" },
  { label: "Kontakt", href: "/kontakt" },
] as const;
