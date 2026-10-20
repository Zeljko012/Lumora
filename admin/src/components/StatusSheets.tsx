import { useState } from 'react'
import { Icon } from './Icon'
import { NumberField, Sheet, Switch } from './ui'
import { STATUSES } from '../lib/orders'
import { dateTime } from '../lib/format'
import type { OrderStatus, ReturnInfo, StatusChange } from '../types'

export function StatusPicker({
  current,
  history,
  exclude = [],
  title = 'Promeni status',
  onPick,
  onClose,
}: {
  current?: OrderStatus
  history?: StatusChange[]
  exclude?: OrderStatus[]
  title?: string
  onPick: (s: OrderStatus) => void
  onClose: () => void
}) {
  const lastAt = (s: OrderStatus) => {
    const h = history?.filter((x) => x.status === s).pop()
    return h ? dateTime(h.at) : ''
  }
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="status-list">
        {STATUSES.filter((s) => !exclude.includes(s.id)).map((s, idx) => (
          <button
            key={s.id}
            type="button"
            className={`status-opt ${current === s.id ? 'current' : ''}`}
            style={{ ['--c' as string]: `var(--st-${s.id})`, marginTop: idx === 5 ? 10 : 0 }}
            onClick={() => onPick(s.id)}
          >
            <span className="dot" />
            {s.label}
            {current === s.id ? <span className="when">trenutno</span> : <span className="when">{lastAt(s.id)}</span>}
          </button>
        ))}
      </div>
    </Sheet>
  )
}

const REASONS = ['Kupac nije preuzeo', 'Odbio paket', 'Pogrešna adresa', 'Oštećeno u transportu', 'Kupac se predomislio']

export function ReturnSheet({
  defaultCost,
  costHint,
  onConfirm,
  onClose,
}: {
  defaultCost: number
  costHint: string
  onConfirm: (r: Omit<ReturnInfo, 'at'>) => void
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [cost, setCost] = useState<number | null>(defaultCost)
  const [restocked, setRestocked] = useState(true)

  return (
    <Sheet
      title="Vraćena pošiljka"
      onClose={onClose}
      footer={
        <button className="btn primary block" style={{ ['--c' as string]: 'var(--st-vraceno)' }} onClick={() => onConfirm({ reason: reason.trim(), cost: cost ?? 0, restocked })}>
          <Icon name="check" /> Označi kao vraćeno
        </button>
      }
    >
      <div className="stack">
        <div className="field">
          <span>Razlog povrata</span>
          <div className="chips">
            {REASONS.map((r) => (
              <button key={r} type="button" className={`chip ${reason === r ? 'on' : ''}`} onClick={() => setReason(r)}>
                {r}
              </button>
            ))}
          </div>
          <input className="input" placeholder="ili upiši razlog…" value={REASONS.includes(reason) ? '' : reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <NumberField label="Trošak povrata" suffix="din" value={cost} onChange={setCost} hint={costHint} />
        <div className="card">
          <Switch checked={restocked} onChange={setRestocked} label="Proizvod je ispravan" hint="Vraća komade na zalihu." />
        </div>
      </div>
    </Sheet>
  )
}
