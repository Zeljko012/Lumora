import { db, getSettings, uid } from '../db'
import { nextOrderNumber, normalizePhone } from './orders'
import type { Expense, Order, OrderItem, OrderSource, OrderStatus, StatusChange } from '../types'

// Probni podaci: da vidiš kako izgledaju početna i analitika pre prve prave porudžbine.
// Sve što ovde nastane ima oznaku `demo` i briše se jednim dodirom (removeDemoData).

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ['Milica', 'Jelena', 'Ana', 'Marija', 'Ivana', 'Tamara', 'Nikola', 'Marko', 'Stefan', 'Luka', 'Dragana', 'Jovana', 'Sara', 'Katarina', 'Milan', 'Aleksandar', 'Teodora', 'Sanja', 'Vladimir', 'Nevena', 'Bojana', 'Petar']
const LAST = ['Jovanović', 'Petrović', 'Nikolić', 'Marković', 'Đorđević', 'Stojanović', 'Ilić', 'Pavlović', 'Stanković', 'Milošević', 'Savić', 'Todorović', 'Kovačević', 'Popović']
const CITIES = [
  ['Beograd', '11000', 0.34],
  ['Novi Sad', '21000', 0.14],
  ['Niš', '18000', 0.1],
  ['Kragujevac', '34000', 0.07],
  ['Subotica', '24000', 0.05],
  ['Čačak', '32000', 0.05],
  ['Kraljevo', '36000', 0.04],
  ['Pančevo', '26000', 0.04],
  ['Zrenjanin', '23000', 0.04],
  ['Šabac', '15000', 0.04],
  ['Valjevo', '14000', 0.03],
  ['Smederevo', '11300', 0.03],
  ['Leskovac', '16000', 0.03],
] as const
const STREETS = ['Kralja Petra', 'Vojvode Stepe', 'Cara Dušana', 'Bulevar oslobođenja', 'Knez Mihailova', 'Nemanjina', 'Svetozara Markovića', 'Kosovska']
const SOURCES: [OrderSource, number][] = [
  ['sajt', 0.55],
  ['instagram', 0.2],
  ['viber', 0.1],
  ['telefon', 0.08],
  ['ostalo', 0.07],
]
const RETURN_REASONS = ['Nije preuzeto', 'Kupac se predomislio', 'Pogrešna adresa']

const DAY = 86400000

export async function addDemoData(): Promise<number> {
  const settings = await getSettings()
  const products = (await db.products.toArray()).filter((p) => !p.deletedAt && p.active && p.variants.length)
  if (!products.length) throw new Error('Katalog je prazan — prvo osveži katalog.')
  const rand = rng(20261021)
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)]
  const weighted = <T>(items: readonly (readonly [T, number])[]) => {
    let r = rand() * items.reduce((s, i) => s + i[1], 0)
    for (const [v, w] of items) if ((r -= w) <= 0) return v
    return items[items.length - 1][0]
  }
  const COLOR_W: Record<string, number> = { crna: 3, bela: 3, 'bež': 2, siva: 1.4, roze: 1.2, 'maslinasto zelena': 1, crvena: 0.8 }
  const pickVariant = (p: (typeof products)[number]) => weighted(p.variants.map((v) => [v, COLOR_W[v.color] ?? 1] as const))
  // omiljeni proizvodi se prodaju češće
  const favourites = [...products].sort(() => rand() - 0.5).slice(0, 6)

  // kupci: neki se vraćaju
  const customers = Array.from({ length: 90 }, () => {
    const c = weighted(CITIES.map((x) => [x, x[2]] as const))
    return {
      name: `${pick(FIRST)} ${pick(LAST)}`,
      city: c[0],
      zip: c[1],
      address: `${pick(STREETS)} ${1 + Math.floor(rand() * 90)}`,
      phone: `06${Math.floor(rand() * 10)} ${100 + Math.floor(rand() * 899)} ${1000 + Math.floor(rand() * 8999)}`,
    }
  })

  const now = Date.now()
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  const days = 75
  const activeCouriers = settings.couriers.filter((c) => c.active)
  let number = await nextOrderNumber()
  const orders: Order[] = []

  for (let back = days - 1; back >= 0; back--) {
    const dayStart = startOfToday - back * DAY
    const weekday = (new Date(dayStart).getDay() + 6) % 7 // pon = 0
    const growth = 0.7 + ((days - back) / days) * 1.1
    const wk = [0.9, 0.85, 0.95, 1, 1.25, 1.4, 1.2][weekday]
    // prosečno ~1,3 porudžbine dnevno, rastuće
    const lambda = 1.0 * growth * wk
    let count = 0
    for (let k = 0; k < 6; k++) if (rand() < lambda / 3) count++
    for (let n = 0; n < count; n++) {
      const hour = weighted([
        [9, 1], [10, 1.2], [11, 1.3], [12, 1.5], [13, 1.2], [14, 1], [15, 1.1], [16, 1.2], [17, 1.4], [18, 1.6], [19, 2.4], [20, 3], [21, 3.2], [22, 2.2], [23, 1],
      ] as const)
      const createdAt = dayStart + hour * 3600000 + Math.floor(rand() * 3600000)
      if (createdAt > now) continue

      const lines = weighted([[1, 6], [2, 3], [3, 1]] as const)
      const items: OrderItem[] = []
      for (let l = 0; l < lines; l++) {
        const p = rand() < 0.4 ? pick(favourites) : pick(products)
        const v = pickVariant(p)
        items.push({ id: uid(), productId: p.id, variantId: v.id, title: p.title, color: v.color, size: v.size, qty: rand() < 0.82 ? 1 : 2, price: v.price, packed: false })
      }
      const total = items.reduce((s, i) => s + i.qty * i.price, 0)
      const age = (now - createdAt) / DAY

      // status zavisi od starosti porudžbine
      let status: OrderStatus
      const r = rand()
      if (age > 14) status = r < 0.82 ? 'naplaceno' : r < 0.9 ? 'vraceno' : r < 0.95 ? 'otkazano' : 'isporuceno'
      else if (age > 7) status = r < 0.55 ? 'naplaceno' : r < 0.75 ? 'isporuceno' : r < 0.9 ? 'poslato' : r < 0.95 ? 'vraceno' : 'otkazano'
      else if (age > 3) status = r < 0.5 ? 'poslato' : r < 0.75 ? 'spakovano' : r < 0.85 ? 'isporuceno' : 'nova'
      else status = r < 0.6 ? 'nova' : r < 0.9 ? 'spakovano' : 'poslato'

      const history: StatusChange[] = [{ status: 'nova', at: createdAt }]
      const step = (s: OrderStatus, after: number) => {
        history.push({ status: s, at: Math.min(now - 60000, createdAt + after * DAY + rand() * 4 * 3600000) })
      }
      const reached = (s: OrderStatus) => ['nova', 'spakovano', 'poslato', 'isporuceno', 'naplaceno'].indexOf(s)
      if (status === 'otkazano') step('otkazano', 0.3)
      else {
        const goal = status === 'vraceno' ? 'isporuceno' : status
        if (reached(goal) >= 1) step('spakovano', 0.4 + rand() * 0.6)
        if (reached(goal) >= 2) step('poslato', 1 + rand() * 1.2)
        if (reached(goal) >= 3) step('isporuceno', 2.6 + rand() * 1.5)
        if (reached(goal) >= 4) step('naplaceno', 3.5 + rand() * 3)
        if (status === 'vraceno') step('vraceno', 5 + rand() * 3)
      }
      const sentCustomerIdx = rand() < 0.22 ? Math.floor(rand() * 14) : Math.floor(rand() * customers.length)
      const cust = customers[sentCustomerIdx]
      const courier = pick(activeCouriers.length ? activeCouriers : settings.couriers)
      const payer = total >= 6000 ? 'posiljalac' : 'primalac'
      const packedAll = ['spakovano', 'poslato', 'isporuceno', 'naplaceno', 'vraceno'].includes(status)
      const lastAt = history[history.length - 1].at

      orders.push({
        id: uid(),
        number: number++,
        createdAt,
        updatedAt: lastAt,
        source: weighted(SOURCES.map((s) => [s[0], s[1]] as const)),
        customer: { name: cust.name, address: cust.address, city: cust.city, zip: cust.zip, phone: cust.phone },
        phoneNorm: normalizePhone(cust.phone),
        note: '',
        items: items.map((i) => ({ ...i, packed: packedAll })),
        courierId: courier.id,
        shippingPayer: payer,
        shippingPrice: courier.price,
        paymentMethod: 'pouzece',
        discount: 0,
        status,
        statusHistory: history,
        tracking: reached(status === 'vraceno' ? 'isporuceno' : status) >= 2 ? `PE${Math.floor(1e8 + rand() * 9e8)}` : '',
        returnInfo: status === 'vraceno' ? { reason: pick(RETURN_REASONS), cost: courier.price * 2, restocked: true, at: lastAt } : undefined,
        demo: true,
      })
    }
  }

  const expenses: Expense[] = []
  const exp: [string, number, number][] = [
    ['Materijal (filament)', 7800, 3],
    ['Materijal (filament)', 6900, 24],
    ['Materijal (filament)', 8200, 48],
    ['Ambalaža', 2400, 10],
    ['Ambalaža', 1900, 40],
    ['Reklame', 4500, 6],
    ['Reklame', 3800, 35],
    ['Struja', 2800, 15],
  ]
  for (const [category, amount, ago] of exp) {
    expenses.push({ id: uid(), date: now - ago * DAY, category, amount, note: 'probni podatak', updatedAt: now, demo: true })
  }

  await db.transaction('rw', db.orders, db.expenses, async () => {
    await db.orders.bulkAdd(orders)
    await db.expenses.bulkAdd(expenses)
  })
  return orders.length
}

/** Briše samo probne podatke (pravi se ne diraju). */
export async function removeDemoData(): Promise<number> {
  let n = 0
  await db.transaction('rw', db.orders, db.expenses, async () => {
    const o = (await db.orders.toArray()).filter((x) => x.demo).map((x) => x.id)
    const e = (await db.expenses.toArray()).filter((x) => x.demo).map((x) => x.id)
    await db.orders.bulkDelete(o)
    await db.expenses.bulkDelete(e)
    n = o.length + e.length
  })
  return n
}

export async function hasDemoData(): Promise<boolean> {
  return (await db.orders.toArray()).some((o) => o.demo)
}
