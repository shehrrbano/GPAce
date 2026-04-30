# Design Doc: Grind Mode Redesign (Bento Grid 2.0)

**Date:** 2026-04-26
**Status:** Approved
**Topic:** Modernizing the `grind.html` dashboard into a stats-heavy Bento Grid layout.

---

## 1. Goal
Transform the existing `grind.html` page into a high-performance, visually stunning dashboard that mirrors the "Target 2" mockup style. The redesign prioritizes a balance between immediate task focus and long-term performance tracking (stats).

## 2. Visual Style & Brand
- **Style:** Modern Glassmorphism / Bento Grid / Deep Dark UI.
- **Background:** `#0B141D` (Deep Blue-Black).
- **Surface/Cards:** `#121E29` (Slightly lighter blue for elevation).
- **Primary Accent (Focus):** `#00A3C4` (Cyan/Teal).
- **Secondary Accent (Break):** `#F09B3B` (Amber/Orange).
- **Text:** High-contrast White for primary, `#94A3B8` (Muted Blue-Gray) for secondary.
- **Interactions:** Smooth transitions (200ms) and subtle glows on active elements.

## 3. Architecture & Components

### 3.1 Header & Navigation
- **Structure:** Logo (Left), Pill-shaped Nav (Center), User Actions (Right).
- **Navigation Items:** Grind Mode (Active), Task Queue, Grind Station, Daily Drip, Brain Juice.
- **Indicators:** Active session count pill, Notification bell, Settings gear, User avatar.

### 3.2 Focus Column (Left)
- **Now Focusing Card:** Large card displaying current task name, subject, priority tag, and deadline. Includes primary actions: "Mark complete", "Switch task", and "Ask Gemini".
- **Compact Circular Timer:** Circular SVG timer replacement for the legacy box timer. Includes Focus/Break mode toggles, duration presets (25/45/60m), and playback controls (Reset, Play/Pause, Skip).

### 3.3 Task Queue Sidebar (Right)
- **"Up Next":** Vertical list of upcoming tasks.
- **Visuals:** Priority color-coded bars on the left, checkboxes for completion, and metadata (Subject, Time/Day) below task titles.
- **Completed Section:** Collapsible list showing recently finished tasks.

### 3.4 Stats Bento Grid (Bottom)
- **Fatigue:** Percentage gauge with "SHARP/TIRED" status label.
- **Last Sleep:** Duration (h) with a 7-day quality bar chart.
- **Cognitive Load:** Numeric points with a horizontal progress bar.
- **Streak:** Day count with a 7-day activity grid.
- **Energy Curve:** Full-width footer card featuring a wave-style SVG chart representing predicted energy levels throughout the day.

## 4. Technical Integration
- **Layout Engine:** CSS Grid (12-column) with Flexbox for internal component alignment.
- **Dependencies:** 
    - `TimerController.js`: Updated to handle circular SVG progress.
    - `TaskDisplayController.js`: Updated to render the new "Now Focusing" and "Up Next" layouts.
    - `EnergyController.js`: Updated to render the new Energy Curve and Fatigue widgets.
- **Responsiveness:** Grid will collapse to a single column on mobile, prioritizing Task and Timer over secondary stats.

## 5. Success Criteria
- [ ] Visual parity with approved mockups (Target 2 theme + Target 1 circular timer).
- [ ] No regression in existing task sync or timer logic.
- [ ] WCAG AA contrast compliance (4.5:1) for all text.
- [ ] Fluid responsive transition between mobile and desktop views.
