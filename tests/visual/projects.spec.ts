import { expect, test } from "@playwright/test";

import {
  artifactsDir,
  scrollToSection,
  expectImagesReady,
  preparePausedVideoScreenshot,
  expectLightboxGeometry,
  captureScreenshot,
} from "./helpers";
test("projects section renders confirmed media and working actions", async ({ page }) => {
  test.setTimeout(30_000);
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

  const imageTrigger = firstProject.getByRole("button", { name: /Открыть на весь экран: Экран входа/ });
  await imageTrigger.click();
  const lightbox = page.getByRole("dialog", { name: /Полноэкранный просмотр проекта/ });
  await expect(lightbox).toBeVisible();
  await expect(lightbox.getByRole("img", { name: /Экран входа/ })).toBeVisible();
  await expect(lightbox.getByText("1 / 6", { exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.getByRole("img", { name: /Результаты поиска помещений/ })).toBeVisible();
  await expect(lightbox.getByText("2 / 6", { exact: true })).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/projects-lightbox-desktop.png`);

  for (const count of ["3 / 6", "4 / 6", "5 / 6", "6 / 6"]) {
    await page.keyboard.press("ArrowRight");
    await expect(lightbox.getByText(count, { exact: true })).toBeVisible();
  }
  const traversedModalVideo = lightbox.locator("video");
  await expect(traversedModalVideo).toBeVisible();
  await expect(traversedModalVideo).toHaveAttribute("controls", "");
  await expect(traversedModalVideo).toHaveAttribute("playsinline", "");
  await expect(traversedModalVideo).toHaveAttribute("preload", "metadata");
  await expect(traversedModalVideo).not.toHaveAttribute("autoplay", "");
  await preparePausedVideoScreenshot(traversedModalVideo);
  await expect(lightbox.getByText("Видео", { exact: true })).toBeVisible();
  await expect(lightbox.getByRole("button", { name: /Воспроизвести: Видео-демо AI-агента/ })).toBeVisible();
  await expectLightboxGeometry(page, lightbox, traversedModalVideo);
  await traversedModalVideo.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(lightbox.getByText("6 / 6", { exact: true })).toBeVisible();
  await lightbox.getByRole("button", { name: "Закрыть полноэкранный просмотр" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(lightbox.getByText("5 / 6", { exact: true })).toBeVisible();
  await expect(traversedModalVideo).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(lightbox).toHaveCount(0);
  await expect(imageTrigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

  await imageTrigger.click();
  await lightbox.locator("..").click({ position: { x: 4, y: 4 } });
  await expect(lightbox).toHaveCount(0);

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
  await expect(aiDemo).toHaveAttribute("preload", "none");
  await expect(aiDemo).toHaveAttribute("playsinline", "");
  await expect(aiDemo).not.toHaveAttribute("autoplay", "");
  const videoTrigger = firstProject.getByRole("button", { name: /Открыть на весь экран: Видео-демо/ });
  await videoTrigger.focus();
  await expect(videoTrigger).toHaveCSS("opacity", "1");
  await aiDemo.evaluate(async (element: HTMLVideoElement) => {
    element.muted = true;
    await element.play();
  });
  await expect.poll(() => aiDemo.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await expect.poll(() => aiDemo.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await videoTrigger.click();
  await expect(aiDemo).toHaveJSProperty("paused", true);
  await expect.poll(() => aiDemo.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);

  const directVideoLightbox = page.getByRole("dialog", { name: /Полноэкранный просмотр проекта/ });
  const directModalVideo = directVideoLightbox.locator("video");
  await expect(directVideoLightbox.getByText("6 / 6", { exact: true })).toBeVisible();
  await expect(directModalVideo).toHaveAttribute("controls", "");
  await expect(directModalVideo).toHaveAttribute("playsinline", "");
  await expect(directModalVideo).toHaveAttribute("preload", "metadata");
  await expect(directModalVideo).not.toHaveAttribute("autoplay", "");
  await preparePausedVideoScreenshot(directModalVideo);
  await expect.poll(() => directModalVideo.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeLessThan(0.05);
  await expect(directVideoLightbox.getByText("Видео", { exact: true })).toBeVisible();
  const directPlayButton = directVideoLightbox.getByRole("button", {
    name: /Воспроизвести: Видео-демо AI-агента/,
  });
  await expect(directPlayButton).toBeVisible();
  await expectLightboxGeometry(page, directVideoLightbox, directModalVideo);
  await captureScreenshot(page, `${artifactsDir}/projects-lightbox-video-desktop.png`);
  await directPlayButton.click();
  await expect.poll(() => directModalVideo.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await expect.poll(() => directModalVideo.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  await expect(directModalVideo).toBeFocused();
  await expect(directPlayButton).toHaveCount(0);
  await directModalVideo.evaluate((element: HTMLVideoElement) => element.pause());
  await expect(directPlayButton).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(directVideoLightbox).toHaveCount(0);
  await expect(videoTrigger).toBeFocused();

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
  await expect(pmVideo).toHaveAttribute("preload", "none");
  await expect(pmVideo).toHaveAttribute("playsinline", "");
  await expect(pmVideo).not.toHaveAttribute("autoplay", "");
  const pmVideoTrigger = pmProject.getByRole("button", { name: /Открыть на весь экран: Игровая сцена/ });
  await pmProject.locator("video").hover();
  await expect(pmVideoTrigger).toHaveCSS("opacity", "1");
  await pmVideoTrigger.click();
  const pmLightbox = page.getByRole("dialog", { name: /Полноэкранный просмотр проекта «PM Simulator»/ });
  const pmModalVideo = pmLightbox.locator("video");
  await expect(pmModalVideo).toBeVisible();
  await preparePausedVideoScreenshot(pmModalVideo);
  await expect(pmLightbox.getByText("Видео", { exact: true })).toBeVisible();
  const pmPlayButton = pmLightbox.getByRole("button", { name: /Воспроизвести: Игровая сцена PM Simulator/ });
  await expect(pmPlayButton).toBeVisible();
  await expectLightboxGeometry(page, pmLightbox, pmModalVideo);
  await expect(pmLightbox.getByRole("button", { name: /медиа проекта/ })).toHaveCount(0);
  await expect(pmLightbox.getByText(/ \//)).toHaveCount(0);
  await captureScreenshot(page, `${artifactsDir}/projects-lightbox-pm-simulator-desktop.png`);
  await expect(pmLightbox.getByRole("button", { name: "Закрыть полноэкранный просмотр" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(pmPlayButton).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(pmLightbox.getByRole("button", { name: "Закрыть полноэкранный просмотр" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(pmLightbox).toHaveCount(0);
  await expect(pmVideoTrigger).toBeFocused();
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
  await expect(pmVideo).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/projects-pm-simulator-desktop.png`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollToSection(projectsSection);
  await expectImagesReady(firstProject);
  await expect(projectsSection.getByRole("article")).toHaveCount(3);
  const mobileFirstProject = projectsSection.getByRole("article").first();
  const mobileProjectTitle = mobileFirstProject.getByRole("heading", { name: "AI-агент для подбора помещений" });
  const mobileCarousel = mobileFirstProject.getByRole("group", { name: /Материалы проекта/ });
  await expect
    .poll(async () => {
      const titleBox = await mobileProjectTitle.boundingBox();
      const carouselBox = await mobileCarousel.boundingBox();
      return titleBox !== null && carouselBox !== null && titleBox.y < carouselBox.y;
    })
    .toBe(true);
  for (const arrow of await mobileFirstProject.getByRole("button", { name: /слайд проекта/ }).all()) {
    const box = await arrow.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  const mobileImageTrigger = mobileFirstProject.getByRole("button", { name: /Открыть на весь экран/ });
  await mobileImageTrigger.click();
  await expect(page.getByRole("dialog", { name: /Полноэкранный просмотр проекта/ })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/projects-lightbox-mobile.png`);
  await page.getByRole("button", { name: "Закрыть полноэкранный просмотр" }).click();
  await captureScreenshot(page, `${artifactsDir}/projects-mobile.png`);
});

test("project video lightboxes stay usable in a real touch context", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.route("**/hero-minifigure-animate-clean.webm", (route) => route.abort());

  try {
    await page.goto("/");
    expect(await page.evaluate(() => matchMedia("(hover: none)").matches)).toBe(true);

    const projectsSection = page.getByRole("region", { name: /Проекты, которыми я особенно горжусь/ });
    await scrollToSection(projectsSection);
    const firstProject = projectsSection.getByRole("article").first();
    await firstProject.getByRole("button", { name: /Показать слайд 6: Видео-демо/ }).click();
    const aiVideoTrigger = firstProject.getByRole("button", {
      name: /Открыть на весь экран: Видео-демо/,
    });
    await expect(aiVideoTrigger).toBeVisible();
    await expect(aiVideoTrigger).toHaveCSS("opacity", "1");
    await expect(aiVideoTrigger).not.toBeFocused();
    await aiVideoTrigger.tap();

    const aiLightbox = page.getByRole("dialog", { name: /Полноэкранный просмотр проекта «AI-агент/ });
    const aiModalVideo = aiLightbox.locator("video");
    const aiPlayButton = aiLightbox.getByRole("button", { name: /Воспроизвести: Видео-демо AI-агента/ });
    await preparePausedVideoScreenshot(aiModalVideo);
    await expect(aiLightbox.getByText("Видео", { exact: true })).toBeVisible();
    await expect(aiPlayButton).toBeVisible();
    await expectLightboxGeometry(page, aiLightbox, aiModalVideo);
    await captureScreenshot(page, `${artifactsDir}/projects-lightbox-video-mobile.png`);
    await aiLightbox.getByRole("button", { name: "Закрыть полноэкранный просмотр" }).tap();

    const pmProject = projectsSection.getByRole("article").nth(2);
    await scrollToSection(pmProject);
    const pmVideoTrigger = pmProject.getByRole("button", { name: /Открыть на весь экран: Игровая сцена/ });
    await expect(pmVideoTrigger).toBeVisible();
    await expect(pmVideoTrigger).toHaveCSS("opacity", "1");
    await expect(pmVideoTrigger).not.toBeFocused();
    await pmVideoTrigger.tap();

    const pmLightbox = page.getByRole("dialog", { name: /Полноэкранный просмотр проекта «PM Simulator»/ });
    const pmModalVideo = pmLightbox.locator("video");
    await preparePausedVideoScreenshot(pmModalVideo);
    await expect(pmLightbox.getByText("Видео", { exact: true })).toBeVisible();
    await expect(pmLightbox.getByRole("button", { name: /Воспроизвести: Игровая сцена PM Simulator/ })).toBeVisible();
    await expect(pmLightbox.getByRole("button", { name: /медиа проекта/ })).toHaveCount(0);
    await expectLightboxGeometry(page, pmLightbox, pmModalVideo);
    await captureScreenshot(page, `${artifactsDir}/projects-lightbox-pm-simulator-mobile.png`);
  } finally {
    await context.close();
  }
});
