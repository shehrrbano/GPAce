/**
 * GPAce Service Worker
 * Version: 2.0.0
 * Handles: Asset caching (offline support), Pomodoro Notifications, and Alarms.
 */

const CACHE_NAME = 'gpace-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/grind.html',
  '/tasks.html',
  '/manifest.json',
  '/css/design-tokens.css',
  '/css/grind-react.css',
  '/css/sideDrawer.css',
  '/css/components/navigation.css',
  '/js/inject-header.js',
  '/js/services/StorageService.js',
  '/assets/images/gpace-logo-white.png',
  '/alarm-sounds/alexa-ringtone.mp3'
];

// Install event - cache necessary files
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached assets when offline (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip cross-origin requests (CDN stuff handled by standard fetch for now)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for failed network requests (offline)
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Alarm & Notification Logic
const activeAlarms = new Map();

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Received message:', event.data);
  
  if (event.data && event.data.type === 'POMODORO_TIMER') {
    handlePomodoroMessage(event.data);
  } else if (event.data && event.data.type === 'SET_ALARM') {
    const { id, time, label } = event.data;
    scheduleAlarmCheck(id, time, label);
  }
});

function handlePomodoroMessage(data) {
    const { endTime, timerState, pomodoroCount } = data;
    if (endTime) {
      const timeUntilEnd = endTime - Date.now();
      if (timeUntilEnd > 0) {
        setTimeout(() => {
          self.clients.matchAll({ type: 'window' }).then((clients) => {
            const visibleClient = clients.find(client => client.visibilityState === 'visible');
            if (!visibleClient) {
                const title = timerState === 'focus' ? 'Break Time!' : 'Focus Time!';
                const body = timerState === 'focus' ? 'Great job! Take a break.' : 'Break is over. Time to focus!';
                self.registration.showNotification(title, {
                  body: body,
                  icon: '/assets/images/gpace-logo-white.png',
                  vibrate: [100, 50, 100],
                  tag: 'pomodoro-notification'
                });
            }
          });
        }, timeUntilEnd);
      }
    }
}

function scheduleAlarmCheck(id, time, label) {
  if (activeAlarms.has(id)) clearTimeout(activeAlarms.get(id));
  
  const [hour, minute] = time.split(':').map(Number);
  const now = new Date();
  let alarmTime = new Date();
  alarmTime.setHours(hour, minute, 0, 0);
  
  if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1);
  
  const diff = alarmTime.getTime() - now.getTime();
  const timeoutId = setTimeout(() => {
    self.registration.showNotification('GPAce Alarm', {
      body: label || 'Time to wake up!',
      icon: '/assets/images/gpace-logo-white.png',
      vibrate: [500, 100, 500, 100, 500],
      tag: `alarm-${id}`,
      requireInteraction: true,
      data: { url: '/sleep-saboteurs.html' }
    });
    activeAlarms.delete(id);
  }, diff);
  
  activeAlarms.set(id, timeoutId);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('/grind.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow('/grind.html');
    })
  );
});
