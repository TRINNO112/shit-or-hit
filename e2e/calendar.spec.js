import { test, expect } from '@playwright/test';

test.describe('Calendar Matrix & Timeline Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const sandboxEntries = {
        '2026-09-01': { date: '2026-09-01', rating: 5, verdict: 'Peak', notes: 'First day win' },
        '2026-09-02': { date: '2026-09-02', rating: 4, verdict: 'Good', notes: 'Solid momentum' }
      };
      window.localStorage.setItem('goodness_db', JSON.stringify({
        version: '1.0',
        startDate: '2026-09-01',
        entries: sandboxEntries
      }));
      window.localStorage.setItem('shit_or_hit_entries_v2_local', JSON.stringify(sandboxEntries));
      window.localStorage.setItem('daily_verdict_vault_auto_lock_minutes', '-1');
    });
  });

  test('switches to timeline tab and renders calendar matrix', async ({ page }) => {
    await page.goto('/');

    // Switch to Timeline tab
    const timelineTab = page.locator('nav button', { hasText: 'TIMELINE' }).first();
    await expect(timelineTab).toBeVisible();
    await timelineTab.click();

    // Verify Calendar or Timeline content renders inside main
    const mainArea = page.locator('main');
    await expect(mainArea.locator('text=JOURNEY TIMELINE').or(mainArea.locator('text=CALENDAR')).or(mainArea.locator('text=Sep')).first()).toBeVisible({ timeout: 15000 });
  });
});
