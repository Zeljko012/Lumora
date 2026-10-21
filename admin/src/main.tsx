import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles.css'
import './brand.css'

registerSW({ immediate: true })

// samo u razvoju: lažna baza za proveru auto-prijema (ne ulazi u produkcioni build)
if (import.meta.env.DEV && new URLSearchParams(location.search).has('fake')) {
  void import('./lib/devFake').then((m) => m.installDevFake())
}

// traži od pregledača da ne briše podatke kad mu zatreba prostor
navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
