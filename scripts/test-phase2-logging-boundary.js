#!/usr/bin/env node
/**
 * ⚡ TEST PHASE 2: Winston Structured Logging & React Error Boundary Verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../server/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failed++;
  }
}

console.log('\n=============================================================');
console.log('🧪 VERIFYING PHASE 2: WINSTON LOGGING & ERROR BOUNDARY');
console.log('=============================================================\n');

// 1. Test Winston Structured Logging
console.log('🪵 [1/2] Verifying Winston Logger & JSON File Transports...');

const testTraceId = `test-${Date.now()}`;
logger.info('Phase 2 verification test info entry', { traceId: testTraceId, status: 200 });
logger.warn('Phase 2 verification test warn entry', { traceId: testTraceId, status: 400 });
logger.error('Phase 2 verification test error entry', { traceId: testTraceId, status: 500, detail: 'Simulated fault' });

// Allow a brief moment for asynchronous file flush
await new Promise(resolve => setTimeout(resolve, 300));

const serverLogPath = path.join(ROOT_DIR, 'logs', 'server.log');
const errorLogPath = path.join(ROOT_DIR, 'logs', 'error.log');

assert(fs.existsSync(serverLogPath), 'logs/server.log created successfully');
assert(fs.existsSync(errorLogPath), 'logs/error.log created successfully');

const serverLogContent = fs.readFileSync(serverLogPath, 'utf-8');
const errorLogContent = fs.readFileSync(errorLogPath, 'utf-8');

assert(serverLogContent.includes(testTraceId), 'server.log contains structured test log entries');
assert(errorLogContent.includes(testTraceId), 'error.log accurately filtered error level logs');

// Verify that log lines are valid JSON objects
const lines = serverLogContent.trim().split('\n');
const lastLine = lines[lines.length - 1];
let parsedLine = null;
try {
  parsedLine = JSON.parse(lastLine);
} catch (e) {}

assert(parsedLine && parsedLine.level && parsedLine.timestamp, 'server.log lines are machine-readable JSON');

// 2. Test React Error Boundary Component
console.log('\n🛡️ [2/2] Verifying Neobrutalist React Error Boundary Component...');

const ebPath = path.join(ROOT_DIR, 'src', 'components', 'ErrorBoundary.jsx');
assert(fs.existsSync(ebPath), 'ErrorBoundary.jsx component exists');

const ebContent = fs.readFileSync(ebPath, 'utf-8');
assert(ebContent.includes('componentDidCatch') && ebContent.includes('getDerivedStateFromError'), 'ErrorBoundary implements React Error Boundary lifecycle methods');
assert(ebContent.includes('Something went wonky'), 'Neobrutalist heading present');
assert(ebContent.includes('Reload App'), '1-tap Reload App trigger present');
assert(ebContent.includes('handleCopyDiagnostics'), 'Copy Diagnostics action present');
assert(ebContent.includes('VITE_SENTRY_DSN'), 'Sentry telemetry integration hooks present');
assert(ebContent.includes('safe and untouched'), 'Calming data safety notice present');

const mainPath = path.join(ROOT_DIR, 'src', 'main.jsx');
const mainContent = fs.readFileSync(mainPath, 'utf-8');
assert(mainContent.includes('<ErrorBoundary>') && mainContent.includes('</ErrorBoundary>'), 'main.jsx wraps application root in ErrorBoundary');

console.log('\n=============================================================');
console.log(`📊 PHASE 2 RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('=============================================================\n');

if (failed > 0) process.exit(1);
