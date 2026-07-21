import {
  artifactsDir,
  scrollToSection,
  expectImagesReady,
  captureScreenshot,
  expect,
  test,
} from "./helpers";
test("skills section renders its groups without viewport overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const skillsSection = page.getByRole("region", { name: /Навыки, которые помогают/ });
  await scrollToSection(skillsSection);
  await expectImagesReady(skillsSection);
  await expect(skillsSection.getByRole("article")).toHaveCount(3);
  await expect(skillsSection.getByRole("heading", { name: "Разработка" })).toBeVisible();
  await expect(skillsSection.getByRole("heading", { name: "Продукт и управление" })).toBeVisible();
  await expect(skillsSection.getByRole("heading", { name: "Коммуникация" })).toBeVisible();
  expect(await skillsSection.locator("#development-skills").getAttribute("aria-hidden")).toBeNull();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/skills-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(skillsSection);
  await expectImagesReady(skillsSection);
  await expect(skillsSection.getByRole("article")).toHaveCount(3);
  const developmentToggle = skillsSection.getByRole("button", { name: /^Разработка/ });
  const managementToggle = skillsSection.getByRole("button", { name: /^Продукт и управление/ });
  const developmentPanel = skillsSection.locator("#development-skills");
  const managementPanel = skillsSection.locator("#product-management-skills");
  await expect(developmentToggle).toHaveAttribute("aria-expanded", "true");
  await expect(managementToggle).toHaveAttribute("aria-expanded", "false");
  await expect(developmentPanel).toHaveAttribute("aria-hidden", "false");
  await expect(managementPanel).toHaveAttribute("aria-hidden", "true");
  await expect(developmentPanel).toBeVisible();
  await expect(managementPanel).toBeHidden();

  const animatedPanelStyles = await developmentPanel.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      animationDuration: style.animationDuration,
      animationName: style.animationName,
      transitionProperty: style.transitionProperty,
      tapHighlight: window
        .getComputedStyle(element.previousElementSibling as Element)
        .getPropertyValue("-webkit-tap-highlight-color"),
    };
  });
  expect(animatedPanelStyles.transitionProperty).not.toContain("grid-template-rows");
  expect(animatedPanelStyles.animationName).toContain("skillPanelReveal");
  expect(animatedPanelStyles.animationDuration).toBe("0.3s");
  expect(animatedPanelStyles.tapHighlight).toBe("rgba(0, 0, 0, 0)");

  await managementToggle.click();
  const movingCardCount = await skillsSection
    .getByRole("article")
    .evaluateAll((articles) => articles.filter((article) => article.getAnimations().length > 0).length);
  expect(movingCardCount).toBeGreaterThan(0);
  await expect(developmentToggle).toHaveAttribute("aria-expanded", "false");
  await expect(managementToggle).toHaveAttribute("aria-expanded", "true");
  await expect(developmentPanel).toHaveAttribute("aria-hidden", "true");
  await expect(managementPanel).toHaveAttribute("aria-hidden", "false");
  await expect(developmentPanel).toBeHidden();
  await expect(managementPanel).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/skills-mobile.png`);

  const communicationToggle = skillsSection.getByRole("button", { name: /^Коммуникация/ });
  await communicationToggle.click();
  await developmentToggle.click();
  await expect(developmentToggle).toHaveAttribute("aria-expanded", "true");
  await expect(managementToggle).toHaveAttribute("aria-expanded", "false");
  await expect(communicationToggle).toHaveAttribute("aria-expanded", "false");
  await developmentToggle.click();
  await expect(developmentToggle).toHaveAttribute("aria-expanded", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await scrollToSection(skillsSection);
  await expect(developmentPanel).toBeVisible();
  await expect(developmentPanel).toHaveCSS("animation-duration", "0s");
  await expect(developmentPanel.locator("ul")).toHaveCSS("transition-duration", "0s");
  const reducedMotionIconDuration = await developmentToggle
    .locator("span")
    .nth(1)
    .evaluate((element) => window.getComputedStyle(element, "::after").transitionDuration);
  expect(reducedMotionIconDuration).toBe("0s");
});
