import { test, expect } from '@playwright/test';

test.describe('About Page (SITE-03)', () => {
  test('renders about page with owner info', async ({ page }) => {
    await page.goto('/th/about');
    // D-09: owner photo + bio
    await expect(page.locator('h1, [data-testid="about-title"]')).toBeVisible();
  });

  test('shows contact information', async ({ page }) => {
    await page.goto('/th/about');
    // D-10: Line ID and phone number
    await expect(page.locator('[data-testid="contact-info"]')).toBeVisible();
  });

  test('has booking CTA button', async ({ page }) => {
    await page.goto('/th/about');
    // D-12: booking CTA present
    const cta = page.locator('[data-testid="book-cta"]');
    await expect(cta).toBeVisible();
  });
});
