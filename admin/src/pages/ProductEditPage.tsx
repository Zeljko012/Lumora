import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, uid } from '../db'
import { Icon } from '../components/Icon'
import { ColorDot, Field, NumberField, Switch, TopBar, useUi } from '../components/ui'
import type { Product, Variant } from '../types'

const newVariant = (price = 0, color = ''): Variant => ({ id: uid(), sku: '', optionKey: '', color, size: '', price, stock: 0, imageUrl: '' })

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ProductEditPage() {
  const { id } = useParams()
  const isNew = id === 'novi'
  const nav = useNavigate()
  const { confirm, toast } = useUi()
  const [p, setP] = useState<Product | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (isNew) {
      setP({ id: uid(), handle: '', title: '', imageUrl: '', images: [], active: true, source: 'rucno', lowStock: null, variants: [newVariant()], updatedAt: Date.now() })
    } else {
      db.products.get(id!).then((x) => (x ? setP(x) : setMissing(true)))
    }
  }, [id, isNew])

  if (missing)
    return (
      <div className="page">
        <TopBar title="Proizvod" back="/katalog" />
        <div className="empty">
          <h2>Proizvod ne postoji</h2>
        </div>
      </div>
    )
  if (!p) return null

  const set = (patch: Partial<Product>) => setP({ ...p, ...patch })
  const setVar = (vid: string, patch: Partial<Variant>) => set({ variants: p.variants.map((v) => (v.id === vid ? { ...v, ...patch } : v)) })

  const save = async () => {
    if (!p.title.trim()) {
      toast('Upiši naziv proizvoda')
      return
    }
    if (p.variants.length === 0) {
      toast('Dodaj bar jednu varijantu')
      return
    }
    await db.products.put({ ...p, title: p.title.trim(), handle: p.handle || slug(p.title), updatedAt: Date.now() })
    toast('Proizvod je sačuvan')
    nav('/katalog', { replace: true })
  }

  const remove = async () => {
    const used = await db.orders.filter((o) => !o.deletedAt && o.items.some((i) => i.productId === p.id)).count()
    const ok = await confirm({
      title: `Obrisati „${p.title}“?`,
      message: used
        ? `Proizvod se nalazi u ${used} porudžbina. One ostaju netaknute, samo proizvod nestaje iz kataloga.\n\nAko ga samo više ne prodaješ, bolje isključi „Aktivan“.`
        : 'Proizvod nestaje iz kataloga.',
      confirmText: 'Obriši',
      danger: true,
    })
    if (!ok) return
    await db.products.put({ ...p, deletedAt: Date.now(), updatedAt: Date.now() })
    toast('Proizvod je obrisan')
    nav('/katalog', { replace: true })
  }

  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)

  return (
    <div className="page with-footer">
      <TopBar title={isNew ? 'Novi proizvod' : p.title} sub={isNew ? undefined : `ukupna zaliha ${totalStock}`} back="/katalog" />

      <div className="card stack">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {p.imageUrl ? (
            <img className="thumb lg" src={p.imageUrl} alt="" />
          ) : (
            <span className="thumb lg">
              <Icon name="image" />
            </span>
          )}
          <div style={{ flex: 1 }}>
            <Field label="Naziv" value={p.title} onChange={(e) => set({ title: e.target.value })} />
          </div>
        </div>
        <Field label="Slika (URL)" type="url" placeholder="https://…" value={p.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} />
        <Switch checked={p.active} onChange={(active) => set({ active })} label="Aktivan" hint="Neaktivni proizvodi se ne nude pri unosu porudžbine." />
        <NumberField
          label="Upozori kad zaliha padne ispod"
          suffix="kom"
          placeholder="kao u podešavanjima"
          value={p.lowStock}
          onChange={(lowStock) => set({ lowStock })}
          hint="Ostavi prazno da važi opšti broj iz Podešavanja."
        />
        <NumberField
          label="Trošak izrade jednog komada"
          suffix="din"
          placeholder="nije upisano"
          value={p.cost ?? null}
          onChange={(cost) => set({ cost: cost ?? undefined })}
          hint="Materijal, struja, ambalaža po komadu. Koristi se u Analitici za procenu marže."
        />
        {!isNew && (
          <p className="small muted" style={{ margin: 0 }}>
            {p.source === 'sajt' ? 'Proizvod sa sajta' : p.source === 'shopify' ? 'Shopify handle' : 'Ručno dodat'}: <code>{p.handle}</code>
            {p.source === 'sajt' && <> — cene se preuzimaju sa sajta pri osvežavanju kataloga.</>}
          </p>
        )}
      </div>

      <div className="section">
        <div className="section-title">
          <span className="grow">Varijante ({p.variants.length})</span>
        </div>
        <div className="card">
          {p.variants.map((v) => (
            <div className="variant-row" key={v.id}>
              <div className="head">
                <span className="chip" style={{ minHeight: 0, padding: 0, border: 0, background: 'none' }}>
                  <ColorDot color={v.color} />
                </span>
                <span className="grow">{[v.color, v.size].filter(Boolean).join(' · ') || 'Osnovna'}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Ukloni varijantu"
                  onClick={() => set({ variants: p.variants.filter((x) => x.id !== v.id) })}
                  disabled={p.variants.length === 1}
                >
                  <Icon name="trash" />
                </button>
              </div>
              <Field label="Boja" value={v.color} onChange={(e) => setVar(v.id, { color: e.target.value })} />
              <Field label="Veličina" value={v.size} onChange={(e) => setVar(v.id, { size: e.target.value })} />
              <NumberField label="Cena" suffix="din" value={v.price} onChange={(n) => setVar(v.id, { price: n ?? 0 })} />
              <NumberField label="Zaliha" suffix="kom" value={v.stock} onChange={(n) => setVar(v.id, { stock: n ?? 0 })} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="SKU (šifra)" value={v.sku} placeholder="nije obavezno" onChange={(e) => setVar(v.id, { sku: e.target.value })} />
              </div>
            </div>
          ))}
          <button type="button" className="btn block mt" onClick={() => set({ variants: [...p.variants, newVariant(p.variants[0]?.price ?? 0)] })}>
            <Icon name="plus" /> Dodaj varijantu
          </button>
        </div>
      </div>

      {!isNew && (
        <button className="btn danger block mt-lg" onClick={remove}>
          <Icon name="trash" /> Obriši proizvod
        </button>
      )}

      <div className="footer-bar">
        <button className="btn" style={{ minWidth: 0 }} onClick={() => nav('/katalog')}>
          Odustani
        </button>
        <button className="btn primary" style={{ flex: 1 }} onClick={save}>
          <Icon name="check" /> Sačuvaj
        </button>
      </div>
    </div>
  )
}
