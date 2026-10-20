import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import { Icon } from '../components/Icon'
import { Segmented, TopBar } from '../components/ui'
import { OrderCard } from '../components/OrderBits'
import { PrintSheet } from '../components/PrintSheet'
import { swatch } from '../lib/colors'
import { packProgress } from '../lib/orders'
import { plural } from '../lib/format'
import { Loading } from '../components/Guard'

type Range = 'sve' | 'danas'

interface Group {
  key: string
  title: string
  color: string
  size: string
  qty: number
  make: number
  orders: { id: string; number: number; name: string; qty: number }[]
}

export default function PackingPage() {
  const orders = useLiveQuery(() => db.orders.where('status').anyOf('nova', 'spakovano').toArray(), [])
  const products = useLiveQuery(() => db.products.toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const [range, setRange] = useState<Range>('sve')
  const [open, setOpen] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)

  const pending = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return (orders ?? [])
      .filter((o) => !o.deletedAt && (range === 'sve' || o.createdAt >= start.getTime()))
      .sort((a, b) => a.createdAt - b.createdAt)
  }, [orders, range])

  const toPack = pending.filter((o) => !packProgress(o).all)
  const ready = pending.filter((o) => packProgress(o).all)

  const groups = useMemo(() => {
    const stock = new Map<string, number>()
    for (const p of products ?? []) for (const v of p.variants) stock.set(v.id, v.stock)
    const m = new Map<string, Group>()
    for (const o of toPack)
      for (const i of o.items) {
        if (i.packed) continue
        const key = i.variantId ?? `${i.title}|${i.color}|${i.size}`
        const g = m.get(key) ?? { key, title: i.title, color: i.color, size: i.size, qty: 0, make: 0, orders: [] }
        g.qty += i.qty
        g.orders.push({ id: o.id, number: o.number, name: o.customer.name, qty: i.qty })
        m.set(key, g)
      }
    for (const g of m.values()) {
      const s = stock.get(g.key)
      if (s == null) continue
      // zaliha je već umanjena za porudžbine, pa minus znači koliko komada fali
      g.make = settings.deductStock ? Math.min(g.qty, Math.max(0, -s)) : Math.max(0, g.qty - s)
    }
    return [...m.values()].sort((a, b) => a.title.localeCompare(b.title, 'sr') || a.color.localeCompare(b.color, 'sr') || a.size.localeCompare(b.size, 'sr'))
  }, [toPack, products, settings.deductStock])

  if (!orders) return <Loading />
  const totalPcs = groups.reduce((s, g) => s + g.qty, 0)
  const totalMake = groups.reduce((s, g) => s + g.make, 0)

  return (
    <div className="page">
      <TopBar title="Pakovanje" sub={`${toPack.length} ${plural(toPack.length, 'porudžbina čeka', 'porudžbine čekaju', 'porudžbina čeka')} pakovanje`} />

      <div className="btn-row" style={{ marginBottom: 12 }}>
        <button className="btn small" disabled={!pending.length} onClick={() => setPrinting(true)}>
          <Icon name="printer" /> Štampaj sve ({pending.length})
        </button>
        <Link to="/predaja" className="btn small">
          <Icon name="truck" /> Spisak za kurira
        </Link>
      </div>

      <Segmented
        value={range}
        onChange={setRange}
        options={[
          { id: 'sve', label: 'Sve na čekanju' },
          { id: 'danas', label: 'Samo današnje' },
        ]}
      />

      <div className="section">
        <div className="section-title">
          <span className="grow">Treba spakovati</span>
          {totalPcs > 0 && (
            <span style={{ textTransform: 'none', letterSpacing: 0 }}>
              {totalPcs} kom{totalMake > 0 ? ` · napraviti ${totalMake}` : ''}
            </span>
          )}
        </div>
        {groups.length === 0 ? (
          <div className="notice green">
            <Icon name="check" />
            <span className="grow">
              <b>Sve je spakovano.</b> Nema ništa na čekanju.
            </span>
          </div>
        ) : (
          <div className="list">
            {groups.map((g) => (
              <div key={g.key}>
                <button type="button" className="sum-row" style={{ width: '100%', background: 'none', border: 0, textAlign: 'left' }} onClick={() => setOpen(open === g.key ? null : g.key)}>
                  <span className="main">
                    <span className="name" style={{ display: 'block' }}>
                      {g.title}
                    </span>
                    <span className="opts">
                      {swatch(g.color) && <span className="dot" style={{ background: swatch(g.color)! }} />}
                      {[g.color, g.size].filter(Boolean).join(' · ') || '—'}
                      <span className="muted">
                        · {g.orders.length} {plural(g.orders.length, 'porudžbina', 'porudžbine', 'porudžbina')}
                      </span>
                    </span>
                    {g.make > 0 && <span className="make">Napraviti: {g.make}</span>}
                  </span>
                  <span className="qty">×{g.qty}</span>
                </button>
                {open === g.key && (
                  <div style={{ padding: '0 14px 12px' }}>
                    {g.orders.map((o) => (
                      <Link key={o.id + o.qty} to={`/porudzbina/${o.id}`} className="list-row" style={{ minHeight: 44, padding: '6px 0' }}>
                        <span className="main">
                          #{o.number} · {o.name}
                        </span>
                        <strong>×{o.qty}</strong>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toPack.length > 0 && (
        <div className="section">
          <div className="section-title">Porudžbine za pakovanje</div>
          {toPack.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}

      {ready.length > 0 && (
        <div className="section">
          <div className="section-title">Spakovano, čeka slanje</div>
          {ready.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}

      {printing && <PrintSheet orders={pending} onClose={() => setPrinting(false)} />}
    </div>
  )
}
