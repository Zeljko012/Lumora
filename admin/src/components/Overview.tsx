import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { Kpi } from './Kpi'
import { SalesChart, type Metric } from './SalesChart'
import { Heatmap } from './Heatmap'
import { RankList, pct } from './StatBits'
import { categoryLabel } from '../lib/catalog'
import { sourceLabel } from '../lib/orders'
import { categoryStats, customerStats, delta, heatmap, salesSeries, type Kpis, type Range } from '../lib/stats'
import { money, plural } from '../lib/format'
import type { Order, Product, Settings } from '../types'

type Stats = typeof import('../lib/stats')
interface Props {
  orders: Order[]
  products: Product[]
  cur: Range
  prev: Range
  k: Kpis
  kp: Kpis
  o: ReturnType<Stats['orderStats']>
  p: ReturnType<Stats['productStats']>
  c: ReturnType<Stats['customerStats']>
  settings: Settings
  onTab: (t: 'proizvodi' | 'kupci' | 'porudzbine') => void
}

/** "Pregled": isto što i početna strana Analytics u Shopify-ju — prodaja, porudžbine, kupci i trendovi. */
export function Overview({ orders, products, cur, prev, k, kp, o, p, c, settings, onTab }: Props) {
  const [metric, setMetric] = useState<Metric>('revenue')
  const [showPrev, setShowPrev] = useState(true)

  const cmp = useMemo(() => {
    const live = orders.filter((x) => !x.deletedAt)
    return {
      s: salesSeries(live, cur),
      sp: salesSeries(live, prev),
      cats: categoryStats(live, products, cur, categoryLabel),
      heat: heatmap(live, cur),
      cPrev: customerStats(live, prev),
    }
  }, [orders, products, cur, prev])

  const buyers = c.fresh + c.returning
  const buyersPrev = cmp.cPrev.fresh + cmp.cPrev.returning
  const returningPct = buyers ? (c.returning / buyers) * 100 : null
  const returningPrev = buyersPrev ? (cmp.cPrev.returning / buyersPrev) * 100 : null
  const rev = cmp.s.points.map((x) => x.revenue)
  const cnt = cmp.s.points.map((x) => x.orders)
  const showCost = k.izrada > 0

  return (
    <>
      <div className="kpi-grid">
        <Kpi hero label="Ukupna prodaja" value={money(k.promet)} delta={delta(k.promet, kp.promet)} sub={`${k.komada} kom`} spark={rev} />
        <Kpi label="Porudžbine" value={String(k.brojPorudzbina)} delta={delta(k.brojPorudzbina, kp.brojPorudzbina)} spark={cnt} />
        <Kpi label="Prosečna porudžbina" value={money(k.prosek)} delta={delta(k.prosek, kp.prosek)} />
        <Kpi label="Kupci" value={String(buyers)} delta={delta(buyers, buyersPrev)} sub={`${c.fresh} ${plural(c.fresh, 'nov', 'nova', 'novih')}`} />
        <Kpi
          label="Povratni kupci"
          value={pct(returningPct)}
          delta={returningPct != null && returningPrev != null ? delta(returningPct, returningPrev) : undefined}
          sub={`${c.returning} ${plural(c.returning, 'kupac', 'kupca', 'kupaca')}`}
        />
        <Kpi label="Stopa povrata" value={pct(o.returnRate)} sub={`${o.returned} od ${o.shipped} poslatih`} />
        {showCost ? (
          <Kpi label="Zarada posle izrade" value={money(k.zarada - k.izrada)} delta={delta(k.zarada - k.izrada, kp.zarada - kp.izrada)} sub={`izrada ${money(k.izrada)}`} />
        ) : (
          <Kpi label="Čista zarada" value={money(k.zarada)} delta={delta(k.zarada, kp.zarada)} sub="posle troškova" />
        )}
        <Kpi label="Naplaćeno" value={money(k.naplaceno)} delta={delta(k.naplaceno, kp.naplaceno)} />
      </div>
      {!showCost && (
        <Link to="/katalog" className="small muted" style={{ display: 'block', margin: '8px 4px 0', textDecoration: 'none' }}>
          💡 Upiši trošak izrade po proizvodu u Katalogu i ovde ćeš videti pravu zaradu posle materijala.
        </Link>
      )}

      <div className="section">
        <div className="card chart-card">
          <div className="chart-title" style={{ flexWrap: 'wrap' }}>
            <span>Prodaja tokom vremena</span>
            <span className="segmented" style={{ padding: 2, minWidth: 150 }}>
              <button type="button" className={metric === 'revenue' ? 'on' : ''} style={{ minHeight: 32, fontSize: 13 }} onClick={() => setMetric('revenue')}>
                Prodaja
              </button>
              <button type="button" className={metric === 'orders' ? 'on' : ''} style={{ minHeight: 32, fontSize: 13 }} onClick={() => setMetric('orders')}>
                Porudžbine
              </button>
            </span>
          </div>
          <SalesChart cur={cmp.s.points} prev={cmp.sp.points} metric={metric} showPrev={showPrev} />
          <label className="switch" style={{ minHeight: 40, padding: '0 4px' }}>
            <span className="label small muted">Uporedi sa prethodnim periodom</span>
            <input type="checkbox" role="switch" checked={showPrev} onChange={(e) => setShowPrev(e.target.checked)} />
          </label>
        </div>
      </div>

      <div className="section">
        <RankList
          title="Najprodavaniji proizvodi"
          limit={5}
          rows={[...p.products]
            .sort((a, b) => b.revenue - a.revenue)
            .map((r) => ({ key: r.key, label: r.label, value: r.revenue, display: money(r.revenue), extra: `${r.pcs} kom` }))}
        />
        <button type="button" className="link-btn" style={{ margin: '6px 4px 0' }} onClick={() => onTab('proizvodi')}>
          Svi proizvodi i zaliha →
        </button>
      </div>

      <div className="section">
        <RankList title="Prodaja po kategoriji" rows={cmp.cats.map((r) => ({ key: r.key || 'x', label: r.label, value: r.revenue, display: money(r.revenue), extra: `${r.pcs} kom` }))} />
      </div>

      <div className="section">
        <RankList title="Prodaja po boji" rows={p.colors.map((r) => ({ key: r.key, label: r.label, value: r.pcs, display: `${r.pcs} kom`, extra: money(r.revenue) }))} limit={7} />
      </div>

      <div className="section">
        <RankList
          title="Prodajni kanal"
          rows={o.sources.map((s) => ({ key: s.source, label: sourceLabel(s.source), value: s.revenue, display: money(s.revenue), extra: `${s.count} ${plural(s.count, 'porudžbina', 'porudžbine', 'porudžbina')}` }))}
        />
      </div>

      <div className="section">
        <div className="card">
          <div className="chart-title">
            <span>Kada kupci poručuju</span>
            <span className="muted small">dan × sat</span>
          </div>
          <Heatmap grid={cmp.heat} />
        </div>
      </div>

      <div className="section">
        <RankList
          title="Gradovi sa najviše porudžbina"
          limit={6}
          rows={c.citiesByOrders.map((x) => ({ key: x.city, label: x.city, value: x.orders, display: String(x.orders), extra: money(x.revenue) }))}
        />
        <button type="button" className="link-btn" style={{ margin: '6px 4px 0' }} onClick={() => onTab('kupci')}>
          Najbolji kupci →
        </button>
      </div>

      <div className="section">
        <div className="card">
          <div className="chart-title">
            <span>Poseta sajta</span>
            <span className="muted small">posetioci i konverzija</span>
          </div>
          <p className="small muted" style={{ margin: '0 0 10px' }}>
            Broj posetilaca, odakle dolaze i koliko njih kupi se meri na samom sajtu, a ne u porudžbinama. Besplatna statistika bez kolačića (Cloudflare Web Analytics ili Umami) daje taj deo slike.
          </p>
          {settings.trafficUrl ? (
            <a className="btn brand block" href={settings.trafficUrl} target="_blank" rel="noopener">
              <Icon name="globe" /> Otvori statistiku posete
            </a>
          ) : (
            <Link className="btn block" to="/podesavanja">
              <Icon name="settings" /> Poveži statistiku posete
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
