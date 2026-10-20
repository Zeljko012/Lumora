import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS, getSettings } from '../db'
import { Icon } from '../components/Icon'
import { Switch, TopBar, useUi } from '../components/ui'
import { PdfReady } from '../components/PrintSheet'
import { StatusBadge } from '../components/OrderBits'
import { changeStatus, codAmount, sentAt } from '../lib/orders'
import { money, plural } from '../lib/format'

const pad = (n: number) => String(n).padStart(2, '0')
const toInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function HandoverPage() {
  const { toast } = useUi()
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const orders = useLiveQuery(() => db.orders.where('status').anyOf('spakovano', 'poslato', 'isporuceno', 'naplaceno').toArray(), [])
  const [day, setDay] = useState(() => toInput(new Date()))
  const [courierId, setCourierId] = useState('')
  const [picked, setPicked] = useState<Set<string> | null>(null)
  const [markSent, setMarkSent] = useState(true)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null)

  useEffect(() => {
    if (!courierId && settings.defaultCourierId) setCourierId(settings.defaultCourierId)
  }, [settings.defaultCourierId, courierId])

  const isToday = day === toInput(new Date())
  const candidates = useMemo(() => {
    const [y, m, d] = day.split('-').map(Number)
    const start = new Date(y, m - 1, d).getTime()
    const end = start + 86400000
    return (orders ?? [])
      .filter((o) => !o.deletedAt && o.courierId === courierId)
      .filter((o) => {
        // spakovane (spremne za predaju) nude se samo za današnji dan; poslate po datumu slanja
        if (o.status === 'spakovano') return isToday
        const at = sentAt(o)
        return at != null && at >= start && at < end
      })
      .sort((a, b) => a.number - b.number)
  }, [orders, courierId, day, isToday])

  // podrazumevano su sve izabrane; ponovo kad se promeni dan ili kurir
  useEffect(() => setPicked(null), [day, courierId])
  const sel = picked ?? new Set(candidates.map((o) => o.id))
  const chosen = candidates.filter((o) => sel.has(o.id))
  const sum = chosen.reduce((s, o) => s + codAmount(o), 0)
  const packedCount = chosen.filter((o) => o.status === 'spakovano').length
  const courierName = settings.couriers.find((c) => c.id === courierId)?.name ?? ''

  const toggle = (id: string) => {
    const n = new Set(sel)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    setPicked(n)
  }

  const make = async () => {
    setBusy(true)
    try {
      const s = await getSettings()
      if (markSent && packedCount) {
        for (const o of chosen.filter((x) => x.status === 'spakovano')) await changeStatus(o, 'poslato')
        toast(`${packedCount} ${plural(packedCount, 'porudžbina označena', 'porudžbine označene', 'porudžbina označeno')} kao poslato`)
      }
      const { buildHandoverPdf } = await import('../lib/pdf')
      const [y, m, d] = day.split('-').map(Number)
      const blob = await buildHandoverPdf(chosen, s, courierName, new Date(y, m - 1, d))
      setResult({ blob, name: `predaja-${courierName.toLowerCase().replace(/\s+/g, '-')}-${day}.pdf` })
    } catch (e) {
      toast((e as Error).message || 'PDF nije napravljen')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page with-footer">
      <TopBar title="Spisak za kurira" back />

      <div className="card stack">
        <div className="stack">
          <label className="field">
            <span>Dan</span>
            <input className="input" type="date" value={day} onChange={(e) => e.target.value && setDay(e.target.value)} />
          </label>
          <label className="field">
            <span>Kurir</span>
            <select className="select" value={courierId} onChange={(e) => setCourierId(e.target.value)}>
              {settings.couriers
                .filter((c) => c.active || c.id === courierId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {packedCount > 0 && (
          <Switch checked={markSent} onChange={setMarkSent} label={`Označi ${packedCount} spakovanih kao „Poslato“`} hint="Pri pravljenju spiska, jer ih predaješ kuriru." />
        )}
      </div>

      <div className="section">
        <div className="section-title">
          <span className="grow">Pošiljke</span>
          <span style={{ textTransform: 'none', letterSpacing: 0 }}>
            {chosen.length} · {money(sum)}
          </span>
        </div>
        {candidates.length === 0 ? (
          <div className="empty">
            <Icon name="truck" />
            <h2>Nema pošiljaka</h2>
            <p>{isToday ? 'Nema spakovanih ni poslatih pošiljaka za ovog kurira danas.' : 'Tog dana ništa nije poslato preko ovog kurira.'}</p>
          </div>
        ) : (
          <div className="list">
            {candidates.map((o) => (
              <label className="list-row" key={o.id}>
                <input type="checkbox" style={{ width: 24, height: 24, accentColor: 'var(--ink)' }} checked={sel.has(o.id)} onChange={() => toggle(o.id)} />
                <div className="main">
                  <div className="title">
                    #{o.number} · {o.customer.name}
                  </div>
                  <div className="meta">
                    {o.customer.city}
                    {o.tracking ? ` · ${o.tracking}` : ''}
                  </div>
                </div>
                <div style={{ display: 'grid', justifyItems: 'end', gap: 4 }}>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{codAmount(o) ? money(codAmount(o)) : 'uplaćeno'}</strong>
                  <StatusBadge status={o.status} />
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="footer-bar">
        <div className="sum">
          <small>Ukupna otkupnina</small>
          <strong>{money(sum)}</strong>
        </div>
        <button className="btn primary" onClick={make} disabled={busy || chosen.length === 0}>
          <Icon name="printer" /> Napravi spisak
        </button>
      </div>

      {result && <PdfReady blob={result.blob} name={result.name} onClose={() => setResult(null)} />}
    </div>
  )
}
