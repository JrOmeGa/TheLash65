import { test, expect } from '@playwright/test';

test.describe('Portfolio Gallery (SITE-01)', () => {
  test('renders gallery grid with images', async ({ page }) => {
    await page.goto('/th/portfolio');
    const grid = page.locator('[data-testid="gallery-grid"]');
    await expect(grid).toBeVisible();
    // D-01: 2-column grid on mobile
    const images = grid.locator('img');
    await expect(images.first()).toBeVisible();
  });

  test('opens lightbox on image click', async ({ page }) => {
    await page.goto('/th/portfolio');
    const firstImage = page.locator('[data-testid="gallery-grid"] img').first();
    await firstImage.click();
    // D-02: lightbox modal opens
    const lightbox = page.locator('[role="dialog"]');
    await expect(lightbox).toBeVisible();
  });

  test('lightbox close button works', async ({ page }) => {
    await page.goto('/th/portfolio');
    await page.locator('[data-testid="gallery-grid"] img').first().click();
    const closeBtn = page.locator('[aria-label="ปิด"]');
    await closeBtn.click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
