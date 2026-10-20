import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { Icon } from '../components/Icon'
import { Switch, TopBar, useUi } from '../components/ui'
import { parseShopifyCsv, planImport, type ParsedProduct } from '../lib/shopifyCsv'
import { plural } from '../lib/format'
import type { Product } from '../types'

export default function CatalogImportPage() {
  const nav = useNavigate()
  const { confirm, toast } = useUi()
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedProduct[] | null>(null)
  const [existing, setExisting] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [updateStock, setUpdateStock] = useState(false)
  const [toDelete, setToDelete] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  const plan = useMemo(() => (parsed ? planImport(parsed, existing, { updateStock }) : null), [parsed, existing, updateStock])

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setError('')
    setParsed(null)
    setFileName(f.name)
    try {
      const text = await f.text()
      const p = parseShopifyCsv(text)
      if (!p.length) throw new Error('U fajlu nema nijednog proizvoda.')
      setExisting(await db.products.toArray())
      setParsed(p)
      setToDelete(new Set())
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const apply = async () => {
    if (!plan) return
    if (toDelete.size) {
      const ok = await confirm({
        title: `Obrisati ${toDelete.size} ${plural(toDelete.size, 'proizvod', 'proizvoda', 'proizvoda')}?`,
        message: 'Označeni proizvodi kojih nema u fajlu biće uklonjeni iz kataloga. Porudžbine ostaju netaknute.',
        confirmText: 'Obriši i uvezi',
        danger: true,
      })
      if (!ok) return
    }
    setBusy(true)
    const now = Date.now()
    await db.transaction('rw', db.products, async () => {
      await db.products.bulkPut(plan.added)
      await db.products.bulkPut(plan.updated.map((u) => u.after))
      const del = plan.missing.filter((p) => toDelete.has(p.id)).map((p) => ({ ...p, deletedAt: now, updatedAt: now }))
      await db.products.bulkPut(del)
    })
    setBusy(false)
    toast(`Uvezeno: ${plan.added.length} novih, ${plan.updated.length} ažuriranih`)
    nav('/katalog', { replace: true })
  }

  const nothing = plan && !plan.added.length && !plan.updated.length && !toDelete.size

  return (
    <div className="page with-footer">
      <TopBar title="Uvezi katalog" back="/katalog" />

      <div className="notice blue">
        <Icon name="info" />
        <span className="grow">
          U Shopify-ju: <b>Products → Export → CSV for Excel or Numbers</b>. Dobijeni fajl (ili .zip raspakuj) izaberi ovde. Postojeći proizvodi se ažuriraju, novi se dodaju, ništa se ne
          briše bez tvoje potvrde.
        </span>
      </div>

      <label className="btn block primary mt" style={{ position: 'relative' }}>
        <Icon name="file" /> {fileName ? 'Izaberi drugi fajl' : 'Izaberi CSV fajl'}
        <input className="hidden-input" type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      {fileName && <p className="small muted right">{fileName}</p>}

      {error && (
        <div className="notice red mt">
          <Icon name="alert" />
          <span className="grow">{error}</span>
        </div>
      )}

      {plan && (
        <>
          <div className="section">
            <div className="card">
              <Switch
                checked={updateStock}
                onChange={setUpdateStock}
                label="Preuzmi i zalihu iz fajla"
                hint="Isključeno: zaliha u aplikaciji ostaje kakva jeste, menjaju se samo nazivi, cene i slike."
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div style={{ fontSize: 28, fontWeight: 800 }}>{plan.added.length}</div>
              <div className="small muted">novih proizvoda</div>
            </div>
            <div className="card" style={{ marginTop: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{plan.updated.length}</div>
              <div className="small muted">ažuriranih · {plan.unchanged} bez promene</div>
            </div>
          </div>

          {plan.added.length > 0 && (
            <div className="section">
              <div className="section-title">Novi</div>
              <div className="list">
                {plan.added.map((p) => (
                  <div className="list-row" key={p.id}>
                    {p.imageUrl ? <img className="thumb" src={p.imageUrl} alt="" loading="lazy" /> : <span className="thumb" />}
                    <div className="main">
                      <div className="title">{p.title}</div>
                      <div className="meta">
                        {p.variants.length} {plural(p.variants.length, 'varijanta', 'varijante', 'varijanti')}
                      </div>
                    </div>
                    <span className="badge green">novo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.updated.length > 0 && (
            <div className="section">
              <div className="section-title">Promene</div>
              <div className="list">
                {plan.updated.map((u) => (
                  <div className="list-row" key={u.before.id} style={{ alignItems: 'flex-start' }}>
                    {u.after.imageUrl ? <img className="thumb" src={u.after.imageUrl} alt="" loading="lazy" /> : <span className="thumb" />}
                    <div className="main">
                      <div className="title">{u.after.title}</div>
                      <div className="meta" style={{ whiteSpace: 'normal' }}>
                        {u.changes.slice(0, 4).join(' · ')}
                        {u.changes.length > 4 && ` · još ${u.changes.length - 4}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.missing.length > 0 && (
            <div className="section">
              <div className="section-title">Nema ih u fajlu</div>
              <div className="notice amber" style={{ marginBottom: 10 }}>
                <Icon name="alert" />
                <span className="grow">Ovi proizvodi postoje u aplikaciji, ali ne i u fajlu. Ostaju u katalogu, osim ako ih ne označiš za brisanje.</span>
              </div>
              <div className="list">
                {plan.missing.map((p) => (
                  <label className="list-row" key={p.id}>
                    <input
                      type="checkbox"
                      style={{ width: 24, height: 24 }}
                      checked={toDelete.has(p.id)}
                      onChange={(e) => {
                        const s = new Set(toDelete)
                        if (e.target.checked) s.add(p.id)
                        else s.delete(p.id)
                        setToDelete(s)
                      }}
                    />
                    <div className="main">
                      <div className="title">{p.title}</div>
                      <div className="meta">{toDelete.has(p.id) ? 'biće obrisan' : 'ostaje'}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="footer-bar">
            <button className="btn primary" style={{ flex: 1 }} onClick={apply} disabled={busy || !!nothing}>
              <Icon name="check" /> {nothing ? 'Katalog je već ažuran' : 'Primeni uvoz'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
