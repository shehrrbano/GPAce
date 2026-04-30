# Workspace Responsive Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the workspace into a fully responsive layout with a vertical tool sidebar for Desktop/Tablet and a bottom tab bar for Mobile.

**Architecture:** Option A (Sidebar Integration) — Moves Insert, AI, and Export tools into the left sidebar. Sidebar collapses to an icon rail on Tablet and hides on Mobile in favor of a bottom tab bar.

**Tech Stack:** HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript.

---

### Task 1: Refactor Workspace HTML Structure

**Files:**
- Modify: `workspace.html`

- [ ] **Step 1: Move Toolbar Sections to Sidebar**
Relocate the `Insert`, `AI & Voice`, and `Export` sections from the `toolbar-ribbon` to a new `editor-tools-section` within `aside.attachments-pane`.

```html
<!-- Inside aside.attachments-pane -->
<div class="editor-tools-section">
    <div class="tool-group" aria-label="Insert">
        <label class="sidebar-label">Insert</label>
        <div class="tool-row">
            <!-- Move buttons with IDs: uploadImageBtn, openGooglePickerBtn, insertImageUrlBtn, etc. -->
        </div>
    </div>
    <div class="tool-group" aria-label="AI & Voice">
        <label class="sidebar-label">AI & Voice</label>
        <div class="tool-row">
            <!-- Move buttons with IDs: speechRecognitionBtn, summarizeBtn, textToSpeechBtn, stopTextToSpeechBtn -->
        </div>
    </div>
    <div class="tool-group" aria-label="Export">
        <label class="sidebar-label">Export</label>
        <div class="tool-row">
            <!-- Move buttons with IDs: exportPdfBtn, exportWordBtn -->
        </div>
    </div>
</div>
```

- [ ] **Step 2: Add Mobile Tab Bar**
Add the `mobile-tab-bar` at the end of the `<body>`.

```html
<nav class="mobile-tab-bar">
    <button class="tab-item" id="mobileDictateBtn" aria-label="Dictate">
        <i class="bi bi-mic-fill"></i>
        <span>Dictate</span>
    </button>
    <button class="tab-item" id="mobileSummarizeBtn" aria-label="Summarize">
        <i class="bi bi-lightning-charge-fill"></i>
        <span>Summarize</span>
    </button>
    <button class="tab-item" id="mobileInsertBtn" aria-label="Insert Image">
        <i class="bi bi-image"></i>
        <span>Insert</span>
    </button>
    <button class="tab-item" id="mobileExportBtn" aria-label="Export PDF">
        <i class="bi bi-file-pdf-fill"></i>
        <span>Export</span>
    </button>
</nav>
```

- [ ] **Step 3: Commit**
```bash
git add workspace.html
git commit -m "feat(workspace): refactor HTML for responsive sidebar and mobile tab bar"
```

---

### Task 2: Implement Responsive CSS (Sidebar & Layout)

**Files:**
- Modify: `css/workspace.css`

- [ ] **Step 1: Update Grid Layout**
Change the grid to fixed left sidebar and fluid center.

```css
.workspace-layout {
    display: grid;
    grid-template-columns: 250px 1fr; /* Sidebar is now left-aligned */
    /* ... existing props ... */
}
```

- [ ] **Step 2: Style Editor Tools in Sidebar**
Add styles for the new tool groups and rows within the sidebar.

```css
.editor-tools-section {
    padding-top: 20px;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
}
.sidebar-label {
    font-size: 10px;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 8px;
}
.tool-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}
```

- [ ] **Step 3: Add Media Queries for Tablet & Mobile**
Implement the icon rail and mobile tab bar logic.

```css
/* Tablet: Icon Rail */
@media (max-width: 1024px) {
    .workspace-layout {
        grid-template-columns: 60px 1fr;
    }
    .sidebar-label, .attachments-pane-header h3 {
        display: none;
    }
    .attachments-pane {
        padding: 10px;
    }
}

/* Mobile: Bottom Tab Bar */
@media (max-width: 768px) {
    .workspace-layout {
        grid-template-columns: 1fr;
    }
    .attachments-pane {
        display: none;
    }
    .mobile-tab-bar {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: #0F172A;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
        z-index: 3000;
        justify-content: space-around;
        align-items: center;
    }
    .tab-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: none;
        border: none;
        color: #94A3B8;
        font-size: 10px;
    }
    .tab-item i { font-size: 20px; }
}
```

- [ ] **Step 4: Commit**
```bash
git add css/workspace.css
git commit -m "style(workspace): implement responsive css for tablet rail and mobile tab bar"
```

---

### Task 3: Wire Up Mobile Tab Bar Actions

**Files:**
- Modify: `js/workspace-ui.js`

- [ ] **Step 1: Link Mobile Buttons to Existing Handlers**
Map clicks on mobile tab bar items to the original tool button click events.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init ...

    // Mobile Tab Bar mapping
    const mappings = {
        'mobileDictateBtn': 'speechRecognitionBtn',
        'mobileSummarizeBtn': 'summarizeBtn',
        'mobileInsertBtn': 'uploadImageBtn',
        'mobileExportBtn': 'exportPdfBtn'
    };

    Object.entries(mappings).forEach(([mobileId, originalId]) => {
        const mobileBtn = document.getElementById(mobileId);
        const originalBtn = document.getElementById(originalId);
        if (mobileBtn && originalBtn) {
            mobileBtn.addEventListener('click', () => originalBtn.click());
        }
    });
});
```

- [ ] **Step 2: Verify and Commit**
Check that clicking "Dictate" on mobile (simulated) triggers the same logic as the sidebar button.

```bash
git add js/workspace-ui.js
git commit -m "fix(workspace): connect mobile tab bar to existing tool handlers"
```
