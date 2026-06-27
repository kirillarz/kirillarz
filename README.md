# Личный сайт-портфолио Кирилла Арзамасцева

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-CB3837?logo=npm\&logoColor=white)](https://www.npmjs.com/)


---

## О проекте

Это мой личный сайт-визитка и портфолио. Он создан, чтобы в одном месте рассказать обо мне, показать проекты, опыт работы в команде и интерес к разработке, продуктам и управлению.

Проект также нужен мне как практический кейс: от проектирования интерфейса и работы с анимациями до подготовки качественного статического frontend-приложения, которое можно вручную опубликовать на выбранной платформе.

Целевая визуальная концепция первой полноценной версии — конструкторный
Lego-style сайт с минифигурками, интерактивными блоками и hero-анимацией.
Подробный brief лежит в `docs/site-brief.md`, а подтвержденные публичные факты
и формулировки — в `docs/content.md`.

---

## Технологии

### Основной стек

* **Vite** — сборка, dev-сервер и базовая архитектура фронтенд-приложения;
* **React** — компонентный подход к разработке интерфейса;
* **TypeScript** — типизация и надёжность кода;
* **React Router** — маршруты главной страницы и страницы `/employer`;
* **CSS Modules** — компонентные стили;
* **глобальные CSS-файлы** — дизайн-токены, темы, базовая типографика и общие правила.

### Анимации и визуальная часть

* CSS-переходы и keyframes — простые hover-состояния, переключение темы и микро-анимации;
* SVG и CSS-композиции — временные тематические обложки и декоративные элементы;
* финальные изображения и сложные визуальные материалы добавляются только после отдельного согласования.

### Документация проекта

* `docs/content.md` — источник подтвержденных фактов, текстов, ссылок и TODO;
* `docs/site-brief.md` — структура блоков, Lego-style визуальная концепция,
  требования к hero, карте хобби и контактам;
* `examples/hero-screen-desktop.jpg` и `examples/hero-screen-mobile.jpg` —
  визуальные референсы hero-экрана;
* `AGENTS.md`, `feature_list.json`, `progress.md` и `session-handoff.md` —
  harness для Codex-сессий.

### Качество кода

* **TypeScript** — проверка типов;
* **ESLint** — проверка качества кода;
* **Vitest** — быстрые unit/smoke-тесты для стабильных контрактов приложения.

### Развёртывание

* **GitHub Actions** — автоматические проверки качества без деплоя;
* **ручная публикация** — деплой выполняется владельцем проекта после выбора платформы хостинга.

---

## Локальный запуск

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
```

### 2. Установите зависимости

Проект проверяется в CI на Node.js 24. Для чистой установки по lockfile используйте:

```bash
npm ci
```

Для обычной локальной доустановки зависимостей можно использовать `npm install`.

### 3. Запустите проект в режиме разработки

```bash
npm run dev
```

После запуска сайт будет доступен по адресу:

```text
http://localhost:5173
```

### 4. Соберите production-версию

```bash
npm run build
npm run preview
```

---

## Полезные команды

```bash
# Запуск dev-сервера
npm run dev

# Production-сборка
npm run build

# Локальный просмотр production-сборки
npm run preview

# Проверка кода
npm run lint

# Проверка TypeScript
npm run typecheck

# Запуск тестов
npm run test
```

Эти же проверки запускаются в GitHub Actions: `typecheck`, `lint`, `test`, `build`.

---

## Структура проекта

```text
.
├── .github/workflows/ci.yml  # Автоматические проверки GitHub Actions
├── docs/                     # Материалы и черновики контента
├── examples/                 # Визуальные референсы
├── src/
│   ├── pages/                # Страницы приложения
│   ├── styles/               # Глобальные CSS-токены и базовые стили
│   ├── App.tsx               # Подключение React Router
│   ├── main.tsx              # Точка входа React
│   └── routes.tsx            # Контракт маршрутов
├── index.html                # HTML-шаблон Vite
├── package.json              # npm-скрипты и зависимости
├── tsconfig.json             # Конфигурация TypeScript
└── vite.config.ts            # Конфигурация Vite
```
