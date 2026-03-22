import { test, expect } from "@playwright/test";

test.describe("Admin: Route protection (ADMIN-06)", () => {
  test("unauthenticated user visiting /th/admin is redirected to /th/book", async ({ page }) => {
    await page.goto("/th/admin");
    // D-08: silent redirect to /book
    await expect(page).toHaveURL(/\/th\/book/);
  });

  test("unauthenticated user visiting /en/admin is redirected to /en/book", async ({ page }) => {
    await page.goto("/en/admin");
    await expect(page).toHaveURL(/\/en\/book/);
  });

  test("admin dashboard content is not visible to unauthenticated user", async ({ page }) => {
    await page.goto("/th/admin");
    const adminDashboard = page.getByTestId("admin-dashboard");
    await expect(adminDashboard).not.toBeVisible();
  });
});
