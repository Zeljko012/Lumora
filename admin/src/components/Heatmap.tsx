const DAYS = ['pon', 'uto', 'sre', 'čet', 'pet', 'sub', 'ned']

/** Kada kupci poručuju: dan u nedelji × sat. Tamnije = više porudžbina. */
export function Heatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat())
  const total = grid.flat().reduce((s, v) => s + v, 0)
  if (total === 0) {
    return (
      <p className="small muted" style={{ margin: '16px 0', textAlign: 'center' }}>
        Nema porudžbina u ovom periodu.
      </p>
    )
  }
  return (
    <div className="heat" role="img" aria-label="Broj porudžbina po danu u nedelji i satu">
      {grid.map((row, d) => (
        <div className="heat-row" key={d}>
          <span className="heat-day">{DAYS[d]}</span>
          {row.map((v, h) => (
            <i
              key={h}
              title={`${DAYS[d]} ${h}:00 — ${v}`}
              style={{ background: v ? `color-mix(in srgb, var(--brand) ${Math.round(18 + (v / max) * 82)}%, var(--surface))` : 'var(--surface-2)' }}
            />
          ))}
        </div>
      ))}
      <div className="heat-row heat-axis">
        <span className="heat-day" />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h}>{h % 6 === 0 ? h : ''}</span>
        ))}
      </div>
    </div>
  )
}
