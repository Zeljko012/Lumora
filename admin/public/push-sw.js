// Prima push poruke sa sajta (nova porudžbina) i prikazuje obaveštenje sa zvukom telefona.
// Učitava se u servis-worker aplikacije preko importScripts (v. vite.config.ts).
self.addEventListener('push', (event) => {
  let d = {}
  try {
    d = event.data ? event.data.json() : {}
  } catch {
    d = { body: event.data ? event.data.text() : '' }
  }
  // broj na ikoni (tačan broj postavlja aplikacija kad se otvori)
  if (self.navigator && self.navigator.setAppBadge) self.navigator.setAppBadge().catch(() => {})
  event.waitUntil(
    self.registration.showNotification(d.title || 'Nova porudžbina', {
      body: d.body || '',
      icon: 'pwa-192x192.png',
      badge: 'pwa-64x64.png',
      tag: 'lumora-order',
      renotify: true,
      requireInteraction: true,
      silent: false,
      vibrate: [200, 100, 200, 100, 300],
      data: { url: d.url || '#/porudzbine' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL((event.notification.data && event.notification.data.url) || '#/porudzbine', self.registration.scope).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          if ('navigate' in c) c.navigate(target).catch(() => {})
          return c.focus()
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
