export type LinkState =
  | {
      label: string;
      href: string;
      status: "available";
    }
  | {
      label: string;
      status: "pending";
      note: string;
    };

export type Project = {
  title: string;
  summary: string;
  role: string;
  tags: string[];
  links: LinkState[];
};

export const profile = {
  name: "Кирилл Арзамасцев",
  heroRole: "Начинающий product manager и разработчик",
  employerRole: "Начинающий product manager с технической базой",
  headline: "Собираю AI-продукты, команды и работающие решения.",
  shortDescription:
    "Кирилл Арзамасцев — студент, который совмещает разработку, управление и организацию. Умеет превращать идеи в работающие проекты, координировать команду, общаться с заказчиком и защищать результат.",
  employerSummary:
    "Развиваюсь в product management и технических продуктовых ролях. Умею работать с командой, понимать разработку, собирать прототипы, общаться с заказчиком и защищать результат.",
  directions: [
    "Product Manager",
    "Project Manager",
    "Backend Developer",
    "Business Analyst",
  ],
};

export const contacts = {
  github: {
    label: "Открыть GitHub",
    href: "https://github.com/nickname123456",
  },
  telegram: {
    label: "Написать в Telegram",
    href: "https://t.me/kirillarz",
  },
  resume: {
    label: "Скачать резюме",
    status: "pending" as const,
    note: "Резюме будет добавлено после загрузки PDF.",
  },
};

export const projects: Project[] = [
  {
    title:
      "AI-агент для подбора помещений для размещения банка под заявленные требования",
    summary:
      "AI-агент помогает подбирать помещения для размещения банка под заданные требования: ищет и анализирует объявления, сравнивает варианты, показывает объекты на карте и формирует отчёт для принятия решения.",
    role: "Product / Project Manager и Frontend-разработчик",
    tags: ["PM + Frontend", "Сбер", "6 человек", "99/100", "React", "FastAPI"],
    links: [
      {
        label: "Открыть GitHub",
        status: "pending",
        note: "Репозиторий будет добавлен позже.",
      },
      {
        label: "Смотреть демо",
        status: "pending",
        note: "Видео-демо будет добавлено позже.",
      },
      {
        label: "Открыть презентацию",
        status: "pending",
        note: "Презентация будет добавлена позже.",
      },
    ],
  },
  {
    title: "BotNetSchool",
    summary:
      "Мультиплатформенный бот для электронного дневника в Telegram и VK: расписание, домашние задания, оценки, успеваемость и объявления.",
    role: "Разработчик полного цикла",
    tags: ["Telegram + VK", "Python", "MongoDB", "SQLAlchemy", "Парсинг"],
    links: [
      {
        label: "Открыть GitHub",
        status: "pending",
        note: "Репозиторий будет добавлен позже.",
      },
    ],
  },
  {
    title: "PM Simulator",
    summary:
      "2D top-down игра на pygame, в которой игрок управляет IT-стартапом перед релизом: назначает задачи, помогает сотрудникам, решает кризисы и балансирует ресурсы команды.",
    role: "Автор идеи, геймдизайнер и разработчик",
    tags: ["MVP", "Python", "pygame", "Экзаменационный проект"],
    links: [
      {
        label: "Открыть GitHub",
        status: "pending",
        note: "Репозиторий будет добавлен позже.",
      },
      {
        label: "Смотреть видео",
        status: "pending",
        note: "Видео будет добавлено позже.",
      },
    ],
  },
];

export const skillGroups = [
  {
    title: "Разработка",
    items: ["Python", "FastAPI", "React", "TypeScript", "SQL", "Docker"],
  },
  {
    title: "Продукт и управление",
    items: [
      "Product management",
      "Project management",
      "Постановка задач",
      "Аналитика требований",
      "BPMN",
    ],
  },
  {
    title: "Коммуникация и организация",
    items: [
      "Переговоры",
      "Управленческие поединки",
      "Организация мероприятий",
      "Координация командной работы",
    ],
  },
];
