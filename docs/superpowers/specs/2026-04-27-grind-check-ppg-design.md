# Design Spec: Focus Calibration (HRV + Student Readiness Predictor)

**Status:** Draft / Pending Review  
**Date:** 2026-04-27  
**System:** PWA (GPAce)  
**Vision:** Clean-Tech "Mental Readiness" interface for students to calibrate focus before a study session.

---

## 1. User Experience (The "Focus Calibration" Workflow)

### 1.1 The Trigger
- Located in the `TelemetryGrid` on the main dashboard (`grind.html`).
- A clean, pulsing "Calibrate" button with a `brain` icon.
- Label: `CALIBRATE FOR [SUBJECT]`

### 1.2 The Calibration (45-60 seconds)
- **Focus Ring**: A minimalist, glowing ring replaces the complex tech-hologram. It stabilizes and turns Cyan as the pulse is detected.
- **Neural Wave**: A smooth, organic wave (repurposing `energyWaveSvg`) shows mental readiness stability.
- **Student HUD Overlay**: 
    - `MENTAL STAMINA: ANALYZING...`
    - `SUBJECT READINESS: [||||||----]`
    - `SESSION LENGTH RECOMMENDATION: 90 MINS`
- **Focus Prompts**: Guided breathing or subject-specific "Mental Priming" quotes.

### 1.3 The Results (Readiness Report)
- **Mental Stamina**: (0-100%) How much cognitive energy is available for the current block.
- **Study Readiness**: (Peak / High / Recovery) - Directly tells the student if they should start their Deep Work.
- **Actionable Advice**: "You are in a high Flow state. Perfect for 'Practice Problems' in Physics. Timer set to 50 mins."

---

## 2. Technical Architecture (Low-Effort PWA Approach)

### 2.1 Signal Capture
- **API**: `navigator.mediaDevices.getUserMedia` with `torch` constraint.
- **Processing**: 
    - Draw video frames to a hidden 50x50 canvas.
    - Average the **Red channel** intensity.
    - **Filtering**: Apply a band-pass filter (0.5Hz - 4Hz) to remove DC noise and high-frequency jitter.
    - **Peak Detection**: Identify R-R intervals using a simple threshold crossing algorithm.

### 2.2 Prediction Logic (Rule-Based v1)
- **Stress**: Inverse relationship with RMSSD (Low HRV = High Stress).
- **Energy**: Based on SDNN + `currentEnergyLevel` trend.
- **Cognitive State**:
    - `RMSSD > 50ms` + `Energy > 5`: "High Cognitive Readiness"
    - `RMSSD < 30ms`: "Mental Fatigue Detected"

---

## 3. UI Components (Repurposed from Codebase)

| Component | Role in Grind Check |
|-----------|----------------------|
| `EnergyHologram.js` | Central Sci-Fi visualization (pulsing rings). |
| `energyWaveSvg` | Live pulse/biometric wave display. |
| `FatigueModal` | Upgraded to the "Scan Results" modal. |
| `grind-react.css` | Premium dark-mode styling and animations. |

---

## 4. Verification Plan

- **Environment**: Mobile PWA (iOS/Android browsers).
- **Edge Cases**:
    - Low light (Flash/Torch check).
    - Inconsistent finger pressure (Signal quality warning).
    - Background task interference (Web Worker offloading).

---

## 5. Implementation Roadmap

1. **Phase 1**: Brainstorming & Spec Review (CURRENT).
2. **Phase 2**: UI-UX Pro Max Design (Mockup the HUD).
3. **Phase 3**: Environment Setup (PWA Camera permissions).
4. **Phase 4**: Implementation (PPG Signal + Analytics).
5. **Phase 5**: Testing & Verification.
