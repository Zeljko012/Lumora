import { useMemo } from 'react'
import { useVisitStats, prettyPath } from '../lib/visits'
import { plural } from '../lib/format'

/** Kartica na početnoj: ko je sada na sajtu i koliko ljudi je danas bilo. Ne prikazuje se dok statistika nije dostupna. */
export function LiveSite({ ordersToday }: { ordersToday: number }) {
  const from = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }, [])
  const s = useVisitStats(from, Date.now())
  if (!s) return null
  const conv = s.visitors > 0 ? (ordersToday / s.visitors) * 100 : null
  return (
    <div className="card live-card">
      <div className="live-top">
        <span className={`live-dot ${s.live > 0 ? 'on' : ''}`} aria-hidden />
        <span className="live-now">
          {s.live > 0 ? (
            <>
              <b>{s.live}</b> {plural(s.live, 'posetilac je', 'posetioca su', 'posetilaca je')} sada na sajtu
            </>
          ) : (
            'Trenutno niko nije na sajtu'
          )}
        </span>
      </div>
      {s.live_paths.length > 0 && (
        <div className="small muted live-paths">{s.live_paths.map((p) => `${prettyPath(p.path)}${p.n > 1 ? ` ×${p.n}` : ''}`).join(' · ')}</div>
      )}
      <div className="live-stats">
        <span>
          <b>{s.visitors}</b> posetilaca danas
        </span>
        <span>
          <b>{s.views}</b> pregleda
        </span>
        {conv != null && (
          <span>
            <b>{conv.toFixed(1).replace('.', ',')}%</b> kupilo
          </span>
        )}
      </div>
    </div>
  )
}
