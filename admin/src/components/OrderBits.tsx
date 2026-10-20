import { Link } from 'react-router-dom'
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
