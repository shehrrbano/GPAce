# Fix Workspace Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the Workspace Vitals toggle to ensure smooth, functional, and pixel-perfect transitions while maintaining accessibility and standard GPAce aesthetics.

**Architecture:** Move the toggle trigger to a persistent location (floating or part of the status bar) and utilize CSS Grid Area manipulation for the layout shift.

**Tech Stack:** Vanilla CSS (Grid/Flex), JavaScript (ESM).

---

### Task 1: Persistent Toggle Implementation

**Files:**
- Modify: `workspace.html`
- Modify: `css/workspace.css`
- Modify: `js/workspace-ui.js`

- [ ] **Step 1: Relocate the Toggle Button in HTML**
- [ ] **Step 2: Define Floating Styles in CSS**
- [ ] **Step 3: Update Toggle Logic in JS**
- [ ] **Step 4: Commit**

### Task 2: Layout Grid Synchronization

**Files:**
- Modify: `css/workspace.css`

- [ ] **Step 1: Fix Grid Template Logic**
- [ ] **Step 2: Refine Sidebar Transition**
- [ ] **Step 3: Verify Pixel-Perfect Spacing**
- [ ] **Step 4: Commit**

### Task 3: UX Polish & State Persistence

**Files:**
- Modify: `js/workspace-ui.js`

- [ ] **Step 1: Implement State Recovery on Load**
- [ ] **Step 2: Add Haptic Feedback/Animations**
- [ ] **Step 3: Final Validation**
- [ ] **Step 4: Commit**
