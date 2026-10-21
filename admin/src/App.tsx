import { lazy, Suspense, useEffect, useState } from 'react'
import { HashRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Icon } from './components/Icon'
import { UiProvider } from './components/ui'
import { ErrorBoundary, Loading, useDbWatchdog } from './components/Guard'
import { seedCatalogOnce } from './lib/seed'
import HomePage from './pages/HomePage'
import ImportSitePage from './pages/ImportSitePage'
import OrdersPage from './pages/OrdersPage'
import OrderFormPage from './pages/OrderFormPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CatalogPage from './pages/CatalogPage'
import ProductEditPage from './pages/ProductEditPage'
import CatalogImportPage from './pages/CatalogImportPage'
import SettingsPage from './pages/SettingsPage'
import PackingPage from './pages/PackingPage'
import HandoverPage from './pages/HandoverPage'
import MorePage from './pages/MorePage'
import CustomerPage from './pages/CustomerPage'
import ContactsPage from './pages/ContactsPage'
import NewOrderAlert from './components/NewOrderAlert'
import { startInbox } from './lib/inbox'
import { remoteConfigured } from './lib/remote'
import { migrateStableIds } from './lib/migrate'
import { installAudioUnlock } from './lib/sound'
import { ensureContactsBackfilled } from './lib/contacts'
import { setBadge } from './lib/badge'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

// analitika (grafikoni) se učitava tek kad se otvori
const StatsPage = lazy(() => import('./pages/StatsPage'))

const MORE_PATHS = ['/vise', '/kontakti', '/katalog', '/podesavanja', '/predaja', '/uvoz', '/pakovanje']
const ORDER_PATHS = ['/porudzbine', '/porudzbina', '/kupac']

function Layout() {
  const { pathname } = useLocation()
  const moreActive = MORE_PATHS.some((p) => pathname.startsWith(p))
  const ordersActive = ORDER_PATHS.some((p) => pathname.startsWith(p))
  const novih = useLiveQuery(() => db.orders.filter((o) => !o.deletedAt && o.status === 'nova').count(), [])
  useEffect(() => {
    if (novih != null) setBadge(novih)
  }, [novih])
  useEffect(() => {
    installAudioUnlock()
    // bez veze sa bazom odmah; sa vezom tek posle prve sinhronizacije (v. lib/inbox.ts), da ne pregazi tuđ pristanak
    if (!remoteConfigured()) void ensureContactsBackfilled()
    return startInbox()
  }, [])
  return (
    <div className="app">
      <ErrorBoundary key={pathname}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
      <NewOrderAlert />
      <nav className="bottom-nav" style={{ ['--cols' as string]: 5 }} aria-label="Glavni meni">
        <NavLink to="/" end>
          <Icon name="home" />
          Početna
        </NavLink>
        <NavLink to="/porudzbine" className={ordersActive ? 'active' : ''}>
          <Icon name="list" />
          Porudžbine
        </NavLink>
        <NavLink to="/nova" className="fab" aria-label="Nova porudžbina">
          <span className="fab-circle">
            <Icon name="plus" />
          </span>
        </NavLink>
        <NavLink to="/analitika">
          <Icon name="chart" />
          Analitika
        </NavLink>
        <NavLink to="/vise" className={moreActive ? 'active' : ''}>
          <Icon name="menu" />
          Više
        </NavLink>
      </nav>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  useDbWatchdog()
  useEffect(() => {
    migrateStableIds()
      .catch((e) => console.error('Migracija nije uspela', e))
      .then(() => seedCatalogOnce())
      .finally(() => setReady(true))
  }, [])
  if (!ready) return null

  return (
    <UiProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="porudzbine" element={<OrdersPage />} />
            <Route path="uvoz" element={<ImportSitePage />} />
            <Route path="nova" element={<OrderFormPage />} />
            <Route path="porudzbina/:id" element={<OrderDetailPage />} />
            <Route path="porudzbina/:id/izmena" element={<OrderFormPage />} />
            <Route path="pakovanje" element={<PackingPage />} />
            <Route path="predaja" element={<HandoverPage />} />
            <Route path="katalog" element={<CatalogPage />} />
            <Route path="katalog/uvoz" element={<CatalogImportPage />} />
            <Route path="katalog/:id" element={<ProductEditPage />} />
            <Route path="podesavanja" element={<SettingsPage />} />
            <Route path="analitika" element={<StatsPage />} />
            <Route path="statistika" element={<Navigate to="/analitika" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="vise" element={<MorePage />} />
            <Route path="kontakti" element={<ContactsPage />} />
            <Route path="kupac/:phone" element={<CustomerPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </UiProvider>
  )
}
