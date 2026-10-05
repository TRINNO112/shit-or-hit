import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const desktop = path.join(os.homedir(), 'Desktop');
const target = path.resolve('run-full-audit.bat');
const workingDir = path.resolve('.');
const shortcutPath = path.join(desktop, 'Trinno Full Audit.lnk');

const psScript = [
  `$ws = New-Object -ComObject WScript.Shell`,
  `$s = $ws.CreateShortcut('${shortcutPath.replace(/'/g, "''")}')`,
  `$s.TargetPath = '${target.replace(/'/g, "''")}'`,
  `$s.WorkingDirectory = '${workingDir.replace(/'/g, "''")}'`,
  `$s.Description = 'Run Trinno Master Full-System Audit'`,
  `$s.Save()`
].join('\r\n');

const tempPs1 = path.resolve('temp_create_shortcut.ps1');
fs.writeFileSync(tempPs1, psScript, 'utf8');

try {
  execSync(`powershell -ExecutionPolicy Bypass -File "${tempPs1}"`, { stdio: 'inherit' });
  console.log(`[SUCCESS] Desktop shortcut created at: ${shortcutPath}`);
} catch (err) {
  console.error('[ERROR] Failed to create shortcut:', err.message);
} finally {
  if (fs.existsSync(tempPs1)) {
    fs.unlinkSync(tempPs1);
  }
}
