import { db } from '../db'
import type { Expense, Order, Product, Settings } from '../types'
import { codAmount, itemLabel, orderTotal, PAYER_LABEL, PAYMENT_LABEL, payerOf, sourceLabel, statusLabel } from './orders'
import { dateTime } from './format'

interface Backup {
  app: 'porudzbine'
  version: 1
  exportedAt: string
  settings: Settings[]
  products: Product[]
  orders: Order[]
  expenses?: Expense[]
}

const stamp = () => new Date().toISOString().slice(0, 10)

/** Snima fajl; na telefonu nudi "Podeli" (Drive, Viber, mejl...), inače preuzimanje. */
export async function saveFile(name: string, data: BlobPart, type: string) {
  const blob = new Blob([data], { type })
  const file = new File([blob], name, { type })
  if (navigator.canShare?.({ files: [file] }) && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
    try {
      await navigator.share({ files: [file], title: name })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function exportJson() {
  const data: Backup = {
    app: 'porudzbine',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: await db.settings.toArray(),
    products: await db.products.toArray(),
    orders: await db.orders.toArray(),
    expenses: await db.expenses.toArray(),
  }
  await saveFile(`lumora-admin-backup-${stamp()}.json`, JSON.stringify(data, null, 1), 'application/json')
  try {
    localStorage.setItem('lumora.lastBackup', String(Date.now()))
  } catch {
    /* nije bitno */
  }
}

/** Vraća podatke iz backup-a. Zapis se zamenjuje samo ako je u backup-u noviji. */
export async function importJson(text: string) {
  const data = JSON.parse(text) as Backup
  if (data.app !== 'porudzbine') throw new Error('Ovo nije backup ove aplikacije.')
  let count = 0
  await db.transaction('rw', [db.settings, db.products, db.orders, db.expenses], async () => {
    for (const [table, rows] of [
      [db.settings, data.settings],
      [db.products, data.products],
      [db.orders, data.orders],
      [db.expenses, data.expenses],
    ] as const) {
      for (const row of rows ?? []) {
        const t = table as any
        const cur = await t.get(row.id)
        if (!cur || (row.updatedAt ?? 0) >= (cur.updatedAt ?? 0)) {
          await t.put(row)
          count++
        }
      }
    }
  })
  return count
}

// Excel u srpskom podešavanju očekuje ";" kao razdvajač i BOM da bi prikazao č/ć/š/ž
function toCsv(rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? '')
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + rows.map((r) => r.map(esc).join(';')).join('\r\n')
}

export async function exportOrdersCsv() {
  const settings = await db.settings.get('main')
  const courier = (id: string) => settings?.couriers.find((c) => c.id === id)?.name ?? id
  const orders = (await db.orders.orderBy('number').toArray()).filter((o) => !o.deletedAt)
  const rows: (string | number)[][] = [
    ['Broj', 'Datum', 'Status', 'Izvor', 'Ime i prezime', 'Telefon', 'Adresa', 'Grad', 'Poštanski broj', 'Stavke', 'Komada', 'Dostavu snosi', 'Popust', 'Ukupno', 'Otkupnina', 'Plaćanje', 'Kurir', 'Broj pošiljke', 'Napomena', 'Razlog povrata', 'Trošak povrata'],
  ]
  for (const o of orders) {
    rows.push([
      o.number,
      dateTime(o.createdAt),
      statusLabel(o.status),
      sourceLabel(o.source),
      o.customer.name,
      o.customer.phone,
      o.customer.address,
      o.customer.city,
      o.customer.zip,
      o.items.map((i) => `${itemLabel(i)} x${i.qty}`).join(', '),
      o.items.reduce((s, i) => s + i.qty, 0),
      PAYER_LABEL[payerOf(o)],
      o.discount,
      orderTotal(o),
      codAmount(o),
      PAYMENT_LABEL[o.paymentMethod],
      courier(o.courierId),
      o.tracking,
      o.note,
      o.returnInfo?.reason ?? '',
      o.returnInfo?.cost ?? '',
    ])
  }
  await saveFile(`porudzbine-${stamp()}.csv`, toCsv(rows), 'text/csv;charset=utf-8')
}

export async function exportProductsCsv() {
  const products = (await db.products.toArray()).filter((p) => !p.deletedAt)
  products.sort((a, b) => a.title.localeCompare(b.title, 'sr'))
  const rows: (string | number)[][] = [['Proizvod', 'Handle', 'SKU', 'Boja', 'Veličina', 'Cena', 'Zaliha', 'Aktivan']]
  for (const p of products)
    for (const v of p.variants) rows.push([p.title, p.handle, v.sku, v.color, v.size, v.price, v.stock, p.active ? 'da' : 'ne'])
  await saveFile(`katalog-${stamp()}.csv`, toCsv(rows), 'text/csv;charset=utf-8')
}
