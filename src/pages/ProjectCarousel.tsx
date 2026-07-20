import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";

import styles from "./PageStyles";
import { wrapCarouselIndex } from "./carouselIndex";
import type { Project, ProjectVideoSlide } from "./projectsData";

function ProjectLightboxVideo({ slide }: { slide: ProjectVideoSlide }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      setIsPlaying(false);
    });
  };

  return (
    <div className={styles.projectLightboxVideoShell}>
      <video
        className={styles.projectLightboxVideo}
        src={slide.src}
        poster={slide.poster}
        aria-label={slide.label}
        controls
        playsInline
        preload="metadata"
        ref={videoRef}
        onPlay={(event) => {
          setIsPlaying(true);
          event.currentTarget.focus();
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <span className={styles.projectLightboxVideoBadge}>Видео</span>
      {!isPlaying ? (
        <button
          className={styles.projectLightboxPlayButton}
          type="button"
          aria-label={`Воспроизвести: ${slide.label}`}
          onClick={playVideo}
        >
          <span className={styles.projectLightboxPlayIcon} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

export function ProjectCarousel({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);
  const lightboxTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cardVideoRef = useRef<HTMLVideoElement>(null);
  const slideCount = project.slides.length;

  const showSlide = (index: number) => {
    setActiveIndex(wrapCarouselIndex(index, slideCount));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (slideCount <= 1 || (event.target as HTMLElement).closest('video, [role="dialog"]')) return;

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
  const isLightboxOpen = lightboxIndex !== null;
  const lightboxSlide = lightboxIndex === null ? null : project.slides[lightboxIndex];

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    lightboxTriggerRef.current = trigger;
    if (project.slides[index].kind === "video") {
      cardVideoRef.current?.pause();
    }
    setLightboxIndex(index);
  };

  const showLightboxSlide = (index: number) => {
    setLightboxIndex(wrapCarouselIndex(index, slideCount));
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightboxCloseRef.current?.focus();

    const handleLightboxKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightboxIndex(null);
      } else if (
        (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
        event.target instanceof Element &&
        event.target.closest("video")
      ) {
        return;
      } else if (event.key === "ArrowLeft" && slideCount > 1) {
        event.preventDefault();
        setLightboxIndex((current) =>
          current === null ? current : wrapCarouselIndex(current - 1, slideCount),
        );
      } else if (event.key === "ArrowRight" && slideCount > 1) {
        event.preventDefault();
        setLightboxIndex((current) =>
          current === null ? current : wrapCarouselIndex(current + 1, slideCount),
        );
      } else if (event.key === "Tab") {
        const dialog = lightboxCloseRef.current?.closest('[role="dialog"]');
        const controls = dialog?.querySelectorAll<HTMLElement>("button:not([disabled]), video[controls]");
        if (!controls?.length) return;
        const firstControl = controls[0];
        const lastControl = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl.focus();
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleLightboxKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleLightboxKeyDown);
      lightboxTriggerRef.current?.focus();
    };
  }, [isLightboxOpen, slideCount]);

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
            <button
              className={styles.projectImageButton}
              type="button"
              aria-label={`Открыть на весь экран: ${activeSlide.alt}`}
              onClick={(event) => {
                openLightbox(activeIndex, event.currentTarget);
              }}
            >
              <img
                className={styles.projectScreenshot}
                src={activeSlide.src}
                alt={activeSlide.alt}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.projectImageZoomHint} aria-hidden="true">
                <span>↗</span> Увеличить
              </span>
            </button>
          ) : (
            <>
              <video
                className={styles.projectVideo}
                src={activeSlide.src}
                poster={activeSlide.poster}
                aria-label={activeSlide.label}
                controls
                preload="none"
                playsInline
                ref={cardVideoRef}
              />
              <button
                className={styles.projectVideoOpenButton}
                type="button"
                aria-label={`Открыть на весь экран: ${activeSlide.label}`}
                onClick={(event) => openLightbox(activeIndex, event.currentTarget)}
              >
                <span aria-hidden="true">↗</span> Открыть на весь экран
              </button>
            </>
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

      {lightboxIndex !== null && lightboxSlide
        ? createPortal(
            <div
              className={styles.projectLightboxBackdrop}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeLightbox();
              }}
            >
              <div
                className={styles.projectLightbox}
                role="dialog"
                aria-modal="true"
                aria-label={`Полноэкранный просмотр проекта «${project.title}»`}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closeLightbox();
                }}
              >
                <button
                  className={styles.projectLightboxClose}
                  type="button"
                  aria-label="Закрыть полноэкранный просмотр"
                  onClick={closeLightbox}
                  ref={lightboxCloseRef}
                >
                  ×
                </button>

                <div className={styles.projectLightboxMedia}>
                  {lightboxSlide.kind === "image" ? (
                    <img
                      className={styles.projectLightboxImage}
                      src={lightboxSlide.src}
                      alt={lightboxSlide.alt}
                    />
                  ) : (
                    <ProjectLightboxVideo slide={lightboxSlide} key={lightboxIndex} />
                  )}
                </div>

                {slideCount > 1 ? (
                  <>
                    <button
                      className={`${styles.projectLightboxArrow} ${styles.projectLightboxArrowPrevious}`}
                      type="button"
                      aria-label="Предыдущее медиа проекта"
                      onClick={() => showLightboxSlide(lightboxIndex - 1)}
                    >
                      ←
                    </button>
                    <button
                      className={`${styles.projectLightboxArrow} ${styles.projectLightboxArrowNext}`}
                      type="button"
                      aria-label="Следующее медиа проекта"
                      onClick={() => showLightboxSlide(lightboxIndex + 1)}
                    >
                      →
                    </button>
                    <span className={styles.projectLightboxCount} aria-live="polite">
                      {lightboxIndex + 1} / {slideCount}
                    </span>
                  </>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
