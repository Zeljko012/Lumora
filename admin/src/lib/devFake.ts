// SAMO ZA RAZVOJ (import.meta.env.DEV): lažna "baza" da se auto-prijem, zvuk i kontakti mogu proveriti bez Supabase-a.
import { setInboxAdapter, setSyncAdapter, type InboxAdapter, type RemoteContactRow, type RemoteOrderRow, type SyncAdapter, type SyncRow } from './remote'
import { pullInbox, remoteChanged, getInboxStatus } from './inbox'
import { syncNow } from './sync'
import { db } from '../db'
import type { SiteOrderPayload } from './siteOrderCodec'

const orders: (RemoteOrderRow & { status: string })[] = []
const contacts: RemoteContactRow[] = []
let listener: ((what: 'orders' | 'contacts') => void) | null = null
/* lažna tabela sync_docs: isto pravilo kao SQL okidač (starija verzija ne pregazi noviju) */
const docs = new Map<string, SyncRow>()
let tick = 0
const stamp = () => new Date(Date.UTC(2026, 0, 1) + ++tick).toISOString()
function remotePut(r: SyncRow) {
  const k = `${r.kind}:${r.id}`
  const old = docs.get(k)
  if (old && r.updated_at <= old.updated_at) return
  docs.set(k, { ...r, server_ts: stamp() })
}
const fakeSync: SyncAdapter = {
  ready: async () => loggedIn,
  pull: async (since, limit) =>
    [...docs.values()].filter((r) => r.server_ts! >= since).sort((a, b) => (a.server_ts! < b.server_ts! ? -1 : 1)).slice(0, limit),
  push: async (rows) => rows.forEach(remotePut),
  subscribe: () => () => {},
}

let loggedIn = true
let failing = false

const fake: InboxAdapter = {
  ready: async () => loggedIn,
  fetchRecentOrders: async () => {
    if (failing) throw new Error('Lažna greška veze')
    return orders
  },
  fetchContacts: async () => contacts,
  subscribe: (cb) => {
    listener = cb
    return () => {
      listener = null
    }
  },
}

export function installDevFake() {
  setInboxAdapter(fake)
  setSyncAdapter(fakeSync)
  remoteChanged()
  Object.assign(window, {
    __fake: {
      /** dodaj porudžbinu "u bazu" (kao da je sajt upisao) i javi uživo */
      addOrder(p: SiteOrderPayload) {
        orders.push({ external_id: p.id, created_at: p.at, payload: p, status: 'new' })
        listener?.('orders')
      },
      addOrderQuiet(p: SiteOrderPayload) {
        orders.push({ external_id: p.id, created_at: p.at, payload: p, status: 'new' })
      },
      addContact(c: Partial<RemoteContactRow> & { contact_key: string }) {
        contacts.push({ email: null, phone: null, name: null, city: null, sources: ['newsletter'], marketing_consent: true, ...c })
        listener?.('contacts')
      },
      setLoggedIn: (v: boolean) => {
        loggedIn = v
      },
      setFailing: (v: boolean) => {
        failing = v
      },
      pull: () => pullInbox(true),
      db,
      syncNow,
      status: getInboxStatus,
      /** ponaša se kao drugi uređaj: upiše dokument u lažnu bazu */
      remotePut,
      docs,
      resetCursor: () => localStorage.removeItem('lumora.sync.cursor'),
      orders,
      contacts,
    },
  })
}
