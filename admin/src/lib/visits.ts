// Statistika posete sajta (upisuje je server sajta, v. docs/supabase-visits.sql). Čita se samo uz prijavu vlasnika.
import { useEffect, useState } from 'react'
import { currentUserEmail, getClient } from './remote'

export interface VisitStats {
  visitors: number
  views: number
  live: number
  live_paths: { path: string; n: number }[]
  top_pages: { path: string; n: number }[]
  sources: { src: string; n: number }[]
  mobile: number
  desktop: number
}

type FakeWindow = Window & { __fakeVisits?: VisitStats | null }

export async function fetchVisitStats(from: number, to: number): Promise<VisitStats | null> {
  if (import.meta.env.DEV && (window as FakeWindow).__fakeVisits !== undefined) return (window as FakeWindow).__fakeVisits ?? null
  const c = getClient()
  if (!c || !(await currentUserEmail())) return null
  const { data, error } = await c.rpc('visit_stats', { p_from: new Date(from).toISOString(), p_to: new Date(to).toISOString() })
  return error || !data ? null : (data as VisitStats)
}

/** Brojevi posete za period; osvežava se na 30 sekundi dok je aplikacija vidljiva. null = nije dostupno (nije povezano ili SQL nije pušten). */
export function useVisitStats(from: number, to: number): VisitStats | null {
  const [stats, setStats] = useState<VisitStats | null>(null)
  useEffect(() => {
    let alive = true
    const load = () => {
      if (document.visibilityState === 'hidden') return
      void fetchVisitStats(from, Math.max(to, Date.now())).then((s) => alive && setStats(s))
    }
    load()
    const t = window.setInterval(load, 30_000)
    document.addEventListener('visibilitychange', load)
    return () => {
      alive = false
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', load)
    }
  }, [from, to])
  return stats
}

const PATH_NAMES: Record<string, string> = {
  '/': 'Početna',
  '/prodavnica': 'Prodavnica',
  '/korpa': 'Korpa',
  '/kasa': 'Kasa (poručivanje)',
  '/hvala': 'Hvala na porudžbini',
  '/kontakt': 'Kontakt',
  '/o-nama': 'O nama',
  '/vodic': 'Vodič',
  '/dostava-i-povracaj': 'Dostava i povraćaj',
  '/cesta-pitanja': 'Česta pitanja',
}

export function prettyPath(path: string): string {
  const p = path.replace(/\/+$/, '') || '/'
  if (PATH_NAMES[p]) return PATH_NAMES[p]
  const m = p.match(/^\/(proizvod|kategorija|vodic|pokloni|dekoracija)\/(.+)$/)
  if (m) {
    const label = { proizvod: 'Proizvod', kategorija: 'Kategorija', vodic: 'Vodič', pokloni: 'Pokloni', dekoracija: 'Dekoracija' }[m[1]]
    return `${label}: ${m[2].replace(/-/g, ' ')}`
  }
  return p
}
