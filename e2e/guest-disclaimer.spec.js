import { test, expect } from '@playwright/test';

test.describe('Neobrutalist Guest Mode Disclaimer & Two-Tier Access Gate', () => {
  test('displays guest disclaimer modal on first load with required safety warnings', async ({ page }) => {
    // Ensure clean guest storage without dismissal flag
    await page.addInitScript(() => {
      window.localStorage.removeItem('local_auth_user');
      window.localStorage.removeItem('daily_verdict_guest_disclaimer_dismissed');
      window.localStorage.setItem('daily_verdict_vault_auto_lock_minutes', '-1');
    });

    await page.goto('/');

    // 1. Status Badge Verification
    const badge = page.locator('text=LOCAL GUEST MODE');
    await expect(badge).toBeVisible({ timeout: 10000 });

    // 2. Core Warning Verification
    const coreWarning = page.locator('text=Your diary reflections, habit streaks, and PIN settings are stored in this browser only.');
    await expect(coreWarning).toBeVisible();

    // 3. PIN & Data Loss Warning Verification
    const pinWarning = page.locator('text=If you set a Vault PIN or clear your browser data, your records cannot be recovered. There are zero cloud backups in guest mode.');
    await expect(pinWarning).toBeVisible();

    // 4. Developer Whitelist CTA Verification
    const cta = page.locator('text=Contact the developer to have your email whitelisted for cloud backups and AI features, or sign in if you already have an authorized email.');
    await expect(cta).toBeVisible();

    // 5. Action Buttons Verification
    const googleBtn = page.locator('button', { hasText: 'Sign In With Google' });
    await expect(googleBtn).toBeVisible();

    const dismissBtn = page.locator('button', { hasText: 'I Understand the Risks' });
    await expect(dismissBtn).toBeVisible();

    // 6. Dismissal interaction
    await dismissBtn.click();
    await expect(badge).not.toBeVisible();

    // 7. Verify localStorage persisted dismissal flag
    const isDismissed = await page.evaluate(() => {
      return !!window.localStorage.getItem('daily_verdict_guest_disclaimer_dismissed');
    });
    expect(isDismissed).toBe(true);

    // 8. Reload page and ensure disclaimer remains dismissed
    await page.reload();
    await expect(page.locator('text=LOCAL GUEST MODE')).not.toBeVisible();
  });
});
