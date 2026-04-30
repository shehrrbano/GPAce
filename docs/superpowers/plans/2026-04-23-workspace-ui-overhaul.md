# Workspace UI/UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the `workspace.html` into a professional, glassmorphic "Modular Command Center" with a three-column layout (Control Pod | Focus Zone | Vitals Pod).

**Architecture:** 
- **Control Pod (Left):** Fixed 320px column for Pomodoro and Active Task.
- **Focus Zone (Center):** Fluid editor area with a floating formatting toolbar.
- **Vitals Pod (Right):** Collapsible 280px column for Energy stats and Task Attachments.
- Standardized navigation using `NavigationComponent.js`.

**Tech Stack:** HTML5, CSS3 (Glassmorphism), JavaScript (ES Modules), Quill.js, Bootstrap Icons.

---

### Task 1: Header Standardization & Dependency Cleanup

**Files:**
- Modify: `workspace.html`
- Modify: `js/workspace-core.js`

- [ ] **Step 1: Replace legacy navigation with NavigationComponent**
Remove the `<nav>` or manual header code in `workspace.html` and ensure the `NavigationComponent` is properly injected.

```javascript
// In workspace.html, ensure NavigationComponent is imported and called
import NavigationComponent from './js/components/NavigationComponent.js';
document.addEventListener('DOMContentLoaded', () => {
    NavigationComponent.injectNavigation();
});
```

- [ ] **Step 2: Clean up duplicate CSS/JS references**
Remove any redundant link tags to old CSS files that might conflict with the new design system.

- [ ] **Step 3: Commit**
```bash
git add workspace.html js/workspace-core.js
git commit -m "refactor(workspace): standardize navigation and cleanup dependencies"
```

---

### Task 2: Core Layout Structure (HTML/CSS)

**Files:**
- Modify: `workspace.html`
- Modify: `css/workspace.css`

- [ ] **Step 1: Implement the 3-Column Grid in HTML**
Wrap the current content in a new grid structure.

```html
<main class="workspace-layout">
    <aside class="control-pod">
        <!-- Pomodoro & Task info go here -->
    </aside>
    
    <section class="focus-zone">
        <div id="editor-container"></div>
    </section>
    
    <aside class="vitals-pod" id="vitalsPod">
        <!-- Energy & Attachments go here -->
    </aside>
</main>
```

- [ ] **Step 2: Define Grid CSS with Glassmorphism**
Rewrite the layout part of `workspace.css`.

```css
.workspace-layout {
    display: grid;
    grid-template-columns: 320px 1fr 280px;
    height: calc(100vh - var(--nav-height));
    background: var(--background-color);
    overflow: hidden;
}

.control-pod, .vitals-pod {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}
```

- [ ] **Step 3: Commit**
```bash
git add workspace.html css/workspace.css
git commit -m "feat(workspace): implement 3-column modular layout"
```

---

### Task 3: Control Pod Components (Timer & Task)

**Files:**
- Modify: `workspace.html`
- Modify: `css/workspace.css`

- [ ] **Step 1: Add Pomodoro & Task Card markup**
Move existing timer and task logic into the `control-pod`.

```html
<div class="pod-card timer-card active">
    <h4>POMODORO</h4>
    <div id="timer-display">25:00</div>
    <div class="timer-controls">...</div>
</div>
<div class="pod-card task-card">
    <h4>CURRENT TASK</h4>
    <div id="active-task-name">Select a task...</div>
    <button class="btn-complete">Finish Task</button>
</div>
```

- [ ] **Step 2: Style with "Grind Red" accents**
Apply the primary color to active states.

```css
.timer-card.active {
    border-color: var(--primary-color);
    box-shadow: 0 0 15px rgba(255, 45, 85, 0.3);
}
#timer-display {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary-color);
}
```

- [ ] **Step 3: Commit**
```bash
git add workspace.html css/workspace.css
git commit -m "feat(workspace): add timer and task cards to control pod"
```

---

### Task 4: Vitals Pod & Collapsible Logic

**Files:**
- Modify: `workspace.html`
- Modify: `js/workspace-ui.js`

- [ ] **Step 1: Implement Vitals Pod components**
Add Energy chart and Attachments section.

- [ ] **Step 2: Add toggle logic for Vitals Pod**
Allow the right sidebar to collapse on small screens.

```javascript
export function toggleVitals() {
    const pod = document.getElementById('vitalsPod');
    pod.classList.toggle('collapsed');
}
```

- [ ] **Step 3: Commit**
```bash
git add workspace.html js/workspace-ui.js
git commit -m "feat(workspace): implement vitals pod and collapsible sidebar"
```

---

### Task 5: Focus Zone Refactor (Floating Toolbar)

**Files:**
- Modify: `js/workspace-core.js`
- Modify: `css/workspace.css`

- [ ] **Step 1: Refactor Quill Initialization**
Ensure the toolbar is set to `false` in initialization and only use the `floatingToolbar`.

- [ ] **Step 2: Style the Floating Toolbar HUD**
Ensure it follows the selection precisely with a sleek glass look.

- [ ] **Step 3: Commit**
```bash
git add js/workspace-core.js css/workspace.css
git commit -m "feat(workspace): refactor editor to use floating formatting HUD"
```

---

### Task 6: Final Polish & Interactions

**Files:**
- Modify: `css/design-tokens.css`
- Modify: `css/workspace.css`

- [ ] **Step 1: Apply global transitions and hover states**
Ensure all buttons use `cursor: pointer` and scale(1.02) on hover.

- [ ] **Step 2: Implement "Focus Dimming"**
Dim the sidebars when the timer is active.

- [ ] **Step 3: Commit**
```bash
git add css/workspace.css
git commit -m "style(workspace): final polish and focus dimming interactions"
```
