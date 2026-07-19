import { Fragment, type CSSProperties } from "react";

import styles from "./Page.module.css";
import { motionReveal } from "./usePageMotion";

type MotionStyle = CSSProperties & {
  "--motion-index": number;
};

export type MotionHeadingSegment = {
  text: string;
  accent?: boolean;
  breakBefore?: boolean;
  breakClassName?: string;
};

type MotionHeadingProps = {
  id: string;
  label: string;
  segments: readonly MotionHeadingSegment[];
};

export function MotionHeading({ id, label, segments }: MotionHeadingProps) {
  return (
    <h2 id={id} aria-label={label} {...motionReveal("heading")}>
      {segments.map((segment, index) => (
        <Fragment key={`${segment.text}-${index}`}>
          {segment.breakBefore ? (
            <br className={segment.breakClassName} aria-hidden="true" />
          ) : index > 0 ? (
            " "
          ) : null}
          <span
            className={`${styles.motionHeadingGroup} ${segment.accent ? styles.motionHeadingAccent : ""}`}
            style={{ "--motion-index": index } as MotionStyle}
            aria-hidden="true"
          >
            {segment.text}
          </span>
        </Fragment>
      ))}
    </h2>
  );
}
