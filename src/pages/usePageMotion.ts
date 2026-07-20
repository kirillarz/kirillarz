import { useEffect, type CSSProperties, type HTMLAttributes } from "react";

export type MotionRevealKind = "heading" | "content" | "card";

type MotionStyle = CSSProperties & {
  "--motion-index": number;
};

type MotionRevealAttributes = HTMLAttributes<HTMLElement> & {
  "data-motion-reveal": MotionRevealKind;
};

type ScatterPieceRecord = {
  element: HTMLElement;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  mobile: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
};

type TransitionRecord = {
  element: HTMLElement;
  variant: "brick-wipe" | "scatter";
  reverseDirection: number;
  stripes: readonly HTMLElement[];
  pieces: readonly ScatterPieceRecord[];
  rail: HTMLElement | null;
};

const TRANSITION_START_VIEWPORT_RATIO = 0.92;
const TRANSITION_END_VIEWPORT_RATIO = 0.08;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function createTransitionRecord(element: HTMLElement): TransitionRecord {
  return {
    element,
    variant: element.dataset.variant === "scatter" ? "scatter" : "brick-wipe",
    reverseDirection: element.dataset.direction === "reverse" ? -1 : 1,
    stripes: Array.from(element.querySelectorAll<HTMLElement>("[data-transition-stripe]")),
    pieces: Array.from(element.querySelectorAll<HTMLElement>("[data-transition-piece]")).map((piece) => {
      const hasMobileMotion = piece.dataset.mobileVisible === "true";
      return {
        element: piece,
        startX: Number(piece.dataset.startX ?? 0),
        startY: Number(piece.dataset.startY ?? 0),
        endX: Number(piece.dataset.endX ?? 0),
        endY: Number(piece.dataset.endY ?? 0),
        rotation: Number(piece.dataset.rotation ?? 0),
        mobile: hasMobileMotion
          ? {
              startX: Number(piece.dataset.mobileStartX ?? 0),
              startY: Number(piece.dataset.mobileStartY ?? 0),
              endX: Number(piece.dataset.mobileEndX ?? 0),
              endY: Number(piece.dataset.mobileEndY ?? 0),
            }
          : null,
      };
    }),
    rail: element.querySelector<HTMLElement>("[data-transition-rail]"),
  };
}

function updateBrickTransition(record: TransitionRecord, progress: number) {
  record.stripes.forEach((stripe, index) => {
    const delay = index * 0.018;
    const localProgress = easeInOutCubic(clamp((progress - delay) / (1 - delay * 2)));
    const rowDirection = (index % 2 === 0 ? -1 : 1) * record.reverseDirection;
    const translate = rowDirection * (1 - localProgress * 2) * 108;
    stripe.style.transform = `translate3d(${translate}%, 0, 0)`;
  });
}

function updateScatterTransition(record: TransitionRecord, progress: number, useMobileLayout: boolean) {
  const assembling = progress <= 0.5;
  const phaseProgress = easeInOutCubic(assembling ? progress * 2 : (progress - 0.5) * 2);

  if (record.rail) {
    const railProgress = 1 - Math.abs(progress - 0.5) * 2;
    record.rail.style.opacity = String(railProgress);
    record.rail.style.transform = `translate(-50%, -50%) scaleX(${0.35 + railProgress * 0.65})`;
  }

  record.pieces.forEach((piece) => {
    const { element, rotation } = piece;
    const motion = useMobileLayout && piece.mobile ? piece.mobile : piece;
    const { startX, startY, endX, endY } = motion;
    const offsetX = assembling ? startX * (1 - phaseProgress) : endX * phaseProgress;
    const offsetY = assembling ? startY * (1 - phaseProgress) : endY * phaseProgress;
    const rotate = assembling ? rotation * (1 - phaseProgress) : -rotation * phaseProgress;
    const scale = assembling ? 0.72 + phaseProgress * 0.28 : 1 - phaseProgress * 0.18;

    element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotate}deg) scale(${scale})`;
  });
}

function updateTransition(record: TransitionRecord, progress: number, useMobileLayout = false) {
  const nextProgress = clamp(progress);
  record.element.style.setProperty("--transition-progress", nextProgress.toFixed(4));
  record.element.dataset.progress = nextProgress.toFixed(3);

  if (record.variant === "scatter") {
    updateScatterTransition(record, nextProgress, useMobileLayout);
  } else {
    updateBrickTransition(record, nextProgress);
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
    const mobileTransitionQuery = window.matchMedia("(max-width: 640px)");
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>("[data-motion-reveal]"));
    const transitionRecords = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-transition]"),
      createTransitionRecord,
    );
    const transitionRecordByElement = new Map(
      transitionRecords.map((record) => [record.element, record] as const),
    );
    const activeTransitionRecords = new Set<TransitionRecord>();
    const continuousMotionElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-continuous-motion]"),
    );
    let animationFrameId = 0;
    let observer: IntersectionObserver | null = null;
    let activityObserver: IntersectionObserver | null = null;

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

      const measurements = Array.from(activeTransitionRecords, (record) => ({
        record,
        bounds: record.element.getBoundingClientRect(),
      }));

      measurements.forEach(({ record, bounds }) => {
        const { element } = record;

        if (bounds.top > viewportHeight) {
          if (element.dataset.progress !== "0.000") {
            updateTransition(record, 0, mobileTransitionQuery.matches);
          }
          return;
        }

        if (bounds.bottom < 0) {
          if (element.dataset.progress !== "1.000") {
            updateTransition(record, 1, mobileTransitionQuery.matches);
          }
          return;
        }

        updateTransition(record, (start - bounds.top) / (start - end), mobileTransitionQuery.matches);
      });
    };

    const requestTransitionUpdate = () => {
      if (animationFrameId !== 0) return;
      animationFrameId = window.requestAnimationFrame(updateTransitions);
    };

    const setupMotion = () => {
      observer?.disconnect();
      activityObserver?.disconnect();

      if (reducedMotionQuery.matches) {
        delete root.dataset.motion;
        activeTransitionRecords.clear();
        transitionRecords.forEach(({ element }) => delete element.dataset.transitionActive);
        continuousMotionElements.forEach((element) => delete element.dataset.motionRunning);
        revealEverything();
        return;
      }

      root.dataset.motion = "enhanced";

      if (typeof IntersectionObserver === "undefined") {
        revealEverything();
        transitionRecords.forEach((record) => {
          record.element.dataset.transitionActive = "true";
          activeTransitionRecords.add(record);
        });
        continuousMotionElements.forEach((element) => {
          element.dataset.motionRunning = "true";
        });
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

        activityObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const element = entry.target as HTMLElement;
              if (element.hasAttribute("data-section-transition")) {
                element.dataset.transitionActive = String(entry.isIntersecting);
                const record = transitionRecordByElement.get(element);
                if (!record) return;

                if (entry.isIntersecting) {
                  activeTransitionRecords.add(record);
                } else {
                  activeTransitionRecords.delete(record);
                  const terminalProgress = entry.boundingClientRect.top < 0 ? 1 : 0;
                  if (element.dataset.progress !== terminalProgress.toFixed(3)) {
                    updateTransition(record, terminalProgress, mobileTransitionQuery.matches);
                  }
                }

                requestTransitionUpdate();
              } else {
                element.dataset.motionRunning = String(entry.isIntersecting);
              }
            });
          },
          { rootMargin: "25% 0px" },
        );

        transitionRecords.forEach(({ element }) => activityObserver?.observe(element));
        continuousMotionElements.forEach((element) => activityObserver?.observe(element));
      }

      requestTransitionUpdate();
    };

    setupMotion();
    window.addEventListener("scroll", requestTransitionUpdate, { passive: true });
    window.addEventListener("resize", requestTransitionUpdate);
    reducedMotionQuery.addEventListener("change", setupMotion);

    return () => {
      observer?.disconnect();
      activityObserver?.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", requestTransitionUpdate);
      window.removeEventListener("resize", requestTransitionUpdate);
      reducedMotionQuery.removeEventListener("change", setupMotion);
      activeTransitionRecords.clear();
      transitionRecords.forEach(({ element }) => delete element.dataset.transitionActive);
      continuousMotionElements.forEach((element) => delete element.dataset.motionRunning);
      delete root.dataset.motion;
    };
  }, []);
}
