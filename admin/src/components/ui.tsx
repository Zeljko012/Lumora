import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { swatch } from '../lib/colors'

export function TopBar({ title, sub, back, right }: { title: string; sub?: string; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="topbar">
      {back && (
        <button className="icon-btn" aria-label="Nazad" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}>
          <Icon name="back" />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
    </header>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; suffix?: string; uncertain?: boolean }

export function Field({ label, hint, suffix, uncertain, className, ...rest }: InputProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <input className={`input ${suffix ? 'with-suffix' : ''} ${uncertain ? 'uncertain' : ''} ${className ?? ''}`} {...rest} />
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
      {hint && <small>{hint}</small>}
    </label>
  )
}

/** Brojčano polje koje dozvoljava prazno dok kucaš. */
export function NumberField({ value, onChange, ...rest }: Omit<InputProps, 'value' | 'onChange'> & { value: number | null; onChange: (n: number | null) => void }) {
  const [text, setText] = useState(value == null ? '' : String(value))
  useEffect(() => {
    if ((text === '' ? null : Number(text.replace(',', '.'))) !== value) setText(value == null ? '' : String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return (
    <Field
      {...rest}
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d.,-]/g, '')
        setText(t)
        const n = Number(t.replace(',', '.'))
        onChange(t === '' || t === '-' || !Number.isFinite(n) ? null : n)
      }}
    />
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="radiogroup">
      {options.map((o) => (
        <button type="button" key={o.id} role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="switch">
      <span className="label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export function Stepper({ value, onChange, min = 1 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="stepper">
      <button type="button" aria-label="Manje" onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon name="minus" />
      </button>
      <output>{value}</output>
      <button type="button" aria-label="Više" onClick={() => onChange(value + 1)}>
        <Icon name="plus" />
      </button>
    </div>
  )
}

export function ColorDot({ color }: { color: string }) {
  const c = swatch(color)
  if (!c) return null
  return <span className="dot" style={{ background: c }} />
}

let openSheets = 0

export function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    openSheets++
    document.body.style.overflow = 'hidden'
    return () => {
      openSheets = Math.max(0, openSheets - 1)
      if (!openSheets) document.body.style.overflow = ''
    }
  }, [])
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Zatvori" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  )
}

/* ---------- potvrde i kratka obaveštenja ---------- */

interface ConfirmOpts {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

const UiCtx = createContext<{ confirm: (o: ConfirmOpts) => Promise<boolean>; toast: (msg: string) => void }>({
  confirm: async () => false,
  toast: () => {},
})

export const useUi = () => useContext(UiCtx)

export function UiProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const timer = useRef<number>(undefined)

  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), [])
  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const close = (v: boolean) => {
    dialog?.resolve(v)
    setDialog(null)
  }

  // dugme "nazad" na telefonu zatvara otvoren dijalog kao "Odustani"
  useEffect(() => {
    if (!dialog) return
    const onNav = () => close(false)
    window.addEventListener('hashchange', onNav)
    return () => window.removeEventListener('hashchange', onNav)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog])

  return (
    <UiCtx.Provider value={{ confirm, toast }}>
      {children}
      {dialog && (
        <div className="overlay dialog-wrap" onClick={() => close(false)}>
          <div className="dialog" role="alertdialog" onClick={(e) => e.stopPropagation()}>
            <h2>{dialog.title}</h2>
            {dialog.message && <p>{dialog.message}</p>}
            <div className="btn-row">
              <button className="btn" onClick={() => close(false)}>
                {dialog.cancelText ?? 'Odustani'}
              </button>
              <button className={`btn ${dialog.danger ? 'danger solid' : 'primary'}`} onClick={() => close(true)} autoFocus>
                {dialog.confirmText ?? 'U redu'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toastMsg && (
        <div className="toast" role="status">
          {toastMsg}
        </div>
      )}
    </UiCtx.Provider>
  )
}
