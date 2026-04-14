import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";

export interface CursorKeyframe {
  frame: number;
  x: number;
  y: number;
  click?: boolean;
}

interface AnimatedCursorProps {
  keyframes: CursorKeyframe[];
  visible?: boolean;
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  keyframes,
  visible = true,
}) => {
  const frame = useCurrentFrame();

  if (!visible || keyframes.length === 0 || frame < keyframes[0].frame) {
    return null;
  }

  // Find current segment
  let segIndex = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i].frame) {
      segIndex = i;
    }
  }

  const current = keyframes[segIndex];
  const next = keyframes[Math.min(segIndex + 1, keyframes.length - 1)];

  // Interpolate position between keyframes
  let x: number;
  let y: number;

  if (current === next || frame >= next.frame) {
    x = next.x;
    y = next.y;
  } else {
    x = interpolate(frame, [current.frame, next.frame], [current.x, next.x], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    y = interpolate(frame, [current.frame, next.frame], [current.y, next.y], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // Click ripple effect
  const isClicking = keyframes.some(
    (kf) => kf.click && frame >= kf.frame && frame < kf.frame + 12
  );
  const clickingKf = keyframes.find(
    (kf) => kf.click && frame >= kf.frame && frame < kf.frame + 12
  );

  let rippleScale = 0;
  let rippleOpacity = 0;

  if (isClicking && clickingKf) {
    const clickElapsed = frame - clickingKf.frame;
    rippleScale = interpolate(clickElapsed, [0, 12], [0, 1.5], {
      extrapolateRight: "clamp",
    });
    rippleOpacity = interpolate(clickElapsed, [0, 6, 12], [0.6, 0.3, 0], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* Click ripple */}
      {isClicking && (
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: COLORS.clickRipple,
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}
      {/* Cursor arrow */}
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M0 0 L0 18 L4.5 13.5 L8 22 L11 21 L7.5 12.5 L14 12.5 Z"
          fill={COLORS.cursorWhite}
          stroke={COLORS.cursorBorder}
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};
