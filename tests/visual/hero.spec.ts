import {
  artifactsDir,
  expectImagesReady,
  expectVideoMetadataReady,
  captureScreenshot,
  expect,
  test,
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
  await expect(overlay).toHaveAttribute("data-transition-phase", "locked");

  await cta.click();
  await expect(overlay).toHaveAttribute("data-transition-phase", "playing");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await page.mouse.wheel(0, 720);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
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
    .toBeLessThanOrEqual(94);
  await expect(overlay).toHaveAttribute("data-transition-phase", "unlocked");
  await expect(video).toHaveJSProperty("paused", true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeLessThan(0.1);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hero-intro:completed:v1"))).toBe("completed");
  await captureScreenshot(page, `${artifactsDir}/hero-animation-about-revealed.png`);

  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "unlocked");
  await page.getByRole("link", { name: /Узнать обо мне/ }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(video).toHaveJSProperty("paused", true);
  await expect(overlay).toHaveAttribute("data-transition-phase", "unlocked");
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
  await expect(overlay).toHaveAttribute("data-transition-phase", "unlocked");
  await expect(overlay).toHaveCSS("display", "none");
  await expect(video).toHaveJSProperty("paused", true);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hero-intro:completed:v1"))).toBe("completed");
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
  await expect(overlay).toHaveAttribute("data-transition-phase", "unlocked");
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("hero-intro:unavailable:v1"))).toBe("true");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hero-intro:completed:v1"))).toBe(null);
  await expect
    .poll(() => aboutSection.evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(72);
  await expect
    .poll(() => aboutSection.evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(94);
});

test("first visit treats playback stalled before the flash as temporarily unavailable", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const main = page.locator("main");
  const video = page.getByTestId("hero-animation");
  await expectVideoMetadataReady(video);
  await page.getByRole("link", { name: /Узнать обо мне/ }).click();
  await expect(main).toHaveAttribute("data-hero-phase", "playing");

  await video.evaluate((element: HTMLVideoElement) => {
    element.pause();
    element.currentTime = 1;
  });

  await expect(main).toHaveAttribute("data-hero-phase", "unlocked", { timeout: 7_000 });
  await expect(page).toHaveURL(/#about$/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("hero-intro:unavailable:v1"))).toBe("true");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hero-intro:completed:v1"))).toBe(null);
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");
});

test("first visit keeps gated sections out of keyboard focus until the intro reveals them", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const gatedContent = page.getByTestId("hero-gated-content");
  const aboutControl = page.locator("#about button").first();
  await expect(gatedContent).toHaveAttribute("inert", "");

  await aboutControl.evaluate((element: HTMLButtonElement) => element.focus());
  await expect.poll(() => gatedContent.evaluate((element) => !element.contains(document.activeElement))).toBe(true);

  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press("Tab");
    await expect.poll(() => gatedContent.evaluate((element) => !element.contains(document.activeElement))).toBe(true);
  }

  const video = page.getByTestId("hero-animation");
  await expectVideoMetadataReady(video);
  await page.getByRole("link", { name: /Узнать обо мне/ }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 4.01;
  });

  await expect(gatedContent).not.toHaveAttribute("inert", "");
  await aboutControl.evaluate((element: HTMLButtonElement) => element.focus());
  await expect(aboutControl).toBeFocused();
});

test("first visit restores browser scroll restoration after the hero gate unlocks", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("manual");

  const video = page.getByTestId("hero-animation");
  await expectVideoMetadataReady(video);
  await page.getByRole("link", { name: /Узнать обо мне/ }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 4.01;
  });

  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "unlocked");
  await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe("auto");

  await page.getByRole("navigation").getByRole("link", { name: "Навыки" }).click();
  await expect(page).toHaveURL(/#skills$/);
  await expect
    .poll(() => page.locator("#skills").evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(100);

  await page.goBack();
  await expect(page).toHaveURL(/#about$/);
  await expect
    .poll(() => page.locator("#about").evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(100);
});

test("first visit blocks downward scrolling and points to the hero CTA", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const main = page.locator("main");
  const hero = page.locator("#top");
  const prompt = page.getByTestId("hero-scroll-prompt");

  await expect(main).toHaveAttribute("data-hero-phase", "locked");
  await expect(hero).toHaveAttribute("data-hero-gate", "locked");
  await page.mouse.wheel(0, 720);

  await expect(main).toHaveAttribute("data-hero-phase", "prompting");
  await expect(prompt).toHaveAttribute("data-visible", "true");
  await expect(prompt).toHaveText("Сначала запусти сцену");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);

  const cta = page.getByRole("link", { name: /Узнать обо мне/ });
  await expect(cta).toHaveAttribute("data-pulse-count", "1");
  for (let index = 0; index < 6; index += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(100);
  }
  await expect(cta).toHaveAttribute("data-pulse-count", "1");
  await page.waitForTimeout(300);
  await page.mouse.wheel(0, 720);
  await expect(cta).toHaveAttribute("data-pulse-count", "2");
  await captureScreenshot(page, `${artifactsDir}/hero-first-visit-scroll-prompt-desktop.png`);

  await page.keyboard.press("PageDown");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
});

test("first visit lets a compact mobile hero scroll to its CTA but not into the next section", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const cta = page.getByRole("link", { name: /Узнать обо мне/ });
  const aboutSection = page.locator("#about");
  const video = page.getByTestId("hero-animation");
  await expectVideoMetadataReady(video);
  await expect
    .poll(async () => {
      const box = await cta.boundingBox();
      return box !== null && box.y + box.height > 568;
    })
    .toBe(true);

  await page.evaluate(() => {
    const start = new Touch({ identifier: 1, target: document.body, clientX: 280, clientY: 420 });
    const move = new Touch({ identifier: 1, target: document.body, clientX: 80, clientY: 416 });
    window.dispatchEvent(new TouchEvent("touchstart", { cancelable: true, touches: [start] }));
    window.dispatchEvent(new TouchEvent("touchmove", { cancelable: true, touches: [move] }));
  });
  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "locked");

  await page.evaluate(() => {
    const start = new Touch({ identifier: 2, target: document.body, clientX: 160, clientY: 520 });
    const move = new Touch({ identifier: 2, target: document.body, clientX: 158, clientY: 80 });
    window.dispatchEvent(new TouchEvent("touchstart", { cancelable: true, touches: [start] }));
    window.dispatchEvent(new TouchEvent("touchmove", { cancelable: true, touches: [move] }));
  });

  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "prompting");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1);
  await expect
    .poll(async () => {
      const box = await cta.boundingBox();
      return box !== null && box.y >= 0 && box.y + box.height <= 568;
    })
    .toBe(true);
  await expect.poll(() => aboutSection.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(568);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const hero = document.getElementById("top");
        if (!hero) return false;
        const bounds = hero.getBoundingClientRect();
        const limit = Math.max(0, window.scrollY + bounds.bottom - window.innerHeight);
        return window.scrollY <= limit + 1;
      }),
    )
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/hero-first-visit-scroll-prompt-mobile-compact.png`);

  await cta.click();
  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "playing");
});

test("navigation waits for hero intro and then opens the requested section", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const video = page.getByTestId("hero-animation");
  await expectVideoMetadataReady(video);
  await page.getByRole("navigation").getByRole("link", { name: "Проекты" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "playing");
  await expect(page).not.toHaveURL(/#projects$/);

  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  });
  const revealingFrame = page.locator("main").evaluate(
    (element) =>
      new Promise<{ sectionTop: number; inlineScrollBehavior: string }>((resolve) => {
        const capture = () => {
          if ((element as HTMLElement).dataset.heroPhase !== "revealing") return false;
          observer.disconnect();
          resolve({
            sectionTop: document.getElementById("projects")?.getBoundingClientRect().top ?? Number.NaN,
            inlineScrollBehavior: document.documentElement.style.scrollBehavior,
          });
          return true;
        };
        const observer = new MutationObserver(capture);
        if (!capture()) observer.observe(element, { attributes: true, attributeFilter: ["data-hero-phase"] });
      }),
  );

  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 4.01;
  });

  await expect(revealingFrame).resolves.toEqual({
    sectionTop: expect.any(Number),
    inlineScrollBehavior: "smooth",
  });
  expect((await revealingFrame).sectionTop).toBeGreaterThanOrEqual(70);
  expect((await revealingFrame).sectionTop).toBeLessThanOrEqual(100);
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "unlocked");
  await expect
    .poll(() => page.locator("#projects").evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(70);
  await expect
    .poll(() => page.locator("#projects").evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(100);
});

test("direct hash on a first visit bypasses the gate without recording a view", async ({ page }) => {
  await page.goto("/#projects");

  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "unlocked");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hero-intro:completed:v1"))).toBe(null);
  await expect
    .poll(() => page.locator("#projects").evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThanOrEqual(100);
});

test("first visit completion in another tab unlocks the current hero", async ({ page }) => {
  await page.goto("/");
  const secondPage = await page.context().newPage();

  try {
    await secondPage.goto("/");
    await expect(secondPage.locator("main")).toHaveAttribute("data-hero-phase", "locked");

    await page.evaluate(() => localStorage.setItem("hero-intro:completed:v1", "completed"));
    await expect(secondPage.locator("main")).toHaveAttribute("data-hero-phase", "unlocked");
  } finally {
    await secondPage.close();
  }
});

test("first visit works when hero storage is unavailable for the page", async ({ page }) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key: string) {
      if (key.startsWith("hero-intro:")) throw new Error("storage unavailable");
      return getItem.call(this, key);
    };
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("hero-intro:")) throw new Error("storage unavailable");
      return setItem.call(this, key, value);
    };
  });
  await page.goto("/");

  const video = page.getByTestId("hero-animation");
  await expectVideoMetadataReady(video);
  await page.getByRole("link", { name: /Узнать обо мне/ }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 4.01;
  });
  await expect(page.locator("main")).toHaveAttribute("data-hero-phase", "unlocked");
  await expect(page).toHaveURL(/#about$/);
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
