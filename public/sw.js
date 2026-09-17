// Macareno's Mystery - Progressive Web App Service Worker
// Enables background push notifications, lock-screen vibration, and game recovery

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for previous SW
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push from server (even when tab is closed / phone locked)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "🐱 Macareno's Mystery";
  const options = {
    body: data.body || '¡Hay un nuevo suceso en la fiesta!',
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    vibrate: data.vibrate || [300, 150, 300, 150, 450],
    tag: data.tag || 'macareno-alert-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    silent: false,
    data: {
      url: (data.data && data.data.url) || data.url || '/',
      timestamp: Date.now(),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle user clicking on the notification in their status bar or lock screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and post a message to it
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            url: targetUrl,
          });
          return client.focus();
        }
      }
      // If no tab is open, open the room URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Allow webpage to trigger service worker notifications directly
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || "Macareno's Mystery", options);
  }
});
