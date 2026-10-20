import { Component, useEffect, useState, type ReactNode } from 'react'
import { db } from '../db'

const RELOAD_KEY = 'porudzbine.autoReload'

/** Greške posle kojih je dovoljno osvežiti stranicu (podaci su sačuvani na telefonu). */
function isRecoverable(msg: string) {
  return /Indexed ?Database|IDBDatabase|DatabaseClosed|InvalidState|connection.*lost|dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoad/i.test(msg)
}

/** Osvežava stranicu, ali najviše jednom u 20 sekundi (da ne uđe u petlju). */
export function safeReload() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 20000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    /* bez sessionStorage-a samo osveži */
  }
  location.reload()
  return true
}

/** Hvata greške u prikazu: umesto praznog ekrana pokazuje poruku i dugme "Osveži". */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    if (isRecoverable(`${error.name} ${error.message}`)) safeReload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="page">
        <div className="empty">
          <h2>Ekran se nije učitao</h2>
          <p>Tvoji podaci su sačuvani. Dodirni „Osveži“ i nastavi.</p>
          <button className="btn primary" onClick={() => location.reload()}>
            Osveži aplikaciju
          </button>
          <p className="small muted mt" style={{ wordBreak: 'break-word' }}>
            Detalji za proveru: {error.name}: {error.message}
          </p>
        </div>
      </div>
    )
  }
}

/**
 * Kad se aplikacija vrati iz pozadine, proveri da li baza i dalje radi.
 * iPhone (a ponekad i Android) zna da prekine vezu sa bazom dok je aplikacija u pozadini;
 * tada ekrani ostanu prazni dok se stranica ne osveži.
 */
/** Proverava da li baza odgovara; ako ne, osvežava stranicu (podaci ostaju sačuvani na telefonu). */
export async function checkDb() {
  try {
    await Promise.race([db.settings.get('main'), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2500))])
    return true
  } catch {
    if (safeReload()) return false
    // osvežavanje je već probano pre manje od 20 s — pokušaj samo ponovo otvoriti bazu
    try {
      db.close()
      await db.open()
    } catch {
      /* ostaje poruka na ekranu */
    }
    return false
  }
}

export function useDbWatchdog() {
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkDb()
    }
    const onShow = () => checkDb()
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as Error | undefined
      if (r && isRecoverable(`${r.name} ${r.message}`)) checkDb()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onShow)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onShow)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
}

/** Prikazuje "Učitavam…" ako učitavanje traje duže od trenutka, umesto praznog ekrana. */
export function Loading() {
  const [show, setShow] = useState(false)
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setShow(true), 400)
    // učitavanje iz lokalne baze traje delić sekunde; ako visi, veza sa bazom je verovatno prekinuta
    const b = setTimeout(() => checkDb(), 2000)
    const c = setTimeout(() => setSlow(true), 5000)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
      clearTimeout(c)
    }
  }, [])
  if (!show) return null
  return (
    <div className="page">
      <div className="empty">
        <p>Učitavam…</p>
        {slow && (
          <button className="btn" onClick={() => location.reload()}>
            Traje predugo? Osveži
          </button>
        )}
      </div>
    </div>
  )
}
