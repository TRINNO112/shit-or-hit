---
name: shit-or-hit-audit-guard
description: Master audit orchestration, database integrity proofs, mathematical invariant verification, Playwright E2E regression guard, and periodic health inspection for the SHIT OR HIT (Daily Verdict) repository.
---

# 🏛️ SHIT OR HIT — Master Audit Guard & Verification Engine

> **Repository**: `TRINNO112/shit-or-hit`  
> **Type**: Private Neobrutalist Daily Verdict, Behavioral Dossier & Habit Tracking Engine  
> **Status**: Local & Cloud Synchronized (Firebase + Express + Vite PWA)

This skill governs the end-to-end verification, mathematical correctness, database schema integrity, and automated testing cadence across all 33 components in `shit-or-hit`.

---

## 🔒 4 Non-Negotiable Directives

1. **Mandatory Audit Gate**:
   Before presenting any work as complete or pushing code, you **MUST** run:
   ```bash
   npm run audit
   ```
   All checks across all 33 components must pass: **46 PASSED | 0 FAILED**.

2. **Commit Series & Dual-Push Mandate**:
   - Use the established **`D` series prefix** for all Git commit messages (e.g. `D209: ...`).
   - Every commit must be pushed to **both** remotes:
     ```bash
     git push origin main; git push gitlab main
     ```

3. **Data Protection Mandate**:
   - **NEVER** overwrite, delete, or wipe real user diaries in `data/entries.json` and `data/reports.json`.
   - Always isolate test runs using localStorage mocks, air-gapped fetch routes, or the backend sandbox (`x-test-sandbox: true`).

4. **Neobrutalism Design Aesthetic**:
   - The UI adheres strictly to Neobrutalism: bold black borders (`border-2 border-black` / `border-3 border-black`), sharp offset drop shadows (`shadow-[3px_3px_0px_#000000]`), retro badges, monospace metadata, and warm energetic color palettes (`#FDC800`, `#00E599`, `#FF4D4D`, `#FFFDF8`). Never replace with bland flat designs.

---

## 🧭 Multi-Tier Verification Cadence Matrix

Use this matrix to determine the required verification command based on the nature of your changes:

| Tier | Command | Latency | When to Run | Scope |
|---|---|---|---|---|
| **Tier 0** | `npm run audit:models` | ~1s | After modifying sphere calculations, habit anchors, or modal state reducers | Pure math proofs, 100-permutation Monte Carlo ratings, zero-util guards, void-prevention state reducer simulation |
| **Tier 1** | `npm run audit:db` | ~30ms | After touching entry schemas, persistence services, or sync routines | Strictly read-only schema validation of `data/entries.json` (27+ entries), `data/reports.json`, and 4 conflict reconciliation rules |
| **Tier 2** | `npm run audit` | ~15s | **Mandatory before every commit and task completion** | Full 33-component AST inspection, sound synthesizer checks, storage isolation, Tier 0, Tier 1, and Vite production compilation |
| **Tier 3** | `npm run audit:perf` | ~5s | After adding canvas renderers, wallpapers, or heavy animations | Web Vitals budget checks, bundle budget assertions, frame-rate stasis |
| **Tier 4** | `npm run test:e2e` | ~30s | After modifying routing, tabs, calendar matrix, or modal interactions | Headless Playwright integration across Desktop & Mobile flows |

---

## 🧮 Mathematical & State Invariants

### 1. Life Spheres Mathematical Invariants
- **Void-Prevention Invariant**:
  When `EditDayModal`, `TodayHero`, or `MobileAppView` mounts with `entryData = null` (an unrecorded day), the sphere collection count **MUST STRICTLY EQUAL** `cfg.filter(s => s.enabled).length` (minimum 3 standard spheres). It must **NEVER** produce an empty list `{}`.
- **Null-Safe Composite Average**:
  $$\text{average} = \frac{\sum_{k \in \text{rated}} r_k}{|\text{rated}|}$$
  - If $|\text{rated}| = 0$, returns `null` (never `NaN` or 0). The day rating falls back to the user's manual rating.
  - If $|\text{rated}| > 0$, $\text{score} = \text{round}(\text{average} \times 10) / 10$, and $\text{tier} = \min(5, \max(1, \text{round}(\text{average})))$.

### 2. Daily Non-Negotiables Utility Invariants
- **Zero-Util Guard**: If `totalUtils === 0`, `calculatedRating` must return `0` (never `NaN` or `Infinity`).
- **Normalized Rating**:
  $$\text{normalized} = \frac{\sum_{a \in \text{checked}} \text{utils}(a)}{\sum_{a \in \text{all}} \text{utils}(a)} \times 5.0$$
- **Deterministic 100% Mode**:
  $$\text{rating} = \min(5, \max(1, \text{round}(\text{normalized})))$$
- **Hybrid 50/50 Mode**:
  $$\text{blended} = \text{round}((0.5 \times \text{userRating} + 0.5 \times \text{normalized}) \times 10) / 10$$
  $$\text{rating} = \min(5, \max(1, \text{round}(\text{blended})))$$

---

## 🗄️ Database & Multi-Source Reconciliation Rules

When syncing entries between client `localStorage`, Firebase Firestore, and the Express backend (`data/entries.json`), the **Reconciliation Engine** (`reconcileEntryItems`) executes 4 absolute rules:

1. **Rule 1 (Absolute Note Protection)**:
   If the existing entry has reflection notes and the incoming candidate has blank notes, **NEVER wipe the notes**. Keep the existing notes and rating.
2. **Rule 2 (Authentic Note Promotion)**:
   If the existing entry has blank notes and the incoming candidate has typed notes, accept the candidate.
3. **Rule 3 (Timestamp Conflict Resolution)**:
   If both entries have notes, the record with the newer timestamp (`updatedAt` / `createdAt`) wins.
4. **Rule 4 (Non-Default Rating Protection)**:
   If neither record has notes, and the existing entry has a non-default rating (1, 2, 4, or 5), do not allow an incoming default rating (3) to demote it.

---

## 👥 Two-Tier User Security Model

1. **Tier 1 (Whitelisted Accounts)**:
   - Verified Google accounts matching the 3 whitelisted owner hashes.
   - Bidirectional cloud synchronization with Firebase Firestore.
   - Access to AI Ghostwriter (`/api/ai/enhance`) and Monthly AI Dossiers (`/api/monthly-report`).
2. **Tier 2 (Guest / Unverified Accounts)**:
   - Local-first mode running strictly in `localStorage` (`goodness_db_guest`).
   - No Firestore sync or AI Ghostwriter calls.
   - **PIN Hazard**: 4-digit PIN is stored only in local salted hash. If cookies/cache are cleared, data is unrecoverable. Must display the Guest Mode Disclaimer on initial load.
