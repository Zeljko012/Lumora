import { db, getSettings, uid } from '../db'
import { fold } from './format'
import { upsertContact } from './contacts'
import { nextOrderNumber, normalizePhone, saveOrder } from './orders'
import type { Order, OrderItem } from '../types'
import type { SiteOrderPayload } from './siteOrderCodec'

export { decodeSiteOrder, extractCode } from './siteOrderCodec'
export type { SiteOrderPayload } from './siteOrderCodec'

/** Već uvezena porudžbina sa istim brojem sa sajta (obrisane se ne računaju). */
export async function findImported(externalId: string): Promise<Order | undefined> {
  const list = await db.orders.where('externalId').equals(externalId).toArray()
  return list.find((o) => !o.deletedAt)
}

/** Da li je porudžbina sa sajta već uvezena na ovom uređaju (i obrisana se računa, da se ne vraća). */
export async function hasImported(externalId: string): Promise<boolean> {
  return (await db.orders.where('externalId').equals(externalId).count()) > 0
}

/** Koliko stavki iz porudžbine nije pronađeno u katalogu (biće upisane kao slobodan tekst). */
export async function countUnmatched(p: SiteOrderPayload): Promise<number> {
  const products = await db.products.toArray()
  const byHandle = new Map(products.map((x) => [x.handle, x]))
  return p.items.filter((i) => {
    const prod = byHandle.get(i.slug)
    return !prod?.variants.some((v) => fold(v.color) === fold(i.color))
  }).length
}

/** Pravi porudžbinu u aplikaciji od porudžbine sa sajta. Poštarinu plaća pošiljalac samo kad je dostava besplatna. */
export async function importSiteOrder(p: SiteOrderPayload): Promise<Order> {
  const existing = await findImported(p.id)
  if (existing) return existing

  const settings = await getSettings()
  const products = await db.products.toArray()
  const byHandle = new Map(products.map((x) => [x.handle, x]))

  const items: OrderItem[] = p.items.map((i) => {
    const prod = byHandle.get(i.slug)
    const variant = prod?.variants.find((v) => fold(v.color) === fold(i.color))
    return {
      id: uid(),
      productId: prod?.id ?? null,
      variantId: variant?.id ?? null,
      title: i.name,
      color: variant?.color ?? i.color.toLowerCase(),
      size: '',
      qty: i.qty,
      price: i.price,
      packed: false,
    }
  })

  const courier = settings.couriers.find((c) => c.id === settings.defaultCourierId) ?? settings.couriers[0]
  const createdAt = Date.parse(p.at) || Date.now()
  const c = p.customer

  const order: Order = {
    // isti id na svim uređajima: ista porudžbina se ne udvostručuje pri sinhronizaciji
    id: `site:${p.id}`,
    number: await nextOrderNumber(),
    createdAt,
    updatedAt: Date.now(),
    source: 'sajt',
    customer: {
      name: `${c.firstName} ${c.lastName}`.trim(),
      address: c.address,
      city: c.city,
      zip: c.zip,
      phone: c.phone,
      email: c.email,
    },
    phoneNorm: normalizePhone(c.phone),
    note: c.note?.trim() ?? '',
    items,
    courierId: courier?.id ?? settings.defaultCourierId,
    shippingPayer: p.shippingFree ? 'posiljalac' : 'primalac',
    shippingPrice: courier?.price ?? 0,
    paymentMethod: 'pouzece',
    discount: 0,
    status: 'nova',
    statusHistory: [{ status: 'nova', at: createdAt }],
    tracking: '',
    externalId: p.id,
  }
  await saveOrder(order)
  await upsertContact({
    name: order.customer.name,
    email: c.email,
    phone: c.phone,
    city: c.city,
    source: 'sajt',
    marketing: p.marketing === true ? true : undefined,
    at: createdAt,
  })
  return order
}
