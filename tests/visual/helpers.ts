import { mkdir } from "node:fs/promises";

import { expect, test as base, type Locator, type Page } from "@playwright/test";

export { expect };

export const test = base.extend<{ pageSetup: void }>({
  pageSetup: [
    async ({ page }, use, testInfo) => {
      const needsFreshHeroIntro =
        testInfo.title.includes("first visit") ||
        testInfo.title.includes("hero CTA plays the figure animation") ||
        testInfo.title.includes("hero CTA skips video") ||
        testInfo.title.includes("hero CTA falls back") ||
        testInfo.title.includes("navigation waits for hero intro");

      await page.addInitScript(
        ({ disableAnalyticsNotice, completeHeroIntro }) => {
          if (disableAnalyticsNotice) window.localStorage.setItem("kirillarz.analyticsConsent", "denied");
          if (completeHeroIntro) window.localStorage.setItem("hero-intro:completed:v1", "completed");
        },
        {
          disableAnalyticsNotice: !testInfo.title.includes("cookie notice"),
          completeHeroIntro: !needsFreshHeroIntro,
        },
      );

      if (
        !testInfo.title.includes("first visit") &&
        !testInfo.title.includes("hero CTA plays the figure animation") &&
        !testInfo.title.includes("navigation waits for hero intro")
      ) {
        await page.route("**/hero-minifigure-animate-clean.webm", (route) => route.abort());
      }

      await use();
    },
    { auto: true },
  ],
});

export const artifactsDir = "artifacts/visual-smoke";
const transitionStartViewportRatio = 1;
const transitionEndViewportRatio = -0.134;
export const transitionMidpointViewportRatio =
  (transitionStartViewportRatio + transitionEndViewportRatio) / 2;

export function expectedTransitionProgress(viewportRatio: number) {
  return (
    (transitionStartViewportRatio - viewportRatio) /
    (transitionStartViewportRatio - transitionEndViewportRatio)
  );
}

test.beforeAll(async () => {
  await mkdir(artifactsDir, { recursive: true });
});

export async function scrollToSection(section: Locator) {
  const page = section.page();
  const heroState = page.locator("main[data-hero-phase]");
  if (await heroState.count()) {
    await expect(heroState).not.toHaveAttribute("data-hero-phase", /^(locked|prompting)$/);
  }

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

export async function placeTransitionAt(page: Page, transition: Locator, viewportRatio: number) {
  await transition.evaluate((element, ratio) => {
    const root = document.documentElement;
    root.style.scrollBehavior = "auto";
    const absoluteTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: absoluteTop - window.innerHeight * ratio, behavior: "auto" });
  }, viewportRatio);

  await expect
    .poll(() => transition.evaluate((element) => Number((element as HTMLElement).dataset.progress)))
    .toBeGreaterThan(0);
}

export async function expectImagesReady(scope: Locator) {
  await expect
    .poll(() =>
      scope.locator("img").evaluateAll((images: HTMLImageElement[]) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
    )
    .toBe(true);
}

export async function expectVideoMetadataReady(video: Locator) {
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 1)).toBe(true);
}

export async function preparePausedVideoScreenshot(video: Locator) {
  await expectVideoMetadataReady(video);
  await video.evaluate((element: HTMLVideoElement) => element.pause());
  await expect(video).toHaveJSProperty("paused", true);
}

export async function expectLightboxGeometry(page: Page, dialog: Locator, video: Locator) {
  await expect
    .poll(async () => {
      const dialogBox = await dialog.boundingBox();
      const videoBox = await video.boundingBox();
      const viewport = page.viewportSize();
      if (!dialogBox || !videoBox || !viewport) return false;

      const isInsideViewport = (box: typeof dialogBox) =>
        box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= viewport.width &&
        box.y + box.height <= viewport.height;
      const nativeControlsTop = videoBox.y + Math.max(0, videoBox.height - 56);

      return (
        isInsideViewport(dialogBox) &&
        isInsideViewport(videoBox) &&
        nativeControlsTop >= dialogBox.y &&
        videoBox.y + videoBox.height <= dialogBox.y + dialogBox.height
      );
    })
    .toBe(true);
}

export async function captureScreenshot(page: Page, path: string, fullPage = false) {
  await page.screenshot({
    path,
    fullPage,
    animations: "disabled",
  });
}
