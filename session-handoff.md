# Session Handoff

## Текущая цель (Current Objective)

- Цель: повторно довести hero до максимально близкого визуального совпадения с
  `examples/hero-screen-desktop.jpg`.
- Статус: `portfolio-009` завершена со статусом `passing`; canonical,
  desktop и mobile кадры обновлены и проверены.
- Ветка: `dev`.

## Форма репозитория

- Приложение на Vite + React + TypeScript.
- npm scripts: `lint`, `typecheck`, `test`, `build`, `dev`, `preview`,
  `visual:smoke`.
- Маршруты описаны в `src/routes.tsx`.
- Точка входа приложения: `src/main.tsx`.
- Страницы находятся в `src/pages/`.
- Публичные факты портфолио должны браться из `docs/content.md`.
- Структура, визуальный стиль и interaction brief находятся в
  `docs/site-brief.md`.
- Точный план повторного визуального выравнивания находится в
  `docs/hero-reference-alignment.md`; его нужно прочитать целиком до правок.
- Hero-референсы находятся в `examples/hero-screen-desktop.jpg` и
  `examples/hero-screen-mobile.jpg`.
- Текущий hero реализован в `src/pages/HomePage.tsx` и
  `src/pages/Page.module.css`; локальный generated asset лежит в
  `src/assets/hero-minifigure.png`.
- Актуальный hero: темная CSS-сцена с мягким свечением, крупная minifigure в
  отдельной crop-рамке, которая режет изображение только снизу примерно по
  пояс/корпус на desktop и mobile; короткое описание `Разрабатываю цифровые
  продукты, объединяю backend, AI и управление командой.`, skills marquee с
  точками и кнопка `Узнать обо мне`.
- Пользователь не принял эту версию как достаточно близкую к референсу.
  Подтвержденные baseline-дефекты: нижняя полоса около `48 px`, фигура
  смещена вправо, правая колонка опущена примерно на `35 px`, заголовок шире
  эталона, описание переносится не после `продукты,`, последний skill
  обрезается, CTA ниже эталонной высоты, отсутствуют helper и световой декор.
- Visual smoke-проверка находится в `tests/visual/home.spec.ts`; команда
  `npm run visual:smoke` поднимает или переиспользует Vite dev-server через
  Playwright и сохраняет скриншоты в `artifacts/home-desktop.png` и
  `artifacts/home-mobile.png` для открытия через `view_image`.

## Доказательства проверки (Verification Evidence)

| Проверка | Команда | Результат | Заметки |
|---|---|---|---|
| Harness validation before docs | `node .skills/harness-creator/scripts/validate-harness.mjs --target .` | Passed | Overall 100/100 |
| PowerShell startup before docs | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Final PowerShell startup after docs | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Final harness validation after docs | `node .skills/harness-creator/scripts/validate-harness.mjs --target .` | Passed | Overall 100/100 |
| Baseline before `portfolio-002` | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build; direct `.\init.ps1` blocked by Execution Policy |
| Hero lint | `npm.cmd run lint` | Passed | After hero implementation |
| Hero typecheck | `npm.cmd run typecheck` | Passed | After hero implementation |
| Hero tests | `npm.cmd test` | Passed | 1 file, 1 test |
| Hero build | `npm.cmd run build` | Passed | Vite emitted hero image asset |
| Runtime smoke | Vite dev server | Passed | PID `16716`; `/` and `/employer` returned HTTP 200 at `http://127.0.0.1:5173/` |
| Final startup after harness updates | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Playwright dependency | `npm.cmd install -D @playwright/test` | Passed | Required escalation for npm registry access |
| Playwright browser setup | `npx.cmd playwright install chromium` | Passed | Downloaded Chromium/headless shell/FFmpeg/Winldd to local Playwright cache |
| Visual smoke | `npm.cmd run visual:smoke` | Passed | Generated `artifacts/home-desktop.png` and `artifacts/home-mobile.png` |
| Screenshot inspection | `view_image artifacts/home-desktop.png` and `view_image artifacts/home-mobile.png` | Passed | Both PNGs opened successfully |
| Final startup after visual smoke harness | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Baseline before hero visual alignment | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Hero visual alignment checks | `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build` | Passed | Vitest: 1 file, 1 test |
| Hero visual smoke | `npm.cmd run visual:smoke` plus `view_image artifacts/home-desktop.png` and `view_image artifacts/home-mobile.png` | Passed | Screenshots inspected after CSS/markup edits |
| Hero image crop repair baseline | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Hero image crop repair checks | `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build` | Passed | Vitest: 1 file, 1 test |
| Hero image crop repair visual smoke | `npm.cmd run visual:smoke` plus `view_image artifacts/home-desktop.png` and `view_image artifacts/home-mobile.png` | Partial shell exit; visual passed | Playwright reported `ok` and regenerated screenshots; npm wrapper timed out waiting for process exit in this shell; screenshots inspected visually |
| 2026-07-12 planning checks | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` before and after docs | Passed | lint, typecheck, 1 Vitest test, build |
| 2026-07-12 canonical capture | System Chrome at `1680 × 838` plus `view_image` | Passed | Confirmed measured layout gaps documented in `docs/hero-reference-alignment.md` |
| 2026-07-12 standard visual smoke | `npm run visual:smoke` | Blocked by local browser cache | Missing Playwright `chromium_headless_shell-1228`; production code unaffected |
| 2026-07-12 hero realignment checks | `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build` | Passed | Vitest: 1 file, 1 test; Vite build passed |
| 2026-07-12 hero visual test | `npm.cmd run visual:smoke` | Visual test passed; wrapper timed out | System Chrome test reported `ok` in about 2.3s and wrote canonical/desktop/mobile screenshots; wrapper remained alive |
| 2026-07-12 final image inspection | `view_image` on both references and three generated screenshots | Passed | Canonical landmarks and mobile overflow acceptance checked |

## Старт следующей сессии (Next Session Startup)

1. Прочитать `AGENTS.md`.
2. Прочитать `feature_list.json` и `progress.md`.
3. Прочитать `docs/content.md`.
4. Перед UI/design работой прочитать `docs/site-brief.md`.
5. Прочитать `docs/hero-reference-alignment.md` целиком.
6. Посмотреть hero-референсы в `examples/`.
7. Запустить `./init.ps1` в PowerShell или `./init.sh` в Bash.
8. Для проверки верстки запустить `npm run visual:smoke` и открыть
   `artifacts/*.png` через `view_image`.
9. Перед новой реализацией выбрать ровно одну незавершенную фичу.

## Рекомендуемый следующий шаг (Recommended Next Step)

- Показать пользователю новые кадры `portfolio-009`; если будут точечные
  замечания, продолжить эту же фичу, не смешивая ее с transition-анимацией.
- Если визуальная приемка подтверждена, выбрать следующую незавершенную фичу
  по `feature_list.json` отдельной сессией.

## Открытые TODO

- Подтвердить у пользователя, нужно ли расширять эту же фичу мобильной шапкой
  `KA. / меню` или реальной transition-анимацией. По умолчанию оба пункта вне
  scope, чтобы не смешивать visual repair и `portfolio-003`.
- Email для контактов не подтвержден: использовать `TODO: добавить email`.
- Проектные ссылки, скриншоты, GIF, видео и презентации брать только из
  `docs/content.md`; отсутствующее оставлять как `TODO`.
- Не использовать логотип LEGO, официальные наборы, защищенных персонажей или
  чужие брендированные ассеты.
