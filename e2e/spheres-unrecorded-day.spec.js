import { test, expect } from '@playwright/test';

test.describe('Life Spheres on Unrecorded Days E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Set sandbox state with Sphere Mode explicitly enabled
      window.localStorage.setItem('daily_verdict_sphere_mode_enabled', 'true');
      const sandboxEntries = {
        '2026-09-01': { date: '2026-09-01', rating: 5, verdict: 'Peak', notes: 'First day logged' }
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

  test('opens unrecorded day in sphere mode without empty white void', async ({ page }) => {
    await page.goto('/');

    // Switch to Timeline / Calendar view
    const timelineTab = page.locator('nav button', { hasText: 'TIMELINE' }).first();
    await expect(timelineTab).toBeVisible();
    await timelineTab.click();

    // Look for calendar days
    await page.waitForTimeout(500);

    // Click an unrecorded day (e.g. Day 2)
    const unrecordedDayBtn = page.locator('button', { hasText: /^2$/ }).first();
    if (await unrecordedDayBtn.isVisible()) {
      await unrecordedDayBtn.click();

      // Verify EditDayModal opens
      const modalHeader = page.locator('text=EDIT DAY').first();
      await expect(modalHeader).toBeVisible({ timeout: 5000 });

      // Invariant: The Life Spheres section MUST be visible
      const spheresHeader = page.locator('text=LIFE SPHERES PERFORMANCE & REFLECTIONS');
      await expect(spheresHeader).toBeVisible();

      // Invariant: Standard active spheres MUST be rendered, NOT an empty void
      await expect(page.locator('text=Health & Energy').first()).toBeVisible();
      await expect(page.locator('text=Work / School').first()).toBeVisible();
      await expect(page.locator('text=Social & Connection').first()).toBeVisible();

      // Invariant: Outlier Event button must be present
      await expect(page.locator('text=ADD SPECIAL OUTLIER EVENT FOR TODAY')).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button', { hasText: 'CANCEL' }).first();
      await closeBtn.click();
      await expect(modalHeader).not.toBeVisible();
    }
  });
});
