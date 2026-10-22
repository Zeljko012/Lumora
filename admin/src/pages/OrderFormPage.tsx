import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS, getSettings, uid } from '../db'
import { Icon } from '../components/Icon'
import { ColorDot, Field, NumberField, Segmented, Stepper, Switch, TopBar, useUi } from '../components/ui'
import { ProductPicker } from '../components/ProductPicker'
import { codAmount, findCustomer, findDuplicates, itemsTotal, reserveOrderNumber, normalizePhone, orderTotal, saveOrder, SOURCES } from '../lib/orders'
import { dateShort, money, plural } from '../lib/format'
import { emailOk, upsertContact } from '../lib/contacts'
import type { Customer, Order, OrderItem, ShippingPayer } from '../types'

function emptyOrder(courierId: string, shippingPrice: number, shippingPayer: ShippingPayer): Order {
  const now = Date.now()
  return {
    id: uid(),
    number: 0,
    createdAt: now,
    updatedAt: now,
    source: 'rucno',
    customer: { name: '', address: '', city: '', zip: '', phone: '' },
    phoneNorm: '',
    note: '',
    items: [],
    courierId,
    shippingPayer,
    shippingPrice,
    paymentMethod: 'pouzece',
    discount: 0,
    status: 'nova',
    statusHistory: [{ status: 'nova', at: now }],
    tracking: '',
  }
}

export default function OrderFormPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { confirm, toast } = useUi()
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const [order, setOrder] = useState<Order | null>(null)
  const original = useRef<Order | undefined>(undefined)
  const [picker, setPicker] = useState(false)
  const [known, setKnown] = useState<Awaited<ReturnType<typeof findCustomer>>>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const orderRef = useRef(order)
  orderRef.current = order

  useEffect(() => {
    ;(async () => {
      if (id) {
        const o = await db.orders.get(id)
        if (o) {
          original.current = o
          setOrder(structuredClone({ ...o, shippingPayer: o.shippingPayer ?? 'primalac' }))
        }
      } else {
        const s = await getSettings()
        const c = s.couriers.find((x) => x.id === s.defaultCourierId) ?? s.couriers.find((x) => x.active)
        setOrder(emptyOrder(c?.id ?? '', c?.price ?? 0, s.defaultShippingPayer ?? 'primalac'))
      }
    })()
  }, [id])

  // prepoznavanje postojećeg kupca po telefonu
  const phoneNorm = normalizePhone(order?.customer.phone ?? '')
  useEffect(() => {
    if (phoneNorm.length < 9) {
      setKnown(null)
      return
    }
    let stop = false
    findCustomer(phoneNorm).then((k) => {
      if (stop) return
      // ne prikazuj samu ovu porudžbinu kao "postojećeg kupca"
      if (k && id && k.orders === 1 && original.current?.phoneNorm === phoneNorm) k = null
      setKnown(k)
      const cur = orderRef.current
      if (k && !id && cur && !cur.customer.name && !cur.customer.address && !cur.customer.city) {
        setOrder({ ...cur, customer: { ...k.customer, phone: cur.customer.phone } })
        toast('Prepoznat kupac — adresa je popunjena')
      }
    })
    return () => {
      stop = true
    }
  }, [phoneNorm, id, toast])

  if (!order) return null

  const set = (patch: Partial<Order>) => setOrder({ ...order, ...patch })
  const setCustomer = (patch: Partial<Customer>) => {
    setOrder({ ...order, customer: { ...order.customer, ...patch } })
    setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(patch).map((k) => [k, false])) }))
  }
  const setItem = (itemId: string, patch: Partial<OrderItem>) => set({ items: order.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })

  const activeCouriers = settings.couriers.filter((c) => c.active || c.id === order.courierId)
  const total = orderTotal(order)

  const save = async () => {
    const c = order.customer
    const errs: Record<string, boolean> = {
      name: !c.name.trim(),
      phone: normalizePhone(c.phone).length < 8,
      address: !c.address.trim(),
      city: !c.city.trim(),
      items: order.items.length === 0,
    }
    setErrors(errs)
    const missing = Object.entries(errs).filter(([, v]) => v)
    if (missing.length) {
      toast(errs.items && missing.length === 1 ? 'Dodaj bar jedan proizvod' : 'Popuni označena polja')
      return
    }

    const dups = await findDuplicates(c.phone, order.items.map((i) => i.productId), order.id)
    if (dups.length) {
      const ok = await confirm({
        title: 'Moguć duplikat',
        message: `Isti kupac je već naručio isti proizvod u poslednjih 7 dana:\n${dups
          .map((d) => `#${d.number} od ${dateShort(d.createdAt)} — ${d.items.map((i) => i.title).join(', ')}`)
          .join('\n')}\n\nDa li ipak da sačuvam?`,
        confirmText: 'Sačuvaj ipak',
      })
      if (!ok) return
    }

    setSaving(true)
    try {
      const final: Order = {
        ...order,
        number: order.number || (await reserveOrderNumber()),
        statusHistory: id ? [...order.statusHistory, { status: order.status, at: Date.now(), note: 'Izmenjeni podaci porudžbine' }] : order.statusHistory,
        customer: { ...c, name: c.name.trim(), address: c.address.trim(), city: c.city.trim(), zip: c.zip.trim(), phone: c.phone.trim() },
      }
      await saveOrder(final, original.current)
      await upsertContact({
        name: final.customer.name,
        email: final.customer.email,
        phone: final.customer.phone,
        city: final.customer.city,
        source: final.source,
        marketing: marketing ? true : undefined,
      })
      toast(id ? 'Izmene su sačuvane' : `Porudžbina #${final.number} je sačuvana`)
      nav(`/porudzbina/${final.id}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page with-footer">
      <TopBar title={id ? `Izmena #${order.number}` : 'Nova porudžbina'} back />

      <div className="section">
        <div className="section-title">Kupac</div>
        <div className="card stack">
          <Field
            label="Telefon"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="06x xxx xxxx"
            value={order.customer.phone}
            onChange={(e) => setCustomer({ phone: e.target.value })}
            className={errors.phone ? 'uncertain' : ''}
            hint={!known ? 'Upiši prvo telefon — ako je kupac već naručivao, adresa se popuni sama.' : undefined}
          />
          {known && (
            <div className={`notice ${known.returned ? 'red' : 'green'}`}>
              <Icon name={known.returned ? 'alert' : 'user'} />
              <span className="grow">
                <b>{known.returned ? 'Rizičan kupac' : 'Postojeći kupac'}</b> — {known.orders} {plural(known.orders, 'porudžbina', 'porudžbine', 'porudžbina')}
                {known.returned ? `, vratio ${known.returned} ${plural(known.returned, 'paket', 'paketa', 'paketa')}` : ''}.
                {(order.customer.name !== known.customer.name || order.customer.address !== known.customer.address) && (
                  <>
                    {' '}
                    <button type="button" className="link-btn" onClick={() => setCustomer({ ...known.customer, phone: order.customer.phone })}>
                      Popuni iz prošle porudžbine
                    </button>
                  </>
                )}
              </span>
            </div>
          )}
          <Field label="Ime i prezime" autoComplete="off" value={order.customer.name} onChange={(e) => setCustomer({ name: e.target.value })} className={errors.name ? 'uncertain' : ''} />
          <Field label="Adresa" autoComplete="off" placeholder="Ulica i broj" value={order.customer.address} onChange={(e) => setCustomer({ address: e.target.value })} className={errors.address ? 'uncertain' : ''} />
          <div className="grid-zip">
            <Field label="Grad" autoComplete="off" value={order.customer.city} onChange={(e) => setCustomer({ city: e.target.value })} className={errors.city ? 'uncertain' : ''} />
            <Field label="Poštanski br." inputMode="numeric" autoComplete="off" value={order.customer.zip} onChange={(e) => setCustomer({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })} />
          </div>
          <Field
            label="Mejl (nije obavezno)"
            type="email"
            inputMode="email"
            autoComplete="off"
            hint="Za mejling listu. Ako kupac nema mejl, koristi se broj telefona (Viber)."
            value={order.customer.email ?? ''}
            onChange={(e) => setCustomer({ email: e.target.value })}
            className={order.customer.email && !emailOk(order.customer.email.trim()) ? 'uncertain' : ''}
          />
          <Switch checked={marketing} onChange={setMarketing} label="Kupac je pristao na obaveštenja o akcijama" hint="Uključi samo ako je kupac to rekao ili napisao." />
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <span className="grow">Proizvodi</span>
          {order.items.length > 0 && <span style={{ textTransform: 'none', letterSpacing: 0 }}>{money(itemsTotal(order.items))}</span>}
        </div>
        <div className="card" style={errors.items ? { borderColor: '#e6c04d', background: 'var(--amber-bg)' } : undefined}>
          {order.items.map((i) => (
            <div className="item-row" key={i.id}>
              <span className="chip" style={{ minHeight: 0, padding: 0, border: 0, background: 'none' }}>
                <ColorDot color={i.color} />
              </span>
              <div>
                <div className="name">{i.title}</div>
                <div className="opts">{[i.color, i.size].filter(Boolean).join(' · ') || '—'}</div>
              </div>
              <div className="controls">
                <Stepper value={i.qty} onChange={(qty) => setItem(i.id, { qty })} />
                <div className="input-wrap price">
                  <input
                    className="input with-suffix"
                    inputMode="numeric"
                    aria-label="Cena po komadu"
                    value={i.price}
                    onChange={(e) => setItem(i.id, { price: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                  />
                  <span className="suffix">din</span>
                </div>
                <button type="button" className="icon-btn" aria-label="Ukloni stavku" onClick={() => set({ items: order.items.filter((x) => x.id !== i.id) })}>
                  <Icon name="trash" />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className={`btn block ${order.items.length ? 'mt' : ''}`} onClick={() => setPicker(true)}>
            <Icon name="plus" /> Dodaj proizvod
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Dostava i plaćanje</div>
        <div className="card stack">
          <label className="field">
            <span>Kurir</span>
            <select
              className="select"
              value={order.courierId}
              onChange={(e) => {
                const c = settings.couriers.find((x) => x.id === e.target.value)
                set({ courierId: e.target.value, shippingPrice: c?.price ?? order.shippingPrice })
              }}
            >
              {activeCouriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span>Troškove dostave snosi</span>
            <Segmented
              value={order.shippingPayer}
              onChange={(shippingPayer) => set({ shippingPayer })}
              options={[
                { id: 'primalac', label: 'Primalac' },
                { id: 'posiljalac', label: 'Pošiljalac' },
              ]}
            />
            <small>
              {order.shippingPayer === 'primalac'
                ? 'Kupac plaća poštarinu direktno kuriru — nije deo otkupnine.'
                : `Poštarinu plaćaš ti (oko ${money(order.shippingPrice)}) — beleži se kao trošak.`}
            </small>
          </div>
          <NumberField label="Popust" suffix="din" value={order.discount || null} placeholder="0" onChange={(n) => set({ discount: n ?? 0 })} />
          <div className="field">
            <span>Plaćanje</span>
            <Segmented
              value={order.paymentMethod}
              onChange={(paymentMethod) => set({ paymentMethod })}
              options={[
                { id: 'pouzece', label: 'Pouzećem' },
                { id: 'uplaceno', label: 'Već uplaćeno' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Odakle je porudžbina</div>
        <div className="chips">
          {SOURCES.map((s) => (
            <button key={s.id} type="button" className={`chip ${order.source === s.id ? 'on' : ''}`} onClick={() => set({ source: s.id })}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <label className="field">
          <span>Napomena</span>
          <textarea className="textarea" placeholder="Npr. pozvati pre dostave, pakovati kao poklon…" value={order.note} onChange={(e) => set({ note: e.target.value })} />
        </label>
      </div>

      <div className="card totals">
        <div className="row">
          <span>Proizvodi</span>
          <span>{money(itemsTotal(order.items))}</span>
        </div>
        {order.discount > 0 && (
          <div className="row">
            <span>Popust</span>
            <span>− {money(order.discount)}</span>
          </div>
        )}
        <div className="row big">
          <span>{order.paymentMethod === 'pouzece' ? 'Otkupnina' : 'Ukupno (uplaćeno)'}</span>
          <span>{money(total)}</span>
        </div>
        <div className="small muted">Dostavu snosi: {order.shippingPayer === 'primalac' ? 'primalac (plaća kuriru posebno)' : 'pošiljalac'}</div>
      </div>

      <div className="footer-bar">
        <div className="sum">
          <small>{order.paymentMethod === 'pouzece' ? 'Otkupnina' : 'Uplaćeno, otkup 0'}</small>
          <strong>{money(order.paymentMethod === 'pouzece' ? codAmount(order) : total)}</strong>
        </div>
        <button className="btn primary" onClick={save} disabled={saving}>
          <Icon name="check" /> Sačuvaj
        </button>
      </div>

      {picker && (
        <ProductPicker
          onClose={() => setPicker(false)}
          onPick={(item) => {
            // isti proizvod iste boje/veličine → samo povećaj količinu
            const same = order.items.find((i) => i.variantId === item.variantId)
            set({ items: same ? order.items.map((i) => (i === same ? { ...i, qty: i.qty + item.qty } : i)) : [...order.items, item] })
            setErrors((e) => ({ ...e, items: false }))
            setPicker(false)
          }}
        />
      )}
    </div>
  )
}
