import { expect, test } from "@playwright/test";

import { artifactsDir, captureScreenshot } from "./helpers";

test("cookie notice stores a privacy-preserving choice", async ({ page }) => {
  await page.goto("/");

  const notice = page.getByLabel("Настройки аналитических cookies");
  await expect(notice).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/cookie-notice-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(notice).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/cookie-notice-mobile.png`);

  await page.setViewportSize({ width: 320, height: 568 });
  const noticeBox = await notice.boundingBox();
  expect(noticeBox).not.toBeNull();
  expect(noticeBox!.x).toBeGreaterThanOrEqual(8);
  expect(noticeBox!.x + noticeBox!.width).toBeLessThanOrEqual(312);
  expect(noticeBox!.y + noticeBox!.height).toBeLessThanOrEqual(512);
  await captureScreenshot(page, `${artifactsDir}/cookie-notice-mobile-320.png`);

  await notice.getByRole("button", { name: "Только необходимые" }).click();

  await expect(notice).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("kirillarz.analyticsConsent"))).toBe("denied");
});

test("privacy page exposes analytics controls", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kirillarz.analyticsConsent", "denied"));
  await page.goto("/privacy");

  await expect(page.getByRole("heading", { name: "Политика конфиденциальности", level: 1 })).toBeVisible();
  await expect(page.getByText("Текущее состояние: аналитика отключена.")).toBeVisible();

  await page.getByRole("button", { name: "Разрешить аналитику" }).click();
  await expect(page.getByText("Текущее состояние: аналитика разрешена.")).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/privacy-desktop.png`, true);

  await page.setViewportSize({ width: 390, height: 844 });
  await captureScreenshot(page, `${artifactsDir}/privacy-mobile.png`, true);
});
