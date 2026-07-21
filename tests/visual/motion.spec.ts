import {
  artifactsDir,
  transitionMidpointViewportRatio,
  expectedTransitionProgress,
  scrollToSection,
  placeTransitionAt,
  expectImagesReady,
  captureScreenshot,
  expect,
  test,
} from "./helpers";
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
