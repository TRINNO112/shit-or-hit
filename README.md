# ⚡ DAILY VERDICT (SHIT OR HIT)

> **The Neobrutalist Daily Life Logger, Habit Tracker & AI Performance Forensic Hub.**  
> Built with 100% data sovereignty, offline-first PWA architecture, interactive SVG radial dial reminders, and streetwear story poster exports.

---

## 🌟 Highlights & Master Features

### 1. 🎯 Daily 5-Tier Verdict Tracker & Mascot Archetypes
- **5-Star Neobrutalist Scale**:
  - `1★ Rough (Shit)`: Red-alert friction days, high stress, lost battles — *Cooked Goblin 👺*.
  - `2★ Down`: Sub-par baseline, fatigue, low-focus days — *Brain Fog Zombie 🧟*.
  - `3★ Okay`: Steady baseline, routine maintenance, standard output — *Chill Sloth 🦥*.
  - `4★ Good`: High focus, productive execution, clear wins — *Flow Beast ⚡*.
  - `5★ Peak (Hit)`: Flow-state mastery, clutch breakthroughs, total dominance — *Peak Godmode 👑*.
- **Interactive Year & Month Canvas Grid**: High-density grid mapping every day of the year with real-time streak detection.
- **AI Diary Ghostwriter**: Polishes raw, chaotic stream-of-consciousness journal notes into deep, structured 1st-person diary entries without losing length or personal voice.

---

### 2. 🕒 Interactive SVG Radial Dial Clock
- **Subpixel Radial Trigonometry**: Smooth, tactile SVG drag dial calibrated to exact pixel coordinates (`pointOnCircle`).
- **⚡ Auto-Teleport Interaction**: Select an hour (1..12), and the dial automatically transitions you to the exact minute dial after 300ms.
- **🎯 Granular Minute Steppers**: Dial any minute (0..59) continuously or use the `[ - ]` / `[ + ]` micro-steppers for exact times like `10:47` or `09:38`.
- **Scheduled Browser Notifications**: Custom daily reminders that trigger right on schedule to ensure your daily streak never drops.

---

### 3. 🎨 Wallpaper & Social Poster Studio
- **High-Res 1080p Lossless PNG Export**: Generates pixel-perfect streetwear artwork directly via HTML5 canvas.
- **Dual Aspect Ratios**:
  - **Story Poster (`9:16`)**: Full-bleed mobile lockscreens, wallpapers, and Instagram Stories.
  - **Feed Card (`1:1`)**: Square format for social posts, profile statuses, and progress tracking.
- **3 Streetwear Color Themes**:
  - `Gold & Yellow` — High-voltage streetwear contrast.
  - `Obsidian Dark` — Sleek cyberpunk carbon.
  - `Crimson Red` — High-urgency alert.
- **🎭 Custom PNG Sticker Upload**: Upload your own transparent PNG avatar or stickers to replace the daily mascot.

---

### 4. 🌐 Multilingual AI Language Isolation
- **Custom AI Language Preference** in **⚙️ App Settings**:
  - `⚡ Auto-Match (Default)`: Mirrors your exact writing style. If notes are in English, the AI outputs 100% pure English with zero Hindi/Hinglish words.
  - `🇬🇧 English`: Strictly mandates pure English output across all ghostwriting reflections and monthly dossiers.
  - `🇮🇳 Hinglish`: Generates authentic, conversational, witty Hinglish (Hindi in Roman script).

---

### 5. 📊 Monthly AI Performance Forensic Dossier
- **Persistent Local & Cloud Dossier Storage**: Evaluated reports are saved in client storage and `data/reports.json` for zero-latency review.
- **💬 Unfiltered Homie Letter**: 4-paragraph conversational deep-dive validating hardships, roasting self-sabotage with tough love, and hyping clutch comebacks.
- **🔍 6 Sharp Behavioral Observations**: Highlights cursed weekdays (e.g. 1.5 average Thursdays), 3:45 AM dopamine loops, and streak momentum.
- **📈 Weekday Velocity Horizon Visualizer**: Visual bar distribution comparing Sunday through Saturday momentum.
- **🔥 Friction Root-Cause Leak Breakdown**: Keyword analysis measuring screen doomscrolling %, academic/work stress %, and social friction %.

---

### 6. 🛡️ Offline-First Architecture & Cloud Sync
- **Sub-1ms Optimistic UI Mutations**: Ratings and diary edits commit instantly to local state and `localStorage`.
- **4s Firebase Cloud Race Sync**: Cloud saves run asynchronously with a 4-second race timeout so slow or dropped internet connections never freeze the UI.
- **Privacy Masking**: Protects developer and user identity with zero PII exposure on live streams and screenshots.

---

## ⌨️ Developer CLI Tooling

Log daily verdicts directly from your terminal:

```bash
# Log a peak day with a custom reflection note
node bin/verdict.js 5 "Clutched the 78% Accounts unit test! Momentum locked."
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Framer Motion, Canvas Confetti, Lucide Icons, Material-UI Date Pickers.
- **Backend API**: Node.js, Express, Watch Mode (`node --watch`).
- **AI Synthesis**: Google Gemini 1.5/2.0 API (`gemini-3.5-flash-lite`).
- **Storage**: Offline Local-First Engine (`localStorage`, `data/entries.json`, `data/reports.json`) + Firebase Firestore Cloud Sync.

---

## 🏁 Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation

```bash
git clone https://github.com/TRINNO112/shit-or-hit.git
cd shit-or-hit
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5001
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```

### 4. Running Locally

Start both the Vite frontend and the backend API concurrently:

```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`

---

## 📦 Available Scripts

- `npm run dev` — Starts both frontend and backend concurrently.
- `npm run dev:frontend` — Starts Vite dev server on port 5173.
- `npm run dev:backend` — Starts Express backend on port 5001 with `--watch`.
- `npm run build` — Bundles production frontend in `/dist`.
- `npm run preview` — Previews the production build locally.

---

## 📄 License

MIT License © 2026. Built with grit, brutal honesty, and neobrutalist precision.
