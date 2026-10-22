import { useSyncExternalStore } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { getInboxStatus, onInboxStatus } from '../lib/inbox'

const ITEMS: { to: string; icon: IconName; label: string; match: string[] }[] = [
  { to: '/', icon: 'home', label: 'Početna', match: [] },
  { to: '/porudzbine', icon: 'list', label: 'Porudžbine', match: ['/porudzbin', '/kupac', '/nova', '/uvoz'] },
  { to: '/pakovanje', icon: 'clipboard', label: 'Pakovanje', match: ['/pakovanje'] },
  { to: '/predaja', icon: 'truck', label: 'Spisak za kurira', match: ['/predaja'] },
  { to: '/analitika', icon: 'chart', label: 'Analitika', match: ['/analitika', '/statistika'] },
  { to: '/kontakti', icon: 'user', label: 'Kupci i kontakti', match: ['/kontakti'] },
  { to: '/katalog', icon: 'box', label: 'Katalog', match: ['/katalog'] },
  { to: '/podesavanja', icon: 'settings', label: 'Podešavanja', match: ['/podesavanja'] },
]

/** Meni sa leve strane za računar (na telefonu se ne prikazuje, tamo je donja traka). */
export function Sidebar() {
  const { pathname } = useLocation()
  const status = useSyncExternalStore(onInboxStatus, getInboxStatus)
  const tone = status.state === 'ok' ? 'ok' : status.state === 'error' ? 'bad' : status.state === 'login' ? 'warn' : ''
  const label = status.state === 'ok' ? 'Povezano sa sajtom' : status.state === 'error' ? 'Veza sa sajtom ne radi' : status.state === 'login' ? 'Treba prijava' : 'Sajt nije povezan'
  return (
    <aside className="sidebar" aria-label="Glavni meni">
      <Link to="/" className="side-brand">
        <img src="./favicon.png" alt="" width={40} height={40} />
        <span>
          <b>Lumora</b>
          <small>Admin</small>
        </span>
      </Link>
      <Link to="/nova" className="btn primary side-new">
        <Icon name="plus" /> Nova porudžbina
      </Link>
      <nav className="side-nav">
        {ITEMS.map((i) => {
          const active = i.to === '/' ? pathname === '/' : pathname === i.to || i.match.some((m) => pathname.startsWith(m))
          return (
            <NavLink key={i.to} to={i.to} end={i.to === '/'} className={active ? 'active' : ''}>
              <Icon name={i.icon} />
              {i.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="side-foot">
        <Link to="/podesavanja" className={`conn ${tone}`}>
          <i /> {label}
        </Link>
        <a href="../" target="_blank" rel="noopener" className="side-site">
          <Icon name="globe" /> Otvori sajt
        </a>
      </div>
    </aside>
  )
}
