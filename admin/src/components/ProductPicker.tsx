import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Icon } from './Icon'
import { ColorDot, Sheet, Stepper } from './ui'
import { fold, money } from '../lib/format'
import type { OrderItem, Product } from '../types'
import { uid } from '../db'

const uniq = (a: string[]) => [...new Set(a.filter(Boolean))]

export function ProductPicker({ onPick, onClose }: { onPick: (item: OrderItem) => void; onClose: () => void }) {
  const products = useLiveQuery(() => db.products.toArray(), [])
  const [q, setQ] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)

  const list = useMemo(() => {
    const n = fold(q.trim())
    return (products ?? [])
      .filter((p) => !p.deletedAt && p.active && (!n || fold(p.title).includes(n) || fold(p.handle).includes(n)))
      .sort((a, b) => a.title.localeCompare(b.title, 'sr'))
  }, [products, q])

  const colors = product ? uniq(product.variants.map((v) => v.color)) : []
  const sizes = product ? uniq(product.variants.filter((v) => !color || v.color === color).map((v) => v.size)) : []
  const variant = product?.variants.find((v) => (colors.length ? v.color === color : true) && (sizes.length ? v.size === size : true))

  const choose = (p: Product) => {
    setProduct(p)
    setQty(1)
    const cs = uniq(p.variants.map((v) => v.color))
    const ss = uniq(p.variants.map((v) => v.size))
    setColor(cs.length === 1 ? cs[0] : '')
    setSize(ss.length === 1 ? ss[0] : '')
  }

  const add = () => {
    if (!product || !variant) return
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
    const missing = colors.length > 0 && !color ? 'Izaberi boju' : sizes.length > 0 && !size ? 'Izaberi veličinu' : null
    return (
      <Sheet
        title={product.title}
        onClose={onClose}
        footer={
          <div className="btn-row">
            <button className="btn" style={{ flex: 'none' }} onClick={() => setProduct(null)} aria-label="Nazad na listu">
              <Icon name="back" />
            </button>
            <button className="btn primary" disabled={!variant} onClick={add}>
              {missing ?? `Dodaj · ${money((variant?.price ?? 0) * qty)}`}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          {(variant?.imageUrl || product.imageUrl) && <img className="thumb lg" src={variant?.imageUrl || product.imageUrl} alt="" />}
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{money(variant?.price ?? product.variants[0]?.price ?? 0)}</div>
            {variant && <div className="small muted">Na zalihi: {variant.stock}</div>}
          </div>
        </div>

        {colors.length > 0 && (
          <div className="section">
            <div className="section-title">Boja</div>
            <div className="chips">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${color === c ? 'on' : ''}`}
                  onClick={() => {
                    setColor(c)
                    setSize((s) => (product.variants.some((v) => v.color === c && v.size === s) ? s : ''))
                  }}
                >
                  <ColorDot color={c} />
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

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
          const prices = p.variants.map((v) => v.price)
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
