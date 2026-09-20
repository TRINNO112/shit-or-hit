const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Ensure output directories exist
const publicArchDir = path.join(__dirname, '..', 'public', 'architecture');
const artifactDir = path.join('C:', 'Users', 'pathak.amitkumar', '.gemini', 'antigravity-ide', 'brain', '6cbaaa5d-e5c8-4d04-9893-b7156b5b6b92');

if (!fs.existsSync(publicArchDir)) {
  fs.mkdirSync(publicArchDir, { recursive: true });
}

// Diagram 1: User Experience, 5 Life Modes & Behavioral Trilogy
const mermaidPoster1 = `
graph TD
    classDef mainHeader fill:#FDC800,stroke:#000,stroke-width:3px,color:#000,font-weight:900,font-family:sans-serif;
    classDef sectionHeader fill:#00E599,stroke:#000,stroke-width:2.5px,color:#000,font-weight:900;
    classDef actionBox fill:#FFFDF5,stroke:#000,stroke-width:2px,color:#000,font-weight:700;
    classDef triggerBox fill:#E0F2FE,stroke:#0284C7,stroke-width:2px,color:#000;
    classDef stasisBox fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#000;
    classDef alertBox fill:#FEE2E2,stroke:#EF4444,stroke-width:2px,color:#000;
    classDef finishBox fill:#00E599,stroke:#000,stroke-width:2px,color:#000,font-weight:800;

    User(["👤 USER OPENS APP (MOBILE PWA / DESKTOP WEB)"]):::mainHeader

    User --> MainChoice{"CHOOSE ACTIVE LIFE CONTEXT"}:::sectionHeader

    %% --- 5 MODES CLUSTER ---
    subgraph S1["🌿 THE 5 RATING & STASIS MODES"]
        MainChoice -->|"Mode 1: Normal Unfiltered"| M1["1. Classic 1-Tap Verdict<br/>• Subjective rating 1★ to 5★<br/>• Raw personal diary notes"]:::actionBox
        MainChoice -->|"Mode 2: 100% Habits"| M2["2. Deterministic 100% Mode<br/>• Score locked to task completion<br/>• 0% done = 1★ | 100% done = 5★"]:::actionBox
        MainChoice -->|"Mode 3: 50/50 Balance"| M3["3. Hybrid 50/50 Mode<br/>• 50% subjective feeling<br/>• 50% habit completion math"]:::actionBox
        MainChoice -->|"Mode 4: Acute Burnout"| M4["4. Tranquility Sanctuary<br/>• 7 to 14 days acute nervous reset<br/>• Vagus 4-2-6 breathing lotus<br/>• Somatic grounding garden<br/>• Rainy veranda zen artwork"]:::stasisBox
        MainChoice -->|"Mode 5: Life Transition"| M5["5. Grand Sabbatical<br/>• Indefinite horizon pause<br/>• STREAK SHIELDED & FROZEN<br/>• Freeform chronicle writing<br/>• Mountain summit zen artwork"]:::stasisBox
    end

    %% --- CORE TODAY HERO ---
    subgraph S2["⚡ THE TODAY WORKSPACE (TODAYHERO)"]
        M1 --> HeroCard["Today Rating Workspace<br/>• 5 Big Tactile Buttons (1★ to 5★)<br/>• Multi-Sphere Life Matrix (Work, Home, Social)<br/>• Daily Habit Non-Negotiable Anchors"]:::actionBox
        M2 --> HeroCard
        M3 --> HeroCard

        HeroCard --> JournalInput["Unfiltered Reflection Journal"]:::actionBox
        JournalInput -.->|"Keystroke auto-save every 1.5s"| AutoStash["📝 Keystroke Auto-Stash<br/>• Saves draft to local storage<br/>• Survives tab close / dead phone<br/>• 1-Click 'RESTORE DRAFT' banner"]:::triggerBox
        JournalInput --> AI["🤖 Gemini AI Diary Ghostwriter<br/>• Tough Love, Stoic, or Bullet Directives<br/>• Preserves 1st person voice"]:::triggerBox
    end

    %% --- BEHAVIORAL TRILOGY ---
    subgraph S3["🏛️ THE BEHAVIORAL TRILOGY (SMART MENTORSHIP)"]
        HeroCard --> VerdictCheck{"Evaluate Day Rating"}:::sectionHeader
        
        VerdictCheck -->|"1★ or 2★ (Rough Day)"| Autopsy["🕵️ Forensic Autopsy Chamber<br/>• CIA manila folder inquest<br/>• Diagnoses sleep deficit, screen trap & friction<br/>• Formulates rebound action protocol"]:::alertBox
        
        VerdictCheck -->|"5★ (Peak Day)"| Capsule["✉️ Ransom Time-Lock Capsule<br/>• Confidential letter to future self sealed with wax<br/>• Auto-unlocks on future slump or milestone streak"]:::triggerBox
        
        VerdictCheck -->|"End of Every Month"| MonthlyDossier["📊 Monthly AI Dossier<br/>• Tough-love homie mentor feedback<br/>• Persona archetype diagnosis<br/>• Weekly velocity & friction breakdown"]:::actionBox
    end

    %% --- STUDIO & EXPORT ---
    subgraph S4["🎨 STUDIO & EXPORT SUITE"]
        HeroCard --> ReceiptPrint["🧾 Streetwear Thermal Receipt<br/>• 80mm printable thermal slip<br/>• Verdict score, habit checklist, barcode"]:::actionBox
        HeroCard --> ExportStudio["📁 Export Studio Suite<br/>• Tabular CSV export<br/>• Readable Diary Digest PDF<br/>• 4K Year-In-Pixels Wallpapers"]:::actionBox
    end

    Autopsy --> SaveCommitted["💾 Tap Save Entry: Stored in Triple Vault"]:::finishBox
    Capsule --> SaveCommitted
    HeroCard --> SaveCommitted
    M4 --> SaveCommitted
    M5 --> SaveCommitted
`;

// Diagram 2: Under-the-Hood Security, Data Pipelines & Architecture
const mermaidPoster2 = `
graph TD
    classDef mainHeader fill:#FDC800,stroke:#000,stroke-width:3px,color:#000,font-weight:900;
    classDef sectionHeader fill:#00E599,stroke:#000,stroke-width:2.5px,color:#000,font-weight:900;
    classDef boxStyle fill:#FFFDF5,stroke:#000,stroke-width:2px,color:#000,font-weight:700;
    classDef vaultBox fill:#FEF3C7,stroke:#D97706,stroke-width:2.5px,color:#000;
    classDef shieldBox fill:#DCFCE7,stroke:#16A34A,stroke-width:2.5px,color:#000;
    classDef alertBox fill:#FEE2E2,stroke:#EF4444,stroke-width:2px,color:#000;

    Title(["🛡️ SHIT OR HIT — TECHNICAL & SECURITY ARCHITECTURE"]):::mainHeader

    %% --- CI/CD & GIT PIPELINE ---
    subgraph G1["🚢 1. GIT VERSION CONTROL & MANDATORY AUDIT GATE"]
        Dev["Developer Creates Code Update"]:::boxStyle --> AuditGate["🛡️ Pre-Push Audit Gate (audit-system.js)<br/>• 54 Automated Checks Across 33 Components<br/>• State Invariant & Math Model Verification<br/>• Blocks push if ANY test fails (0 tolerated)"]:::shieldBox
        AuditGate -->|"54 PASSED | 0 FAILED"| DualPush["Dual-Remote Deployment<br/>• git push origin main (GitHub)<br/>• git push gitlab main (GitLab)<br/>• Commit Series 'D' prefix enforced"]:::boxStyle
    end

    %% --- CLIENT SECURITY & PIN VAULT ---
    subgraph G2["🔒 2. CLIENT-SIDE ZERO-KNOWLEDGE ENCRYPTION VAULT"]
        UserAuth["User Sets 4-Digit PIN"]:::boxStyle --> CipherEngine["Cipher Engine (cipherEngine.js)<br/>• PBKDF2 Key Derivation with Unique Salt<br/>• AES-GCM 256-bit Symmetric Encryption<br/>• All sensitive notes encrypted client-side"]:::vaultBox
        CipherEngine --> CipherText[("Encrypted Ciphertext<br/>Even database admins cannot read diary notes without user PIN")]:::boxStyle
    end

    %% --- 5-LAYER DATA RESILIENCE NET ---
    subgraph G3["💾 3. FIVE-LAYER DATA SAFETY NET (ZERO DATA LOSS)"]
        UserSave(["User Saves Entry / Reflection"]):::mainHeader --> L1[("Layer 1: User-Partitioned Local Storage<br/>• goodness_db_UID / goodness_db_guest<br/>• 0 millisecond instant synchronous disk write")]:::boxStyle
        
        L1 --> L2[("Layer 2: Triple-Tier Rolling Snapshots<br/>• Snapshot 1 (Recent) • Snapshot 2 • Snapshot 3<br/>• Auto-rotates on every single save<br/>• Time Machine 1-Click Restore in Settings")]:::shieldBox
        
        L1 -.->|"If corrupted by OS glitch"| AutoHeal["Auto-Healing Parser<br/>Silently recovers 100% of data from newest healthy snapshot"]:::shieldBox
        AutoHeal -.-> L1

        L1 --> L3["Layer 3: Verified Airplane Shelter<br/>• Probes browser write capability on offline<br/>• Displays peace-of-mind amber banner (0ms lag)<br/>• Auto-dismisses in 6s so UI stays clean"]:::boxStyle

        L1 --> L4[("Layer 4: Firebase Firestore Multi-Tenant Sync<br/>• Bidirectional cloud synchronization for whitelisted users<br/>• Silent timeout protection (never blocks or crashes UI)")]:::boxStyle

        L1 --> L5["Layer 5: Emergency Diary Rescue Button<br/>• Embedded in Root ErrorBoundary<br/>• 1-Click direct memory download: shit_or_hit_diary_backup.json"]:::alertBox
    end

    %% --- PWA & RUNTIME ISOLATION ---
    subgraph G4["⚡ 4. PWA RUNTIME & COMPONENT FAULT SHIELDS"]
        DeployEvent["New Release Deployed to Web"]:::boxStyle --> SW["Service Worker (sw.js)<br/>• Stale-While-Revalidate caching<br/>• Dynamic chunks returned in <2ms"]:::boxStyle
        
        SW --> ChunkDetector{"Tab requests old chunk hash?"}:::sectionHeader
        ChunkDetector -->|"ChunkLoadError detected"| SafeLazy["Self-Healing Dynamic Chunk Loader (safeLazy)<br/>• Intercepts chunk failure<br/>• Silently refreshes client once to get latest code<br/>• User never sees an error popup"]:::shieldBox
        
        SafeLazy --> ComponentAirbags["Component Fault Boundaries (FaultBoundary.jsx)<br/>• Airbag around TodayHero (Emergency 1★-5★ rating strip)<br/>• Airbag around Modals (Closes safely with toast)<br/>• Header, Nav & History stay 100% alive!"]:::shieldBox
    end

    DualPush --> DeployEvent
    CipherText --> L1
`;

function buildHtml(title, subtitle, mermaidCode) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;800;900&family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
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
      padding: 36px 40px 48px;
      min-width: 1400px;
    }
    .poster-container {
      max-width: 1600px;
      margin: 0 auto;
      border: 4px solid #000000;
      border-radius: 28px;
      background: #FFFFFF;
      box-shadow: 10px 10px 0px #000000;
      padding: 32px 36px 40px;
    }
    .poster-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3.5px solid #000000;
      padding-bottom: 24px;
      margin-bottom: 32px;
      gap: 20px;
    }
    .badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
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
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 30px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      color: #000000;
      line-height: 1.15;
    }
    p.subtitle {
      font-size: 14px;
      color: #4B5563;
      font-weight: 600;
      margin-top: 6px;
    }
    .meta-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      text-align: right;
      padding: 10px 16px;
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
      overflow: visible;
    }
    .mermaid {
      width: 100% !important;
      display: flex;
      justify-content: center;
    }
    .mermaid svg {
      width: 100% !important;
      max-width: 1500px !important;
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
      font-size: 15px !important;
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
          <span class="pill pill-green">NEOBRUTALIST BLUEPRINT</span>
          <span class="pill pill-black">OFFICIAL SPEC</span>
        </div>
        <h1>${title}</h1>
        <p class="subtitle">${subtitle}</p>
      </div>
      <div class="meta-box">
        <div>TRINNO ENGINEERING</div>
        <div>RELEASE: D226 • 54/54 PASS</div>
        <div>FORMAT: HIGH-RES 4K PNG</div>
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
  console.log('🎨 Initializing Playwright Chromium for 4K Poster Rendering...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1720, height: 2100 },
    deviceScaleFactor: 2 // High-DPI crisp 4K rendering
  });
  const page = await context.newPage();

  // Poster 1
  const html1 = buildHtml(
    'Poster 1: User Experience, 5 Life Modes & Behavioral Trilogy',
    'Complete operational flow from daily verdict check-in, habit math, stasis resets, to AI mentorship.',
    mermaidPoster1
  );
  const tempHtmlPath1 = path.join(__dirname, 'temp_poster1.html');
  fs.writeFileSync(tempHtmlPath1, html1, 'utf8');

  console.log('📸 Rendering Poster 1: Modes & Experience...');
  await page.goto('file:///' + tempHtmlPath1.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Allow Mermaid to layout and render fonts

  const poster1Public = path.join(publicArchDir, 'shit_or_hit_modes_and_experience.png');
  const poster1Artifact = path.join(artifactDir, 'shit_or_hit_modes_and_experience.png');

  await page.screenshot({ path: poster1Public, fullPage: true });
  fs.copyFileSync(poster1Public, poster1Artifact);
  console.log(`✅ Saved Poster 1 -> ${poster1Public}`);

  // Poster 2
  const html2 = buildHtml(
    'Poster 2: Under-The-Hood Security, Data Pipelines & Reliability',
    'Complete technical architecture covering dual Git sync, AES-GCM encryption, triple snapshots, and PWA self-healing.',
    mermaidPoster2
  );
  const tempHtmlPath2 = path.join(__dirname, 'temp_poster2.html');
  fs.writeFileSync(tempHtmlPath2, html2, 'utf8');

  console.log('📸 Rendering Poster 2: Tech & Security Architecture...');
  await page.goto('file:///' + tempHtmlPath2.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Allow Mermaid to layout and render fonts

  const poster2Public = path.join(publicArchDir, 'shit_or_hit_tech_and_security.png');
  const poster2Artifact = path.join(artifactDir, 'shit_or_hit_tech_and_security.png');

  await page.screenshot({ path: poster2Public, fullPage: true });
  fs.copyFileSync(poster2Public, poster2Artifact);
  console.log(`✅ Saved Poster 2 -> ${poster2Public}`);

  await browser.close();

  // Cleanup temp HTML files
  try {
    fs.unlinkSync(tempHtmlPath1);
    fs.unlinkSync(tempHtmlPath2);
  } catch (e) {}

  console.log('🎉 All 2 High-Resolution Neobrutalist PNG Posters Generated Successfully!');
}

generatePosters().catch((err) => {
  console.error('Fatal poster generation error:', err);
  process.exit(1);
});
