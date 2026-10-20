import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import { Icon } from '../components/Icon'
import { TopBar } from '../components/ui'
import { swatch } from '../lib/colors'
import { fold, money, plural } from '../lib/format'
import { lowStockVariants } from '../lib/orders'
import { Loading } from '../components/Guard'

export default function CatalogPage() {
  const products = useLiveQuery(() => db.products.toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const [params, setParams] = useSearchParams()
  const onlyLow = params.get('zaliha') === '1'
  const [q, setQ] = useState('')

  const low = useMemo(() => lowStockVariants(products ?? [], settings.lowStockThreshold), [products, settings.lowStockThreshold])
  const lowIds = new Set(low.map((l) => l.product.id))

  const list = useMemo(() => {
    const n = fold(q.trim())
    return (products ?? [])
      .filter((p) => !p.deletedAt)
      .filter((p) => !onlyLow || lowIds.has(p.id))
      .filter((p) => !n || fold(p.title).includes(n) || fold(p.handle).includes(n) || p.variants.some((v) => fold(v.sku).includes(n)))
      .sort((a, b) => Number(b.active) - Number(a.active) || a.title.localeCompare(b.title, 'sr'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, q, onlyLow, low])

  if (!products) return <Loading />
  const liveCount = products.filter((p) => !p.deletedAt).length

  return (
    <div className="page">
      <TopBar
        title="Katalog"
        back="/vise"
        sub={`${liveCount} ${plural(liveCount, 'proizvod', 'proizvoda', 'proizvoda')}`}
        right={
          <Link to="/katalog/novi" className="icon-btn" aria-label="Novi proizvod">
            <Icon name="plus" />
          </Link>
        }
      />

      <div className="btn-row" style={{ marginBottom: 12 }}>
        <Link to="/katalog/novi" className="btn small">
          <Icon name="plus" /> Novi proizvod
        </Link>
      </div>

      <div className="input-wrap search">
        <span className="prefix-icon">
          <Icon name="search" />
        </span>
        <input className="input with-icon" type="search" placeholder="Traži po nazivu ili SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {(low.length > 0 || onlyLow) && (
        <div className="tabs">
          <button className={`tab ${!onlyLow ? 'on' : ''}`} onClick={() => setParams({})}>
            Svi
          </button>
          <button className={`tab ${onlyLow ? 'on' : ''}`} onClick={() => setParams({ zaliha: '1' })}>
            Niska zaliha <span className="count">{lowIds.size}</span>
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty">
          <Icon name="box" />
          <h2>{q || onlyLow ? 'Nema rezultata' : 'Katalog je prazan'}</h2>
          {!q && !onlyLow && (
            <Link to="/vise" className="btn primary">
              <Icon name="refresh" /> Osveži katalog sa sajta
            </Link>
          )}
        </div>
      ) : (
        <div className="list">
          {list.map((p) => {
            const prices = p.variants.map((v) => v.price)
            const min = prices.length ? Math.min(...prices) : 0
            const max = prices.length ? Math.max(...prices) : 0
            const stock = p.variants.reduce((s, v) => s + v.stock, 0)
            const colors = [...new Set(p.variants.map((v) => v.color).filter(Boolean))]
            const lowHere = low.filter((l) => l.product.id === p.id)
            return (
              <Link key={p.id} to={`/katalog/${p.id}`} className="list-row" style={!p.active ? { opacity: 0.55 } : undefined}>
                {p.imageUrl ? (
                  <img className="thumb" src={p.imageUrl} alt="" loading="lazy" />
                ) : (
                  <span className="thumb">
                    <Icon name="image" />
                  </span>
                )}
                <div className="main">
                  <div className="title">{p.title}</div>
                  <div className="meta">
                    {min === max ? money(min) : `${money(min)} – ${money(max)}`} · zaliha {stock}
                    {!p.active && ' · arhiviran'}
                  </div>
                  {colors.length > 0 && (
                    <div className="swatches" aria-label={colors.join(', ')}>
                      {colors.map((c) => (
                        <i key={c} style={{ background: swatch(c) ?? 'var(--surface-2)' }} title={c} />
                      ))}
                    </div>
                  )}
                </div>
                {lowHere.length > 0 && <span className="badge amber">{lowHere.length} nisko</span>}
                <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
