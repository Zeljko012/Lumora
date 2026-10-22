import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Kpi } from './Kpi'
import { RankList } from './StatBits'
import { useVisitStats, prettyPath } from '../lib/visits'
import type { Settings } from '../types'

/** "Poseta sajta" u Analitici: posetioci, pregledi, konverzija, najgledanije stranice i odakle dolaze. */
export function TrafficCard({ from, to, orders, settings }: { from: number; to: number; orders: number; settings: Settings }) {
  const s = useVisitStats(from, to)

  if (!s) {
    return (
      <div className="card">
        <div className="chart-title">
          <span>Poseta sajta</span>
          <span className="muted small">posetioci i konverzija</span>
        </div>
        <p className="small muted" style={{ margin: '0 0 10px' }}>
          Statistika posete se prikazuje čim je aplikacija povezana sa sajtom (Podešavanja → Povezivanje sa sajtom) i pusti se SQL za posetu (docs/supabase-visits.sql).
        </p>
        {settings.trafficUrl ? (
          <a className="btn brand block" href={settings.trafficUrl} target="_blank" rel="noopener">
            <Icon name="globe" /> Otvori statistiku posete
          </a>
        ) : (
          <Link className="btn block" to="/podesavanja">
            <Icon name="settings" /> Podešavanja
          </Link>
        )}
      </div>
    )
  }

  const conv = s.visitors > 0 ? (orders / s.visitors) * 100 : null
  const devices = s.mobile + s.desktop
  const sourceLabel = (src: string) => (src === 'direktno' ? 'Direktno (upisana adresa, Viber…)' : src)
  return (
    <>
      <div className="kpi-grid">
        <Kpi label="Posetioci" value={String(s.visitors)} sub={`${s.views} pregleda`} />
        <Kpi label="Kupilo" value={conv == null ? '—' : `${conv.toFixed(1).replace('.', ',')}%`} sub={`${orders} porudžbina`} />
      </div>
      {devices > 0 && (
        <p className="small muted" style={{ margin: '8px 4px 0' }}>
          Telefon {Math.round((s.mobile / devices) * 100)}% · računar {Math.round((s.desktop / devices) * 100)}%
        </p>
      )}
      <div className="stack mt-lg">
        <RankList title="Najgledanije stranice" limit={6} rows={s.top_pages.map((p) => ({ key: p.path, label: prettyPath(p.path), value: p.n, display: String(p.n) }))} />
        <RankList title="Odakle dolaze" limit={6} rows={s.sources.map((x) => ({ key: x.src, label: sourceLabel(x.src), value: x.n, display: String(x.n) }))} />
      </div>
      {settings.trafficUrl && (
        <a className="btn block mt-lg" href={settings.trafficUrl} target="_blank" rel="noopener">
          <Icon name="globe" /> Detaljnija statistika
        </a>
      )}
    </>
  )
}
