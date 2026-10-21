// Automatski prijem i sinhronizacija:
//  1) podaci se usklađuju između uređaja (lib/sync.ts)
//  2) porudžbine koje je sajt upisao u bazu ulaze u listu čim stignu, uz zvuk
//  3) prijave na obaveštenja završavaju u listi kontakata
import { importSiteOrder, hasImported, findImported } from './siteOrder'
import { ensureContactsBackfilled, upsertContact } from './contacts'
import { adapter, remoteConfigured, syncAdapter } from './remote'
import { isApplyingRemote, syncNow } from './sync'
import { alertNewOrder } from './sound'
import { orderTotal } from './orders'
import { db } from '../db'
import type { Order } from '../types'

export type InboxState = 'off' | 'login' | 'ok' | 'error'
export interface InboxStatus {
  state: InboxState
  lastSync: number | null
  message: string
}

let status: InboxStatus = { state: 'off', lastSync: null, message: '' }
const statusSubs = new Set<() => void>()
const orderSubs = new Set<(orders: Order[]) => void>()

export const getInboxStatus = () => status
export function onInboxStatus(cb: () => void) {
  statusSubs.add(cb)
  return () => {
    statusSubs.delete(cb)
  }
}
/** javlja kad stignu NOVE porudžbine (ne i one koje su već bile prijavljene) */
export function onNewOrders(cb: (orders: Order[]) => void) {
  orderSubs.add(cb)
  return () => {
    orderSubs.delete(cb)
  }
}

function setStatus(patch: Partial<InboxStatus>) {
  status = { ...status, ...patch }
  statusSubs.forEach((f) => f())
}

export const orderValue = (o: Order) => orderTotal(o)

/** porudžbina starija od ovoga se uveze tiho, bez zvuka */
const FRESH_MS = 15 * 60_000

/* koje porudžbine su već najavljene zvukom na ovom uređaju (da isto ne zasvira dvaput) */
const ALERTED_KEY = 'lumora.alerted'
function loadAlerted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(ALERTED_KEY) || '[]') as string[])
  } catch {
    return new Set()
  }
}
function saveAlerted(s: Set<string>) {
  try {
    localStorage.setItem(ALERTED_KEY, JSON.stringify([...s].slice(-300)))
  } catch {
    /* nije bitno */
  }
}

let running: Promise<void> | null = null
let lastContactsPull = 0
let firstSyncDone = false

async function pullContacts() {
  const rows = await adapter().fetchContacts()
  for (const r of rows) {
    const sources = (r.sources?.length ? r.sources : ['sajt']).map((s) => (s === 'porudzbina' ? 'sajt' : s))
    for (const source of sources) {
      await upsertContact({
        name: r.name ?? '',
        email: r.email ?? '',
        phone: r.phone ?? '',
        city: r.city ?? '',
        source,
        marketing: r.marketing_consent === true ? true : undefined,
      })
    }
  }
  lastContactsPull = Date.now()
}

async function doPull(forceContacts: boolean) {
  if (!remoteConfigured()) {
    setStatus({ state: 'off', message: '' })
    return
  }
  const a = adapter()
  try {
    if (!(await a.ready())) {
      setStatus({ state: 'login', message: 'Prijavi se da bi se podaci sinhronizovali i porudžbine stizale same.' })
      return
    }
    // 1) prvo tuđe izmene (da se ne uveze ono što drugi uređaj već ima), tek onda sajt
    await syncNow()
    if (!firstSyncDone) {
      firstSyncDone = true
      await ensureContactsBackfilled()
    }

    // 2) porudžbine sa sajta: svaki uređaj uveze sve što nema; zvuk samo za sveže porudžbine koje još nisu najavljene
    const rows = await a.fetchRecentOrders()
    const alerted = loadAlerted()
    const fresh: Order[] = []
    for (const r of rows) {
      if (!(await hasImported(r.external_id))) await importSiteOrder(r.payload)
      const isFresh = Date.now() - (Date.parse(r.created_at) || 0) < FRESH_MS
      if (isFresh && !alerted.has(r.external_id)) {
        alerted.add(r.external_id)
        const o = await findImported(r.external_id)
        if (o) fresh.push(o)
      }
    }
    saveAlerted(alerted)

    // 3) kontakti iz prijava na sajtu
    if (forceContacts || Date.now() - lastContactsPull > 5 * 60_000) await pullContacts()

    // 4) pošalji ono što je ovde nastalo (uvezene porudžbine, novi kontakti)
    await syncNow()
    setStatus({ state: 'ok', lastSync: Date.now(), message: '' })
    if (fresh.length) {
      void alertNewOrder()
      orderSubs.forEach((f) => f(fresh))
    }
  } catch (e) {
    setStatus({ state: 'error', message: (e as Error).message || 'Veza sa bazom ne radi.' })
  }
}

/** Preuzmi sada. Istovremeno se izvršava samo jedno preuzimanje. */
export function pullInbox(forceContacts = false): Promise<void> {
  if (running) return running
  running = doPull(forceContacts).finally(() => {
    running = null
  })
  return running
}

let started = false
let unsub: (() => void) | null = null
let unsubSync: (() => void) | null = null
let debounce: number | undefined

/** Lokalna izmena → za par sekundi ide u bazu. */
function scheduleSync() {
  if (isApplyingRemote() || !remoteConfigured()) return
  window.clearTimeout(debounce)
  debounce = window.setTimeout(() => void pullInbox(), 2500)
}

let hooked = false
function hookDb() {
  if (hooked) return
  hooked = true
  for (const t of [db.orders, db.expenses, db.products, db.contacts, db.settings]) {
    t.hook('creating', () => {
      scheduleSync()
    })
    t.hook('updating', () => {
      scheduleSync()
    })
  }
}

/** Pokreće se jednom pri otvaranju aplikacije. Vraća funkciju za zaustavljanje. */
export function startInbox(): () => void {
  if (started) return () => {}
  started = true
  hookDb()
  void pullInbox(true)
  const timer = window.setInterval(() => void pullInbox(), 45_000)
  const wake = () => {
    if (document.visibilityState !== 'hidden') void pullInbox()
  }
  window.addEventListener('focus', wake)
  window.addEventListener('online', wake)
  document.addEventListener('visibilitychange', wake)
  const resub = () => {
    unsub?.()
    unsubSync?.()
    unsub = remoteConfigured() ? adapter().subscribe((what) => void pullInbox(what === 'contacts')) : null
    unsubSync = remoteConfigured() ? syncAdapter().subscribe(() => void pullInbox()) : null
  }
  resub()
  window.addEventListener('lumora:remote-changed', () => {
    resub()
    void pullInbox(true)
  })
  return () => {
    started = false
    window.clearInterval(timer)
    window.removeEventListener('focus', wake)
    window.removeEventListener('online', wake)
    document.removeEventListener('visibilitychange', wake)
    unsub?.()
    unsubSync?.()
  }
}

/** Posle izmene podešavanja veze (prijava, odjava, novi ključ). */
export function remoteChanged() {
  window.dispatchEvent(new Event('lumora:remote-changed'))
}
