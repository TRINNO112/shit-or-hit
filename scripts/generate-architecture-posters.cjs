const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const publicArchDir = path.join(__dirname, '..', 'public', 'architecture');
const artifactDir = path.join('C:', 'Users', 'pathak.amitkumar', '.gemini', 'antigravity-ide', 'brain', '6cbaaa5d-e5c8-4d04-9893-b7156b5b6b92');

if (!fs.existsSync(publicArchDir)) {
  fs.mkdirSync(publicArchDir, { recursive: true });
}

// =========================================================================
// POSTER 1: THE COMPLETE 51-COMPONENT ATLAS — USER MODES & WORKFLOW (LANDSCAPE)
// =========================================================================
const mermaidPoster1 = `
graph LR
    classDef headerNode fill:#FDC800,stroke:#000,stroke-width:3.5px,color:#000,font-weight:900,font-family:sans-serif;
    classDef sectionNode fill:#00E599,stroke:#000,stroke-width:3px,color:#000,font-weight:900;
    classDef compNode fill:#FFFDF5,stroke:#000,stroke-width:2.5px,color:#000,font-weight:700;
    classDef stasisNode fill:#FEF3C7,stroke:#D97706,stroke-width:2.5px,color:#000,font-weight:800;
    classDef heroNode fill:#E0F2FE,stroke:#0284C7,stroke-width:2.5px,color:#000,font-weight:700;
    classDef trilogyNode fill:#FEE2E2,stroke:#EF4444,stroke-width:2.5px,color:#000,font-weight:800;
    classDef exportNode fill:#F0FDF4,stroke:#16A34A,stroke-width:2.5px,color:#000,font-weight:700;

    %% CLUSTER 1: APP ENTRY & NAVIGATION SHELL
    subgraph C1["🚀 1. INTERFACE SHELL & ONBOARDING"]
        User(["👤 USER"]):::headerNode --> Header["Header.jsx<br/>• Sliding desktop nav pill<br/>• Quick-action launchers"]:::compNode
        User --> MobileView["MobileAppView.jsx<br/>• Native-feeling bottom tab bar<br/>• Direct swipe gesture logging"]:::compNode
        User --> PWA["PWAInstallBanner.jsx<br/>• 1-Tap home screen install"]:::compNode
        User --> OfflineBadge["OfflineShelterBadge.jsx<br/>• Local write probe indicator<br/>• 6s auto-fade & tactile OK button"]:::compNode
        User --> Skeleton["SkeletonLoader.jsx<br/>• Sub-1ms instant placeholder"]:::compNode
    end

    %% CLUSTER 2: TODAY COCKPIT & RATING ENGINES
    subgraph C2["⚡ 2. TODAY ACTIVE COCKPIT & CORE VERDICT"]
        Header --> TodayHero["TodayHero.jsx<br/>• 5 Tactile Rating Pedals (1★-5★)<br/>• Alternating Daily Zen Horizon Art"]:::heroNode
        MobileView --> TodayHero

        TodayHero --> AutoText["AutoExpandTextarea.jsx<br/>• Elastic self-growing notepad"]:::compNode
        TodayHero --> MagBtn["MagneticButton.jsx<br/>• Spring-physics cursor attraction"]:::compNode
        TodayHero --> MoodBanner["MoodReactionBanner.jsx<br/>• Dynamic SVG expression banner"]:::heroNode
        TodayHero --> Blob3D["Blob3DCanvas.jsx<br/>• Procedural liquid morphing canvas"]:::heroNode
        TodayHero --> SphereIcn["SphereIcon.jsx<br/>• Life sphere icon rasterizer"]:::compNode
        TodayHero --> ShieldIcn["ShieldVoltIcon.jsx<br/>• Animated electric stasis shield"]:::compNode
    end

    %% CLUSTER 3: HABIT ANCHORS & 5 LIFE MODES
    subgraph C3["⚓ 3. HABIT ANCHORS & 5 LIFE MODES"]
        TodayHero --> HabitCard["NonNegotiableCard.jsx<br/>• Daily habit anchor checkboxes<br/>• 3 mathematical scoring modes"]:::compNode
        HabitCard --> HabitStudio["NonNegotiablesStudioModal.jsx<br/>• Habit template configuration"]:::compNode
        HabitCard --> BehavLab["BehavioralLabModal.jsx<br/>• Friction testing sandbox"]:::compNode

        HabitCard --> Mode1["Mode 1: Classic 1-Tap Verdict<br/>• Freeform 1★ to 5★ score"]:::compNode
        HabitCard --> Mode2["Mode 2: Deterministic 100%<br/>• score = round(done/total * 4) + 1<br/>• Manual rating pedals locked"]:::heroNode
        HabitCard --> Mode3["Mode 3: Hybrid 50/50<br/>• 0.5 * subjective + 0.5 * taskMath"]:::heroNode
        HabitCard --> Mode4["Mode 4: Tranquility Sanctuary<br/>• 7 to 14 days acute burnout pause<br/>• Vagus 4-2-6 lotus & somatic garden"]:::stasisNode
        HabitCard --> Mode5["Mode 5: Grand Sabbatical<br/>• Indefinite horizon pause<br/>• STREAK SHIELDED & FROZEN"]:::stasisNode
    end

    %% CLUSTER 4: BEHAVIORAL TRILOGY
    subgraph C4["🏛️ 4. BEHAVIORAL TRILOGY & SMART MENTOR"]
        TodayHero --> RatingCheck{"Evaluate Day Rating"}:::sectionNode
        
        RatingCheck -->|"1★ or 2★ (Rough Day)"| Autopsy["AutopsyChamberModal.jsx<br/>• CIA Manila Folder Inquest<br/>• Friction, sleep deficit & trigger analysis"]:::trilogyNode
        Autopsy --> AutopsyBadge["AutopsyBadge.jsx<br/>• Crime scene status marker on timeline"]:::trilogyNode

        RatingCheck -->|"5★ (Peak Day)"| Capsule["RansomCapsuleModal.jsx<br/>• Wax-sealed letter to future struggling self<br/>• Unlocks on slump or milestone streak"]:::heroNode

        RatingCheck -->|"End of Month"| Dossier["MonthlyReportModal.jsx<br/>• Executive homie tough-love feedback<br/>• Persona Archetypes: Ronin, Architect, Titan"]:::compNode

        TodayHero --> AIDirectives["AIDirectivesModal.jsx<br/>• Ghostwriter prompt style settings"]:::heroNode
    end

    %% CLUSTER 5: CALENDAR & TIMELINE
    subgraph C5["📅 5. CALENDAR MATRICES & DAY INSPECTION"]
        TodayHero --> CalModal["CalendarModal.jsx<br/>• Interactive monthly date matrix modal"]:::compNode
        CalModal --> MonthCal["MonthCalendar.jsx<br/>• Multi-month streak grid with stasis shields"]:::compNode
        CalModal --> WeekRibbon["WeekView.jsx<br/>• 7-Day compact horizontal weekly strip"]:::compNode
        TodayHero --> Timeline["JourneyTimeline.jsx<br/>• Chronological vertical diary stream"]:::compNode
        Timeline --> EditDay["EditDayModal.jsx<br/>• Historical day retrospect & sphere adjustment"]:::compNode
    end

    %% CLUSTER 6: LIFE STASIS & SANCTUARY
    subgraph C6["🌿 6. LIFE PAUSE & REHABILITATION"]
        TodayHero --> Sanctuary["SanctuaryPage.jsx<br/>• Vagus Nerve 4-2-6 breathing lotus<br/>• Somatic Grounding: Water, Walk, Rest, Screen-Off<br/>• 432Hz ambient binaural sound loop"]:::stasisNode
        Sanctuary --> RehabModal["RehabilitationModal.jsx<br/>• Stasis configurator (7-14 day freeze)"]:::stasisNode
        Sanctuary --> Recovery["MotivationalRecoveryModal.jsx<br/>• Emergency psychological slump recovery"]:::stasisNode
    end

    %% CLUSTER 7: STUDIO & EXPORTS
    subgraph C7["🎨 7. STUDIO, RECEIPTS & WALLPAPERS"]
        TodayHero --> Receipt["ReceiptOfTruthModal.jsx<br/>• 80mm streetwear thermal receipt printer"]:::exportNode
        TodayHero --> ExportStudio["ExportStudioModal.jsx<br/>• Tabular CSV & Diary Digest PDF export"]:::exportNode
        ExportStudio --> SocialCard["AestheticCardExportModal.jsx<br/>• Canvas rasterizer for social sharing"]:::exportNode
        SocialCard --> DeepseekCard["AestheticCardVariantDeepseek.jsx<br/>• Cybernetic DeepSeek theme variant"]:::exportNode
        ExportStudio --> YearInPixels["YearInPixelsWallpaperEngine.jsx<br/>• 365-Day 4K color mosaic wallpaper"]:::exportNode
    end
`;

// =========================================================================
// POSTER 2: THE COMPLETE TECHNICAL & SECURITY ATLAS (LANDSCAPE)
// =========================================================================
const mermaidPoster2 = `
graph LR
    classDef headerNode fill:#FDC800,stroke:#000,stroke-width:3.5px,color:#000,font-weight:900;
    classDef sectionNode fill:#00E599,stroke:#000,stroke-width:3px,color:#000,font-weight:900;
    classDef cryptoNode fill:#FEF3C7,stroke:#D97706,stroke-width:2.5px,color:#000,font-weight:800;
    classDef vaultNode fill:#DCFCE7,stroke:#16A34A,stroke-width:2.5px,color:#000,font-weight:800;
    classDef alertNode fill:#FEE2E2,stroke:#EF4444,stroke-width:2.5px,color:#000,font-weight:800;
    classDef pwaNode fill:#E0F2FE,stroke:#0284C7,stroke-width:2.5px,color:#000,font-weight:800;
    classDef compNode fill:#FFFDF5,stroke:#000,stroke-width:2.5px,color:#000,font-weight:700;
    classDef audioNode fill:#F3E8FF,stroke:#9333EA,stroke-width:2.5px,color:#000,font-weight:800;

    %% =========================================================
    %% DOMAIN 1: ZERO-KNOWLEDGE CRYPTO & KEY DERIVATION ENGINE
    %% =========================================================
    subgraph SEC1["🔒 1. ZERO-KNOWLEDGE CRYPTOGRAPHY & PIN VAULT ENGINE"]
        UserPIN["VaultPinModal.jsx<br/>• 4-Digit mechanical PIN keypad<br/>• Rate-limiting lock out after 5 tries"]:::cryptoNode
        
        UserPIN --> PBKDF["cipherEngine.js (Web Crypto API)<br/>• Step 1: PBKDF2-HMAC-SHA256 (100,000 rounds)<br/>• Step 2: 16-byte cryptographically secure salt<br/>• Step 3: Derives 256-bit AES-GCM symmetric key"]:::cryptoNode
        
        PBKDF --> KeyCache["Volatile RAM Key Cache<br/>• Cached only in memory during session<br/>• Auto-purges on lock timeout or tab close"]:::cryptoNode

        KeyCache --> EncEngine["AES-256-GCM Authenticated Encryption<br/>• 12-Byte random IV per record<br/>• 128-Bit GCM authentication tag verifies integrity"]:::cryptoNode

        EncEngine --> CipherStore[("Encrypted Ciphertext Storage<br/>Stored in localStorage & Cloud Firestore<br/>Server admins & hackers have ZERO ability to read diary")]:::vaultNode
    end

    %% =========================================================
    %% DOMAIN 2: SEVEN-TIER DISASTER-PROOF PERSISTENCE
    %% =========================================================
    subgraph SEC2["💾 2. SEVEN-TIER DISASTER-PROOF PERSISTENCE & TIME MACHINE"]
        Keystroke["AutoExpandTextarea.jsx<br/>• Real-time diary note capture"]:::compNode
        
        Keystroke --> DraftStash["1.5s Keystroke Auto-Stash<br/>• Stored in shit_or_hit_draft_stash_{date}<br/>• Restores unsaved draft on crash or battery death"]:::vaultNode

        DraftStash --> SaveAPI(["saveEntry() in api.js"]):::headerNode

        SaveAPI --> L1[("Layer 1: Partitioned LocalStorage<br/>• goodness_db_UID / goodness_db_guest<br/>• 0ms synchronous disk commit")]:::compNode

        L1 --> L2[("Layer 2: 3-Tier Rolling Ring Snapshots<br/>• snapshot_1 (newest) • snapshot_2 • snapshot_3<br/>• Rotates automatically on every save<br/>• Time Machine 1-Click Restore in Settings")]:::vaultNode

        L1 -.->|"OS Crash / Storage Corruption"| SafeParse["safeParseDatabase() in api.js<br/>Catches JSON syntax error and auto-heals<br/>data seamlessly from newest snapshot ring"]:::vaultNode
        SafeParse -.-> L1

        L1 --> L3["Layer 3: OfflineShelterBadge.jsx<br/>• Active write probe verifies disk integrity<br/>• Tactile 'OK' dismiss + 6-second auto-fade"]:::pwaNode

        L1 --> L4[("Layer 4: Firebase Firestore Sync<br/>• Bidirectional cloud sync (firebase.js)<br/>• reconcileEntryItems with timestamp precedence")]:::compNode

        L1 --> L5["Layer 5: Emergency Raw Disaster Extraction<br/>• Embedded in ErrorBoundary.jsx<br/>• Bypasses React: reads raw localStorage keys<br/>• 1-Click download: shit_or_hit_diary_backup.json"]:::alertNode
    end

    %% =========================================================
    %% DOMAIN 3: PWA RUNTIME & AUTO-HEALING SERVICE WORKER
    %% =========================================================
    subgraph SEC3["⚡ 3. RUNTIME AIRBAGS & PWA AUTO-HEALING PIPELINE"]
        PrePush["🛡️ Pre-Push Audit Gate (audit-system.js)<br/>• 54 Tests across 33 Components<br/>• 54 PASSED | 0 FAILED mandatory bar"]:::vaultNode
        
        PrePush --> DualPush["Dual-Remote Deployment<br/>• git push origin main (GitHub)<br/>• git push gitlab main (GitLab)<br/>• Commit series prefix 'D' enforced"]:::headerNode

        DualPush --> SW["Service Worker Engine (public/sw.js)<br/>• Stale-While-Revalidate caching<br/>• Immediate 0ms cache-first asset returns"]:::pwaNode

        SW --> ChunkMismatch{"Stale Tab requests old chunk?"}:::sectionNode

        ChunkMismatch -->|"ChunkLoadError detected"| SafeLazy["Self-Healing Dynamic Loader (safeLazy in App.jsx)<br/>• Intercepts chunk mismatch on new code push<br/>• 10s reload lock in sessionStorage<br/>• Silently reloads client once in background"]:::vaultNode

        SafeLazy --> ComponentAirbags["FaultBoundary.jsx (Component Airbags)<br/>• TodayHero Shield: Fallback rating strip<br/>• Modals Shield: Auto-closes safely with toast<br/>• Header, Nav & Calendar stay 100% ALIVE!"]:::vaultNode

        SafeLazy --> RootReactor["ErrorBoundary.jsx (Global Reactor Core)<br/>• Full-screen Neobrutalist emergency console<br/>• 1-Click Safe Mode Reset & JSON backup dump"]:::alertNode
    end

    %% =========================================================
    %% DOMAIN 4: MULTI-TENANT ACCESS & STATUTORY PRIVACY
    %% =========================================================
    subgraph SEC4["⚖️ 4. ACCESS CONTROL, DPDPA 2023 & OBSERVABILITY"]
        AccessRouter{"User Authentication Gate"}:::sectionNode
        
        AccessRouter -->|"Verified Google Account"| CloudUser["Tier 1: Whitelisted Owners<br/>• Multi-device Firestore cloud sync<br/>• AI Diary Ghostwriter & Monthly Dossier"]:::compNode
        
        AccessRouter -->|"Unauthenticated"| GuestUser["Tier 2: Guest Mode (Local-First)<br/>• goodness_db_guest sandbox<br/>• GuestDisclaimerModal 30-day notice"]:::compNode

        CloudUser & GuestUser --> SettingsEngine["SettingsModal.jsx & System Config<br/>• RadialClockPicker.jsx (24h/12h mechanical dial)<br/>• StickerVaultModal.jsx (Reward stickers)"]:::compNode

        SettingsEngine --> DPDPACompliance["Indian DPDPA 2023 Statutory Compliance<br/>• PrivacyPolicyPage.jsx: Grievance officer routing<br/>• Zero-knowledge encrypted storage guarantees"]:::compNode

        SettingsEngine --> DataErasure["DataErasurePage.jsx (Right to be Forgotten)<br/>• Instant local database purge<br/>• 7-Day regret-proof cloud cooling-off hold"]:::alertNode

        RootReactor & ComponentAirbags --> TelemetryMesh["Sentry React SDK + Winston Logger<br/>• Session replay for error diagnosis<br/>• JSON structured logs (server.log, error.log)"]:::compNode
    end

    %% =========================================================
    %% DOMAIN 5: PROCEDURAL WEB AUDIO SYNTHESIZERS
    %% =========================================================
    subgraph SEC5["🔊 5. PROCEDURAL WEB AUDIO SYNTHESIZERS"]
        AudioMaster["soundEngine.js & soundEffects.js (Web Audio API)"]:::audioNode
        
        AudioMaster --> ClickSynth["Mechanical Key Click<br/>• 320Hz -> 80Hz pitch sweep<br/>• 35ms exponential gain envelope"]:::audioNode
        
        AudioMaster --> ShutterSynth["Camera Shutter Synthesizer<br/>• Dual 40ms burst white noise<br/>• 1200Hz Band-Pass Filter"]:::audioNode

        AudioMaster --> ChimeSynth["Harmonic Resonant Chime<br/>• 880Hz pure sine oscillator<br/>• 600ms reverberant decay tail"]:::audioNode

        AudioMaster --> BinauralSynth["Sanctuary Binaural Drone<br/>• 432Hz grounding ambient sine wave<br/>• Continuous restorative stasis loop"]:::audioNode
    end

    %% INTER-DOMAIN DATA PIPELINE CONNECTIONS
    CipherStore -.-> L1
    L5 -.-> RootReactor
    SettingsEngine -.-> AudioMaster
`;

function buildLandscapeHtml(title, subtitle, badgeText, mermaidCode) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #FFFDF5;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #000000;
      padding: 24px;
      display: inline-block;
      min-width: 3250px;
    }
    .poster-container {
      width: 3200px;
      border: 5px solid #000000;
      border-radius: 36px;
      background: #FFFFFF;
      box-shadow: 16px 16px 0px #000000;
      padding: 36px 48px 40px;
      display: inline-block;
    }
    .poster-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 4.5px solid #000000;
      padding-bottom: 24px;
      margin-bottom: 30px;
      gap: 28px;
    }
    .badge-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 9999px;
      border: 2.5px solid #000000;
      box-shadow: 3px 3px 0px #000000;
    }
    .pill-yellow { background: #FDC800; color: #000000; }
    .pill-green { background: #00E599; color: #000000; }
    .pill-black { background: #000000; color: #FFFFFF; }
    .pill-red { background: #FF4D4D; color: #FFFFFF; }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 34px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      color: #000000;
      line-height: 1.15;
    }
    p.subtitle {
      font-size: 15px;
      color: #4B5563;
      font-weight: 700;
      margin-top: 5px;
    }
    .meta-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 800;
      text-align: right;
      padding: 12px 24px;
      background: #FFFDF5;
      border: 3px solid #000000;
      border-radius: 18px;
      box-shadow: 3.5px 3.5px 0px #000000;
      line-height: 1.55;
    }
    .diagram-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .mermaid {
      width: 100% !important;
      display: flex;
      justify-content: center;
    }
    .mermaid svg {
      width: 100% !important;
      height: auto !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
    }
    /* Neobrutalist styling inside SVG nodes */
    .node rect, .node circle, .node polygon {
      stroke-width: 2.5px !important;
      rx: 14px !important;
      ry: 14px !important;
      filter: drop-shadow(4px 4px 0px #000000) !important;
    }
    .cluster rect {
      rx: 24px !important;
      ry: 24px !important;
      stroke-width: 4px !important;
      stroke: #000000 !important;
      fill: #FFFDF8 !important;
      filter: drop-shadow(5px 5px 0px #000000) !important;
    }
    .cluster span.nodeLabel {
      font-family: 'Outfit', sans-serif !important;
      font-weight: 900 !important;
      font-size: 16px !important;
      text-transform: uppercase !important;
      color: #000000 !important;
    }
    .edgePath path {
      stroke: #000000 !important;
      stroke-width: 2.5px !important;
    }
    .edgeLabel {
      background-color: #FFFDF5 !important;
      border: 2px solid #000000 !important;
      border-radius: 8px !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      padding: 3px 8px !important;
      box-shadow: 2px 2px 0px #000000 !important;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="poster-header">
      <div>
        <div class="badge-row">
          <span class="pill pill-yellow">SHIT OR HIT OS</span>
          <span class="pill pill-green">${badgeText}</span>
          <span class="pill pill-black">51-COMPONENT COMPLETE ATLAS</span>
        </div>
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      <div class="meta-box">
        <div>TRINNO MASTER ARCHITECTURE ATLAS</div>
        <div>ALL 51 COMPONENTS FULLY CATALOGED</div>
        <div>54/54 TEST AUDIT GATE • 4K LANDSCAPE</div>
      </div>
    </div>

    <div class="diagram-wrapper">
      <div class="mermaid">
        ${mermaidCode}
      </div>
    </div>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        primaryColor: '#FFFDF5',
        primaryTextColor: '#000000',
        primaryBorderColor: '#000000',
        lineColor: '#000000',
        secondaryColor: '#FDC800',
        tertiaryColor: '#00E599',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      }
    });
  </script>
</body>
</html>`;
}

async function generatePosters() {
  console.log('🎬 Initializing Playwright Chromium for Complete 51-Component 4K Posters...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 3350, height: 2000 },
    deviceScaleFactor: 2 // 4K Retina Rendering
  });
  const page = await context.newPage();

  // -------------------------------------------------------------
  // POSTER 1: 51-COMPONENT ATLAS - WORKFLOW & LIFE MODES
  // -------------------------------------------------------------
  const html1 = buildLandscapeHtml(
    'Poster 1: Complete Component Atlas — Workflow, Life Modes & Behavioral Cockpit',
    'Full left-to-right operational architecture covering all user-facing components, mathematical rating modes, and triage loops.',
    'WORKFLOW & COMPONENT ATLAS',
    mermaidPoster1
  );
  const tempHtmlPath1 = path.join(__dirname, 'temp_51_poster1.html');
  fs.writeFileSync(tempHtmlPath1, html1, 'utf8');

  console.log('📸 Rendering Poster 1: Complete 51-Component Atlas...');
  await page.goto('file:///' + tempHtmlPath1.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500); // Allow full SVG render

  const poster1Public = path.join(publicArchDir, 'shit_or_hit_modes_and_experience.png');
  const poster1Artifact = path.join(artifactDir, 'shit_or_hit_modes_and_experience.png');

  const container1 = page.locator('.poster-container');
  await container1.screenshot({ path: poster1Public });
  fs.copyFileSync(poster1Public, poster1Artifact);
  console.log(`✅ Saved Poster 1 -> ${poster1Public}`);

  // -------------------------------------------------------------
  // POSTER 2: 51-COMPONENT ATLAS - SECURITY, STORAGE & RESILIENCE
  // -------------------------------------------------------------
  const html2 = buildLandscapeHtml(
    'Poster 2: Complete Component Atlas — Security, Five-Tier Storage & PWA Runtime',
    'Full left-to-right infrastructure architecture covering zero-knowledge encryption, triple snapshots, and component airbags.',
    'SECURITY & INFRASTRUCTURE ATLAS',
    mermaidPoster2
  );
  const tempHtmlPath2 = path.join(__dirname, 'temp_51_poster2.html');
  fs.writeFileSync(tempHtmlPath2, html2, 'utf8');

  console.log('📸 Rendering Poster 2: Technical & Security Architecture...');
  await page.goto('file:///' + tempHtmlPath2.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500); // Allow full SVG render

  const poster2Public = path.join(publicArchDir, 'shit_or_hit_tech_and_security.png');
  const poster2Artifact = path.join(artifactDir, 'shit_or_hit_tech_and_security.png');

  const container2 = page.locator('.poster-container');
  await container2.screenshot({ path: poster2Public });
  fs.copyFileSync(poster2Public, poster2Artifact);
  console.log(`✅ Saved Poster 2 -> ${poster2Public}`);

  await browser.close();

  // Cleanup temp files
  try {
    fs.unlinkSync(tempHtmlPath1);
    fs.unlinkSync(tempHtmlPath2);
  } catch (e) {}

  console.log('🎉 Complete 51-Component 4K Movie-Grade Posters Successfully Generated!');
}

generatePosters().catch((err) => {
  console.error('Fatal 51-component poster generation error:', err);
  process.exit(1);
});
