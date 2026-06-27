# Шпаргалка: как спроектировать и поддерживать harness для AI coding agent

**Суть harness engineering на одной странице**

| Проблема агента | Вероятная причина в harness | Какой артефакт или механизм добавить |
| --- | --- | --- |
| Агент «умный», но стартует каждый раз как с нуля | Репозиторий не является system of record; знания живут вне кода | Короткий `AGENTS.md` как routing-файл + локальные `docs/ARCHITECTURE.md`, `docs/PRODUCT.md` рядом с кодом citeturn42view0turn42view1turn24view2turn24view3 |
| Агент забывает, что уже сделал в прошлой сессии | Нет долговечных артефактов состояния и handoff | `claude-progress.md` + `session-handoff.md` + безопасный checkpoint в git citeturn43view0turn17view0turn17view1turn24view1 |
| Агент начинает сразу несколько задач и не доводит ни одну | Нет WIP-лимита и machine-readable scope | `feature_list.json` с одной активной фичей и явными статусами `not_started / in_progress / blocked / passing` citeturn44view0turn44view1turn16view3 |
| Агент слишком рано говорит «готово» | DoD не привязан к запускаемым проверкам и доказательствам | `init.sh`, явные verification commands, evidence в `feature_list.json`, clean-state checklist citeturn45view0turn45view1turn16view2turn17view2 |
| Тесты зелёные, а пользовательский сценарий сломан | Проверяется только локальная корректность, а не full pipeline | Smoke/integration/E2E шаги в DoD; для важного пути — отдельная runnable verification sequence citeturn45view0turn45view1 |
| Агент чинит не корень проблемы, а симптомы | Нет runtime observability и process observability | Структурированные логи, health checks, benchmark/cleanup scanner, evaluator rubric или sprint contract citeturn46view0turn32view1turn31view0turn31view1turn33view3turn35view0 |
| Следующая сессия не понимает, в каком состоянии repo | Нет clean exit discipline | `clean-state-checklist.md`, обновление progress/feature state, безопасный restart path citeturn46view1turn17view2turn20view2 |

**Дерево выбора: какой harness нужен сейчас**

| Ситуация | Что ставить сейчас | Что можно не ставить пока | Когда усиливать |
| --- | --- | --- | --- |
| Маленький репозиторий, одна-две фичи, короткие сессии | `AGENTS.md` или `CLAUDE.md` + `init.sh` + `feature_list.json` + `claude-progress.md` | evaluator, quality-doc, benchmark, cleanup scanner | Как только появляется вторая-третья сессия или повторные фейлы старта citeturn15view0turn16view0turn16view2turn16view3turn17view0 |
| Работа почти наверняка пойдёт в несколько сессий | Добавить `session-handoff.md` | quality score, sprint contract | Когда стоимость восстановления контекста становится заметной citeturn43view0turn17view1 |
| Большой или долгоживущий репозиторий с несколькими доменами | Перейти на advanced pack: короткий router `AGENTS.md`, `ARCHITECTURE.md`, `docs/exec-plans/`, product/reliability/security/frontend docs, quality scoring | Минималистичный single-file AGENTS как единственный источник правил | Когда минимальный пак начинает разрастаться и `AGENTS.md` превращается в encyclopedic dump citeturn18view1turn48view0turn48view1turn48view2turn42view1 |
| Часто спорите, что именно считать done | Добавить независимую рубрику evaluator и, если надо, sprint contract | Не нужен полноценный planner/gen/eval pipeline для каждой мелочи | Когда self-review агента систематически «снисходительный» citeturn22view3turn17view3turn35view1turn35view0 |
| Агент трудно дебажит runtime-дефекты | Логи, boundary checks, health checks | Не обязательно сразу строить полный observability stack | Когда фейлы не воспроизводятся из одного `npm test`/`pytest` прогона citeturn22view2turn28view0turn28view1turn46view0 |
| Неясно, окупается ли очередной слой harness | Оставить только минимальный артефакт, который адресует наблюдаемый failure mode | Не добавлять ещё текст в главный routing-файл | Усиливать только после появления конкретного повторяемого симптома citeturn20view0turn36view1 |

Практическое правило старта из курса и skill одинаковое: начинайте с минимального пакета, а не с максимальной бюрократии. Расширяйте harness только там, где уже видно конкретный режим отказа: потеря контекста, scope drift, преждевременный success claim, runtime-неясность или грязный выход из сессии. citeturn15view0turn20view0turn36view1

## Минимальный harness для нового репозитория

**Рекомендуемая структура репозитория**

Ниже — практическая раскладка для большинства новых репозиториев. Она синтезирована из русской библиотеки шаблонов, Project 01–03 и skill `harness-creator`. Курс прямо рекомендует минимальный пак из четырёх файлов и показывает lifecycle с чтением инструкций, запуском `init.sh`, чтением progress/state и выбором ровно одной незавершённой фичи. citeturn15view0turn47view0turn36view0turn36view1

```text
repo/
├── AGENTS.md
├── CLAUDE.md
├── init.sh
├── feature_list.json
├── claude-progress.md
├── session-handoff.md
├── clean-state-checklist.md
├── evaluator-rubric.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRODUCT.md
│   ├── RELIABILITY.md
│   ├── architecture/
│   ├── decisions/
│   └── references/
└── src/
```

| Файл | Зачем нужен | Когда обязателен | Кто читает | Кто обновляет | Анти-паттерн |
| --- | --- | --- | --- | --- | --- |
| `AGENTS.md` | Короткий routing-файл: старт, DoD, инварианты, ссылки на deeper docs | Почти всегда | Любая новая сессия любого агента | Человек или агент при изменении workflow | Делать его encyclopedic dump на сотни строк citeturn16view0turn20view3turn42view1turn48view0 |
| `CLAUDE.md` | Вариант для Claude Code, если хотите отдельный operational wording | Опционален, если нужен agent-specific entrypoint | Claude Code | Тот же владелец harness | Дублировать в нём всё содержимое `AGENTS.md` без причины citeturn16view1turn33view0 |
| `init.sh` | Стандартизированный start/verify path | Обязателен в минимальном паке | Каждая новая сессия | Человек при изменении команд проекта | Прятать реальные команды в чат вместо файла citeturn16view2turn20view2 |
| `feature_list.json` | Machine-readable scope boundary, статусы, evidence | Обязателен, если больше одной фичи или работа идёт дольше одной сессии | Агент, evaluator, handoff | Агент после проверки или человек | Оставлять статус словами вроде “mostly done” citeturn16view3turn44view1 |
| `claude-progress.md` | Проверенное текущее состояние, блокеры, next best step | Обязателен для multi-session | Новая сессия | Агент в конце каждой сессии | Писать самооценку без фактов и verification evidence citeturn17view0turn20view1 |
| `session-handoff.md` | Краткий мост между длинными сессиями | Окупается на длинных задачах, не обязателен в микро-репо | Следующая сессия | Агент перед выходом | Превращать в дубликат progress log citeturn17view1turn24view1 |
| `clean-state-checklist.md` | Проверка того, что repo вообще передаваем дальше | Нужен, когда сессии стали оставлять мусор и ломать baseline | Агент перед завершением | Человек-владелец harness, иногда агент | Рассматривать как формальность и не запускать проверки реально citeturn17view2turn28view2turn46view1 |
| `evaluator-rubric.md` | Независимая acceptance-рамка | Нужен, когда self-review слишком мягкий | Evaluator или человек-reviewer | Человек/команда | Писать в рубрике вкусовщину вместо проверяемых критериев citeturn17view3turn22view3turn33view3 |
| `docs/ARCHITECTURE.md` | Карта системы и границ | Нужен почти всегда, если у системы есть слои/домены | Агент перед изменением архитектурно значимых частей | Человек/агент вместе с изменением поведения | Держать архитектурные правила только в чате citeturn24view2turn42view0turn48view1 |
| `docs/PRODUCT.md` | Что должен видеть пользователь, а не как это реализовано | Нужен, если behavior-spec не тривиален | Агент, evaluator | Человек/агент | Смешивать behavior и внутреннюю реализацию в одном месте citeturn24view3turn48view0 |
| `docs/RELIABILITY.md` | Observability, reset, benchmark, restart expectations | Нужен после перехода к advanced/full harness | Агент, evaluator | Человек/агент | Не обновлять после изменения verification/cleanup path citeturn32view1turn33view0 |

**Готовые шаблоны файлов**

Ниже — **адаптированные примеры**, а не дословные цитаты. Они собраны из русских template-файлов, практик Project 01–03 и принципов `harness-creator`: короткий routing-файл, одна активная фича, обязательная верификация, фиксация evidence и clean exit. Заменяйте все места `TODO: заменить`. citeturn16view0turn16view1turn16view2turn16view3turn17view0turn24view0turn25view0turn36view1

**Адаптированный пример — `AGENTS.md`**

```md
# AGENTS.md

<!-- TODO: заменить -->
Этот репозиторий предназначен для надёжной работы AI coding agent над проектом: `TODO: заменить названием проекта`.

## Что это за проект
- Продукт: `TODO: заменить`
- Основной стек: `TODO: заменить`
- Главная пользовательская ценность: `TODO: заменить`

## Куда смотреть дальше
- Архитектурная карта: `docs/ARCHITECTURE.md`
- Продуктовое поведение: `docs/PRODUCT.md`
- Надёжность и проверки: `docs/RELIABILITY.md` <!-- если файла ещё нет, удалить строку -->

## Старт новой сессии
Перед написанием кода выполните шаги строго по порядку:
1. Подтвердите корень репозитория: `pwd`
2. Прочитайте `claude-progress.md`
3. Прочитайте `feature_list.json`
4. Просмотрите последние коммиты: `git log --oneline -5`
5. Запустите `./init.sh`
6. Если baseline-проверка уже не проходит, сначала восстановите baseline
7. Выберите ровно одну незавершённую фичу с наивысшим приоритетом

## Рабочие правила
- Ровно одна активная фича за сессию
- Не расширяйте scope без явного блокера
- Не объявляйте задачу завершённой только потому, что код написан
- Не меняйте правила верификации ради прохождения задачи
- Держите этот файл коротким; локальные детали храните рядом с кодом

## Definition of Done
Фича считается завершённой только если одновременно выполнено всё:
- целевое пользовательское поведение реализовано
- запущены требуемые проверки из `feature_list.json`
- доказательства записаны в `feature_list.json`
- обновлён `claude-progress.md`
- репозиторий можно заново поднять стандартным путём `./init.sh`

## Перед завершением сессии
1. Обновите `claude-progress.md`
2. Обновите `feature_list.json`
3. Запишите блокеры и нерешённые риски
4. Если сессия была длинной, обновите `session-handoff.md`
5. Оставьте чистый перезапускаемый baseline
```


**Адаптированный пример — `init.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# TODO: заменить команды под свой проект
INSTALL_CMD=(npm install)
VERIFY_CMD=(npm run check)
SMOKE_CMD=(npm run test)
START_CMD=(npm run dev)

echo "==> Working directory: $PWD"
echo "==> Installing / syncing dependencies"
"${INSTALL_CMD[@]}"

echo "==> Running baseline verification"
"${VERIFY_CMD[@]}"

echo "==> Running smoke verification"
"${SMOKE_CMD[@]}"

echo "==> Standard start command:"
printf ' %q' "${START_CMD[@]}"
printf '\n'

if [ "${RUN_START_COMMAND:-0}" = "1" ]; then
  echo "==> Starting app"
  exec "${START_CMD[@]}"
fi

echo "Set RUN_START_COMMAND=1 to launch the app from init.sh"
```

**Адаптированный пример — `feature_list.json`**

```json
{
  "project": "TODO: заменить названием проекта",
  "last_updated": "TODO: заменить датой YYYY-MM-DD",
  "rules": {
    "single_active_feature": true,
    "passing_requires_evidence": true,
    "do_not_skip_verification": true
  },
  "status_legend": {
    "not_started": "Работа не начиналась",
    "in_progress": "Единственная активная фича текущей сессии",
    "blocked": "Есть документированный блокер",
    "passing": "Проверка реально прошла, доказательства записаны"
  },
  "features": [
    {
      "id": "TODO-001",
      "priority": 1,
      "area": "TODO: заменить",
      "title": "TODO: заменить названием фичи",
      "user_visible_behavior": "TODO: заменить на наблюдаемое поведение для пользователя",
      "status": "not_started",
      "verification": [
        "TODO: заменить шагом проверки 1",
        "TODO: заменить шагом проверки 2",
        "TODO: заменить шагом smoke/integration/e2e, если нужно"
      ],
      "evidence": [],
      "notes": ""
    },
    {
      "id": "TODO-002",
      "priority": 2,
      "area": "TODO: заменить",
      "title": "TODO: заменить",
      "user_visible_behavior": "TODO: заменить",
      "status": "not_started",
      "verification": [
        "TODO: заменить"
      ],
      "evidence": [],
      "notes": ""
    }
  ]
}
```

**Адаптированный пример — `claude-progress.md`**

```md
# Лог прогресса

## Текущее проверенное состояние
- Корень репозитория: `TODO: заменить`
- Стандартный путь старта: `TODO: заменить`
- Стандартный путь верификации: `TODO: заменить`
- Текущая незавершённая фича с наивысшим приоритетом: `TODO: заменить`
- Текущий блокер: `TODO: заменить или "нет"`

## Лог сессий

### Сессия 001
- Дата: `TODO: заменить`
- Цель: `TODO: заменить`
- Сделано:
  - `TODO: заменить`
- Запущенная верификация:
  - `TODO: заменить точными командами`
- Зафиксированные доказательства:
  - `TODO: заменить`
- Коммиты:
  - `TODO: заменить`
- Обновлённые файлы или артефакты:
  - `TODO: заменить`
- Известный риск или нерешённая проблема:
  - `TODO: заменить`
- Следующий лучший шаг:
  - `TODO: заменить`
```

Эти пять файлов дают тот самый минимальный stable loop, который в курсе повторяется снова и снова: read state → run init → pick one feature → verify → write evidence → leave clean restart path. Для нового репозитория почти всегда этого достаточно, чтобы получить резкий прирост стабильности по сравнению с prompt-only режимом. citeturn47view0turn12view0turn12view2turn12view3turn22view0turn25view0

## Расширенный harness и хорошие формулировки

Когда repo живёт дольше, чем одна короткая сессия, курс советует не раздувать `AGENTS.md`, а добавлять узкие артефакты по конкретному failure mode: handoff — против cold-start confusion, clean-state checklist — против «грязного выхода», evaluator rubric — против субъективной приёмки, quality document — против постепенной деградации качества, observability scripts — против слепого дебага. Именно это показывают Project 04–06, resource templates и advanced pack. citeturn20view0turn17view1turn17view2turn17view3turn18view0turn22view2turn23view0turn31view0turn31view1turn32view1

**Адаптированные шаблоны дополнительных файлов**

**`session-handoff.md`**  
Предотвращает: потерю фактов между длинными сессиями.  
Окупается: когда следующая сессия иначе тратит ощутимое время на реконструкцию состояния.  
Фактами должны быть: что реально работает, какая проверка реально запускалась, что сломано, какая следующая задача. Не писать «кажется, почти готово». citeturn17view1turn24view1turn43view0

```md
# Session Handoff

## Проверено сейчас
- Что сейчас работает:
  - `TODO: заменить`
- Какая верификация реально была запущена:
  - `TODO: заменить`

## Изменено в этой сессии
- Добавленный код или поведение:
  - `TODO: заменить`
- Изменения в harness:
  - `TODO: заменить`

## Сломано или не верифицировано
- Известный дефект:
  - `TODO: заменить`
- Не верифицированный путь:
  - `TODO: заменить`
- Риск для следующей сессии:
  - `TODO: заменить`

## Следующий лучший шаг
- Незавершённая фича с наивысшим приоритетом:
  - `TODO: заменить`
- Почему именно она следующая:
  - `TODO: заменить`
- Что считается прохождением:
  - `TODO: заменить`
- Что нельзя менять во время этого шага:
  - `TODO: заменить`

## Команды
- Старт: `TODO: заменить`
- Верификация: `TODO: заменить`
- Точечная команда отладки: `TODO: заменить`
```

**`clean-state-checklist.md`**  
Предотвращает: накопление энтропии, когда каждая следующая сессия сначала чинит последствия предыдущей.  
Окупается: уже после первых нескольких «грязных» выходов.  
Фактами должны быть: прошла ли сборка, прошли ли тесты, нет ли мусора, можно ли заново стартовать. Не писать «должно работать». citeturn17view2turn28view2turn46view1

```md
# Чек-лист чистого состояния

- [ ] `TODO: заменить build-командой`
- [ ] `TODO: заменить smoke/integration командой`
- [ ] Прогресс обновлён в `claude-progress.md`
- [ ] Состояние фич соответствует реально проверенному состоянию
- [ ] Не осталось незадокументированных временных файлов / debug-кода / TODO
- [ ] Следующая сессия может запустить `./init.sh` без ручного ремонта
```

**`evaluator-rubric.md`**  
Предотвращает: слишком снисходительную самооценку агента.  
Окупается: на дорогих задачах, на UI/UX-фичах, на multi-file изменениях и когда acceptance criteria спорные.  
Фактами должны быть: прошедшие проверки, наблюдаемое поведение, конкретные недочёты. Не писать «код симпатичный». citeturn17view3turn35view1turn33view3

```md
# Рубрика evaluator

| Категория | Вопрос | Балл 0-2 | Доказательство |
| --- | --- | --- | --- |
| Correctness | Реализовано ли заявленное поведение? |  |  |
| Verification | Реально ли были запущены требуемые проверки? |  |  |
| Scope discipline | Осталась ли работа в границах выбранной фичи? |  |  |
| Reliability | Переживает ли результат повторный запуск без ручного ремонта? |  |  |
| Maintainability | Поймёт ли следующая сессия код и артефакты? |  |  |
| Handoff readiness | Можно ли продолжить только по файлам репозитория? |  |  |

## Вердикт
- Accept / Revise / Block

## Требуемые действия
- Отсутствующие доказательства:
- Требуемые фиксы:
- Триггер следующего ревью:
```

**`quality-document.md`**  
Предотвращает: скрытую деградацию модулей и слоёв.  
Окупается: в долгоживущем repo, где важно видеть динамику, а не только статус отдельной фичи.  
Фактами должны быть: оценка домена, какая именно верификация проходила, какие пробелы остаются. Не превращать в моральную характеристику кода. citeturn18view0turn32view0turn46view1

```md
# Quality-документ

## Продуктовые домены
| Домен | Оценка | Верификация | Читаемость для агента | Ключевые пробелы | Последнее обновление |
| --- | --- | --- | --- | --- | --- |
| `TODO: заменить` | - | - | - | - | - |

## Архитектурные слои
| Слой | Оценка | Соблюдение границ | Ключевые пробелы | Последнее обновление |
| --- | --- | --- | --- | --- |
| `TODO: заменить` | - | - | - | - |

## История изменений
### YYYY-MM-DD
- Изменения:
- Повышенные домены:
- Понижены:
- Новые пробелы:
- Закрытые пробелы:
```

**Наблюдаемость и артефакты capstone**

Project 06 показывает, что observability в harness — это не «побольше console.log», а набор отдельных артефактов: структурированные JSON-логи с `timestamp/level/service/message/data`, `benchmark.sh` для структурной производительности и `cleanup-scanner.sh` для поиска orphaned content, dangling chunks, missing content, inconsistent metadata и stale Q&A references. Это окупается там, где runtime становится сложнее одного юнит-теста и вам нужно быстро видеть не только «что сломалось», но и где именно искать причину. citeturn32view1turn31view0turn31view1turn33view0turn33view1

**Хорошие и плохие формулировки для файлов harness**

| Тема | Плохой пример | Хороший пример | Почему лучше | Куда класть |
| --- | --- | --- | --- | --- |
| Старт новой сессии | «Разберись и начни работать» | «Сначала `pwd`, затем `claude-progress.md`, `feature_list.json`, `git log -5`, потом `./init.sh`» | Превращает старт в механический протокол, а не в импровизацию citeturn20view2turn16view0 | `AGENTS.md` / `CLAUDE.md` |
| Выбор следующей задачи | «Выбери что-нибудь полезное» | «Выбери ровно одну незавершённую фичу с самым высоким приоритетом» | Убирает scope drift и WIP>1 citeturn44view0turn16view3 | `AGENTS.md` |
| Ограничение scope | «Сделай регистрацию пользователей» | «Сделай только POST `/signup`; не меняй email-verification и profile-editing в этой сессии» | Сужает surface area и делает проверку достижимой citeturn44view0turn35view0 | `feature_list.json` / sprint contract |
| Definition of Done | «Когда будет примерно готово» | «Done = поведение реализовано + проверки реально запущены + evidence записан + repo restartable» | Убирает субъективность слова done citeturn16view0turn45view0 | `AGENTS.md` |
| Не объявлять done без доказательств | «Если выглядит правильно, можно закрывать» | «Не переводить фичу в `passing`, пока verification не прошёл и evidence не записан» | Связывает статус с проверяемым фактом citeturn44view1turn16view3 | `AGENTS.md` / `feature_list.json` |
| Unit / integration / E2E | «Прогони тесты» | «Сначала typecheck/lint, затем smoke/integration, затем полный пользовательский поток X» | Избавляет от ложного чувства завершения после одной зелёной команды citeturn45view0turn45view1 | `init.sh` / `feature_list.json` |
| Работа с падающими тестами | «Если что-то падает, продолжай» | «Если baseline уже падает, сначала восстанови baseline; не наслаивай новую фичу» | Не строит новую работу на сломанном фундаменте citeturn16view0turn43view1 | `AGENTS.md` |
| Обновление состояния | «Потом как-нибудь запишем» | «В конце сессии обнови progress, state, blockers, next best step» | Сжимает стоимость восстановления следующей сессии citeturn17view0turn20view2 | `claude-progress.md` |
| Handoff | «Я почти всё сделал» | «Сейчас работает A; запущена проверка B; сломан путь C; следующий шаг D» | Передаёт факты, а не эмоциональный summary citeturn17view1turn24view1 | `session-handoff.md` |
| Clean exit | «Заканчиваю тут» | «Build/tests/start path зелёные, state обновлён, временный мусор убран» | Уменьшает энтропию следующей сессии citeturn46view1turn17view2 | `clean-state-checklist.md` |
| Архитектурные решения | «Тут мы что-то решили по слоям» | «UI не импортирует fs; доступ к данным идёт через repo/service boundary; изменение правил фиксировать в `ARCHITECTURE.md`» | Делает границы проверяемыми и локальными citeturn24view2turn28view0turn48view1 | `docs/ARCHITECTURE.md` |
| Observability | «Если сломается, посмотрим» | «Логи должны показывать startup, critical path, errors, throughput/latency; evaluator ссылается на signal, а не на интуицию» | Дает материал для диагностики и review loops citeturn46view0turn32view1 | `docs/RELIABILITY.md` / rubric |

## Верификация, состояние и межсессионный протокол

Курс жёстко разделяет уровни проверки. Юниты полезны, но они не доказывают системную корректность; интеграционные проверки ловят часть межкомпонентных несоответствий; smoke говорит «проект вообще живой»; а E2E доказывает, что полный пользовательский сценарий проходит на реальной системе. Именно поэтому Lecture 09 и 10 связывают настоящее completion не с уверенностью агента и не с зелёным unit-test report, а с multi-layer verification и full-pipeline run. citeturn45view0turn45view1

**Практическая система верификации**

| Тип проверки | Что доказывает | Чего не доказывает | Когда обязателен |
| --- | --- | --- | --- |
| Unit | Локальная корректность функции/модуля | Правильность границ между компонентами, конфигурации, среды | Всегда полезен, но недостаточен сам по себе citeturn45view0turn45view1 |
| Integration | Взаимодействие 2–3 слоёв или сервисов | Полный пользовательский поток и реальные runtime edge cases | Когда фича пересекает границы модулей citeturn45view1 |
| Smoke | Репозиторий стартует, основные команды живы | Детальную корректность поведения | Перед началом новой фичи и перед выходом из сессии citeturn20view2turn16view0 |
| End-to-end | Пользовательский сценарий работает сквозно | Внутреннее качество кода и полноту низкоуровневого покрытия | Для user-visible фич и дорогих acceptance claims citeturn45view1 |

**Практический чек-лист: агент действительно закончил задачу, если…**

- целевое поведение описано как наблюдаемое поведение пользователя, а не как внутренний refactor;  
- была запущена точная verification sequence, указанная в `feature_list.json`;  
- фича переведена в `passing` только после runnable evidence;  
- baseline `./init.sh` и стандартный стартовый путь остаются рабочими;  
- соседние ранее подтверждённые фичи не были сломаны;  
- если фича пересекает несколько слоёв, есть хотя бы smoke/integration/E2E-доказательство, а не только unit-тест;  
- в progress log записан следующий лучший шаг или явно зафиксировано, что работа действительно закончена. citeturn16view0turn16view3turn20view2turn45view0turn45view1

**Когда нужен независимый evaluator**

Evaluator нужен не «для красоты», а когда исполнитель и проверяющий совпадают, а цена ложного `done` высока. Project 05 специально сравнивает single-role, generator+evaluator и planner+generator+evaluator; в rubric и sprint contract видно, что разделение ролей заставляет заранее фиксировать acceptance criteria, прогонять структурированную оценку и проходить ревизии по недостающим пунктам. На мелких, дешёвых задачах отдельный evaluator может не окупиться, но на multi-file UI/UX-фичах, сложных acceptance criteria и дорогих regressions — окупается быстро. citeturn22view3turn35view1turn35view0

**Протокол межсессионной работы**

**В начале сессии**

1. Подтвердить корень репозитория и последний проверенный baseline.  
2. Прочитать `claude-progress.md`, затем `feature_list.json`, затем `git log --oneline -5`.  
3. Запустить `./init.sh` и baseline smoke/E2E-путь.  
4. Если baseline сломан, не начинать новую фичу.  
5. Выбрать ровно одну незавершённую фичу с наивысшим приоритетом. citeturn20view2turn16view0turn16view1turn25view0

**Во время работы**

1. Держать только одну активную фичу.  
2. Не менять уже подтверждённое состояние без явной причины.  
3. Записывать доказательства и блокеры по факту, а не в конце «по памяти».  
4. Если всплыл повторяющийся review-фидбек, по возможности превращать его в механическую проверку, а не в ещё один абзац в `AGENTS.md`. citeturn44view0turn44view1turn48view0turn20view0

**Перед завершением**

1. Обновить `claude-progress.md`.  
2. Обновить `feature_list.json`: `passing` только после evidence; `blocked` только с причиной.  
3. Если сессия длинная — обновить `session-handoff.md`.  
4. Пройти `clean-state-checklist.md`.  
5. Оставить следующий лучший шаг и чистый restart path. citeturn17view0turn17view1turn17view2turn46view1

Связь между артефактами должна быть жёсткой: `feature_list.json` отвечает за machine-readable state и scope, `claude-progress.md` — за verified narrative и next step, `session-handoff.md` — за компактную передачу фактов следующей сессии. Если эти три файла говорят разное, значит broken system of record. citeturn44view1turn17view0turn17view1turn42view0

## Диагностика провалов и план внедрения

**Диагностическая таблица**

| Симптом | Вероятный дефект harness | Что проверить | Как исправить | Как понять, что помогло |
| --- | --- | --- | --- | --- |
| Агент делает слишком много | Нет WIP=1 и scope boundary | Есть ли одна активная фича? Есть ли out-of-scope запреты? | Ввести single active feature + сузить feature record | За сессию увеличивается доля `passing`, а не число полуготовых веток citeturn44view0turn16view3 |
| Агент делает слишком мало | Слишком широкий/туманный DoD или размытая task framing | Можно ли проверить фичу одной конкретной sequence? | Разбить на smaller behavior slices, добавить verification per feature | Фича начинает проходить, а не висеть «в работе» неделями citeturn44view1turn35view0 |
| Агент забывает контекст | Нет progress/handoff/state | Есть ли `claude-progress.md` и `session-handoff.md`? | Добавить оба файла и обновлять на каждом выходе | Стоимость восстановления новой сессии падает citeturn43view0turn17view0turn17view1 |
| Агент повторно исследует один и тот же repo | Repo не system of record; нет локальных документов | Есть ли `ARCHITECTURE.md`/`PRODUCT.md` рядом с кодом? | Вынести знания из чата в repo-local docs | Меньше повторного «где здесь что» в новых сессиях citeturn42view0turn24view2turn24view3 |
| Агент не может запустить проект | Нет стандартного bootstrap path | Есть ли рабочий `init.sh`? | Сделать `init.sh` единой точкой install/verify/start | Новая сессия стартует без ручного ремонта citeturn16view2turn20view2 |
| Агент объявляет успех слишком рано | `passing` не привязан к evidence | Что считается доказательством completion? | Ввести DoD + evidence gate + clean-state gate | Меньше ложных `done`, больше реальных runnable acceptance cases citeturn45view0turn44view1 |
| Тесты зелёные, но пользовательский сценарий сломан | Только unit coverage | Есть ли smoke/integration/E2E доказательство? | Добавить full-pipeline verification | Дефекты на стыках ловятся до принятия результата citeturn45view1 |
| Агент повторяет одну и ту же ошибку | Review feedback не стал механическим правилом | Повторяется ли замечание в нескольких сессиях? | Добавить check, lint rule, boundary script, better error message | Ошибка перестаёт быть recurring class, а не только разовым случаем citeturn45view1turn28view0turn48view0 |
| Следующая сессия не понимает предыдущую | Нет handoff или clean exit | Оставлена ли verified state snapshot? | Ввести `session-handoff.md` и end-of-session ritual | Следующая сессия может назвать next best step без раскопок citeturn17view1turn20view2 |
| Документация расходится с кодом | Docs не обновляются в ту же сессию, что и поведение | Обновлялись ли `ARCHITECTURE.md`/`PRODUCT.md` вместе с кодом? | Сделать doc update частью DoD | Cold-start answers становятся точнее, discovery cost падает citeturn24view0turn42view0turn48view1 |

**План внедрения в существующий репозиторий**

**День 1: минимальный harness**  
Создать `AGENTS.md`, `init.sh`, `feature_list.json`, `claude-progress.md`. Полезность проверить простым экспериментом: новая сессия должна без чата отвечать, что это за repo, как его поднять, как проверить и какая следующая фича. Если файл не помогает ответить на cold-start questions, он не окупается. citeturn15view0turn20view1turn42view0

**Первый тестовый прогон с агентом**  
Дать одну небольшую user-visible фичу, а не open-ended задачу. Снять наблюдения: где агент запнулся — на старте, в scope, в verification или на handoff. Метрика здесь не «сколько строк кода написал», а «дошла ли одна фича до `passing` с evidence». citeturn44view0turn44view1turn45view0

**Фиксация сбоев**  
Каждый повторившийся failure mode маппить на минимальный артефакт: cold-start confusion → progress/handoff; premature done → evidence gate; scope sprawl → feature list/WIP=1; fragile startup → stronger `init.sh`; subjective review → rubric. Не лечить всё добавлением текста в один giant AGENTS. citeturn20view0turn42view1

**Добавление состояния**  
Если сессии больше одной, добавить `session-handoff.md`; если repo часто оставляют в грязном виде — `clean-state-checklist.md`. Полезность проверяется снижением времени на восстановление и уменьшением количества «что здесь вообще происходит?» в следующей сессии. Если handoff никто не читает и он дублирует progress log, упростите или уберите его. citeturn17view1turn17view2turn43view0

**Усиление проверки**  
Когда задача проходит через несколько слоёв, добавить smoke/integration/E2E gates и, при необходимости, evaluator. Полезность — уменьшение ложноположительных `done`. Если отдельный evaluator почти всегда соглашается с исполнителем и не находит новых проблем, можно оставить только rubric и human spot-check. citeturn45view0turn45view1turn22view3turn35view1

**Observability и advanced pack — только по показаниям**  
Если проблема уже не в старте и не в scope, а в runtime diagnosis, тогда добавляйте observability: structured logs, boundary checks, cleanup scanner, benchmark, reliability doc. Если репозиторий многодоменный и минимальный `AGENTS.md` начинает распухать, переходите на advanced pack с router-style entrypoint, quality score, exec plans и policy docs. Если же repo маленький и короткоживущий, такой уровень структуры может стать чистым overhead. citeturn46view0turn32view1turn31view1turn18view1turn48view0turn48view2

## Карманная версия и покрытие источников

**Карманная чек-лист-версия**

**Перед запуском агента**
- Есть `AGENTS.md`/`CLAUDE.md`, `init.sh`, `feature_list.json`, `claude-progress.md`
- `AGENTS.md` короткий и маршрутизирует дальше
- `./init.sh` реально работает
- В `feature_list.json` есть проверяемые behavior + verification + state citeturn15view0turn16view0turn16view2turn16view3

**Перед началом новой фичи**
- Baseline уже зелёный
- Выбрана ровно одна активная фича
- Scope записан так, чтобы его можно было проверить
- Понятно, какой минимум считается `passing` citeturn20view2turn44view0turn44view1

**Перед тем как принять результат**
- Есть runnable evidence, а не только diff
- Прошёл минимум lint/typecheck + smoke/integration/E2E по важности фичи
- Не оставлены нерешённые regressions в соседних путях
- При необходимости результат прошёл external evaluator rubric citeturn45view0turn45view1turn17view3

**Перед окончанием сессии**
- Обновлены `claude-progress.md` и `feature_list.json`
- Зафиксированы блокеры
- Если сессия длинная, написан `session-handoff.md`
- Пройден clean-state checklist
- Следующая сессия может начать с `./init.sh`, а не с ремонта repo citeturn17view0turn17view1turn17view2turn46view1

**Раз в несколько недель**
- Проверить, не превратился ли `AGENTS.md` в giant file
- Удалить/упростить harness-компоненты, которые уже не дают заметной пользы
- Обновить quality/reliability docs, если repo долгоживущий
- Для крупного repo — пересмотреть, не пора ли перейти на advanced pack/router model citeturn42view1turn18view1turn48view0turn46view1