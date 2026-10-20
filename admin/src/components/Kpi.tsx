import { Spark } from './Spark'

const pctFmt = new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 0, signDisplay: 'always' })

/** Kartica sa glavnim brojem i promenom u odnosu na prethodni period. */
export function Kpi({
  label,
  value,
  delta,
  goodWhenUp = true,
  sub,
  hero,
  spark,
}: {
  label: string
  value: string
  delta?: number | null
  goodWhenUp?: boolean
  sub?: string
  hero?: boolean
  /** mali trend ispod broja */
  spark?: number[]
}) {
  let tone = 'flat'
  if (delta != null && Math.abs(delta) >= 0.5) tone = delta > 0 === goodWhenUp ? 'up' : 'down'
  return (
    <div className={`kpi ${hero ? 'hero' : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-foot">
        {delta === undefined ? null : delta === null ? (
          <span className="kpi-delta flat">novo</span>
        ) : (
          <span className={`kpi-delta ${tone}`} aria-label={`${pctFmt.format(delta)} posto u odnosu na prethodni period`}>
            {delta > 0.5 ? '▲' : delta < -0.5 ? '▼' : '•'} {pctFmt.format(delta)}%
          </span>
        )}
        {sub && <span className="kpi-sub">{sub}</span>}
      </div>
      {spark && spark.length > 1 && <Spark values={spark} color={hero ? '#ffffff' : 'var(--brand)'} height={hero ? 44 : 30} />}
    </div>
  )
}
