const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePrintPdfs() {
  console.log('📄 Initializing Playwright for Zero-Config Portrait PDF Generation...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const publicArchDir = path.join(__dirname, '..', 'public', 'architecture');
  const artifactDir = path.join('C:', 'Users', 'pathak.amitkumar', '.gemini', 'antigravity-ide', 'brain', '6cbaaa5d-e5c8-4d04-9893-b7156b5b6b92');

  const img1Path = path.join(publicArchDir, 'shit_or_hit_modes_and_experience.png').replace(/\\/g, '/');
  const img2Path = path.join(publicArchDir, 'shit_or_hit_tech_and_security.png').replace(/\\/g, '/');

  // Multi-page master PDF with both posters rotated 90 degrees on portrait pages
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SHIT OR HIT — Master Architecture Print Dossier</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #FFFFFF;
      font-family: sans-serif;
    }
    .sheet {
      width: 210mm;
      height: 297mm;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      background: #FFFFFF;
    }
    .sheet:last-child {
      page-break-after: auto;
    }
    /* Rotate 90 degrees so landscape diagram fills the entire A4 portrait paper */
    .rotated-container {
      width: 282mm; /* Fills vertical height of A4 */
      height: 195mm; /* Fills horizontal width of A4 */
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(90deg);
      transform-origin: center center;
    }
    .poster-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border: 3px solid #000000;
      box-shadow: 4px 4px 0px #000000;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: USER WORKFLOW, 51 COMPONENTS & BEHAVIORAL COCKPIT -->
  <div class="sheet">
    <div class="rotated-container">
      <img class="poster-img" src="file:///${img1Path}" alt="Poster 1: Modes and Experience" />
    </div>
  </div>

  <!-- PAGE 2: TECHNICAL, SECURITY & 7-TIER PERSISTENCE BLUEPRINT -->
  <div class="sheet">
    <div class="rotated-container">
      <img class="poster-img" src="file:///${img2Path}" alt="Poster 2: Tech and Security" />
    </div>
  </div>
</body>
</html>`;

  const tempHtmlPath = path.join(__dirname, 'temp_print_preview.html');
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  await page.goto('file:///' + tempHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Generate Combined Master Dossier PDF (Both Pages in One Document)
  const masterPdfPublic = path.join(publicArchDir, 'shit_or_hit_master_architecture_portrait_ready.pdf');
  const masterPdfArtifact = path.join(artifactDir, 'shit_or_hit_master_architecture_portrait_ready.pdf');

  await page.pdf({
    path: masterPdfPublic,
    format: 'A4',
    landscape: false, // Standard Portrait Orientation
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    preferCSSPageSize: true
  });
  fs.copyFileSync(masterPdfPublic, masterPdfArtifact);
  console.log(`✅ Saved Combined Master PDF -> ${masterPdfPublic}`);

  // 2. Also generate individual single-page PDFs for convenience
  // Page 1 only
  const p1Html = html.replace(/<!-- PAGE 2:[\s\S]*<\/div>\s*<\/div>/, '');
  const tempP1Path = path.join(__dirname, 'temp_p1.html');
  fs.writeFileSync(tempP1Path, p1Html, 'utf8');
  await page.goto('file:///' + tempP1Path.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const p1PdfPublic = path.join(publicArchDir, 'shit_or_hit_modes_and_experience_portrait_ready.pdf');
  await page.pdf({
    path: p1PdfPublic,
    format: 'A4',
    landscape: false,
    printBackground: true,
    preferCSSPageSize: true
  });
  console.log(`✅ Saved Poster 1 PDF -> ${p1PdfPublic}`);

  // Page 2 only
  const p2Html = html.replace(/<!-- PAGE 1:[\s\S]*<!-- PAGE 2:/, '<!-- PAGE 2:');
  const tempP2Path = path.join(__dirname, 'temp_p2.html');
  fs.writeFileSync(tempP2Path, p2Html, 'utf8');
  await page.goto('file:///' + tempP2Path.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const p2PdfPublic = path.join(publicArchDir, 'shit_or_hit_tech_and_security_portrait_ready.pdf');
  await page.pdf({
    path: p2PdfPublic,
    format: 'A4',
    landscape: false,
    printBackground: true,
    preferCSSPageSize: true
  });
  console.log(`✅ Saved Poster 2 PDF -> ${p2PdfPublic}`);

  await browser.close();

  // Cleanup temp files
  try {
    fs.unlinkSync(tempHtmlPath);
    fs.unlinkSync(tempP1Path);
    fs.unlinkSync(tempP2Path);
  } catch (e) {}

  console.log('🎉 Portrait-Ready Zero-Config PDFs Successfully Generated!');
}

generatePrintPdfs().catch(err => {
  console.error('Fatal PDF generation error:', err);
  process.exit(1);
});
