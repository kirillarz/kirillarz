import { useEffect, useLayoutEffect, useRef, useState } from "react";

import canbanImage from "../assets/canban-cutout.webp";
import communicationImage from "../assets/communication-cutout.webp";
import developmentImage from "../assets/development-cutout.webp";
import { MotionHeading } from "./PageMotion";
import styles from "./Page.module.css";
import { motionReveal } from "./usePageMotion";

type SkillIconName =
  | "analytics"
  | "api"
  | "branch"
  | "calendar"
  | "checklist"
  | "code"
  | "container"
  | "database"
  | "layers"
  | "lightning"
  | "negotiation"
  | "presentation"
  | "shield"
  | "target"
  | "task"
  | "team"
  | "user-message"
  | "workflow";

type Skill = {
  label: string;
  icon: SkillIconName;
};

type SkillGroup = {
  id: string;
  title: string;
  tone: "blue" | "yellow" | "red";
  image: string;
  imageAlt: string;
  columns?: 2;
  skills: readonly Skill[];
};

const skillGroups: readonly SkillGroup[] = [
  {
    id: "development",
    title: "Разработка",
    tone: "blue",
    image: developmentImage,
    imageAlt: "Синий конструкторный блок с символом программного кода",
    columns: 2,
    skills: [
      { label: "Python", icon: "code" },
      { label: "PostgreSQL", icon: "database" },
      { label: "FastAPI", icon: "lightning" },
      { label: "Docker", icon: "container" },
      { label: "React", icon: "layers" },
      { label: "Git", icon: "branch" },
      { label: "TypeScript", icon: "code" },
      { label: "REST API", icon: "api" },
    ],
  },
  {
    id: "product-management",
    title: "Продукт и управление",
    tone: "yellow",
    image: canbanImage,
    imageAlt: "Жёлтая конструкторная канбан-доска с синими карточками",
    skills: [
      { label: "Product Management", icon: "target" },
      { label: "Project Management", icon: "checklist" },
      { label: "Управление командой", icon: "team" },
      { label: "Постановка задач", icon: "task" },
      { label: "Аналитика требований", icon: "analytics" },
      { label: "BPMN", icon: "workflow" },
    ],
  },
  {
    id: "communication",
    title: "Коммуникация",
    tone: "red",
    image: communicationImage,
    imageAlt: "Красное и белое конструкторные облака диалога с микрофоном",
    skills: [
      { label: "Переговоры", icon: "negotiation" },
      { label: "Взаимодействие с заказчиком", icon: "user-message" },
      { label: "Презентации", icon: "presentation" },
      { label: "Защита проектов", icon: "shield" },
      { label: "Организация мероприятий", icon: "calendar" },
    ],
  },
] as const;

const toneClasses = {
  blue: styles.skillCardBlue,
  yellow: styles.skillCardYellow,
  red: styles.skillCardRed,
} as const;

function SkillIcon({ name }: { name: SkillIconName }) {
  const commonProps = {
    className: styles.skillIcon,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
  };

  switch (name) {
    case "analytics":
      return (
        <svg {...commonProps}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4.5 4.5M8 11l1.7-1.8 1.6 1.3 2.2-2.4" />
        </svg>
      );
    case "api":
      return (
        <svg {...commonProps}>
          <path d="M7.5 17.5h9a4 4 0 0 0 .6-8 5.7 5.7 0 0 0-10.8 1.3 3.4 3.4 0 0 0 1.2 6.7Z" />
          <path d="m10 10-2 2 2 2m4-4 2 2-2 2" />
        </svg>
      );
    case "branch":
      return (
        <svg {...commonProps}>
          <circle cx="6" cy="5" r="2" />
          <circle cx="18" cy="7" r="2" />
          <circle cx="6" cy="19" r="2" />
          <path d="M6 7v10m2-7h4a6 6 0 0 0 4.3-1.8" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
        </svg>
      );
    case "checklist":
      return (
        <svg {...commonProps}>
          <path d="m4 6 1.5 1.5L8 5M11 6h9M4 12l1.5 1.5L8 11M11 12h9M4 18l1.5 1.5L8 17M11 18h9" />
        </svg>
      );
    case "code":
      return (
        <svg {...commonProps}>
          <path d="m9 6-5 6 5 6M15 6l5 6-5 6M13.5 4l-3 16" />
        </svg>
      );
    case "container":
      return (
        <svg {...commonProps}>
          <path d="m4 8 8-4 8 4v8l-8 4-8-4V8Z" />
          <path d="m4 8 8 4 8-4M12 12v8M8 6l8 4" />
        </svg>
      );
    case "database":
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
          <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
        </svg>
      );
    case "layers":
      return (
        <svg {...commonProps}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
        </svg>
      );
    case "lightning":
      return (
        <svg {...commonProps}>
          <path d="M13.5 2.5 5.5 14H11l-.5 7.5 8-12H13l.5-7Z" />
        </svg>
      );
    case "negotiation":
      return (
        <svg {...commonProps}>
          <path d="m4 8 4-3 4 3-3 3 3 3 3-3-3-3 4-3 4 3" />
          <path d="m4 8-2 3 5 6 3-2m10-7 2 3-5 6-3-2M8 17l2 2 2-2 2 2 3-2" />
        </svg>
      );
    case "presentation":
      return (
        <svg {...commonProps}>
          <path d="M4 4h16v12H4zM8 20l4-4 4 4" />
          <path d="m8 12 2-2 2 1 4-4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...commonProps}>
          <path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.6 7.5 9.5 4.4-1.9 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="M12 7v10M8 12h8" />
        </svg>
      );
    case "target":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "task":
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2.5" />
          <path d="m8 12 2.5 2.5L16.5 8" />
        </svg>
      );
    case "team":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3" />
          <circle cx="5.5" cy="10" r="2" />
          <circle cx="18.5" cy="10" r="2" />
          <path d="M6.5 19v-1.5a5.5 5.5 0 0 1 11 0V19M2.5 18v-1a3 3 0 0 1 3-3h1M21.5 18v-1a3 3 0 0 0-3-3h-1" />
        </svg>
      );
    case "user-message":
      return (
        <svg {...commonProps}>
          <circle cx="8" cy="8" r="3" />
          <path d="M2.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M14 5h7v8h-3l-2.5 2v-2H14V5Z" />
        </svg>
      );
    case "workflow":
      return (
        <svg {...commonProps}>
          <circle cx="5" cy="12" r="2.5" />
          <circle cx="19" cy="6" r="2.5" />
          <circle cx="19" cy="18" r="2.5" />
          <path d="M7.5 12H11c4 0 3.5-6 5.5-6M11 12c4 0 3.5 6 5.5 6" />
        </svg>
      );
  }
}

export function SkillsSection() {
  const [activeGroupId, setActiveGroupId] = useState(skillGroups[0].id);
  const [isMobileAccordion, setIsMobileAccordion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches,
  );
  const cardElementsRef = useRef(new Map<string, HTMLElement>());
  const previousCardTopsRef = useRef<Map<string, number> | null>(null);
  const cardAnimationsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = () => setIsMobileAccordion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(
    () => () => {
      cardAnimationsRef.current.forEach((animation) => animation.cancel());
    },
    [],
  );

  useLayoutEffect(() => {
    const previousCardTops = previousCardTopsRef.current;
    previousCardTopsRef.current = null;
    if (!previousCardTops) return;

    cardAnimationsRef.current.forEach((animation) => animation.cancel());
    cardAnimationsRef.current = [];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    cardElementsRef.current.forEach((element, id) => {
      const previousTop = previousCardTops.get(id);
      if (previousTop === undefined || typeof element.animate !== "function") return;

      const offsetY = previousTop - element.getBoundingClientRect().top;
      if (Math.abs(offsetY) < 0.5) return;

      const animation = element.animate(
        [{ transform: `translate3d(0, ${offsetY}px, 0)` }, { transform: "translate3d(0, 0, 0)" }],
        {
          duration: 300,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
      cardAnimationsRef.current.push(animation);
    });
  }, [activeGroupId]);

  const selectGroup = (groupId: string) => {
    if (groupId === activeGroupId) return;

    previousCardTopsRef.current = new Map(
      Array.from(cardElementsRef.current, ([id, element]) => [id, element.getBoundingClientRect().top]),
    );
    setActiveGroupId(groupId);
  };

  return (
    <section id="skills" className={styles.skillsSection} aria-labelledby="skills-title">
      <div className={styles.skillsInner}>
        <header className={styles.skillsIntro}>
          <p className={styles.skillsEyebrow} {...motionReveal("content")}>
            <span>03</span> / НАВЫКИ
          </p>
          <MotionHeading
            id="skills-title"
            label="Навыки, которые помогают превращать идеи в продукты"
            segments={[
              { text: "Навыки, которые помогают" },
              { text: "превращать идеи в", breakBefore: true, breakClassName: styles.desktopBreak },
              { text: "продукты", accent: true },
            ]}
          />
          <p className={styles.skillsLead} {...motionReveal("content", 1)}>
            Совмещаю разработку, управление и коммуникацию,
            <br className={styles.desktopBreak} /> чтобы создавать работающие решения.
          </p>
        </header>

        <div className={styles.skillsGrid}>
          {skillGroups.map((group, index) => (
            <article
              className={`${styles.skillCard} ${toneClasses[group.tone]} ${
                activeGroupId === group.id ? styles.skillCardExpanded : ""
              }`}
              key={group.id}
              ref={(element) => {
                if (element) {
                  cardElementsRef.current.set(group.id, element);
                } else {
                  cardElementsRef.current.delete(group.id);
                }
              }}
              aria-labelledby={`${group.id}-title`}
              {...motionReveal("card", index)}
            >
              <div className={styles.skillCardImageWrap}>
                <img
                  className={styles.skillCardImage}
                  src={group.image}
                  alt={group.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h3 id={`${group.id}-title`}>{group.title}</h3>

              <button
                className={styles.skillAccordionButton}
                type="button"
                aria-expanded={activeGroupId === group.id}
                aria-controls={`${group.id}-skills`}
                onClick={() => selectGroup(group.id)}
              >
                <span>{group.title}</span>
                <span className={styles.skillAccordionIcon} aria-hidden="true" />
              </button>

              <div
                className={styles.skillListPanel}
                id={`${group.id}-skills`}
                aria-hidden={isMobileAccordion ? activeGroupId !== group.id : undefined}
              >
                <ul
                  className={`${styles.skillList} ${group.columns === 2 ? styles.skillListTwoColumns : ""}`}
                >
                  {group.skills.map((skill) => (
                    <li key={skill.label}>
                      <SkillIcon name={skill.icon} />
                      <span>{skill.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
