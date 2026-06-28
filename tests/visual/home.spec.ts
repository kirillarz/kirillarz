import { mkdir } from "node:fs/promises";

import { expect, test } from "@playwright/test";

test("home renders on desktop and mobile", async ({ page }) => {
  await mkdir("artifacts", { recursive: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
});
