import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import aiAgentAdminMetrics from "../assets/screens/ai-agent-search-premises/admin-metrics.webp";
import aiAgentDemo from "../assets/screens/ai-agent-search-premises/demo-search-premises.mp4";
import aiAgentEmailComposer from "../assets/screens/ai-agent-search-premises/email-composer.webp";
import aiAgentLoginScreen from "../assets/screens/ai-agent-search-premises/login-screen.webp";
import aiAgentMap from "../assets/screens/ai-agent-search-premises/map.webp";
import aiAgentPresentation from "../assets/screens/ai-agent-search-premises/name-later-presentation.pdf";
import aiAgentSearchResults from "../assets/screens/ai-agent-search-premises/search-results.webp";
import botNetSchoolMainMenu from "../assets/screens/botnetschool/main-menu.webp";
import botNetSchoolReports from "../assets/screens/botnetschool/reports.webp";
import botNetSchoolSchedule from "../assets/screens/botnetschool/schedule-and-homework.webp";
import pmSimulatorDemo from "../assets/screens/pm-simulator/demo-pm-simulator.mp4";
import pmSimulatorPoster from "../assets/screens/pm-simulator/poster.webp";
import { MotionHeading } from "./PageMotion";
import styles from "./Page.module.css";
import { motionReveal } from "./usePageMotion";

type ProjectFactIcon = "briefcase" | "people" | "platform" | "result" | "status" | "user";
type ProjectActionIcon = "external" | "file";

type ProjectSlide =
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

type ProjectAction = {
  label: string;
  icon: ProjectActionIcon;
  href: string;
};

type Project = {
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

const projects: readonly Project[] = [
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

function ProjectFactIconView({ name }: { name: ProjectFactIcon }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "briefcase":
      return (
        <svg {...commonProps}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
        </svg>
      );
    case "people":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.5a3 3 0 0 1 0 5M17 14a5 5 0 0 1 4 4.9V20" />
        </svg>
      );
    case "platform":
      return (
        <svg {...commonProps}>
          <path d="M4 5h16v11H4zM8 20h8M12 16v4" />
          <path d="m8 10 2.2 2L16 7" />
        </svg>
      );
    case "result":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2M9 2h6M12 5V2M18 6l1.5-1.5" />
        </svg>
      );
    case "status":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.6 2.6L16.5 9" />
        </svg>
      );
    case "user":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="7" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
  }
}

function ProjectActionIconView({ name }: { name: ProjectActionIcon }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "external":
      return (
        <svg {...commonProps}>
          <path d="M14 5h5v5M19 5l-8 8" />
          <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      );
    case "file":
      return (
        <svg {...commonProps}>
          <path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6" />
        </svg>
      );
  }
}

function ProjectCarousel({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const slideCount = project.slides.length;

  const showSlide = (index: number) => {
    setActiveIndex((index + slideCount) % slideCount);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (slideCount <= 1 || (event.target as HTMLElement).closest("video")) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeIndex + 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    if ((event.target as HTMLElement).closest("button, a, video")) return;
    pointerStart.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;

    const distance = event.clientX - start.x;
    if (Math.abs(distance) < 48) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  };

  const activeSlide = project.slides[activeIndex];

  return (
    <div
      className={styles.projectCarousel}
      role="group"
      aria-roledescription="карусель"
      aria-label={`Материалы проекта «${project.title}»`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
    >
      <div className={styles.projectMediaFrame}>
        <div className={styles.projectSlide} aria-live="polite">
          {activeSlide.kind === "image" ? (
            <img
              className={styles.projectScreenshot}
              src={activeSlide.src}
              alt={activeSlide.alt}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <video
              className={styles.projectVideo}
              src={activeSlide.src}
              poster={activeSlide.poster}
              aria-label={activeSlide.label}
              controls
              preload="none"
              playsInline
            />
          )}
        </div>

        {slideCount > 1 ? (
          <>
            <button
              className={`${styles.projectCarouselArrow} ${styles.projectCarouselArrowPrevious}`}
              type="button"
              aria-label={`Предыдущий слайд проекта «${project.title}»`}
              onClick={() => showSlide(activeIndex - 1)}
            >
              ←
            </button>
            <button
              className={`${styles.projectCarouselArrow} ${styles.projectCarouselArrowNext}`}
              type="button"
              aria-label={`Следующий слайд проекта «${project.title}»`}
              onClick={() => showSlide(activeIndex + 1)}
            >
              →
            </button>
          </>
        ) : null}

        {slideCount > 1 ? (
          <span className={styles.projectSlideCount} aria-hidden="true">
            {String(activeIndex + 1).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {slideCount > 1 ? (
        <div className={styles.projectCarouselDots} aria-label={`Выбор слайда проекта «${project.title}»`}>
          {project.slides.map((slide, index) => (
            <button
              className={styles.projectCarouselDot}
              type="button"
              aria-label={`Показать слайд ${index + 1}: ${slide.kind === "image" ? slide.alt : slide.label}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => showSlide(index)}
              key={slide.kind === "image" ? slide.alt : slide.label}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProjectActions({ actions }: { actions: readonly ProjectAction[] }) {
  return (
    <div className={styles.projectActions}>
      {actions.map((action, index) => {
        return (
          <a
            className={`${styles.projectAction} ${index === 0 ? styles.projectActionPrimary : ""}`}
            href={action.href}
            target="_blank"
            rel="noreferrer"
            key={action.label}
          >
            <ProjectActionIconView name={action.icon} />
            <span>{action.label}</span>
            <span aria-hidden="true">→</span>
          </a>
        );
      })}
    </div>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" className={styles.projectsSection} aria-labelledby="projects-title">
      <div className={styles.projectsInner}>
        <header className={styles.projectsIntro}>
          <p className={styles.projectsEyebrow} {...motionReveal("content")}>
            <span>04</span> / ПРОЕКТЫ
          </p>
          <MotionHeading
            id="projects-title"
            label="Проекты, которыми я особенно горжусь"
            segments={[
              { text: "Проекты, которыми" },
              { text: "я особенно горжусь" },
            ]}
          />
          <p {...motionReveal("content", 1)}>
            Разработка, координация команды и продуктовый подход
            <br className={styles.desktopBreak} /> в работающих учебных и командных кейсах.
          </p>
        </header>

        <div className={styles.projectsList}>
          {projects.map((project, index) => (
            <article
              className={`${styles.projectCard} ${index % 2 === 1 ? styles.projectCardReversed : ""}`}
              aria-labelledby={`${project.id}-title`}
              key={project.id}
              {...motionReveal("card", index)}
            >
              <ProjectCarousel project={project} />

              <div className={styles.projectContent}>
                <div className={styles.projectHeading}>
                  <p className={styles.projectCategory}>
                    {project.number} / {project.category}
                  </p>
                  <h3 id={`${project.id}-title`}>{project.title}</h3>
                  <p className={styles.projectDescription}>{project.description}</p>
                </div>

                <div className={styles.projectDetails}>
                  <dl className={styles.projectFacts}>
                    {project.facts.map((fact) => (
                      <div key={fact.label}>
                        <ProjectFactIconView name={fact.icon} />
                        <dt>{fact.label}:</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className={styles.projectTechnologies} aria-label={`Технологии проекта «${project.title}»`}>
                    {project.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>

                  <ProjectActions actions={project.actions} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
