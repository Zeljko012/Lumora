import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import { Icon } from '../components/Icon'
import { ColorDot, TopBar, useUi } from '../components/ui'
import { StatusBadge, packTone } from '../components/OrderBits'
import { ReturnSheet, StatusPicker } from '../components/StatusSheets'
import { Scanner } from '../components/Scanner'
import { PrintSheet } from '../components/PrintSheet'
import {
  changeStatus,
  codAmount,
  deleteOrder,
  itemsTotal,
  nextStatus,
  orderTotal,
  packProgress,
  PAYER_LABEL,
  PAYMENT_LABEL,
  payerOf,
  statusLabel,
  togglePacked,
  unpaidOverdue,
} from '../lib/orders'
import { dateTime, money } from '../lib/format'
import type { Order, OrderStatus } from '../types'
import { Loading } from '../components/Guard'

export default function OrderDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { confirm, toast } = useUi()
  const order = useLiveQuery(() => db.orders.get(id!), [id])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const [picker, setPicker] = useState(false)
  const [returning, setReturning] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [tracking, setTracking] = useState('')
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    if (order) setTracking(order.tracking)
  }, [order?.tracking]) // eslint-disable-line react-hooks/exhaustive-deps

  if (order === undefined) return <Loading />
  if (!order || order.deletedAt)
    return (
      <div className="page">
        <TopBar title="Porudžbina" back="/porudzbine" />
        <div className="empty">
          <h2>Porudžbina ne postoji</h2>
        </div>
      </div>
    )

  const c = order.customer
  const courier = settings.couriers.find((x) => x.id === order.courierId)
  const next = nextStatus(order.status)
  const prog = packProgress(order)
  const tone = packTone(order)
  const overdue = unpaidOverdue(order, settings.unpaidAlertDays)
  const payer = payerOf(order)
  const courierPrice = courier?.price ?? order.shippingPrice

  const setStatus = async (s: OrderStatus, extra: Partial<Order> = {}) => {
    setPicker(false)
    if (s === 'vraceno') {
      setReturning(true)
      return
    }
    if (s === 'otkazano') {
      const ok = await confirm({
        title: 'Otkazati porudžbinu?',
        message: settings.deductStock ? 'Proizvodi se vraćaju na zalihu.' : undefined,
        confirmText: 'Otkaži porudžbinu',
        danger: true,
      })
      if (!ok) return
    }
    if (s === 'poslato' && !order.tracking && !tracking.trim()) toast('Savet: upiši i broj pošiljke ispod')
    await changeStatus(order, s, { tracking: tracking.trim(), ...extra })
    toast(`Status: ${statusLabel(s)}`)
  }

  const saveTracking = async (value: string) => {
    const v = value.trim()
    setTracking(v)
    if (v === order.tracking) return
    await db.orders.put({
      ...order,
      tracking: v,
      statusHistory: [...order.statusHistory, { status: order.status, at: Date.now(), note: v ? `Broj pošiljke: ${v}` : 'Broj pošiljke obrisan' }],
      updatedAt: Date.now(),
    })
    toast('Broj pošiljke je sačuvan')
  }

  const toggle = async (itemId: string) => {
    navigator.vibrate?.(15)
    const r = await togglePacked(order.id, itemId)
    if (r && r.from !== r.to) toast(r.to === 'spakovano' ? 'Sve spakovano ✓' : 'Vraćeno na „Nova“')
  }

  const remove = async () => {
    const ok = await confirm({
      title: `Obrisati porudžbinu #${order.number}?`,
      message: settings.deductStock ? 'Proizvodi će biti vraćeni na zalihu.' : undefined,
      confirmText: 'Obriši',
      danger: true,
    })
    if (!ok) return
    await deleteOrder(order)
    toast('Porudžbina je obrisana')
    nav('/porudzbine', { replace: true })
  }

  const copyAddress = async () => {
    const text = [c.name, c.address, `${c.zip} ${c.city}`.trim(), c.phone].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast('Adresa je kopirana')
    } catch {
      toast('Kopiranje nije uspelo')
    }
  }

  return (
    <div className="page">
      <TopBar
        title={`#${order.number}`}
        sub={dateTime(order.createdAt)}
        back="/porudzbine"
        right={
          <>
            <button className="icon-btn" aria-label="Štampaj" onClick={() => setPrinting(true)}>
              <Icon name="printer" />
            </button>
            <Link to={`/porudzbina/${order.id}/izmena`} className="icon-btn" aria-label="Izmeni">
              <Icon name="edit" />
            </Link>
          </>
        }
      />

      {/* ---------- status ---------- */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge status={order.status} />
          <span className="small muted">od {dateTime(order.statusHistory[order.statusHistory.length - 1]?.at ?? order.createdAt)}</span>
        </div>
        {overdue != null && (
          <div className="notice amber mt">
            <Icon name="alert" />
            <span className="grow">
              Poslato pre <b>{overdue} dana</b>, a još nije naplaćeno. Proveri sa kurirom.
            </span>
          </div>
        )}
        <div className="btn-row mt">
          {next && (
            <button className="btn status-next" style={{ ['--c' as string]: `var(--st-${next})` }} onClick={() => setStatus(next)}>
              <Icon name="check" /> {statusLabel(next)}
            </button>
          )}
          <button className="btn" style={next ? { flex: 'none' } : undefined} onClick={() => setPicker(true)}>
            {next ? 'Drugo…' : 'Promeni status'}
          </button>
        </div>
      </div>

      {/* ---------- kupac ---------- */}
      <div className="section">
        <div className="section-title">Kupac</div>
        <div className="card">
          <Link to={`/kupac/${order.phoneNorm}`} style={{ fontSize: 20, fontWeight: 750, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            {c.name}
            <Icon name="chevron" size={18} />
          </Link>
          <div className="muted" style={{ marginTop: 2 }}>
            {c.address}
            <br />
            {[c.zip, c.city].filter(Boolean).join(' ')}
          </div>
          <div className="btn-row mt">
            <a className="btn small" href={`tel:${c.phone.replace(/\s/g, '')}`}>
              <Icon name="phone" /> {c.phone}
            </a>
            <button className="btn small" style={{ flex: 'none' }} onClick={copyAddress} aria-label="Kopiraj adresu">
              <Icon name="copy" />
            </button>
          </div>
          {order.note && (
            <div className="notice amber mt">
              <Icon name="info" />
              <span className="grow">{order.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* ---------- čeklista pakovanja ---------- */}
      <div className="section">
        <div className="section-title">Pakovanje</div>
        {tone && (
          <div className={`pack-head ${tone}`}>
            <Icon name={prog.all ? 'check' : 'box'} />
            <span>{prog.all ? 'Sve je spakovano' : `Spakovano ${prog.done} od ${prog.total}`}</span>
            <span className="progress">
              <i style={{ width: `${prog.total ? (prog.done / prog.total) * 100 : 0}%` }} />
            </span>
          </div>
        )}
        <div className="check-list">
          {order.items.map((i) => (
            <button key={i.id} type="button" className={`check-row ${i.packed ? 'on' : ''}`} onClick={() => toggle(i.id)} aria-pressed={i.packed}>
              <span className="box">
                <Icon name="check" />
              </span>
              <span className="main">
                <span className="name" style={{ display: 'block' }}>
                  {i.title}
                </span>
                <span className="opts" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="chip" style={{ minHeight: 0, padding: 0, border: 0, background: 'none' }}>
                    <ColorDot color={i.color} />
                  </span>
                  {[i.color, i.size].filter(Boolean).join(' · ') || '—'}
                </span>
              </span>
              <span className="qty">×{i.qty}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- iznosi ---------- */}
      <div className="section">
        <div className="section-title">Naplata</div>
        <div className="card totals">
          {order.items.map((i) => (
            <div className="row" key={i.id}>
              <span>
                {i.title} {i.qty > 1 ? `× ${i.qty}` : ''}
              </span>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          {order.discount > 0 && (
            <div className="row">
              <span>Popust</span>
              <span>− {money(order.discount)}</span>
            </div>
          )}
          <div className="row big">
            <span>Otkupnina</span>
            <span>{money(codAmount(order))}</span>
          </div>
          {order.paymentMethod === 'uplaceno' && <div className="small muted right">Uplaćeno unapred: {money(orderTotal(order))}</div>}
          {itemsTotal(order.items) === 0 && <div className="small muted">Nema stavki.</div>}
        </div>
      </div>

      {/* ---------- povrat ---------- */}
      {order.status === 'vraceno' && order.returnInfo && (
        <div className="section">
          <div className="section-title">Povrat</div>
          <div className="card">
            <dl className="kv" style={{ margin: 0 }}>
              <dt>Razlog</dt>
              <dd>{order.returnInfo.reason || '—'}</dd>
              <dt>Trošak</dt>
              <dd>{money(order.returnInfo.cost)}</dd>
              <dt>Zaliha</dt>
              <dd>{order.returnInfo.restocked ? 'vraćeno na zalihu' : 'nije vraćeno (neispravno)'}</dd>
            </dl>
          </div>
        </div>
      )}

      {/* ---------- pošiljka ---------- */}
      <div className="section">
        <div className="section-title">Pošiljka</div>
        <div className="card stack">
          <dl className="kv" style={{ margin: 0 }}>
            <dt>Kurir</dt>
            <dd>{courier?.name ?? '—'}</dd>
            <dt>Plaćanje</dt>
            <dd>{PAYMENT_LABEL[order.paymentMethod]}</dd>
            <dt>Dostavu snosi</dt>
            <dd>
              {PAYER_LABEL[payer]}
              {payer === 'posiljalac' && <span className="muted"> · {money(order.shippingPrice)}</span>}
            </dd>
          </dl>
          <label className="field">
            <span>Broj pošiljke</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="upiši ili skeniraj"
                autoComplete="off"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                onBlur={(e) => saveTracking(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
              <button type="button" className="btn" style={{ flex: 'none', padding: '0 14px' }} onClick={() => setScanning(true)} aria-label="Skeniraj bar kod">
                <Icon name="scan" />
              </button>
            </div>
          </label>
        </div>
      </div>

      {/* ---------- istorija ---------- */}
      <div className="section">
        <div className="section-title">Istorija promena</div>
        <div className="card">
          <ul className="timeline">
            {[...order.statusHistory].reverse().map((h, idx, arr) => {
              const prev = arr[idx + 1]
              const isStatus = !h.note || !prev || prev.status !== h.status
              return (
                <li key={idx}>
                  {isStatus ? <StatusBadge status={h.status} /> : <span className="badge">Izmena</span>}
                  {h.note && <span className="small">{h.note}</span>}
                  <span className="when">{dateTime(h.at)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <button className="btn danger block mt-lg" onClick={remove}>
        <Icon name="trash" /> Obriši porudžbinu
      </button>

      {printing && <PrintSheet orders={[order]} onClose={() => setPrinting(false)} />}
      {picker && <StatusPicker current={order.status} history={order.statusHistory} onPick={setStatus} onClose={() => setPicker(false)} />}
      {returning && (
        <ReturnSheet
          defaultCost={payer === 'primalac' ? courierPrice * 2 : courierPrice}
          costHint={
            payer === 'primalac'
              ? 'Kupac nije platio poštarinu, pa ti plaćaš oba smera (predlog: 2 × cena dostave).'
              : 'Slanje je već tvoj trošak; ovde ide povratna poštarina.'
          }
          onClose={() => setReturning(false)}
          onConfirm={async (r) => {
            setReturning(false)
            await changeStatus(order, 'vraceno', { returnInfo: { ...r, at: Date.now() } }, r.reason || undefined)
            toast(r.restocked ? 'Vraćeno — proizvodi su ponovo na zalihi' : 'Označeno kao vraćeno')
          }}
        />
      )}
      {scanning && (
        <Scanner
          onClose={() => setScanning(false)}
          onResult={(code) => {
            setScanning(false)
            saveTracking(code)
          }}
        />
      )}
    </div>
  )
}
