import { Bar as RBar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Bar } from '../lib/stats'
import { money } from '../lib/format'
export { Kpi } from './Kpi'

const BAR_COLOR = '#4f6f63'

/** Jednoserijski stubičasti grafikon (broj porudžbina) sa oblačićem na dodir. */
export function BarsCard({ title, data, height = 180, every }: { title: string; data: Bar[]; height?: number; every?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="card chart-card">
      <div className="chart-title">
        <span>{title}</span>
        <span className="muted small">ukupno {total}</span>
      </div>
      {total === 0 ? (
        <p className="small muted" style={{ margin: '24px 0', textAlign: 'center' }}>
          Nema porudžbina u ovom periodu.
        </p>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }} barCategoryGap="18%">
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--line-strong)' }} tick={{ fontSize: 11, fill: 'var(--muted)' }} interval={every ?? 'preserveStartEnd'} minTickGap={6} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={40} />
              <Tooltip
                cursor={{ fill: 'rgb(28 26 23 / 6%)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload as Bar
                  return (
                    <div className="chart-tip">
                      <div className="muted small">
                        {d.label} {d.hint ?? ''}
                      </div>
                      <strong>
                        {d.value} {d.value === 1 ? 'porudžbina' : d.value >= 2 && d.value <= 4 ? 'porudžbine' : 'porudžbina'}
                      </strong>
                    </div>
                  )
                }}
              />
              <RBar dataKey="value" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/** Rang-lista sa vodoravnim trakama (proizvodi, gradovi, izvori). */
export function RankList({
  title,
  rows,
  empty = 'Nema podataka u ovom periodu.',
  limit = 8,
}: {
  title: string
  rows: { key: string; label: string; sub?: string; value: number; display: string; extra?: string; onClick?: () => void }[]
  empty?: string
  limit?: number
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  const shown = rows.slice(0, limit)
  return (
    <div className="card">
      <div className="chart-title">
        <span>{title}</span>
      </div>
      {shown.length === 0 ? (
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          {empty}
        </p>
      ) : (
        <ol className="rank">
          {shown.map((r, i) => {
            const body = (
              <>
                <span className="rank-n">{i + 1}</span>
                <span className="rank-main">
                  <span className="rank-top">
                    <span className="rank-label">
                      {r.label}
                      {r.sub && <span className="muted"> · {r.sub}</span>}
                    </span>
                    <span className="rank-val">{r.display}</span>
                  </span>
                  <span className="rank-bar">
                    <i style={{ width: `${(r.value / max) * 100}%` }} />
                  </span>
                  {r.extra && <span className="rank-extra">{r.extra}</span>}
                </span>
              </>
            )
            return (
              <li key={r.key}>
                {r.onClick ? (
                  <button type="button" className="rank-row" onClick={r.onClick}>
                    {body}
                  </button>
                ) : (
                  <div className="rank-row">{body}</div>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {rows.length > limit && <p className="small muted" style={{ margin: '6px 0 0' }}>+ još {rows.length - limit}</p>}
    </div>
  )
}

export const days = (d: number | null) => (d == null ? '—' : d < 1 ? `${Math.round(d * 24)} h` : `${d.toFixed(1).replace('.', ',')} d`)
export const pct = (p: number | null) => (p == null ? '—' : `${p.toFixed(1).replace('.', ',')}%`)
export { money }
