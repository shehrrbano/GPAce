# Design Spec: Workspace Responsive Redesign (Option A)

Redesign the GPAce Workspace to be fully responsive across Desktop, Tablet, and Mobile using a sidebar-centric approach.

## 1. Architectural Strategy: Sidebar Integration

Move all horizontal ribbon tools (Insert, AI & Voice, Export) into a unified vertical navigation/sidebar system.

### Breakpoints & Layouts

- **Desktop (> 1024px)**: 
  - Fixed 250px Sidebar on the left.
  - Sections: "Workspace Tools", "Insert", "AI & Voice", "Export".
  - Main Editor expands to `calc(100vw - 250px)`.
- **Tablet (768px - 1024px)**:
  - Collapsed 60px Icon Rail.
  - Sidebar headers hidden or moved to hover tooltips.
  - Main Editor expands to `calc(100vw - 60px)`.
- **Mobile (< 768px)**:
  - Left sidebar hidden (`display: none`).
  - **Bottom Tab Bar**: Fixed at bottom, height 60px.
  - **Icons**: AI Dictate, Summarize, Insert Image, Export PDF.
  - "More" menu for secondary tools.

## 2. Components & UI Changes

### Sidebar (`aside.attachments-pane` refactor)
- Rename or split current `attachments-pane` to handle both "Workspace Tools" (Timer/Energy) and "Editor Tools".
- Group tools vertically with clear separators.
- Preserve existing JS IDs for mic, summary, export buttons to keep event listeners functional.

### Bottom Tab Bar (New Component)
- HTML: `<nav class="mobile-tab-bar">`
- CSS: `position: fixed; bottom: 0; left: 0; right: 0; display: none;` (visible only on mobile media query).
- Items:
  - Dictate (Mic icon)
  - Summarize (Lightning icon)
  - Insert (Image icon)
  - Export (PDF icon)

### Editor Area
- Adjust padding on `focus-zone` and `editor-container` for mobile to prevent content clipping.
- Ensure status bar remains visible or adapts to mobile view.

## 3. Implementation Details

- **Framework**: Standard CSS (Flexbox/Grid). **No Tailwind** as per project convention.
- **Transitions**: Smooth 0.3s transitions for sidebar collapse/expand.
- **Accessibility**: Ensure tab bar icons have `aria-label`.

## 4. Verification Plan

- [ ] **Desktop**: Verify 250px sidebar with all tool groups visible.
- [ ] **Tablet**: Verify sidebar collapses to 60px rail with icon-only view.
- [ ] **Mobile**: Verify sidebar is hidden and bottom tab bar appears with correct 4 icons.
- [ ] **Functionality**: Confirm AI Dictation, Summarization, and Export buttons still trigger correct actions in all views.
