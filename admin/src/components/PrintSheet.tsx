import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Segmented, Sheet, useUi } from './ui'
import { getSettings, saveSettings } from '../db'
import { plural } from '../lib/format'
import type { LabelFormat, Order } from '../types'
import type { PrintWhat } from '../lib/pdf'

/** Prikaz gotovog PDF-a: otvori (pa odštampaj iz pregledača) ili podeli (Viber, Drive, aplikacija štampača…). */
export function PdfReady({ blob, name, onClose }: { blob: Blob; name: string; onClose: () => void }) {
  const { toast } = useUi()
  const [url] = useState(() => URL.createObjectURL(blob))
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  const file = new File([blob], name, { type: 'application/pdf' })
  const canShare = !!navigator.canShare?.({ files: [file] })

  const open = () => {
    const w = window.open(url, '_blank')
    if (!w) {
      // blokiran popup — preuzmi fajl
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
    }
  }
  const share = async () => {
    try {
      await navigator.share({ files: [file], title: name })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast('Deljenje nije uspelo')
    }
  }
  const download = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
  }

  return (
    <Sheet title="PDF je spreman" onClose={onClose}>
      <div className="notice green" style={{ marginBottom: 14 }}>
        <Icon name="check" />
        <span className="grow">
          <b>{name}</b>
          <br />
          {(blob.size / 1024).toFixed(0)} KB
        </span>
      </div>
      <div className="stack">
        <button className="btn primary block" onClick={open}>
          <Icon name="file" /> Otvori PDF
        </button>
        {canShare && (
          <button className="btn block" onClick={share}>
            <Icon name="upload" /> Podeli / pošalji na štampač
          </button>
        )}
        <button className="btn block" onClick={download}>
          <Icon name="download" /> Sačuvaj fajl
        </button>
      </div>
      <p className="small muted mt">
        Na telefonu: otvori PDF i izaberi „Štampaj“ iz menija, ili ga podeli aplikaciji tvog termalnog štampača. Za termalni štampač podesi papir 100×150 mm i razmeru „100%“ (bez
        uklapanja).
      </p>
    </Sheet>
  )
}

export function PrintSheet({ orders, onClose }: { orders: Order[]; onClose: () => void }) {
  const { toast } = useUi()
  const [format, setFormat] = useState<LabelFormat>('a6')
  const [what, setWhat] = useState<PrintWhat>('labels')
  const [startAt, setStartAt] = useState(1)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null)

  useEffect(() => {
    getSettings().then((s) => setFormat(s.labelFormat ?? 'a6'))
  }, [])

  const make = async () => {
    setBusy(true)
    try {
      const s = await getSettings()
      if (s.labelFormat !== format) await saveSettings({ labelFormat: format })
      if (!s.sender.name && what !== 'packing') toast('Savet: upiši svoje podatke u Podešavanjima')
      const { buildOrdersPdf } = await import('../lib/pdf')
      const sorted = [...orders].sort((a, b) => a.number - b.number)
      const blob = await buildOrdersPdf(sorted, s, { what, format, startAt })
      const kind = what === 'labels' ? 'nalepnice' : what === 'packing' ? 'pakovanje' : 'nalepnice-pakovanje'
      const name = sorted.length === 1 ? `${kind}-${sorted[0].number}.pdf` : `${kind}-${sorted.length}-kom-${new Date().toISOString().slice(0, 10)}.pdf`
      setResult({ blob, name })
    } catch (e) {
      toast((e as Error).message || 'PDF nije napravljen')
    } finally {
      setBusy(false)
    }
  }

  if (result) return <PdfReady blob={result.blob} name={result.name} onClose={onClose} />

  const n = orders.length
  return (
    <Sheet
      title={n === 1 ? `Štampa #${orders[0].number}` : `Štampa ${n} ${plural(n, 'porudžbine', 'porudžbine', 'porudžbina')}`}
      onClose={onClose}
      footer={
        <button className="btn primary block" onClick={make} disabled={busy || n === 0}>
          <Icon name="file" /> {busy ? 'Pravim PDF…' : 'Napravi PDF'}
        </button>
      }
    >
      <div className="stack">
        <div className="field">
          <span>Šta štampam</span>
          <Segmented
            value={what}
            onChange={setWhat}
            options={[
              { id: 'labels', label: 'Nalepnice' },
              { id: 'packing', label: 'Pakovanje' },
              { id: 'both', label: 'Oba' },
            ]}
          />
        </div>
        <div className="field">
          <span>Papir</span>
          <Segmented
            value={format}
            onChange={setFormat}
            options={[
              { id: 'a6', label: 'Termalni 100×150' },
              { id: 'a4x4', label: 'A4 (4 po strani)' },
            ]}
          />
          <small>{format === 'a6' ? 'Jedna nalepnica po listu.' : 'Četiri nalepnice na A4 listu, sa linijama za sečenje. Lista za pakovanje ide na ceo A4.'}</small>
        </div>
        {format === 'a4x4' && what !== 'packing' && (
          <div className="field">
            <span>Počni od mesta na listu</span>
            <div className="a4-picker" role="radiogroup" aria-label="Početno mesto na A4 listu">
              {[1, 2, 3, 4].map((i) => (
                <button key={i} type="button" role="radio" aria-checked={startAt === i} className={startAt === i ? 'on' : i < startAt ? 'used' : ''} onClick={() => setStartAt(i)}>
                  {i}
                </button>
              ))}
            </div>
            <small>Ako si već iskoristio deo lista sa nalepnicama, izaberi prvo slobodno mesto.</small>
          </div>
        )}
      </div>
    </Sheet>
  )
}
