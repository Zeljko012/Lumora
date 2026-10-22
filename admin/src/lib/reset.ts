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
