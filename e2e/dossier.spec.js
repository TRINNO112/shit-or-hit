import { test, expect } from '@playwright/test';

test.describe('Monthly Intelligence Dossier E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const sandboxEntries = {
        '2026-09-01': { date: '2026-09-01', rating: 5, verdict: 'Peak', notes: 'Perfect 25/25 in exams and held focus' },
        '2026-09-02': { date: '2026-09-02', rating: 4, verdict: 'Good', notes: 'Topped economics with 22' },
        '2026-09-03': { date: '2026-09-03', rating: 3, verdict: 'Okay', notes: 'Domestic chores and tea brewing' }
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

  test('switches to monthly dossier and inspects intelligence views', async ({ page }) => {
    await page.goto('/');

    // Switch to Dossier tab
    const dossierTab = page.locator('nav button', { hasText: 'DOSSIER' }).first();
    await expect(dossierTab).toBeVisible();
    await dossierTab.click();

    // Verify Dossier container loads in main
    const mainArea = page.locator('main');
    await expect(mainArea.locator('text=EXECUTIVE SUMMARY').or(mainArea.locator('text=STORYLINE')).or(mainArea.locator('text=CHRONICLE')).or(mainArea.locator('text=DOSSIER')).first()).toBeVisible({ timeout: 15000 });
  });
});
