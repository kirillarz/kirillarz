import { expect, test } from "@playwright/test";

import {
  artifactsDir,
  captureScreenshot,
} from "./helpers";
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

  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
  await expect(page.getByRole("link", { name: "На главную" })).toHaveAttribute("href", "/");
  await captureScreenshot(page, `${artifactsDir}/not-found-mobile.png`, true);
});
