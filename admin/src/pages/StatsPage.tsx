import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS, uid } from '../db'
import { Icon } from '../components/Icon'
import { NumberField, Sheet, TopBar, useUi } from '../components/ui'
import { BarsCard, days, Kpi, pct, RankList } from '../components/StatBits'
import { PdfReady } from '../components/PrintSheet'
import {
  awaitingPayment,
  courierStats,
  customerStats,
  delta,
  expensesByCategory,
  kpis,
  orderStats,
  PERIODS,
  periodRanges,
  productStats,
  type PeriodId,
  type Range,
} from '../lib/stats'
import { sourceLabel, statusLabel, STATUSES } from '../lib/orders'
import { dateShort, money, plural } from '../lib/format'
import { buildReportRows, exportReportCsv } from '../lib/report'
import type { Expense } from '../types'
import { Loading } from '../components/Guard'
import { Overview } from '../components/Overview'

type Tab = 'pregled' | 'finansije' | 'porudzbine' | 'proizvodi' | 'kupci' | 'kuriri'
const TABS: { id: Tab; label: string }[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'finansije', label: 'Finansije' },
  { id: 'porudzbine', label: 'Porudžbine' },
  { id: 'proizvodi', label: 'Proizvodi' },
  { id: 'kupci', label: 'Kupci' },
  { id: 'kuriri', label: 'Kuriri' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const toInput = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const fromInput = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

function load<T>(key: string, fallback: T): T {
  try {
    return (sessionStorage.getItem(key) as T) || fallback
  } catch {
    return fallback
  }
}
function store(key: string, v: string) {
  try {
    sessionStorage.setItem(key, v)
  } catch {
    /* nije bitno */
  }
}

export default function StatsPage() {
  const nav = useNavigate()
  const { toast } = useUi()
  const orders = useLiveQuery(() => db.orders.toArray(), [])
  const products = useLiveQuery(() => db.products.toArray(), [])
  const expenses = useLiveQuery(() => db.expenses.toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS

  const [period, setPeriodState] = useState<PeriodId>(() => load('stat.period', 'mesec'))
  const [tab, setTabState] = useState<Tab>(() => load('stat.tab', 'pregled'))
  const setPeriod = (p: PeriodId) => (setPeriodState(p), store('stat.period', p))
  const setTab = (t: Tab) => (setTabState(t), store('stat.tab', t))
  const [custom, setCustom] = useState<Range>(() => {
    const now = new Date()
    return { from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).getTime(), to: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() }
  })
  const [expenseSheet, setExpenseSheet] = useState<Expense | 'new' | null>(null)
  const [pdf, setPdf] = useState<{ blob: Blob; name: string } | null>(null)

  const { cur, prev, prevLabel } = useMemo(() => periodRanges(period, custom), [period, custom])
  const ready = orders && products && expenses

  const data = useMemo(() => {
    if (!ready) return null
    return {
      k: kpis(orders, expenses, cur, products),
      kp: kpis(orders, expenses, prev, products),
      wait: awaitingPayment(orders),
      o: orderStats(orders, cur),
      p: productStats(orders, products, cur),
      c: customerStats(orders, cur),
      cr: courierStats(orders, cur, settings.couriers),
      ex: expensesByCategory(expenses, cur),
    }
  }, [ready, orders, products, expenses, cur, prev, settings.couriers])

  if (!data) return <Loading />
  const { k, kp, wait, o, p, c, cr, ex } = data
  const periodLabel = period === 'opseg' ? `${dateShort(cur.from)} – ${dateShort(cur.to - 1)}` : PERIODS.find((x) => x.id === period)!.label
  const periodExpenses = (expenses ?? []).filter((e) => !e.deletedAt && e.date >= cur.from && e.date < cur.to).sort((a, b) => b.date - a.date)

  const exportCsv = () => exportReportCsv(buildReportRows(periodLabel, data, settings.currency))
  const exportPdf = async () => {
    try {
      const { buildReportPdf } = await import('../lib/pdf')
      const blob = await buildReportPdf(periodLabel, buildReportRows(periodLabel, data, settings.currency))
      setPdf({ blob, name: `izvestaj-${toInput(cur.from)}.pdf` })
    } catch (e) {
      toast((e as Error).message || 'PDF nije napravljen')
    }
  }

  return (
    <div className="page">
      <TopBar
        title="Analitika"
        sub={periodLabel}
        right={
          <>
            <button className="icon-btn" aria-label="Izvezi CSV za Excel" onClick={exportCsv}>
              <Icon name="download" />
            </button>
            <button className="icon-btn" aria-label="Izveštaj u PDF-u" onClick={exportPdf}>
              <Icon name="file" />
            </button>
          </>
        }
      />

      <div className="tabs" role="tablist" aria-label="Period">
        {PERIODS.map((x) => (
          <button key={x.id} role="tab" aria-selected={period === x.id} className={`tab ${period === x.id ? 'on' : ''}`} onClick={() => setPeriod(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      {period === 'opseg' && (
        <div className="grid-2" style={{ marginBottom: 12 }}>
          <label className="field">
            <span>Od</span>
            <input className="input" type="date" value={toInput(custom.from)} onChange={(e) => e.target.value && setCustom({ ...custom, from: fromInput(e.target.value) })} />
          </label>
          <label className="field">
            <span>Do (uključivo)</span>
            <input className="input" type="date" value={toInput(custom.to - 1)} onChange={(e) => e.target.value && setCustom({ ...custom, to: fromInput(e.target.value) + 86400000 })} />
          </label>
        </div>
      )}

      <div className="segmented stat-tabs" role="tablist" aria-label="Oblast">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="small muted" style={{ margin: '8px 4px 12px' }}>
        Poređenje: {prevLabel}
      </p>

      {/* ------------------------------ PREGLED ------------------------------ */}
      {tab === 'pregled' && orders && products && (
        <Overview orders={orders} products={products} cur={cur} prev={prev} k={k} kp={kp} o={o} p={p} c={c} settings={settings} onTab={setTab} />
      )}

      {/* ------------------------------ FINANSIJE ------------------------------ */}
      {tab === 'finansije' && (
        <>
          <div className="kpi-grid">
            <Kpi hero label="Čista zarada" value={money(k.zarada)} delta={delta(k.zarada, kp.zarada)} sub="naplaćeno − troškovi" />
            <Kpi label="Promet" value={money(k.promet)} delta={delta(k.promet, kp.promet)} sub={`${k.brojPorudzbina} por.`} />
            <Kpi label="Naplaćeno" value={money(k.naplaceno)} delta={delta(k.naplaceno, kp.naplaceno)} />
            <Kpi label="Čeka naplatu" value={money(wait.amount)} sub={`${wait.count} ${plural(wait.count, 'pošiljka', 'pošiljke', 'pošiljaka')} · sada`} />
            <Kpi label="Prosečna porudžbina" value={money(k.prosek)} delta={delta(k.prosek, kp.prosek)} />
            <Kpi label="Dostava (plaćaš ti)" value={money(k.dostava)} delta={delta(k.dostava, kp.dostava)} goodWhenUp={false} />
            <Kpi label="Povrati" value={money(k.povrati)} delta={delta(k.povrati, kp.povrati)} goodWhenUp={false} />
            <Kpi label="Ostali troškovi" value={money(k.ostali)} delta={delta(k.ostali, kp.ostali)} goodWhenUp={false} />
          </div>

          <div className="card totals mt">
            <div className="row">
              <span>Naplaćeno</span>
              <span>{money(k.naplaceno)}</span>
            </div>
            <div className="row">
              <span>− Dostava</span>
              <span>{money(k.dostava)}</span>
            </div>
            <div className="row">
              <span>− Povrati</span>
              <span>{money(k.povrati)}</span>
            </div>
            <div className="row">
              <span>− Ostali troškovi</span>
              <span>{money(k.ostali)}</span>
            </div>
            <div className="row big">
              <span>Čista zarada</span>
              <span style={{ color: k.zarada < 0 ? 'var(--red)' : undefined }}>{money(k.zarada)}</span>
            </div>
          </div>

          <div className="section">
            <div className="section-title">
              <span className="grow">Ostali troškovi</span>
              <button className="btn small" onClick={() => setExpenseSheet('new')}>
                <Icon name="plus" /> Dodaj
              </button>
            </div>
            {ex.length > 0 && (
              <RankList title="Po kategorijama" rows={ex.map((e) => ({ key: e.category, label: e.category, value: e.amount, display: money(e.amount) }))} />
            )}
            {periodExpenses.length === 0 ? (
              <p className="small muted" style={{ margin: '0 4px' }}>
                Nema unetih troškova u ovom periodu (materijal, ambalaža, reklame…).
              </p>
            ) : (
              <div className="list mt">
                {periodExpenses.map((e) => (
                  <button key={e.id} className="list-row" onClick={() => setExpenseSheet(e)}>
                    <div className="main">
                      <div className="title">{e.category}</div>
                      <div className="meta">
                        {dateShort(e.date)}
                        {e.note ? ` · ${e.note}` : ''}
                      </div>
                    </div>
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{money(e.amount)}</strong>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ------------------------------ PORUDŽBINE ------------------------------ */}
      {tab === 'porudzbine' && (
        <>
          <div className="kpi-grid">
            <Kpi label="Porudžbina" value={String(k.brojPorudzbina)} delta={delta(k.brojPorudzbina, kp.brojPorudzbina)} sub={`${k.komada} kom`} />
            <Kpi label="Stopa povrata" value={pct(o.returnRate)} sub={`${o.returned} od ${o.shipped} poslatih`} />
            <Kpi label="Do slanja" value={days(o.avgToSend)} sub="prosečno od porudžbine" />
            <Kpi label="Do naplate" value={days(o.avgToPaid)} sub="prosečno od slanja" />
            <Kpi label="Otkazano" value={pct(o.cancelRate)} sub={`${o.cancelled} od ${o.total}`} />
          </div>
          <div className="section">
            <BarsCard title={o.byMonth ? 'Porudžbine po mesecu' : 'Porudžbine po danu'} data={o.timeline} />
          </div>
          <div className="section">
            <BarsCard title="Po danu u nedelji" data={o.weekday} every={0} height={150} />
          </div>
          <div className="section">
            <BarsCard title="Po satu" data={o.hours} every={2} height={150} />
          </div>
          <div className="section">
            <RankList
              title="Izvor porudžbine"
              rows={o.sources.map((s) => ({ key: s.source, label: sourceLabel(s.source), value: s.revenue, display: money(s.revenue), extra: `${s.count} ${plural(s.count, 'porudžbina', 'porudžbine', 'porudžbina')}` }))}
            />
          </div>
          <div className="section">
            <div className="card">
              <div className="chart-title">
                <span>Po statusu</span>
                <span className="muted small">porudžbine iz perioda</span>
              </div>
              <div className="status-grid">
                {STATUSES.map((s) => (
                  <div key={s.id} className="status-cell" style={{ ['--c' as string]: `var(--st-${s.id})` }}>
                    <span className="dot" />
                    <span className="grow">{statusLabel(s.id)}</span>
                    <strong>{o.byStatus.get(s.id) ?? 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------ PROIZVODI ------------------------------ */}
      {tab === 'proizvodi' && (
        <>
          <RankList title="Najprodavaniji proizvodi" rows={p.products.map((r) => ({ key: r.key, label: r.label, value: r.pcs, display: `${r.pcs} kom`, extra: money(r.revenue) }))} limit={10} />
          <div className="section">
            <RankList title="Najprodavanije boje" rows={p.colors.map((r) => ({ key: r.key, label: r.label, value: r.pcs, display: `${r.pcs} kom`, extra: money(r.revenue) }))} />
          </div>
          {p.sizes.length > 0 && (
            <div className="section">
              <RankList title="Najprodavanije veličine" rows={p.sizes.map((r) => ({ key: r.key, label: r.label, value: r.pcs, display: `${r.pcs} kom`, extra: money(r.revenue) }))} />
            </div>
          )}
          <div className="section">
            <RankList title="Najviše povrata" empty="Nema povrata u ovom periodu." rows={p.returns.map((r) => ({ key: r.key, label: r.label, value: r.pcs, display: `${r.pcs} kom` }))} />
          </div>
          <div className="section">
            <div className="card">
              <div className="chart-title">
                <span>Zaliha i za koliko nestaje</span>
                <span className="muted small">po prodaji za 30 dana</span>
              </div>
              {p.stock.length === 0 ? (
                <p className="small muted" style={{ margin: '8px 0 0' }}>
                  Nema zalihe ni prodaje u poslednjih 30 dana.
                </p>
              ) : (
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Proizvod</th>
                      <th className="r">Zaliha</th>
                      <th className="r">Nestaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.stock.slice(0, 15).map((s) => (
                      <tr key={s.key}>
                        <td>
                          {s.label}
                          <span className="muted"> · {s.sub}</span>
                        </td>
                        <td className="r">{s.stock}</td>
                        <td className="r">
                          {s.days === 0 ? (
                            <span className="badge red">nema</span>
                          ) : s.days == null ? (
                            <span className="muted">ne prodaje se</span>
                          ) : s.days < 7 ? (
                            <span className="badge amber">{Math.round(s.days)} d</span>
                          ) : (
                            `${Math.round(s.days)} d`
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* ------------------------------ KUPCI ------------------------------ */}
      {tab === 'kupci' && (
        <>
          <div className="kpi-grid">
            <Kpi label="Novi kupci" value={String(c.fresh)} sub="prva porudžbina u periodu" />
            <Kpi label="Povratni kupci" value={String(c.returning)} sub={c.fresh + c.returning ? `${Math.round((c.returning / (c.fresh + c.returning)) * 100)}% kupaca` : undefined} />
          </div>
          <div className="section">
            <RankList
              title="Najbolji kupci"
              rows={c.best.map((b) => ({
                key: b.phone || b.name,
                label: b.name,
                sub: b.city,
                value: b.spent,
                display: money(b.spent),
                extra: `${b.orders} ${plural(b.orders, 'porudžbina', 'porudžbine', 'porudžbina')}${b.returned ? ` · vratio ${b.returned}` : ''}`,
                onClick: b.phone ? () => nav(`/kupac/${b.phone}`) : undefined,
              }))}
              limit={10}
            />
          </div>
          <div className="section">
            <RankList title="Top gradovi po porudžbinama" rows={c.citiesByOrders.map((x) => ({ key: x.city, label: x.city, value: x.orders, display: String(x.orders), extra: money(x.revenue) }))} />
          </div>
          <div className="section">
            <RankList title="Gradovi sa najviše povrata" empty="Nema povrata u ovom periodu." rows={c.citiesByReturns.map((x) => ({ key: x.city, label: x.city, value: x.returned, display: String(x.returned), extra: `od ${x.orders} porudžbina` }))} />
          </div>
        </>
      )}

      {/* ------------------------------ KURIRI ------------------------------ */}
      {tab === 'kuriri' && (
        <>
          {cr.length === 0 ? (
            <div className="empty">
              <Icon name="truck" />
              <h2>Nema poslatih pošiljaka</h2>
              <p>U ovom periodu ništa nije označeno kao „Poslato“.</p>
            </div>
          ) : (
            cr.map((x) => (
              <div className="card" key={x.id}>
                <div className="chart-title">
                  <span>{x.name}</span>
                  <span className="muted small">
                    {x.shipped} {plural(x.shipped, 'pošiljka', 'pošiljke', 'pošiljaka')}
                  </span>
                </div>
                <dl className="kv" style={{ margin: 0 }}>
                  <dt>Otkupnina poslatih</dt>
                  <dd>{money(x.cod)}</dd>
                  <dt>Troškovi dostave</dt>
                  <dd>{money(x.shippingCost)}</dd>
                  <dt>Troškovi povrata</dt>
                  <dd>{money(x.returnCost)}</dd>
                  <dt>Stopa povrata</dt>
                  <dd>
                    {pct(x.returnRate)} <span className="muted">({x.returned})</span>
                  </dd>
                </dl>
              </div>
            ))
          )}
        </>
      )}

      {expenseSheet && <ExpenseSheet expense={expenseSheet === 'new' ? null : expenseSheet} onClose={() => setExpenseSheet(null)} />}
      {pdf && <PdfReady blob={pdf.blob} name={pdf.name} onClose={() => setPdf(null)} />}
    </div>
  )
}

const CATEGORIES = ['Materijal', 'Ambalaža', 'Reklame', 'Alat i oprema', 'Struja', 'Ostalo']

function ExpenseSheet({ expense, onClose }: { expense: Expense | null; onClose: () => void }) {
  const { toast, confirm } = useUi()
  const [date, setDate] = useState(toInput(expense?.date ?? Date.now()))
  const [category, setCategory] = useState(expense?.category ?? 'Materijal')
  const [amount, setAmount] = useState<number | null>(expense?.amount ?? null)
  const [note, setNote] = useState(expense?.note ?? '')

  const save = async () => {
    if (!amount || amount <= 0) {
      toast('Upiši iznos')
      return
    }
    if (!category.trim()) {
      toast('Izaberi kategoriju')
      return
    }
    const now = Date.now()
    // trošak upisan "danas" dobija trenutno vreme, da odmah uđe u period "Danas"
    const d = fromInput(date)
    const ts = toInput(now) === date ? now : d + 12 * 3600000
    await db.expenses.put({ id: expense?.id ?? uid(), date: ts, category: category.trim(), amount, note: note.trim(), updatedAt: now })
    toast('Trošak je sačuvan')
    onClose()
  }
  const remove = async () => {
    if (!expense) return
    if (!(await confirm({ title: 'Obrisati trošak?', confirmText: 'Obriši', danger: true }))) return
    await db.expenses.put({ ...expense, deletedAt: Date.now(), updatedAt: Date.now() })
    onClose()
  }

  return (
    <Sheet
      title={expense ? 'Izmena troška' : 'Novi trošak'}
      onClose={onClose}
      footer={
        <div className="btn-row">
          {expense && (
            <button className="btn danger" style={{ flex: 'none' }} onClick={remove} aria-label="Obriši trošak">
              <Icon name="trash" />
            </button>
          )}
          <button className="btn primary" onClick={save}>
            <Icon name="check" /> Sačuvaj
          </button>
        </div>
      }
    >
      <div className="stack">
        <NumberField label="Iznos" suffix="din" value={amount} onChange={setAmount} autoFocus />
        <div className="field">
          <span>Kategorija</span>
          <div className="chips">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" className={`chip ${category === cat ? 'on' : ''}`} onClick={() => setCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
          <input className="input" placeholder="ili upiši svoju kategoriju…" value={CATEGORIES.includes(category) ? '' : category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <label className="field">
          <span>Datum</span>
          <input className="input" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Napomena</span>
          <input className="input" placeholder="npr. PLA filament 5 kg" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
    </Sheet>
  )
}
