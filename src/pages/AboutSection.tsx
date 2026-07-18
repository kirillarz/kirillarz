import { useEffect, useId, useRef, useState } from "react";

import productManagerFigure from "../assets/product-manager-with-tablet.png";
import styles from "./Page.module.css";

type AboutHighlight = {
  id: string;
  label: string;
  image?: string;
  imageAlt?: string;
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
  },
  {
    id: "requirements",
    label: "разобрать требования",
  },
  {
    id: "development",
    label: "погрузиться в разработку",
  },
  {
    id: "communication",
    label: "переговоры и коммуникацию",
  },
  {
    id: "teamwork",
    label: "организовать командную работу",
  },
  {
    id: "events",
    label: "вести мероприятия",
  },
  {
    id: "platoon-leadership",
    label: "старшиной взвода",
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
          <p className={styles.aboutEyebrow}>
            <span>02</span> / ОБО МНЕ
          </p>
          <h2 id={`${idPrefix}-title`}>
            Мне тесно в рамках <span>одной роли</span>
          </h2>
        </header>

        <div
          className={styles.aboutVisual}
          id={`${idPrefix}-visual`}
          role="group"
          aria-label={`Активный образ: ${activeHighlight.label}`}
        >
          <div className={styles.aboutGlow} aria-hidden="true" />
          <div className={styles.aboutVisualContent} key={activeHighlight.id}>
            {activeHighlight.image && activeHighlight.imageAlt ? (
              <img
                className={styles.aboutFigure}
                src={activeHighlight.image}
                alt={activeHighlight.imageAlt}
              />
            ) : (
              <div className={styles.aboutFigurePlaceholder}>
                <div className={styles.aboutPlaceholderSilhouette} aria-hidden="true" />
                <p>
                  Образ <span>«{activeHighlight.label}»</span>
                  <br />
                  скоро появится
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.aboutCopy}>
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
