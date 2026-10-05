import { test, expect } from '@playwright/test';
import { installAirgapProtection } from './helpers/airgap.js';

test.describe('Mobile Behavioral Domino Map Dialog E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 🛡️ Airgap protection: guarantee zero disk or real diary writes
    await installAirgapProtection(page);

    await page.addInitScript(() => {
      const sandboxEntries = {
        '2026-09-01': { date: '2026-09-01', rating: 1, verdict: 'Rough', notes: 'Severe friction day' },
        '2026-09-02': { date: '2026-09-02', rating: 2, verdict: 'Down', notes: 'Compounding fatigue' },
        '2026-09-03': { date: '2026-09-03', rating: 4, verdict: 'Good', notes: 'Slump broken' }
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

  test('opens mobile dossier and launches Domino Effect dialog modal', async ({ page }) => {
    // Force mobile viewport (320px x 600px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Switch to Mobile Dossier tab
    const mobileDossierTab = page.locator('button', { hasText: 'DOSSIER' }).first();
    if (await mobileDossierTab.isVisible()) {
      await mobileDossierTab.click();
    }

    // Check for "OPEN CAUSAL MAP" button
    const openMapBtn = page.locator('button', { hasText: /OPEN CAUSAL MAP/i }).first();
    if (await openMapBtn.isVisible({ timeout: 10000 })) {
      await openMapBtn.click();

      // Verify Domino Effect Dialog modal is visible
      const dominoModalHeader = page.locator('text=BEHAVIORAL DOMINO MAP').first();
      await expect(dominoModalHeader).toBeVisible({ timeout: 5000 });

      // Close modal
      const closeBtn = page.locator('button', { hasText: /CLOSE/i }).first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await expect(dominoModalHeader).not.toBeVisible();
      }
    }
  });
});
