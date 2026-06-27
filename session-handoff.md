# Session Handoff

## Текущая цель (Current Objective)

- Цель: поддерживать небольшой и практичный Codex harness для портфолио и
  вести реализацию Lego-style сайта по маленьким проверяемым фичам.
- Статус: harness создан; Lego-style документация портфолио добавлена;
  `portfolio-001` закрыта как документационная фича.
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

## Доказательства проверки (Verification Evidence)

| Проверка | Команда | Результат | Заметки |
|---|---|---|---|
| Harness validation before docs | `node .skills/harness-creator/scripts/validate-harness.mjs --target .` | Passed | Overall 100/100 |
| PowerShell startup before docs | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Final PowerShell startup after docs | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` | Passed | lint, typecheck, test, build |
| Final harness validation after docs | `node .skills/harness-creator/scripts/validate-harness.mjs --target .` | Passed | Overall 100/100 |

## Старт следующей сессии (Next Session Startup)

1. Прочитать `AGENTS.md`.
2. Прочитать `feature_list.json` и `progress.md`.
3. Прочитать `docs/content.md`.
4. Перед UI/design работой прочитать `docs/site-brief.md`.
5. Посмотреть hero-референсы в `examples/`.
6. Запустить `./init.ps1` в PowerShell или `./init.sh` в Bash.
7. Работать ровно над одной незавершенной фичей.

## Рекомендуемый следующий шаг (Recommended Next Step)

- Выбрать `portfolio-002` и реализовать только Lego-style hero layout:
  responsive раскладка, минифигурка, имя/описание из `docs/content.md`,
  лента навыков и основная кнопка.
- Не начинать hero transition animation, блок Обо мне, карту хобби или проекты,
  пока `portfolio-002` не получит статус `passing` с evidence.

## Открытые TODO

- Email для контактов не подтвержден: использовать `TODO: добавить email`.
- Проектные ссылки, скриншоты, GIF, видео и презентации брать только из
  `docs/content.md`; отсутствующее оставлять как `TODO`.
- Не использовать логотип LEGO, официальные наборы, защищенных персонажей или
  чужие брендированные ассеты.
