# Boot & Auth Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the refresh loop (re-login on refresh), resolve the side drawer syntax error, and silence console spam.

**Architecture:** 
- Wrap `sideDrawer.js` in a proper class declaration to fix syntax errors.
- Explicitly set Firebase Auth persistence to `LOCAL` in `auth.js`.
- Make service initializations (Gemini, Alarm, GDrive) defensive and quiet.
- Convert `sideDrawer.js` from module to standard script if needed, or ensure it's loaded as a module correctly without syntax errors.

**Tech Stack:** JavaScript (ESM), Firebase (Auth/Firestore), Google Drive API, Gemini API.

---

### Task 1: Fix SideDrawer Syntax Error

**Files:**
- Modify: `js/sideDrawer.js:1-10`

- [ ] **Step 1: Add missing class declaration to sideDrawer.js**

```javascript
/**
 * Side Drawer Component
 * Provides navigation and settings drawer functionality
 */
class SideDrawer {
    constructor() {
        this.isOpen = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        // ... rest of existing init code
```

- [ ] **Step 2: Ensure the file ends with the class closing brace and instantiation**

```javascript
    }
}

// Export for module use
export { SideDrawer };

// Also expose globally for non-module injection
const sideDrawer = new SideDrawer();
window.sideDrawer = sideDrawer;
export default sideDrawer;
```

- [ ] **Step 3: Commit**

```bash
git add js/sideDrawer.js
git commit -m "fix(ui): add missing class declaration to sideDrawer.js"
```

---

### Task 2: Harden Auth Persistence

**Files:**
- Modify: `js/auth.js`

- [ ] **Step 1: Set persistence to LOCAL and handle async init**

```javascript
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    // ... other imports
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ... inside initializeAuth or at top level
export async function initializeAuth() {
    if (!auth) return;
    
    try {
        await setPersistence(auth, browserLocalPersistence);
        console.log("🔐 Auth persistence set to LOCAL");
    } catch (error) {
        console.error("Auth persistence error:", error);
    }

    onAuthStateChanged(auth, async (user) => {
        // ... existing logic
    });
}
```

- [ ] **Step 2: Prevent premature login prompt in updateUIForSignedOut**

```javascript
function updateUIForSignedOut() {
    // Only show login UI if we are SURE we aren't just waiting for auth
    // Add a check for a 'loading' state if needed
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.innerHTML = `
            <button id="signInBtn" class="btn-auth">
                <i class="bi bi-google"></i>
                <span>Sign In with Google</span>
            </button>
        `;
        // ...
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add js/auth.js
git commit -m "fix(auth): set explicit LOCAL persistence and stabilize UI"
```

---

### Task 3: Silence GeminiKeyManager Spam

**Files:**
- Modify: `js/GeminiKeyManager.js`

- [ ] **Step 1: Downgrade warn to debug for missing keys**

```javascript
// Replace L265:
// console.warn('[GeminiKeyManager] No keys found in any storage location!');
console.debug('[GeminiKeyManager] No keys found in storage. This is normal for new users.');
```

- [ ] **Step 2: Reduce initialization logging verbosity**

```javascript
// Change console.log to console.debug for routine init steps
console.debug('[GeminiKeyManager] Initializing...');
```

- [ ] **Step 3: Commit**

```bash
git add js/GeminiKeyManager.js
git commit -m "chore(gemini): reduce initialization log noise"
```

---

### Task 4: Fix Firestore WebChannel & Alarm Spam

**Files:**
- Modify: `js/alarm-data-service.js`

- [ ] **Step 1: Make initializeFirestoreSync safer**

```javascript
async initializeFirestoreSync() {
    if (!this.userId || this.firestoreInitialized) return;
    this.firestoreInitialized = true;
    
    try {
        const alarmsRef = collection(db, `users/${this.userId}/alarms`);
        this.unsubscribe = onSnapshot(alarmsRef, (snapshot) => {
            // ...
        }, (error) => {
            console.debug('[AlarmService] Firestore connection quiet failure:', error.message);
        });
    } catch (e) {
        console.debug('[AlarmService] Failed to setup Firestore sync:', e.message);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/alarm-data-service.js
git commit -m "fix(alarm): defensive firestore initialization"
```

---

### Task 5: Handle Google Drive Auth Gracefully

**Files:**
- Modify: `js/googleDriveApi.js`

- [ ] **Step 1: Prevent interaction_required spam**

```javascript
async requestAccessTokenSilent() {
    return new Promise((resolve) => {
        if (!this.tokenClient) return resolve(null);
        
        this.tokenClient.callback = (resp) => {
            if (resp.error) {
                console.debug('[GDrive] Silent token request failed:', resp.error);
                resolve(null);
            } else {
                this.accessToken = resp.access_token;
                this.isAuthorized = true;
                resolve(this.accessToken);
            }
        };
        
        // Use prompt: 'none' to try silent auth
        this.tokenClient.requestAccessToken({ prompt: 'none' });
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/googleDriveApi.js
git commit -m "fix(gdrive): handle silent auth to prevent interaction_required errors"
```

---

### Task 6: Final Cleanup & Babel Reduction

**Files:**
- Modify: `grind.html`

- [ ] **Step 1: Ensure sideDrawer.js is loaded as module without duplicate injection**

```html
<!-- Remove the dynamic injection in inject-header.js if it causes issues, 
     but ensure it's here once and correctly -->
<script type="module" src="js/sideDrawer.js"></script>
```

- [ ] **Step 2: Verify side drawer works and console is clean**

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: final cleanup and verification"
```
