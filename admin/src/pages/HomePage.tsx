import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, DEFAULT_SETTINGS } from '../db'
import { Icon } from '../components/Icon'
import { TopBar, useUi } from '../components/ui'
import { OrderCard } from '../components/OrderBits'
import { Kpi } from '../components/Kpi'
import { Spark } from '../components/Spark'
import { Loading } from '../components/Guard'
import { awaitingPayment, delta, kpis, lastDaysRevenue, periodRanges } from '../lib/stats'
import { codAmount, lowStockVariants, unpaidOverdue } from '../lib/orders'
import { dateShort, money, plural } from '../lib/format'
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from '../lib/install'
import { removeDemoData } from '../lib/demo'
import { getInboxStatus, onInboxStatus } from '../lib/inbox'
import { LiveSite } from '../components/LiveSite'

const pct = new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 0, signDisplay: 'always' })

function greeting(h: number) {
  if (h < 5) return 'Dobro veče'
  if (h < 11) return 'Dobro jutro'
  if (h < 18) return 'Dobar dan'
  return 'Dobro veče'
}

const LAST_BACKUP = 'lumora.lastBackup'
const INSTALL_DISMISSED = 'lumora.installDismissed'

function useInstallState() {
  const [, force] = useState(0)
  useEffect(() => onInstallChange(() => force((n) => n + 1)), [])
  return { canPrompt: canPromptInstall(), standalone: isStandalone(), ios: isIos() }
}

export default function HomePage() {
  const orders = useLiveQuery(() => db.orders.toArray(), [])
  const products = useLiveQuery(() => db.products.toArray(), [])
  const expenses = useLiveQuery(() => db.expenses.toArray(), [])
  const settings = useLiveQuery(() => db.settings.get('main'), []) ?? DEFAULT_SETTINGS
  const { confirm, toast } = useUi()
  const inbox = useSyncExternalStore(onInboxStatus, getInboxStatus)
  const install = useInstallState()
  const [installHidden, setInstallHidden] = useState(() => {
    try {
      return localStorage.getItem(INSTALL_DISMISSED) === '1'
    } catch {
      return false
    }
  })

  const d = useMemo(() => {
    if (!orders || !products || !expenses) return null
    const live = orders.filter((o) => !o.deletedAt)
    const by = (s: string) => live.filter((o) => o.status === s)
    const today = periodRanges('danas')
    const month = periodRanges('mesec')
    const wait = awaitingPayment(live)
    const sent = by('poslato')
    const overdue = live.filter((o) => unpaidOverdue(o, settings.unpaidAlertDays) != null).length
    return {
      live,
      nova: by('nova').length,
      spakovano: by('spakovano').length,
      poslato: sent.length,
      poslatoCod: sent.reduce((s, o) => s + codAmount(o), 0),
      isporuceno: by('isporuceno').length,
      wait,
      overdue,
      kToday: kpis(live, [], today.cur),
      kYesterday: kpis(live, [], today.prev),
      kMonth: kpis(live, expenses, month.cur, products),
      kMonthPrev: kpis(live, expenses, month.prev, products),
      series: lastDaysRevenue(live, 14),
      recent: [...live].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
      demoCount: live.filter((o) => o.demo).length,
      realCount: live.filter((o) => !o.demo).length,
      lowStock: lowStockVariants(products, settings.lowStockThreshold).length,
    }
  }, [orders, products, expenses, settings.unpaidAlertDays, settings.lowStockThreshold])

  if (!d) return <Loading />

  const senderMissing = !settings.sender.name || !settings.sender.phone
  const courierName = (id: string) => settings.couriers.find((c) => c.id === id)?.name
  const todayDelta = delta(d.kToday.promet, d.kYesterday.promet)

  let lastBackup = 0
  try {
    lastBackup = Number(localStorage.getItem(LAST_BACKUP) || 0)
  } catch {
    /* nije bitno */
  }
  const backupDue = d.realCount > 0 && Date.now() - lastBackup > 14 * 86400000

  const next = d.nova > 0 ? 'nova' : d.spakovano > 0 ? 'spakovano' : d.isporuceno > 0 ? 'isporuceno' : null
  const steps = [
    {
      key: 'nova',
      n: d.nova,
      to: '/pakovanje',
      color: 'var(--st-nova)',
      title: 'Za pakovanje',
      sub: d.nova ? `${d.nova} ${plural(d.nova, 'porudžbina čeka', 'porudžbine čekaju', 'porudžbina čeka')} pakovanje` : 'Sve nove porudžbine su spakovane',
      todo: d.nova > 0,
    },
    {
      key: 'spakovano',
      n: d.spakovano,
      to: '/predaja',
      color: 'var(--st-spakovano)',
      title: 'Spremno za kurira',
      sub: d.spakovano ? 'Napravi spisak i predaj kuriru' : 'Nema spakovanih pošiljki',
      todo: d.spakovano > 0,
    },
    {
      key: 'poslato',
      n: d.poslato,
      to: '/porudzbine?tab=poslato',
      color: 'var(--st-poslato)',
      title: 'Poslato kuriru',
      sub: d.poslato ? `Na putu · otkupnina ${money(d.poslatoCod)}` : 'Nema pošiljki na putu',
      todo: false,
    },
    {
      key: 'isporuceno',
      n: d.isporuceno,
      to: '/porudzbine?tab=isporuceno',
      color: 'var(--st-isporuceno)',
      title: 'Čeka naplatu',
      sub: d.isporuceno ? `Isporučeno — označi kad stigne uplata` : 'Nema isporučenih bez naplate',
      todo: d.isporuceno > 0,
    },
  ]

  const showInstall = !install.standalone && !installHidden && (install.canPrompt || install.ios)
  const dismissInstall = () => {
    setInstallHidden(true)
    try {
      localStorage.setItem(INSTALL_DISMISSED, '1')
    } catch {
      /* nije bitno */
    }
  }

  const clearDemo = async () => {
    const ok = await confirm({ title: 'Obrisati probne podatke?', message: `Biće obrisano ${d.demoCount} probnih porudžbina. Tvoje prave porudžbine ostaju.`, confirmText: 'Obriši', danger: true })
    if (!ok) return
    const n = await removeDemoData()
    toast(`Obrisano: ${n}`)
  }

  const todayLabel = new Date().toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="page">
      <TopBar title="Početna" sub={todayLabel} />

      <div className="hello">
        <h2>{greeting(new Date().getHours())}!</h2>
      </div>

      {/* ---------- obaveštenja ---------- */}
      {d.demoCount > 0 && (
        <div className="notice blue" style={{ marginBottom: 10 }}>
          <Icon name="flask" />
          <span className="grow">
            <b>Probni podaci su uključeni</b> — brojke ispod nisu prave.{' '}
            <button type="button" className="link-btn" onClick={clearDemo}>
              Obriši probne podatke
            </button>
          </span>
        </div>
      )}
      {/* ---------- prodaja danas ---------- */}
      <div className="hero-card">
        <div className="lbl">Prodaja danas</div>
        <div className="big">{money(d.kToday.promet)}</div>
        <div className="row">
          <span>
            {d.kToday.brojPorudzbina} {plural(d.kToday.brojPorudzbina, 'porudžbina', 'porudžbine', 'porudžbina')}
          </span>
          {todayDelta !== null && Math.abs(todayDelta) >= 0.5 && (
            <span className="delta">
              {todayDelta > 0 ? '▲' : '▼'} {pct.format(todayDelta)}% u odnosu na juče
            </span>
          )}
        </div>
        <Spark values={d.series.map((x) => x.revenue)} height={46} />
        <div className="row" style={{ fontSize: 12, opacity: 0.7, justifyContent: 'space-between', margin: '2px 0 0' }}>
          <span>pre 14 dana</span>
          <span>danas</span>
        </div>
      </div>

      {/* ---------- šta je na redu ---------- */}
      <div className="section">
        <div className="section-title">
          <span className="grow">Šta je na redu</span>
        </div>
        <div className="steps">
          {steps.map((s, i) => (
            <Link
              key={s.key}
              to={s.to}
              className={`step ${s.todo ? 'todo' : ''} ${next === s.key ? 'next' : ''} ${!s.todo && s.n === 0 ? 'done' : ''}`}
              style={{ ['--c' as string]: s.color }}
            >
              <span className="num">{s.n === 0 && s.key !== 'poslato' ? <Icon name="check" /> : s.n}</span>
              <span className="main">
                {next === s.key && <span className="tag">Sledeći korak</span>}
                <span className="t" style={{ display: 'block' }}>
                  {i + 1}. {s.title}
                </span>
                <span className="s">{s.sub}</span>
              </span>
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
        {d.wait.count > 0 && (
          <p className="small muted" style={{ margin: '8px 4px 0' }}>
            Kuriri ti ukupno duguju <b style={{ color: 'var(--ink)' }}>{money(d.wait.amount)}</b> ({d.wait.count} {plural(d.wait.count, 'pošiljka', 'pošiljke', 'pošiljaka')}).
          </p>
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <LiveSite ordersToday={d.kToday.brojPorudzbina} />
      </div>

      {/* ---------- upozorenja ---------- */}
      {inbox.state !== 'ok' && (
        <Link to="/podesavanja" className={`notice ${inbox.state === 'off' ? 'blue' : 'amber'}`} style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="inbox" />
          <span className="grow">
            {inbox.state === 'off' ? (
              <>
                <b>Sajt nije povezan</b> — porudžbine ne ulaze same. Poveži ga u Podešavanjima (do tada ih uvozi iz mejla).
              </>
            ) : inbox.state === 'login' ? (
              <>
                <b>Prijavi se</b> da bi porudžbine sa sajta stizale same.
              </>
            ) : (
              <>
                <b>Veza sa sajtom ne radi</b> — porudžbine i dalje stižu mejlom. {inbox.message}
              </>
            )}
          </span>
          <Icon name="chevron" />
        </Link>
      )}
      {senderMissing && (
        <Link to="/podesavanja" className="notice blue" style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="info" />
          <span className="grow">
            <b>Unesi svoje podatke pošiljaoca</b> — pojavljuju se na svakoj nalepnici.
          </span>
          <Icon name="chevron" />
        </Link>
      )}
      {d.overdue > 0 && (
        <Link to="/porudzbine?overdue=1" className="notice amber" style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="alert" />
          <span className="grow">
            <b>
              {d.overdue} {plural(d.overdue, 'pošiljka', 'pošiljke', 'pošiljaka')}
            </b>{' '}
            poslato pre više od {settings.unpaidAlertDays} dana, a nije naplaćeno.
          </span>
          <Icon name="chevron" />
        </Link>
      )}
      {d.lowStock > 0 && (
        <Link to="/katalog?zaliha=1" className="notice amber" style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="alert" />
          <span className="grow">
            <b>Niska zaliha:</b> {d.lowStock} {plural(d.lowStock, 'varijanta', 'varijante', 'varijanti')} ispod zadatog broja.
          </span>
          <Icon name="chevron" />
        </Link>
      )}

      {/* ---------- porudžbina sa sajta ---------- */}
      <Link to="/uvoz" className="import-card">
        <Icon name="mail" />
        <span className="grow">
          <b>Stigla porudžbina sa sajta?</b>
          <small>Otvori link iz mejla ili ga nalepi ovde — porudžbina se upisuje sama.</small>
        </span>
        <Icon name="chevron" />
      </Link>

      {/* ---------- ovaj mesec ---------- */}
      <div className="section">
        <div className="section-title">
          <span className="grow">Ovaj mesec</span>
          <Link to="/analitika" className="link-btn" style={{ textTransform: 'none', letterSpacing: 0 }}>
            Cela analitika →
          </Link>
        </div>
        <div className="kpi-grid">
          <Kpi label="Prodaja" value={money(d.kMonth.promet)} delta={delta(d.kMonth.promet, d.kMonthPrev.promet)} sub={`${d.kMonth.brojPorudzbina} por.`} />
          <Kpi label="Naplaćeno" value={money(d.kMonth.naplaceno)} delta={delta(d.kMonth.naplaceno, d.kMonthPrev.naplaceno)} />
          <Kpi label="Prosečna porudžbina" value={money(d.kMonth.prosek)} delta={delta(d.kMonth.prosek, d.kMonthPrev.prosek)} />
          <Kpi label="Čista zarada" value={money(d.kMonth.zarada)} delta={delta(d.kMonth.zarada, d.kMonthPrev.zarada)} sub="posle troškova" />
        </div>
      </div>

      {/* ---------- poslednje porudžbine ---------- */}
      <div className="section">
        <div className="section-title">
          <span className="grow">Poslednje porudžbine</span>
          {d.live.length > 0 && (
            <Link to="/porudzbine" className="link-btn" style={{ textTransform: 'none', letterSpacing: 0 }}>
              Sve →
            </Link>
          )}
        </div>
        {d.recent.length === 0 ? (
          <div className="empty" style={{ padding: '28px 12px' }}>
            <Icon name="inbox" />
            <h2>Još nema porudžbina</h2>
            <p>Kad kupac poruči na sajtu, stiže ti mejl sa linkom. Možeš i ručno da uneseš porudžbinu.</p>
            <Link to="/nova" className="btn primary">
              <Icon name="plus" /> Nova porudžbina
            </Link>
          </div>
        ) : (
          d.recent.map((o) => <OrderCard key={o.id} order={o} courierName={courierName(o.courierId)} />)
        )}
      </div>

      {/* ---------- podsetnici ---------- */}
      {backupDue && (
        <Link to="/podesavanja" className="notice amber" style={{ textDecoration: 'none', marginBottom: 10 }}>
          <Icon name="download" />
          <span className="grow">
            <b>Napravi rezervnu kopiju.</b> Podaci su sačuvani samo na ovom uređaju{lastBackup ? ` (poslednja kopija ${dateShort(lastBackup)})` : ''}.
          </span>
          <Icon name="chevron" />
        </Link>
      )}
      {showInstall && (
        <div className="notice green">
          <Icon name="phone2" />
          <span className="grow">
            <b>Instaliraj aplikaciju na telefon.</b>{' '}
            {install.canPrompt ? (
              <button
                type="button"
                className="link-btn"
                onClick={async () => {
                  const ok = await promptInstall()
                  if (ok) toast('Instalirano ✓')
                }}
              >
                Instaliraj
              </button>
            ) : (
              <>Dodirni „Podeli“ pa „Dodaj na početni ekran“.</>
            )}
          </span>
          <button type="button" className="icon-btn" aria-label="Sakrij" style={{ width: 32, height: 32, margin: '-6px -8px 0 0' }} onClick={dismissInstall}>
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  )
}
