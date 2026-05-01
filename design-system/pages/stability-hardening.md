# GPAce Stability & Professionalism Design System

## Core Goal
Provide a "frictionless flow" for students by ensuring the app stays logged in and boots cleanly without visual or technical errors.

## Auth Persistence Strategy (UX Fix)
- **Standard:** Use Firebase Auth Persistence `LOCAL`.
- **UX Rule:** Upon page load, show a loading skeleton or the last known UI state while `onAuthStateChanged` resolves. 
- **Friction Reduction:** Do not redirect to `landing.html` or show a login modal unless the auth state is explicitly `null` after a 3-second grace period.

## Console Sanitization (Technical UX)
- **Rule:** No `console.error` or `console.warn` for expected states (e.g., "No Gemini keys found" should be `debug` or a subtle UI hint in settings, not a warning).
- **Silent Failures:** Services like `AlarmDataService` and `GoogleDriveAPI` must catch their own initialization errors and fail silently regarding the global console.

## Performance (Boot UX)
- **Rule:** Reduce reliance on `babel-standalone`. Critical scripts should be standard ESM.
- **Side Drawer:** Must be a valid JS class to prevent syntax errors that block navigation.

## Validation Checklist
- [ ] No "Unexpected token" errors on load.
- [ ] User remains logged in across refreshes.
- [ ] Console contains < 3 non-app-breaking logs on boot.
- [ ] Side drawer opens immediately on click.
