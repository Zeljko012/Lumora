import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/ui'
import { Kpi } from '../components/Kpi'
import { OrderCard } from '../components/OrderBits'
import { orderTotal, unpaidOverdue } from '../lib/orders'
import { dateShort, money, plural } from '../lib/format'
import { Loading } from '../components/Guard'

/** Kartica kupca: sve porudžbine, koliko je potrošio i da li je vraćao pakete. */
export default function CustomerPage() {
  const { phone } = useParams()
  const orders = useLiveQuery(() => db.orders.where('phoneNorm').equals(phone ?? '').toArray(), [phone])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  if (!orders) return <Loading />
  const list = orders.filter((o) => !o.deletedAt).sort((a, b) => b.createdAt - a.createdAt)
  if (!list.length)
    return (
      <div className="page">
        <TopBar title="Kupac" back />
        <div className="empty">
          <h2>Nema porudžbina za ovaj broj</h2>
        </div>
      </div>
    )

  const c = list[0].customer
  const valid = list.filter((o) => o.status !== 'otkazano' && o.status !== 'vraceno')
  const spent = valid.reduce((s, o) => s + orderTotal(o), 0)
  const returned = list.filter((o) => o.status === 'vraceno').length
  const courierName = (id: string) => settings.couriers.find((x) => x.id === id)?.name

  return (
    <div className="page">
      <TopBar title={c.name} sub={c.city} back />
      {returned > 0 && (
        <div className="notice red" style={{ marginBottom: 10 }}>
          <Icon name="alert" />
          <span className="grow">
            <b>Rizičan kupac</b> — vratio {returned} {plural(returned, 'paket', 'paketa', 'paketa')}. Razmisli o uplati unapred.
          </span>
        </div>
      )}
      <div className="card">
        <div className="muted">
          {c.address}, {[c.zip, c.city].filter(Boolean).join(' ')}
        </div>
        <a className="btn small mt" href={`tel:${c.phone.replace(/\s/g, '')}`}>
          <Icon name="phone" /> {c.phone}
        </a>
      </div>
      <div className="kpi-grid mt">
        <Kpi label="Potrošio" value={money(spent)} sub={`${valid.length} ${plural(valid.length, 'porudžbina', 'porudžbine', 'porudžbina')}`} />
        <Kpi label="Vraćeno" value={String(returned)} sub={`kupac od ${dateShort(list[list.length - 1].createdAt)}`} />
      </div>
      <div className="section">
        <div className="section-title">Sve porudžbine ({list.length})</div>
        {list.map((o) => (
          <OrderCard key={o.id} order={o} courierName={courierName(o.courierId)} overdueDays={unpaidOverdue(o, settings.unpaidAlertDays)} />
        ))}
      </div>
    </div>
  )
}
