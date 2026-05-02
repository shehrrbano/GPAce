# Global UI Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the app by removing redundant "Force Sync" buttons, legacy pink buttons, and dangerous "Delete All" actions to achieve a professional Grind Mode aesthetic.

**Architecture:** 
- **UI/HTML:** Removing template strings and hardcoded HTML for identified redundant buttons.
- **JS Logic:** Disconnecting event listeners while preserving internal sync functions for background operations.
- **CSS:** Replacing legacy pink hex codes with design-system approved accents.

**Tech Stack:** JavaScript (ESM/Legacy), CSS, HTML.

---

### Task 1: Remove "Force Sync" from Study Spaces

**Files:**
- Modify: `js/controllers/StudySpaceController.js`
- Modify: `js/studySpacesFirestore.js`

- [ ] **Step 1: Remove Force Sync button from StudySpaceController template**
Remove the button HTML inside the `displayStudySpaces` or initialization methods.

- [ ] **Step 2: Remove UI event binding for Force Sync**
Comment out or remove the click listener in `setupFormHandlers`.

---

### Task 2: Remove "Force Sync" from Semester Management

**Files:**
- Modify: `js/semester-management.js`

- [ ] **Step 1: Remove Force Sync button from UI**
Locate the HTML injection for `btn-forcesync` and remove it.

- [ ] **Step 2: Remove "Click Force Sync" placeholder text**
Change text that instructs user to click force sync to reflect automatic syncing.

---

### Task 3: Clean up GPA Predictor & Priority List

**Files:**
- Modify: `js/gpa-predictor.js`
- Modify: `js/priority-list-utils.js`

- [ ] **Step 1: Remove Sync Button from GPA Predictor template**
Remove the `<button id="syncBtn">` from the template string.

- [ ] **Step 2: Restyle "Add Subject" and "Reset" buttons**
Remove `btn-legacy-action` and apply standard modern button classes. Replace pink `#ff4b5c` with approved red/accent.

- [ ] **Step 3: Remove Sync Button from Priority List UI**
In `priority-list-utils.js`, remove the code inside `setupSyncButton` that creates and appends the button.

---

### Task 4: Remove Dangerous "Delete All" Actions

**Files:**
- Modify: `js/subject-marks-ui.js`

- [ ] **Step 1: Remove "Delete All Marks" button**
Remove the button template around line 983.

---

### Task 5: Aesthetic Alignment (Global)

**Files:**
- Modify: `css/subject-marks-modern.css`
- Modify: `css/design-tokens.css` (if exists)

- [ ] **Step 1: Remove btn-legacy-action styles**
Clean up the CSS file by removing the unused legacy class definitions.

---

### Task 6: Verification

- [ ] **Step 1: Check All Pages**
Verify no pink "Force Sync" buttons remain on Study Spaces, GPA Predictor, or Priority List.

- [ ] **Step 2: Verify Theme Consistency**
Ensure all buttons now follow the "Grind" design system (Muted dark backgrounds, neon accents, no jarring pink).
