# GPAce PWA Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert GPAce into a high-quality PWA with full offline sync (Todoist-style) and native mobile feel.

**Architecture:** Move Service Worker to root for full scope, implement IndexedDB-based Sync Queue for offline data persistence, and apply mobile-specific CSS/UX polish.

**Tech Stack:** Service Worker API, Cache API, IndexedDB, Vanilla JS, CSS.

---

### Task 1: Web App Manifest & Branding

**Files:**
- Create: `manifest.json`
- Modify: `index.html` (and other entry points: `grind.html`, `tasks.html`, etc.)

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "GPAce",
  "short_name": "GPAce",
  "description": "AI-powered task management and research assistant",
  "start_url": "/grind.html",
  "display": "standalone",
  "background_color": "#050b18",
  "theme_color": "#050b18",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "assets/images/gpace-logo-white.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "assets/images/gpace-logo-white.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: Update index.html head**

Add manifest and theme-color meta tags.

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#050b18">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="assets/images/gpace-logo-white.png">
```

- [ ] **Step 3: Repeat for all major HTML files**
Apply same tags to `grind.html`, `tasks.html`, `priority-list.html`, `academic-details.html`, `daily-calendar.html`, `flashcards.html`, `settings.html`, `sleep-saboteurs.html`, `study-spaces.html`, `subject-marks.html`, `workspace.html`.

- [ ] **Step 4: Commit**
```bash
git add manifest.json *.html
git commit -m "feat(pwa): add web app manifest and mobile meta tags"
```

---

### Task 2: Service Worker Migration & Global Scope

**Files:**
- Create: `sw.js` (at root)
- Modify: `js/inject-header.js`
- Delete: `js/alarm-service-worker.js` (eventually)

- [ ] **Step 1: Create sw.js at root**
Merge existing alarm logic with global caching.

```javascript
const CACHE_NAME = 'gpace-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/grind.html',
  '/css/design-tokens.css',
  '/css/grind-react.css',
  '/js/services/StorageService.js',
  '/assets/images/gpace-logo-white.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (event.request.url.startsWith(self.location.origin)) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
        }
        return response;
      });
    })
  );
});

// Alarm & Sync Logic (Placeholder for Task 3)
self.addEventListener('message', (event) => {
    // Keep existing POMODORO_TIMER and SET_ALARM logic from alarm-service-worker.js
});
```

- [ ] **Step 2: Update js/inject-header.js registration**

```javascript
async function initializeAlarmServiceWorker(STORAGE_KEYS) {
    if (!('serviceWorker' in navigator)) return;
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[InjectHeader] PWA Service Worker registered');
        // ... existing alarm scheduling logic ...
    } catch (error) {
        console.error('[InjectHeader] SW registration failed:', error);
    }
}
```

- [ ] **Step 3: Commit**
```bash
git add sw.js js/inject-header.js
git commit -m "feat(pwa): move service worker to root and enable basic caching"
```

---

### Task 3: IndexedDB & Sync Queue Implementation

**Files:**
- Create: `js/services/IndexedDBService.js`
- Create: `js/services/SyncService.js`

- [ ] **Step 1: Create IndexedDBService.js**
Standard wrapper for local data persistence.

```javascript
export class IndexedDBService {
    constructor() {
        this.dbName = 'gpace_db';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('tasks')) {
                    db.createObjectStore('tasks', { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => { this.db = e.target.result; resolve(); };
            request.onerror = reject;
        });
    }

    async addToQueue(action, payload) {
        const tx = this.db.transaction('sync_queue', 'readwrite');
        const store = tx.objectStore('sync_queue');
        return store.add({ action, payload, timestamp: Date.now(), status: 'pending' });
    }
}
```

- [ ] **Step 2: Create SyncService.js**
Logic for Todoist-style reconciliation.

- [ ] **Step 3: Commit**
```bash
git add js/services/IndexedDBService.js js/services/SyncService.js
git commit -m "feat(sync): implement IndexedDB and Sync Queue services"
```

---

### Task 4: Mobile Responsiveness & UI Polishing

**Files:**
- Create: `css/mobile-native.css`
- Modify: `css/design-tokens.css`

- [ ] **Step 1: Create mobile-native.css**
Handle safe areas and touch targets.

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

body {
  padding-top: calc(var(--nav-height) + var(--safe-top));
  padding-bottom: var(--safe-bottom);
  overscroll-behavior-y: contain;
  -webkit-tap-highlight-color: transparent;
}

/* Larger hit areas */
.side-drawer .nav-link, 
.btn, 
.task-item {
  min-height: 44px;
  display: flex;
  align-items: center;
}

/* Native-like scrolling */
.scroll-container {
  -webkit-overflow-scrolling: touch;
}
```

- [ ] **Step 2: Import in index.html and grind.html**

- [ ] **Step 3: Commit**
```bash
git add css/mobile-native.css css/design-tokens.css
git commit -m "style(mobile): add safe area support and touch optimizations"
```
