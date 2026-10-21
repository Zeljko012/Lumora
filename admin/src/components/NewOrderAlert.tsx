import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { onNewOrders, orderValue } from '../lib/inbox'
import { audioReady, soundEnabled } from '../lib/sound'
import { money, plural } from '../lib/format'
import type { Order } from '../types'

/** Traka na vrhu kad stigne nova porudžbina sa sajta (uz zvuk koji pušta lib/inbox). */
export default function NewOrderAlert() {
  const [orders, setOrders] = useState<Order[]>([])
  const [muted, setMuted] = useState(false)
  const nav = useNavigate()
  const timer = useRef<number | undefined>(undefined)

  useEffect(
    () =>
      onNewOrders((fresh) => {
        setOrders((prev) => [...fresh, ...prev].slice(0, 20))
        setMuted(soundEnabled() && !audioReady())
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setOrders([]), 30_000)
        // ako je aplikacija u pozadini, pokaži i obaveštenje telefona (kad je dozvoljeno)
        if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
          const o = fresh[0]
          const title = 'Nova porudžbina'
          const opts = {
            body: `${o.customer.name} · ${money(orderValue(o))}${fresh.length > 1 ? ` (+${fresh.length - 1})` : ''}`,
            tag: 'lumora-order',
            icon: 'pwa-192x192.png',
          }
          // na telefonu obaveštenje mora da prođe kroz servis-worker (new Notification tamo ne radi)
          void navigator.serviceWorker
            ?.getRegistration()
            .then((reg) => {
              if (reg) return reg.showNotification(title, opts)
              new Notification(title, opts)
            })
            .catch(() => {})
        }
      }),
    [],
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!orders.length) return null
  const first = orders[0]
  return (
    <div className="order-alert" role="status" aria-live="polite">
      <button
        className="order-alert-main"
        onClick={() => {
          setOrders([])
          nav(orders.length === 1 ? `/porudzbina/${first.id}` : '/porudzbine')
        }}
      >
        <span className="order-alert-icon">
          <Icon name="inbox" />
        </span>
        <span className="order-alert-text">
          <b>{orders.length === 1 ? 'Nova porudžbina sa sajta' : `${orders.length} ${plural(orders.length, 'nova porudžbina', 'nove porudžbine', 'novih porudžbina')} sa sajta`}</b>
          <span>
            {first.customer.name} · {money(orderValue(first))}
            {muted && ' · dodirni ekran da uključiš zvuk'}
          </span>
        </span>
      </button>
      <button className="icon-btn" aria-label="Zatvori" onClick={() => setOrders([])}>
        <Icon name="close" />
      </button>
    </div>
  )
}
