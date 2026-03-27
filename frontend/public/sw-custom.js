/**
 * Custom Service Worker for Ajo PWA
 * Handles push notifications and background sync.
 * next-pwa merges this with the generated sw.js via importScripts.
 */

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Ajo', body: event.data.text() };
  }

  const { title = 'Ajo', body = '', icon = '/icon-192.png', badge = '/icon-192.png', url = '/', tag, data: extraData } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag: tag || 'ajo-notification',
      data: { url, ...extraData },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

// ─── Notification Click ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if already open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Background Sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contributions') {
    event.waitUntil(syncPendingContributions());
  }
});

async function syncPendingContributions() {
  try {
    const cache = await caches.open('ajo-pending-actions');
    const keys = await cache.keys();
    for (const request of keys) {
      const response = await cache.match(request);
      if (!response) continue;
      const body = await response.json();
      await fetch(request, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      await cache.delete(request);
    }
  } catch {
    // Will retry on next sync
  }
}
