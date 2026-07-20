import aiAgentAdminMetrics from "../assets/screens/ai-agent-search-premises/admin-metrics.webp";
import aiAgentDemo from "../assets/screens/ai-agent-search-premises/demo-search-premises.mp4";
import aiAgentEmailComposer from "../assets/screens/ai-agent-search-premises/email-composer.webp";
import aiAgentLoginScreen from "../assets/screens/ai-agent-search-premises/login-screen.webp";
import aiAgentMap from "../assets/screens/ai-agent-search-premises/map.webp";
import aiAgentPresentation from "../assets/screens/ai-agent-search-premises/ai-agent-presentation.pdf";
import aiAgentSearchResults from "../assets/screens/ai-agent-search-premises/search-results.webp";
import botNetSchoolMainMenu from "../assets/screens/botnetschool/main-menu.webp";
import botNetSchoolReports from "../assets/screens/botnetschool/reports.webp";
import botNetSchoolSchedule from "../assets/screens/botnetschool/schedule-and-homework.webp";
import pmSimulatorDemo from "../assets/screens/pm-simulator/demo-pm-simulator.mp4";
import pmSimulatorPoster from "../assets/screens/pm-simulator/poster.webp";

export type ProjectFactIcon = "briefcase" | "people" | "platform" | "result" | "status" | "user";
export type ProjectActionIcon = "external" | "file";

export type ProjectSlide =
  | {
      kind: "image";
      src: string;
      alt: string;
    }
  | {
      kind: "video";
      src: string;
      poster: string;
      label: string;
    };

export type ProjectVideoSlide = Extract<ProjectSlide, { kind: "video" }>;

export type ProjectAction = {
  label: string;
  icon: ProjectActionIcon;
  href: string;
};

export type Project = {
  id: string;
  number: string;
  category: string;
  title: string;
  description: string;
  facts: readonly {
    label: string;
    value: string;
    icon: ProjectFactIcon;
  }[];
  technologies: readonly string[];
  slides: readonly ProjectSlide[];
  actions: readonly ProjectAction[];
};

export const projects: readonly Project[] = [
  {
    id: "ai-agent-search-premises",
    number: "01",
    category: "AI-ПРОДУКТ",
    title: "AI-агент для подбора помещений",
    description:
      "Помогает искать и анализировать объявления, сравнивать варианты, просматривать объекты на карте и формировать итоговый отчёт.",
    facts: [
      { label: "Роль", value: "PM + Frontend", icon: "user" },
      { label: "Заказчик", value: "Сбер", icon: "briefcase" },
      { label: "Команда", value: "6 человек", icon: "people" },
      { label: "Результат", value: "99/100", icon: "result" },
    ],
    technologies: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    slides: [
      {
        kind: "image",
        src: aiAgentLoginScreen,
        alt: "Экран входа в систему подбора помещений",
      },
      {
        kind: "image",
        src: aiAgentSearchResults,
        alt: "Результаты поиска помещений и диалог с AI-агентом",
      },
      {
        kind: "image",
        src: aiAgentMap,
        alt: "Найденные помещения и отделения банков на карте",
      },
      {
        kind: "image",
        src: aiAgentEmailComposer,
        alt: "Редактор письма владельцу выбранного помещения",
      },
      {
        kind: "image",
        src: aiAgentAdminMetrics,
        alt: "Дашборд с метриками работы AI-системы",
      },
      {
        kind: "video",
        src: aiAgentDemo,
        poster: aiAgentSearchResults,
        label: "Видео-демо AI-агента для подбора помещений",
      },
    ],
    actions: [
      { label: "Открыть репозиторий", icon: "external", href: "https://gitverse.ru/name-later-urfu/monorepo" },
      { label: "Открыть презентацию", icon: "file", href: aiAgentPresentation },
    ],
  },
  {
    id: "botnetschool",
    number: "02",
    category: "ЭЛЕКТРОННЫЙ ДНЕВНИК",
    title: "BotNetSchool",
    description:
      "Мультиплатформенный бот для электронного дневника в Telegram и VK: расписание, домашние задания, оценки, успеваемость и объявления.",
    facts: [
      { label: "Роль", value: "Fullstack / Bot Developer", icon: "user" },
      { label: "Формат", value: "Индивидуальный проект", icon: "briefcase" },
      { label: "Платформы", value: "Telegram + VK", icon: "platform" },
      { label: "Статус", value: "Завершён", icon: "status" },
    ],
    technologies: ["Python", "aiogram", "vkbottle", "MongoDB", "SQLAlchemy"],
    slides: [
      {
        kind: "image",
        src: botNetSchoolMainMenu,
        alt: "Главное меню бота электронного дневника во ВКонтакте",
      },
      {
        kind: "image",
        src: botNetSchoolSchedule,
        alt: "Выбор предмета и сообщение бота с расписанием и домашними заданиями",
      },
      {
        kind: "image",
        src: botNetSchoolReports,
        alt: "Меню отчётов, средний балл и итоговые оценки в боте",
      },
    ],
    actions: [
      { label: "Открыть репозиторий", icon: "external", href: "https://github.com/kirillarz/BotNetSchool" },
    ],
  },
  {
    id: "pm-simulator",
    number: "03",
    category: "ИГРОВОЙ ПРОЕКТ",
    title: "PM Simulator",
    description:
      "2D top-down игра, в которой игрок управляет IT-стартапом перед релизом: назначает задачи, решает кризисы и балансирует ресурсы команды.",
    facts: [
      { label: "Роль", value: "Автор идеи и разработчик", icon: "user" },
      { label: "Формат", value: "Индивидуальный экзаменационный проект", icon: "briefcase" },
      { label: "Статус", value: "MVP готов", icon: "status" },
      { label: "Период", value: "2026 год", icon: "result" },
    ],
    technologies: ["Python", "pygame"],
    slides: [
      {
        kind: "video",
        src: pmSimulatorDemo,
        poster: pmSimulatorPoster,
        label: "Игровая сцена PM Simulator с офисом и сотрудниками",
      },
    ],
    actions: [
      { label: "Открыть репозиторий", icon: "external", href: "https://github.com/kirillarz/PM-sumulator" },
    ],
  },
] as const;
