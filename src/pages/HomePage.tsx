import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TransitionEvent,
} from "react";

import heroMinifigure from "../assets/hero-minifigure.webp";
import heroMinifigureAnimation from "../assets/hero-minifigure-animate-clean.webm";
import { AboutSection } from "./AboutSection";
import { ContactsSection } from "./ContactsSection";
import { HobbySection } from "./HobbySection";
import { PageNavigation, type NavigationSectionId } from "./MobileNavigation";
import styles from "./PageStyles";
import { ProjectsSection } from "./ProjectsSection";
import { SectionTransition } from "./SectionTransition";
import { SkillsSection } from "./SkillsSection";
import { usePageMotion } from "./usePageMotion";

const heroRoles = [
  "Product Manager",
  "Project Manager",
  "Backend Developer",
  "Business Analyst",
  "AI Product Builder",
  "Team Coordinator",
];

type HeroPhase = "locked" | "prompting" | "playing" | "covering" | "revealing" | "unlocked";

const HERO_INTRO_COMPLETED_KEY = "hero-intro:completed:v1";
const HERO_INTRO_UNAVAILABLE_KEY = "hero-intro:unavailable:v1";
const HERO_INTRO_COMPLETED_VALUE = "completed";
const FLASH_START_SECONDS = 4;
const FLASH_COVER_MS = 220;
const TARGET_REVEAL_MS = 420;
const TRANSITION_FALLBACK_DELAY_MS = 120;
const PLAYBACK_SAFETY_TIMEOUT_MS = 5000;
const PROMPT_VISIBLE_MS = 2600;
const SCROLL_GESTURE_END_MS = 250;
const NAVIGATION_SECTION_IDS = new Set<NavigationSectionId>([
  "top",
  "about",
  "skills",
  "projects",
  "hobby",
  "contacts",
]);

type StorageKind = "localStorage" | "sessionStorage";

function readStorage(storageKind: StorageKind, key: string) {
  try {
    return window[storageKind].getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(storageKind: StorageKind, key: string, value: string) {
  try {
    window[storageKind].setItem(key, value);
  } catch {
    // Storage can be disabled; the in-memory state still keeps this page usable.
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasReachedFlashPoint(video: HTMLVideoElement) {
  return video.currentTime >= FLASH_START_SECONDS || video.ended;
}

function markIntroCompleted() {
  writeStorage("localStorage", HERO_INTRO_COMPLETED_KEY, HERO_INTRO_COMPLETED_VALUE);
}

function getInitialHeroPhase(): HeroPhase {
  if (
    window.location.hash ||
    readStorage("localStorage", HERO_INTRO_COMPLETED_KEY) === HERO_INTRO_COMPLETED_VALUE
  ) {
    return "unlocked";
  }

  if (prefersReducedMotion()) {
    markIntroCompleted();
    return "unlocked";
  }

  if (readStorage("sessionStorage", HERO_INTRO_UNAVAILABLE_KEY) === "true") return "unlocked";
  return "locked";
}

function setSectionHash(sectionId: NavigationSectionId) {
  const nextHash = `#${sectionId}`;
  if (window.location.hash === nextHash) {
    window.history.replaceState(null, "", nextHash);
    return;
  }

  window.history.pushState(null, "", nextHash);
}

function runWithInstantScroll(action: () => void) {
  const root = document.documentElement;
  const previousBehavior = root.style.getPropertyValue("scroll-behavior");
  const previousPriority = root.style.getPropertyPriority("scroll-behavior");
  root.style.setProperty("scroll-behavior", "auto");

  try {
    action();
  } finally {
    if (previousBehavior) {
      root.style.setProperty("scroll-behavior", previousBehavior, previousPriority);
    } else {
      root.style.removeProperty("scroll-behavior");
    }
  }
}

function navigateToSection(sectionId: NavigationSectionId, behavior: ScrollBehavior) {
  const section = document.getElementById(sectionId);
  if (!section) {
    window.location.hash = sectionId;
    return;
  }

  if (behavior === "auto") {
    runWithInstantScroll(() => section.scrollIntoView({ behavior, block: "start" }));
  } else {
    section.scrollIntoView({ behavior, block: "start" });
  }
  setSectionHash(sectionId);
}

function getHeroScrollLimit() {
  const hero = document.getElementById("top");
  if (!hero) return 0;

  const bounds = hero.getBoundingClientRect();
  return Math.max(0, window.scrollY + bounds.bottom - window.innerHeight);
}

function scrollToInstantly(top: number) {
  runWithInstantScroll(() => window.scrollTo({ top, behavior: "auto" }));
}

function isEditableOrInteractive(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"));
}

export function HomePage() {
  const [heroPhase, setHeroPhase] = useState<HeroPhase>(getInitialHeroPhase);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [ctaPulseCount, setCtaPulseCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const heroPhaseRef = useRef<HeroPhase>(heroPhase);
  const pendingTargetRef = useRef<NavigationSectionId>("about");
  const isVideoUnavailableRef = useRef(false);

  usePageMotion();

  const changeHeroPhase = useCallback((phase: HeroPhase) => {
    heroPhaseRef.current = phase;
    setHeroPhase(phase);
  }, []);

  const resetTransition = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setIsVideoVisible(false);
    changeHeroPhase("unlocked");
  }, [changeHeroPhase]);

  const unlockForUnavailableVideo = useCallback(() => {
    isVideoUnavailableRef.current = true;
    writeStorage("sessionStorage", HERO_INTRO_UNAVAILABLE_KEY, "true");
    resetTransition();
  }, [resetTransition]);

  const completeIntroWithoutMotion = useCallback(() => {
    markIntroCompleted();
    resetTransition();
  }, [resetTransition]);

  const revealPendingTarget = useCallback(() => {
    if (heroPhaseRef.current !== "covering") return;

    markIntroCompleted();
    navigateToSection(pendingTargetRef.current, "auto");
    changeHeroPhase("revealing");
  }, [changeHeroPhase]);

  const fallBackToNavigation = useCallback(() => {
    const target = pendingTargetRef.current;
    unlockForUnavailableVideo();
    navigateToSection(target, "smooth");
  }, [unlockForUnavailableVideo]);

  const showScrollPrompt = useCallback(() => {
    const phase = heroPhaseRef.current;
    if (phase !== "locked" && phase !== "prompting") return;

    setCtaPulseCount((current) => current + 1);
    if (phase === "locked") changeHeroPhase("prompting");
  }, [changeHeroPhase]);

  useEffect(() => {
    if (ctaPulseCount === 0) return;

    ctaRef.current?.getAnimations({ subtree: true }).forEach((animation) => {
      animation.cancel();
      animation.play();
    });
  }, [ctaPulseCount]);

  const startIntro = useCallback(
    (target: NavigationSectionId) => {
      const phase = heroPhaseRef.current;
      if (phase !== "locked" && phase !== "prompting") return;

      pendingTargetRef.current = target;
      if (prefersReducedMotion()) {
        completeIntroWithoutMotion();
        navigateToSection(target, "auto");
        return;
      }

      const video = videoRef.current;
      if (isVideoUnavailableRef.current || !video) {
        fallBackToNavigation();
        return;
      }

      video.currentTime = 0;
      setIsVideoVisible(false);
      changeHeroPhase("playing");

      try {
        void video.play().catch(() => {
          if (heroPhaseRef.current === "playing") fallBackToNavigation();
        });
      } catch {
        fallBackToNavigation();
      }
    },
    [changeHeroPhase, completeIntroWithoutMotion, fallBackToNavigation],
  );

  const isScrollLocked = heroPhase !== "unlocked" && heroPhase !== "revealing";

  useLayoutEffect(() => {
    if (!isScrollLocked) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    scrollToInstantly(0);

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [isScrollLocked]);

  useLayoutEffect(() => {
    const sectionId = window.location.hash.slice(1) as NavigationSectionId;
    if (!NAVIGATION_SECTION_IDS.has(sectionId)) return;

    const animationFrameId = window.requestAnimationFrame(() => navigateToSection(sectionId, "auto"));
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (!isScrollLocked) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastY = 0;
    let touchGesturePrompted = false;
    let wheelGestureActive = false;
    let scrollbarGestureActive = false;
    let scrollFrameId = 0;
    let wheelGestureTimeoutId = 0;
    let scrollbarGestureTimeoutId = 0;

    const handleWheel = (event: WheelEvent) => {
      if (heroPhaseRef.current === "unlocked" || heroPhaseRef.current === "revealing") return;
      if (event.deltaY <= 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (!wheelGestureActive) {
        wheelGestureActive = true;
        showScrollPrompt();
      }
      const scrollLimit = getHeroScrollLimit();
      if (window.scrollY + event.deltaY >= scrollLimit) {
        event.preventDefault();
        scrollToInstantly(scrollLimit);
      }
      window.clearTimeout(wheelGestureTimeoutId);
      wheelGestureTimeoutId = window.setTimeout(() => {
        wheelGestureActive = false;
      }, SCROLL_GESTURE_END_MS);
    };
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchLastY = touch.clientY;
      touchGesturePrompted = false;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (heroPhaseRef.current === "unlocked" || heroPhaseRef.current === "revealing") return;
      const touch = event.touches[0];
      if (!touch) return;

      const horizontalDistance = Math.abs(touch.clientX - touchStartX);
      const upwardDistance = touchStartY - touch.clientY;
      if (upwardDistance <= 8 || upwardDistance <= horizontalDistance) return;

      event.preventDefault();
      const scrollLimit = getHeroScrollLimit();
      const nextScrollTop = Math.min(scrollLimit, window.scrollY + Math.max(0, touchLastY - touch.clientY));
      scrollToInstantly(nextScrollTop);
      touchLastY = touch.clientY;
      if (!touchGesturePrompted) {
        touchGesturePrompted = true;
        showScrollPrompt();
      }
    };
    const handleTouchEnd = () => {
      touchGesturePrompted = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (heroPhaseRef.current === "unlocked" || heroPhaseRef.current === "revealing") return;
      if (event.repeat) return;
      if (isEditableOrInteractive(event.target)) return;
      const isDownwardKey =
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === "End" ||
        (event.key === " " && !event.shiftKey);
      if (!isDownwardKey) return;

      event.preventDefault();
      showScrollPrompt();
      const scrollLimit = getHeroScrollLimit();
      const step = event.key === "ArrowDown" ? 40 : window.innerHeight;
      const nextScrollTop = event.key === "End" ? scrollLimit : Math.min(scrollLimit, window.scrollY + step);
      scrollToInstantly(nextScrollTop);
    };
    const handleScroll = () => {
      if (heroPhaseRef.current === "unlocked" || heroPhaseRef.current === "revealing") return;
      if (window.scrollY <= 1 || scrollFrameId) return;
      if (!scrollbarGestureActive) {
        scrollbarGestureActive = true;
        showScrollPrompt();
      }
      window.clearTimeout(scrollbarGestureTimeoutId);
      scrollbarGestureTimeoutId = window.setTimeout(() => {
        scrollbarGestureActive = false;
      }, SCROLL_GESTURE_END_MS);
      scrollFrameId = window.requestAnimationFrame(() => {
        scrollFrameId = 0;
        const scrollLimit = getHeroScrollLimit();
        if (window.scrollY > scrollLimit) scrollToInstantly(scrollLimit);
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(scrollFrameId);
      window.clearTimeout(wheelGestureTimeoutId);
      window.clearTimeout(scrollbarGestureTimeoutId);
    };
  }, [isScrollLocked, showScrollPrompt]);

  useEffect(() => {
    if (heroPhase !== "prompting") return;
    const timeoutId = window.setTimeout(() => changeHeroPhase("locked"), PROMPT_VISIBLE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [changeHeroPhase, heroPhase]);

  useEffect(() => {
    if (heroPhase !== "playing") return;

    let animationFrameId = 0;
    const trackPlayback = () => {
      const video = videoRef.current;
      if (!video) {
        fallBackToNavigation();
        return;
      }

      if (hasReachedFlashPoint(video)) {
        changeHeroPhase("covering");
        return;
      }

      animationFrameId = window.requestAnimationFrame(trackPlayback);
    };

    animationFrameId = window.requestAnimationFrame(trackPlayback);
    const safetyTimeoutId = window.setTimeout(() => {
      if (heroPhaseRef.current !== "playing") return;

      const video = videoRef.current;
      if (video && hasReachedFlashPoint(video)) {
        changeHeroPhase("covering");
      } else {
        fallBackToNavigation();
      }
    }, PLAYBACK_SAFETY_TIMEOUT_MS);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(safetyTimeoutId);
    };
  }, [changeHeroPhase, fallBackToNavigation, heroPhase]);

  useEffect(() => {
    if (heroPhase !== "covering") return;

    const timeoutId = window.setTimeout(revealPendingTarget, FLASH_COVER_MS + TRANSITION_FALLBACK_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [heroPhase, revealPendingTarget]);

  useEffect(() => {
    if (heroPhase !== "revealing") return;

    const timeoutId = window.setTimeout(resetTransition, TARGET_REVEAL_MS + TRANSITION_FALLBACK_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [heroPhase, resetTransition]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreferenceChange = () => {
      if (!mediaQuery.matches) return;

      const phase = heroPhaseRef.current;
      if (phase === "locked" || phase === "prompting") {
        completeIntroWithoutMotion();
      } else if (phase === "playing" || phase === "covering") {
        completeIntroWithoutMotion();
        navigateToSection(pendingTargetRef.current, "auto");
      }
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);
    return () => mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
  }, [completeIntroWithoutMotion]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== HERO_INTRO_COMPLETED_KEY || event.newValue !== HERO_INTRO_COMPLETED_VALUE) return;
      const phase = heroPhaseRef.current;
      if (phase === "locked" || phase === "prompting") resetTransition();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [resetTransition]);

  useEffect(
    () => () => {
      videoRef.current?.pause();
    },
    [],
  );

  const handleCtaClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const phase = heroPhaseRef.current;
    if (phase === "locked" || phase === "prompting") {
      event.preventDefault();
      startIntro("about");
    } else if (phase !== "unlocked") {
      event.preventDefault();
    }
  };

  const handleNavigation = (sectionId: NavigationSectionId, event: ReactMouseEvent<HTMLAnchorElement>) => {
    const phase = heroPhaseRef.current;
    if (sectionId === "top" || phase === "unlocked") return;

    event.preventDefault();
    if (phase === "locked" || phase === "prompting") startIntro(sectionId);
  };

  const handleVideoError = () => {
    if (heroPhaseRef.current === "playing") {
      fallBackToNavigation();
      return;
    }

    if (heroPhaseRef.current === "locked" || heroPhaseRef.current === "prompting") {
      unlockForUnavailableVideo();
    }
  };

  const handleOverlayTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;

    if (heroPhaseRef.current === "covering") {
      revealPendingTarget();
    } else if (heroPhaseRef.current === "revealing") {
      resetTransition();
    }
  };

  const isTransitioning = heroPhase === "playing" || heroPhase === "covering" || heroPhase === "revealing";
  const isPrompting = heroPhase === "prompting";

  return (
    <main className={`${styles.page} ${styles.homePage}`} data-hero-phase={heroPhase}>
      <PageNavigation onNavigate={handleNavigation} />
      <section
        id="top"
        className={styles.homeHero}
        aria-labelledby="home-title"
        data-hero-gate={heroPhase === "locked" || heroPhase === "prompting" ? "locked" : "unlocked"}
      >
        <div className={styles.heroVisual}>
          <div className={styles.heroImageFrame}>
            <img
              className={`${styles.heroMedia} ${styles.heroImage} ${isVideoVisible ? styles.heroImageHidden : ""}`}
              src={heroMinifigure}
              width="768"
              height="1315"
              decoding="async"
              fetchPriority="high"
              alt="Стилизованная конструкторная минифигурка Кирилла в костюме"
            />
            <video
              className={`${styles.heroMedia} ${styles.heroVideo} ${isVideoVisible ? styles.heroVideoVisible : ""}`}
              ref={videoRef}
              src={heroMinifigureAnimation}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              data-testid="hero-animation"
              onPlaying={() => {
                if (heroPhaseRef.current === "playing") setIsVideoVisible(true);
              }}
              onEnded={() => {
                if (heroPhaseRef.current === "playing") changeHeroPhase("covering");
              }}
              onError={handleVideoError}
            />
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 id="home-title">Кирилл Арзамасцев</h1>
          <p className={styles.heroDescription}>
            Студент, который совмещает разработку, управление и организацию. Умеет превращать идеи в работающие
            проекты, координировать команду, общаться с заказчиком и защищать результат.
          </p>

          <div
            className={styles.roleMarquee}
            data-continuous-motion=""
            data-testid="hero-role-marquee"
          >
            <span className={styles.srOnly}>Роли: {heroRoles.join(", ")}</span>
            <div className={styles.roleTrack} data-testid="hero-role-track" aria-hidden="true">
              {["primary", "duplicate"].map((group) => (
                <div className={styles.roleGroup} data-role-group={group} key={group}>
                  {heroRoles.map((role) => (
                    <span className={styles.rolePill} key={`${group}-${role}`}>
                      {role}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <a
              className={`${styles.primaryLink} ${isPrompting ? styles.heroCtaPrompting : ""}`}
              ref={ctaRef}
              href="#about"
              data-pulse-count={ctaPulseCount}
              aria-busy={isTransitioning}
              aria-disabled={isTransitioning || undefined}
              onClick={handleCtaClick}
            >
              Узнать обо мне
              <span className={styles.heroCtaArrow} aria-hidden="true">↓</span>
            </a>
            <p
              className={styles.heroActionPrompt}
              data-visible={isPrompting ? "true" : "false"}
              data-testid="hero-scroll-prompt"
              aria-live="polite"
              aria-atomic="true"
            >
              {isPrompting ? "Сначала запусти сцену" : ""}
            </p>
          </div>
        </div>
      </section>

      <div data-testid="hero-gated-content" inert={isScrollLocked || undefined}>
        <AboutSection />
        <SectionTransition id="about-skills" variant="brick-wipe" palette="dark" />
        <SkillsSection />
        <SectionTransition id="skills-projects" variant="brick-wipe" palette="light" direction="reverse" />
        <ProjectsSection />
        <SectionTransition id="projects-hobby" variant="scatter" palette="hobby" />
        <HobbySection />
        <SectionTransition id="hobby-contacts" variant="brick-wipe" palette="night" compact />
        <ContactsSection />
      </div>
      <div
        className={`${styles.heroFlashOverlay} ${
          heroPhase === "covering"
            ? styles.heroFlashOverlayCovering
            : heroPhase === "revealing"
              ? styles.heroFlashOverlayRevealing
              : ""
        }`}
        data-testid="hero-flash-overlay"
        data-transition-phase={heroPhase}
        aria-hidden="true"
        onTransitionEnd={handleOverlayTransitionEnd}
      />
    </main>
  );
}
