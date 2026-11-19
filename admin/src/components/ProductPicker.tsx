import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Icon } from './Icon'
import { ColorDot, Sheet, Stepper } from './ui'
import { fold, money } from '../lib/format'
import type { OrderItem, Product } from '../types'
import { uid } from '../db'

const uniq = (a: string[]) => [...new Set(a.filter(Boolean))]
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)
const FALLBACK_PIECE = ['prve figure', 'druge figure', 'treće figure']

export function ProductPicker({ onPick, onClose }: { onPick: (item: OrderItem) => void; onClose: () => void }) {
  const products = useLiveQuery(() => db.products.toArray(), [])
  const [q, setQ] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [optionId, setOptionId] = useState('')
  /** boje po komadu: [0] je prvi komad (ili jedini), ostalo su dodatni komadi opcije (par, set od 3...) */
  const [picked, setPicked] = useState<string[]>(['', '', ''])
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)

  const list = useMemo(() => {
    const n = fold(q.trim())
    return (products ?? [])
      .filter((p) => !p.deletedAt && p.active && (!n || fold(p.title).includes(n) || fold(p.handle).includes(n)))
      .sort((a, b) => a.title.localeCompare(b.title, 'sr'))
  }, [products, q])

  const colors = product ? uniq(product.variants.map((v) => v.color)) : []
  const color = picked[0]
  const sizes = product ? uniq(product.variants.filter((v) => !color || v.color === color).map((v) => v.size)) : []
  const variant = product?.variants.find((v) => (colors.length ? v.color === color : true) && (sizes.length ? v.size === size : true))

  // opcija sa sajta (npr. pojedinačno / par): druga cena i više komada, svaki sa svojom bojom
  const opt = product?.options?.find((o) => o.id === optionId)
  const pieces = opt?.pieces ?? 1
  const unitPrice = opt ? opt.price : variant?.price ?? 0

  const choose = (p: Product) => {
    setProduct(p)
    setQty(1)
    setOptionId(p.options?.[0]?.id ?? '')
    const cs = uniq(p.variants.map((v) => v.color))
    const ss = uniq(p.variants.map((v) => v.size))
    setPicked([cs.length === 1 ? cs[0] : '', '', ''])
    setSize(ss.length === 1 ? ss[0] : '')
  }

  const setColorAt = (i: number, c: string) => {
    setPicked((cur) => cur.map((x, k) => (k === i ? c : x)))
    if (i === 0 && product) setSize((s) => (product.variants.some((v) => v.color === c && v.size === s) ? s : ''))
  }

  const legendFor = (i: number) => {
    if (!opt || pieces < 2) return 'Boja'
    return `Boja ${opt.pieceLabels?.[i] ?? FALLBACK_PIECE[i] ?? ''}`.trim()
  }

  const add = () => {
    if (!product || !variant) return
    if (opt) {
      const suffix = opt.cartName || (pieces > 1 ? opt.label.toLowerCase() : '')
      const title = suffix ? `${product.title} – ${suffix}` : product.title
      if (pieces === 1) {
        onPick({ id: uid(), productId: product.id, variantId: variant.id, title, color: variant.color, size: variant.size, qty, price: opt.price, packed: false })
        return
      }
      const cs = picked.slice(0, pieces)
      const names = opt.pieceNames ?? []
      const colorText = cs.every((c) => c === cs[0])
        ? `${cap(cs[0])} (${pieces === 2 ? 'obe figure' : 'sve figure'})`
        : cs.map((c, i) => (names[i] ? `${names[i]}: ${cap(c)}` : cap(c))).join(names.length ? ', ' : ' + ')
      // više komada u raznim bojama: stavka nije vezana za jednu varijantu (zaliha se ne skida automatski)
      onPick({ id: uid(), productId: product.id, variantId: null, title, color: colorText, size: '', qty, price: opt.price, packed: false })
      return
    }
    onPick({
      id: uid(),
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      color: variant.color,
      size: variant.size,
      qty,
      price: variant.price,
      packed: false,
    })
  }

  if (product) {
    const needColors = colors.length > 0 ? (opt ? pieces : 1) : 0
    const missingColor = colors.length > 0 && picked.slice(0, needColors).some((c) => !c)
    const missing = missingColor ? (pieces > 1 ? 'Izaberi boje' : 'Izaberi boju') : sizes.length > 0 && !size ? 'Izaberi veličinu' : null
    return (
      <Sheet
        title={product.title}
        onClose={onClose}
        footer={
          <div className="btn-row">
            <button className="btn" style={{ flex: 'none' }} onClick={() => setProduct(null)} aria-label="Nazad na listu">
              <Icon name="back" />
            </button>
            <button className="btn primary" disabled={!variant || !!missing} onClick={add}>
              {missing ?? `Dodaj · ${money(unitPrice * qty)}`}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          {(variant?.imageUrl || product.imageUrl) && <img className="thumb lg" src={variant?.imageUrl || product.imageUrl} alt="" />}
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{money(opt ? opt.price : variant?.price ?? product.variants[0]?.price ?? 0)}</div>
            {variant && pieces === 1 && <div className="small muted">Na zalihi: {variant.stock}</div>}
          </div>
        </div>

        {product.options && product.options.length > 0 && (
          <div className="section">
            <div className="section-title">Opcija</div>
            <div className="chips">
              {product.options.map((o) => (
                <button key={o.id} type="button" className={`chip ${optionId === o.id ? 'on' : ''}`} onClick={() => setOptionId(o.id)}>
                  {o.label} · {money(o.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 &&
          Array.from({ length: Math.max(1, pieces) }, (_, i) => (
            <div className="section" key={i}>
              <div className="section-title">{legendFor(i)}</div>
              <div className="chips">
                {colors.map((c) => (
                  <button key={c} type="button" className={`chip ${picked[i] === c ? 'on' : ''}`} onClick={() => setColorAt(i, c)}>
                    <ColorDot color={c} />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ))}

        {sizes.length > 0 && (
          <div className="section">
            <div className="section-title">Veličina</div>
            <div className="chips">
              {sizes.map((s) => (
                <button key={s} type="button" className={`chip ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-title">Količina</div>
          <Stepper value={qty} onChange={setQty} />
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title="Izaberi proizvod" onClose={onClose}>
      <div className="input-wrap search" style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg)', paddingBottom: 10 }}>
        <span className="prefix-icon" style={{ marginTop: -5 }}>
          <Icon name="search" />
        </span>
        <input className="input with-icon" type="search" placeholder="Traži proizvod…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus={false} />
      </div>
      {products && list.length === 0 && <p className="muted">Nema proizvoda. Dodaj ih u Katalogu.</p>}
      <div className="product-grid">
        {list.map((p) => {
          const prices = p.options?.length ? p.options.map((o) => o.price) : p.variants.map((v) => v.price)
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          return (
            <button key={p.id} type="button" className="product-tile" onClick={() => choose(p)}>
              {p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy" /> : <div className="ph" />}
              <span className="t">{p.title}</span>
              <span className="p">{prices.length ? (min === max ? money(min) : `${money(min)} – ${money(max)}`) : '—'}</span>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}
