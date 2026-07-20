import { expect, test } from "@playwright/test";

import {
  artifactsDir,
  scrollToSection,
  expectImagesReady,
  expectVideoMetadataReady,
  captureScreenshot,
} from "./helpers";
test("home renders on desktop and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /Узнать обо мне/ })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://kirillarz.ru/");
  await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute("href", "/favicon.png");
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
  await expect(page.getByRole("link", { name: /Узнать обо мне/ })).toBeVisible();
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

  const mobileCta = page.getByRole("link", { name: /Узнать обо мне/ });
  await expect
    .poll(async () => {
      const box = await mobileCta.boundingBox();
      return box !== null && box.y >= 0 && box.y + box.height <= 844;
    })
    .toBe(true);

  for (const viewport of [
    { width: 320, height: 568, name: "compact" },
    { width: 430, height: 932, name: "large" },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(mobileCta).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
    await captureScreenshot(page, `${artifactsDir}/home-mobile-${viewport.name}.png`);
  }
});

test("hero CTA plays the figure animation and reveals the about section through a white flash", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const cta = page.getByRole("link", { name: /Узнать обо мне/ });
  const image = page.getByAltText("Стилизованная конструкторная минифигурка Кирилла в костюме");
  const video = page.getByTestId("hero-animation");
  const overlay = page.getByTestId("hero-flash-overlay");
  const aboutSection = page.getByRole("region", { name: "Мне тесно в рамках одной роли" });

  await expect(video).toHaveAttribute("preload", "auto");
  await expectVideoMetadataReady(video);
  await expect(video).toHaveJSProperty("paused", true);
  await expect(overlay).toHaveAttribute("data-transition-phase", "idle");

  await cta.click();
  await expect(overlay).toHaveAttribute("data-transition-phase", "playing");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await expect(video).toHaveCSS("opacity", "1");
  await expect(image).toHaveCSS("opacity", "0");
  await expect(page.getByRole("heading", { name: "Кирилл Арзамасцев" })).toBeVisible();
  await expect(cta).toHaveAttribute("aria-disabled", "true");

  await video.evaluate(async (element: HTMLVideoElement) => {
    element.currentTime = 2.5;
    await new Promise<void>((resolve) => element.addEventListener("seeked", () => resolve(), { once: true }));
    element.pause();
  });
  await captureScreenshot(page, `${artifactsDir}/hero-animation-midpoint.png`);

  const coveringStylesPromise = overlay.evaluate(
    (element) =>
      new Promise<{ backgroundColor: string; duration: string; zIndex: string }>((resolve) => {
        const captureCoveringStyles = () => {
          if ((element as HTMLElement).dataset.transitionPhase !== "covering") return false;

          const styles = window.getComputedStyle(element);
          observer.disconnect();
          resolve({
            backgroundColor: styles.backgroundColor,
            duration: styles.transitionDuration,
            zIndex: styles.zIndex,
          });
          return true;
        };

        const observer = new MutationObserver(captureCoveringStyles);
        if (!captureCoveringStyles()) {
          observer.observe(element, { attributes: true, attributeFilter: ["data-transition-phase"] });
        }
      }),
  );

  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 4.01;
  });

  await expect(coveringStylesPromise).resolves.toEqual({
    backgroundColor: "rgb(255, 255, 255)",
    duration: "0.22s",
    zIndex: "1000",
  });
  await expect(page).toHaveURL(/#about$/);
  await expect
    .poll(() => aboutSection.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThanOrEqual(2);
  await expect(overlay).toHaveAttribute("data-transition-phase", "idle");
  await expect(video).toHaveJSProperty("paused", true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeLessThan(0.1);
  await captureScreenshot(page, `${artifactsDir}/hero-animation-about-revealed.png`);

  await scrollToSection(page.locator("#top"));
  await cta.click();
  await expect(overlay).toHaveAttribute("data-transition-phase", "playing");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeLessThan(0.5);
});

test("hero CTA skips video and flash when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const video = page.getByTestId("hero-animation");
  const overlay = page.getByTestId("hero-flash-overlay");
  const aboutSection = page.getByRole("region", { name: "Мне тесно в рамках одной роли" });

  await page.getByRole("link", { name: /Узнать обо мне/ }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(overlay).toHaveAttribute("data-transition-phase", "idle");
  await expect(overlay).toHaveCSS("display", "none");
  await expect(video).toHaveJSProperty("paused", true);
  await expect
    .poll(() => aboutSection.evaluate((element) => Math.abs(element.getBoundingClientRect().top)))
    .toBeLessThanOrEqual(80);
});

test("hero CTA falls back to anchor navigation when the animation cannot load", async ({ page }) => {
  await page.route("**/hero-minifigure-animate-clean.webm", (route) => route.abort());
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const video = page.getByTestId("hero-animation");
  const overlay = page.getByTestId("hero-flash-overlay");
  const aboutSection = page.getByRole("region", { name: "Мне тесно в рамках одной роли" });

  await page.getByRole("link", { name: /Узнать обо мне/ }).click();

  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.error !== null)).toBe(true);
  await expect(page).toHaveURL(/#about$/);
  await expect(overlay).toHaveAttribute("data-transition-phase", "idle");
  await expect
    .poll(() => aboutSection.evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(72);
  await expect
    .poll(() => aboutSection.evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(94);
});

test("hero role marquee loops continuously and respects reduced motion", async ({ page }) => {
  const roles = [
    "Product Manager",
    "Project Manager",
    "Backend Developer",
    "Business Analyst",
    "AI Product Builder",
    "Team Coordinator",
  ];

  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const marquee = page.getByTestId("hero-role-marquee");
  const track = page.getByTestId("hero-role-track");
  const primaryGroup = marquee.locator('[data-role-group="primary"]');
  const duplicateGroup = marquee.locator('[data-role-group="duplicate"]');

  await expect(marquee.locator("[data-role-group]")).toHaveCount(2);
  for (const role of roles) {
    await expect(primaryGroup.getByText(role, { exact: true })).toHaveCount(1);
    await expect(duplicateGroup.getByText(role, { exact: true })).toHaveCount(1);
  }

  await expect(track).toHaveCSS("animation-duration", "30s");
  await expect(track).toHaveCSS("animation-timing-function", "linear");
  await expect(track).toHaveCSS("animation-iteration-count", "infinite");
  await expect(track).toHaveCSS("animation-direction", "normal");
  for (const group of [primaryGroup, duplicateGroup]) {
    const separatorStyles = await group
      .locator("span")
      .last()
      .evaluate((element) => {
        const styles = window.getComputedStyle(element, "::after");
        return { display: styles.display, height: styles.height, width: styles.width };
      });
    expect(separatorStyles).toEqual({ display: "block", height: "4px", width: "4px" });
  }
  const bottomClearance = await marquee.evaluate((element) => {
    const pill = element.querySelector('[data-role-group="primary"] span');
    if (!(pill instanceof HTMLElement)) return 0;
    return element.getBoundingClientRect().bottom - pill.getBoundingClientRect().bottom;
  });
  expect(bottomClearance).toBeGreaterThanOrEqual(1);
  const keyframeTransforms = await track.evaluate((element) => {
    const animation = element.getAnimations()[0];
    return animation?.effect?.getKeyframes().map((keyframe) => String(keyframe.transform ?? "")) ?? [];
  });
  expect(keyframeTransforms.at(-1)).toContain("-50%");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(track).toHaveCSS("animation-name", "none");
  await expect(duplicateGroup).toHaveCSS("display", "none");
  const reducedMotionSeparatorDisplay = await primaryGroup
    .locator("span")
    .last()
    .evaluate((element) => window.getComputedStyle(element, "::after").display);
  expect(reducedMotionSeparatorDisplay).toBe("none");
  await expect(marquee).toHaveCSS("overflow-x", "auto");
  await expect.poll(() => marquee.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
