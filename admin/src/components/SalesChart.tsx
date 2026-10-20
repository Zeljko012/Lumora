import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SeriesPoint } from '../lib/stats'
import { money } from '../lib/format'

export type Metric = 'revenue' | 'orders'
const BRAND = '#4f6f63'

const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k`.replace('.', ',') : String(n))

/** Prodaja kroz vreme, sa isprekidanom linijom prethodnog perioda (kao Shopify). */
export function SalesChart({ cur, prev, metric, showPrev }: { cur: SeriesPoint[]; prev: SeriesPoint[]; metric: Metric; showPrev: boolean }) {
  const data = cur.map((p, i) => ({ label: p.label, cur: p[metric], prev: showPrev ? (prev[i]?.[metric] ?? null) : null, prevLabel: prev[i]?.label }))
  const total = data.reduce((s, d) => s + d.cur, 0)
  if (total === 0 && !data.some((d) => d.prev)) {
    return (
      <p className="small muted" style={{ margin: '28px 0', textAlign: 'center' }}>
        Nema prodaje u ovom periodu.
      </p>
    )
  }
  const fmt = (v: number) => (metric === 'revenue' ? money(v) : `${v} por.`)
  return (
    <div style={{ height: 210 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="g-cur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: 'var(--line-strong)' }} tick={{ fontSize: 11, fill: 'var(--muted)' }} interval="preserveStartEnd" minTickGap={18} />
          <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={44} tickFormatter={(v) => (metric === 'revenue' ? compact(v) : String(v))} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as (typeof data)[number]
              return (
                <div className="chart-tip">
                  <div className="muted small">{d.label}</div>
                  <strong>{fmt(d.cur)}</strong>
                  {showPrev && d.prev != null && (
                    <div className="muted small">
                      {d.prevLabel}: {fmt(d.prev)}
                    </div>
                  )}
                </div>
              )
            }}
          />
          {showPrev && <Line type="monotone" dataKey="prev" stroke="#a79f90" strokeDasharray="4 4" strokeWidth={1.8} dot={false} isAnimationActive={false} connectNulls />}
          <Area type="monotone" dataKey="cur" stroke={BRAND} strokeWidth={2.4} fill="url(#g-cur)" dot={data.length <= 14 ? { r: 2.5, fill: BRAND, strokeWidth: 0 } : false} activeDot={{ r: 4 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
