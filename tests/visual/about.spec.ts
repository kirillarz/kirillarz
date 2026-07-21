import {
  artifactsDir,
  scrollToSection,
  expectImagesReady,
  captureScreenshot,
  expect,
  test,
} from "./helpers";
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
  expect(await taskAndProduct.evaluate((element) => window.getComputedStyle(element).backgroundImage)).toMatch(
    /^linear-gradient\(rgba/,
  );
  await expect(aboutSection.getByRole("img", { name: /продуктового менеджера/ })).toBeVisible();
  await expect(aboutSection.getByRole("group", { name: "Активный образ: Продакт менеджер" })).toBeVisible();
  await expect(aboutSection.getByText("Продакт менеджер", { exact: true })).toBeVisible();

  await workPlan.hover();
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");
  await expect(aboutSection.getByRole("img", { name: /проектного менеджера/ })).toBeVisible();

  await requirements.focus();
  await expect(requirements).toBeFocused();
  await expect(requirements).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(3_700);
  await expect(requirements).toHaveAttribute("aria-pressed", "true");

  await requirements.evaluate((element: HTMLElement) => element.blur());
  await page.mouse.move(0, 0);
  await expect(development).toHaveAttribute("aria-pressed", "false");
  await page.clock.fastForward(3_400);
  await expect(development).toHaveAttribute("aria-pressed", "false");
  await page.clock.fastForward(200);
  await expect(development).toHaveAttribute("aria-pressed", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await workPlan.click();
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await page.clock.fastForward(3_700);
  await expect(workPlan).toHaveAttribute("aria-pressed", "true");

  const imageCases = [
    { button: taskAndProduct, imageName: /продуктового менеджера/, role: "Продакт менеджер" },
    { button: workPlan, imageName: /проектного менеджера/, role: "Проджект менеджер" },
    { button: requirements, imageName: /бизнес-аналитика/, role: "Бизнес аналитик" },
    { button: development, imageName: /образе разработчика/, role: "Разработчик" },
    { button: communication, imageName: /образе переговорщика/, role: "Переговорщик" },
    { button: teamwork, imageName: /организатора команды/, role: "Организатор" },
    { button: events, imageName: /ведущего мероприятий/, role: "Ведущий" },
    { button: platoonLeadership, imageName: /кадетской форме/, role: "Кадет" },
  ];

  for (const { button, imageName, role } of imageCases) {
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(aboutSection.getByRole("group", { name: `Активный образ: ${role}` })).toBeVisible();
    await expect(aboutSection.getByText(role, { exact: true })).toBeVisible();
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
  await expect(aboutSection.getByRole("group", { name: /Проджект менеджер/ })).toHaveCSS("position", "sticky");
  await expect(aboutSection.getByText("Проджект менеджер", { exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await captureScreenshot(page, `${artifactsDir}/about-mobile.png`);

  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await scrollToSection(aboutSection);
  await expect(aboutSection.getByRole("group", { name: /Продакт менеджер/ })).toHaveCSS("position", "relative");
  await expect(aboutSection.getByText("Продакт менеджер", { exact: true })).toBeVisible();
  await captureScreenshot(page, `${artifactsDir}/about-mobile-compact.png`);
});
