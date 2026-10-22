import { ThumbRow } from './ItemThumb'
import { Link, useNavigate } from 'react-router-dom'
import type { Order, OrderStatus } from '../types'
import { codAmount, itemLabel, orderTotal, packProgress, sourceLabel, statusLabel } from '../lib/orders'
import { dateRelative, money } from '../lib/format'
import { Icon } from './Icon'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="badge status" style={{ ['--c' as string]: `var(--st-${status})` }}>
      {statusLabel(status)}
    </span>
  )
}

/** Crveno dok nije sve spakovano, zeleno kad jeste — samo dok porudžbina čeka slanje. */
export function packTone(o: Order): 'red' | 'green' | null {
  if (o.status !== 'nova' && o.status !== 'spakovano') return null
  return packProgress(o).all ? 'green' : 'red'
}

export function PackPill({ order }: { order: Order }) {
  const tone = packTone(order)
  if (!tone) return null
  const p = packProgress(order)
  return (
    <span className={`pack-pill ${tone}`}>
      {p.all ? <Icon name="check" /> : <Icon name="box" />}
      {p.all ? 'Spakovano' : `${p.done}/${p.total}`}
    </span>
  )
}

interface CardProps {
  order: Order
  courierName?: string
  overdueDays?: number | null
  selecting?: boolean
  selected?: boolean
  onToggle?: () => void
}

export function OrderCard({ order, courierName, overdueDays, selecting, selected, onToggle }: CardProps) {
  const pcs = order.items.reduce((s, i) => s + i.qty, 0)
  const cod = codAmount(order)
  const tone = packTone(order)
  const cls = `order-card ${tone ? `pack-${tone}` : ''} ${selected ? 'selected' : ''}`

  const body = (
    <>
      <div className="oc-top">
        {selecting && <input type="checkbox" className="oc-select" checked={!!selected} readOnly tabIndex={-1} aria-hidden />}
        <span className="oc-name">{order.customer.name || 'Bez imena'}</span>
        <span className="oc-total">{money(orderTotal(order))}</span>
      </div>
      <div className="oc-meta">
        <span>#{order.number}</span>·<span>{order.customer.city || 'bez grada'}</span>·<span>{dateRelative(order.createdAt)}</span>
        {order.tracking && (
          <>
            ·<span>{order.tracking}</span>
          </>
        )}
      </div>
      <ThumbRow items={order.items} />
      <div className="oc-items">
        {order.items.length === 0 ? (
          <span className="muted">Nema stavki</span>
        ) : (
          order.items.map((i) => `${itemLabel(i)}${i.qty > 1 ? ` × ${i.qty}` : ''}`).join(', ')
        )}
      </div>
      <div className="oc-bottom">
        <StatusBadge status={order.status} />
        <PackPill order={order} />
        {overdueDays != null && <span className="badge amber">Nenaplaćeno {overdueDays} d</span>}
        {order.paymentMethod === 'uplaceno' ? <span className="badge green">Uplaćeno</span> : <span className="badge">Otkup {money(cod)}</span>}
        <span className="grow" />
        <span className="small muted">
          {pcs} kom{courierName ? ` · ${courierName}` : ''}
          {order.source !== 'rucno' ? ` · ${sourceLabel(order.source)}` : ''}
        </span>
      </div>
    </>
  )

  if (selecting)
    return (
      <button type="button" className={cls} style={{ width: '100%', textAlign: 'left', font: 'inherit' }} onClick={onToggle} aria-pressed={selected}>
        {body}
      </button>
    )
  return (
    <Link to={`/porudzbina/${order.id}`} className={cls}>
      {body}
    </Link>
  )
}

/** Tabela porudžbina za širok ekran (računar). Klik na red otvara porudžbinu, a u režimu biranja štiklira red. */
export function OrdersTable({
  orders,
  courierName,
  overdue,
  selecting,
  selected,
  onToggle,
}: {
  orders: Order[]
  courierName: (id: string) => string | undefined
  overdue: Map<string, number>
  selecting: boolean
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const nav = useNavigate()
  return (
    <div className="otable-wrap">
      <table className="otable">
        <thead>
          <tr>
            {selecting && <th className="c-sel" />}
            <th>Broj</th>
            <th>Kupac</th>
            <th>Proizvodi</th>
            <th>Datum</th>
            <th className="num">Iznos</th>
            <th>Status</th>
            <th>Naplata</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const tone = packTone(o)
            const od = overdue.get(o.id)
            return (
              <tr
                key={o.id}
                className={`${tone ? `pack-${tone}` : ''} ${selected.has(o.id) ? 'selected' : ''}`}
                onClick={() => (selecting ? onToggle(o.id) : nav(`/porudzbina/${o.id}`))}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') selecting ? onToggle(o.id) : nav(`/porudzbina/${o.id}`)
                }}
              >
                {selecting && (
                  <td className="c-sel">
                    <input type="checkbox" checked={selected.has(o.id)} readOnly tabIndex={-1} aria-label={`Izaberi #${o.number}`} />
                  </td>
                )}
                <td className="c-num">#{o.number}</td>
                <td>
                  <div className="c-name">{o.customer.name || 'Bez imena'}</div>
                  <div className="c-sub">
                    {[o.customer.city, o.customer.phone].filter(Boolean).join(' · ') || '—'}
                    {o.source !== 'rucno' ? ` · ${sourceLabel(o.source)}` : ''}
                  </div>
                </td>
                <td>
                  <div className="c-items">
                    <ThumbRow items={o.items} />
                    <span className="c-sub">{o.items.map((i) => `${itemLabel(i)}${i.qty > 1 ? ` × ${i.qty}` : ''}`).join(', ')}</span>
                  </div>
                </td>
                <td className="c-date">
                  {dateRelative(o.createdAt)}
                  {courierName(o.courierId) && <div className="c-sub">{courierName(o.courierId)}</div>}
                </td>
                <td className="num c-total">{money(orderTotal(o))}</td>
                <td>
                  <div className="c-status">
                    <StatusBadge status={o.status} />
                    <PackPill order={o} />
                    {od != null && <span className="badge amber">Nenaplaćeno {od} d</span>}
                  </div>
                </td>
                <td>{o.paymentMethod === 'uplaceno' ? <span className="badge green">Uplaćeno</span> : <span className="badge">Otkup {money(codAmount(o))}</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
