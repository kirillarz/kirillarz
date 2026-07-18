import { useId, useRef, useState } from "react";

import productManagerFigure from "../assets/product-manager-with-tablet.png";
import styles from "./Page.module.css";

type Role = {
  id: string;
  label: string;
  paragraphs: readonly [string, string];
};

const aboutFigureAlt = "Стилизованная конструкторная фигурка Кирилла с планшетом";

const roles: readonly Role[] = [
  {
    id: "product-manager",
    label: "Product Manager",
    paragraphs: [
      "Мне интересно создавать продукты на стыке разработки, управления и AI-интеграций. Я участвую в проработке продукта, помогаю команде двигаться к результату и превращать идеи в работающие проекты.",
      "Ближе всего мне product management. При этом я сохраняю техническую базу, чтобы понимать разработку, собирать прототипы и участвовать в создании решения не только со стороны организации.",
    ],
  },
  {
    id: "project-manager",
    label: "Project Manager",
    paragraphs: [
      "В проектной работе я координирую команду, распределяю задачи и помогаю участникам сохранять фокус на результате. Такой опыт получил в том числе в проекте команды из шести человек.",
      "Общаюсь с заказчиком, готовлю презентации и защищаю решения. Мне близки проекты, где организация работы сочетается с пониманием продукта и технических задач.",
    ],
  },
  {
    id: "backend-developer",
    label: "Backend Developer",
    paragraphs: [
      "Я хочу сохранять техническую базу: понимаю разработку, работаю с backend- и frontend-инструментами, умею собирать прототипы и превращать идеи в работающие проекты.",
      "В разработке использую Python, FastAPI, SQL, PostgreSQL, Docker и REST API. Технические задачи для меня — часть общего пути от идеи до работающего решения.",
    ],
  },
  {
    id: "business-analyst",
    label: "Business Analyst",
    paragraphs: [
      "Мне интересны аналитика требований и BPMN. В проектах я участвую в проработке продукта, общаюсь с заказчиком и помогаю объяснять идеи и принятые решения.",
      "Совмещаю аналитический взгляд с технической базой: понимаю backend- и frontend-разработку, работаю с SQL и участвую в создании прототипов.",
    ],
  },
] as const;

export function AboutSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idPrefix = useId();
  const activeRole = roles[activeIndex];

  const selectRole = (index: number, moveFocus = false) => {
    setActiveIndex(index);
    if (moveFocus) {
      tabRefs.current[index]?.focus();
    }
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % roles.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + roles.length) % roles.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = roles.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectRole(nextIndex, true);
    }
  };

  return (
    <section id="about" className={styles.aboutSection} aria-labelledby={`${idPrefix}-title`}>
      <div className={styles.aboutInner}>
        <header className={styles.aboutIntro}>
          <p className={styles.aboutEyebrow}>
            <span>02</span> / ОБО МНЕ
          </p>
          <h2 id={`${idPrefix}-title`}>
            Создаю продукты
            <br />
            на стыке <span>технологий</span>
            <br />
            и <span>управления</span>
          </h2>
        </header>

        <div className={styles.aboutVisual}>
          <div className={styles.aboutGlow} aria-hidden="true" />
          <img
            className={styles.aboutFigure}
            src={productManagerFigure}
            alt={aboutFigureAlt}
          />
        </div>

        <div
          className={styles.aboutCopy}
          id={`${idPrefix}-panel`}
          key={`${activeRole.id}-copy`}
          role="tabpanel"
          aria-labelledby={`${idPrefix}-${activeRole.id}-tab`}
          tabIndex={0}
        >
          {activeRole.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.aboutControls}>
          <div className={styles.roleTabsScroller}>
            <div className={styles.roleTabs} role="tablist" aria-label="Роль Кирилла">
              {roles.map((role, index) => (
                <button
                  className={styles.roleTab}
                  id={`${idPrefix}-${role.id}-tab`}
                  key={role.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  aria-controls={`${idPrefix}-panel`}
                  aria-selected={activeIndex === index}
                  tabIndex={activeIndex === index ? 0 : -1}
                  onClick={() => selectRole(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <p className={styles.roleCount} aria-live="polite" aria-atomic="true">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span> / {String(roles.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
