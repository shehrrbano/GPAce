# Study Spaces / Daily Setup — Page Override

Overrides MASTER.md for this single page. The "Daily Setup" surface is a **calm, configuration-mode** layer — not the high-energy Grind aesthetic.

## 1. Mood
- **Calm, technical, premium** — student is *configuring* their day, not grinding
- Cool palette dominates over hot accents; warm tones reserved for the wake icon

## 2. Color Override (cool cyan/blue)
- `--accent` = `oklch(0.65 0.13 217)` (cyan-blue, ~`#22d3ee`)
- `--accent-deep` = `oklch(0.50 0.13 217)`
- `--accent-light` = `oklch(0.78 0.10 217)`
- Wake-up icon swatch: warm gold `oklch(0.78 0.13 80)`
- Sleep icon swatch: violet `oklch(0.62 0.16 280)`
- Day arc gradient: gold → cyan → violet (sunrise → midday → night)

## 3. Layout
- **Single column stage**, max-width 1180px, centered, vertical gap 22px
- Three vertically-stacked cards: Productivity Window → Class Timetable → Study Spaces
- No sidebar; rely on injected global header

## 4. Component Patterns
- **Time slots**: numeric tabular-nums display `36px / 700`, AM/PM suffix `16px / 600`
- **Day Arc**: 24h semicircle SVG, 220×130, gradient stroke, two handles (wake/sleep)
- **Discipline mode**: segmented radio (Strict/Flexible/Loose) maps to buffer 0/30/60 min
- **Active window pill**: cyan gradient, tabular-nums for the duration value
- **Dropzone**: dashed border, hover glows cyan; supports PDF/PNG/JPG/ICS/CSV
- **Study space cards**: per-card hue token (`--card-hue`) derived deterministically from name
- **Status chip**: green when saved, amber when unsaved

## 5. Backend Contract (Real Data Only)
Cards must render real persisted fields — never placeholders:
- `amenities.length` → "amenities" stat
- `createdAt` → relative date for "added"
- `lastModified` → relative time for "last used"
- Icon picked deterministically from name hash; hue picked deterministically from id/name

## 6. Page-specific Anti-patterns
- ❌ No emoji icons — use Bootstrap Icons or inline SVG only
- ❌ No fake "sessions" / "open tasks" counters that aren't tracked
- ❌ No red CTA on this page — primary action is the cyan gradient button
- ❌ No card hover scale (subtle translateY only — this is config, not browse)
