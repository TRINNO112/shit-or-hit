# 💩 SHIT OR HIT — Daily Goodness Verdict & Behavioral Intelligence Engine

> **A high-velocity, neobrutalist daily life logger, habit tracker, and AI performance forensic engine built with 100% local data sovereignty.**

---

## ⚡ Overview

**SHIT OR HIT** is a daily productivity and momentum tracker designed with high-contrast neobrutalist aesthetics, satisfying micro-interactions, spring physics, and deep behavioral analytics. It helps you track your daily verdicts, identify hidden psychological bottlenecks, and unlock unfiltered, brotherly AI intelligence on your monthly progress.

---

## 🚀 Key Features

### 1. 🎯 Daily 5-Tier Verdict Tracker

- **5-Star Neobrutalist Scale**:
  - `1★ Rough (Shit)`: Red-alert friction days, high stress, lost battles.
  - `2★ Down`: Sub-par baseline, fatigue, low-focus days.
  - `3★ Okay`: Steady baseline, routine maintenance, standard output.
  - `4★ Good`: High focus, productive execution, clear wins.
  - `5★ Peak (Hit)`: Flow-state mastery, clutch breakthroughs, total dominance.
- **Interactive Year & Month Canvas Grid**: High-density grid visualizer mapping every day of the year with real-time streak detection.
- **Smart Reflection Enhancer**: AI-assisted sharpening that turns chaotic stream-of-consciousness diary notes into actionable, structured takeaways.

### 2. 📊 Monthly Performance Intelligence Dossier

- **100% Privacy Lock Architecture**: Verdicts and diary notes stay strictly local on your device. Evaluations run only when you explicitly trigger them.
- **Persistent Local Dossier Database**: Evaluated dossiers are saved in `data/reports.json` and client storage. Open past months anytime with instant zero-latency loading without repeating API calls.
- **💬 Real Talk From Your Bro (Unfiltered Homie Letter)**:
  - 4-paragraph conversational deep-dive letter addressing your exact diary events, validating hardships, roasting self-sabotaging habits with tough love, and hyping your clutch comebacks.
- **🔍 6 Uncensored Behavioral Observations**:
  - Pinpoints cursed weekdays (e.g. 1.5 average Thursdays), 3:45 AM dopamine traps, spilled chai disasters, and clutch redemption arcs.
- **🗓️ 31-Day High-Density Matrix with Live Note Inspector**:
  - Interactive grid of all 31 days with color-coded ratings. Click any day chip to inspect that day's unfiltered diary notes.
- **📈 Weekly Phase Velocity Trajectory**:
  - Compares Week 1 (Days 1–7), Week 2 (Days 8–14), Week 3 (Days 15–21), and Week 4 (Days 22–31) with visual progress bars.
- **🔥 Friction Root-Cause Leak Breakdown**:
  - Keyword frequency analysis measuring screen doomscrolling %, academic/work stress %, and family/social friction %.

### 3. 🧪 Built-In Authentic Test Archetypes

- **🎓 Aryan's Chronicles (30 Days in Hell, 1 Win)**:
  - Authentic 31-day diary of an Indian 12th Grade Commerce student fighting TS Grewal partnership balance sheets, 3:45 AM Instagram insomnia, spilled chai tragedies, and hallway freezes—culminating in a legendary 78% Accounts unit test clutch on Day 31.

### 4. ⌨️ Developer CLI Tooling

- Log verdicts directly from your terminal:

```bash
node bin/verdict.js 5 "Clutched the 78% Accounts unit test! Dad was proud."
```

---

## 🔒 Privacy & Data Sovereignty Promise

1. **Zero External Tracking**: No third-party telemetry, no analytics beacons, and no tracking cookies.
2. **Local Storage by Default**: All entries and evaluated dossiers are stored in human-readable JSON files on your machine:
   - `data/entries.json` — Daily verdicts, ratings, and diary notes.
   - `data/reports.json` — Evaluated monthly dossiers and behavioral forensics.
3. **Direct HTTPS AI Calls**: Gemini AI synthesis connects directly to Google's official API using your private API key stored in `.env`. No middleman servers or cloud telemetry.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (Spring Physics), Canvas Confetti, Lucide Icons.
- **Backend**: Node.js, Express, Native Fetch, Watch Mode (`node --watch`).
- **AI Engine**: Google Gemini API (`gemini-3.5-flash-lite`, `gemini-2.5-flash`, `gemini-1.5-flash` fallbacks).
- **Storage**: Local JSON Flat-File Engine (`data/entries.json`, `data/reports.json`).

---

## 🏁 Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/shit-or-hit.git
cd shit-or-hit
npm install
```

### 3. Configuration

Create a `.env` file in the root directory:

```env
PORT=5001
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```

### 4. Running Locally

Start both the Vite frontend and the backend API server concurrently:

```bash
npm run dev
```

The application will be live at:

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`

---

## 📦 Available Scripts

- `npm run dev` — Starts both frontend and backend concurrently.
- `npm run dev:frontend` — Starts Vite dev server on port 5173.
- `npm run dev:backend` — Starts Express backend on port 5001 with `--watch` auto-reload.
- `npm run build` — Bundles production frontend in `/dist`.
- `npm run preview` — Previews the production build locally.

---

## 📄 License

MIT License © 2026. Built with grit and brutal honesty.
