// Housemate ZM — Service Worker for Push Notifications
// This worker handles incoming push events and notification clicks.

const APP_URL = self.location.origin

// Handle push events — show a notification to the user
self.addEventListener('push', (event) => {
  let data = {
    title: 'Housemate ZM',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    url: '/',
  }

  try {
    const payload = event.data ? event.data.json() : {}
    if (payload.notification) {
      // FCM format
      data.title = payload.notification.title || data.title
      data.body = payload.notification.body || data.body
      data.icon = payload.notification.icon || data.icon
      data.url = payload.notification.click_action || payload.data?.url || data.url
    } else {
      // Web Push standard format
      data.title = payload.title || data.title
      data.body = payload.body || data.body
      data.icon = payload.icon || data.icon
      data.url = payload.url || data.url
    }
  } catch {
    // If payload is not JSON, use the raw text as body
    data.body = event.data ? event.data.text() : data.body
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      data: {
        url: data.url,
        timestamp: Date.now(),
      },
      vibrate: [100, 50, 100],
      tag: 'housemate-zm-notification',
      renotify: true,
    })
  )
})

// Handle notification click — focus or open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing window if one is open
      for (const client of clientList) {
        if (client.url.includes(APP_URL) && 'focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }

      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

// Handle install event — pre-cache essential assets
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Handle activate event — take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
