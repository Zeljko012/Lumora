/**
 * Korpa — čuva se u localStorage, radi potpuno na klijentu.
 * Emituje `window` event "lumora:cart" pri svakoj promeni.
 */
export interface CartItem {
  key: string;
  slug: string;
  name: string;
  color: string;
  colorLabel: string;
  price: number;
  image: string;
  qty: number;
}

export type CartInput = Omit<CartItem, "key" | "qty">;

const KEY = "lumora.cart.v1";
const EVENT = "lumora:cart";
const MAX_QTY = 20;

function read(): CartItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && typeof i.slug === "string" && typeof i.price === "number" && i.qty > 0,
    );
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* private mode / quota — ignoriši */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: items }));
  }
}

const keyFor = (slug: string, color: string) => `${slug}::${color}`;

export function getCart(): CartItem[] {
  return read();
}

export function cartCount(): number {
  return read().reduce((n, i) => n + i.qty, 0);
}

export function cartSubtotal(): number {
  return read().reduce((s, i) => s + i.price * i.qty, 0);
}

export function addItem(input: CartInput, qty = 1): CartItem[] {
  const items = read();
  const key = keyFor(input.slug, input.color);
  const found = items.find((i) => i.key === key);
  if (found) {
    found.qty = Math.min(MAX_QTY, found.qty + qty);
  } else {
    items.push({ ...input, key, qty: Math.min(MAX_QTY, Math.max(1, qty)) });
  }
  write(items);
  return items;
}

export function setQty(key: string, qty: number): CartItem[] {
  let items = read();
  if (qty <= 0) {
    items = items.filter((i) => i.key !== key);
  } else {
    const it = items.find((i) => i.key === key);
    if (it) it.qty = Math.min(MAX_QTY, qty);
  }
  write(items);
  return items;
}

export function removeItem(key: string): CartItem[] {
  const items = read().filter((i) => i.key !== key);
  write(items);
  return items;
}

export function clearCart(): void {
  write([]);
}

export function onCartChange(cb: (items: CartItem[]) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<CartItem[]>).detail ?? read());
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export const CART_EVENT = EVENT;
