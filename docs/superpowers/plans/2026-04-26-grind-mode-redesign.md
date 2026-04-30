# Grind Mode Redesign (Bento Grid 2.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `grind.html` into a high-performance, stats-heavy dashboard matching the approved Bento Grid design.

**Architecture:** 12-column CSS Grid layout with Sidebar Focus. Modular JS controllers managing SVG-based UI components (Timer ring, Energy wave).

**Tech Stack:** HTML5, CSS3 (Grid/Flex), Vanilla JS, SVG, Bootstrap Icons.

---

### Task 1: Layout & Design Tokens

**Files:**
- Create: `css/pages/grind-redesign.css`
- Modify: `grind.html`

- [ ] **Step 1: Initialize CSS Variables**
Create `css/pages/grind-redesign.css` with the approved color palette and layout tokens.

```css
:root {
  --bg-deep: #0b141d;
  --bg-card: #121e29;
  --accent-cyan: #00a3c4;
  --accent-amber: #f09b3b;
  --text-main: #ffffff;
  --text-muted: #94a3b8;
  --card-border: rgba(255, 255, 255, 0.05);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --bento-gap: 1.5rem;
}

body.grind-redesign {
  background-color: var(--bg-deep);
  color: var(--text-main);
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

- [ ] **Step 2: Update `grind.html` Entry Point**
Add the `grind-redesign` class to the body and link the new CSS file in the `<head>`.

- [ ] **Step 3: Define Main Grid Container**
Add the 12-column Bento Grid structure to `grind.html`.

```html
<main class="grind-container">
  <div class="focus-column"> <!-- 8 cols -->
    <div id="nowFocusingCard" class="bento-card"></div>
    <div id="timerCard" class="bento-card"></div>
  </div>
  <aside class="queue-column"> <!-- 4 cols -->
    <div id="taskQueueCard" class="bento-card"></div>
  </aside>
  <div class="stats-row"> <!-- Footer grid -->
    <div id="fatigueCard" class="bento-card small"></div>
    <div id="sleepCard" class="bento-card small"></div>
    <div id="cognitiveCard" class="bento-card small"></div>
    <div id="streakCard" class="bento-card small"></div>
    <div id="energyCurveCard" class="bento-card wide"></div>
  </div>
</main>
```

- [ ] **Step 4: Commit**
`git add grind.html css/pages/grind-redesign.css && git commit -m "feat: initialize bento layout and design tokens"`

---

### Task 2: Modern Pill Navigation Header

**Files:**
- Modify: `grind.html`
- Modify: `css/pages/grind-redesign.css`

- [ ] **Step 1: Refactor Header HTML**
Replace the existing header with the new pill-nav structure.

```html
<header class="redesign-header">
  <div class="header-left">
    <div class="brand">GPAce</div>
    <div class="date-pill" id="currentDate"></div>
  </div>
  <nav class="pill-nav">
    <a href="#" class="active"><i class="bi bi-lightning-fill"></i> Grind Mode</a>
    <a href="#"><i class="bi bi-list-task"></i> Task Queue</a>
    <a href="#"><i class="bi bi-building"></i> Grind Station</a>
  </nav>
  <div class="header-right">
    <div class="session-pill"><span id="sessionCount">2</span> sessions</div>
    <button class="icon-btn"><i class="bi bi-bell"></i></button>
    <div class="avatar" id="userAvatar">SR</div>
  </div>
</header>
```

- [ ] **Step 2: Style Header & Navigation**
Apply glassmorphism and cyan highlights to the header elements in `grind-redesign.css`.

- [ ] **Step 3: Commit**
`git commit -m "feat: implement modern pill navigation header"`

---

### Task 3: "Now Focusing" Card & Actions

**Files:**
- Modify: `js/controllers/TaskDisplayController.js`
- Modify: `css/pages/grind-redesign.css`

- [ ] **Step 1: Update Task Card Template**
Modify `TaskDisplayController.js` to render the high-priority card with approved actions (Mark complete, Switch task, Ask Gemini).

- [ ] **Step 2: Style Task Card**
Implement the specific spacing, priority tags (soft red/amber), and button styles in `grind-redesign.css`.

- [ ] **Step 3: Commit**
`git commit -m "feat: implement redesigned Now Focusing task card"`

---

### Task 4: Circular SVG Focus Timer

**Files:**
- Modify: `js/controllers/TimerController.js`
- Modify: `css/pages/grind-redesign.css`

- [ ] **Step 1: Implement SVG Ring Rendering**
Update `TimerController.js` to handle the circular progress bar using `stroke-dasharray`.

- [ ] **Step 2: Add Preset Duration Selectors**
Implement the 25m/45m/60m preset pills within the timer card.

- [ ] **Step 3: Commit**
`git commit -m "feat: implement circular SVG timer with preset controls"`

---

### Task 5: Sidebar Task Queue ("Up Next")

**Files:**
- Modify: `js/controllers/TaskDisplayController.js`
- Modify: `css/pages/grind-redesign.css`

- [ ] **Step 1: Implement Vertical Queue Component**
Update the rendering logic in `TaskDisplayController.js` for the sidebar queue, including the colored left border for priority.

- [ ] **Step 2: Add "Completed Today" Section**
Implement the collapsible completed tasks section at the bottom of the sidebar.

- [ ] **Step 3: Commit**
`git commit -m "feat: implement vertical Up Next sidebar queue"`

---

### Task 6: Performance Statistics Grid

**Files:**
- Modify: `js/controllers/EnergyController.js`
- Modify: `css/pages/grind-redesign.css`

- [ ] **Step 1: Fatigue & Sleep Widgets**
Implement the numeric gauge for Fatigue and the duration card for Last Sleep.

- [ ] **Step 2: Cognitive Load & Streak Widgets**
Implement the horizontal progress bar for Cog-Load and the 7-day activity grid for Streak.

- [ ] **Step 3: Energy Curve Wave SVG**
Update `EnergyController.js` to render the wave-style energy chart using a smooth SVG path.

- [ ] **Step 4: Commit**
`git commit -m "feat: implement performance statistics Bento grid"`

---

### Task 7: Transitions & Final Polish

**Files:**
- Modify: `css/pages/grind-redesign.css`

- [ ] **Step 1: Add Hover & Focus Transitions**
Implement smooth 200ms transitions for all interactive cards and buttons.

- [ ] **Step 2: Verification Run**
Run a full visual check against Target 1 & 2 mockups.

- [ ] **Step 3: Commit**
`git commit -m "ui: finalize transitions and accessibility polish"`
