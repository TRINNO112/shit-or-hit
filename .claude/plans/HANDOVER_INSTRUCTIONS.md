# 🛡️ DEEP-DELIBERATION MASTER HANDOVER & ARCHITECTURAL DIRECTIVE

> **Target Objective**: Autonomously and thoroughly execute [.claude/plans/plan.md](file:///d:/Trinno/shit-or-hit/.claude/plans/plan.md) with extended compute, deep verification loops, and absolute zero regression risk across the 33 production components of **SHIT OR HIT**.

---

## 🧠 THE EXTENDED-COMPUTE & DEEP-DELIBERATION MANDATE

**Why extended time and deep deliberation matter**:
In frontier agentic coding, speed is the enemy of reliability. Rushing leads to shallow mockups, overlooked edge cases, broken state pipelines, and silent data corruption. High-performance software engineering demands **extended test-time deliberation**:
1. **No Shortcuts or Minimum Viable Compromises**: Build complete, battle-tested, production-grade solutions.
2. **Pre-Implementation Adversarial Analysis**: Before altering code, map every dependency, identify failure modes, and draft verification scripts.
3. **Red-Team Self-Critique**: After writing code, actively attempt to break your own implementation with malicious/malformed inputs, boundary conditions, empty states, and offline network environments.
4. **Mandatory Multi-Stage Verification Gates**: An AI must never jump to the next phase until the current phase has passed 100% of its automated tests and audit checkpoints.

---

## 🏛️ FULL REPOSITORY CONTEXT & 33-COMPONENT MAP

The incoming AI must understand the complete landscape of **SHIT OR HIT** (`d:\Trinno\shit-or-hit`):

| Domain | Key Files & Components | Critical Architectural Details |
| :--- | :--- | :--- |
| **Core UI & Navigation** | `Header.jsx`, `MobileAppView.jsx`, `TodayHero.jsx`, `PWAInstallBanner.jsx` | Sliding nav pill, 1-tap rating triggers, anchor score sync, PWA install lifecycle. |
| **Calendar & Timeline** | `CalendarModal.jsx`, `EditDayModal.jsx`, `JourneyTimeline.jsx`, `MonthCalendar.jsx`, `WeekView.jsx` | Chronological matrix, outlier event spheres, timeline inspection, dual-mode entry formatting. |
| **Forensic Analytics & Dossier** | `ForensicStatsModal.jsx`, `StatsWidget.jsx`, `AnalyticsPanel.jsx`, `MonthlyReportModal.jsx` | Telemetry calculations, hit rates, 31-day micro-verdict matrix, multi-act Storyline Chronicle, verified achievements shelf. |
| **Creative Studio & Exports** | `AestheticCardExportModal.jsx`, `AestheticCardVariantDeepseek.jsx`, `YearInPixelsWallpaperEngine.jsx`, `StickerVaultModal.jsx` | HTML5 2D Canvas rasterization, 4K wallpapers, DeepSeek themes, custom sticker persistence. |
| **Habits & Multi-Sphere** | `NonNegotiableCard.jsx`, `NonNegotiablesStudioModal.jsx`, `SettingsModal.jsx`, `RadialClockPicker.jsx` | 3 anchor modes (100% deterministic, 50/50 hybrid, checklist), mechanical 24h radial clock, multi-sphere domain scoring. |
| **Sound & 3D Physics** | `soundEngine.js`, `soundEffects.js`, `Blob3DCanvas.jsx`, `NotFound404.jsx` | Procedural Web Audio oscillators (no external MP3s), interactive 3D blob with spring physics, rim lighting, 5-stage mood escalation. |
| **Backend & Persistence** | `server/index.js`, `services/api.js`, `services/firebase.js`, `data/entries.json`, `data/reports.json` | Express.js on port 5001, Gemini model cascade (`gemini-3.5-flash-lite` -> `gemini-3.1-flash-lite` -> `gemini-3.8-flash`), multi-user account clustering (`getEffectiveUserId`), partitioned storage keys. |

---

## ⚠️ NON-NEGOTIABLE SAFETY CONSTRAINTS

1. **Mandatory Master Audit Compliance (`npm run audit`)**:
   - Script: `node scripts/audit-system.js`
   - Baseline Status: **43 PASSED | 0 FAILED** across 10 system test suites + Vite production bundle.
   - You MUST run `npm run audit` after every single milestone. Any failure or regression must be resolved immediately before moving forward.
2. **Git Commit Series Standard**:
   - Current prefix is **`D191`**.
   - Your next commit MUST be **`D192`**, followed by **`D193`**, **`D194`**, etc.
   - Dual-push is active: every push must target both `origin main` (GitHub) and `gitlab main` (GitLab).
3. **Absolute Zero Data Loss**:
   - Never overwrite or wipe `data/entries.json` or `data/reports.json`.
   - Any automated test MUST use an isolated in-memory or sandbox test directory.
4. **Preserve Neobrutalist Aesthetic System**:
   - Maintain 2px/3px black borders (`border-2 border-black`), sharp offset drop shadows (`shadow-[3px_3px_0px_#000000]`), retro typography, and curated color tokens.

---

## 🗺️ 4-PHASE DETAILED EXECUTION PLAN & VERIFICATION GATES

### 🚪 Phase 1: API Documentation & Schema Validation (Backend)
- **Goal**: Make the Express backend self-documenting and impervious to bad/malformed data.
- **Tasks**:
  1. **OpenAPI / Swagger UI**: Integrate `swagger-ui-express` (or an equivalent static OpenAPI spec) served at `/api/docs`.
     - Document all active endpoints: `GET/POST /api/entries`, `POST /api/monthly-report`, `GET/POST /api/stickers`, `GET /api/health`.
     - Specify exact request schemas, parameter constraints, and response shapes.
  2. **Schema Enforcement Middleware**:
     - Integrate schema validation using `joi` (or strict lightweight schema validator).
     - Build validation middleware for `POST /api/entries` (validating `date` YYYY-MM-DD, `rating` integer 1–5, `notes` string length, `spheres` object shape).
     - Build validation for `POST /api/monthly-report` (validating `year` integer, `month` integer 1–12, `forceReevaluate` boolean).
     - Return clean, structured HTTP 400 error responses with descriptive field errors on invalid payloads.
- **Verification Gate 1**:
  - Test valid requests with curl/fetch (must succeed with HTTP 200).
  - Test malicious/malformed payloads (missing fields, negative ratings, invalid dates) and confirm clean HTTP 400 responses without server crashes.
  - Run `npm run audit` and verify `43 PASSED | 0 FAILED`.
  - Commit: `D192: Implement OpenAPI documentation and Joi request schema validation middleware`.

### 🚪 Phase 2: Structured Logging & Resilient Error Monitoring
- **Goal**: Eliminate blind spots in runtime telemetry and protect the UI from unexpected crashes.
- **Tasks**:
  1. **Structured Logging (Winston)**:
     - Install and configure `winston` in `server/index.js`.
     - Define dual transports: colorized console output for dev, and structured JSON logs in `logs/server.log` (with automatic log rotation or size capping).
     - Replace raw `console.log` calls with contextual loggers (`logger.info`, `logger.warn`, `logger.error`) capturing request latency, IP, route, and status code.
  2. **Frontend React Error Boundary**:
     - Implement a robust `ErrorBoundary.jsx` component wrapped around primary view hierarchies.
     - Design a gorgeous Neobrutalist fallback card: *"Something went wonky, but your diary data is safe"* with a 1-tap "Reload App" button and error detail toggle.
     - Prepare optional Sentry hooks configured via `import.meta.env.VITE_SENTRY_DSN` so error tracking activates automatically when a DSN is supplied, with zero crashes when unconfigured.
- **Verification Gate 2**:
  - Intentionally trigger a simulated error in a test component; confirm the Error Boundary catches it smoothly with no white screen of death.
  - Inspect `logs/server.log` to confirm structured log entries.
  - Run `npm run audit` and verify `43 PASSED | 0 FAILED`.
  - Commit: `D193: Add Winston structured server logging and Neobrutalist React Error Boundary`.

### 🚪 Phase 3: Automated End-to-End (E2E) Testing (Playwright)
- **Goal**: Autonomous, browser-based regression testing for all core user journeys.
- **Tasks**:
  1. **Playwright Setup**:
     - Install `@playwright/test` as devDependency.
     - Create `playwright.config.js` configured for Chromium in headless mode against `http://localhost:5173`.
     - Add `test:e2e` script to `package.json`.
  2. **Test Suites**:
     - `e2e/verdict.spec.js`: Tests submitting a 1–5 star rating, typing notes, selecting emotion spheres, and verifying immediate timeline reflection.
     - `e2e/calendar.spec.js`: Tests opening CalendarModal, switching months, clicking a day cell, and opening EditDayModal.
     - `e2e/dossier.spec.js`: Tests opening MonthlyReportModal, inspecting storyline chapter tabs, and copying Markdown to clipboard.
     - `e2e/studio.spec.js`: Tests opening AestheticCardExportModal, cycling card variants, and closing cleanly.
  3. **Sandbox Data Isolation**:
     - Ensure tests use isolated session storage / mock storage keys so real diary records are never altered.
- **Verification Gate 3**:
  - Run `npm run test:e2e` and verify 100% of specs pass in headless mode.
  - Run `npm run audit` to confirm the main audit remains `43 PASSED | 0 FAILED`.
  - Commit: `D194: Setup Playwright E2E automated test suite for critical user flows`.

### 🚪 Phase 4: Automated Performance Auditing & Core Web Vitals
- **Goal**: Continuous monitoring of First Contentful Paint (FCP), Largest Contentful Paint (LCP), and Cumulative Layout Shift (CLS).
- **Tasks**:
  1. **Audit Script**:
     - Create `scripts/audit-performance.js` using Lighthouse or Web Vitals tooling.
     - Add `audit:perf` script to `package.json`.
     - Benchmark key metrics against thresholds: FCP < 1.8s, LCP < 2.5s, CLS < 0.1.
  2. **Performance Telemetry**:
     - Log Web Vitals in dev console using standard `web-vitals` library hooks.
     - Optimize any bundle bottlenecks flagged during the audit.
- **Verification Gate 4**:
  - Run `npm run audit:perf` and verify all Core Web Vitals meet high-performance standards.
  - Run `npm run audit` for the final master check (`43 PASSED | 0 FAILED`).
  - Commit: `D195: Integrate Core Web Vitals performance benchmarking and audit scripts`.

---

## 📋 COPY-PASTE PROMPT FOR THE NEW CHAT SESSION

```markdown
/goal

You are Antigravity taking over the `shit-or-hit` repository (Trinno) to implement the comprehensive Project Improvement Plan in `.claude/plans/plan.md`.

CRITICAL INSTRUCTIONS FOR EXTENDED-COMPUTE AUTONOMOUS EXECUTION:
1. MANDATORY READING: Open and thoroughly read `.claude/plans/HANDOVER_INSTRUCTIONS.md` and `.claude/plans/plan.md`.
2. SYSTEM BASELINE: The master audit currently passes with `43 PASSED | 0 FAILED` (`npm run audit`). You must NOT break any existing component, style, or test suite.
3. COMMIT CONVENTION: The next commit must start with `D192` (following D191). Every commit must be pushed to both `origin main` (GitHub) and `gitlab main` (GitLab).
4. DEEP-DELIBERATION MANDATE: Do NOT rush. Do NOT provide quick or partial compromises. Execute each of the 4 phases sequentially:
   - Phase 1: OpenAPI/Swagger Documentation & Joi Schema Validation Middleware
   - Phase 2: Winston Structured Logging & Neobrutalist React Error Boundary
   - Phase 3: Playwright Automated E2E Test Suite (with sandbox data isolation)
   - Phase 4: Core Web Vitals & Performance Benchmark Pipeline
5. VERIFICATION GATES: At the end of every phase, run `npm run audit` to guarantee zero regressions. Never proceed to the next phase until the current phase passes 100%.
6. AUTONOMOUS COMPLETION: Do not stop until all 4 phases are fully implemented, verified, audited, and committed.

Begin now by reading the handover document and presenting your architectural plan for Phase 1.
```
