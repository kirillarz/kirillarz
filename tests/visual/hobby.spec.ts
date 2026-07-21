import {
  artifactsDir,
  scrollToSection,
  expectImagesReady,
  captureScreenshot,
  expect,
  test,
} from "./helpers";
test("hobby section reveals descriptions without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 838 });
  await page.goto("/");

  const hobbySection = page.getByRole("region", { name: "Не только кодом и проектами" });
  await scrollToSection(hobbySection);
  await expectImagesReady(hobbySection);
  await expect(hobbySection.locator("header")).not.toContainText(
    "Рыбалка, плавание, путешествия, горные лыжи и ведение мероприятий.",
  );

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
  const hobbyDescriptions = [
    {
      name: "Рыбалка",
      description:
        "Рыбалка для меня — способ замедлиться, отключиться от суеты и спокойно провести время у воды",
    },
    {
      name: "Горнолыжка",
      description:
        "Горные лыжи учат быстро принимать решения. Особенно когда уже разогнался, а поворачивать только учишься",
    },
    {
      name: "Путешествия",
      description:
        "Люблю путешествия, особенно когда маршрут построен, билеты куплены, а чемодан всё-таки закрылся",
    },
    {
      name: "Мероприятия",
      description:
        "Микрофон, аудитория и внезапное изменение программы — вполне комфортная рабочая обстановка",
    },
    {
      name: "Плавание",
      description:
        "В воде остаются только дыхание, ритм и дистанция — отличный способ перезагрузить голову",
    },
  ] as const;
  const visiblePanel = hobbySection.locator("#hobby-mobile-description");

  for (const hobby of hobbyDescriptions) {
    const tab = tabs.getByRole("button", { name: hobby.name });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-pressed", "true");
    await expect(visiblePanel).toContainText(hobby.name);
    await expect(visiblePanel).toContainText(hobby.description);
  }

  await travelTab.click();
  await expect(travelTab).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => mapViewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
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
