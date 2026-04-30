---
name: ui-ux-pro-max
description: Professional UI/UX design intelligence for standardizing and fixing application interfaces with industry-specific reasoning and high-end aesthetics.
---

# UI UX PRO MAX

## Core Workflow: Research → Design System → Implementation → Validation

### 1. Research Phase (Multi-Domain Analysis)
When performing UI/UX tasks, analyze the following domains:
*   **Product:** Match request to industry categories (e.g., Education/SaaS/Fintech).
*   **Style:** Identify best matching UI styles (e.g., Glassmorphism, Minimalism, Bento Grid).
*   **Color:** Select industry-appropriate palettes (e.g., trust-based for Fintech, calm for Wellness).
*   **Typography:** Find curated font pairings (Google Fonts).

### 2. Design System Generation
Synthesize research into a cohesive design system:
*   **Match Product to Rules:** Apply industry-specific reasoning (e.g., "Student Dashboard" requires clarity and focus).
*   **Filter Anti-Patterns:** Identify what to avoid (e.g., excessive AI gradients, non-standard layouts).
*   **Generate Output:**
    *   **Pattern:** Logical page structure.
    *   **Style:** Visual keywords and effects.
    *   **Colors:** Hex codes for Primary, Secondary, CTA, BG, and Text.
    *   **Typography:** Font families and moods.
    *   **Checklist:** Pre-delivery validation steps.

### 3. Persistence & Hierarchical Retrieval
Maintain consistency across the project:
1.  **Generate Master:** Save global rules to `design-system/MASTER.md`.
2.  **Generate Overrides:** Save page-specific deviations to `design-system/pages/[page-name].md`.
3.  **Retrieval Logic:** Prioritize page-specific overrides over Master rules.

### 4. Implementation Phase
Generate/Update code based on the design system:
*   **Apply Styles:** Use specific hex codes, spacing, and typography.
*   **Interactions:** Implement smooth transitions (150-300ms) and hover states.
*   **Accessibility:** Ensure WCAG AA compliance (4.5:1 contrast).

### 5. Validation (Pre-Delivery Checklist)
*   [ ] **No Emojis as Icons:** Use SVG libraries (Heroicons/Lucide/Bootstrap Icons).
*   [ ] **Clickable Elements:** Ensure `cursor: pointer` is applied to buttons/links.
*   [ ] **Transitions:** Smooth transitions on all hover/active states.
*   [ ] **Contrast:** Minimum 4.5:1 for text.
*   [ ] **Responsiveness:** Validated across mobile/tablet/desktop.

## Industry-Specific Reasoning
*   **Education/LMS (GPAce):** Focus on focus, clarity, organization, and calming but motivating colors.
*   **SaaS/Tech:** Use Bento grids, Aurora UI, and feature-rich showcases.
*   **Healthcare:** Calm colors (Sage/Blue), high accessibility.
