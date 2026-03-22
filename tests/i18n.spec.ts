import { test, expect } from '@playwright/test';

test.describe('Internationalization (I18N-01, I18N-02)', () => {
  test('root URL redirects to /th/ (default locale)', async ({ page }) => {
    await page.goto('/');
    // D-13, D-14: default is Thai, no browser detection
    expect(page.url()).toContain('/th');
  });

  test('/th/ route loads Thai content', async ({ page }) => {
    await page.goto('/th/services');
    // Thai section heading from Copywriting Contract
    await expect(page.locator('text=บริการ')).toBeVisible();
  });

  test('/en/ route loads English content', async ({ page }) => {
    await page.goto('/en/services');
    await expect(page.locator('text=Services')).toBeVisible();
  });

  test('language toggle switches from Thai to English', async ({ page }) => {
    await page.goto('/th/services');
    // D-16: TH | EN text switcher
    const enToggle = page.locator('button:has-text("EN")');
    await enToggle.click();
    await page.waitForURL('**/en/services');
    await expect(page.locator('text=Services')).toBeVisible();
  });

  test('language toggle switches from English to Thai', async ({ page }) => {
    await page.goto('/en/services');
    const thToggle = page.locator('button:has-text("TH")');
    await thToggle.click();
    await page.waitForURL('**/th/services');
    await expect(page.locator('text=บริการ')).toBeVisible();
  });
});
