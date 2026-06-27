# Session Handoff

## Текущая цель (Current Objective)

- Цель: поддерживать небольшой и практичный Codex harness для портфолио и
  вести реализацию Lego-style сайта по маленьким проверяемым фичам.
- Статус: harness создан; Lego-style документация портфолио добавлена;
  `portfolio-001` закрыта как документационная фича; `portfolio-002` закрыта
  как responsive hero layout.
- Ветка: `try-new-harness`.

## Форма репозитория

- Приложение на Vite + React + TypeScript.
- npm scripts: `lint`, `typecheck`, `test`, `build`, `dev`, `preview`.
- Маршруты описаны в `src/routes.tsx`.
- Точка входа приложения: `src/main.tsx`.
- Страницы находятся в `src/pages/`.
- Публичные факты портфолио должны браться из `docs/content.md`.
- Структура, визуальный стиль и interaction brief находятся в
  `docs/site-brief.md`.
- Hero-референсы находятся в `examples/hero-screen-desktop.jpg` и
  `examples/hero-screen-mobile.jpg`.
- Текущий hero реализован в `src/pages/HomePage.tsx` и
  `src/pages/Page.module.css`; локальный generated asset лежит в
  `src/assets/hero-minifigure.png`.

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

## Старт следующей сессии (Next Session Startup)

1. Прочитать `AGENTS.md`.
2. Прочитать `feature_list.json` и `progress.md`.
3. Прочитать `docs/content.md`.
4. Перед UI/design работой прочитать `docs/site-brief.md`.
5. Посмотреть hero-референсы в `examples/`.
6. Запустить `./init.ps1` в PowerShell или `./init.sh` в Bash.
7. Работать ровно над одной незавершенной фичей.

## Рекомендуемый следующий шаг (Recommended Next Step)

- Выбрать `portfolio-003` и реализовать только hero transition animation:
  оживание минифигурки, нейтральный световой гаджет, щелчок, короткая вспышка,
  открытие следующего блока или fallback-состояние.
- Обязательно добавить `prefers-reduced-motion` поведение и не копировать
  узнаваемые кино-гаджеты, защищенный дизайн, официальные наборы или логотипы.
- Не начинать блоки Обо мне, Навыки, Проекты, Хобби или Контакты, пока
  `portfolio-003` не получит статус `passing` или `blocked` с evidence.

## Открытые TODO

- Email для контактов не подтвержден: использовать `TODO: добавить email`.
- Проектные ссылки, скриншоты, GIF, видео и презентации брать только из
  `docs/content.md`; отсутствующее оставлять как `TODO`.
- Не использовать логотип LEGO, официальные наборы, защищенных персонажей или
  чужие брендированные ассеты.
