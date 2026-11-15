// NOVO U PONUDI — proizvodi koji se dodaju nedeljno. Podaci su u novo.json (najnoviji na vrhu).
// Ovde se samo prevode u iste oblike kao ostali proizvodi, pa sajt, katalog za Meta, pretraga i admin aplikacija rade sa njima bez posebnog koda.
import type { Product } from "./products";
import type { ProductCopy } from "./product-copy";
import data from "./novo.json";

type NovoEntry = Product & { addedAt: string; copy: ProductCopy; /** false = ne prikazuje se u "Novo" (npr. samo u posebnoj ponudi) */ showInNovo?: boolean };
const entries = data.products as unknown as NovoEntry[];

/** Novi proizvodi u obliku običnih proizvoda (bez dodatnih polja). */
export const NOVO_PRODUCTS: Product[] = entries.map(({ addedAt: _a, copy: _c, showInNovo: _s, ...p }) => p);

/** Jedinstven tekst za stranicu proizvoda, po slug-u. */
export const NOVO_COPY: Record<string, ProductCopy> = Object.fromEntries(
  entries.map((e) => [e.slug, e.copy]),
);

/** Najnoviji prvi. Najnoviji ide u iskačući prozor (NovoPopup), svi na stranicu /novo/. */
export const NOVO_SORTED: Product[] = [...entries]
  .filter((e) => e.showInNovo !== false)
  .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
  .map(({ addedAt: _a, copy: _c, showInNovo: _s, ...p }) => p);

/** Proizvodi iz posebne ponude (npr. novogodišnja), redosledom iz novo.json. */
export const collectionProducts = (name: string): Product[] => NOVO_PRODUCTS.filter((p) => p.collection === name);

export const NOVO_SLUGS = new Set(NOVO_SORTED.map((p) => p.slug));
export const isNovo = (slug: string): boolean => NOVO_SLUGS.has(slug);
