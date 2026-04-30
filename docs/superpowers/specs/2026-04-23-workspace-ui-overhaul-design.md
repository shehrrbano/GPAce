# Design Spec: Workspace UI/UX Overhaul (Modular Command Center)

**Date:** 2026-04-23
**Status:** Approved
**Project:** GPAce Workspace

## 1. Objective
Transform the `workspace.html` from a cluttered, high-density layout into a professional, "Modular Command Center" that balances deep work with high-intensity productivity tracking (Pomodoro, Energy, Tasks).

## 2. Architecture & Layout
The workspace will transition to a **Three-Column Fixed Layout** with a collapsible right sidebar.

### 2.1 Header
*   **Standardization:** Use `NavigationComponent.js` to inject the `.pm-nav` header.
*   **Behavior:** Scroll-hide enabled to maximize vertical space for the editor.

### 2.2 Control Pod (Left Sidebar - Fixed 320px)
*   **Purpose:** Houses the primary "Grind" controls. Non-scrollable to ensure status is always visible.
*   **Components:**
    *   **Pomodoro Timer Card:** Large, high-contrast display. Grind Red (`#FF2D55`) glow effect when active.
    *   **Current Task Card:** Displays active task name, priority tag, and a "Complete" button.
    *   **Quick Switcher:** Mini-list of next 2 upcoming tasks.

### 2.3 Focus Zone (Center - Fluid)
*   **Purpose:** Deep work area for writing/studying.
*   **Components:**
    *   **Editor Container:** Glassmorphic background with increased internal padding (40px).
    *   **Floating Toolbar:** Refactor the Quill toolbar into a floating HUD that appears on text selection or cursor focus.
    *   **Status Bar (Bottom):** Minimalist word/character count and "Last Saved" timestamp.

### 2.4 Vitals Pod (Right Sidebar - Collapsible 280px)
*   **Purpose:** Performance tracking and context.
*   **Components:**
    *   **Energy Levels:** Vertical holographic chart visual.
    *   **Task Attachments:** Simplified list of files associated with the current task.
    *   **AI Sidekick:** Mini-chat interface for quick queries.

## 3. Visual Language (UI UX PRO MAX)
*   **Theme:** Dark Mode (Base: `#0A0A0A`).
*   **Surfaces:** Glassmorphism (`#1E1E1E`, 0.8 opacity, `blur(12px)`).
*   **Borders:** `1px solid rgba(255, 255, 255, 0.1)`.
*   **Accents:** 
    *   **Primary:** Grind Red (`#FF2D55`) for time and urgency.
    *   **Secondary:** Electric Blue (`#00B2FF`) for info and focus.
*   **Typography:** Inter (Standardized weights: 400 for body, 700 for labels).

## 4. Interactions & Logic
*   **State Sync:** Changing the "Current Task" updates Attachments and Editor content via existing `DataSyncManager`.
*   **Focus Dimming:** When the timer is active, the Right Sidebar dims to 20% opacity.
*   **Responsiveness:**
    *   `> 1440px`: Full 3-column.
    *   `1024px - 1440px`: Right Sidebar collapses to an icon toggle.
    *   `< 1024px`: Mobile mode (Editor full-screen, Pods move to drawers).

## 5. Success Criteria
*   [ ] Navigation is consistent with the rest of the app.
*   [ ] Zero scrolling required to see the Timer or Active Task.
*   [ ] Workspace feels modern and "Pro" (clean spacing, smooth transitions).
*   [ ] Accessibility: Contrast ratio min 4.5:1.
