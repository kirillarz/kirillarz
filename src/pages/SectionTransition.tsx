import type { CSSProperties } from "react";

import blueBrick from "../assets/transitions/brick-blue.webp";
import redBrick from "../assets/transitions/brick-red.webp";
import yellowStud from "../assets/transitions/stud-yellow.webp";
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
  mobile?: {
    left: number;
    top: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
};

const scatterPieces: readonly ScatterPiece[] = [
  { left: 8, top: 32, startX: -130, startY: -82, endX: -110, endY: 90, rotation: -34, tone: "blue", shape: "brick", mobile: { left: 4, top: 34, startX: -56, startY: -60, endX: -50, endY: 70 } },
  { left: 15, top: 58, startX: -96, startY: 76, endX: -82, endY: -105, rotation: 42, tone: "yellow", shape: "stud", mobile: { left: 21, top: 64, startX: -38, startY: 60, endX: -35, endY: -66 } },
  { left: 21, top: 39, startX: -70, startY: -100, endX: -55, endY: 112, rotation: -58, tone: "red", shape: "brick", mobile: { left: 34, top: 38, startX: -18, startY: -70, endX: -16, endY: 76 } },
  { left: 28, top: 61, startX: -62, startY: 88, endX: -40, endY: -120, rotation: 28, tone: "blue", shape: "brick" },
  { left: 35, top: 36, startX: -45, startY: -92, endX: -30, endY: 108, rotation: -46, tone: "yellow", shape: "stud" },
  { left: 42, top: 59, startX: -30, startY: 104, endX: -18, endY: -96, rotation: 38, tone: "red", shape: "brick" },
  { left: 48, top: 37, startX: -12, startY: -86, endX: -8, endY: 118, rotation: -52, tone: "blue", shape: "brick", mobile: { left: 52, top: 63, startX: 16, startY: 66, endX: 14, endY: -72 } },
  { left: 54, top: 60, startX: 16, startY: 96, endX: 10, endY: -112, rotation: 44, tone: "yellow", shape: "stud", mobile: { left: 69, top: 36, startX: 38, startY: -64, endX: 36, endY: 68 } },
  { left: 61, top: 35, startX: 35, startY: -104, endX: 28, endY: 98, rotation: -30, tone: "red", shape: "brick", mobile: { left: 83, top: 61, startX: 56, startY: 62, endX: 50, endY: -70 } },
  { left: 68, top: 58, startX: 54, startY: 82, endX: 46, endY: -118, rotation: 56, tone: "blue", shape: "brick" },
  { left: 75, top: 38, startX: 76, startY: -94, endX: 64, endY: 110, rotation: -40, tone: "yellow", shape: "stud" },
  { left: 82, top: 61, startX: 94, startY: 104, endX: 86, endY: -100, rotation: 48, tone: "red", shape: "brick" },
  { left: 89, top: 36, startX: 125, startY: -78, endX: 116, endY: 96, rotation: -36, tone: "blue", shape: "brick" },
] as const;

const stripeCount = 6;
const scatterPieceAssets: Record<ScatterPiece["tone"], string> = {
  blue: blueBrick,
  yellow: yellowStud,
  red: redBrick,
};

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
              <img
                className={`${styles.scatterPiece} ${
                  piece.shape === "stud" ? styles.scatterPieceStud : styles.scatterPieceBrick
                }`}
                src={scatterPieceAssets[piece.tone]}
                alt=""
                draggable={false}
                data-transition-piece=""
                data-tone={piece.tone}
                data-start-x={piece.startX}
                data-start-y={piece.startY}
                data-end-x={piece.endX}
                data-end-y={piece.endY}
                data-rotation={piece.rotation}
                data-mobile-visible={piece.mobile ? "true" : undefined}
                data-mobile-start-x={piece.mobile?.startX}
                data-mobile-start-y={piece.mobile?.startY}
                data-mobile-end-x={piece.mobile?.endX}
                data-mobile-end-y={piece.mobile?.endY}
                style={
                  {
                    "--scatter-left": `${piece.left}%`,
                    "--scatter-top": `${piece.top}%`,
                    "--scatter-mobile-left": piece.mobile ? `${piece.mobile.left}%` : undefined,
                    "--scatter-mobile-top": piece.mobile ? `${piece.mobile.top}%` : undefined,
                  } as CSSProperties
                }
                key={index}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
