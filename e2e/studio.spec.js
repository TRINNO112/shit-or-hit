import { test, expect } from '@playwright/test';

test.describe('Creative Studio & Aesthetic Poster Export E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const sandboxEntries = {
        '2026-09-01': { date: '2026-09-01', rating: 5, verdict: 'Peak', notes: 'Peak execution studio export' }
      };
      window.localStorage.setItem('goodness_db', JSON.stringify({
        version: '1.0',
        startDate: '2026-09-01',
        entries: sandboxEntries
      }));
      window.localStorage.setItem('shit_or_hit_entries_v2_local', JSON.stringify(sandboxEntries));
      window.localStorage.setItem('daily_verdict_vault_auto_lock_minutes', '-1');
      window.localStorage.setItem('daily_verdict_guest_disclaimer_dismissed', 'true');
    });
  });

  test('switches to creative studio and verifies card rasterization UI', async ({ page }) => {
    await page.goto('/');

    // Switch to Studio tab
    const studioTab = page.locator('nav button', { hasText: 'STUDIO' }).first();
    await expect(studioTab).toBeVisible();
    await studioTab.click();

    // Verify Studio export UI loads in main
    const mainArea = page.locator('main');
    await expect(mainArea.locator('text=CREATIVE STUDIO').or(mainArea.locator('text=AESTHETIC')).or(mainArea.locator('text=EXPORT')).or(mainArea.locator('text=VARIANT')).first()).toBeVisible({ timeout: 15000 });
  });
});
