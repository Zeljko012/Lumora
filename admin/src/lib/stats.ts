// Statistika: sve formule na jednom mestu.
//
// Definicije (period = [od, do)):
//  promet        = vrednost porudžbina napravljenih u periodu (bez otkazanih), proizvodi − popust
//  naplaćeno     = otkupnine koje su prešle u "Naplaćeno" u periodu + porudžbine plaćene unapred, napravljene u periodu
//  čeka naplatu  = trenutno stanje: poslato/isporučeno pouzećem, a još nije naplaćeno
//  dostava       = poštarina koju plaćaš ti (pošiljalac), za pošiljke poslate u periodu
//  povrati       = trošak povrata upisan u periodu
//  ostali        = ručno uneti troškovi u periodu
//  čista zarada  = naplaćeno − dostava − povrati − ostali

import type { Expense, Order, OrderSource, OrderStatus, Product } from '../types'
import { codAmount, orderTotal, payerOf, sentAt } from './orders'

export type PeriodId = 'danas' | 'juce' | '7d' | '30d' | 'nedelja' | 'mesec' | 'prosli-mesec' | 'godina' | 'opseg'
export interface Range {
  from: number
  to: number
}

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'danas', label: 'Danas' },
  { id: 'juce', label: 'Juče' },
  { id: '7d', label: '7 dana' },
  { id: '30d', label: '30 dana' },
  { id: 'nedelja', label: 'Ova nedelja' },
  { id: 'mesec', label: 'Ovaj mesec' },
  { id: 'prosli-mesec', label: 'Prošli mesec' },
  { id: 'godina', label: 'Godina' },
  { id: 'opseg', label: 'Opseg…' },
]

const DAY = 86400000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds())

/** Period i prethodni period za poređenje. Periodi "do sada" porede se sa istim delom prethodnog perioda. */
export function periodRanges(id: PeriodId, custom?: Range, now = new Date()): { cur: Range; prev: Range; prevLabel: string } {
  const today = startOfDay(now)
  const t = now.getTime()
  switch (id) {
    case 'danas':
      return { cur: { from: today.getTime(), to: t }, prev: { from: addDays(today, -1).getTime(), to: t - DAY }, prevLabel: 'juče do ovog sata' }
    case 'juce':
      return { cur: { from: addDays(today, -1).getTime(), to: today.getTime() }, prev: { from: addDays(today, -2).getTime(), to: addDays(today, -1).getTime() }, prevLabel: 'prekjuče' }
    case '7d':
    case '30d': {
      const n = id === '7d' ? 7 : 30
      const from = addDays(today, -(n - 1)).getTime()
      const len = t - from
      return { cur: { from, to: t }, prev: { from: from - len, to: from }, prevLabel: `prethodnih ${n} dana` }
    }
    case 'nedelja': {
      const mon = addDays(today, -((today.getDay() + 6) % 7))
      return { cur: { from: mon.getTime(), to: t }, prev: { from: addDays(mon, -7).getTime(), to: t - 7 * DAY }, prevLabel: 'isti deo prošle nedelje' }
    }
    case 'mesec': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      return { cur: { from: first.getTime(), to: t }, prev: { from: addMonths(first, -1).getTime(), to: addMonths(now, -1).getTime() }, prevLabel: 'isti deo prošlog meseca' }
    }
    case 'prosli-mesec': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 1)
      return { cur: { from: first.getTime(), to: end.getTime() }, prev: { from: addMonths(first, -1).getTime(), to: first.getTime() }, prevLabel: 'pretprošli mesec' }
    }
    case 'godina': {
      const first = new Date(now.getFullYear(), 0, 1)
      return {
        cur: { from: first.getTime(), to: t },
        prev: { from: new Date(now.getFullYear() - 1, 0, 1).getTime(), to: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).getTime() },
        prevLabel: 'isti deo prošle godine',
      }
    }
    case 'opseg': {
      const c = custom ?? { from: today.getTime(), to: t }
      const len = c.to - c.from
      return { cur: c, prev: { from: c.from - len, to: c.from }, prevLabel: 'isti broj dana pre toga' }
    }
  }
}

const inR = (ts: number | null | undefined, r: Range) => ts != null && ts >= r.from && ts < r.to
const lastAt = (o: Order, s: OrderStatus) => {
  for (let i = o.statusHistory.length - 1; i >= 0; i--) if (o.statusHistory[i].status === s) return o.statusHistory[i].at
  return null
}

/* ------------------------------------------------------------------ */

export interface Kpis {
  promet: number
  naplaceno: number
  dostava: number
  povrati: number
  ostali: number
  zarada: number
  /** procena troška izrade prodatih komada (samo za proizvode kojima je upisan trošak) */
  izrada: number
  brojPorudzbina: number
  prosek: number
  komada: number
}

export function kpis(orders: Order[], expenses: Expense[], r: Range, products: Product[] = []): Kpis {
  const live = orders.filter((o) => !o.deletedAt)
  const created = live.filter((o) => inR(o.createdAt, r) && o.status !== 'otkazano')
  const promet = created.reduce((s, o) => s + orderTotal(o), 0)

  let naplaceno = 0
  for (const o of live) {
    if (o.paymentMethod === 'pouzece') {
      if (inR(lastAt(o, 'naplaceno'), r) && o.status === 'naplaceno') naplaceno += codAmount(o)
    } else if (inR(o.createdAt, r) && o.status !== 'otkazano') naplaceno += orderTotal(o)
  }

  const dostava = live.filter((o) => payerOf(o) === 'posiljalac' && inR(sentAt(o), r)).reduce((s, o) => s + (o.shippingPrice || 0), 0)
  const povrati = live.filter((o) => o.status === 'vraceno' && inR(o.returnInfo?.at, r)).reduce((s, o) => s + (o.returnInfo?.cost ?? 0), 0)
  const ostali = expenses.filter((e) => !e.deletedAt && inR(e.date, r)).reduce((s, e) => s + e.amount, 0)

  const costById = new Map(products.filter((p) => p.cost).map((p) => [p.id, p.cost as number]))
  const izrada = created.reduce((s, o) => s + o.items.reduce((a, i) => a + (i.productId && costById.has(i.productId) ? i.qty * (costById.get(i.productId) as number) : 0), 0), 0)

  return {
    promet,
    naplaceno,
    dostava,
    povrati,
    ostali,
    zarada: naplaceno - dostava - povrati - ostali,
    izrada,
    brojPorudzbina: created.length,
    prosek: created.length ? promet / created.length : 0,
    komada: created.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
  }
}

/** Koliko kurir trenutno duguje: poslato/isporučeno pouzećem, a nije naplaćeno. */
export function awaitingPayment(orders: Order[]) {
  const list = orders.filter((o) => !o.deletedAt && o.paymentMethod === 'pouzece' && (o.status === 'poslato' || o.status === 'isporuceno'))
  return { count: list.length, amount: list.reduce((s, o) => s + codAmount(o), 0) }
}

export function delta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null
  return ((cur - prev) / Math.abs(prev)) * 100
}

/* ------------------------------------------------------------------ */

export interface Bar {
  label: string
  value: number
  hint?: string
}

const WEEKDAYS = ['pon', 'uto', 'sre', 'čet', 'pet', 'sub', 'ned']
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']

export function orderStats(orders: Order[], r: Range) {
  const live = orders.filter((o) => !o.deletedAt)
  const all = live.filter((o) => inR(o.createdAt, r))
  const valid = all.filter((o) => o.status !== 'otkazano')

  // po danu (ili po mesecu za duge periode)
  const days = Math.ceil((Math.min(r.to, Date.now()) - r.from) / DAY)
  const byMonth = days > 62
  const timeline: Bar[] = []
  if (byMonth) {
    const start = new Date(r.from)
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d.getTime() < r.to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      const a = d.getTime()
      const b = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
      timeline.push({ label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, value: valid.filter((o) => o.createdAt >= a && o.createdAt < b).length })
    }
  } else {
    for (let d = startOfDay(new Date(r.from)); d.getTime() < r.to; d = addDays(d, 1)) {
      const a = d.getTime()
      const b = addDays(d, 1).getTime()
      timeline.push({ label: `${d.getDate()}.${d.getMonth() + 1}.`, hint: WEEKDAYS[(d.getDay() + 6) % 7], value: valid.filter((o) => o.createdAt >= a && o.createdAt < b).length })
    }
  }

  const weekday: Bar[] = WEEKDAYS.map((label) => ({ label, value: 0 }))
  const hours: Bar[] = Array.from({ length: 24 }, (_, h) => ({ label: String(h), value: 0 }))
  for (const o of valid) {
    const d = new Date(o.createdAt)
    weekday[(d.getDay() + 6) % 7].value++
    hours[d.getHours()].value++
  }

  const byStatus = new Map<OrderStatus, number>()
  for (const o of all) byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1)

  // prosečna vremena (u danima)
  const toSend: number[] = []
  const toPaid: number[] = []
  for (const o of live) {
    const s = sentAt(o)
    if (inR(s, r)) toSend.push((s! - o.createdAt) / DAY)
    const p = lastAt(o, 'naplaceno')
    if (s && inR(p, r)) toPaid.push((p! - s) / DAY)
  }
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null)

  const shipped = all.filter((o) => ['poslato', 'isporuceno', 'naplaceno', 'vraceno'].includes(o.status))
  const returned = all.filter((o) => o.status === 'vraceno').length
  const cancelled = all.filter((o) => o.status === 'otkazano').length

  const sources = new Map<OrderSource, { count: number; revenue: number }>()
  for (const o of valid) {
    const s = sources.get(o.source) ?? { count: 0, revenue: 0 }
    s.count++
    s.revenue += orderTotal(o)
    sources.set(o.source, s)
  }

  return {
    timeline,
    byMonth,
    weekday,
    hours,
    byStatus,
    avgToSend: avg(toSend),
    avgToPaid: avg(toPaid),
    returnRate: shipped.length ? (returned / shipped.length) * 100 : null,
    returned,
    shipped: shipped.length,
    cancelRate: all.length ? (cancelled / all.length) * 100 : null,
    cancelled,
    total: all.length,
    sources: [...sources.entries()].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.revenue - a.revenue),
  }
}

/* ------------------------------------------------------------------ */

export interface Ranked {
  key: string
  label: string
  sub?: string
  pcs: number
  revenue: number
}

function rank(map: Map<string, Ranked>) {
  return [...map.values()].sort((a, b) => b.pcs - a.pcs || b.revenue - a.revenue)
}

export function productStats(orders: Order[], products: Product[], r: Range) {
  const valid = orders.filter((o) => !o.deletedAt && inR(o.createdAt, r) && o.status !== 'otkazano')
  const prod = new Map<string, Ranked>()
  const color = new Map<string, Ranked>()
  const size = new Map<string, Ranked>()
  const add = (m: Map<string, Ranked>, key: string, label: string, pcs: number, rev: number) => {
    const x = m.get(key) ?? { key, label, pcs: 0, revenue: 0 }
    x.pcs += pcs
    x.revenue += rev
    m.set(key, x)
  }
  for (const o of valid) {
    // popust se raspoređuje srazmerno po stavkama
    const gross = o.items.reduce((s, i) => s + i.qty * i.price, 0)
    const k = gross ? orderTotal(o) / gross : 0
    for (const i of o.items) {
      const rev = i.qty * i.price * k
      add(prod, i.productId ?? i.title, i.title, i.qty, rev)
      if (i.color) add(color, i.color, i.color, i.qty, rev)
      if (i.size) add(size, i.size, i.size, i.qty, rev)
    }
  }

  const ret = new Map<string, Ranked>()
  for (const o of orders) {
    if (o.deletedAt || o.status !== 'vraceno' || !inR(o.returnInfo?.at, r)) continue
    for (const i of o.items) add(ret, i.productId ?? i.title, i.title, i.qty, i.qty * i.price)
  }

  // zaliha: za koliko dana nestaje po prodaji u poslednjih 30 dana
  const since = Date.now() - 30 * DAY
  const sold30 = new Map<string, number>()
  for (const o of orders) {
    if (o.deletedAt || o.status === 'otkazano' || o.createdAt < since) continue
    for (const i of o.items) if (i.variantId) sold30.set(i.variantId, (sold30.get(i.variantId) ?? 0) + i.qty)
  }
  const stock: { key: string; label: string; sub: string; stock: number; perDay: number; days: number | null }[] = []
  for (const p of products) {
    if (p.deletedAt || !p.active) continue
    for (const v of p.variants) {
      const sold = sold30.get(v.id) ?? 0
      if (!sold && v.stock <= 0) continue
      const perDay = sold / 30
      stock.push({
        key: v.id,
        label: p.title,
        sub: [v.color, v.size].filter(Boolean).join(' · '),
        stock: v.stock,
        perDay,
        days: v.stock <= 0 ? 0 : perDay > 0 ? v.stock / perDay : null,
      })
    }
  }
  stock.sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity) || b.perDay - a.perDay)

  return { products: rank(prod), colors: rank(color), sizes: rank(size), returns: rank(ret), stock }
}

/* ------------------------------------------------------------------ */

export function customerStats(orders: Order[], r: Range) {
  const live = orders.filter((o) => !o.deletedAt && o.status !== 'otkazano')
  const first = new Map<string, number>()
  for (const o of live) if (o.phoneNorm) first.set(o.phoneNorm, Math.min(first.get(o.phoneNorm) ?? Infinity, o.createdAt))

  const inP = live.filter((o) => inR(o.createdAt, r))
  const people = new Map<string, { phone: string; name: string; city: string; orders: number; spent: number; returned: number }>()
  for (const o of inP) {
    const key = o.phoneNorm || o.id
    const p = people.get(key) ?? { phone: o.phoneNorm, name: o.customer.name, city: o.customer.city, orders: 0, spent: 0, returned: 0 }
    p.orders++
    p.spent += o.status === 'vraceno' ? 0 : orderTotal(o)
    if (o.status === 'vraceno') p.returned++
    people.set(key, p)
  }
  let fresh = 0
  let returning = 0
  for (const [k] of people) {
    if (inR(first.get(k), r)) fresh++
    else returning++
  }

  const cities = new Map<string, { city: string; orders: number; returned: number; revenue: number }>()
  for (const o of inP) {
    const name = (o.customer.city || '—').trim()
    const key = name.toLowerCase()
    const c = cities.get(key) ?? { city: name, orders: 0, returned: 0, revenue: 0 }
    c.orders++
    c.revenue += orderTotal(o)
    if (o.status === 'vraceno') c.returned++
    cities.set(key, c)
  }

  return {
    fresh,
    returning,
    best: [...people.values()].sort((a, b) => b.spent - a.spent).slice(0, 10),
    citiesByOrders: [...cities.values()].sort((a, b) => b.orders - a.orders).slice(0, 10),
    citiesByReturns: [...cities.values()].filter((c) => c.returned > 0).sort((a, b) => b.returned - a.returned).slice(0, 10),
  }
}

/* ------------------------------------------------------------------ */

export function courierStats(orders: Order[], r: Range, couriers: { id: string; name: string }[]) {
  const m = new Map<string, { id: string; name: string; shipped: number; returned: number; shippingCost: number; returnCost: number; cod: number }>()
  for (const o of orders) {
    if (o.deletedAt) continue
    const s = sentAt(o)
    const sentIn = inR(s, r)
    const retIn = o.status === 'vraceno' && inR(o.returnInfo?.at, r)
    if (!sentIn && !retIn) continue
    const c = m.get(o.courierId) ?? { id: o.courierId, name: couriers.find((x) => x.id === o.courierId)?.name ?? o.courierId, shipped: 0, returned: 0, shippingCost: 0, returnCost: 0, cod: 0 }
    if (sentIn) {
      c.shipped++
      if (payerOf(o) === 'posiljalac') c.shippingCost += o.shippingPrice || 0
      c.cod += codAmount(o)
      if (o.status === 'vraceno') c.returned++
    }
    if (retIn) c.returnCost += o.returnInfo?.cost ?? 0
    m.set(o.courierId, c)
  }
  return [...m.values()].map((c) => ({ ...c, returnRate: c.shipped ? (c.returned / c.shipped) * 100 : null })).sort((a, b) => b.shipped - a.shipped)
}

export function expensesByCategory(expenses: Expense[], r: Range) {
  const m = new Map<string, number>()
  for (const e of expenses) if (!e.deletedAt && inR(e.date, r)) m.set(e.category, (m.get(e.category) ?? 0) + e.amount)
  return [...m.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
}

/* ------------------------------------------------------------------ */
// Prodaja kroz vreme, kategorije, "kada kupci poručuju" (kao Shopify Analytics)

export type SeriesUnit = 'hour' | 'day' | 'month'
export interface SeriesPoint {
  label: string
  start: number
  revenue: number
  orders: number
}

const HOUR = 3600000

/** Prodaja po satu (do 36 h), danu (do ~3 meseca) ili mesecu. Otkazane porudžbine se ne računaju. */
export function salesSeries(orders: Order[], r: Range): { unit: SeriesUnit; points: SeriesPoint[] } {
  const span = r.to - r.from
  const unit: SeriesUnit = span <= 36 * HOUR ? 'hour' : span <= 93 * DAY ? 'day' : 'month'
  const valid = orders.filter((o) => !o.deletedAt && o.status !== 'otkazano' && inR(o.createdAt, r))

  const starts: number[] = []
  if (unit === 'hour') {
    const d0 = new Date(r.from)
    for (let t = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), d0.getHours()).getTime(); t < r.to; t += HOUR) starts.push(t)
  } else if (unit === 'day') {
    for (let d = startOfDay(new Date(r.from)); d.getTime() < r.to; d = addDays(d, 1)) starts.push(d.getTime())
  } else {
    const f = new Date(r.from)
    for (let d = new Date(f.getFullYear(), f.getMonth(), 1); d.getTime() < r.to; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) starts.push(d.getTime())
  }

  const nextOf = (t: number) => {
    if (unit === 'hour') return t + HOUR
    const d = new Date(t)
    return unit === 'day' ? addDays(d, 1).getTime() : new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
  }
  const points = starts.map((start) => {
    const end = nextOf(start)
    const inB = valid.filter((o) => o.createdAt >= start && o.createdAt < end)
    const d = new Date(start)
    const label = unit === 'hour' ? `${d.getHours()}h` : unit === 'day' ? `${d.getDate()}.${d.getMonth() + 1}.` : `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    return { label, start, revenue: inB.reduce((s, o) => s + orderTotal(o), 0), orders: inB.length }
  })
  return { unit, points }
}

/** Prodaja po kategoriji sa sajta (vaze, figure, svećnjaci, dom). */
export function categoryStats(orders: Order[], products: Product[], r: Range, labelOf: (c?: string) => string): Ranked[] {
  const catById = new Map(products.map((p) => [p.id, p.category]))
  const m = new Map<string, Ranked>()
  for (const o of orders) {
    if (o.deletedAt || o.status === 'otkazano' || !inR(o.createdAt, r)) continue
    const gross = o.items.reduce((s, i) => s + i.qty * i.price, 0)
    const k = gross ? orderTotal(o) / gross : 0
    for (const i of o.items) {
      const cat = (i.productId ? catById.get(i.productId) : undefined) || ''
      const x = m.get(cat) ?? { key: cat, label: labelOf(cat), pcs: 0, revenue: 0 }
      x.pcs += i.qty
      x.revenue += i.qty * i.price * k
      m.set(cat, x)
    }
  }
  return [...m.values()].sort((a, b) => b.revenue - a.revenue)
}

/** Matrica 7 × 24: koliko porudžbina po danu u nedelji (pon=0) i satu. */
export function heatmap(orders: Order[], r: Range): number[][] {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0))
  for (const o of orders) {
    if (o.deletedAt || o.status === 'otkazano' || !inR(o.createdAt, r)) continue
    const d = new Date(o.createdAt)
    grid[(d.getDay() + 6) % 7][d.getHours()]++
  }
  return grid
}

/** Poslednjih `n` dana prodaje (uključujući danas) — za male grafikone na početnoj. */
export function lastDaysRevenue(orders: Order[], n: number, now = new Date()): { label: string; revenue: number; orders: number }[] {
  const today = startOfDay(now)
  const out: { label: string; revenue: number; orders: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const a = addDays(today, -i).getTime()
    const b = addDays(today, -i + 1).getTime()
    const inB = orders.filter((o) => !o.deletedAt && o.status !== 'otkazano' && o.createdAt >= a && o.createdAt < b)
    out.push({ label: `${new Date(a).getDate()}.${new Date(a).getMonth() + 1}.`, revenue: inB.reduce((s, o) => s + orderTotal(o), 0), orders: inB.length })
  }
  return out
}
