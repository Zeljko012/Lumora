import { db } from '../db'

/** Trajno briše sve porudžbine sa ovog uređaja (i njihove tragove sinhronizacije) da brojanje krene od #1000. */
export async function resetOrdersLocal(): Promise<number> {
  const ids = (await db.orders.toCollection().primaryKeys()) as string[]
  await db.transaction('rw', db.orders, db.syncState, async () => {
    await db.orders.clear()
    await db.syncState.bulkDelete(ids.map((id) => `orders:${id}`))
  })
  try {
    localStorage.removeItem('lumora.alerted')
  } catch {
    /* nije bitno */
  }
  return ids.length
}

/** Porudžbine (bez probnih/demo) sa brojem od `from` naviše, koje bi bile trajno obrisane. */
export async function countOrdersFrom(from: number): Promise<{ count: number; min: number; max: number }> {
  const list = (await db.orders.toArray()).filter((o) => !o.demo && o.number >= from)
  return { count: list.length, min: Math.min(...list.map((o) => o.number)), max: Math.max(...list.map((o) => o.number)) }
}

/**
 * Trajno briše porudžbine sa brojem od `from` naviše (npr. probne #1004–#1010), da ti brojevi opet budu slobodni.
 * Porudžbine sa manjim brojem se ne diraju. (U bazi se čisti SQL-om iz docs/supabase-reset-from.sql.)
 */
export async function purgeOrdersFrom(from: number): Promise<number> {
  const victims = (await db.orders.toArray()).filter((o) => !o.demo && o.number >= from)
  await db.transaction('rw', db.orders, db.syncState, async () => {
    await db.orders.bulkDelete(victims.map((o) => o.id))
    await db.syncState.bulkDelete(victims.map((o) => `orders:${o.id}`))
  })
  try {
    localStorage.removeItem('lumora.alerted')
  } catch {
    /* nije bitno */
  }
  return victims.length
}
