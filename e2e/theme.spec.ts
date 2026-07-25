import { test, expect } from "@playwright/test";

test("toggles the theme and persists it across a reload", async ({ page }) => {
  await page.goto("/tests/sample");

  const html = page.locator("html");
  await expect(html).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(html).toHaveClass(/light/);

  await page.reload();
  await expect(html).toHaveClass(/light/);
});
