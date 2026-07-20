# Личный сайт-портфолио Кирилла Арзамасцева

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-CB3837?logo=npm\&logoColor=white)](https://www.npmjs.com/)


---

## О проекте

Это мой личный сайт-визитка и портфолио. Он создан, чтобы в одном месте рассказать обо мне, показать проекты, опыт работы в команде и интерес к разработке, продуктам и управлению.

Проект также нужен мне как практический кейс: от проектирования интерфейса и работы с анимациями до подготовки качественного статического frontend-приложения с автоматической публикацией.

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
* `AGENTS.md` — короткие рабочие правила для Codex;
* `CURRENT.md` — актуальная задача, блокер, следующий шаг и последняя проверка.

### Качество кода

* **TypeScript** — проверка типов;
* **ESLint** — проверка качества кода;
* **Vitest** — быстрые unit/smoke-тесты для стабильных контрактов приложения;
* **Playwright** — локальная визуальная диагностика страниц и интерактивных сценариев во время UI-разработки.

### Развёртывание

* **GitHub Actions** — автоматические проверки качества и production-сборка;
* **GitHub Pages** — автоматическая публикация изменений из ветки `main`;
* **Production URL** — [https://kirillarz.ru/](https://kirillarz.ru/).
* **Production base path** — `/`, поскольку сайт публикуется на собственном домене.
* **Метаданные** — `/favicon.png` и `/og/kirill-arzamastsev.jpg`.

---

## Локальный запуск

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/kirillarz/kirillarz.git
cd kirillarz
```

### 2. Установите зависимости

Проект закреплён на Node.js 24 и npm 11. Для чистой установки по lockfile используйте:

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

# Сборка артефакта для GitHub Pages
npm run pages:build

# Локальный просмотр production-сборки
npm run preview

# Проверка кода
npm run lint

# Проверка TypeScript
npm run typecheck

# Запуск тестов
npm run test

# Полная проверка проекта
npm run check

# Предрелизная проверка, включая готовность GitHub Pages-артефакта
npm run release:check

# Скриншоты главной страницы для visual smoke-проверки
npm run visual:smoke
```

`visual:smoke` сам запускает Vite на свободном локальном порту и гарантированно
останавливает сервер после Playwright-тестов. Предварительно запускать
`npm run dev` не нужно. Лимит одного Playwright-теста составляет 15 секунд,
всего набора — 110 секунд; runner начинает аварийную остановку через 120 секунд,
а его абсолютный лимит — 140 секунд.

Playwright используется локально ИИ-агентом для визуальной диагностики при
изменениях UI/CSS и не является обязательной CI-проверкой. В GitHub Actions
запускаются только `lint`, `typecheck`, Vitest и production-сборка.

`npm run release:check` повторяет штатные проверки, подготавливает Pages-файлы
`/employer/index.html` и `404.html`, затем проверяет структуру артефакта,
favicon, Open Graph image и production asset URL. Deployment workflow выполняет
эту сборку один раз и публикует `dist` из ветки `main`. В `Settings → Pages`
источником должен быть выбран `GitHub Actions`; base path всегда равен `/`.
Файл `CNAME` при публикации через Actions не требуется.
Скриншоты visual smoke-проверки сохраняются в
`artifacts/visual-smoke/home-desktop.png` и
`artifacts/visual-smoke/home-mobile.png`; папка очищается перед каждым прогоном,
а агент может открыть кадры через `view_image`.

---

## Структура проекта

```text
.
├── .github/workflows/        # Проверки и deployment в GitHub Pages
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
