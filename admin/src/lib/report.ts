import { saveFile } from './backup'
import { sourceLabel, statusLabel, STATUSES } from './orders'
import { delta, type awaitingPayment, type courierStats, type customerStats, type expensesByCategory, type kpis, type orderStats, type productStats } from './stats'

export interface ReportSection {
  title: string
  head?: string[]
  rows: (string | number)[][]
}

interface Data {
  k: ReturnType<typeof kpis>
  kp: ReturnType<typeof kpis>
  wait: ReturnType<typeof awaitingPayment>
  o: ReturnType<typeof orderStats>
  p: ReturnType<typeof productStats>
  c: ReturnType<typeof customerStats>
  cr: ReturnType<typeof courierStats>
  ex: ReturnType<typeof expensesByCategory>
}

const n0 = (n: number) => Math.round(n)
const pc = (p: number | null) => (p == null ? '—' : `${p.toFixed(1)}%`)
const dd = (d: number | null) => (d == null ? '—' : d.toFixed(1))
const ch = (a: number, b: number) => {
  const d = delta(a, b)
  return d == null ? 'novo' : `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`
}

export function buildReportRows(period: string, d: Data, currency = 'RSD'): ReportSection[] {
  const { k, kp, wait, o, p, c, cr, ex } = d
  return [
    {
      title: `Finansije (${currency}) — ${period}`,
      head: ['Pokazatelj', 'Vrednost', 'Prethodni period', 'Promena'],
      rows: [
        ['Promet', n0(k.promet), n0(kp.promet), ch(k.promet, kp.promet)],
        ['Naplaćeno', n0(k.naplaceno), n0(kp.naplaceno), ch(k.naplaceno, kp.naplaceno)],
        ['Troškovi dostave', n0(k.dostava), n0(kp.dostava), ch(k.dostava, kp.dostava)],
        ['Troškovi povrata', n0(k.povrati), n0(kp.povrati), ch(k.povrati, kp.povrati)],
        ['Ostali troškovi', n0(k.ostali), n0(kp.ostali), ch(k.ostali, kp.ostali)],
        ['ČISTA ZARADA', n0(k.zarada), n0(kp.zarada), ch(k.zarada, kp.zarada)],
        ['Prosečna porudžbina', n0(k.prosek), n0(kp.prosek), ch(k.prosek, kp.prosek)],
        ['Čeka naplatu (trenutno)', n0(wait.amount), '', `${wait.count} pošiljaka`],
      ],
    },
    { title: 'Ostali troškovi po kategorijama', head: ['Kategorija', 'Iznos'], rows: ex.map((e) => [e.category, n0(e.amount)]) },
    {
      title: 'Porudžbine',
      head: ['Pokazatelj', 'Vrednost'],
      rows: [
        ['Broj porudžbina', k.brojPorudzbina],
        ['Komada', k.komada],
        ['Stopa povrata', pc(o.returnRate)],
        ['Stopa otkazivanja', pc(o.cancelRate)],
        ['Prosečno dana do slanja', dd(o.avgToSend)],
        ['Prosečno dana od slanja do naplate', dd(o.avgToPaid)],
        ...STATUSES.map((s) => [`Status: ${statusLabel(s.id)}`, o.byStatus.get(s.id) ?? 0] as (string | number)[]),
      ],
    },
    { title: o.byMonth ? 'Porudžbine po mesecu' : 'Porudžbine po danu', head: ['Dan', 'Broj'], rows: o.timeline.map((t) => [t.label, t.value]) },
    { title: 'Izvor porudžbine', head: ['Izvor', 'Broj', 'Promet'], rows: o.sources.map((s) => [sourceLabel(s.source), s.count, n0(s.revenue)]) },
    { title: 'Najprodavaniji proizvodi', head: ['Proizvod', 'Komada', 'Promet'], rows: p.products.map((r) => [r.label, r.pcs, n0(r.revenue)]) },
    { title: 'Boje', head: ['Boja', 'Komada', 'Promet'], rows: p.colors.map((r) => [r.label, r.pcs, n0(r.revenue)]) },
    ...(p.sizes.length ? [{ title: 'Veličine', head: ['Veličina', 'Komada', 'Promet'], rows: p.sizes.map((r) => [r.label, r.pcs, n0(r.revenue)]) }] : []),
    { title: 'Povrati po proizvodu', head: ['Proizvod', 'Komada'], rows: p.returns.map((r) => [r.label, r.pcs]) },
    { title: 'Kupci', head: ['Pokazatelj', 'Vrednost'], rows: [['Novi kupci', c.fresh], ['Povratni kupci', c.returning]] },
    { title: 'Najbolji kupci', head: ['Kupac', 'Grad', 'Porudžbina', 'Potrošio'], rows: c.best.map((b) => [b.name, b.city, b.orders, n0(b.spent)]) },
    { title: 'Gradovi', head: ['Grad', 'Porudžbina', 'Povrata', 'Promet'], rows: c.citiesByOrders.map((x) => [x.city, x.orders, x.returned, n0(x.revenue)]) },
    {
      title: 'Kuriri',
      head: ['Kurir', 'Pošiljaka', 'Otkupnina', 'Dostava', 'Povrati', 'Stopa povrata'],
      rows: cr.map((x) => [x.name, x.shipped, n0(x.cod), n0(x.shippingCost), n0(x.returnCost), pc(x.returnRate)]),
    },
  ]
}

export async function exportReportCsv(sections: ReportSection[]) {
  const esc = (v: string | number) => {
    const s = String(v ?? '')
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines: string[] = []
  for (const s of sections) {
    lines.push(esc(s.title))
    if (s.head) lines.push(s.head.map(esc).join(';'))
    for (const r of s.rows) lines.push(r.map(esc).join(';'))
    lines.push('')
  }
  await saveFile(`izvestaj-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8')
}
