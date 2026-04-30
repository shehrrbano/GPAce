# Task 3: Control Pod Components (Timer & Task) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Pomodoro and Task Card markup to the .control-pod in workspace.html and style them in css/workspace.css.

**Architecture:** Add semantic HTML components to the workspace sidebar and apply glassmorphic styles with Grind Red accents. Ensure integration with existing Pomodoro logic.

**Tech Stack:** HTML5, CSS3 (Glassmorphism), JavaScript (ES Modules).

---

### Task 1: Add Markup to workspace.html

**Files:**
- Modify: `workspace.html`

- [ ] **Step 1: Add Pomodoro Timer and Task Card markup**

Add the following structure inside `<aside class="control-pod">`:

```html
            <!-- Pomodoro Timer Card -->
            <section class="pod-card timer-card" aria-labelledby="timer-heading">
                <h4 id="timer-heading" class="timer-label">Focus Time</h4>
                <div class="timer-display-container">
                    <div id="timer" class="timer-time">25:00</div>
                    <div class="timer-progress-container">
                        <div class="timer-progress"></div>
                    </div>
                </div>
                <div class="timer-controls">
                    <button id="startBtn" class="timer-btn primary" title="Start/Pause">
                        <i class="bi bi-play-fill"></i>
                    </button>
                    <button id="resetBtn" class="timer-btn" title="Reset">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button id="skipBtn" class="timer-btn" title="Skip">
                        <i class="bi bi-skip-forward-fill"></i>
                    </button>
                </div>
                <div class="timer-modes">
                    <button class="timer-mode-btn active" data-mode="focus" data-time="25">Focus</button>
                    <button class="timer-mode-btn" data-mode="break" data-time="5">Break</button>
                </div>
            </section>

            <!-- Current Task Card -->
            <section class="pod-card task-card" aria-labelledby="task-heading">
                <h4 id="task-heading">Active Task</h4>
                <div class="task-info">
                    <div id="active-task-name" class="active-task-name">No active task</div>
                    <button class="btn-complete" title="Complete Task">
                        <i class="bi bi-check-lg"></i>
                        Finish Task
                    </button>
                </div>
            </section>
```

- [ ] **Step 2: Ensure js/pomodoroTimer.js is imported**

Check if `<script src="js/pomodoroTimer.js"></script>` or similar is present. If not, add it before `</body>`.

Note: `js/pomodoroTimer.js` seems to be a non-module script based on its content (no exports, uses `window.pomodoroTimer`).

- [ ] **Step 3: Commit changes**

```bash
git add workspace.html
git commit -m "feat(workspace): add pomodoro and task card markup to control pod"
```

### Task 2: Style Components in css/workspace.css

**Files:**
- Modify: `css/workspace.css`

- [ ] **Step 1: Add styles for Timer and Task cards**

Add the following styles to `css/workspace.css`:

```css
/* Pomodoro Timer Card */
.timer-card {
    text-align: center;
    position: relative;
    overflow: hidden;
}

.timer-time {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--text-color);
    margin: var(--spacing-sm) 0;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 20px rgba(255, 45, 85, 0.2);
    transition: text-shadow 0.3s ease;
}

.timer-card.active .timer-time {
    color: #FF2D55;
    text-shadow: 0 0 30px rgba(255, 45, 85, 0.4);
}

.timer-progress-container {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-bottom: var(--spacing-md);
    overflow: hidden;
}

.timer-progress {
    height: 100%;
    background: #FF2D55;
    width: var(--progress, 0%);
    transition: width 1s linear;
}

.timer-controls {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.timer-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timer-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.timer-btn.primary {
    background: #FF2D55;
    border-color: #FF2D55;
    color: white;
}

.timer-btn.primary:hover {
    background: #ff4d70;
    box-shadow: 0 0 15px rgba(255, 45, 85, 0.4);
}

.timer-modes {
    display: flex;
    gap: var(--spacing-xs);
    background: rgba(0, 0, 0, 0.2);
    padding: 4px;
    border-radius: 8px;
}

.timer-mode-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-color-secondary);
    padding: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.timer-mode-btn.active {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-color);
}

/* Task Card */
.task-card {
    border-left: 4px solid #00B2FF;
}

.task-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.active-task-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
}

.btn-complete {
    background: rgba(0, 178, 255, 0.1);
    border: 1px solid rgba(0, 178, 255, 0.3);
    color: #00B2FF;
    padding: var(--spacing-sm);
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.btn-complete:hover {
    background: #00B2FF;
    color: white;
}
```

- [ ] **Step 2: Commit changes**

```bash
git add css/workspace.css
git commit -m "style(workspace): add styles for pomodoro timer and task card"
```

### Task 3: Verification

- [ ] **Step 1: Check workspace.html in a browser (if possible) or verify markup structure**

Verify that `control-pod` contains the new cards and that the IDs match the expectations of `js/pomodoroTimer.js`.

- [ ] **Step 2: Check for console errors related to pomodoroTimer.js**

Ensure the script loads correctly and finds its elements.
