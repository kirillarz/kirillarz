# Progress

## Текущее состояние (Current State)

Last Updated: 2026-06-29
Активная фича: нет

## Готово

- Создан минимальный harness через `.skills/harness-creator`.
- Добавлены стартовые инструкции для Codex в `AGENTS.md`.
- Добавлено машинно-читаемое состояние фич в `feature_list.json`.
- Добавлены стандартные точки проверки: `init.sh` и `init.ps1`.
- Добавлен `session-handoff.md` для restart context.
- Структура harness проверена на 100/100.
- Полная проверка проекта проходила успешно.
- Harness переведен на русский язык там, где это не ломает команды, пути,
  JSON-ключи и machine-readable статусы.
- Добавлен `docs/site-brief.md` с Lego-style структурой главной страницы,
  hero-сценарием, блоками, картой хобби, контактами и будущими фичами.
- Обновлен `docs/content.md`: добавлены новые требования к структуре сайта,
  хобби, карта локаций, email TODO и ссылка на `docs/site-brief.md`.
- Обновлены `AGENTS.md`, `README.md` и `docs/harness-cheat-sheet.md`, чтобы
  следующая Codex-сессия находила `docs/site-brief.md` без контекста из чата.
- `feature_list.json` разбит на небольшие будущие фичи: hero layout, hero
  transition animation, Обо мне, Навыки, Проекты, Хобби и Контакты.
- Реализован `portfolio-002`: responsive Lego-style hero на главной странице с
  минифигуркой, подтвержденным текстом, лентой направлений и кнопкой на
  `/employer`.
- Добавлен локальный generated bitmap asset `src/assets/hero-minifigure.png`
  без логотипов, текста, официальных наборов или защищенных персонажей.
- Реализован `harness-002`: добавлен Playwright visual smoke для desktop/mobile
  скриншотов главной страницы, которые агенты могут открывать через `view_image`.
- Реализован `portfolio-009`: hero визуально приближен к
  `examples/hero-screen-desktop.jpg` без новых зависимостей и без изменения
  маршрутов.

## В работе

- Активной работы нет. `portfolio-009` имеет статус `passing` и закрывает
  визуальное приближение текущего hero к desktop/mobile референсам без
  transition-анимации.

## Дальше (Next)

1. Следующей Codex-сессии выбрать ровно одну `not-started` фичу из
   `feature_list.json`.
2. Рекомендуемый следующий шаг: `portfolio-003` - hero transition animation.
3. Перед реализацией transition прочитать `docs/site-brief.md`,
   `docs/content.md`, проверить текущий hero в `src/pages/HomePage.tsx` и
   `src/pages/Page.module.css`.
4. Если пользователь даст email, обновить `docs/content.md` и фичу
   `portfolio-008`.

## Блокеры / риски

- Email для блока контактов пока не подтвержден: использовать
  `TODO: добавить email`.
- Ссылки и ассеты проектов остаются `TODO`, если они не указаны в
  `docs/content.md`.
- Сложная hero-анимация может потребовать отдельного решения по ассетам и
  проверке reduced motion.
- Hero transition из `portfolio-003` должен использовать neutral naming:
  `световой гаджет`, `вспышка`, `переход`; не копировать узнаваемые
  кино-гаджеты или защищенный дизайн.
- Visual smoke сохраняет PNG в `artifacts/`, эта папка намеренно игнорируется
  git и служит локальным рабочим артефактом для агентов.

## Решения

- Использовать `AGENTS.md` как основной instruction file, потому что целевой
  агент - Codex.
- Держать harness минимальным: без evaluator rubric, multi-agent ownership model
  и benchmark-файлов, пока нет повторяющегося failure mode.
- Добавить `init.ps1` рядом с `init.sh`, потому что это рабочее окружение
  запускается в PowerShell.
- Сохранить английские маркеры в скобках в нескольких заголовках, потому что их
  ожидает `validate-harness.mjs`.
- Разделить источники: `docs/content.md` отвечает за факты и тексты,
  `docs/site-brief.md` отвечает за структуру, визуальный стиль и interaction
  brief.
- Не использовать логотип LEGO, официальные наборы, защищенных персонажей или
  чужие брендированные ассеты; держать стиль как конструкторный/brick-toy
  inspired.

## Измененные файлы этой сессии (Files Modified This Session)

- `src/pages/HomePage.tsx` - главная страница переведена на Lego-style hero:
  minifigure asset, имя, подтвержденное описание, лента направлений, кнопка
  `/employer`.
- `src/pages/Page.module.css` - добавлены home-specific стили responsive hero,
  skill tape, dark background и mobile layout без изменения общего маршрута
  `/employer` и 404.
- `src/assets/hero-minifigure.png` - generated bitmap asset для hero.
- `feature_list.json` - `portfolio-002` закрыт как `passing` с evidence.
- `progress.md` - обновлено текущее состояние, evidence и следующий шаг.
- `session-handoff.md` - обновлен restart path для следующей сессии.

## Evidence

- Baseline before `portfolio-002` edits:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed
  end-to-end: lint, typecheck, test, build. Direct `.\init.ps1` was blocked by
  local PowerShell Execution Policy.
- Implementation checks after hero edits:
  `npm.cmd run lint` passed.
- Implementation checks after hero edits:
  `npm.cmd run typecheck` passed.
- Implementation checks after hero edits:
  `npm.cmd test` passed: 1 test file, 1 test.
- Implementation checks after hero edits:
  `npm.cmd run build` passed; Vite emitted `dist/assets/hero-minifigure-*.png`.
- Runtime smoke check:
  dev server PID `16716` served `/` and `/employer` with HTTP 200 at
  `http://127.0.0.1:5173/`.
- Final verification after harness updates:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed
  end-to-end: lint, typecheck, test, build.

## 2026-06-29 Hero Layout Repair

Changed files:

- `src/pages/Page.module.css` - repaired hero image sizing after `src/assets/hero-minifigure.png`
  changed from wide 1672x941 to portrait 1024x1536. The image now uses `object-fit: contain`,
  responsive width constraints, and stable visual-block `min-height` values instead of a fixed
  image height plus `object-fit: cover` crop.
- `feature_list.json` - added `portfolio-002` regression-fix evidence.
- `progress.md` - recorded current-session evidence and changed files.

Evidence:

- Baseline before repair:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed end-to-end:
  lint, typecheck, test, build.
- After CSS edits:
  `npm.cmd run lint` passed.
- After CSS edits:
  `npm.cmd run typecheck` passed.
- After CSS edits:
  `npm.cmd test` passed: 1 test file, 1 test.
- After CSS edits:
  `npm.cmd run build` passed.
- Runtime smoke check:
  dev server PID `19712` served `/` and `/employer` with HTTP 200 at `http://127.0.0.1:5173/`.

Next step:

- Continue with exactly one `not-started` feature from `feature_list.json`; recommended next feature remains
  `portfolio-003` hero transition animation.

## 2026-06-29 Visual Smoke Screenshots

Changed files:

- `package.json` - added `@playwright/test` dev dependency and `visual:smoke`
  script.
- `package-lock.json` - locked Playwright packages.
- `playwright.config.ts` - added Playwright config with Vite webServer,
  `baseURL`, Chromium-compatible defaults and trace-on-failure.
- `tests/visual/home.spec.ts` - added desktop and mobile smoke test for `/`
  that saves `artifacts/home-desktop.png` and `artifacts/home-mobile.png`.
- `vite.config.ts` - excluded `tests/visual/**` from Vitest so `npm test`
  remains a Vitest-only check.
- `.gitignore` - ignored generated `artifacts/` screenshots.
- `README.md` - documented `npm run visual:smoke` and screenshot paths.
- `AGENTS.md` - documented the visual smoke workflow for future Codex sessions.
- `feature_list.json` - added and closed `harness-002` with evidence.
- `progress.md` - recorded current-session evidence and changed files.

Evidence:

- Baseline before edits:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed
  end-to-end: lint, typecheck, test, build.
- Dependency setup:
  `npm.cmd install -D @playwright/test` passed after escalation for npm registry access.
- Browser setup:
  `npx.cmd playwright install chromium` passed after escalation and downloaded Chromium,
  headless shell, FFmpeg and Winldd to the local Playwright cache.
- Visual smoke:
  `npm.cmd run visual:smoke` passed and generated `artifacts/home-desktop.png`
  and `artifacts/home-mobile.png`.
- Screenshot inspection:
  both generated PNG files were opened through `view_image`.
- Runner separation:
  initial `init.ps1` after adding Playwright showed Vitest picking up
  `tests/visual/home.spec.ts`; `vite.config.ts` now excludes `tests/visual/**`,
  and `npm.cmd test` passed again with 1 Vitest file and 1 test.
- Final checks:
  `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`,
  `npm.cmd run build`, `npm.cmd run visual:smoke`, and
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed.

Next step:

- Continue with exactly one `not-started` feature from `feature_list.json`;
  recommended next feature remains `portfolio-003` hero transition animation.

## 2026-06-29 Hero Visual Alignment

Changed files:

- `src/pages/HomePage.tsx` - удален hero kicker, заменено описание на заданную
  пользователем фразу, список навыков сокращен до reference-направлений,
  добавлена дублированная marquee-структура для бесконечной прокрутки и
  изменен текст кнопки на `Узнать обо мне`.
- `src/pages/Page.module.css` - заменен фон hero на темную сцену с мягким
  свечением, удален прямоугольник с цветными кругами, настроены крупный
  cropped minifigure, reference-style типографика, кнопка и skill marquee с
  точками-разделителями и `prefers-reduced-motion` fallback.
- `feature_list.json` - добавлена и закрыта фича `portfolio-009` с evidence.
- `progress.md` - recorded current-session evidence and changed files.
- `session-handoff.md` - updated restart context for the current hero state.

Evidence:

- Baseline before edits:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed
  end-to-end: lint, typecheck, test, build.
- Visual baseline before edits:
  `npm.cmd run visual:smoke` passed and generated desktop/mobile screenshots,
  both opened through `view_image`.
- After hero visual edits:
  `npm.cmd run lint` passed.
- After hero visual edits:
  `npm.cmd run typecheck` passed.
- After hero visual edits:
  `npm.cmd test` passed: 1 test file, 1 test.
- After hero visual edits:
  `npm.cmd run build` passed.
- Visual verification:
  `npm.cmd run visual:smoke` passed; `artifacts/home-desktop.png` and
  `artifacts/home-mobile.png` were opened through `view_image`.

Next step:

- Continue with exactly one `not-started` feature from `feature_list.json`;
  recommended next feature remains `portfolio-003` hero transition animation.
