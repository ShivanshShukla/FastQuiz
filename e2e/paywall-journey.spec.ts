import { test, expect } from "@playwright/test";

test.describe("Pricing & Refund Policy Transparency Journey", () => {
  test("displays truthful pricing tiers and links to 7-day refund policy", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // Verify transparent pricing headings
    await expect(
      page.getByRole("heading", { name: /Transparent, Pay-Per-Track/i }),
    ).toBeVisible();

    // Verify refund policy guarantee link
    const refundLink = page.getByRole("link", {
      name: /7-Day Technical Defect Refund Policy/i,
    });
    await expect(refundLink).toBeVisible();
    await refundLink.click();

    // Verifies navigation to statutory refund policy page
    await expect(page).toHaveURL(/\/refund-policy/);
    await expect(
      page.getByRole("heading", { name: /Cancellation & Refund Policy/i }),
    ).toBeVisible();
  });
});
