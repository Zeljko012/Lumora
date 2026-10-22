import { db } from '../db'
import { normalizePhone } from './orders'
import { fixCase } from './siteOrderCodec'
import type { Contact } from '../types'

export interface ContactInput {
  name?: string
  email?: string
  phone?: string
  city?: string
  /** odakle je stigao: sajt, newsletter, instagram, viber, rucno… */
  source: string
  /** true = pristao na obaveštenja. Ovim se pristanak samo uključuje, nikad ne gasi. */
  marketing?: boolean | null
  at?: number
}

const clean = (s?: string) => fixCase((s ?? '').trim())
export const emailOk = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)

/** "0641234567" → "+381641234567" (oblik za Viber) */
export function viberNumber(phoneNorm: string): string {
  const d = phoneNorm.replace(/\D/g, '')
  return d.startsWith('0') ? `+381${d.slice(1)}` : d ? `+${d}` : ''
}

/**
 * Dodaje ili dopunjuje kontakt. Spaja se po mejlu, a ako ga nema, po broju telefona.
 * Prazna polja se ne brišu, a dat pristanak se nikad ne povlači automatski.
 */
export async function upsertContact(input: ContactInput): Promise<Contact | null> {
  const email = clean(input.email).toLowerCase()
  const validEmail = emailOk(email) ? email : ''
  const phoneNorm = normalizePhone(clean(input.phone))
  if (!validEmail && phoneNorm.length < 6) return null
  const now = input.at ?? Date.now()

  return db.transaction('rw', db.contacts, async () => {
    const all = (await db.contacts.toArray()).filter((c) => !c.deletedAt)
    const byEmail = validEmail ? all.find((c) => c.email === validEmail) : undefined
    const byPhone = phoneNorm ? all.find((c) => c.phoneNorm === phoneNorm && c.id !== byEmail?.id) : undefined

    let target = byEmail ?? byPhone
    let merged: Contact
    if (!target) {
      const key = validEmail || `tel:${phoneNorm}`
      merged = {
        // isti kontakt na dva uređaja dobija isti id, pa se pri sinhronizaciji ne udvostručuje
        id: `c:${key}`,
        key,
        name: clean(input.name),
        email: validEmail,
        phone: clean(input.phone) || phoneNorm,
        phoneNorm,
        city: clean(input.city),
        sources: [input.source],
        marketing: input.marketing === true ? true : null,
        note: '',
        createdAt: now,
        updatedAt: Date.now(),
      }
      await db.contacts.put(merged)
      return merged
    }

    // isti kupac zapisan dvaput (jednom po mejlu, jednom samo po broju): spoji u jedan
    if (byEmail && byPhone) {
      target = byEmail
      byPhone.sources.forEach((s) => !target!.sources.includes(s) && target!.sources.push(s))
      if (byPhone.marketing === true) target.marketing = true
      if (!target.name) target.name = byPhone.name
      if (!target.city) target.city = byPhone.city
      await db.contacts.delete(byPhone.id)
    }

    const t = target
    const email2 = t.email || validEmail
    merged = {
      ...t,
      name: clean(input.name) || t.name,
      email: email2,
      phone: t.phoneNorm ? t.phone : clean(input.phone) || phoneNorm,
      phoneNorm: t.phoneNorm || phoneNorm,
      city: clean(input.city) || t.city,
      key: email2 || t.key,
      sources: t.sources.includes(input.source) ? t.sources : [...t.sources, input.source],
      marketing: input.marketing === true ? true : t.marketing,
      updatedAt: t.updatedAt,
    }
    // ništa novo: ne diraj zapis (inače bi se svaka provera "menjala" i bez kraja slala između uređaja)
    if (JSON.stringify(merged) === JSON.stringify(t)) return t
    merged.updatedAt = Date.now()
    await db.contacts.put(merged)
    return merged
  })
}

/** Jednokratno: prebacuje kupce iz postojećih porudžbina u listu kontakata. */
export async function syncContactsFromOrders(): Promise<number> {
  const orders = await db.orders.toArray()
  let n = 0
  for (const o of orders) {
    if (o.deletedAt || o.demo) continue
    const c = await upsertContact({
      name: o.customer.name,
      email: o.customer.email,
      phone: o.customer.phone,
      city: o.customer.city,
      source: o.source,
      at: o.createdAt,
    })
    if (c) n++
  }
  return n
}

export async function ensureContactsBackfilled() {
  const FLAG = 'lumora.contactsBackfilled'
  try {
    if (localStorage.getItem(FLAG)) return
    await syncContactsFromOrders()
    localStorage.setItem(FLAG, '1')
  } catch {
    /* pokušaće se opet sledeći put */
  }
}

export interface ContactFilter {
  kind: 'svi' | 'mejl' | 'telefon'
  consentOnly: boolean
  q: string
}

export function filterContacts(list: Contact[], f: ContactFilter): Contact[] {
  const q = f.q.trim().toLowerCase()
  const qDigits = q.replace(/\D/g, '')
  return list.filter((c) => {
    if (c.deletedAt) return false
    if (f.kind === 'mejl' && !c.email) return false
    if (f.kind === 'telefon' && c.email) return false
    if (f.consentOnly && c.marketing !== true) return false
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (qDigits.length >= 3 && c.phoneNorm.includes(qDigits))
    )
  })
}

/** Mejlovi za kampanju: samo kontakti koji su pristali (osim ako je izričito traženo drugačije). */
export const campaignEmails = (list: Contact[], consentOnly = true) =>
  list.filter((c) => !c.deletedAt && c.email && c.marketing !== false && (!consentOnly || c.marketing === true)).map((c) => c.email)

/** Brojevi za Viber: kontakti BEZ mejla (ostali dobijaju mejl). */
export const campaignViber = (list: Contact[], consentOnly = true) =>
  list
    .filter((c) => !c.deletedAt && !c.email && c.phoneNorm && c.marketing !== false && (!consentOnly || c.marketing === true))
    .map((c) => ({ name: c.name, number: viberNumber(c.phoneNorm) }))

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`

export function contactsCsv(list: Contact[]): string {
  const head = ['Ime', 'Mejl', 'Telefon', 'Grad', 'Pristanak', 'Izvor']
  const rows = list
    .filter((c) => !c.deletedAt)
    .map((c) => [
      c.name,
      c.email,
      c.phoneNorm ? viberNumber(c.phoneNorm) : '',
      c.city,
      c.marketing === true ? 'da' : c.marketing === false ? 'odjavljen' : 'nije se izjasnio',
      c.sources.join(', '),
    ])
  return '﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}

export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
