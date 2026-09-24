# Contributing to SHIT OR HIT

Thank you for your interest in contributing to **SHIT OR HIT** — the private Neobrutalist daily verdict, behavioral dossier, and habit tracking engine.

We welcome thoughtful contributions, bug fixes, performance improvements, and architectural refinements that maintain our strict design philosophy and zero-defect quality gate.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating in discussions or opening pull requests.

---

## Development Setup

### 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/TRINNO112/shit-or-hit.git
cd shit-or-hit
npm install
```

### 3. Running Locally

The application consists of a Vite React 19 frontend and an Express logging & sync API backend:

- **Frontend Only** (Vite on port `5888`):
  ```bash
  npm run dev:frontend
  ```

- **Backend API Only** (Express on port `5001` with Swagger docs at `http://localhost:5001/api/docs`):
  ```bash
  npm run dev:backend
  ```

- **Full Stack Concurrently**:
  ```bash
  npm run dev
  ```

---

## Non-Negotiable Engineering Standards

All contributions must strictly respect the following core tenets:

### 1. Mandatory 55-Point Audit Gate

Before committing or opening any Pull Request, you **MUST** run the automated master audit:

```bash
npm run audit
```

Your changes must yield:
```text
======================================================================
MASTER AUDIT COMPLETE: 55 PASSED | 0 FAILED
======================================================================
```

If UI flows, page transitions, or navigation components are modified, also verify with the Playwright test suite:

```bash
npm run test:e2e
```

### 2. Absolute Zero Emoji Mandate (Strict UI Standard)

- **NO RAW UNICODE EMOJIS IN THE UI**: Never render raw Unicode emojis in buttons, badges, toasts, headers, labels, or modals.
- **Replacement**: Always use clean vector SVG icons from **`lucide-react`** (e.g. `Flame`, `Zap`, `Shield`, `CheckCircle2`, `Droplets`, `Footprints`, `Moon`) combined with bold uppercase monospace typography (`font-mono font-black text-xs uppercase`).

### 3. Pure Neobrutalist Design System

All user interface components adhere strictly to Neobrutalism:
- **Borders**: Crisp, heavy solid black borders (`border-2 border-black` or `border-3 border-black`).
- **Offset Drop Shadows**: Hard shadows without blur (`shadow-[2px_2px_0px_#000000]`, `shadow-[3px_3px_0px_#000000]`, `shadow-[4px_4px_0px_#000000]`).
- **Tactile Button Feedback**: Active depression states (`active:translate-x-px active:translate-y-px active:shadow-none`).
- **Color Palette Tokens**:
  - Yellow: `#FDC800`
  - Emerald: `#00E599`
  - Coral Red: `#FF4D4D`
  - Warm Cream Surface: `#FFFDF8` / `#FFFDF5`
- **Tailwind CSS v4 Standard**:
  - Use `bg-linear-to-br` (avoid legacy `bg-gradient-to-br`).
  - Use `bg-linear-to-b` (avoid legacy `bg-gradient-to-b`).
  - Use `stroke-3` (avoid arbitrary `stroke-[3]`).

### 4. Data Protection & Cryptographic Standard

- **Zero-Knowledge Architecture**: User PIN credentials and vault tokens are processed locally using the browser Web Crypto API (AES-GCM 256-bit with PBKDF2 100,000 rounds of SHA-256).
- **Never Overwrite User Data**: Never hardcode wipes or destructive replacements in `data/entries.json` or `data/reports.json`.
- **E2E Isolation**: Use sandbox fixtures or localStorage mocks for all tests.

---

## Git Workflow & Commit Guidelines

### 1. Commit Series Prefix (`D` Series)

All Git commits in this repository use the established **`D` series prefix**:

```text
D258: Add repository community health files and issue templates
D259: Optimize mobile touch target padding in JourneyTimeline
```

### 2. Dual-Remote Synchronization

Maintainers push commits simultaneously to both GitHub and GitLab remotes:

```bash
git push origin main; git push gitlab main
```

---

## Submitting Pull Requests

1. **Fork the repo** and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Implement your changes** adhering to the design and code guidelines.
3. **Run the full audit**:
   ```bash
   npm run audit
   ```
4. **Push to your fork** and submit a Pull Request to `main`.
5. Ensure your PR description fills out the checklist in the PR template.

Thank you for helping keep SHIT OR HIT bulletproof and beautiful!
