// Automatski prijem: porudžbine koje je sajt upisao u bazu ulaze u listu čim stignu,
// uz zvuk, a prijave na obaveštenja završavaju u listi kontakata.
import { importSiteOrder, findImported } from './siteOrder'
import { upsertContact } from './contacts'
import { adapter, remoteConfigured } from './remote'
import { alertNewOrder } from './sound'
import { orderTotal } from './orders'
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
/** javlja kad stignu NOVE porudžbine (ne i one koje su već bile uvezene) */
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

let running: Promise<void> | null = null
let lastContactsPull = 0

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
      setStatus({ state: 'login', message: 'Prijavi se da bi porudžbine sa sajta stizale same.' })
      return
    }
    const rows = await a.fetchNewOrders()
    const fresh: Order[] = []
    const ids: string[] = []
    for (const r of rows) {
      const existed = await findImported(r.external_id)
      const order = existed ?? (await importSiteOrder(r.payload))
      if (!existed) fresh.push(order)
      ids.push(r.external_id)
    }
    if (ids.length) await a.markImported(ids)
    if (forceContacts || Date.now() - lastContactsPull > 5 * 60_000) await pullContacts()
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

/** Pokreće se jednom pri otvaranju aplikacije. Vraća funkciju za zaustavljanje. */
export function startInbox(): () => void {
  if (started) return () => {}
  started = true
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
    unsub = remoteConfigured() ? adapter().subscribe((what) => void pullInbox(what === 'contacts')) : null
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
  }
}

/** Posle izmene podešavanja veze (prijava, odjava, novi ključ). */
export function remoteChanged() {
  window.dispatchEvent(new Event('lumora:remote-changed'))
}
