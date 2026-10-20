// Pravljenje PDF-a: adresnice (A6 i A4 4 po strani), liste za pakovanje i spisak predaje kuriru.
// Učitava se tek kad zatreba (dinamički import), da početni ekran ostane brz.
import { jsPDF } from 'jspdf'
import type { LabelFormat, Order, Settings } from '../types'
import { codAmount, payerOf } from './orders'
import { dateShort, dateTime } from './format'

const FONT = 'DejaVu'
let fontCache: { normal: string; bold: string } | null = null

async function loadFont(file: string) {
  const res = await fetch(`${import.meta.env.BASE_URL}fonts/${file}`)
  if (!res.ok) throw new Error('Font za PDF nije učitan')
  const bytes = new Uint8Array(await res.arrayBuffer())
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

async function newDoc(format: 'a6' | 'a4') {
  fontCache ??= { normal: await loadFont('DejaVuSansCondensed.ttf'), bold: await loadFont('DejaVuSansCondensed-Bold.ttf') }
  const doc = new jsPDF({ unit: 'mm', format: format === 'a6' ? [100, 150] : 'a4', orientation: 'portrait', compress: true })
  doc.addFileToVFS('dv.ttf', fontCache.normal)
  doc.addFileToVFS('dv-b.ttf', fontCache.bold)
  doc.addFont('dv.ttf', FONT, 'normal')
  doc.addFont('dv-b.ttf', FONT, 'bold')
  doc.setFont(FONT, 'normal')
  doc.setLineHeightFactor(1.15)
  return doc
}

const rsd = (n: number) => `${new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 0 }).format(Math.round(n))} RSD`
const PT = 0.3528 // 1 pt u mm

/** Piše tekst sa prelamanjem u zadatoj širini; vraća novu y poziciju. */
function para(doc: jsPDF, text: string, x: number, y: number, w: number, size: number, opts: { bold?: boolean; maxLines?: number; align?: 'left' | 'right' | 'center' } = {}) {
  doc.setFont(FONT, opts.bold ? 'bold' : 'normal').setFontSize(size)
  let lines = doc.splitTextToSize(text || '', w) as string[]
  if (opts.maxLines && lines.length > opts.maxLines) {
    lines = lines.slice(0, opts.maxLines)
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*\S*$/, '') + '…'
  }
  const lh = size * PT * 1.18
  lines.forEach((l, i) => {
    const tx = opts.align === 'right' ? x + w : opts.align === 'center' ? x + w / 2 : x
    doc.text(l, tx, y + lh * (i + 1) - lh * 0.22, { align: opts.align ?? 'left' })
  })
  return y + lh * lines.length
}

function caption(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont(FONT, 'bold').setFontSize(6.5).setTextColor(90)
  doc.text(text.toUpperCase(), x, y + 2.2, { charSpace: 0.3 })
  doc.setTextColor(0)
  return y + 3.2
}

function rule(doc: jsPDF, x: number, y: number, w: number, weight = 0.3) {
  doc.setLineWidth(weight).setDrawColor(0)
  doc.line(x, y, x + w, y)
}

/* ------------------------------------------------------------------ */
/* Adresnica                                                           */
/* ------------------------------------------------------------------ */

function drawLabel(doc: jsPDF, o: Order, s: Settings, x: number, y: number, w: number, h: number) {
  const pad = 4
  const cx = x + pad
  const cw = w - pad * 2
  const bottom = y + h - pad
  const courier = s.couriers.find((c) => c.id === o.courierId)?.name ?? ''
  const snd = s.sender
  const c = o.customer
  let cy = y + pad

  // zaglavlje: kurir i broj porudžbine
  doc.setFont(FONT, 'bold').setFontSize(11)
  doc.text(courier.toUpperCase(), cx, cy + 4)
  doc.text(`#${o.number}`, cx + cw, cy + 4, { align: 'right' })
  cy += 6.5
  rule(doc, cx, cy, cw, 0.6)
  cy += 1.5

  // pošiljalac
  cy = caption(doc, 'Pošiljalac', cx, cy)
  cy = para(doc, snd.name || '—', cx, cy, cw, 9, { bold: true, maxLines: 1 })
  const sndLines = [
    snd.address,
    [snd.zip, snd.city].filter(Boolean).join(' '),
    [snd.phone && `Tel: ${snd.phone}`, snd.pib && `PIB: ${snd.pib}`].filter(Boolean).join('   '),
  ].filter(Boolean)
  for (const l of sndLines) cy = para(doc, l, cx, cy, cw, 8.5, { maxLines: 1 })
  cy += 1.5
  rule(doc, cx, cy, cw)
  cy += 1.5

  // primalac
  cy = caption(doc, 'Primalac', cx, cy)
  cy = para(doc, c.name, cx, cy, cw, 14, { bold: true, maxLines: 2 })
  cy = para(doc, c.address, cx, cy + 0.5, cw, 11, { maxLines: 2 })
  cy = para(doc, [c.zip, c.city.toUpperCase()].filter(Boolean).join('  '), cx, cy + 0.5, cw, 13, { bold: true, maxLines: 1 })
  cy = para(doc, `Tel: ${c.phone}`, cx, cy + 0.5, cw, 12, { bold: true, maxLines: 1 })
  cy += 2

  // otkupnina
  const cod = codAmount(o)
  const boxH = cod > 0 && snd.account ? 19 : 15
  doc.setLineWidth(0.6).rect(cx, cy, cw, boxH)
  if (cod > 0) {
    doc.setFont(FONT, 'bold').setFontSize(8)
    doc.text('OTKUPNINA', cx + 2.5, cy + 5)
    doc.setFontSize(20)
    doc.text(rsd(cod), cx + cw - 2.5, cy + 10.8, { align: 'right' })
    if (snd.account) {
      doc.setFont(FONT, 'normal').setFontSize(7.5)
      doc.text(`Uplata otkupnine na račun: ${snd.account}`, cx + 2.5, cy + 16.6)
    }
  } else {
    doc.setFont(FONT, 'bold').setFontSize(14)
    doc.text('BEZ OTKUPNINE', cx + cw / 2, cy + 7.5, { align: 'center' })
    doc.setFont(FONT, 'normal').setFontSize(8)
    doc.text('plaćeno unapred', cx + cw / 2, cy + 11.5, { align: 'center' })
  }
  cy += boxH + 1.5
  cy = para(doc, `Poštarinu plaća: ${payerOf(o) === 'primalac' ? 'PRIMALAC' : 'POŠILJALAC'}`, cx, cy, cw, 10, { bold: true })
  cy += 1.5
  rule(doc, cx, cy, cw)
  cy += 1.5

  // napomena (rezerviše mesto na dnu)
  const footerH = 4
  let noteH = 0
  let noteLines: string[] = []
  if (o.note.trim()) {
    doc.setFont(FONT, 'normal').setFontSize(9)
    noteLines = (doc.splitTextToSize(o.note.trim(), cw - 4) as string[]).slice(0, 4)
    noteH = noteLines.length * 9 * PT * 1.18 + 6
  }

  // sadržaj
  cy = caption(doc, 'Sadržaj', cx, cy)
  const limit = bottom - footerH - noteH - 1
  const lh = 9 * PT * 1.18
  const lines = o.items.map((i) => `${i.qty}× ${i.title}${[i.color, i.size].filter(Boolean).length ? ` – ${[i.color, i.size].filter(Boolean).join(', ')}` : ''}`)
  const fit = Math.max(1, Math.floor((limit - cy) / lh))
  const shown = lines.length > fit ? [...lines.slice(0, fit - 1), `+ još ${lines.length - fit + 1} stavki`] : lines
  for (const l of shown) cy = para(doc, l, cx, cy, cw, 9, { maxLines: 1 })

  // napomena
  if (noteH) {
    const ny = bottom - footerH - noteH
    doc.setLineWidth(0.3).setLineDashPattern([1, 0.8], 0).rect(cx, ny, cw, noteH - 1)
    doc.setLineDashPattern([], 0)
    caption(doc, 'Napomena', cx + 2, ny + 0.6)
    doc.setFont(FONT, 'normal').setFontSize(9)
    noteLines.forEach((l, i) => doc.text(l, cx + 2, ny + 6.3 + i * 9 * PT * 1.18))
  }

  // podnožje
  doc.setFont(FONT, 'normal').setFontSize(7).setTextColor(90)
  doc.text(dateShort(o.createdAt), cx, bottom)
  if (o.tracking) doc.text(o.tracking, cx + cw, bottom, { align: 'right' })
  doc.setTextColor(0)
}

/* ------------------------------------------------------------------ */
/* Lista za pakovanje                                                  */
/* ------------------------------------------------------------------ */

function drawPackingList(doc: jsPDF, o: Order, x: number, y: number, w: number, h: number) {
  const big = w > 150
  const pad = big ? 14 : 5
  const cx = x + pad
  const cw = w - pad * 2
  const bottom = y + h - pad
  let cy = y + pad

  doc.setFont(FONT, 'bold').setFontSize(big ? 18 : 13)
  doc.text('LISTA ZA PAKOVANJE', cx, cy + (big ? 6 : 4.5))
  doc.text(`#${o.number}`, cx + cw, cy + (big ? 6 : 4.5), { align: 'right' })
  cy += big ? 10 : 7
  cy = para(doc, `${o.customer.name} · ${o.customer.city} · ${dateTime(o.createdAt)}`, cx, cy, cw, big ? 11 : 9)
  cy += 2
  rule(doc, cx, cy, cw, 0.6)
  cy += 2

  const size = big ? 12 : 10
  const rowH = big ? 10 : 8
  const box = big ? 5 : 4
  for (let idx = 0; idx < o.items.length; idx++) {
    const i = o.items[idx]
    if (cy + rowH > bottom - (big ? 30 : 18)) {
      para(doc, `+ još ${o.items.length - idx} stavki (vidi aplikaciju)`, cx, cy, cw, size - 1)
      break
    }
    doc.setLineWidth(0.4).rect(cx, cy + (rowH - box) / 2, box, box)
    doc.setFont(FONT, 'bold').setFontSize(size + 2)
    doc.text(`${i.qty}×`, cx + box + 3, cy + rowH / 2 + size * PT * 0.35)
    const tx = cx + box + (big ? 16 : 13)
    doc.setFont(FONT, 'bold').setFontSize(size)
    const opts = [i.color, i.size].filter(Boolean).join(', ')
    const title = (doc.splitTextToSize(i.title, cw - (tx - cx) - (big ? 40 : 28)) as string[])[0]
    doc.text(title, tx, cy + rowH / 2 + size * PT * 0.35)
    doc.setFont(FONT, 'normal')
    doc.text(opts, cx + cw, cy + rowH / 2 + size * PT * 0.35, { align: 'right' })
    cy += rowH
    doc.setLineWidth(0.15).setDrawColor(160).line(cx, cy, cx + cw, cy)
    doc.setDrawColor(0)
  }

  cy += 3
  const pcs = o.items.reduce((s, i) => s + i.qty, 0)
  cy = para(doc, `Ukupno komada: ${pcs}`, cx, cy, cw, size, { bold: true })
  if (o.note.trim()) {
    cy += 2
    cy = caption(doc, 'Napomena', cx, cy)
    cy = para(doc, o.note.trim(), cx, cy, cw, size - 1, { maxLines: 4 })
  }
  doc.setFont(FONT, 'normal').setFontSize(big ? 10 : 8)
  doc.text('Spakovao: ____________________', cx, bottom)
}

/* ------------------------------------------------------------------ */
/* Javne funkcije                                                      */
/* ------------------------------------------------------------------ */

export type PrintWhat = 'labels' | 'packing' | 'both'

export async function buildOrdersPdf(orders: Order[], s: Settings, opts: { what: PrintWhat; format: LabelFormat; startAt?: number }) {
  const a4 = opts.format === 'a4x4'
  const doc = await newDoc(a4 ? 'a4' : 'a6')
  let first = true
  const addPage = () => {
    if (!first) doc.addPage(a4 ? 'a4' : [100, 150], 'portrait')
    first = false
  }

  if (opts.what !== 'packing') {
    if (a4) {
      // 4 nalepnice po A4 strani (2 × 2, svaka 105 × 148,5 mm); može se početi od 2., 3. ili 4. mesta
      const W = 105
      const H = 148.5
      let slot = Math.min(3, Math.max(0, (opts.startAt ?? 1) - 1))
      addPage()
      cutLines(doc)
      for (const o of orders) {
        if (slot === 4) {
          addPage()
          cutLines(doc)
          slot = 0
        }
        drawLabel(doc, o, s, (slot % 2) * W, Math.floor(slot / 2) * H, W, H)
        slot++
      }
    } else {
      for (const o of orders) {
        addPage()
        drawLabel(doc, o, s, 0, 0, 100, 150)
      }
    }
  }

  if (opts.what !== 'labels') {
    for (const o of orders) {
      addPage()
      if (a4) drawPackingList(doc, o, 0, 0, 210, 297)
      else drawPackingList(doc, o, 0, 0, 100, 150)
    }
  }
  return doc.output('blob')
}

function cutLines(doc: jsPDF) {
  doc.setLineWidth(0.15).setDrawColor(170).setLineDashPattern([2, 2], 0)
  doc.line(105, 0, 105, 297)
  doc.line(0, 148.5, 210, 148.5)
  doc.setLineDashPattern([], 0).setDrawColor(0)
}

/** Dnevni spisak predaje kuriru (A4). */
export async function buildHandoverPdf(orders: Order[], s: Settings, courierName: string, day: Date) {
  const doc = await newDoc('a4')
  const M = 12
  const W = 210 - M * 2
  const cols = [
    { t: 'R.br.', w: 10 },
    { t: 'Br.', w: 13 },
    { t: 'Primalac', w: 44 },
    { t: 'Mesto', w: 30 },
    { t: 'Telefon', w: 26 },
    { t: 'Broj pošiljke', w: 35 },
    { t: 'Otkupnina', w: 28, right: true },
  ]
  const rowH = 7.5
  let y = M

  const header = (first: boolean) => {
    if (first) {
      doc.setFont(FONT, 'bold').setFontSize(16)
      doc.text('SPISAK PREDAJE KURIRU', M, y + 6)
      doc.setFontSize(12)
      doc.text(`${courierName} · ${dateShort(day.getTime())}`, M + W, y + 6, { align: 'right' })
      y += 10
      doc.setFont(FONT, 'normal').setFontSize(9)
      const snd = s.sender
      doc.text(`Pošiljalac: ${[snd.name, snd.address, [snd.zip, snd.city].filter(Boolean).join(' '), snd.phone, snd.pib && `PIB ${snd.pib}`].filter(Boolean).join(', ')}`, M, y + 3)
      y += 5
      if (snd.account) {
        doc.setFont(FONT, 'bold')
        doc.text(`Otkupninu uplatiti na račun: ${snd.account}`, M, y + 3)
        y += 5
      }
      y += 2
    }
    doc.setFillColor(235, 235, 235).rect(M, y, W, rowH, 'F')
    doc.setFont(FONT, 'bold').setFontSize(8.5)
    let x = M
    for (const c of cols) {
      doc.text(c.t, c.right ? x + c.w - 1.5 : x + 1.5, y + 5, { align: c.right ? 'right' : 'left' })
      x += c.w
    }
    y += rowH
  }

  header(true)
  let sum = 0
  orders.forEach((o, idx) => {
    if (y + rowH > 297 - M - 30) {
      doc.addPage('a4', 'portrait')
      y = M
      header(false)
    }
    const cod = codAmount(o)
    sum += cod
    const vals = [String(idx + 1), String(o.number), o.customer.name, o.customer.city, o.customer.phone, o.tracking || '', cod ? rsd(cod) : 'uplaćeno']
    doc.setFont(FONT, 'normal').setFontSize(9)
    let x = M
    cols.forEach((c, i) => {
      const txt = (doc.splitTextToSize(vals[i], c.w - 3) as string[])[0] ?? ''
      if (i === 6) doc.setFont(FONT, 'bold')
      doc.text(txt, c.right ? x + c.w - 1.5 : x + 1.5, y + 5, { align: c.right ? 'right' : 'left' })
      x += c.w
    })
    y += rowH
    doc.setLineWidth(0.15).setDrawColor(180).line(M, y, M + W, y)
    doc.setDrawColor(0)
  })

  y += 2
  doc.setLineWidth(0.5).line(M, y, M + W, y)
  doc.setFont(FONT, 'bold').setFontSize(11)
  doc.text(`Ukupno pošiljaka: ${orders.length}`, M, y + 6)
  doc.text(`Ukupna otkupnina: ${rsd(sum)}`, M + W, y + 6, { align: 'right' })
  y += 22
  doc.setFont(FONT, 'normal').setFontSize(10)
  doc.text('Predao: ______________________', M, y)
  doc.text('Preuzeo (kurir): ______________________', M + W, y, { align: 'right' })

  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFontSize(8).setTextColor(120)
    doc.text(`strana ${p} / ${pages}`, M + W, 297 - 6, { align: 'right' })
    doc.setTextColor(0)
  }
  return doc.output('blob')
}


/** Izveštaj statistike (A4): tabele po oblastima. */
export async function buildReportPdf(period: string, sections: { title: string; head?: string[]; rows: (string | number)[][] }[]) {
  const doc = await newDoc('a4')
  const M = 14
  const W = 210 - M * 2
  const bottom = 297 - M
  const rowH = 6.2
  const nf = new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 0 })
  let y = M

  doc.setFont(FONT, 'bold').setFontSize(18)
  doc.text('Izveštaj', M, y + 6)
  doc.setFontSize(12)
  doc.text(period, M + W, y + 6, { align: 'right' })
  y += 9
  doc.setFont(FONT, 'normal').setFontSize(8.5).setTextColor(110)
  doc.text(`Napravljeno ${dateTime(Date.now())}`, M, y + 2)
  doc.setTextColor(0)
  y += 7

  for (const s of sections) {
    if (!s.rows.length) continue
    const cols = Math.max(s.head?.length ?? 0, ...s.rows.map((r) => r.length))
    const first = cols <= 2 ? W * 0.6 : W * 0.4
    const rest = (W - first) / Math.max(1, cols - 1)
    const widths = [first, ...Array(cols - 1).fill(rest)]
    const need = 9 + rowH * Math.min(3, s.rows.length + 1)
    if (y + need > bottom) {
      doc.addPage('a4', 'portrait')
      y = M
    }
    doc.setFont(FONT, 'bold').setFontSize(11)
    doc.text(s.title, M, y + 4.5)
    y += 7

    const drawRow = (cells: (string | number)[], head: boolean) => {
      if (y + rowH > bottom) {
        doc.addPage('a4', 'portrait')
        y = M
      }
      if (head) doc.setFillColor(238, 238, 238).rect(M, y, W, rowH, 'F')
      doc.setFont(FONT, head ? 'bold' : 'normal').setFontSize(8.5)
      let x = M
      cells.forEach((v, i) => {
        const isNum = typeof v === 'number'
        const txt = isNum ? nf.format(v) : String(v ?? '')
        const right = i > 0
        const fit = (doc.splitTextToSize(txt, widths[i] - 3) as string[])[0] ?? ''
        doc.text(fit, right ? x + widths[i] - 1.5 : x + 1.5, y + 4.3, { align: right ? 'right' : 'left' })
        x += widths[i]
      })
      y += rowH
      if (!head) {
        doc.setLineWidth(0.1).setDrawColor(210).line(M, y, M + W, y)
        doc.setDrawColor(0)
      }
    }
    if (s.head) drawRow(s.head, true)
    for (const r of s.rows.slice(0, 40)) drawRow(r, false)
    y += 6
  }

  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    doc.setFont(FONT, 'normal').setFontSize(8).setTextColor(120)
    doc.text(`strana ${p} / ${pages}`, M + W, 297 - 6, { align: 'right' })
    doc.setTextColor(0)
  }
  return doc.output('blob')
}
