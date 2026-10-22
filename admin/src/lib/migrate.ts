// Jednokratno: proizvodi sa sajta i porudžbine sa sajta dobijaju stalne id-jeve (isti na svim uređajima),
// da se pri sinhronizaciji ne udvostruče. Veze porudžbina → proizvod/varijanta se prepisuju.
import { db } from '../db'
import { fixCase } from './siteOrderCodec'

const FLAG = 'lumora.stableIds.v1'

export async function migrateStableIds(): Promise<void> {
  try {
    if (localStorage.getItem(FLAG)) return
  } catch {
    /* bez localStorage-a radi svaki put, a migracija je bezbedna za ponavljanje */
  }
  await db.transaction('rw', db.products, db.orders, async () => {
    const now = Date.now()
    const prodMap = new Map<string, string>()
    const varMap = new Map<string, string>()

    for (const p of await db.products.toArray()) {
      if (p.source !== 'sajt' || p.id.startsWith('site:')) continue
      if (p.variants.some((v) => !v.optionKey)) continue
      const newId = `site:${p.handle}`
      prodMap.set(p.id, newId)
      const variants = p.variants.map((v) => {
        const nv = `site:${p.handle}:${v.optionKey}`
        varMap.set(v.id, nv)
        return { ...v, id: nv }
      })
      await db.products.delete(p.id)
      if (!(await db.products.get(newId))) await db.products.put({ ...p, id: newId, variants, updatedAt: now })
    }

    for (const o of await db.orders.toArray()) {
      const items = o.items.map((i) => ({
        ...i,
        productId: (i.productId && prodMap.get(i.productId)) || i.productId,
        variantId: (i.variantId && varMap.get(i.variantId)) || i.variantId,
      }))
      const itemsChanged = items.some((i, k) => i.productId !== o.items[k].productId || i.variantId !== o.items[k].variantId)
      const wantId = o.externalId ? `site:${o.externalId}` : o.id
      if (wantId !== o.id) {
        await db.orders.delete(o.id)
        if (!(await db.orders.get(wantId))) await db.orders.put({ ...o, id: wantId, items, updatedAt: now })
      } else if (itemsChanged) {
        await db.orders.put({ ...o, items, updatedAt: now })
      }
    }
  })
  try {
    localStorage.setItem(FLAG, '1')
  } catch {
    /* ignoriši */
  }
}

const CASE_FLAG = 'lumora.fixCase.v1'

/** Jednokratno: ispravlja "SurČin" → "Surčin" u već sačuvanim porudžbinama i kontaktima. */
export async function fixStoredCase(): Promise<void> {
  try {
    if (localStorage.getItem(CASE_FLAG)) return
  } catch {
    /* ponavlja se, a bezbedno je */
  }
  const now = Date.now()
  await db.transaction('rw', db.orders, db.contacts, async () => {
    for (const o of await db.orders.toArray()) {
      const c = { ...o.customer, name: fixCase(o.customer.name), address: fixCase(o.customer.address), city: fixCase(o.customer.city) }
      if (c.name !== o.customer.name || c.address !== o.customer.address || c.city !== o.customer.city) await db.orders.put({ ...o, customer: c, updatedAt: now })
    }
    for (const k of await db.contacts.toArray()) {
      const name = fixCase(k.name)
      const city = fixCase(k.city)
      if (name !== k.name || city !== k.city) await db.contacts.put({ ...k, name, city, updatedAt: now })
    }
  })
  try {
    localStorage.setItem(CASE_FLAG, '1')
  } catch {
    /* ignoriši */
  }
}
