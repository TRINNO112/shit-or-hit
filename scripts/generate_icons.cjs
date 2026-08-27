const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const svgContent = fs.readFileSync(path.join(__dirname, '../public/icon.svg'), 'utf8');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #FFFDF5; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; overflow: hidden; }
    svg { width: 100%; height: 100%; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

const tempHtml = path.join(__dirname, 'temp_icon.html');
fs.writeFileSync(tempHtml, htmlContent, 'utf8');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const renderIcon = (size, outputPath) => {
  const cmd = `"${edgePath}" --headless --disable-gpu --force-device-scale-factor=1 --window-size=${size},${size} --screenshot="${outputPath}" "file://${tempHtml.replace(/\\/g, '/')}"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log(`Generated ${size}x${size} at ${outputPath}`);
};

const icon512 = path.join(__dirname, '../public/icon-512.png');
const icon192 = path.join(__dirname, '../public/icon-192.png');

renderIcon(512, icon512);
renderIcon(192, icon192);

try { fs.unlinkSync(tempHtml); } catch(e) {}
console.log('All icons generated successfully!');
