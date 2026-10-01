import { test, expect } from "@playwright/test";

test.describe("Candidate Authentication & Onboarding Journey", () => {
  test("renders login page with OAuth options and signs in with credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    // Verify heading
    await expect(
      page.getByRole("heading", { name: /Sign in to FastQuiz/i }),
    ).toBeVisible();

    // Verify OAuth buttons
    await expect(
      page.getByRole("button", { name: /Continue with Google/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with GitHub/i }),
    ).toBeVisible();

    // Fill credentials
    await page.getByLabel(/Email Address/i).fill("sarah.engineer@uber.com");
    await page.getByLabel(/^Password/i).fill("staffSecret123!");

    // Submit login
    await page.getByRole("button", { name: /Sign In with Email/i }).click();

    // Expect navigation to curriculum or dashboard
    await expect(page).toHaveURL(/\/curriculum/);
  });
});
