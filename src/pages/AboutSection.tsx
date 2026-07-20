import { useEffect, useId, useRef, useState } from "react";

import businessAnalystFigure from "../assets/about-me/business-analyst.webp";
import cadetFigure from "../assets/about-me/cadet.webp";
import coderFigure from "../assets/about-me/coder.webp";
import eventHostFigure from "../assets/about-me/event-host.webp";
import negotiatorFigure from "../assets/about-me/negotiator.webp";
import productManagerFigure from "../assets/about-me/product-manager.webp";
import projectManagerFigure from "../assets/about-me/project-manager.webp";
import staffFigure from "../assets/about-me/staff.webp";
import { MotionHeading } from "./PageMotion";
import styles from "./Page.module.css";
import { motionReveal } from "./usePageMotion";

type AboutHighlight = {
  id: string;
  label: string;
  image: string;
  imageAlt: string;
};

const AUTO_CYCLE_MS = 5_000;

const aboutHighlights: readonly AboutHighlight[] = [
  {
    id: "task-and-product",
    label: "понять задачу и продукт",
    image: productManagerFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с планшетом в образе продуктового менеджера",
  },
  {
    id: "work-plan",
    label: "выстроить план работы",
    image: projectManagerFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с ноутбуком в образе проектного менеджера",
  },
  {
    id: "requirements",
    label: "разобрать требования",
    image: businessAnalystFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с лупой в образе бизнес-аналитика",
  },
  {
    id: "development",
    label: "погрузиться в разработку",
    image: coderFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с ноутбуком и стаканом в образе разработчика",
  },
  {
    id: "communication",
    label: "переговоры и коммуникацию",
    image: negotiatorFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с телефоном и портфелем в образе переговорщика",
  },
  {
    id: "teamwork",
    label: "организовать командную работу",
    image: staffFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с гарнитурой и бейджем организатора команды",
  },
  {
    id: "events",
    label: "вести мероприятия",
    image: eventHostFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла с микрофоном в образе ведущего мероприятий",
  },
  {
    id: "platoon-leadership",
    label: "старшиной взвода",
    image: cadetFigure,
    imageAlt: "Стилизованная конструкторная фигурка Кирилла в кадетской форме",
  },
] as const;

export function AboutSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycleRevision, setCycleRevision] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible",
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPointerPaused, setIsPointerPaused] = useState(false);
  const [isKeyboardPaused, setIsKeyboardPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pointerModalityRef = useRef(false);
  const idPrefix = useId();
  const activeHighlight = aboutHighlights[activeIndex];

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || typeof IntersectionObserver === "undefined") {
      setIsSectionVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting && entry.intersectionRatio >= 0.15);
      },
      { threshold: [0, 0.15] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handlePointerDown = () => {
      pointerModalityRef.current = true;
    };
    const handleKeyDown = () => {
      pointerModalityRef.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  useEffect(() => {
    if (
      !isSectionVisible ||
      !isDocumentVisible ||
      prefersReducedMotion ||
      isPointerPaused ||
      isKeyboardPaused
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % aboutHighlights.length);
    }, AUTO_CYCLE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeIndex,
    cycleRevision,
    isDocumentVisible,
    isKeyboardPaused,
    isPointerPaused,
    isSectionVisible,
    prefersReducedMotion,
  ]);

  const selectHighlight = (index: number) => {
    setActiveIndex(index);
    setCycleRevision((revision) => revision + 1);
  };

  const renderHighlight = (index: number) => {
    const highlight = aboutHighlights[index];

    return (
      <button
        className={styles.aboutHighlight}
        key={highlight.id}
        type="button"
        aria-controls={`${idPrefix}-visual`}
        aria-pressed={activeIndex === index}
        onClick={() => selectHighlight(index)}
        onFocus={() => {
          selectHighlight(index);
          if (!pointerModalityRef.current) {
            setIsKeyboardPaused(true);
          }
        }}
        onBlur={() => setIsKeyboardPaused(false)}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            setIsPointerPaused(true);
            selectHighlight(index);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            setIsPointerPaused(false);
          }
        }}
      >
        {highlight.label}
      </button>
    );
  };

  return (
    <section
      id="about"
      className={styles.aboutSection}
      ref={sectionRef}
      aria-labelledby={`${idPrefix}-title`}
    >
      <div className={styles.aboutInner}>
        <header className={styles.aboutIntro}>
          <p className={styles.aboutEyebrow} {...motionReveal("content")}>
            <span>02</span> / ОБО МНЕ
          </p>
          <MotionHeading
            id={`${idPrefix}-title`}
            label="Мне тесно в рамках одной роли"
            segments={[
              { text: "Мне тесно" },
              { text: "в рамках" },
              { text: "одной роли", accent: true },
            ]}
          />
        </header>

        <div
          className={styles.aboutVisual}
          id={`${idPrefix}-visual`}
          role="group"
          aria-label={`Активный образ: ${activeHighlight.label}`}
          {...motionReveal("content", 1)}
        >
          <div className={styles.aboutGlow} aria-hidden="true" />
          <div className={styles.aboutVisualContent} key={activeHighlight.id}>
            <img
              className={styles.aboutFigure}
              src={activeHighlight.image}
              alt={activeHighlight.imageAlt}
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className={styles.aboutVisualLabel}>{activeHighlight.label}</span>
        </div>

        <div className={styles.aboutCopy} {...motionReveal("content", 2)}>
          <p className={styles.aboutInteractionHint}>Нажмите на выделенную фразу, чтобы сменить образ.</p>
          <p>
            Мне нравится собирать проекты так, чтобы каждая деталь работала на общий результат. Где-то нужно{" "}
            {renderHighlight(0)}, где-то — {renderHighlight(1)}, где-то — {renderHighlight(2)}, а иногда и самому{" "}
            {renderHighlight(3)}. Мне интересно быть на стыке разных ролей и соединять их в одно работающее решение.
          </p>
          <p>
            Такой же подход у меня и к работе с людьми: я развиваю {renderHighlight(4)}, умею{" "}
            {renderHighlight(5)} и люблю {renderHighlight(6)}, когда нужно собрать внимание зала и держать темп. А
            фундаментом для дисциплины, ответственности и лидерства стало кадетское прошлое, где я был{" "}
            {renderHighlight(7)}.
          </p>
        </div>
      </div>
    </section>
  );
}
