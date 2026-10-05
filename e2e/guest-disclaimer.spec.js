import { test, expect } from '@playwright/test';
import { installAirgapProtection } from './helpers/airgap.js';

test.describe('Neobrutalist Guest Mode Disclaimer & Two-Tier Access Gate', () => {
  test.beforeEach(async ({ page }) => {
    await installAirgapProtection(page);
  });

  test('displays guest disclaimer modal on first load with required safety warnings', async ({ page }) => {
    // Ensure clean guest storage without dismissal flag
    await page.addInitScript(() => {
      window.localStorage.removeItem('local_auth_user');
      window.localStorage.removeItem('daily_verdict_guest_disclaimer_dismissed');
      window.localStorage.setItem('daily_verdict_vault_auto_lock_minutes', '-1');
    });

    await page.goto('/');

    // 1. Modal Title Verification
    const modalTitle = page.locator('text=Guest Mode & Data Sovereignty Notice').first();
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // 2. Status Badge Verification
    const statusNotice = page.locator('text=LOCAL GUEST MODE (YOUR CURRENT STATUS)').first();
    await expect(statusNotice).toBeVisible();

    // 3. Zero Backdoor Recovery Warning
    const zeroBackdoor = page.locator('text=ZERO BACKDOOR RECOVERY').first();
    await expect(zeroBackdoor).toBeVisible();

    // 4. Action Buttons Verification
    const googleBtn = page.locator('button', { hasText: 'Sign In With Google' }).first();
    await expect(googleBtn).toBeVisible();

    const dismissBtn = page.locator('button', { hasText: 'I Understand & Enter Local Mode' }).first();
    await expect(dismissBtn).toBeVisible();

    // 5. Dismissal interaction
    await dismissBtn.click();
    await expect(modalTitle).not.toBeVisible();

    // 6. Verify localStorage persisted dismissal flag
    const isDismissed = await page.evaluate(() => {
      return !!window.localStorage.getItem('daily_verdict_guest_disclaimer_dismissed');
    });
    expect(isDismissed).toBe(true);

    // 7. Reload page and ensure disclaimer remains dismissed
    await page.reload();
    await expect(page.locator('text=Guest Mode & Data Sovereignty Notice')).not.toBeVisible();
  });
});
