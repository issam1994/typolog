import { test, expect } from "@playwright/test";

test.describe("quiz journey", () => {
  test("browses, completes the sample test, and views results", async ({
    page,
  }) => {
    // Browse the published tests and open the sample test.
    await page.goto("/tests");
    await expect(
      page.getByRole("heading", { name: "Choose a Test" }),
    ).toBeVisible();
    await page.getByRole("link", { name: /Sample Personality Test/ }).click();

    // Intro → start.
    await expect(
      page.getByRole("heading", { name: "Sample Personality Test" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Start Test" }).click();
    await expect(page).toHaveURL(/\/tests\/sample\/quiz$/);

    // Next stays disabled until an option is chosen.
    await expect(page.getByText("I enjoy trying new things.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Next", exact: true }),
    ).toBeDisabled();

    // Answer both questions.
    await page.getByRole("button", { name: "Agree", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByText("I keep my space tidy.")).toBeVisible();
    await page
      .getByRole("button", { name: "Strongly Agree", exact: true })
      .click();
    await page
      .getByRole("button", { name: "See Results", exact: true })
      .click();

    // Results.
    await expect(page).toHaveURL(/\/tests\/sample\/results\?submission=/);
    await expect(
      page.getByRole("heading", { name: "Your Results" }),
    ).toBeVisible();
    await expect(page.getByText("Openness", { exact: true })).toBeVisible();
    await expect(page.getByText("Orderliness", { exact: true })).toBeVisible();

    // Fallback: visiting results with no submission id redirects using the
    // result saved to localStorage during submission.
    await page.goto("/tests/sample/results");
    await expect(page).toHaveURL(/\/tests\/sample\/results\?submission=/);
    await expect(
      page.getByRole("heading", { name: "Your Results" }),
    ).toBeVisible();
  });

  test("restores in-progress answers after a reload", async ({ page }) => {
    await page.goto("/tests/sample/quiz");
    await expect(page.getByText("I enjoy trying new things.")).toBeVisible();
    await page.getByRole("button", { name: "Agree", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("I keep my space tidy.")).toBeVisible();

    await page.reload();

    // Progress persisted to localStorage → still on question two.
    await expect(page.getByText("I keep my space tidy.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Back", exact: true }),
    ).toBeVisible();
  });
});
