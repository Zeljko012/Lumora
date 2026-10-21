// Dvosmerna sinhronizacija svih podataka (porudžbine, troškovi, proizvodi, kontakti, podešavanja)
// između uređaja preko tabele `sync_docs` u Supabase-u.
//  - svaki dokument ima id i `updatedAt`; pobeđuje poslednja izmena (po updatedAt)
//  - brisanje je meko (deletedAt), pa se i ono prenosi
//  - probni (demo) podaci se ne sinhronizuju
import type { Table } from 'dexie'
import { db } from '../db'
import { nextOrderNumber } from './orders'
import { syncAdapter, type SyncRow } from './remote'
import type { Contact, Order } from '../types'

type Doc = { id: string; updatedAt: number; deletedAt?: number; demo?: boolean }

const KINDS: Record<string, () => Table<Doc, string>> = {
  orders: () => db.orders as unknown as Table<Doc, string>,
  expenses: () => db.expenses as unknown as Table<Doc, string>,
  products: () => db.products as unknown as Table<Doc, string>,
  contacts: () => db.contacts as unknown as Table<Doc, string>,
  settings: () => db.settings as unknown as Table<Doc, string>,
}

const CURSOR_KEY = 'lumora.sync.cursor'
const PAGE = 500
const EPOCH = '1970-01-01T00:00:00Z'

let applying = false
/** true dok sinhronizacija sama upisuje podatke (da to ne pokreće novu sinhronizaciju) */
export const isApplyingRemote = () => applying

const stateKey = (kind: string, id: string) => `${kind}:${id}`

function getCursor(): string {
  try {
    return localStorage.getItem(CURSOR_KEY) || EPOCH
  } catch {
    return EPOCH
  }
}
function setCursor(v: string) {
  try {
    localStorage.setItem(CURSOR_KEY, v)
  } catch {
    /* sledeći put se povlači ispočetka, bez štete */
  }
}

/** Dve porudžbine sa istim brojem: kasnije napravljena dobija novi broj (isto pravilo na svim uređajima). */
const later = (a: Pick<Order, 'createdAt' | 'id'>, b: Pick<Order, 'createdAt' | 'id'>) =>
  a.createdAt !== b.createdAt ? a.createdAt > b.createdAt : a.id > b.id

async function applyOrder(incoming: Order): Promise<void> {
  let doc = incoming
  const clash = await db.orders.where('number').equals(doc.number).first()
  if (clash && clash.id !== doc.id) {
    if (later(clash, doc)) {
      await db.orders.put({ ...clash, number: await nextOrderNumber(), updatedAt: Math.max(Date.now(), clash.updatedAt + 1) })
    } else {
      // +1: i kad sat drugog uređaja malo žuri, ispravka mora biti novija da bi stigla do baze
      doc = { ...doc, number: await nextOrderNumber(), updatedAt: Math.max(Date.now(), doc.updatedAt + 1) }
    }
  }
  await db.orders.put(doc)
}

const contactCore = (c: Contact) => JSON.stringify({ ...c, updatedAt: 0 })

/**
 * Spaja dve verzije istog kontakta tako da se ništa ne gubi: prazno polje nikad ne briše popunjeno,
 * izvori se sabiraju, a pristanak null nikad ne pregazi izričit da/ne (između dva izričita pobeđuje novija izmena).
 */
export function mergeContacts(a: Contact, b: Contact): Contact {
  const [n, o] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a]
  return {
    ...n,
    id: a.id < b.id ? a.id : b.id,
    name: n.name || o.name,
    email: n.email || o.email,
    phone: n.phoneNorm ? n.phone : o.phone,
    phoneNorm: n.phoneNorm || o.phoneNorm,
    city: n.city || o.city,
    note: n.note || o.note,
    sources: [...new Set([...a.sources, ...b.sources])].sort(),
    marketing: n.marketing ?? o.marketing,
    createdAt: Math.min(a.createdAt, b.createdAt),
  }
}

/** Kontakti se spajaju (ne pregazi ih "poslednja izmena"), da pristanak i beleške ne nestanu. */
async function applyContact(doc: Contact): Promise<boolean> {
  const sameId = await db.contacts.get(doc.id)
  const clash = doc.deletedAt ? undefined : await db.contacts.where('key').equals(doc.key).first()
  const other = clash && clash.id !== doc.id ? clash : undefined
  const now = Date.now()

  if (!other) {
    if (!sameId) {
      await db.contacts.put(doc)
      return true
    }
    const m = mergeContacts(sameId, doc)
    if (contactCore(m) === contactCore(sameId) && m.deletedAt === sameId.deletedAt) return false
    await db.contacts.put(contactCore(m) === contactCore(doc) ? { ...m, updatedAt: doc.updatedAt } : { ...m, updatedAt: now })
    return true
  }

  // isti kontakt pod dva id-ja: pobeđuje manji id, drugi se označi obrisanim (i to se prenosi dalje)
  const winnerId = other.id < doc.id ? other.id : doc.id
  const m = { ...mergeContacts(other, doc), id: winnerId, updatedAt: now }
  for (const loser of [other, doc]) {
    if (loser.id !== winnerId) await db.contacts.put({ ...loser, key: `deleted:${loser.id}`, deletedAt: now, updatedAt: now })
  }
  await db.contacts.put(m)
  return true
}

async function applyRemote(kind: string, doc: Doc): Promise<void> {
  if (kind === 'orders') return applyOrder(doc as unknown as Order)
  await KINDS[kind]().put(doc)
}

export interface SyncReport {
  pulled: number
  pushed: number
}

async function pull(): Promise<number> {
  const a = syncAdapter()
  let since = getCursor()
  let total = 0
  for (let guard = 0; guard < 200; guard++) {
    const rows = await a.pull(since, PAGE)
    if (!rows.length) break
    const states = new Map((await db.syncState.bulkGet(rows.map((r) => stateKey(r.kind, r.id)))).map((s) => [s?.id, s?.ts]))
    const marks: { id: string; ts: number }[] = []
    applying = true
    try {
      for (const r of rows) {
        const table = KINDS[r.kind]
        if (!table) continue
        const doc = r.data as Doc
        if (!doc || doc.id !== r.id) continue
        const local = await table().get(r.id)
        const known = states.get(stateKey(r.kind, r.id)) ?? -1
        if (r.kind === 'contacts') {
          if (await applyContact(doc as unknown as Contact)) total++
          marks.push({ id: stateKey(r.kind, r.id), ts: Math.max(known, doc.updatedAt) })
        } else if (!local || local.updatedAt < doc.updatedAt) {
          await applyRemote(r.kind, doc)
          total++
          marks.push({ id: stateKey(r.kind, r.id), ts: Math.max(known, doc.updatedAt) })
        } else if (local.updatedAt === doc.updatedAt) {
          marks.push({ id: stateKey(r.kind, r.id), ts: Math.max(known, doc.updatedAt) })
        }
        // lokalna verzija novija od dolazne: ostaje "prljava" i ide u bazu pri slanju
      }
    } finally {
      applying = false
    }
    if (marks.length) await db.syncState.bulkPut(marks)
    const last = rows[rows.length - 1].server_ts
    const done = !last || last === since || rows.length < PAGE
    if (last) since = last
    if (done) break
  }
  setCursor(since)
  return total
}

async function push(): Promise<number> {
  const a = syncAdapter()
  const state = new Map((await db.syncState.toArray()).map((s) => [s.id, s.ts]))
  const rows: SyncRow[] = []
  const marks: { id: string; ts: number }[] = []
  for (const kind of Object.keys(KINDS)) {
    for (const d of await KINDS[kind]().toArray()) {
      if (d.demo) continue
      if ((state.get(stateKey(kind, d.id)) ?? -1) >= d.updatedAt) continue
      rows.push({ kind, id: d.id, data: d, updated_at: d.updatedAt })
      marks.push({ id: stateKey(kind, d.id), ts: d.updatedAt })
    }
  }
  for (let i = 0; i < rows.length; i += 200) await a.push(rows.slice(i, i + 200))
  if (marks.length) await db.syncState.bulkPut(marks)
  return rows.length
}

let running: Promise<SyncReport> | null = null

/** Povuci tuđe izmene, pa pošalji svoje. Istovremeno teče samo jedna sinhronizacija. */
export function syncNow(): Promise<SyncReport> {
  running ??= (async () => {
    const pulled = await pull()
    const pushed = await push()
    return { pulled, pushed }
  })().finally(() => {
    running = null
  })
  return running
}
