import { SITE } from "../data/site";

const nf = new Intl.NumberFormat("sr-RS", { maximumFractionDigits: 0 });

/** 2400 -> "2.400 RSD" */
export function money(amount: number): string {
  return `${nf.format(Math.round(amount))} ${SITE.currency}`;
}

/** 2400 -> "2.400" (bez valute) */
export function amount(n: number): string {
  return nf.format(Math.round(n));
}

/** Popust u procentima, npr. compareAt 3000 / price 2400 -> 20 */
export function discountPct(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round((1 - price / compareAt) * 100);
}

/** Koliko još do besplatne dostave; 0 znači da je ostvarena */
export function toFreeShipping(subtotal: number): number {
  return Math.max(0, SITE.freeShippingThreshold - subtotal);
}
