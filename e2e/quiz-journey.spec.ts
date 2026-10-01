import { test, expect } from "@playwright/test";

test.describe("Candidate Diagnostic Assessment Journey", () => {
  test("navigates to quiz runner in mock mode and completes question slate", async ({
    page,
  }) => {
    // Set mock mode in local storage before navigating
    await page.addInitScript(() => {
      localStorage.setItem("fastquiz_mock_override", "true");
    });

    await page.goto("/runner/quiz-system-design-1");

    // Verify Quiz Header and timer
    await expect(page.getByText(/Question 01/i)).toBeVisible();

    // Select Option B
    const optionB = page.getByText(/probabilistic early expiration/i);
    await expect(optionB).toBeVisible();
    await optionB.click();

    // Advance to Question 2
    const nextBtn = page.getByRole("button", { name: /Next Question/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    await expect(page.getByText(/Question 02/i)).toBeVisible();
  });
});
