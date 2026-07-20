import { mkdir } from "node:fs/promises";

import { expect, test, type Locator, type Page } from "@playwright/test";

const artifactsDir = "artifacts/visual-smoke";
const transitionStartViewportRatio = 1;
const transitionEndViewportRatio = -0.134;
const transitionMidpointViewportRatio =
  (transitionStartViewportRatio + transitionEndViewportRatio) / 2;

function expectedTransitionProgress(viewportRatio: number) {
  return (
    (transitionStartViewportRatio - viewportRatio) /
    (transitionStartViewportRatio - transitionEndViewportRatio)
  );
}

test.beforeAll(async () => {
  await mkdir(artifactsDir, { recursive: true });
});

test.beforeEach(async ({ page }, testInfo) => {
  if (testInfo.title.includes("hero CTA plays the figure animation")) return;

  await page.route("**/hero-minifigure-animate-clean.webm", (route) => route.abort());
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

async function placeTransitionAt(page: Page, transition: Locator, viewportRatio: number) {
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

test("section motion follows scrolling, reveals once, and respects reduced motion", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const transitionCases = [
    { id: "about-skills", variant: "brick-wipe" },
    { id: "skills-projects", variant: "brick-wipe" },
    { id: "projects-hobby", variant: "scatter" },
    { id: "hobby-contacts", variant: "brick-wipe" },
  ] as const;

  await expect(page.locator("[data-section-transition]")).toHaveCount(transitionCases.length);
  for (const transitionCase of transitionCases) {
    const transition = page.getByTestId(`section-transition-${transitionCase.id}`);
    await expect(transition).toHaveAttribute("data-variant", transitionCase.variant);
    await expect(transition).toHaveAttribute("aria-hidden", "true");
  }

  const brickTransition = page.getByTestId("section-transition-about-skills");
  const firstStripe = brickTransition.locator("[data-transition-stripe]").first();
  await placeTransitionAt(page, brickTransition, 0.82);
  await expect
    .poll(async () => Number(await brickTransition.getAttribute("data-progress")))
    .toBeCloseTo(expectedTransitionProgress(0.82), 2);
  const earlyProgress = Number(await brickTransition.getAttribute("data-progress"));
  const earlyTransform = await firstStripe.evaluate((element: HTMLElement) => element.style.transform);

  await placeTransitionAt(page, brickTransition, 0.5);
  const progressImmediatelyAfterJump = Number(await brickTransition.getAttribute("data-progress"));
  expect(progressImmediatelyAfterJump).toBeLessThan(expectedTransitionProgress(0.5) - 0.05);
  await expect
    .poll(async () => Number(await brickTransition.getAttribute("data-progress")))
    .toBeCloseTo(expectedTransitionProgress(0.5), 2);
  const middleProgress = Number(await brickTransition.getAttribute("data-progress"));
  const middleTransform = await firstStripe.evaluate((element: HTMLElement) => element.style.transform);
  expect(middleProgress).toBeGreaterThan(earlyProgress);
  expect(middleTransform).not.toBe(earlyTransform);
  await captureScreenshot(page, `${artifactsDir}/transition-brick-desktop.png`);

  await placeTransitionAt(page, brickTransition, 0.18);
  await expect
    .poll(async () => Number(await brickTransition.getAttribute("data-progress")))
    .toBeCloseTo(expectedTransitionProgress(0.18), 2);

  await placeTransitionAt(page, brickTransition, 0.82);
  await expect
    .poll(async () => Number(await brickTransition.getAttribute("data-progress")))
    .toBeCloseTo(expectedTransitionProgress(0.82), 2);

  const scatterTransition = page.getByTestId("section-transition-projects-hobby");
  await placeTransitionAt(page, scatterTransition, transitionMidpointViewportRatio);
  await expect
    .poll(async () => Number(await scatterTransition.getAttribute("data-progress")))
    .toBeCloseTo(0.5, 2);
  await expectImagesReady(scatterTransition);
  await expect(scatterTransition.locator("img[data-transition-piece]")).toHaveCount(13);
  await expect(scatterTransition.locator("img[data-transition-piece]:visible")).toHaveCount(13);
  await expect(scatterTransition.locator("[data-transition-piece]").first()).not.toHaveCSS("transform", "none");
  await captureScreenshot(page, `${artifactsDir}/transition-scatter-desktop.png`);

  for (const sectionId of ["skills", "projects", "hobby", "contacts"]) {
    await page.goto(`/#${sectionId}`);
    const section = page.locator(`#${sectionId}`);
    const heading = section.locator('h2[data-motion-reveal="heading"]');
    await expect(heading).toHaveAttribute("data-motion-revealed", "true");
    await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));
    await expect(heading).toBeInViewport();
  }

  const hobbyHeading = page.locator('#hobby h2[data-motion-reveal="heading"]');
  await page.goto("/#hobby");
  await expect(hobbyHeading).toHaveAttribute("data-motion-revealed", "true");
  await scrollToSection(page.locator("#top"));
  await scrollToSection(page.locator("#hobby"));
  await expect(hobbyHeading).toHaveAttribute("data-motion-revealed", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const transitionCase of transitionCases) {
    await expect(page.getByTestId(`section-transition-${transitionCase.id}`)).toHaveCSS("display", "none");
  }
  const reducedHeadingGroup = page.locator("#about h2 span").first();
  await expect(reducedHeadingGroup).toHaveCSS("opacity", "1");
  await expect(reducedHeadingGroup).toHaveCSS("filter", "none");
  await expect(reducedHeadingGroup).toHaveCSS("transform", "none");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const mobileScatterTransition = page.getByTestId("section-transition-projects-hobby");
  await expectImagesReady(mobileScatterTransition);
  await placeTransitionAt(page, mobileScatterTransition, transitionMidpointViewportRatio);
  await placeTransitionAt(page, mobileScatterTransition, transitionMidpointViewportRatio);
  await expect
    .poll(async () => Number(await mobileScatterTransition.getAttribute("data-progress")))
    .toBeCloseTo(0.5, 2);
  const visibleMobilePieces = mobileScatterTransition.locator("img[data-transition-piece]:visible");
  await expect(visibleMobilePieces).toHaveCount(6);
  const mobilePieceLayout = await visibleMobilePieces.evaluateAll((pieces) =>
    pieces.map((piece) => {
      const bounds = piece.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        center: bounds.left + bounds.width / 2,
        tone: (piece as HTMLElement).dataset.tone,
      };
    }),
  );
  expect(Math.min(...mobilePieceLayout.map(({ left }) => left))).toBeGreaterThanOrEqual(12);
  expect(Math.max(...mobilePieceLayout.map(({ right }) => right))).toBeLessThanOrEqual(378);
  const mobilePieceCenters = mobilePieceLayout.map(({ center }) => center).sort((a, b) => a - b);
  expect(
    Math.min(...mobilePieceCenters.slice(1).map((center, index) => center - mobilePieceCenters[index])),
  ).toBeGreaterThan(45);
  expect(mobilePieceLayout.map(({ tone }) => tone).sort()).toEqual([
    "blue",
    "blue",
    "red",
    "red",
    "yellow",
    "yellow",
  ]);
  await captureScreenshot(page, `${artifactsDir}/transition-scatter-mobile.png`);

  for (const viewport of [
    { width: 1680, height: 838 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  }
});

test("fast mobile scroll jumps keep distant transitions idle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const distantTransition = page.getByTestId("section-transition-projects-hobby");
  await expect(distantTransition).toHaveAttribute("data-transition-active", "false");
  await distantTransition.evaluate((element) => {
    const trackedWindow = window as Window & { __transitionGeometryReads?: number };
    const originalGetBoundingClientRect = element.getBoundingClientRect.bind(element);
    trackedWindow.__transitionGeometryReads = 0;
    element.getBoundingClientRect = () => {
      trackedWindow.__transitionGeometryReads = (trackedWindow.__transitionGeometryReads ?? 0) + 1;
      return originalGetBoundingClientRect();
    };
  });

  await page.evaluate(() => window.scrollTo({ top: 1_200, behavior: "auto" }));

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __transitionGeometryReads?: number }).__transitionGeometryReads ?? 0,
      ),
    )
    .toBe(0);
});

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

  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await scrollToSection(aboutSection);
  await expect(aboutSection.getByRole("group", { name: /понять задачу и продукт/ })).toHaveCSS("position", "relative");
  await captureScreenshot(page, `${artifactsDir}/about-mobile-compact.png`);
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

  const imageTrigger = firstProject.getByRole("button", { name: /Открыть на весь экран: Экран входа/ });
  await imageTrigger.click();
  const lightbox = page.getByRole("dialog", { name: /Полноэкранный просмотр проекта/ });
  await expect(lightbox).toBeVisible();
  await expect(lightbox.getByRole("img", { name: /Экран входа/ })).toBeVisible();
  await expect(lightbox.getByText("1 / 5", { exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("ArrowRight");
  await expect(lightbox.getByRole("img", { name: /Результаты поиска помещений/ })).toBeVisible();
  await expect(lightbox.getByText("2 / 5", { exact: true })).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/projects-lightbox-desktop.png`);
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
  await expect(firstProject.getByRole("button", { name: /Открыть на весь экран/ })).toHaveCount(0);

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

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/employer");
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/employer-mobile.png`, true);
});
