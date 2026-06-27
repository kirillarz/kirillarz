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
- Полная проверка проекта прошла успешно.
- Harness переведен на русский язык там, где это не ломает команды, пути,
  JSON-ключи и machine-readable статусы.

## В работе

- Активной работы нет. `harness-001` имеет статус `passing`.

## Дальше (Next)

1. Когда начнется работа над контентом, активировать `portfolio-001` в
   `feature_list.json`.
2. Перед изменением публичного текста портфолио прочитать `docs/content.md`.
3. Привязывать verification evidence к активной фиче.

## Блокеры / риски

- Сейчас неизвестны.

## Решения

- Использовать `AGENTS.md` как основной instruction file, потому что целевой
  агент - Codex.
- Держать harness минимальным: без evaluator rubric, multi-agent ownership model
  и benchmark-файлов, пока нет повторяющегося failure mode.
- Добавить `init.ps1` рядом с `init.sh`, потому что это рабочее окружение
  запускается в PowerShell.
- Сохранить английские маркеры в скобках в нескольких заголовках, потому что их
  ожидает `validate-harness.mjs`.

## Измененные файлы этой сессии (Files Modified This Session)

- `AGENTS.md` - стартовый контракт Codex и правила проекта.
- `feature_list.json` - активная harness-фича и следующая фича портфолио.
- `progress.md` - текущее состояние и следующие verification-шаги.
- `session-handoff.md` - инструкции для продолжения в следующих сессиях.
- `init.sh` - Bash entrypoint для проверки.
- `init.ps1` - PowerShell entrypoint для проверки.

## Evidence

- `node .skills/harness-creator/scripts/validate-harness.mjs --target .`:
  passed, overall 100/100.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 1 test file and 1 test.
- `npm run build`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1`:
  passed end-to-end.
- После перевода harness на русский:
  `node .skills/harness-creator/scripts/validate-harness.mjs --target .`
  снова passed, overall 100/100.
- После перевода `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\init.ps1`
  снова passed end-to-end.
