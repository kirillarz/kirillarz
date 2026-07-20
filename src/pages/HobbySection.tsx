import { useRef, useState, type CSSProperties, type MouseEvent } from "react";

import hobbyMap from "../assets/hobby-map.webp";
import { MotionHeading } from "./PageMotion";
import styles from "./PageStyles";
import { motionReveal } from "./usePageMotion";

type HobbyPlacement = "left" | "right" | "center";

type Hobby = {
  id: string;
  name: string;
  description: string;
  x: number;
  mobileX: number;
  y: number;
  placement: HobbyPlacement;
};

const hobbies: readonly Hobby[] = [
  {
    id: "skiing",
    name: "Горнолыжка",
    description: "Здесь появится короткое описание хобби.",
    x: 31,
    mobileX: 31,
    y: 27,
    placement: "left",
  },
  {
    id: "fishing",
    name: "Рыбалка",
    description: "Здесь появится короткое описание хобби.",
    x: 17,
    mobileX: 17,
    y: 51,
    placement: "left",
  },
  {
    id: "travel",
    name: "Путешествия",
    description: "Здесь появится короткое описание хобби.",
    x: 72,
    mobileX: 72,
    y: 25,
    placement: "right",
  },
  {
    id: "events",
    name: "Мероприятия",
    description: "Здесь появится короткое описание хобби.",
    x: 50,
    mobileX: 50,
    y: 66,
    placement: "center",
  },
  {
    id: "swimming",
    name: "Плавание",
    description: "Здесь появится короткое описание хобби.",
    x: 78,
    mobileX: 76,
    y: 61,
    placement: "right",
  },
] as const;

const placementClasses: Record<HobbyPlacement, string> = {
  left: styles.hobbyHotspotLeft,
  right: styles.hobbyHotspotRight,
  center: styles.hobbyHotspotCenter,
};

export function HobbySection() {
  const [activeHobbyId, setActiveHobbyId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activeHobby = hobbies.find((hobby) => hobby.id === activeHobbyId) ?? null;

  const selectHobby = (hobbyId: string) => {
    const hobby = hobbies.find((item) => item.id === hobbyId);
    const viewport = viewportRef.current;
    const stage = stageRef.current;

    setActiveHobbyId(hobbyId);
    setHasInteracted(true);

    if (!hobby || !viewport || !stage || viewport.scrollWidth <= viewport.clientWidth) return;

    const requestedLeft = stage.offsetLeft + stage.clientWidth * (hobby.mobileX / 100) - viewport.clientWidth / 2;
    const left = Math.max(0, Math.min(requestedLeft, viewport.scrollWidth - viewport.clientWidth));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    viewport.scrollTo({ left, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>, hobbyId: string) => {
    selectHobby(hobbyId);
    event.currentTarget.focus();
  };

  return (
    <section id="hobby" className={styles.hobbySection} aria-labelledby="hobby-title">
      <div className={styles.hobbyInner}>
        <header className={styles.hobbyIntro}>
          <p className={styles.hobbyEyebrow} {...motionReveal("content")}>
            <span>05</span> / ХОББИ
          </p>
          <MotionHeading
            id="hobby-title"
            label="Не только кодом и проектами"
            segments={[
              { text: "Не только кодом" },
              { text: "и проектами", accent: true, breakBefore: true },
            ]}
          />
          <p {...motionReveal("content", 1)}>
            Рыбалка, плавание, путешествия, горные лыжи и ведение мероприятий.
          </p>
        </header>

        <div className={styles.hobbyTabs} aria-label="Выберите хобби" {...motionReveal("content", 2)}>
          {hobbies.map((hobby) => (
            <button
              type="button"
              aria-pressed={activeHobbyId === hobby.id}
              aria-controls="hobby-mobile-description"
              onClick={() => selectHobby(hobby.id)}
              key={hobby.id}
            >
              {hobby.name}
            </button>
          ))}
        </div>

        <div className={styles.hobbyMapShell}>
          <div
            className={styles.hobbyStageViewport}
            role="group"
            aria-label="Интерактивная карта хобби"
            ref={viewportRef}
            {...motionReveal("card")}
            onPointerDown={() => setHasInteracted(true)}
            onScroll={() => setHasInteracted(true)}
          >
            <div className={styles.hobbyStage} ref={stageRef}>
              <img
                className={styles.hobbyMap}
                src={hobbyMap}
                alt="Конструкторная карта с горами, озером, сценой, аэропортом и бассейном"
                loading="lazy"
                decoding="async"
                width="1572"
                height="1001"
              />

              {hobbies.map((hobby) => (
                <span
                  className={styles.hobbySnapPoint}
                  style={{ "--hobby-mobile-x": `${hobby.mobileX}%` } as CSSProperties}
                  aria-hidden="true"
                  key={`${hobby.id}-snap`}
                />
              ))}

              {hobbies.map((hobby) => {
                const isActive = activeHobbyId === hobby.id;
                const panelId = `hobby-${hobby.id}-description`;
                const position = {
                  "--hobby-x": `${hobby.x}%`,
                  "--hobby-mobile-x": `${hobby.mobileX}%`,
                  "--hobby-y": `${hobby.y}%`,
                } as CSSProperties;

                return (
                  <div
                    className={`${styles.hobbyHotspot} ${placementClasses[hobby.placement]} ${
                      isActive ? styles.hobbyHotspotActive : ""
                    }`}
                    style={position}
                    onMouseEnter={() => setActiveHobbyId(hobby.id)}
                    onMouseLeave={() => setActiveHobbyId(null)}
                    onFocusCapture={(event) => {
                      if ((event.target as HTMLElement).matches(":focus-visible")) {
                        setActiveHobbyId(hobby.id);
                      }
                    }}
                    onBlurCapture={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setActiveHobbyId(null);
                      }
                    }}
                    key={hobby.id}
                  >
                    <button
                      className={styles.hobbyHotspotButton}
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={panelId}
                      aria-describedby={isActive ? panelId : undefined}
                      onClick={(event) => handleClick(event, hobby.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setActiveHobbyId(null);
                          event.currentTarget.blur();
                        }
                      }}
                    >
                      <span className={styles.hobbyHotspotDot} aria-hidden="true" />
                      <span className={styles.hobbyHotspotLine} aria-hidden="true" />
                      <span className={styles.hobbyHotspotLabel}>{hobby.name}</span>
                    </button>

                    <span
                      className={styles.hobbyHotspotPanel}
                      id={panelId}
                      role="tooltip"
                      aria-hidden={!isActive}
                    >
                      {hobby.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={styles.hobbyMobilePanel}
          id="hobby-mobile-description"
          aria-live="polite"
        >
          {activeHobby ? (
            <>
              <strong>{activeHobby.name}</strong>
              <p>{activeHobby.description}</p>
            </>
          ) : (
            <p>Выберите хобби на карте или во вкладках.</p>
          )}
        </div>

        {!hasInteracted ? (
          <p className={styles.hobbyScrollHint}>Проведите по карте, чтобы увидеть все хобби</p>
        ) : null}
      </div>
    </section>
  );
}
