/** Mali grafikon bez osa — trend u jednoj liniji (kao u Shopify-ju). */
export function Spark({ values, height = 34, color = 'var(--brand)', fill = true }: { values: number[]; height?: number; color?: string; fill?: boolean }) {
  const w = 120
  const n = values.length
  if (n < 2) return <div className="spark spark-empty" style={{ height }} aria-hidden />
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const x = (i: number) => (i / (n - 1)) * w
  const y = (v: number) => height - 3 - ((v - min) / span) * (height - 6)
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ height }} aria-hidden>
      {fill && <path d={`${line} L${w} ${height} L0 ${height} Z`} fill={color} opacity={0.12} />}
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
