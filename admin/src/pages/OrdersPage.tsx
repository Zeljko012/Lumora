import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import { Icon } from '../components/Icon'
import { TopBar, useUi } from '../components/ui'
import { OrderCard } from '../components/OrderBits'
import { StatusPicker } from '../components/StatusSheets'
import { PrintSheet } from '../components/PrintSheet'
import { changeStatus, lowStockVariants, normalizePhone, STATUSES, statusLabel, unpaidOverdue } from '../lib/orders'
import { fold, plural } from '../lib/format'
import type { OrderStatus } from '../types'
import { Loading } from '../components/Guard'

type Tab = OrderStatus | 'sve'
const TAB_KEY = 'porudzbine.tab'

export default function OrdersPage() {
  const [search] = useSearchParams()
  const orders = useLiveQuery(() => db.orders.orderBy('createdAt').reverse().toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const products = useLiveQuery(() => db.products.toArray(), [])
  const [tab, setTabState] = useState<Tab>(() => {
    const fromUrl = search.get('tab') as Tab | null
    if (fromUrl && (fromUrl === 'sve' || STATUSES.some((s) => s.id === fromUrl))) return fromUrl
    try {
      return (sessionStorage.getItem(TAB_KEY) as Tab) || 'nova'
    } catch {
      return 'nova'
    }
  })
  const setTab = (t: Tab) => {
    setTabState(t)
    try {
      sessionStorage.setItem(TAB_KEY, t)
    } catch {
      /* nije bitno */
    }
  }
  const [q, setQ] = useState('')
  const { confirm, toast } = useUi()
  const [overdueOnly, setOverdueOnly] = useState(search.get('overdue') === '1')
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkPicker, setBulkPicker] = useState(false)
  const [printing, setPrinting] = useState(false)

  const live = useMemo(() => (orders ?? []).filter((o) => !o.deletedAt), [orders])

  const counts = useMemo(() => {
    const c: Record<string, number> = { sve: live.length }
    for (const o of live) c[o.status] = (c[o.status] ?? 0) + 1
    return c
  }, [live])

  const overdue = useMemo(() => {
    const m = new Map<string, number>()
    for (const o of live) {
      const d = unpaidOverdue(o, settings.unpaidAlertDays)
      if (d != null) m.set(o.id, d)
    }
    return m
  }, [live, settings.unpaidAlertDays])

  const filtered = useMemo(() => {
    if (overdueOnly) return live.filter((o) => overdue.has(o.id))
    const needle = fold(q.trim())
    const digits = normalizePhone(q).replace(/^0/, '')
    return live.filter((o) => {
      if (needle) {
        // pretraga ide kroz sve statuse
        const hay = fold([o.customer.name, o.customer.city, o.tracking, o.customer.address, String(o.number)].join(' '))
        const phoneHit = digits.length >= 3 && o.phoneNorm.includes(digits)
        return hay.includes(needle) || phoneHit
      }
      return tab === 'sve' || o.status === tab
    })
  }, [live, q, tab, overdueOnly, overdue])

  const courierName = (id: string) => settings.couriers.find((c) => c.id === id)?.name
  const lowStock = products ? lowStockVariants(products, settings.lowStockThreshold) : []
  const senderMissing = !settings.sender.name || !settings.sender.phone

  if (!orders) return <Loading />

  const toggleSel = (id: string) => {
    const n = new Set(selected)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    setSelected(n)
  }
  const stopSelecting = () => {
    setSelecting(false)
    setSelected(new Set())
  }
  const bulk = async (status: OrderStatus) => {
    setBulkPicker(false)
    const list = live.filter((o) => selected.has(o.id) && o.status !== status)
    if (!list.length) return stopSelecting()
    if (status === 'otkazano') {
      const ok = await confirm({ title: `Otkazati ${list.length} ${plural(list.length, 'porudžbinu', 'porudžbine', 'porudžbina')}?`, confirmText: 'Otkaži', danger: true })
      if (!ok) return
    }
    for (const o of list) await changeStatus(o, status)
    toast(`${list.length} → ${statusLabel(status)}`)
    stopSelecting()
  }

  return (
    <div className="page">
      <TopBar
        title="Porudžbine"
        sub={`${live.length} ${plural(live.length, 'porudžbina', 'porudžbine', 'porudžbina')} ukupno`}
        right={
          live.length > 0 && (
            <button className="btn small" onClick={() => (selecting ? stopSelecting() : setSelecting(true))}>
              {selecting ? 'Gotovo' : <><Icon name="select" /> Izaberi</>}
            </button>
          )
        }
      />

      {senderMissing && (
        <Link to="/podesavanja" className="notice blue" style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="info" />
          <span className="grow">
            <b>Unesi svoje podatke pošiljaoca</b> — pojavljuju se na svakoj nalepnici.
          </span>
          <Icon name="chevron" />
        </Link>
      )}
      {lowStock.length > 0 && (
        <Link to="/katalog?zaliha=1" className="notice amber" style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="alert" />
          <span className="grow">
            <b>Niska zaliha:</b> {lowStock.length} {plural(lowStock.length, 'varijanta', 'varijante', 'varijanti')} ispod zadatog broja.
          </span>
          <Icon name="chevron" />
        </Link>
      )}

      {overdue.size > 0 && (
        <button type="button" className="notice amber" style={{ width: '100%', border: 0, textAlign: 'left', marginBottom: 10 }} onClick={() => setOverdueOnly(!overdueOnly)}>
          <Icon name="alert" />
          <span className="grow">
            <b>
              {overdue.size} {plural(overdue.size, 'pošiljka', 'pošiljke', 'pošiljaka')}
            </b>{' '}
            {overdue.size === 1 ? 'je poslata' : 'su poslate'} pre više od {settings.unpaidAlertDays} dana, a nije naplaćeno.
            {overdueOnly ? ' Prikaži sve.' : ' Prikaži.'}
          </span>
          <Icon name={overdueOnly ? 'close' : 'chevron'} />
        </button>
      )}

      <div className="input-wrap search">
        <span className="prefix-icon">
          <Icon name="search" />
        </span>
        <input
          className="input with-icon"
          type="search"
          placeholder="Ime, telefon, grad, broj pošiljke…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Pretraga porudžbina"
        />
      </div>

      {!q && !overdueOnly && (
        <div className="tabs" role="tablist">
          {STATUSES.map((s) => (
            <button key={s.id} role="tab" aria-selected={tab === s.id} className={`tab ${tab === s.id ? 'on' : ''}`} onClick={() => setTab(s.id)}>
              {s.label}
              <span className="count">{counts[s.id] ?? 0}</span>
            </button>
          ))}
          <button role="tab" aria-selected={tab === 'sve'} className={`tab ${tab === 'sve' ? 'on' : ''}`} onClick={() => setTab('sve')}>
            Sve
            <span className="count">{counts.sve}</span>
          </button>
        </div>
      )}
      {!q && !overdueOnly && tab === 'nova' && counts.nova > 0 && (
        <Link to="/pakovanje" className="btn brand block" style={{ marginBottom: 10 }}>
          <Icon name="clipboard" /> Počni pakovanje ({counts.nova})
        </Link>
      )}
      {!q && !overdueOnly && tab === 'spakovano' && counts.spakovano > 0 && (
        <Link to="/predaja" className="btn brand block" style={{ marginBottom: 10 }}>
          <Icon name="truck" /> Spisak za kurira ({counts.spakovano})
        </Link>
      )}
      {q && (
        <p className="small muted" style={{ margin: '0 4px 10px' }}>
          {filtered.length} {plural(filtered.length, 'rezultat', 'rezultata', 'rezultata')} u svim statusima
        </p>
      )}

      {filtered.length === 0 ? (
        live.length === 0 ? (
          <div className="empty">
            <Icon name="inbox" />
            <h2>Još nema porudžbina</h2>
            <p>Dodaj prvu porudžbinu — kupac, proizvodi, dostava.</p>
            <Link to="/nova" className="btn primary">
              <Icon name="plus" /> Nova porudžbina
            </Link>
          </div>
        ) : (
          <div className="empty">
            <Icon name="search" />
            <h2>{q ? 'Ništa nije pronađeno' : 'Nema porudžbina u ovom statusu'}</h2>
          </div>
        )
      ) : (
        filtered.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            courierName={courierName(o.courierId)}
            overdueDays={overdue.get(o.id)}
            selecting={selecting}
            selected={selected.has(o.id)}
            onToggle={() => toggleSel(o.id)}
          />
        ))
      )}

      {selecting && (
        <div className="bulk-bar">
          <span className="count">
            {selected.size ? `Izabrano: ${selected.size}` : 'Dodirni porudžbine'}
            {filtered.length > 0 && (
              <>
                {' · '}
                <button className="link-btn" style={{ color: '#fff' }} onClick={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((o) => o.id)))}>
                  {selected.size === filtered.length ? 'ništa' : 'sve'}
                </button>
              </>
            )}
          </span>
          <button className="btn small ghost" disabled={!selected.size} onClick={() => setPrinting(true)} aria-label="Štampaj izabrane">
            <Icon name="printer" />
          </button>
          <button className="btn small ghost" disabled={!selected.size} onClick={() => setBulkPicker(true)}>
            Status…
          </button>
          <button className="btn small" disabled={!selected.size} onClick={() => bulk('poslato')}>
            <Icon name="truck" /> Poslato
          </button>
        </div>
      )}
      {printing && <PrintSheet orders={live.filter((o) => selected.has(o.id))} onClose={() => setPrinting(false)} />}
      {bulkPicker && <StatusPicker title={`Označi ${selected.size} kao…`} exclude={['vraceno']} onPick={bulk} onClose={() => setBulkPicker(false)} />}
    </div>
  )
}
