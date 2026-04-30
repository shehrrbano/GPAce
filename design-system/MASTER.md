# GPAce Master Design System (UI UX PRO MAX)

## 1. Product Context
*   **Domain**: Education / Student Productivity
*   **Target**: High-performance students
*   **Vibe**: Modern, Focused, "Grind" culture, Tech-forward.

## 2. Visual Style (Style: Glassmorphism / Dark Mode)
*   **Base**: Dark background (#0A0A0A)
*   **Surfaces**: Lighter grey (#1E1E1E) with 0.8 opacity and `backdrop-filter: blur(12px)`.
*   **Border**: 1px solid rgba(255, 255, 255, 0.1).
*   **Radius**: 12px for cards, 30px for "pills".
*   **Shadows**: Subtle soft shadows `0 4px 20px rgba(0, 0, 0, 0.5)`.

## 3. Color Palette
*   **Primary (Action)**: #FF2D55 (Grind Red/Pink)
*   **Secondary**: #00B2FF (Electric Blue - for info/accent)
*   **Success**: #00D68F
*   **Background**: #0A0A0A
*   **Surface**: #1A1A1A
*   **Text (Primary)**: #FFFFFF
*   **Text (Secondary)**: #A0A0A0

## 4. Typography
*   **Font**: Inter, system-ui, sans-serif.
*   **Headings**: Semi-bold to Bold.
*   **Body**: Regular, line-height 1.6.

## 5. Navigation Component (Standardized)
*   **Layout**: Fixed top nav.
*   **Height**: 72px.
*   **Logo**: Max-height 50px, left-aligned.
*   **Links**: Pill-style container. Center-aligned.
*   **Active State**: Primary color background (#FF2D55) with white text.
*   **Hover State**: Surface color background with scale(1.02).
*   **Overflow**: "More" menu for screens below 1200px.

## 6. Pre-delivery Checklist
*   [x] Standardized `NavigationComponent.js` used on all pages.
*   [x] All colors pulled from design-tokens.css.
*   [x] Icons use Bootstrap Icons (consistent set).
*   [x] Smooth transitions (cubic-bezier(0.4, 0, 0.2, 1)).
*   [x] Responsive breakpoints verified.

## 7. Biometric HUD Design System (Grind Check)
*   **Primary Scan Color**: `#00F2FF` (Cyan / Biometric Teal)
*   **Secondary Metric Color**: `#FF2D55` (Grind Red)
*   **Typography**: `JetBrains Mono` for all telemetry readouts.
*   **Visual Elements**:
    *   **The Scanner**: Repurposed `EnergyHologram.js` with added rotation speed `+2.5x` during active scan.
    *   **The Pulse Wave**: Real-time updated `energyWaveSvg` with `stroke-width: 2.5` and high-contrast glow.
    *   **Overlay**: Semi-transparent dark overlay (`rgba(10, 10, 10, 0.85)`) with "Scanning" status lines.
*   **Interaction**: 
    *   **Flash Control**: Auto-detects device and toggles torch via `Advanced: [{ torch: true }]`.
    *   **Finger Placement**: Visual guide ring in the center of the hologram.
