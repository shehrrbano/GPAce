# Core UI Fixes: sideDrawer.js & Auth Warnings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix SyntaxError in sideDrawer.js, standardize its loading as a module, and resolve COOP/Babel warnings.

**Architecture:** 
- Fix the class-level syntax error (missing brace) and implement missing theme logic in `sideDrawer.js`.
- Standardize script loading: Convert all `sideDrawer.js` imports to `type="module"`.
- Configure security headers: Add COOP to `firebase.json` for Google Auth compatibility.

**Tech Stack:** JavaScript (ESM), Firebase Hosting.

---

### Task 1: Fix Syntax and Logic in sideDrawer.js

**Files:**
- Modify: `js/sideDrawer.js`

- [ ] **Step 1: Fix missing brace in init() and implementation of handleThemeChange()**

```javascript
// Around line 82
        // Event listeners
        this.setupEventListeners();
    } // ADD THIS MISSING BRACE

    /**
     * Ensures the drawer toggle button exists in the DOM
// ... 

// Around line 304
    handleThemeChange(theme) {
        const body = document.body;
        const themeButtons = document.querySelectorAll('.theme-btn');

        // Update theme
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gpace_theme', theme);

        // Update active state of theme buttons
        themeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.theme === theme);
        });
        
        console.log(`[SideDrawer] Theme changed to: ${theme}`);
    }
```

- [ ] **Step 2: Commit syntax fix**

```bash
git add js/sideDrawer.js
git commit -m "fix(ui): resolve syntax error and implement theme logic in sideDrawer.js"
```

---

### Task 2: Standardize Module Loading

**Files:**
- Modify: `settings.html`
- Modify: `_archived/sideDrawer-standardization-documentation.md` (optional but good for consistency)

- [ ] **Step 1: Update settings.html to load sideDrawer.js as module**

```html
<!-- Change line 124 -->
<script type="module" src="js/sideDrawer.js"></script>
```

- [ ] **Step 2: Verify other files (grind.html, index.html) already use type="module"**
(Research showed they do).

- [ ] **Step 3: Commit standardization**

```bash
git add settings.html
git commit -m "refactor(ui): standardize sideDrawer.js as ESM module across pages"
```

---

### Task 3: Resolve COOP Warnings

**Files:**
- Modify: `firebase.json`

- [ ] **Step 1: Add COOP header to hosting config**

```json
// Add to hosting.headers array
{
  "source": "**",
  "headers": [
    {
      "key": "Cross-Origin-Opener-Policy",
      "value": "same-origin-allow-popups"
    }
  ]
}
```

- [ ] **Step 2: Commit security config**

```bash
git add firebase.json
git commit -m "chore(security): add Cross-Origin-Opener-Policy header for Google Auth"
```

---

### Task 4: Verification

- [ ] **Step 1: Verify syntax error is gone**
Load `relaxed-mode/index.html` (or any page) and check console for `Unexpected token '{'`.

- [ ] **Step 2: Verify Drawer Toggle works**
Click hamburger button, verify drawer opens.

- [ ] **Step 3: Verify Theme Switching**
Open drawer, click "Light"/"Dark", verify `data-theme` attribute on `<html>` changes.
