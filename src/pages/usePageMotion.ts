import { useEffect, type CSSProperties, type HTMLAttributes } from "react";

export type MotionRevealKind = "heading" | "content" | "card";

type MotionStyle = CSSProperties & {
  "--motion-index": number;
};

type MotionRevealAttributes = HTMLAttributes<HTMLElement> & {
  "data-motion-reveal": MotionRevealKind;
};

const TRANSITION_START_VIEWPORT_RATIO = 0.92;
const TRANSITION_END_VIEWPORT_RATIO = 0.08;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function updateBrickTransition(element: HTMLElement, progress: number) {
  const reverseDirection = element.dataset.direction === "reverse" ? -1 : 1;
  const stripes = element.querySelectorAll<HTMLElement>("[data-transition-stripe]");

  stripes.forEach((stripe, index) => {
    const delay = index * 0.018;
    const localProgress = easeInOutCubic(clamp((progress - delay) / (1 - delay * 2)));
    const rowDirection = (index % 2 === 0 ? -1 : 1) * reverseDirection;
    const translate = rowDirection * (1 - localProgress * 2) * 108;
    stripe.style.transform = `translate3d(${translate}%, 0, 0)`;
  });
}

function updateScatterTransition(element: HTMLElement, progress: number) {
  const pieces = element.querySelectorAll<HTMLElement>("[data-transition-piece]");
  const rail = element.querySelector<HTMLElement>("[data-transition-rail]");
  const assembling = progress <= 0.5;
  const phaseProgress = easeInOutCubic(assembling ? progress * 2 : (progress - 0.5) * 2);

  if (rail) {
    const railProgress = 1 - Math.abs(progress - 0.5) * 2;
    rail.style.opacity = String(railProgress);
    rail.style.transform = `translate(-50%, -50%) scaleX(${0.35 + railProgress * 0.65})`;
  }

  pieces.forEach((piece) => {
    const startX = Number(piece.dataset.startX ?? 0);
    const startY = Number(piece.dataset.startY ?? 0);
    const endX = Number(piece.dataset.endX ?? 0);
    const endY = Number(piece.dataset.endY ?? 0);
    const rotation = Number(piece.dataset.rotation ?? 0);
    const offsetX = assembling ? startX * (1 - phaseProgress) : endX * phaseProgress;
    const offsetY = assembling ? startY * (1 - phaseProgress) : endY * phaseProgress;
    const rotate = assembling ? rotation * (1 - phaseProgress) : -rotation * phaseProgress;
    const scale = assembling ? 0.72 + phaseProgress * 0.28 : 1 - phaseProgress * 0.18;

    piece.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotate}deg) scale(${scale})`;
  });
}

function updateTransition(element: HTMLElement, progress: number) {
  const nextProgress = clamp(progress);
  element.style.setProperty("--transition-progress", nextProgress.toFixed(4));
  element.dataset.progress = nextProgress.toFixed(3);

  if (element.dataset.variant === "scatter") {
    updateScatterTransition(element, nextProgress);
  } else {
    updateBrickTransition(element, nextProgress);
  }
}

export function motionReveal(kind: MotionRevealKind, index = 0): MotionRevealAttributes {
  return {
    "data-motion-reveal": kind,
    style: { "--motion-index": index } as MotionStyle,
  };
}

export function usePageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-motion-reveal]"));
    const transitionElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-transition]"),
    );
    let animationFrameId = 0;
    let observer: IntersectionObserver | null = null;

    const revealEverything = () => {
      revealElements.forEach((element) => {
        element.dataset.motionRevealed = "true";
      });
    };

    const updateTransitions = () => {
      animationFrameId = 0;
      if (reducedMotionQuery.matches) return;

      const viewportHeight = window.innerHeight;
      const start = viewportHeight * TRANSITION_START_VIEWPORT_RATIO;
      const end = viewportHeight * TRANSITION_END_VIEWPORT_RATIO;

      transitionElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();

        if (bounds.top > viewportHeight) {
          if (element.dataset.progress !== "0.000") updateTransition(element, 0);
          return;
        }

        if (bounds.bottom < 0) {
          if (element.dataset.progress !== "1.000") updateTransition(element, 1);
          return;
        }

        updateTransition(element, (start - bounds.top) / (start - end));
      });
    };

    const requestTransitionUpdate = () => {
      if (animationFrameId !== 0) return;
      animationFrameId = window.requestAnimationFrame(updateTransitions);
    };

    const setupMotion = () => {
      observer?.disconnect();

      if (reducedMotionQuery.matches) {
        delete root.dataset.motion;
        revealEverything();
        return;
      }

      root.dataset.motion = "enhanced";

      if (typeof IntersectionObserver === "undefined") {
        revealEverything();
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              (entry.target as HTMLElement).dataset.motionRevealed = "true";
              observer?.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
        );

        revealElements.forEach((element) => {
          if (element.dataset.motionRevealed !== "true") observer?.observe(element);
        });
      }

      requestTransitionUpdate();
    };

    setupMotion();
    window.addEventListener("scroll", requestTransitionUpdate, { passive: true });
    window.addEventListener("resize", requestTransitionUpdate);
    reducedMotionQuery.addEventListener("change", setupMotion);

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", requestTransitionUpdate);
      window.removeEventListener("resize", requestTransitionUpdate);
      reducedMotionQuery.removeEventListener("change", setupMotion);
      delete root.dataset.motion;
    };
  }, []);
}
