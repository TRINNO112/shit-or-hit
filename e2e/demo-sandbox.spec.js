import { test, expect } from '@playwright/test';
import { installAirgapProtection } from './helpers/airgap.js';

test.describe('Demo Sandbox Isolation & Data Protection E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 🛡️ Airgap protection: guarantee zero disk or real diary writes
    await installAirgapProtection(page);

    await page.addInitScript(() => {
      const realUserEntries = {
        '2026-08-20': { date: '2026-08-20', rating: 5, verdict: 'Peak', notes: 'Authentic real diary entry' }
      };
      window.localStorage.setItem('goodness_db', JSON.stringify({
        version: '1.0',
        startDate: '2026-08-20',
        entries: realUserEntries
      }));
      window.localStorage.setItem('daily_verdict_vault_auto_lock_minutes', '-1');
      window.localStorage.setItem('daily_verdict_guest_disclaimer_dismissed', 'true');
    });
  });

  test('toggles Demo Sandbox via keyboard shortcut, verifies isolation, and exits cleanly', async ({ page }) => {
    await page.goto('/');

    // 1. Trigger Demo Sandbox via Ctrl + Shift + D
    await page.keyboard.press('Control+Shift+KeyD');

    // 2. Verify Demo Sandbox Banner appears
    const demoBanner = page.locator('text=DEMO SANDBOX ACTIVE').first();
    await expect(demoBanner).toBeVisible({ timeout: 10000 });

    // 3. Verify real localStorage goodness_db was NOT corrupted
    const realDbRaw = await page.evaluate(() => window.localStorage.getItem('goodness_db'));
    expect(realDbRaw).toContain('2026-08-20');
    expect(realDbRaw).toContain('Authentic real diary entry');

    // 4. Verify Demo Storage key exists separately
    const demoDbRaw = await page.evaluate(() => window.localStorage.getItem('goodness_db_demo_sandbox'));
    expect(demoDbRaw).toBeTruthy();
    expect(demoDbRaw).toContain('isDemoSandbox');

    // 5. Exit Demo Sandbox via button
    const exitBtn = page.locator('button', { hasText: /EXIT DEMO/i }).first();
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();

    // 6. Verify banner is dismissed
    await expect(demoBanner).not.toBeVisible();
  });
});
