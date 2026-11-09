import { db, getSettings } from '../db'
import { getClient } from './remote'
import type { Order, OrderStatus } from '../types'

/** Adresa sajta sa serverskom rutom. Aplikacija otvorena sa druge adrese (npr. GitHub Pages) zove sajt direktno. */
const LIVE_SITE = 'https://www.homedecorlumora.com'
function statusMailUrl(): string {
  const h = location.hostname
  const onSite = h.endsWith('homedecorlumora.com') || h.endsWith('.vercel.app')
  return onSite ? new URL('../api/status-mail', document.baseURI).href : `${LIVE_SITE}/api/status-mail`
}

/** Statusi za koje kupac dobija mejl (potvrdu porudžbine šalje sam sajt). */
export const MAIL_STATUSES: OrderStatus[] = ['spakovano', 'poslato', 'naplaceno']

const MAIL_LABEL: Partial<Record<OrderStatus, string>> = {
  spakovano: 'porudžbina spakovana',
  poslato: 'pošiljka na putu',
  naplaceno: 'zahvalnica za kupovinu',
}

/** Upiši u istoriju porudžbine zašto mejl nije otišao (inače vlasnik ne bi znao). */
async function logFailure(orderId: string, reason: string): Promise<void> {
  const now = Date.now()
  await db.transaction('rw', db.orders, async () => {
    const fresh = await db.orders.get(orderId)
    if (!fresh) return
    await db.orders.put({
      ...fresh,
      statusHistory: [...fresh.statusHistory, { status: fresh.status, at: now, note: `📧 Mejl kupcu nije poslat: ${reason}` }],
      updatedAt: now,
    })
  })
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
    if (o.mailed?.[status]) return
    if (!email) {
      await logFailure(orderId, 'kupac nema upisan mejl')
      return
    }

    const client = getClient()
    const token = client ? (await client.auth.getSession()).data.session?.access_token : undefined
    if (!token) {
      await logFailure(orderId, 'aplikacija nije prijavljena na sajt (Podešavanja → Veza sa sajtom)')
      return
    }

    const res = await fetch(statusMailUrl(), {
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
      const text = await res.text().catch(() => '')
      console.warn('Mejl kupcu nije poslat', status, res.status, text)
      let msg = ''
      try {
        msg = (JSON.parse(text) as { error?: string }).error || ''
      } catch {
        /* nije JSON */
      }
      await logFailure(orderId, `${msg || 'greška sajta'} (${res.status})`)
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
    await logFailure(orderId, 'nema veze sa sajtom').catch(() => {})
  }
}
