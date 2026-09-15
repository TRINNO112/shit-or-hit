import { test, expect } from '@playwright/test';

test.describe('Daily Verdict & Reflection E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 🛡️ AIR-GAP BARRIER 1: Intercept all backend API calls in-memory so no disk writes can EVER occur
    await page.route('**/api/entries', async (route) => {
      if (route.request().method() === 'POST') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            entry: {
              ...body,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            }
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            startDate: '2026-09-01',
            data: {
              '2026-09-01': { date: '2026-09-01', rating: 4, verdict: 'Good', notes: 'Sandbox test day' }
            },
            total: 1
          })
        });
      }
    });

    await page.route('**/api/database', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          version: '1.0',
          startDate: '2026-09-01',
          entries: {
            '2026-09-01': { date: '2026-09-01', rating: 4, verdict: 'Good', notes: 'Sandbox test day' }
          }
        })
      });
    });

    // 🛡️ AIR-GAP BARRIER 2: Sandbox LocalStorage Isolation
    await page.addInitScript(() => {
      const sandboxEntries = {
        '2026-09-01': { date: '2026-09-01', rating: 4, verdict: 'Good', notes: 'Initial baseline day' }
      };
      window.localStorage.setItem('goodness_db', JSON.stringify({
        version: '1.0',
        startDate: '2026-09-01',
        entries: sandboxEntries
      }));
      window.localStorage.setItem('shit_or_hit_entries_v2_local', JSON.stringify(sandboxEntries));
      // Disable auto-lock and disclaimers during tests
      window.localStorage.setItem('daily_verdict_vault_auto_lock_minutes', '-1');
      window.localStorage.setItem('daily_verdict_guest_disclaimer_dismissed', 'true');
    });
  });

  test('submits daily 4-star verdict rating and saves journal reflection without touching real database', async ({ page }) => {
    await page.goto('/');

    // Wait for the app header to be visible
    await expect(page.locator('h1', { hasText: 'SHIT OR HIT' })).toBeVisible();

    // Find and click the 4-star "Good" rating button
    const goodRatingBtn = page.locator('button[title*="Good (4/5)"]').first();
    await expect(goodRatingBtn).toBeVisible();
    await goodRatingBtn.click();

    // Verify verdict display reflects GOOD
    await expect(page.getByText(/VERDICT:\s*GOOD/i)).toBeVisible();

    // Open reflection notes if not already open
    const openNoteBtn = page.locator('button', { hasText: /Day Journal|Reflection/i }).first();
    if (await openNoteBtn.isVisible()) {
      await openNoteBtn.click();
    }

    // Type notes in textarea
    const textarea = page.locator('textarea[placeholder*="Write your raw diary thoughts"]').first();
    await expect(textarea).toBeVisible();
    await textarea.fill('Automated Playwright E2E test entry: High velocity and zero regressions.');

    // Save diary entry
    const saveBtn = page.locator('button', { hasText: /SAVE DIARY ENTRY/i }).first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify textarea retains the entered text
    await expect(textarea).toHaveValue(/Automated Playwright E2E test entry/);
  });
});
