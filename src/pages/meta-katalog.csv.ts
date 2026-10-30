import type { APIRoute } from "astro";
import { PRODUCTS, CATEGORY_META } from "../data/products";
import { PRODUCT_COPY } from "../data/product-copy";
import { SITE } from "../data/site";

/**
 * Katalog proizvoda za Meta (Facebook / Instagram) u CSV obliku.
 * `id` = slug proizvoda, isti kao `content_ids` u Meta Pixel događajima (src/lib/pixel.ts) — zato se
 * kupovine i pregledi sami povezuju sa katalogom. Adresa: /meta-katalog.csv
 * Slike su JPEG (Meta ne garantuje WebP): python scripts/gen-meta-images.py
 */
const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export const GET: APIRoute = () => {
  const head = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "additional_image_link",
    "brand",
    "product_type",
    "custom_label_0",
  ];
  const rows = PRODUCTS.map((p) => {
    const copy = PRODUCT_COPY[p.slug];
    const img = (n: number) => `${SITE.url}/images/meta/${p.slug}-${n}.jpg`;
    const extra = [2, 3].filter((n) => p.images.length >= n).map(img).join(",");
    const description = [
      p.lead,
      p.dimension ? p.dimension.replace(/\n/g, ". ") + "." : "",
      `3D štampano u Srbiji po porudžbini, ${SITE.deliveryTime}. Dostupno u ${p.colors.length} boja. Plaćanje pouzećem.`,
    ]
      .filter(Boolean)
      .join(" ");
    return [
      p.slug,
      copy?.title ?? p.name,
      description,
      "in stock",
      "new",
      `${p.price}.00 ${SITE.currency}`,
      `${SITE.url}/proizvod/${p.slug}/`,
      img(1),
      extra,
      SITE.name,
      CATEGORY_META[p.category].title,
      CATEGORY_META[p.category].title,
    ].map(cell);
  });
  const csv = [head.map(cell), ...rows].map((r) => r.join(",")).join("\r\n") + "\r\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};
