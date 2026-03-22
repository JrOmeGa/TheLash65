import { test, expect } from '@playwright/test';

test.describe('Service Menu (SITE-02)', () => {
  test('renders service cards with name, price, and duration', async ({ page }) => {
    await page.goto('/th/services');
    const cards = page.locator('[data-testid="service-card"]');
    await expect(cards.first()).toBeVisible();
    // D-06: each card shows name, description, duration, price
    await expect(cards.first().locator('[data-testid="service-name"]')).toBeVisible();
    await expect(cards.first().locator('[data-testid="service-price"]')).toBeVisible();
    await expect(cards.first().locator('[data-testid="service-duration"]')).toBeVisible();
  });

  test('displays price in THB with baht symbol', async ({ page }) => {
    await page.goto('/th/services');
    // D-07: price as plain number with baht symbol
    const price = page.locator('[data-testid="service-price"]').first();
    await expect(price).toHaveText(/฿\d+/);
  });
});
