import { useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from "react";

import hobbyMap from "../assets/hobby_map.png";
import styles from "./Page.module.css";

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
  const lastPointerType = useRef("");

  const handleClick = (event: MouseEvent<HTMLButtonElement>, hobbyId: string) => {
    if (lastPointerType.current === "touch" || lastPointerType.current === "pen") {
      setActiveHobbyId((currentId) => (currentId === hobbyId ? null : hobbyId));
      return;
    }

    setActiveHobbyId(hobbyId);
    event.currentTarget.focus();
  };

  return (
    <section className={styles.hobbySection} aria-labelledby="hobby-title">
      <div className={styles.hobbyInner}>
        <header className={styles.hobbyIntro}>
          <p className={styles.hobbyEyebrow}>
            <span>05</span> / ХОББИ
          </p>
          <h2 id="hobby-title">
            Не только кодом
            <br />
            <span>и проектами</span>
          </h2>
          <p>Рыбалка, плавание, путешествия, горные лыжи и ведение мероприятий.</p>
        </header>

        <div
          className={styles.hobbyStageViewport}
          role="group"
          aria-label="Интерактивная карта хобби"
        >
          <div className={styles.hobbyStage}>
            <img
              className={styles.hobbyMap}
              src={hobbyMap}
              alt="Конструкторная карта с горами, озером, сценой, аэропортом и бассейном"
              loading="lazy"
              decoding="async"
            />

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
                    onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
                      lastPointerType.current = event.pointerType;
                    }}
                    onClick={(event) => handleClick(event, hobby.id)}
                    onKeyDown={(event) => {
                      lastPointerType.current = "keyboard";

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

        <p className={styles.hobbyScrollHint}>Проведите по карте, чтобы увидеть все хобби</p>
      </div>
    </section>
  );
}
