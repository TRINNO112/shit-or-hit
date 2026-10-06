import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const SERVER_DIR = path.join(ROOT_DIR, 'server');

const EMOJI_REGEX = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

const securityIssues = [];
const tailwindIssues = [];
const uiEmojiIssues = [];
const logicSyntaxIssues = [];

function checkFile(filePath, isServer = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(ROOT_DIR, filePath);
  const lines = content.split('\n');

  // Check syntax parse with Function/eval in isolated sandbox
  // (JSX needs vite/esbuild check, which we do via vite build)

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // 1. DangerouslySetInnerHTML
    if (line.includes('dangerouslySetInnerHTML')) {
      const window = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 4)).join('\n');
      if (!window.includes('DOMPurify.sanitize')) {
        securityIssues.push({
          file: relPath,
          line: lineNum,
          issue: `dangerouslySetInnerHTML without DOMPurify: ${trimmed}`
        });
      }
    }

    // 2. Unsafe eval / new Function
    if (/\beval\s*\(/.test(line) && !line.includes('//') && !filePath.includes('scripts')) {
      securityIssues.push({
        file: relPath,
        line: lineNum,
        issue: `Unsafe eval() usage: ${trimmed}`
      });
    }

    // 3. Tailwind v4 deprecations in UI
    if (filePath.endsWith('.jsx')) {
      if (line.includes('bg-gradient-to-')) {
        tailwindIssues.push({
          file: relPath,
          line: lineNum,
          issue: `Tailwind v4 deprecation 'bg-gradient-to-' -> should be 'bg-linear-to-': ${trimmed}`
        });
      }
    }

    // 4. Raw Emojis in JSX UI components (excluding comments & console.log)
    if (filePath.includes('src/components') || filePath.includes('src\\components')) {
      if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*') && !trimmed.startsWith('console.')) {
        const match = line.match(EMOJI_REGEX);
        if (match) {
          uiEmojiIssues.push({
            file: relPath,
            line: lineNum,
            issue: `Emoji in JSX: ${match[0]} -> ${trimmed.slice(0, 90)}`
          });
        }
      }
    }

    // 5. Unsafe JSON.parse without try-catch or fallback
    if (/JSON\.parse\s*\([^)]+\)/.test(line) && !filePath.includes('test') && !filePath.includes('scripts')) {
      const window = lines.slice(Math.max(0, idx - 5), Math.min(lines.length, idx + 6)).join('\n');
      if (!window.includes('try') && !window.includes('catch')) {
        logicSyntaxIssues.push({
          file: relPath,
          line: lineNum,
          issue: `Unshielded JSON.parse can throw Uncaught SyntaxError: ${trimmed}`
        });
      }
    }
  });
}

function scanDir(dir, isServer = false) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.git' && f.name !== 'dist') {
        scanDir(fullPath, isServer || f.name === 'server');
      }
    } else if (/\.(jsx?|tsx?)$/.test(f.name)) {
      checkFile(fullPath, isServer);
    }
  }
}

scanDir(SRC_DIR, false);
scanDir(SERVER_DIR, true);

console.log('=== SECURITY VULNERABILITY SCAN ===');
console.log(`Found: ${securityIssues.length}`);
securityIssues.forEach(s => console.log(`  [SECURITY] ${s.file}:${s.line} -> ${s.issue}`));

console.log('\n=== TAILWIND V4 COMPLIANCE SCAN ===');
console.log(`Found: ${tailwindIssues.length}`);
tailwindIssues.forEach(t => console.log(`  [TAILWIND] ${t.file}:${t.line} -> ${t.issue}`));

console.log('\n=== UI EMOJI MANDATE SCAN ===');
console.log(`Found: ${uiEmojiIssues.length}`);
uiEmojiIssues.forEach(e => console.log(`  [EMOJI] ${e.file}:${e.line} -> ${e.issue}`));

console.log('\n=== LOGIC & RUNTIME ROBUSTNESS SCAN (e.g. Unshielded JSON.parse) ===');
console.log(`Found: ${logicSyntaxIssues.length}`);
logicSyntaxIssues.forEach(l => console.log(`  [LOGIC] ${l.file}:${l.line} -> ${l.issue}`));
