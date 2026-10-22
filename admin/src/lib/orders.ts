import { db, getSettings } from '../db'
import { remoteNextOrderNumber } from './remote'
import type { Customer, Order, OrderItem, OrderSource, OrderStatus, PaymentMethod, Product, ShippingPayer } from '../types'

export const STATUSES: { id: OrderStatus; label: string }[] = [
  { id: 'nova', label: 'Nova' },
  { id: 'spakovano', label: 'Spakovano' },
  { id: 'poslato', label: 'Poslato' },
  { id: 'isporuceno', label: 'Isporučeno' },
  { id: 'naplaceno', label: 'Naplaćeno' },
  { id: 'vraceno', label: 'Vraćeno' },
  { id: 'otkazano', label: 'Otkazano' },
]
export const statusLabel = (s: OrderStatus) => STATUSES.find((x) => x.id === s)?.label ?? s

export const SOURCES: { id: OrderSource; label: string }[] = [
  { id: 'sajt', label: 'Sajt' },
  { id: 'rucno', label: 'Ručno' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'viber', label: 'Viber' },
  { id: 'telefon', label: 'Telefon' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'email', label: 'Mejl' },
  { id: 'ostalo', label: 'Ostalo' },
]
export const sourceLabel = (s: OrderSource) => SOURCES.find((x) => x.id === s)?.label ?? s

export const PAYMENT_LABEL: Record<PaymentMethod, string> = { pouzece: 'Pouzećem', uplaceno: 'Uplaćeno' }
export const PAYER_LABEL: Record<ShippingPayer, string> = { primalac: 'Primalac', posiljalac: 'Pošiljalac' }
/** stare porudžbine (pre Faze 2) nemaju ovo polje */
export const payerOf = (o: Pick<Order, 'shippingPayer'>): ShippingPayer => o.shippingPayer ?? 'primalac'

/** glavni tok: Nova → Spakovano → Poslato → Isporučeno → Naplaćeno */
export const FLOW: OrderStatus[] = ['nova', 'spakovano', 'poslato', 'isporuceno', 'naplaceno']
export function nextStatus(s: OrderStatus): OrderStatus | null {
  const i = FLOW.indexOf(s)
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null
}

/** "+381 64 123-45-67" → "0641234567" */
export function normalizePhone(phone: string) {
  let d = (phone || '').replace(/\D/g, '')
  if (d.startsWith('00381')) d = '0' + d.slice(5)
  else if (d.startsWith('381')) d = '0' + d.slice(3)
  else if (d && !d.startsWith('0')) d = '0' + d
  return d
}

export function itemsTotal(items: Pick<OrderItem, 'qty' | 'price'>[]) {
  return items.reduce((s, i) => s + i.qty * i.price, 0)
}

/** vrednost porudžbine = proizvodi − popust (poštarinu kupac plaća direktno kuriru, nije deo otkupnine) */
export function orderTotal(o: Pick<Order, 'items' | 'discount'>) {
  return Math.max(0, itemsTotal(o.items) - (o.discount || 0))
}

/** iznos koji kurir naplaćuje od kupca za mene (otkupnina) */
export function codAmount(o: Pick<Order, 'items' | 'discount' | 'paymentMethod'>) {
  return o.paymentMethod === 'pouzece' ? orderTotal(o) : 0
}

export const itemLabel = (i: Pick<OrderItem, 'title' | 'color' | 'size'>) =>
  [i.title, i.color, i.size].filter(Boolean).join(' · ')

/** Brojevi porudžbina kreću od 1000. Računaju se samo prave (neobrisane, ne probne), a zauzeti brojevi se preskaču. */
export async function nextOrderNumber() {
  const used = new Set<number>()
  let max = 999
  await db.orders.each((o) => {
    used.add(o.number)
    if (!o.deletedAt && !o.demo && o.number > max) max = o.number
  })
  let n = max + 1
  while (used.has(n)) n++
  return n
}

/**
 * Broj za novu ručnu porudžbinu: ako je aplikacija povezana sa bazom, uzima se sledeći broj iz zajedničkog brojača
 * (isti brojač koristi i sajt, pa se brojevi sa sajta i ručni ne sudaraju). Bez veze koristi se lokalni sledeći broj.
 */
export async function reserveOrderNumber() {
  const local = await nextOrderNumber()
  try {
    const r = await remoteNextOrderNumber()
    if (r && !(await db.orders.where('number').equals(r).first())) return r
  } catch {
    /* bez veze: lokalni broj */
  }
  return local
}

/** Poslednja porudžbina istog kupca (po telefonu) + da li je ikad vraćao paket. */
export async function findCustomer(phone: string): Promise<{ customer: Customer; orders: number; returned: number } | null> {
  const norm = normalizePhone(phone)
  if (norm.length < 6) return null
  const list = (await db.orders.where('phoneNorm').equals(norm).toArray()).filter((o) => !o.deletedAt)
  if (!list.length) return null
  list.sort((a, b) => b.createdAt - a.createdAt)
  return {
    customer: list[0].customer,
    orders: list.length,
    returned: list.filter((o) => o.status === 'vraceno').length,
  }
}

/** Porudžbine u poslednjih 7 dana sa istim telefonom i bar jednim istim proizvodom. */
export async function findDuplicates(phone: string, productIds: (string | null)[], excludeId?: string) {
  const norm = normalizePhone(phone)
  if (!norm) return []
  const since = Date.now() - 7 * 86400000
  const ids = new Set(productIds.filter(Boolean))
  const list = await db.orders.where('phoneNorm').equals(norm).toArray()
  return list.filter(
    (o) => !o.deletedAt && o.id !== excludeId && o.createdAt >= since && o.status !== 'otkazano' && o.items.some((i) => i.productId && ids.has(i.productId)),
  )
}

/** Menja zalihu: sign -1 skida komade, +1 vraća. */
async function adjustStock(items: OrderItem[], sign: 1 | -1) {
  const byProduct = new Map<string, OrderItem[]>()
  for (const i of items) if (i.productId && i.variantId) byProduct.set(i.productId, [...(byProduct.get(i.productId) ?? []), i])
  for (const [pid, list] of byProduct) {
    const p = await db.products.get(pid)
    if (!p) continue
    const variants = p.variants.map((v) => {
      const qty = list.filter((i) => i.variantId === v.id).reduce((s, i) => s + i.qty, 0)
      return qty ? { ...v, stock: v.stock + sign * qty } : v
    })
    await db.products.put({ ...p, variants, updatedAt: Date.now() })
  }
}

/** Da li porudžbina "drži" robu sa zalihe. Otkazana ne drži; vraćena drži osim ako je roba vraćena na zalihu. */
const holdsStock = (o: Order) => !o.deletedAt && o.status !== 'otkazano' && !(o.status === 'vraceno' && o.returnInfo?.restocked)

/** Čuva porudžbinu (novu ili izmenjenu) i usklađuje zalihu. */
export async function saveOrder(order: Order, previous?: Order) {
  const settings = await getSettings()
  await db.transaction('rw', db.orders, db.products, async () => {
    if (settings.deductStock) {
      if (previous && holdsStock(previous)) await adjustStock(previous.items, 1)
      if (holdsStock(order)) await adjustStock(order.items, -1)
    }
    await db.orders.put({ ...order, phoneNorm: normalizePhone(order.customer.phone), updatedAt: Date.now() })
  })
}

/** Briše porudžbinu (meko brisanje, zbog kasnije sinhronizacije) i vraća robu na zalihu. */
export async function deleteOrder(order: Order) {
  await saveOrder({ ...order, deletedAt: Date.now() }, order)
}

/** Menja status, upisuje u istoriju. Pri prelazu na "spakovano" i dalje sve stavke postaju spakovane. */
export async function changeStatus(order: Order, status: OrderStatus, extra: Partial<Order> = {}, note?: string) {
  if (order.status === status && !Object.keys(extra).length) return
  const at = Date.now()
  const packedNow = FLOW.indexOf(status) >= 1
  const next: Order = {
    ...order,
    ...extra,
    status,
    items: packedNow ? order.items.map((i) => ({ ...i, packed: true })) : order.items,
    statusHistory: [...order.statusHistory, { status, at, note }],
  }
  if (status !== 'vraceno') delete next.returnInfo
  await saveOrder(next, order)
}

/** Štiklira stavku; kad je sve spakovano a status je "nova", prelazi u "spakovano" (i obrnuto). */
export async function togglePacked(orderId: string, itemId: string): Promise<{ from: OrderStatus; to: OrderStatus } | null> {
  // čita svež zapis u transakciji, da brzi uzastopni dodiri ne pregaze jedan drugog
  return db.transaction('rw', db.orders, async () => {
    const order = await db.orders.get(orderId)
    if (!order) return null
    const items = order.items.map((i) => (i.id === itemId ? { ...i, packed: !i.packed } : i))
    const all = items.every((i) => i.packed)
    let status = order.status
    let history = order.statusHistory
    if (all && status === 'nova') status = 'spakovano'
    else if (!all && status === 'spakovano') status = 'nova'
    if (status !== order.status) history = [...history, { status, at: Date.now() }]
    await db.orders.put({ ...order, items, status, statusHistory: history, updatedAt: Date.now() })
    return { from: order.status, to: status }
  })
}

export function packProgress(o: Pick<Order, 'items'>) {
  const done = o.items.filter((i) => i.packed).length
  return { done, total: o.items.length, all: o.items.length > 0 && done === o.items.length }
}

/** Kada je pošiljka poslata (poslednji prelaz u "poslato"). */
export function sentAt(o: Order) {
  for (let i = o.statusHistory.length - 1; i >= 0; i--) if (o.statusHistory[i].status === 'poslato') return o.statusHistory[i].at
  return null
}

/** Broj dana od slanja ako je poslato/isporučeno a nije naplaćeno duže od praga; inače null. */
export function unpaidOverdue(o: Order, days: number) {
  if (o.deletedAt || (o.status !== 'poslato' && o.status !== 'isporuceno') || o.paymentMethod === 'uplaceno') return null
  const at = sentAt(o)
  if (!at) return null
  const d = Math.floor((Date.now() - at) / 86400000)
  return d >= days ? d : null
}

export function lowStockVariants(products: Product[], globalThreshold: number | null) {
  const out: { product: Product; variant: Product['variants'][number]; threshold: number }[] = []
  for (const p of products) {
    if (p.deletedAt || !p.active) continue
    const t = p.lowStock ?? globalThreshold
    if (t == null) continue
    for (const v of p.variants) if (v.stock < t) out.push({ product: p, variant: v, threshold: t })
  }
  return out
}
