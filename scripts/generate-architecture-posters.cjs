const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const publicArchDir = path.join(__dirname, '..', 'public', 'architecture');
const artifactDir = path.join('C:', 'Users', 'pathak.amitkumar', '.gemini', 'antigravity-ide', 'brain', '6cbaaa5d-e5c8-4d04-9893-b7156b5b6b92');

if (!fs.existsSync(publicArchDir)) {
  fs.mkdirSync(publicArchDir, { recursive: true });
}

// =========================================================================
// POSTER 1: USER MODES, LIFE STASIS & BEHAVIORAL INTELLIGENCE (LANDSCAPE)
// =========================================================================
const mermaidPoster1 = `
graph LR
    classDef headerNode fill:#FDC800,stroke:#000,stroke-width:3px,color:#000,font-weight:900,font-family:sans-serif;
    classDef modeNode fill:#FFFDF5,stroke:#000,stroke-width:2.5px,color:#000,font-weight:700;
    classDef stasisNode fill:#FEF3C7,stroke:#D97706,stroke-width:2.5px,color:#000,font-weight:800;
    classDef heroNode fill:#E0F2FE,stroke:#0284C7,stroke-width:2.5px,color:#000,font-weight:700;
    classDef trilogyNode fill:#FEE2E2,stroke:#EF4444,stroke-width:2.5px,color:#000,font-weight:700;
    classDef exportNode fill:#F0FDF4,stroke:#16A34A,stroke-width:2.5px,color:#000,font-weight:700;
    classDef saveNode fill:#00E599,stroke:#000,stroke-width:3px,color:#000,font-weight:900;

    subgraph C1["🚀 1. USER ENTRY & INTERFACE"]
        User(["👤 USER OPENS APP"]):::headerNode --> FrameZero["Instant Frame-0 Hydration<br/>• Sub-1ms synchronous local cache read<br/>• Mobile PWA or Desktop Web"]:::modeNode
        FrameZero --> AuthRoute{"User Authentication Check"}:::modeNode
        AuthRoute -->|"Whitelisted Google (3 Emails)"| Tier1["Tier 1: Verified Owner<br/>• Bidirectional Cloud Sync<br/>• AI Ghostwriter & Monthly Dossier<br/>• Cloud-Persisted PIN Vault"]:::heroNode
        AuthRoute -->|"Guest / Unverified Account"| Tier2["Tier 2: Local-First Guest<br/>• 100% Offline in Browser (goodness_db_guest)<br/>• Local PIN Encryption<br/>• Manual JSON Backup Studio"]:::modeNode
    end

    subgraph C2["🌿 2. THE FIVE LIFE & VERDICT ENGINES"]
        Tier1 --> ModeSelect{"Select Life Mode"}:::headerNode
        Tier2 --> ModeSelect

        ModeSelect -->|"Standard Daily Log"| M1["1. Classic 1-Tap Verdict<br/>• Pure subjective rating: 1★ to 5★<br/>• Freeform unfiltered journaling"]:::modeNode
        ModeSelect -->|"Habit-Driven Protocol"| M2["2. Deterministic 100% Mode<br/>• Rating = round(completed/total * 4) + 1<br/>• Manual rating buttons locked<br/>• Strict mathematical accountability"]:::modeNode
        ModeSelect -->|"Balanced Protocol"| M3["3. Hybrid 50/50 Mode<br/>• 50% subjective feeling<br/>• 50% habit completion math<br/>• Blended composite score"]:::modeNode
        ModeSelect -->|"Acute Burnout (7-14 Days)"| M4["4. Tranquility Sanctuary<br/>• Capped strictly: Math.min(14, days)<br/>• Vagus Nerve 4-2-6 Breathing Lotus<br/>• Somatic Grounding Garden<br/>• Zen Rainy Veranda companion art"]:::stasisNode
        ModeSelect -->|"Life Transition / Gap Year"| M5["5. Grand Sabbatical<br/>• Open horizon without deadline<br/>• STREAK SHIELDED & FROZEN<br/>• Freeform reflection chronicles<br/>• Mountain Summit companion art"]:::stasisNode
    end

    subgraph C3["⚡ 3. TODAY ACTIVE WORKSPACE (TODAYHERO)"]
        M1 --> Cockpit["Daily Rating Cockpit<br/>• 5 Big Tactile Buttons (1★ to 5★)<br/>• Multi-Sphere Matrix (Work, Home, Social)<br/>• Procedural Web Audio Sound Oscillators"]:::heroNode
        M2 --> Cockpit
        M3 --> Cockpit

        Cockpit --> ReflectionArea["Unfiltered Diary Reflection Area"]:::heroNode
        ReflectionArea -.->|"Debounced every 1.5s"| KeystrokeStash["📝 Keystroke Auto-Stash<br/>• Saves draft to shit_or_hit_draft_stash<br/>• Survives battery death & tab close<br/>• 1-Click 'RESTORE DRAFT' banner"]:::stasisNode
        ReflectionArea --> AIGhost["🤖 Gemini AI Ghostwriter<br/>• Directives: Tough Love, Stoic, Bullet<br/>• Organizes thoughts in 1st person"]:::heroNode
    end

    subgraph C4["🏛️ 4. BEHAVIORAL TRILOGY (SMART MENTOR)"]
        Cockpit --> RatingAudit{"Evaluate Day Verdict"}:::headerNode
        
        RatingAudit -->|"1★ or 2★ (Rough Day)"| Autopsy["🕵️ Forensic Autopsy Chamber<br/>• CIA Manila Folder Inquest<br/>• Diagnoses: Friction, Sleep, Triggers<br/>• Commits rebound action protocol"]:::trilogyNode
        
        RatingAudit -->|"5★ (Peak Day)"| Capsule["✉️ Ransom Time-Lock Capsule<br/>• Wax-sealed letter to future self<br/>• Unlocks on slump or milestone streak"]:::heroNode
        
        RatingAudit -->|"End of Every Month"| MonthlyAI["📊 Monthly Executive Dossier<br/>• Homie tough-love mentor letter<br/>• Persona archetype diagnosis<br/>• Weekly velocity & friction analysis"]:::exportNode
    end

    subgraph C5["🎨 5. STUDIO & DATA VAULT"]
        Cockpit --> Receipt["🧾 Streetwear Thermal Receipt<br/>• Printable 80mm receipt slip<br/>• Score, habits, truth barcode"]:::exportNode
        Cockpit --> ExportStudio["📁 Export Studio Suite<br/>• Tabular CSV export<br/>• Readable Diary Digest PDF<br/>• 4K Aesthetic Wallpapers"]:::exportNode
        
        Autopsy --> CommitSave["💾 COMMIT TO 5-LAYER DATA VAULT<br/>• Synchronous 0ms Local Storage<br/>• 3 Rolling Time Machine Snapshots<br/>• Background Cloud Sync"]:::saveNode
        Capsule --> CommitSave
        Cockpit --> CommitSave
        M4 --> CommitSave
        M5 --> CommitSave
    end
`;

// =========================================================================
// POSTER 2: UNDER-THE-HOOD SECURITY, DATA PIPELINES & RELIABILITY (LANDSCAPE)
// =========================================================================
const mermaidPoster2 = `
graph LR
    classDef headerNode fill:#FDC800,stroke:#000,stroke-width:3px,color:#000,font-weight:900;
    classDef techNode fill:#FFFDF5,stroke:#000,stroke-width:2.5px,color:#000,font-weight:700;
    classDef vaultNode fill:#FEF3C7,stroke:#D97706,stroke-width:2.5px,color:#000,font-weight:800;
    classDef shieldNode fill:#DCFCE7,stroke:#16A34A,stroke-width:2.5px,color:#000,font-weight:800;
    classDef alertNode fill:#FEE2E2,stroke:#EF4444,stroke-width:2.5px,color:#000,font-weight:700;
    classDef pwaNode fill:#E0F2FE,stroke:#0284C7,stroke-width:2.5px,color:#000,font-weight:700;

    subgraph G1["🚢 1. GIT CI/CD & AUDIT GATE"]
        Dev["Developer Prepares Code Update"]:::techNode --> PrePush["🛡️ Mandatory Pre-Push Gatekeeper<br/>• scripts/audit-system.js<br/>• 54 Automated Checks Across 33 Components<br/>• Mathematical & Schema Invariant Tests<br/>• Vite Production Bundle Check"]:::shieldNode
        PrePush -->|"54 PASSED | 0 FAILED"| DualPush["Dual-Remote Deployment<br/>• git push origin main (GitHub)<br/>• git push gitlab main (GitLab)<br/>• Commit Series 'D' prefix enforced"]:::headerNode
    end

    subgraph G2["🔒 2. ZERO-KNOWLEDGE CRYPTO VAULT"]
        PIN["User Sets 4-Digit PIN"]:::techNode --> SaltDerive["PBKDF2 Key Derivation<br/>• SHA-256 with 100,000 Iterations<br/>• Unique Cryptographic Salt per User"]:::vaultNode
        SaltDerive --> AESKey["256-Bit AES-GCM Symmetric Key"]:::vaultNode
        AESKey --> EncryptEngine["Client Cipher Engine (cipherEngine.js)<br/>• Encrypts sensitive reflections client-side<br/>• Admins & Cloud Firestore hold ONLY ciphertext"]:::vaultNode
        EncryptEngine --> CipherStorage[("🔒 Zero-Knowledge Ciphertext<br/>Unreadable without local user PIN")]:::vaultNode
    end

    subgraph G3["💾 3. FIVE-LAYER DATA SAFETY NET (ZERO DATA LOSS)"]
        SaveTrigger(["User Clicks Save Entry"]):::headerNode --> L1[("Layer 1: Partitioned LocalStorage<br/>• goodness_db_UID / goodness_db_guest<br/>• 0 millisecond instant disk commit")]:::techNode
        
        L1 --> L2[("Layer 2: Triple-Tier Rolling Snapshots<br/>• Snapshot 1 (Recent) • Snapshot 2 • Snapshot 3<br/>• Auto-rotates on every single save<br/>• Time Machine 1-Click Restore in Settings")]:::shieldNode
        
        L1 -.->|"If corrupted by OS / Browser glitch"| AutoHeal["Auto-Healing Parser (safeParseDatabase)<br/>Silently restores 100% of diary from newest snapshot"]:::shieldNode
        AutoHeal -.-> L1

        L1 --> L3["Layer 3: Verified Airplane Shelter<br/>• Probes browser write capability on offline<br/>• Tactile 'OK' dismiss + 6s auto-fade<br/>• Zero lag, zero network anxiety"]:::shieldNode

        L1 --> L4[("Layer 4: Firebase Firestore Multi-Tenant Cloud<br/>• Bidirectional cloud sync for whitelisted accounts<br/>• Silent timeout protection (never crashes UI)")]:::techNode

        L1 --> L5["Layer 5: Emergency Diary Rescue Button<br/>• Root ErrorBoundary emergency rope<br/>• 1-Click JSON extraction directly to device disk"]:::alertNode
    end

    subgraph G4["⚡ 4. PWA RUNTIME & COMPONENT AIRBAGS"]
        DualPush --> NewDeploy["New Release Deployed to Production"]:::techNode
        NewDeploy --> SW["PWA Service Worker (sw.js)<br/>• Stale-While-Revalidate caching<br/>• Static chunks load in <2ms"]:::pwaNode
        
        SW --> ChunkDetect{"Browser requests outdated chunk hash?"}:::techNode
        ChunkDetect -->|"ChunkLoadError detected"| SafeLazy["Self-Healing Dynamic Loader (safeLazy)<br/>• Intercepts chunk mismatch<br/>• Silently reloads client once in background<br/>• User never sees an error screen!"]:::shieldNode
        
        SafeLazy --> FaultShields["Component Fault Boundaries (FaultBoundary.jsx)<br/>• TodayHero: Fallback emergency 1★-5★ rating strip<br/>• Modals: Safe auto-close with friendly toast<br/>• Header, Calendar & History stay 100% alive!"]:::shieldNode
    end

    CipherStorage --> L1
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
      min-width: 2560px;
    }
    .poster-container {
      width: 2500px;
      border: 4px solid #000000;
      border-radius: 28px;
      background: #FFFFFF;
      box-shadow: 12px 12px 0px #000000;
      padding: 28px 36px 32px;
      display: inline-block;
    }
    .poster-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3.5px solid #000000;
      padding-bottom: 20px;
      margin-bottom: 24px;
      gap: 20px;
    }
    .badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 9999px;
      border: 2px solid #000000;
      box-shadow: 2px 2px 0px #000000;
    }
    .pill-yellow { background: #FDC800; color: #000000; }
    .pill-green { background: #00E599; color: #000000; }
    .pill-black { background: #000000; color: #FFFFFF; }
    .pill-red { background: #FF4D4D; color: #FFFFFF; }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      color: #000000;
      line-height: 1.15;
    }
    p.subtitle {
      font-size: 13px;
      color: #4B5563;
      font-weight: 600;
      margin-top: 4px;
    }
    .meta-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      text-align: right;
      padding: 8px 16px;
      background: #FFFDF5;
      border: 2px solid #000000;
      border-radius: 14px;
      box-shadow: 2px 2px 0px #000000;
      line-height: 1.5;
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
      filter: drop-shadow(3px 3px 0px #000000) !important;
    }
    .cluster rect {
      rx: 20px !important;
      ry: 20px !important;
      stroke-width: 3px !important;
      stroke: #000000 !important;
      fill: #FFFDF8 !important;
      filter: drop-shadow(4px 4px 0px #000000) !important;
    }
    .cluster span.nodeLabel {
      font-family: 'Outfit', sans-serif !important;
      font-weight: 900 !important;
      font-size: 14px !important;
      text-transform: uppercase !important;
      color: #000000 !important;
    }
    .edgePath path {
      stroke: #000000 !important;
      stroke-width: 2.5px !important;
    }
    .edgeLabel {
      background-color: #FFFDF5 !important;
      border: 1.5px solid #000000 !important;
      border-radius: 6px !important;
      font-family: 'JetBrains Mono', monospace !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      padding: 2px 6px !important;
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
          <span class="pill pill-black">4K LANDSCAPE CINEMATIC</span>
        </div>
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      <div class="meta-box">
        <div>TRINNO ENGINEERING CORE</div>
        <div>SPECIFICATION: D226 • AUDIT GATE: 54/54 PASSED</div>
        <div>RESOLUTION: 4K HIGH-DPI LANDSCAPE</div>
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
  console.log('🎬 Initializing Playwright Chromium for Movie-Grade Landscape 4K Posters...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 2600, height: 1600 },
    deviceScaleFactor: 2 // Crisp 4K retina
  });
  const page = await context.newPage();

  // -------------------------------------------------------------
  // POSTER 1
  // -------------------------------------------------------------
  const html1 = buildLandscapeHtml(
    'Poster 1: User Modes, Life Stasis & Behavioral Intelligence',
    'Cinematic Left-to-Right operational flow: user onboarding, 5 core modes, TodayHero cockpit, behavioral trilogy, and export studio.',
    'OPERATIONAL COMMAND',
    mermaidPoster1
  );
  const tempHtmlPath1 = path.join(__dirname, 'temp_landscape_poster1.html');
  fs.writeFileSync(tempHtmlPath1, html1, 'utf8');

  console.log('📸 Rendering Landscape Poster 1...');
  await page.goto('file:///' + tempHtmlPath1.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Ensure complete layout

  const poster1Public = path.join(publicArchDir, 'shit_or_hit_modes_and_experience.png');
  const poster1Artifact = path.join(artifactDir, 'shit_or_hit_modes_and_experience.png');

  // Capture ONLY the exact poster container (ZERO empty space at the bottom!)
  const container1 = page.locator('.poster-container');
  await container1.screenshot({ path: poster1Public });
  fs.copyFileSync(poster1Public, poster1Artifact);
  console.log(`✅ Saved Landscape Poster 1 -> ${poster1Public}`);

  // -------------------------------------------------------------
  // POSTER 2
  // -------------------------------------------------------------
  const html2 = buildLandscapeHtml(
    'Poster 2: Infrastructure Core, Zero-Knowledge Crypto & PWA Resilience',
    'Cinematic Left-to-Right engineering flow: Git dual-push audit gate, AES-GCM client encryption, 5-layer safety net, and PWA self-healing.',
    'SECURITY & DATA CORE',
    mermaidPoster2
  );
  const tempHtmlPath2 = path.join(__dirname, 'temp_landscape_poster2.html');
  fs.writeFileSync(tempHtmlPath2, html2, 'utf8');

  console.log('📸 Rendering Landscape Poster 2...');
  await page.goto('file:///' + tempHtmlPath2.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Ensure complete layout

  const poster2Public = path.join(publicArchDir, 'shit_or_hit_tech_and_security.png');
  const poster2Artifact = path.join(artifactDir, 'shit_or_hit_tech_and_security.png');

  const container2 = page.locator('.poster-container');
  await container2.screenshot({ path: poster2Public });
  fs.copyFileSync(poster2Public, poster2Artifact);
  console.log(`✅ Saved Landscape Poster 2 -> ${poster2Public}`);

  await browser.close();

  // Cleanup temp files
  try {
    fs.unlinkSync(tempHtmlPath1);
    fs.unlinkSync(tempHtmlPath2);
  } catch (e) {}

  console.log('🎉 Both 4K Movie-Grade Landscape Posters Rendered with 0 Empty Space!');
}

generatePosters().catch((err) => {
  console.error('Fatal landscape poster generation error:', err);
  process.exit(1);
});
