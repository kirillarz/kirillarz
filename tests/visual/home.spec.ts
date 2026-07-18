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

test("about section switches inline highlights and respects interaction pauses", async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const aboutTitle = page.getByRole("heading", { name: "Мне тесно в рамках одной роли" });
  await aboutTitle.scrollIntoViewIfNeeded();
  await expect(aboutTitle).toBeVisible();

  const aboutSection = page.getByRole("region", { name: "Мне тесно в рамках одной роли" });
  const taskAndProduct = aboutSection.getByRole("button", { name: "понять задачу и продукт" });
  const workPlan = aboutSection.getByRole("button", { name: "выстроить план работы" });
  const requirements = aboutSection.getByRole("button", { name: "разобрать требования" });
  const development = aboutSection.getByRole("button", { name: "погрузиться в разработку" });
  const communication = aboutSection.getByRole("button", { name: "переговоры и коммуникацию" });
  const teamwork = aboutSection.getByRole("button", { name: "организовать командную работу" });
  const events = aboutSection.getByRole("button", { name: "вести мероприятия" });
  const platoonLeadership = aboutSection.getByRole("button", { name: "старшиной взвода" });

  await expect(aboutSection.getByRole("button")).toHaveCount(8);
  await expect(aboutSection.getByRole("tab")).toHaveCount(0);
  await expect(aboutSection.getByText("01 / 04")).toHaveCount(0);
  await expect(
    aboutSection.locator("p").filter({
      hasText: "Мне нравится собирать проекты так, чтобы каждая деталь работала на общий результат",
    }),
  ).toHaveCount(1);
  await expect(
    aboutSection.locator("p").filter({
      hasText: "А фундаментом для дисциплины, ответственности и лидерства стало кадетское прошлое",
    }),
  ).toHaveCount(1);

  await expect(taskAndProduct).toHaveAttribute("aria-pressed", "true");
  await expect(aboutSection.getByRole("img", { name: /продуктового менеджера/ })).toBeVisible();

  await workPlan.hover();
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");
  await expect(aboutSection.getByRole("img", { name: /проектного менеджера/ })).toBeVisible();

  await requirements.focus();
  await expect(requirements).toBeFocused();
  await expect(requirements).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(5_200);
  await expect(requirements).toHaveAttribute("aria-pressed", "true");

  await requirements.evaluate((element: HTMLElement) => element.blur());
  await page.mouse.move(0, 0);
  await expect(development).toHaveAttribute("aria-pressed", "false");
  await page.clock.fastForward(5_200);
  await expect(development).toHaveAttribute("aria-pressed", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await workPlan.click();
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await page.clock.fastForward(5_200);
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");

  const imageCases = [
    { button: taskAndProduct, imageName: /продуктового менеджера/ },
    { button: workPlan, imageName: /проектного менеджера/ },
    { button: requirements, imageName: /бизнес-аналитика/ },
    { button: development, imageName: /образе разработчика/ },
    { button: communication, imageName: /образе переговорщика/ },
    { button: teamwork, imageName: /организатора команды/ },
    { button: events, imageName: /ведущего мероприятий/ },
    { button: platoonLeadership, imageName: /кадетской форме/ },
  ];

  for (const { button, imageName } of imageCases) {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const image = aboutSection.getByRole("img", { name: imageName });
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  }

  await expect(aboutSection.locator("img")).toHaveCount(1);
  await expect(aboutSection.getByText(/скоро появится/)).toHaveCount(0);

  await page.goto("/");
  await scrollToSection(aboutSection);
  await taskAndProduct.click();
  await expectImagesReady(aboutSection);
  await captureScreenshot(page, `${artifactsDir}/about-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(aboutSection);
  await workPlan.click();
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");
  await expect(aboutSection.getByRole("group", { name: /выстроить план работы/ })).toHaveCSS("position", "sticky");
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
  await expect(firstProject.getByText("01 / 06", { exact: true })).toBeVisible();

  await firstProject.getByRole("button", { name: /Следующий слайд/ }).click();
  await expect(firstProject.getByText("02 / 06", { exact: true })).toBeVisible();
  await expect(firstProject.getByRole("img", { name: /Результаты поиска помещений/ })).toBeVisible();

  await carousel.focus();
  await carousel.press("ArrowRight");
  await expect(firstProject.getByText("03 / 06", { exact: true })).toBeVisible();

  await firstProject.getByRole("button", { name: /Показать слайд 6: Видео-демо/ }).click();
  await expect(firstProject.getByText("06 / 06", { exact: true })).toBeVisible();
  const aiDemo = firstProject.locator("video");
  await expect(aiDemo).toHaveAttribute("controls", "");
  await expect(aiDemo).toHaveAttribute("preload", "metadata");
  await expect(aiDemo).toHaveAttribute("playsinline", "");
  await expect(aiDemo).not.toHaveAttribute("autoplay", "");

  await expect(firstProject.getByRole("link", { name: "Открыть репозиторий" })).toHaveAttribute(
    "href",
    "https://gitverse.ru/name-later-urfu/monorepo",
  );
  const botNetSchoolProject = projectsSection.getByRole("article").nth(1);
  await expect(botNetSchoolProject.getByRole("link", { name: "Открыть репозиторий" })).toHaveAttribute(
    "href",
    "https://github.com/kirillarz/BotNetSchool",
  );
  const pmProject = projectsSection.getByRole("article").nth(2);
  await expect(pmProject.getByRole("link", { name: "Открыть репозиторий" })).toHaveAttribute(
    "href",
    "https://github.com/kirillarz/PM-sumulator",
  );
  await expect(projectsSection.getByRole("link", { name: /Смотреть (демо|видео)/ })).toHaveCount(0);
  await expect(projectsSection.locator('[aria-disabled="true"]')).toHaveCount(0);

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
