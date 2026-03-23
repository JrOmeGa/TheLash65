import { test, expect } from "@playwright/test";

test.describe("Auth: Booking page sign-in step", () => {
  test("unauthenticated user sees sign-in step on /th/book", async ({ page }) => {
    await page.goto("/th/book");
    const signInStep = page.getByTestId("book-signin-step");
    await expect(signInStep).toBeVisible();
  });

  test("unauthenticated user sees sign-in step on /en/book", async ({ page }) => {
    await page.goto("/en/book");
    const signInStep = page.getByTestId("book-signin-step");
    await expect(signInStep).toBeVisible();
  });

  test("Google sign-in button is rendered on /th/book (AUTH-01)", async ({ page }) => {
    await page.goto("/th/book");
    const googleButton = page.getByTestId("google-signin-button");
    await expect(googleButton).toBeVisible();
  });

  test("Facebook sign-in button is rendered on /th/book (AUTH-02)", async ({ page }) => {
    await page.goto("/th/book");
    const facebookButton = page.getByTestId("facebook-signin-button");
    await expect(facebookButton).toBeVisible();
  });

  test("Google sign-in button is rendered on /en/book (AUTH-01)", async ({ page }) => {
    await page.goto("/en/book");
    const googleButton = page.getByTestId("google-signin-button");
    await expect(googleButton).toBeVisible();
  });

  test("Facebook sign-in button is rendered on /en/book (AUTH-02)", async ({ page }) => {
    await page.goto("/en/book");
    const facebookButton = page.getByTestId("facebook-signin-button");
    await expect(facebookButton).toBeVisible();
  });
});
