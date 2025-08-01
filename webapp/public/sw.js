const CACHE_NAME = 'vysn-hub-v1';
const urlsToCache = [
  '/',
  '/products',
  '/projects',
  '/scanner',
  '/contact',
  '/manifest.json',
  // Add other important assets
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData = {
        title: 'VYSN Hub',
        body: event.data.text() || 'Neue Benachrichtigung',
        icon: '/logo.png',
        badge: '/logo.png'
      };
    }
  } else {
    notificationData = {
      title: 'VYSN Hub',
      body: 'Neue Benachrichtigung',
      icon: '/logo.png',
      badge: '/logo.png'
    };
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/logo.png',
    badge: notificationData.badge || '/logo.png',
    image: notificationData.image,
    data: notificationData.data || {},
    actions: notificationData.actions || [
      {
        action: 'open',
        title: 'Öffnen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    tag: notificationData.tag || 'default',
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      
      // Open new window if app is not open
      return clients.openWindow(urlToOpen);
    })
  );
});

// Background sync (optional - for offline actions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync
      console.log('Background sync triggered')
    );
  }
});