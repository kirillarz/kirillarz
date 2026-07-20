import { expect, test } from "@playwright/test";

import {
  artifactsDir,
  scrollToSection,
  expectImagesReady,
  captureScreenshot,
} from "./helpers";
test("hobby section reveals descriptions without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const hobbySection = page.getByRole("region", { name: "Не только кодом и проектами" });
  await scrollToSection(hobbySection);
  await expectImagesReady(hobbySection);

  const hobbyButtons = hobbySection.getByRole("button");
  const skiing = hobbySection.getByRole("button", { name: "Горнолыжка" });
  const swimming = hobbySection.getByRole("button", { name: "Плавание" });
  await expect(hobbyButtons).toHaveCount(5);
  await expect(skiing).toHaveAttribute("aria-expanded", "false");

  await skiing.hover();
  await expect(skiing).toHaveAttribute("aria-expanded", "true");
  await expect(hobbySection.locator('[role="tooltip"]:visible')).toHaveCount(1);

  await page.keyboard.press("Tab");
  await swimming.focus();
  await expect(swimming).toHaveAttribute("aria-expanded", "true");
  await expect(hobbySection.locator('[role="tooltip"]:visible')).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await swimming.evaluate((element: HTMLElement) => element.blur());
  await page.mouse.move(0, 0);
  await scrollToSection(hobbySection);
  await captureScreenshot(page, `${artifactsDir}/hobby-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(hobbySection);
  await expectImagesReady(hobbySection);

  const mapViewport = hobbySection.getByRole("group", { name: "Интерактивная карта хобби" });
  await expect.poll(() => mapViewport.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  const tabs = hobbySection.getByLabel("Выберите хобби");
  const fishingTab = tabs.getByRole("button", { name: "Рыбалка" });
  const travelTab = tabs.getByRole("button", { name: "Путешествия" });
  await expect(fishingTab).toHaveAttribute("aria-pressed", "false");
  await fishingTab.click();
  await expect(fishingTab).toHaveAttribute("aria-pressed", "true");
  await expect(hobbySection.locator("#hobby-mobile-description")).toContainText("Рыбалка");
  await expect(hobbySection.locator("#hobby-mobile-description")).toContainText(
    "Здесь появится короткое описание хобби.",
  );
  await travelTab.click();
  await expect(travelTab).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => mapViewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const visiblePanel = hobbySection.locator("#hobby-mobile-description");
  await expect(visiblePanel).toBeVisible();
  await expect
    .poll(async () => {
      const box = await visiblePanel.boundingBox();
      return box !== null && box.x >= 0 && box.x + box.width <= 390;
    })
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/hobby-mobile.png`);
  await visiblePanel.scrollIntoViewIfNeeded();
  await captureScreenshot(page, `${artifactsDir}/hobby-mobile-panel.png`);
});
