import { mkdir } from "node:fs/promises";

import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactsDir = "artifacts/visual-smoke";

test.beforeAll(async () => {
  await mkdir(artifactsDir, { recursive: true });
});

async function scrollToSection(section: Locator) {
  await section.evaluate((element) => {
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "auto" });
  });

  await expect
    .poll(() => section.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThanOrEqual(2);
}

async function expectImagesReady(scope: Locator) {
  await expect
    .poll(() =>
      scope.locator("img").evaluateAll((images: HTMLImageElement[]) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
}

async function expectVideoMetadataReady(video: Locator) {
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 1)).toBe(true);
}

async function captureScreenshot(page: Page, path: string, fullPage = false) {
  await page.screenshot({
    path,
    fullPage,
    animations: "disabled",
  });
}

test("home renders on desktop and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://kirillarz.ru/");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/favicon.svg");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://kirillarz.ru/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://kirillarz.ru/og/kirill-arzamastsev.jpg",
  );
  await expectImagesReady(page.locator("section").first());
  await captureScreenshot(page, `${artifactsDir}/home-desktop-reference-viewport.png`);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expectImagesReady(page.locator("section").first());
  await captureScreenshot(page, `${artifactsDir}/home-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /Узнать обо мне/ })).toHaveAttribute("href", "#about");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await expectImagesReady(page.locator("section").first());
  await captureScreenshot(page, `${artifactsDir}/home-mobile.png`);
});

test("about section switches roles and supports keyboard navigation", async ({ page }) => {
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
  await expect(page.getByRole("img", { name: /фигурка Кирилла с планшетом/ })).toBeVisible();
  await expect(page.getByText("04 / 04")).toBeVisible();

  await page.goto("/");
  const aboutSection = page.getByRole("region", { name: /Создаю продукты/ });
  await scrollToSection(aboutSection);
  await expectImagesReady(aboutSection);
  await captureScreenshot(page, `${artifactsDir}/about-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(aboutSection);
  await expectImagesReady(aboutSection);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/about-mobile.png`);
});

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
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/skills-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(skillsSection);
  await expectImagesReady(skillsSection);
  await expect(skillsSection.getByRole("article")).toHaveCount(3);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/skills-mobile.png`);
});

test("projects section renders confirmed media and working actions", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const projectsSection = page.getByRole("region", { name: /Проекты, которыми я особенно горжусь/ });
  await scrollToSection(projectsSection);
  await expect(projectsSection.getByRole("article")).toHaveCount(3);
  await expect(projectsSection.getByRole("heading", { name: "AI-агент для подбора помещений" })).toBeVisible();
  await expect(projectsSection.getByRole("heading", { name: "BotNetSchool" })).toBeVisible();
  await expect(projectsSection.getByRole("heading", { name: "PM Simulator" })).toBeVisible();

  const firstProject = projectsSection.getByRole("article").first();
  const carousel = firstProject.getByRole("group", { name: /Материалы проекта/ });
  const screenshot = firstProject.getByRole("img", { name: /Экран входа/ });
  await expect(screenshot).toBeVisible();
  await expect.poll(() => screenshot.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(firstProject.getByText("01 / 05", { exact: true })).toBeVisible();

  await firstProject.getByRole("button", { name: /Следующий слайд/ }).click();
  await expect(firstProject.getByText("02 / 05", { exact: true })).toBeVisible();
  await expect(firstProject.getByRole("img", { name: /Результаты поиска помещений/ })).toBeVisible();

  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(firstProject.getByText("03 / 05", { exact: true })).toBeVisible();

  await expect(firstProject.getByRole("link", { name: /Открыть GitVerse/ })).toHaveAttribute(
    "href",
    "https://gitverse.ru/name-later-urfu/monorepo",
  );
  await expect(projectsSection.locator('[aria-disabled="true"]')).toHaveCount(0);

  const pmProject = projectsSection.getByRole("article").nth(2);
  const pmVideo = pmProject.locator("video");
  await expect(pmVideo).toHaveCount(1);
  await expect(pmVideo).toHaveAttribute("controls", "");
  await expect(pmVideo).toHaveAttribute("preload", "metadata");
  await expect(pmVideo).toHaveAttribute("playsinline", "");
  await expect(pmVideo).not.toHaveAttribute("autoplay", "");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await carousel.evaluate((element: HTMLElement) => element.blur());
  await scrollToSection(projectsSection);
  await expectImagesReady(firstProject);
  await page.mouse.move(0, 0);
  await captureScreenshot(page, `${artifactsDir}/projects-desktop.png`);

  const botNetSchoolProject = projectsSection.getByRole("article").nth(1);
  await scrollToSection(botNetSchoolProject);
  await expectImagesReady(botNetSchoolProject);
  await captureScreenshot(page, `${artifactsDir}/projects-botnetschool-desktop.png`);

  await scrollToSection(pmProject);
  await expectVideoMetadataReady(pmVideo);
  await captureScreenshot(page, `${artifactsDir}/projects-pm-simulator-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(projectsSection);
  await expectImagesReady(firstProject);
  await expect(projectsSection.getByRole("article")).toHaveCount(3);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/projects-mobile.png`);
});

test("contacts and employer page contain only confirmed public contact actions", async ({ page }) => {
  await page.goto("/");
  const contacts = page.getByRole("region", { name: "Будем на связи" });
  await contacts.scrollIntoViewIfNeeded();
  await expect(contacts.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/kirillarz");
  await expect(contacts.getByRole("link", { name: /Telegram/ })).toHaveAttribute("href", "https://t.me/kirillarz");
  await expect(page.getByText(/Скачать резюме/i)).toHaveCount(0);

  await page.goto("/employer");
  await expect(page.getByRole("heading", { name: "Кирилл Арзамасцев" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ключевые проекты" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/kirillarz");
  await expect(page.getByText(/Скачать резюме/i)).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/employer-desktop.png`, true);
});
