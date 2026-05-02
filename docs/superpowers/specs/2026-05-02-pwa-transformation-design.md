# Design Spec: GPAce PWA Transformation

**Date:** 2026-05-02
**Status:** Draft
**Author:** Gemini CLI (Senior Frontend Engineer)

## 1. Overview
Convert the GPAce MPA into a high-quality Progressive Web App (PWA) with full offline capabilities and a native mobile feel.

## 2. Infrastructure (The Shell)
### 2.1 Service Worker (`/sw.js`)
- **Scope:** Root (`/`) to control all pages.
- **Caching Strategy:**
    - **Pre-cache:** Core assets (CSS, critical JS, icons).
    - **Stale-While-Revalidate:** For navigation pages (HTML) to ensure fast loading with background updates.
    - **Network-First:** For API calls to Firestore/Firebase.
- **Background Sync:** Register sync events for the "Sync Queue" to process edits as soon as connectivity is restored.

### 2.2 Web App Manifest (`/manifest.json`)
- **Display:** `standalone` (removes browser UI).
- **Orientation:** `portrait-primary`.
- **Theme Color:** `#050b18` (matches the deep blue background).
- **Icons:** Full suite (192x192, 512x512, plus Apple Touch Icons).

## 3. Data Sync Strategy (Todoist-style)
### 3.1 Local Storage (IndexedDB)
- Replace or augment `LocalStorage` with `IndexedDB` for tasks and calendar data.
- Stores a "Last Synced" timestamp for each collection.

### 3.2 Sync Queue & Reconciliation
- **Operation Log:** Every edit (create, update, delete) is stored in a `SyncQueue` in IndexedDB.
- **Structure:** `{ id, action, payload, timestamp, status: 'pending'|'synced' }`.
- **Resync Logic:**
    1. Check connectivity.
    2. Fetch "Updates since [Last Synced]" from Firestore.
    3. Apply remote updates to local state (Last Write Wins based on `timestamp`).
    4. Push local `SyncQueue` items to Firebase.
    5. Update "Last Synced" timestamp.

## 4. Mobile UX & Responsiveness
### 4.1 Layout Adjustments
- **Viewport:** Ensure `viewport-fit=cover` is in all `<meta>` tags for notch handling.
- **CSS Safe Areas:** 
    ```css
    body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
    }
    ```
- **Side Drawer:** Smooth CSS transitions (`transform: translateX`) with a backdrop-filter blur on the main content.

### 4.2 Interaction
- **Touch Targets:** Minimum 44px height/width for all interactive elements.
- **Overscroll Behavior:** Set `overscroll-behavior-y: contain` to prevent browser "bounce" and accidental page refreshes.
- **Native Input Handling:** Use appropriate `inputmode` (numeric, email) for all fields.

## 5. Success Criteria
1. App is installable from Chrome/Safari.
2. App opens and displays the "Grind" screen without internet.
3. Offline edits to tasks are successfully synced to Firebase when back online.
4. No horizontal scrolling or "broken" layouts on 375px - 414px width devices.
