# App Bootstrapping Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign app initialization into a centralized, robust, and clean sequence to prevent duplicate initializations and race conditions.

**Architecture:** 
- Centralize all startup logic in a new `BootstrapManager.js`.
- Disable `DOMContentLoaded` auto-initialization in individual services.
- Implement explicit dependency waiting (e.g., Auth -> DataInit -> TaskSystem).
- Strengthen idempotency guards with `initializing` and `initialized` flags.

**Tech Stack:** JavaScript (ESM).

---

### Task 1: Create BootstrapManager and Disable Auto-Init

**Files:**
- Create: `js/core/BootstrapManager.js`
- Modify: `js/sideDrawer.js`
- Modify: `js/inject-header.js`
- Modify: `js/services/DataInitializationService.js`
- Modify: `js/core/TaskSystem.js`

- [ ] **Step 1: Create `js/core/BootstrapManager.js`**

```javascript
/**
 * BootstrapManager.js
 * Centralized entry point for application initialization.
 */
class BootstrapManager {
    constructor() {
        this.booting = false;
        this.booted = false;
    }

    async boot(pageName = 'unknown') {
        if (this.booted) return console.warn('[Bootstrap] Already booted');
        if (this.booting) return console.warn('[Bootstrap] Boot in progress');

        this.booting = true;
        console.group(`[Bootstrap] Starting app sequence for: ${pageName}`);
        
        try {
            // 1. UI Infrastructure (Non-dependent)
            console.log('[Bootstrap] Phase 1: UI Infrastructure');
            if (window.sideDrawer) await window.sideDrawer.init();
            if (window.initializeCommonComponents) await window.initializeCommonComponents();

            // 2. Data & Auth Layer
            console.log('[Bootstrap] Phase 2: Data & Auth');
            if (window.dataInitService) {
                await window.dataInitService.init();
            }

            // 3. App Core
            console.log('[Bootstrap] Phase 3: App Core');
            if (window.TaskSystem) {
                await window.TaskSystem.init();
            }

            this.booted = true;
            console.log('[Bootstrap] ✅ App sequence complete');
        } catch (error) {
            console.error('[Bootstrap] ❌ Boot failed:', error);
        } finally {
            console.groupEnd();
            this.booting = false;
        }
    }
}

const bootstrapManager = new BootstrapManager();
window.bootstrapManager = bootstrapManager;
export default bootstrapManager;
```

- [ ] **Step 2: Disable auto-init in `js/sideDrawer.js`**
Remove the block at the bottom of the file that calls `sideDrawer.init()` on `DOMContentLoaded`.

- [ ] **Step 3: Disable auto-init in `js/inject-header.js`**
Remove `document.addEventListener('DOMContentLoaded', initializeCommonComponents)` and the standalone `initializeCommonComponents()` call at the bottom.

- [ ] **Step 4: Strengthening `js/services/DataInitializationService.js` guards**
Ensure `init()` returns immediately if `this.initialized` is true, and handle potential race conditions in `_subscribeToAllTasks`.

- [ ] **Step 5: Disable auto-init/global init in `js/core/TaskSystem.js`**
Ensure it doesn't auto-init on script load.

---

### Task 2: Integrate BootstrapManager into Pages

**Files:**
- Modify: `grind.html`
- Modify: `index.html` (and other entry points)

- [ ] **Step 1: Update `grind.html` bootstrap script**

Replace existing scattered init calls with:
```javascript
import bootstrapManager from './js/core/BootstrapManager.js';
document.addEventListener('DOMContentLoaded', () => {
    bootstrapManager.boot('Grind Mode');
});
```

- [ ] **Step 2: Update `index.html` and other pages**
Follow the same pattern to ensure consistent boot sequence across the app.

---

### Task 3: Resolve Google Drive Auth Spam

**Files:**
- Modify: `js/googleDriveApi.js`

- [ ] **Step 1: Make Google Drive initialization lazy**
Only trigger `authorize()` when a Drive-related action is actually performed, rather than on every boot.

---

### Task 4: Verification

- [ ] **Step 1: Verify single initialization**
Check console logs to ensure each service (SideDrawer, InjectHeader, etc.) logs its "Initializing..." message exactly once.

- [ ] **Step 2: Verify dependency order**
Ensure Firebase references and Auth state are resolved before TaskSystem attempts to subscribe to projects.

- [ ] **Step 3: Verify performance**
Ensure page load feels smooth and UI elements (Navigation, SideDrawer) are responsive immediately after boot.
