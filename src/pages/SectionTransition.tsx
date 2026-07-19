import type { CSSProperties } from "react";

import styles from "./Page.module.css";

export type SectionTransitionVariant = "brick-wipe" | "scatter";
export type SectionTransitionPalette = "dark" | "light" | "night" | "hobby";
export type SectionTransitionDirection = "forward" | "reverse";

type SectionTransitionProps = {
  id: string;
  variant: SectionTransitionVariant;
  palette: SectionTransitionPalette;
  direction?: SectionTransitionDirection;
  compact?: boolean;
};

type ScatterPiece = {
  left: number;
  top: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  tone: "blue" | "yellow" | "red";
  shape: "brick" | "stud";
};

const scatterPieces: readonly ScatterPiece[] = [
  { left: 8, top: 32, startX: -130, startY: -82, endX: -110, endY: 90, rotation: -34, tone: "blue", shape: "brick" },
  { left: 15, top: 58, startX: -96, startY: 76, endX: -82, endY: -105, rotation: 42, tone: "yellow", shape: "stud" },
  { left: 21, top: 39, startX: -70, startY: -100, endX: -55, endY: 112, rotation: -58, tone: "red", shape: "brick" },
  { left: 28, top: 61, startX: -62, startY: 88, endX: -40, endY: -120, rotation: 28, tone: "blue", shape: "stud" },
  { left: 35, top: 36, startX: -45, startY: -92, endX: -30, endY: 108, rotation: -46, tone: "yellow", shape: "brick" },
  { left: 42, top: 59, startX: -30, startY: 104, endX: -18, endY: -96, rotation: 38, tone: "red", shape: "stud" },
  { left: 48, top: 37, startX: -12, startY: -86, endX: -8, endY: 118, rotation: -52, tone: "blue", shape: "brick" },
  { left: 54, top: 60, startX: 16, startY: 96, endX: 10, endY: -112, rotation: 44, tone: "yellow", shape: "stud" },
  { left: 61, top: 35, startX: 35, startY: -104, endX: 28, endY: 98, rotation: -30, tone: "red", shape: "brick" },
  { left: 68, top: 58, startX: 54, startY: 82, endX: 46, endY: -118, rotation: 56, tone: "blue", shape: "stud" },
  { left: 75, top: 38, startX: 76, startY: -94, endX: 64, endY: 110, rotation: -40, tone: "yellow", shape: "brick" },
  { left: 82, top: 61, startX: 94, startY: 104, endX: 86, endY: -100, rotation: 48, tone: "red", shape: "stud" },
  { left: 89, top: 36, startX: 125, startY: -78, endX: 116, endY: 96, rotation: -36, tone: "blue", shape: "brick" },
] as const;

const stripeCount = 6;

export function SectionTransition({
  id,
  variant,
  palette,
  direction = "forward",
  compact = false,
}: SectionTransitionProps) {
  return (
    <div
      className={`${styles.sectionTransition} ${styles[`sectionTransition${palette[0].toUpperCase()}${palette.slice(1)}`]} ${
        compact ? styles.sectionTransitionCompact : ""
      }`}
      data-section-transition={id}
      data-testid={`section-transition-${id}`}
      data-variant={variant}
      data-direction={direction}
      data-progress="0.000"
      aria-hidden="true"
    >
      <div className={styles.sectionTransitionStage}>
        {variant === "brick-wipe" ? (
          Array.from({ length: stripeCount }, (_, index) => (
            <span
              className={styles.sectionTransitionStripe}
              data-transition-stripe=""
              key={index}
            >
              <span className={styles.sectionTransitionStuds} />
            </span>
          ))
        ) : (
          <>
            <span className={styles.scatterRail} data-transition-rail="" />
            {scatterPieces.map((piece, index) => (
              <span
                className={`${styles.scatterPiece} ${styles[`scatterPiece${piece.tone[0].toUpperCase()}${piece.tone.slice(1)}`]} ${
                  piece.shape === "stud" ? styles.scatterPieceStud : styles.scatterPieceBrick
                }`}
                data-transition-piece=""
                data-start-x={piece.startX}
                data-start-y={piece.startY}
                data-end-x={piece.endX}
                data-end-y={piece.endY}
                data-rotation={piece.rotation}
                style={{ left: `${piece.left}%`, top: `${piece.top}%` } as CSSProperties}
                key={index}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
