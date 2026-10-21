import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { TopBar, useUi } from '../components/ui'
import { canPromptInstall, isIos, isStandalone, onInstallChange, promptInstall } from '../lib/install'
import { syncCatalog } from '../lib/catalog'

const ITEMS: { to: string; icon: IconName; title: string; sub: string }[] = [
  { to: '/pakovanje', icon: 'clipboard', title: 'Pakovanje', sub: 'Čeklista: crveno dok nije spakovano, zeleno kad jeste' },
  { to: '/predaja', icon: 'truck', title: 'Spisak za kurira', sub: 'Dnevni spisak predaje sa otkupninama i nalepnicama' },
  { to: '/kontakti', icon: 'user', title: 'Kupci i kontakti', sub: 'Mejling lista, brojevi za Viber, izvoz za akcije' },
  { to: '/uvoz', icon: 'mail', title: 'Porudžbina sa sajta', sub: 'Uvezi porudžbinu iz mejla (link ili kod)' },
  { to: '/katalog', icon: 'box', title: 'Katalog', sub: 'Proizvodi, boje, cene, zaliha i trošak izrade' },
  { to: '/analitika', icon: 'wallet', title: 'Troškovi', sub: 'Materijal, ambalaža, reklame… (Analitika → Finansije)' },
  { to: '/podesavanja', icon: 'settings', title: 'Podešavanja', sub: 'Moji podaci, kuriri, poseta sajta, rezervna kopija' },
]

export default function MorePage() {
  const { toast } = useUi()
  const [, force] = useState(0)
  useEffect(() => onInstallChange(() => force((n) => n + 1)), [])
  const standalone = isStandalone()

  const refreshCatalog = async () => {
    try {
      const r = await syncCatalog(true)
      toast(`Katalog osvežen · novih ${r.added}, izmenjenih ${r.updated}`)
    } catch (e) {
      toast((e as Error).message || 'Katalog nije osvežen')
    }
  }

  return (
    <div className="page">
      <TopBar title="Više" />
      <div className="list">
        {ITEMS.map((i) => (
          <Link key={i.title} to={i.to} className="list-row">
            <span className="more-icon">
              <Icon name={i.icon} />
            </span>
            <div className="main">
              <div className="title">{i.title}</div>
              <div className="meta" style={{ whiteSpace: 'normal' }}>
                {i.sub}
              </div>
            </div>
            <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
        <button className="list-row" onClick={refreshCatalog}>
          <span className="more-icon">
            <Icon name="refresh" />
          </span>
          <div className="main">
            <div className="title">Osveži katalog sa sajta</div>
            <div className="meta" style={{ whiteSpace: 'normal' }}>
              Nove cene, boje i proizvodi (zaliha ostaje netaknuta)
            </div>
          </div>
        </button>
        <a className="list-row" href="../" target="_blank" rel="noopener">
          <span className="more-icon">
            <Icon name="globe" />
          </span>
          <div className="main">
            <div className="title">Otvori sajt</div>
            <div className="meta">Prodavnica kakvu vide kupci</div>
          </div>
        </a>
      </div>

      {!standalone && (
        <div className="card mt-lg">
          <div className="section-title" style={{ marginTop: 0 }}>
            <span className="grow">Instalacija na telefon</span>
          </div>
          {canPromptInstall() ? (
            <button
              className="btn brand block"
              onClick={async () => {
                if (await promptInstall()) toast('Instalirano ✓')
              }}
            >
              <Icon name="phone2" /> Instaliraj aplikaciju
            </button>
          ) : isIos() ? (
            <ol className="install-steps">
              <li>Otvori ovu stranicu u <b>Safari</b>-ju.</li>
              <li>Dodirni dugme <b>Podeli</b> (kvadrat sa strelicom).</li>
              <li>Izaberi <b>Dodaj na početni ekran</b>.</li>
            </ol>
          ) : (
            <ol className="install-steps">
              <li>Otvori ovu stranicu u <b>Chrome</b>-u na telefonu.</li>
              <li>Dodirni meni <b>⋮</b> (tri tačke gore desno).</li>
              <li>Izaberi <b>Instaliraj aplikaciju</b> ili <b>Dodaj na početni ekran</b>.</li>
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
