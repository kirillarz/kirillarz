# Progress

## Текущее состояние (Current State)

Last Updated: 2026-06-28
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

## В работе

- Активной работы нет. `portfolio-001` имеет статус `passing` и закрывает
  документацию Lego-концепции.

## Дальше (Next)

1. Следующей Codex-сессии выбрать ровно одну `not-started` фичу из
   `feature_list.json`.
2. Рекомендуемый следующий шаг: `portfolio-002` - Lego-style hero layout.
3. Перед реализацией hero прочитать `docs/site-brief.md`,
   `docs/content.md` и посмотреть `examples/hero-screen-desktop.jpg` /
   `examples/hero-screen-mobile.jpg`.
4. Если пользователь даст email, обновить `docs/content.md` и фичу
   `portfolio-008`.

## Блокеры / риски

- Email для блока контактов пока не подтвержден: использовать
  `TODO: добавить email`.
- Ссылки и ассеты проектов остаются `TODO`, если они не указаны в
  `docs/content.md`.
- Сложная hero-анимация может потребовать отдельного решения по ассетам и
  проверке reduced motion.

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

- `AGENTS.md` - добавлен маршрут к `docs/site-brief.md` и правила Lego-style
  scope.
- `README.md` - добавлены ссылки на brief, content source и hero-референсы.
- `docs/content.md` - добавлены структура сайта, hero-сценарий, хобби, контакты
  и TODO по email.
- `docs/site-brief.md` - новый продуктово-дизайнерский brief для Lego-style
  портфолио.
- `docs/harness-cheat-sheet.md` - добавлена карта текущего harness.
- `feature_list.json` - `portfolio-001` закрыт как документационная фича,
  будущая реализация разбита на отдельные фичи.
- `progress.md` - обновлено текущее состояние.
- `session-handoff.md` - обновлен restart path для следующей сессии.

## Evidence

- Baseline before documentation edits:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed
  end-to-end: lint, typecheck, test, build.
- Baseline before documentation edits:
  `node .skills/harness-creator/scripts/validate-harness.mjs --target .`
  passed, overall 100/100.
- Final verification after documentation edits:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1` passed
  end-to-end: lint, typecheck, test, build.
- Final verification after documentation edits:
  `node .skills/harness-creator/scripts/validate-harness.mjs --target .`
  passed, overall 100/100.
