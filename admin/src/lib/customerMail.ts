import { db, getSettings } from '../db'
import { getClient } from './remote'
import type { Order, OrderStatus } from '../types'

/** Statusi za koje kupac dobija mejl (potvrdu porudžbine šalje sam sajt). */
export const MAIL_STATUSES: OrderStatus[] = ['spakovano', 'poslato', 'naplaceno']

const MAIL_LABEL: Partial<Record<OrderStatus, string>> = {
  spakovano: 'porudžbina spakovana',
  poslato: 'pošiljka na putu',
  naplaceno: 'zahvalnica za kupovinu',
}

const total = (o: Order) => Math.max(0, o.items.reduce((s, i) => s + i.qty * i.price, 0) - (o.discount || 0))

/**
 * Posle promene statusa pošalji kupcu mejl preko sajta (jednom po statusu).
 * Ne baca greške i ne blokira: bez mejla kupca, bez veze sa bazom ili kad je isključeno u Podešavanjima — samo preskače.
 */
export async function mailCustomer(orderId: string, status: OrderStatus): Promise<void> {
  try {
    if (!MAIL_STATUSES.includes(status)) return
    const settings = await getSettings()
    if (settings.customerMails === false) return
    const o = await db.orders.get(orderId)
    if (!o || o.demo || o.deletedAt || o.status !== status) return
    const email = (o.customer.email || '').trim()
    if (!email || o.mailed?.[status]) return

    const client = getClient()
    const token = client ? (await client.auth.getSession()).data.session?.access_token : undefined
    if (!token) return

    const res = await fetch(new URL('../api/status-mail', document.baseURI).href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        kind: status,
        number: o.number ? `#${o.number}` : o.externalId || '',
        email,
        name: o.customer.name || '',
        items: o.items.map((i) => ({ title: i.title, variant: [i.color, i.size].filter(Boolean).join(' · '), qty: i.qty, price: i.price })),
        amount: o.paymentMethod === 'pouzece' ? total(o) : 0,
        payment: o.paymentMethod,
        shippingPayer: o.shippingPayer,
        tracking: o.tracking || '',
        courier: settings.couriers.find((c) => c.id === o.courierId)?.name || '',
      }),
    })
    if (!res.ok) {
      console.warn('Mejl kupcu nije poslat', status, res.status, await res.text().catch(() => ''))
      return
    }

    // zabeleži u porudžbini (istorija + da se ne pošalje ponovo); čita svež zapis
    const now = Date.now()
    await db.transaction('rw', db.orders, async () => {
      const fresh = await db.orders.get(orderId)
      if (!fresh) return
      await db.orders.put({
        ...fresh,
        mailed: { ...fresh.mailed, [status]: now },
        statusHistory: [...fresh.statusHistory, { status: fresh.status, at: now, note: `📧 Kupcu poslat mejl: ${MAIL_LABEL[status]}` }],
        updatedAt: now,
      })
    })
  } catch (e) {
    console.warn('Mejl kupcu nije poslat', e)
  }
}
