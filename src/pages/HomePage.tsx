import { useCallback, useEffect, useRef, useState, type MouseEvent, type TransitionEvent } from "react";

import heroMinifigure from "../assets/hero-minifigure.webp";
import heroMinifigureAnimation from "../assets/hero-minifigure-animate-clean.webm";
import { AboutSection } from "./AboutSection";
import { ContactsSection } from "./ContactsSection";
import { HobbySection } from "./HobbySection";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./Page.module.css";
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

type HeroTransitionPhase = "idle" | "playing" | "covering" | "revealing";

const FLASH_START_SECONDS = 4;
const FLASH_COVER_MS = 220;
const ABOUT_REVEAL_MS = 420;
const TRANSITION_FALLBACK_DELAY_MS = 120;

function setAboutHash() {
  if (window.location.hash === "#about") {
    window.history.replaceState(null, "", "#about");
    return;
  }

  window.history.pushState(null, "", "#about");
}

function jumpToAbout() {
  const aboutSection = document.getElementById("about");
  if (!aboutSection) return;

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  const top = aboutSection.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: "auto" });
  setAboutHash();

  root.style.scrollBehavior = previousScrollBehavior;
}

function scrollToAbout() {
  const aboutSection = document.getElementById("about");
  if (!aboutSection) {
    window.location.hash = "about";
    return;
  }

  aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
  setAboutHash();
}

export function HomePage() {
  const [transitionPhase, setTransitionPhase] = useState<HeroTransitionPhase>("idle");
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transitionPhaseRef = useRef<HeroTransitionPhase>("idle");
  const isVideoUnavailableRef = useRef(false);

  usePageMotion();

  const changeTransitionPhase = useCallback((phase: HeroTransitionPhase) => {
    transitionPhaseRef.current = phase;
    setTransitionPhase(phase);
  }, []);

  const resetTransition = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    setIsVideoVisible(false);
    changeTransitionPhase("idle");
  }, [changeTransitionPhase]);

  const revealAbout = useCallback(() => {
    if (transitionPhaseRef.current !== "covering") return;

    jumpToAbout();
    changeTransitionPhase("revealing");
  }, [changeTransitionPhase]);

  const fallBackToAnchorNavigation = useCallback(() => {
    resetTransition();
    scrollToAbout();
  }, [resetTransition]);

  useEffect(() => {
    if (transitionPhase !== "playing") return;

    let animationFrameId = 0;
    const trackPlayback = () => {
      const video = videoRef.current;
      if (!video || video.currentTime >= FLASH_START_SECONDS || video.ended) {
        changeTransitionPhase("covering");
        return;
      }

      animationFrameId = window.requestAnimationFrame(trackPlayback);
    };

    animationFrameId = window.requestAnimationFrame(trackPlayback);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [changeTransitionPhase, transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "covering") return;

    const timeoutId = window.setTimeout(revealAbout, FLASH_COVER_MS + TRANSITION_FALLBACK_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [revealAbout, transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== "revealing") return;

    const timeoutId = window.setTimeout(resetTransition, ABOUT_REVEAL_MS + TRANSITION_FALLBACK_DELAY_MS);
    return () => window.clearTimeout(timeoutId);
  }, [resetTransition, transitionPhase]);

  useEffect(
    () => () => {
      videoRef.current?.pause();
    },
    [],
  );

  const handleCtaClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (transitionPhaseRef.current !== "idle") {
      event.preventDefault();
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;
    if (prefersReducedMotion || isVideoUnavailableRef.current || !video) return;

    event.preventDefault();
    video.currentTime = 0;
    setIsVideoVisible(false);
    changeTransitionPhase("playing");

    try {
      void video.play().catch(() => {
        if (transitionPhaseRef.current === "playing") fallBackToAnchorNavigation();
      });
    } catch {
      fallBackToAnchorNavigation();
    }
  };

  const handleVideoError = () => {
    isVideoUnavailableRef.current = true;
    if (transitionPhaseRef.current !== "idle") fallBackToAnchorNavigation();
  };

  const handleOverlayTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;

    if (transitionPhaseRef.current === "covering") {
      revealAbout();
    } else if (transitionPhaseRef.current === "revealing") {
      resetTransition();
    }
  };

  return (
    <main className={`${styles.page} ${styles.homePage}`}>
      <MobileNavigation />
      <section id="top" className={styles.homeHero} aria-labelledby="home-title">
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
                if (transitionPhaseRef.current === "playing") setIsVideoVisible(true);
              }}
              onEnded={() => {
                if (transitionPhaseRef.current === "playing") changeTransitionPhase("covering");
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
              className={styles.primaryLink}
              href="#about"
              aria-busy={transitionPhase !== "idle"}
              aria-disabled={transitionPhase !== "idle" || undefined}
              onClick={handleCtaClick}
            >
              Узнать обо мне
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </section>

      <AboutSection />
      <SectionTransition id="about-skills" variant="brick-wipe" palette="dark" />
      <SkillsSection />
      <SectionTransition id="skills-projects" variant="brick-wipe" palette="light" direction="reverse" />
      <ProjectsSection />
      <SectionTransition id="projects-hobby" variant="scatter" palette="hobby" />
      <HobbySection />
      <SectionTransition id="hobby-contacts" variant="brick-wipe" palette="night" compact />
      <ContactsSection />
      <div
        className={`${styles.heroFlashOverlay} ${
          transitionPhase === "covering"
            ? styles.heroFlashOverlayCovering
            : transitionPhase === "revealing"
              ? styles.heroFlashOverlayRevealing
              : ""
        }`}
        data-testid="hero-flash-overlay"
        data-transition-phase={transitionPhase}
        aria-hidden="true"
        onTransitionEnd={handleOverlayTransitionEnd}
      />
    </main>
  );
}
