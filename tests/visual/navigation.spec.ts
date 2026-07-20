import { expect, test } from "@playwright/test";

import {
  artifactsDir,
  captureScreenshot,
} from "./helpers";
test("mobile navigation exposes section anchors and closes predictably", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Навигация по странице" });
  const toggle = navigation.getByRole("button", { name: /Меню/ });
  await expect(navigation).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await captureScreenshot(page, `${artifactsDir}/navigation-mobile-open.png`);
  const skillsLink = navigation.getByRole("link", { name: /Навыки/ });
  await expect(skillsLink).toHaveAttribute("href", "#skills");
  await skillsLink.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#skills$/);

  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  for (const id of ["top", "about", "skills", "projects", "hobby", "contacts"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await expect(navigation).toBeVisible();
  await expect(navigation).toHaveCSS("position", "fixed");
  await expect(toggle).toBeHidden();
  await expect(navigation.getByRole("link")).toHaveCount(7);

  const projectsLink = navigation.getByRole("link", { name: "Проекты", exact: true });
  await projectsLink.click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(projectsLink).toHaveAttribute("aria-current", "location");
  await expect
    .poll(async () => {
      const navigationBox = await navigation.boundingBox();
      const headingBox = await page
        .getByRole("heading", { name: "Проекты, которыми я особенно горжусь" })
        .boundingBox();
      return navigationBox !== null && headingBox !== null && headingBox.y > navigationBox.y + navigationBox.height;
    })
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/navigation-desktop.png`);
});
