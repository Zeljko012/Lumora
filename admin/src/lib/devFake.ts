// SAMO ZA RAZVOJ (import.meta.env.DEV): lažna "baza" da se auto-prijem, zvuk i kontakti mogu proveriti bez Supabase-a.
import { setInboxAdapter, type InboxAdapter, type RemoteContactRow, type RemoteOrderRow } from './remote'
import { pullInbox, remoteChanged } from './inbox'
import type { SiteOrderPayload } from './siteOrderCodec'

const orders: (RemoteOrderRow & { status: string })[] = []
const contacts: RemoteContactRow[] = []
let listener: ((what: 'orders' | 'contacts') => void) | null = null
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
      orders,
      contacts,
    },
  })
}
