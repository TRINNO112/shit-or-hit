const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePrintPdfs() {
  console.log('📄 Initializing Full-Bleed Edge-to-Edge Portrait PDF Generation...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2500, height: 3500 } });

  const publicArchDir = path.join(__dirname, '..', 'public', 'architecture');
  const artifactDir = path.join('C:', 'Users', 'pathak.amitkumar', '.gemini', 'antigravity-ide', 'brain', '6cbaaa5d-e5c8-4d04-9893-b7156b5b6b92');

  const img1Path = path.join(publicArchDir, 'shit_or_hit_modes_and_experience.png');
  const img2Path = path.join(publicArchDir, 'shit_or_hit_tech_and_security.png');

  const b64_1 = 'data:image/png;base64,' + fs.readFileSync(img1Path).toString('base64');
  const b64_2 = 'data:image/png;base64,' + fs.readFileSync(img2Path).toString('base64');

  console.log('🔄 Natively rotating images 90 degrees on HTML5 Canvas to eliminate all whitespace...');

  // Function to natively rotate image 90 degrees clockwise on canvas
  const rotateImage90deg = async (dataUrl) => {
    return await page.evaluate((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Swap width and height for portrait
          canvas.width = img.height;
          canvas.height = img.width;
          const ctx = canvas.getContext('2d');
          // Rotate 90 degrees clockwise
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(90 * Math.PI / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = src;
      });
    }, dataUrl);
  };

  const rotatedImg1 = await rotateImage90deg(b64_1);
  const rotatedImg2 = await rotateImage90deg(b64_2);

  // Full-bleed A4 HTML layout where rotated image fills 98% of the page
  const fullBleedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SHIT OR HIT — Full-Bleed Master Architecture Print Dossier</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 4mm; /* Tiny 4mm margin so printer does not clip edges */
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #FFFFFF;
      width: 100%;
      height: 100%;
    }
    .sheet {
      width: 202mm; /* Full printable width of A4 */
      height: 289mm; /* Full printable height of A4 */
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #FFFFFF;
    }
    .sheet:last-child {
      page-break-after: auto;
    }
    .full-poster {
      width: 100%;
      height: 100%;
      object-fit: fill; /* Stretches and maximizes coverage across entire paper */
      border: 3.5px solid #000000;
      border-radius: 12px;
      box-shadow: 4px 4px 0px #000000;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: MODES & EXPERIENCE -->
  <div class="sheet">
    <img class="full-poster" src="${rotatedImg1}" alt="Poster 1" />
  </div>

  <!-- PAGE 2: TECH & SECURITY -->
  <div class="sheet">
    <img class="full-poster" src="${rotatedImg2}" alt="Poster 2" />
  </div>
</body>
</html>`;

  await page.setContent(fullBleedHtml, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // 1. Generate Combined Master Full-Bleed PDF
  const masterPdfPublic = path.join(publicArchDir, 'shit_or_hit_master_architecture_portrait_ready.pdf');
  const masterPdfArtifact = path.join(artifactDir, 'shit_or_hit_master_architecture_portrait_ready.pdf');

  await page.pdf({
    path: masterPdfPublic,
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: { top: '4mm', bottom: '4mm', left: '4mm', right: '4mm' }
  });
  fs.copyFileSync(masterPdfPublic, masterPdfArtifact);
  console.log(`✅ Saved Full-Bleed Combined Master PDF -> ${masterPdfPublic}`);

  // 2. Poster 1 only
  const p1Html = fullBleedHtml.replace(/<!-- PAGE 2:[\s\S]*<\/div>/, '');
  await page.setContent(p1Html, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const p1PdfPublic = path.join(publicArchDir, 'shit_or_hit_modes_and_experience_portrait_ready.pdf');
  await page.pdf({
    path: p1PdfPublic,
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: { top: '4mm', bottom: '4mm', left: '4mm', right: '4mm' }
  });
  console.log(`✅ Saved Full-Bleed Poster 1 PDF -> ${p1PdfPublic}`);

  // 3. Poster 2 only
  const p2Html = fullBleedHtml.replace(/<!-- PAGE 1:[\s\S]*<!-- PAGE 2:/, '<!-- PAGE 2:');
  await page.setContent(p2Html, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const p2PdfPublic = path.join(publicArchDir, 'shit_or_hit_tech_and_security_portrait_ready.pdf');
  await page.pdf({
    path: p2PdfPublic,
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: { top: '4mm', bottom: '4mm', left: '4mm', right: '4mm' }
  });
  console.log(`✅ Saved Full-Bleed Poster 2 PDF -> ${p2PdfPublic}`);

  await browser.close();
  console.log('🎉 100% Full-Bleed Edge-to-Edge Portrait PDFs Successfully Generated!');
}

generatePrintPdfs().catch(err => {
  console.error('Fatal PDF generation error:', err);
  process.exit(1);
});

