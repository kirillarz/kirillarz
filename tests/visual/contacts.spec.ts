import {
  artifactsDir,
  captureScreenshot,
  placeTransitionAt,
  expect,
  test,
} from "./helpers";
test("contacts and employer page contain only confirmed public contact actions", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#contacts");
  await page.evaluate(() => localStorage.setItem("kirillarz.analyticsConsent", "denied"));
  await page.reload();
  const contacts = page.getByRole("region", { name: "Будем на связи" });
  await expect(page.getByLabel("Настройки аналитических cookies")).toBeHidden();
  await placeTransitionAt(page, page.getByTestId("section-transition-hobby-contacts"), 0.35);
  await captureScreenshot(page, `${artifactsDir}/contacts-entry-desktop.png`);
  await contacts.scrollIntoViewIfNeeded();
  const githubLink = contacts.getByRole("link", { name: /GitHub/ });
  const telegramLink = contacts.getByRole("link", { name: /Telegram/ });
  await expect(githubLink).toHaveAttribute("href", "https://github.com/kirillarz");
  await expect(telegramLink).toHaveAttribute("href", "https://t.me/kirillarz");
  await expect(contacts.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.getByText(/Скачать резюме/i)).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await contacts.screenshot({
    path: `${artifactsDir}/contacts-desktop.png`,
    animations: "disabled",
  });
  await telegramLink.hover();
  await expect.poll(() => telegramLink.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  await githubLink.focus();
  await expect(githubLink).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#contacts");
  await contacts.scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await contacts.screenshot({
    path: `${artifactsDir}/contacts-mobile.png`,
    animations: "disabled",
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => telegramLink.evaluate((element) => getComputedStyle(element).transitionDuration))
    .toBe("0s");

  await page.setViewportSize({ width: 320, height: 568 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);

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

  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
  await expect(page.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");
  await captureScreenshot(page, `${artifactsDir}/not-found-mobile.png`, true);
});
