// NOVO U PONUDI — proizvodi koji se dodaju nedeljno. Podaci su u novo.json (najnoviji na vrhu).
// Ovde se samo prevode u iste oblike kao ostali proizvodi, pa sajt, katalog za Meta, pretraga i admin aplikacija rade sa njima bez posebnog koda.
import type { Product } from "./products";
import type { ProductCopy } from "./product-copy";
import data from "./novo.json";

type NovoEntry = Product & { addedAt: string; copy: ProductCopy; /** široka slika za baner (nije obavezna) */ banner?: string };
const entries = data.products as unknown as NovoEntry[];

/** Novi proizvodi u obliku običnih proizvoda (bez dodatnih polja). */
export const NOVO_PRODUCTS: Product[] = entries.map(({ addedAt: _a, copy: _c, banner: _b, ...p }) => p);

/** Jedinstven tekst za stranicu proizvoda, po slug-u. */
export const NOVO_COPY: Record<string, ProductCopy> = Object.fromEntries(
  entries.map((e) => [e.slug, e.copy]),
);

/** Najnoviji prvi. Dva najnovija idu u baner na početnoj strani. */
export const NOVO_SORTED: (Product & { banner?: string })[] = [...entries]
  .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  .map(({ addedAt: _a, copy: _c, ...p }) => p);

export const NOVO_SLUGS = new Set(NOVO_SORTED.map((p) => p.slug));
export const isNovo = (slug: string): boolean => NOVO_SLUGS.has(slug);
