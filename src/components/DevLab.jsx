import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Layers,
  Cpu,
  Zap,
  Globe,
  Database,
  Terminal,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Play,
  Copy,
  Check,
  FileCode,
  Monitor,
  Smartphone
} from 'lucide-react';
import ShieldVoltIcon from './ShieldVoltIcon';

const LESSONS = [
  {
    id: 'dom_state',
    title: '1. Traditional HTML/CSS vs React State Engine',
    category: 'Fundamentals',
    icon: Layers,
    color: '#FDC800',
    summary: 'How React takes your 7th grade DOM knowledge (document.getElementById) and transforms it into lightning-fast reactive state loops.',
    theory: `Back in traditional web development, whenever data changed, you manually found elements and mutated them:
\`\`\`js
// Old School Imperative DOM Mutation (7th/8th grade style)
const scoreElem = document.getElementById('score');
scoreElem.innerText = "5.0";
scoreElem.style.backgroundColor = "#00E599";
\`\`\`

In modern Reactive Web Development (React):
You never touch the DOM directly. You declare **State Variables**, and React automatically figures out the fastest minimal DOM mutations via its Virtual DOM reconciler:
\`\`\`jsx
// Modern Declarative State
const [rating, setRating] = useState(5);

return (
  <div className={rating === 5 ? "bg-[#00E599]" : "bg-neutral-100"}>
    Score: {rating}.0
  </div>
);
\`\`\``,
    interactiveDemo: 'state_demo'
  },
  {
    id: 'canvas_graphics',
    title: '2. HTML5 Canvas 2D Mathematics & Graphics Pipeline',
    category: 'Graphics',
    icon: Sparkles,
    color: '#00E599',
    summary: 'How your Wallpaper Studio renders high-res 1080p poster art using direct 2D coordinate geometry and subpixel math.',
    theory: `An HTML5 Canvas is a pixel grid of dimensions \`width × height\` that you draw on frame-by-frame with trigonometry and vectors:
\`\`\`js
const canvas = document.createElement('canvas');
canvas.width = 1080;
canvas.height = 1920;
const ctx = canvas.getContext('2d');

// Draw Dynamic Streetwear Diagonal Ribbon (Overshot by 20px for 0 subpixel gap)
ctx.fillStyle = '#FDC800';
ctx.beginPath();
ctx.moveTo(-20, -20);
ctx.lineTo(width + 20, -20);
ctx.lineTo(width + 20, 220);
ctx.lineTo(-20, 340);
ctx.closePath();
ctx.fill();
\`\`\`

When exporting posters, you use \`canvas.toDataURL('image/png')\` or \`canvas.toBlob()\` to generate lossless PNG files.`,
    interactiveDemo: 'canvas_demo'
  },
  {
    id: 'pwa_sw',
    title: '3. PWA Architecture & Service Worker Lifecycle',
    category: 'Architecture',
    icon: Smartphone,
    color: '#FF4D6D',
    summary: 'How the browser runs background scripts (sw.js) to make your web page act like a native Windows/Android desktop app with zero offline downtime.',
    theory: `A Progressive Web App (PWA) turns a web page into an installable operating system executable using two pillars:

1. **Web App Manifest (\`manifest.json\`)**:
Tells Windows / Chrome how to name the window, which PNG icons to use for taskbar shortcuts, and to remove the browser address bar (\`"display": "standalone"\`).

2. **Service Worker (\`sw.js\`)**:
A background proxy thread that intercepts network requests:
\`\`\`js
// In sw.js: Serve from offline cache instantly if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
\`\`\``,
    interactiveDemo: 'pwa_demo'
  },
  {
    id: 'cloud_sync',
    title: '4. Optimistic UI & Cloud Synchronization Loop',
    category: 'Cloud',
    icon: Database,
    color: '#00D8F6',
    summary: 'Why your app feels instant with zero lag: Optimistic UI caching vs waiting for slow server roundtrips.',
    theory: `Slow web apps show a loading spinner every time you click save.
Fast, modern products use **Optimistic UI Updates**:

1. **Step 1 (0ms)**: Immediately update React state and save to \`localStorage\`.
2. **Step 2 (0ms)**: User sees their click happen instantly with zero lag.
3. **Step 3 (Background)**: Send the payload to Firebase Cloud in an async promise:
\`\`\`js
// 1. Instant local update
setEntries(nextEntries);
localStorage.setItem('goodness_db', JSON.stringify(nextEntries));

// 2. Background cloud push
await saveEntry(formattedEntry);
\`\`\``,
    interactiveDemo: 'cloud_demo'
  }
];

export default function DevLab({ onBack }) {
  const [activeLessonId, setActiveLessonId] = useState(LESSONS[0].id);
  const [demoStateRating, setDemoStateRating] = useState(4);
  const [demoCustomNote, setDemoCustomNote] = useState('Building high-performance software!');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeLesson = LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans flex flex-col select-none">
      {/* Pinned Top Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5] border-b-3 border-black py-3 px-4 sm:px-8 shadow-[0_4px_0_#000000] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:px-3 sm:py-1.5 bg-neutral-100 hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[2px_2px_0px_#000000] cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">BACK TO APP</span>
          </button>
          <div className="h-6 w-0.5 bg-black/20 mx-1 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FDC800] border-2 border-black flex items-center justify-center p-0.5 shadow-[1px_1px_0px_#000000]">
              <ShieldVoltIcon className="w-full h-full" color="#FDC800" />
            </div>
            <div>
              <h1 className="font-display font-black text-base sm:text-lg text-black uppercase leading-tight">
                DEVELOPER ACADEMY & ARCHITECTURE LAB
              </h1>
              <span className="text-[11px] font-mono text-neutral-600 block">
                Traditional Web Foundations ➔ Modern Product Engineering
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="?view=skeleton"
            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
          >
            🦴 TEST SKELETON
          </a>
        </div>
      </header>

      {/* Main 2-Column Learning Workbench */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation: Topics */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
            <span className="font-mono text-xs font-black text-neutral-800 uppercase flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>CORE ARCHITECTURE MODULES</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {LESSONS.map((lesson) => {
              const IconComponent = lesson.icon;
              const isActive = lesson.id === activeLessonId;

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 border-black transition-all cursor-pointer flex items-start gap-3.5 ${
                    isActive
                      ? 'bg-white shadow-[4px_4px_0px_#000000] translate-x-1 font-black'
                      : 'bg-[#FFFDF8] hover:bg-white hover:shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#000000]"
                    style={{ backgroundColor: lesson.color }}
                  >
                    <IconComponent className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                      {lesson.category}
                    </span>
                    <h3 className="font-display font-black text-sm text-black uppercase leading-tight truncate mt-0.5">
                      {lesson.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-600 line-clamp-2 mt-1 leading-snug">
                      {lesson.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Learning Tip Card */}
          <div className="p-4 bg-[#FDC800] border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-2">
            <div className="flex items-center gap-2 font-display font-black text-xs uppercase">
              <Zap className="w-4 h-4" />
              <span>The Engineer's Mental Model</span>
            </div>
            <p className="text-xs font-mono text-neutral-900 leading-relaxed font-bold">
              You already know how logic flows from your 2D Sprite games. In React web applications, state is just your game's memory, and components are your sprite renderers.
            </p>
          </div>
        </div>

        {/* Right Column: Deep Theory & Interactive Live Workbench */}
        <div className="lg:col-span-8 space-y-6">
          {/* Theory Card */}
          <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]"
                  style={{ backgroundColor: activeLesson.color }}
                >
                  <activeLesson.icon className="w-5 h-5 text-black stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl text-black uppercase">
                    {activeLesson.title}
                  </h2>
                  <span className="text-xs font-mono text-neutral-500">
                    Deep Architectural Breakdown
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activeLesson.theory)}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-[#FDC800] border-2 border-black rounded-xl font-mono text-xs font-black shadow-[1.5px_1.5px_0px_#000000] cursor-pointer flex items-center gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{copiedCode ? 'COPIED' : 'COPY NOTES'}</span>
              </button>
            </div>

            <div className="text-xs sm:text-sm font-mono text-neutral-800 space-y-3 leading-relaxed whitespace-pre-line bg-neutral-50 p-4 rounded-2xl border-2 border-black/20">
              {activeLesson.theory}
            </div>
          </div>

          {/* Interactive Live Playground */}
          <div className="bg-[#FFFDF8] border-3 border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
              <span className="font-display font-black text-sm uppercase flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00E599] fill-[#00E599]" />
                <span>Live Interactive Sandbox: Try It Out</span>
              </span>
              <span className="text-xs font-mono font-bold text-neutral-500">
                Real-Time State Reconciler
              </span>
            </div>

            {/* Dynamic Interactive Panel */}
            <div className="p-5 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-neutral-700">
                  Select Rating (Simulating State Change):
                </span>
                <span className="px-3 py-1 bg-black text-[#FDC800] rounded-xl font-mono text-xs font-black">
                  Current Score: {demoStateRating}.0 / 5.0
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDemoStateRating(val)}
                    className={`py-2 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-all active:scale-95 ${
                      demoStateRating === val
                        ? 'bg-[#FDC800] shadow-[2px_2px_0px_#000000] font-black'
                        : 'bg-neutral-100 hover:bg-white'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 mb-1">
                  Type Reflection (Live Two-Way Data Binding):
                </label>
                <input
                  type="text"
                  value={demoCustomNote}
                  onChange={(e) => setDemoCustomNote(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black rounded-xl font-mono text-xs text-black focus:outline-none"
                />
              </div>

              {/* Live Render Output Preview */}
              <div className="p-4 bg-[#FFFDF5] border-2 border-dashed border-black/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Virtual DOM Render Output:
                  </span>
                  <span className="font-display font-black text-sm text-black">
                    "{demoCustomNote}"
                  </span>
                </div>
                <div
                  className="w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center font-mono font-black text-xs shadow-[1.5px_1.5px_0px_#000000]"
                  style={{ backgroundColor: demoStateRating >= 4 ? '#00E599' : demoStateRating === 3 ? '#FDC800' : '#FF4D4D' }}
                >
                  {demoStateRating}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
