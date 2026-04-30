# Daily Calendar / Daily Drip — Page Override

Inherits from MASTER.md. Page-specific deviations follow the calm-config aesthetic shared with `study-spaces.md`.

## 1. Mood
- **Schedule clarity over decoration**. The user's eye should land on the active block first.
- Cool palette dominant; Class=cyan, Study=violet, Break=mint, Free=neutral dashed.

## 2. Color Override
- `--accent` = `oklch(0.65 0.13 217)` (cyan-blue)
- Class blocks: hue 217 (cyan)
- Study blocks: hue 280 (violet)
- Break blocks: hue 160 (mint)
- Free blocks: neutral, dashed border
- NOW indicator: red `oklch(0.65 0.18 25)` — only "hot" color on the page

## 3. Layout (top-to-bottom)
1. Wake / Active-window / Sleep strip (3-col card, gradient center cell)
2. Selected-task card (filled when a block is selected, empty state otherwise)
3. Stats trio (Total available / Study time / Scheduled)
4. View tabs + date pill row
5. Schedule canvas — vertical timeline with hour ticks, 15-min subticks, NOW pill, type-coloured blocks
6. Legend bar with totals summary

## 4. Backend Contract (Real Data Only)
- Wake/Sleep/Buffer values: from `dailySchedule` localStorage (written by Daily Setup page)
- Active window = sleepTime − wakeTime − buffers
- Schedule blocks: from `/api/timetable` via `CalendarService.loadEvents()` filtered by `currentDate`
- Selected task: from click selection OR `currentTaskManager.getCurrentTask()`
- Stats trio: from `CalendarService.calculateDailyStats(currentDate)`

## 5. Page-specific Anti-patterns
- ❌ No emoji. Bootstrap Icons only.
- ❌ No fake/demo blocks. If `/api/timetable` returns empty, show empty state.
- ❌ NOW pill must reflect actual `new Date()` — never freeze to a demo time.
- ❌ No red CTA except the NOW indicator.
