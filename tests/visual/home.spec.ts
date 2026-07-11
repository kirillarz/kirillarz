import { mkdir } from "node:fs/promises";

import { expect, test } from "@playwright/test";

test("home renders on desktop and mobile", async ({ page }) => {
  await mkdir("artifacts", { recursive: true });

  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({ path: "artifacts/home-desktop-reference-viewport.png" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({ path: "artifacts/home-desktop.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /Узнать обо мне/ })).toHaveAttribute("href", "/employer");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: "artifacts/home-mobile.png" });
});
