# 🛡️ MASTER HANDOVER & SAFETY DIRECTIVE FOR NEXT AI

> **Target Goal**: Execute [.claude/plans/plan.md](file:///d:/Trinno/shit-or-hit/.claude/plans/plan.md) with absolute zero regression risk across the 33 existing components and forensic telemetry engines of **SHIT OR HIT**.

---

## ⚠️ NON-NEGOTIABLE SAFETY CONSTRAINTS (READ FIRST)

Before touching a single line of code, the AI executing this plan must adhere to these ironclad rules:

1. **Mandatory Master Audit Compliance**:
   - `npm run audit` (`node scripts/audit-system.js`) tests all 10 system suites and runs a full Vite production build.
   - **Baseline Status**: `43 PASSED | 0 FAILED`.
   - After *each phase* of changes, `npm run audit` MUST be run. A regression of even 1 test is an immediate failure and must be reverted/fixed before proceeding.
2. **Git Commit Series Standard**:
   - The active series prefix is `D` (e.g., `D190` was the last pushed commit).
   - All new commits must follow the sequential numbering: `D191`, `D192`, `D193`, etc.
   - Dual-push is active: every commit must be pushed to both `origin main` (GitHub) and `gitlab main` (GitLab).
3. **Zero Data Loss Guarantee**:
   - Never overwrite or wipe `data/entries.json`, `data/reports.json`, or user settings.
   - Maintain multi-user partition keys (`getDbStorageKey`, `getEffectiveUserId`).
4. **Preserve Neobrutalist Design System**:
   - Bold 2px/3px black borders, hard offset box-shadows (`shadow-[Xpx_Xpx_0px_#000000]`), retro typography, and curated palettes must not be replaced by generic styles.
5. **Backwards Compatibility**:
   - Any API schema validation or frontend tracking added must be backwards-compatible with existing legacy records.

---

## 🗺️ PHASE-BY-PHASE EXECUTION ROADMAP

The AI should work sequentially through these 4 distinct phases, verifying each phase before starting the next:

### Phase 1: API Documentation & Schema Enforcement (Backend)
- **OpenAPI / Swagger UI**:
  - Add `swagger-ui-express` (or lightweight OpenAPI route) serving at `/api/docs`.
  - Document all endpoints: `/api/entries`, `/api/monthly-report`, `/api/ai-evaluate`, `/api/stickers`, etc.
- **Schema Validation**:
  - Implement request validation middleware (e.g. using `joi` or custom schema validator) for `POST /api/entries`, `POST /api/monthly-report`.
  - Ensure validation returns clean, informative 400 responses on malformed payloads without crashing the server.
  - **Verification**: Run curl/fetch tests on both valid and invalid payloads.

### Phase 2: Enhanced Structured Logging & Error Monitoring
- **Structured Logging (Winston / Pino)**:
  - Replace raw `console.log` in `server/index.js` with structured JSON / colorized console logger.
  - Separate debug/info logs from error logs.
- **Frontend Error Boundaries**:
  - Implement a React `ErrorBoundary` component styled with the Neobrutalist aesthetic so if an unexpected component error occurs, it renders a graceful fallback instead of a blank screen.
  - Include optional Sentry integration hooks (controlled by environment variables so it remains functional without requiring mandatory cloud keys).

### Phase 3: Automated End-to-End (E2E) Testing (Playwright)
- **Setup Playwright**:
  - Install `@playwright/test` and necessary browser binaries in a headless, lightweight manner.
  - Add `npm run test:e2e` to `package.json`.
- **Core User Flow Specs**:
  - Flow 1: Daily verdict submission (rating 1–5, notes entry, tag selection).
  - Flow 2: Calendar & Timeline inspection (modal opening, date navigation).
  - Flow 3: Monthly Dossier modal opening and storyline chapter inspection.
  - Flow 4: Creative Studio / Wallpaper export dialog trigger.
- **Safety**: Ensure tests run against a test or mocked dataset so real journal entries in `data/entries.json` are never corrupted.

### Phase 4: Performance Auditing & Web Vitals
- **Lighthouse / Web Vitals**:
  - Add an automated audit script (e.g. `npm run audit:perf`) using `@lhci/cli` or Lighthouse API to evaluate Core Web Vitals (FCP, LCP, CLS, FID).
  - Add Web Vitals telemetry logging in development.
- **Verification**: Run `npm run audit` + `npm run test:e2e` + `npm run audit:perf`.

---

## 📋 PRE-WRITTEN PROMPT FOR THE NEXT AI SESSION

```markdown
Hello Antigravity / Gemini! You are taking over work on the repository `shit-or-hit` (Trinno) to implement the comprehensive Project Improvement Plan described in `.claude/plans/plan.md`.

CRITICAL INSTRUCTIONS & CONSTRAINTS:
1. READ FIRST: Open and review `.claude/plans/HANDOVER_INSTRUCTIONS.md` and `.claude/plans/plan.md` to understand the architecture.
2. CURRENT STATUS: The master audit currently passes with `43 PASSED | 0 FAILED` (`npm run audit`). You must NOT break any existing component or test suite!
3. COMMIT CONVENTION: Commit prefix is `D191` (next after D190). All commits must follow this format and be pushed to both GitHub (`origin main`) and GitLab (`gitlab main`).
4. EXECUTION METHODOLOGY: Work systematically through Phase 1 (API Docs & Schema Validation), Phase 2 (Structured Logging & Error Boundaries), Phase 3 (Playwright E2E Tests), and Phase 4 (Performance Auditing).
5. VERIFICATION: Run `npm run audit` after every single phase to guarantee zero regressions.
6. TAKE YOUR TIME: Be exceptionally thorough, write clean tests, double-check all edge cases, and ensure maximum production stability.

Let's begin by reviewing the project structure and starting Phase 1.
```
