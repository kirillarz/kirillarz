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

test("about section switches roles and supports keyboard navigation", async ({ page }) => {
  await mkdir("artifacts", { recursive: true });
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const aboutTitle = page.getByRole("heading", { name: /Создаю продукты/ });
  await aboutTitle.scrollIntoViewIfNeeded();
  await expect(aboutTitle).toBeVisible();

  const productTab = page.getByRole("tab", { name: "Product Manager" });
  const projectTab = page.getByRole("tab", { name: "Project Manager" });
  const backendTab = page.getByRole("tab", { name: "Backend Developer" });
  const analystTab = page.getByRole("tab", { name: "Business Analyst" });

  await expect(productTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Ближе всего мне product management");
  await expect(page.getByText("01 / 04")).toBeVisible();

  await projectTab.click();
  await expect(projectTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("команды из шести человек");
  await expect(page.getByText("02 / 04")).toBeVisible();

  await projectTab.press("ArrowRight");
  await expect(backendTab).toBeFocused();
  await expect(backendTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Python, FastAPI, SQL");

  await backendTab.press("End");
  await expect(analystTab).toBeFocused();
  await expect(analystTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("аналитика требований и BPMN");
  await expect(page.getByRole("img", { name: /Business Analyst/ })).toBeVisible();
  await expect(page.getByText("04 / 04")).toBeVisible();

  await page.goto("/");
  const aboutSection = page.getByRole("region", { name: /Создаю продукты/ });
  await aboutSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "artifacts/about-desktop.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await aboutSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.waitForTimeout(400);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: "artifacts/about-mobile.png", fullPage: false });
});

test("skills section renders its groups without viewport overflow", async ({ page }) => {
  await mkdir("artifacts", { recursive: true });
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const skillsSection = page.getByRole("region", { name: /Навыки, которые помогают/ });
  await skillsSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await expect(skillsSection.getByRole("article")).toHaveCount(3);
  await expect(skillsSection.getByRole("heading", { name: "Разработка" })).toBeVisible();
  await expect(skillsSection.getByRole("heading", { name: "Продукт и управление" })).toBeVisible();
  await expect(skillsSection.getByRole("heading", { name: "Коммуникация" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: "artifacts/skills-desktop.png", fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await skillsSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await expect(skillsSection.getByRole("article")).toHaveCount(3);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: "artifacts/skills-mobile.png", fullPage: false });
});

test("projects section renders carousels and inactive future links", async ({ page }) => {
  await mkdir("artifacts", { recursive: true });
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const projectsSection = page.getByRole("region", { name: /Проекты, которыми я особенно горжусь/ });
  await projectsSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await expect(projectsSection.getByRole("article")).toHaveCount(3);
  await expect(projectsSection.getByRole("heading", { name: "AI-агент для подбора помещений" })).toBeVisible();
  await expect(projectsSection.getByRole("heading", { name: "BotNetSchool" })).toBeVisible();
  await expect(projectsSection.getByRole("heading", { name: "PM Simulator" })).toBeVisible();

  const firstProject = projectsSection.getByRole("article").first();
  const carousel = firstProject.getByRole("group", { name: /Материалы проекта/ });
  const screenshot = firstProject.getByRole("img", { name: /Экран входа/ });
  await expect(screenshot).toBeVisible();
  await expect.poll(() => screenshot.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(firstProject.getByText("01 / 03", { exact: true })).toBeVisible();

  await firstProject.getByRole("button", { name: /Следующий слайд/ }).click();
  await expect(firstProject.getByText("02 / 03", { exact: true })).toBeVisible();
  await expect(firstProject.getByRole("img", { name: /Экран поиска и карты/ })).toBeVisible();

  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(firstProject.getByText("03 / 03", { exact: true })).toBeVisible();
  await carousel.press("ArrowRight");
  await expect(firstProject.getByText("01 / 03", { exact: true })).toBeVisible();

  const inactiveActions = projectsSection.locator('[aria-disabled="true"]');
  await expect(inactiveActions).toHaveCount(7);
  await expect.poll(() => inactiveActions.evaluateAll((elements) => elements.every((element) => !element.hasAttribute("href")))).toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await carousel.evaluate((element: HTMLElement) => element.blur());
  await projectsSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await page.mouse.move(0, 0);
  await page.screenshot({ path: "artifacts/projects-desktop.png", fullPage: false });
  await projectsSection.getByRole("article").nth(1).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/projects-botnetschool-desktop.png", fullPage: false });
  await projectsSection.getByRole("article").nth(2).scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/projects-pm-simulator-desktop.png", fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await projectsSection.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await expect(projectsSection.getByRole("article")).toHaveCount(3);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: "artifacts/projects-mobile.png", fullPage: false });
});
