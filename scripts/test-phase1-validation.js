#!/usr/bin/env node
/**
 * ⚡ TEST PHASE 1: OpenAPI Documentation & Joi Schema Validation Verification
 */

import http from 'http';
import express from 'express';
import { validateBody, validateQuery } from '../server/middleware/validate.js';
import {
  entrySchema,
  monthlyReportQuerySchema,
  monthlyReportBodySchema,
  aiEnhanceSchema,
  bulkEntriesSchema
} from '../server/schemas/apiSchemas.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
console.log('🧪 VERIFYING PHASE 1: OPENAPI SPECS & JOI SCHEMA MIDDLEWARE');
console.log('=============================================================\n');

// 1. Verify OpenAPI Spec file integrity
console.log('📄 [1/3] Verifying OpenAPI Specification JSON...');
const specPath = path.join(__dirname, '..', 'server', 'openapi.json');
assert(fs.existsSync(specPath), 'openapi.json file exists on disk');
const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
assert(spec.openapi === '3.0.3', 'OpenAPI version is 3.0.3');
assert(spec.paths['/api/entries'] && spec.paths['/api/monthly-report'] && spec.paths['/api/health'], 'Core routes documented in OpenAPI');
assert(spec.components?.schemas?.ValidationError, 'ValidationError schema component defined');

// 2. Unit Testing Joi Schemas Directly
console.log('\n🛡️ [2/3] Testing Joi Schemas against Adversarial Payloads...');

// Entry Schema
const validEntry = { date: '2026-09-12', rating: 4, notes: 'Great sprint', verdict: 'Good' };
const resValidEntry = entrySchema.validate(validEntry);
assert(!resValidEntry.error, 'Valid entry payload passes validation');

const invalidEntryRatingLow = { date: '2026-09-12', rating: 0 };
const resEntryRatingLow = entrySchema.validate(invalidEntryRatingLow);
assert(resEntryRatingLow.error && (resEntryRatingLow.error.message.includes('less than 1') || resEntryRatingLow.error.message.includes('greater than or equal to 1')), 'Rejects rating < 1');

const invalidEntryRatingHigh = { date: '2026-09-12', rating: 6 };
const resEntryRatingHigh = entrySchema.validate(invalidEntryRatingHigh);
assert(resEntryRatingHigh.error && (resEntryRatingHigh.error.message.includes('greater than 5') || resEntryRatingHigh.error.message.includes('less than or equal to 5')), 'Rejects rating > 5');

const invalidEntryDate = { date: '12-09-2026', rating: 3 };
const resEntryDate = entrySchema.validate(invalidEntryDate);
assert(resEntryDate.error && resEntryDate.error.message.includes('YYYY-MM-DD'), 'Rejects non-ISO date format');

// Monthly Report Schemas
const validReportQuery = { year: 2026, month: 9 };
assert(!monthlyReportQuerySchema.validate(validReportQuery).error, 'Valid monthly report query passes');

const invalidReportMonth = { year: 2026, month: 13 };
assert(monthlyReportQuerySchema.validate(invalidReportMonth).error, 'Rejects month > 12');

const invalidReportYear = { year: 1999, month: 5 };
assert(monthlyReportQuerySchema.validate(invalidReportYear).error, 'Rejects year < 2000');

// AI Enhance Schema
const emptyAiPayload = { notes: '', spheres: {} };
assert(aiEnhanceSchema.validate(emptyAiPayload).error, 'Rejects empty AI enhance payload without notes or spheres');

const validAiPayload = { notes: 'Woke up early, executed deep work.', rating: 5, preferredLanguage: 'english' };
assert(!aiEnhanceSchema.validate(validAiPayload).error, 'Accepts valid AI reflection payload');

// 3. Integration Testing Express Middleware with HTTP Server
console.log('\n🌐 [3/3] Testing Live Express Integration & Error Formats...');

const testApp = express();
testApp.use(express.json());

testApp.post('/test/entry', validateBody(entrySchema), (req, res) => {
  res.json({ success: true, saved: req.body });
});

testApp.get('/test/monthly-report', validateQuery(monthlyReportQuerySchema), (req, res) => {
  res.json({ success: true, query: req.query });
});

const server = testApp.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Test 1: POST valid entry
    const r1 = await fetch(`${baseUrl}/test/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-09-12', rating: 5, notes: 'Testing live route' })
    });
    const d1 = await r1.json();
    assert(r1.status === 200 && d1.success === true, 'HTTP 200 on valid POST /test/entry');

    // Test 2: POST invalid entry (bad rating)
    const r2 = await fetch(`${baseUrl}/test/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-09-12', rating: 99 })
    });
    const d2 = await r2.json();
    assert(r2.status === 400 && d2.success === false && Array.isArray(d2.details), 'HTTP 400 and structured error response on invalid rating');

    // Test 3: GET valid report query
    const r3 = await fetch(`${baseUrl}/test/monthly-report?year=2026&month=9`);
    const d3 = await r3.json();
    assert(r3.status === 200 && d3.success === true, 'HTTP 200 on valid GET /test/monthly-report');

    // Test 4: GET invalid report query
    const r4 = await fetch(`${baseUrl}/test/monthly-report?year=2026&month=99`);
    const d4 = await r4.json();
    assert(r4.status === 400 && d4.success === false, 'HTTP 400 on invalid month query parameter');

  } catch (err) {
    console.error('Integration test exception:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n=============================================================');
    console.log(`📊 PHASE 1 RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('=============================================================\n');
    if (failed > 0) process.exit(1);
  }
});
