import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// ─── MacBook Pro–style laptop mockup ────────────────────────────────────────
// Screen area is 1440×900 (logical), scaled to fit inside 1920×1080 composition.
// Children render inside the screen viewport.

const BEZEL = 14;           // px bezel around screen
const CHIN = 28;            // px bottom bezel (thicker, has camera notch area)
const CORNER_R = 12;        // outer corner radius
const SCREEN_R = 6;         // inner screen corner radius
const BASE_H = 14;          // laptop base/hinge height
const BASE_LIP_H = 4;      // thin front lip

// Colors
const BODY_COLOR = "#2D2D2F";       // space gray
const BEZEL_COLOR = "#1A1A1C";      // darker bezel
const SCREEN_BG = "#000000";        // black behind screen content
const BASE_COLOR = "#3A3A3C";       // base slightly lighter
const BASE_SHADOW = "rgba(0,0,0,0.35)";

interface MacBookFrameProps {
  children: React.ReactNode;
  /** Frame at which the laptop scales in (default 0) */
  enterStart?: number;
  /** Scale of the laptop relative to viewport (default 0.82) */
  scale?: number;
  /** Vertical offset from center in px (default -20, slightly up) */
  offsetY?: number;
}

export const MacBookFrame: React.FC<MacBookFrameProps> = ({
  children,
  enterStart = 0,
  scale: baseScale = 0.82,
  offsetY = -20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const enterT = spring({
    frame: frame - enterStart,
    fps,
    config: { stiffness: 120, damping: 22, mass: 1 },
  });
  const scaleAnim = interpolate(enterT, [0, 1], [0.92, 1]);
  const yAnim = interpolate(enterT, [0, 1], [60, 0]);
  const opAnim = interpolate(enterT, [0, 0.3, 1], [0, 1, 1]);

  const totalScale = baseScale * scaleAnim;

  // Screen dimensions (what the children see)
  const SCREEN_W = 1440;
  const SCREEN_H = 900;

  // Outer lid dimensions
  const LID_W = SCREEN_W + BEZEL * 2;
  const LID_H = SCREEN_H + BEZEL + CHIN;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      opacity: opAnim,
      transform: `translateY(${offsetY + yAnim}px) scale(${totalScale})`,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* ── Screen lid ── */}
        <div style={{
          width: LID_W,
          height: LID_H,
          backgroundColor: BODY_COLOR,
          borderRadius: CORNER_R,
          padding: `${BEZEL}px ${BEZEL}px ${CHIN}px ${BEZEL}px`,
          boxShadow: `
            0 2px 8px rgba(0,0,0,0.3),
            0 20px 60px rgba(0,0,0,0.25),
            inset 0 0 0 0.5px rgba(255,255,255,0.08)
          `,
          position: "relative",
        }}>
          {/* Inner bezel highlight (subtle top edge reflection) */}
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.12) 50%, transparent 90%)",
            borderRadius: `${CORNER_R}px ${CORNER_R}px 0 0`,
          }} />

          {/* Screen viewport */}
          <div style={{
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: SCREEN_R,
            overflow: "hidden",
            backgroundColor: SCREEN_BG,
            position: "relative",
          }}>
            {/* Children fill the screen */}
            <div style={{
              position: "absolute",
              inset: 0,
            }}>
              {children}
            </div>
          </div>

          {/* Bottom chin — camera/notch indicator */}
          <div style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#0A0A0A",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }} />
        </div>

        {/* ── Base / hinge ── */}
        <div style={{
          width: LID_W + 40,
          height: BASE_H,
          background: `linear-gradient(180deg, ${BASE_COLOR} 0%, #2A2A2C 100%)`,
          borderRadius: `0 0 4px 4px`,
          boxShadow: `0 4px 16px ${BASE_SHADOW}`,
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}>
          {/* Front lip indent */}
          <div style={{
            position: "absolute",
            bottom: 0,
            width: 200,
            height: BASE_LIP_H,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: "0 0 6px 6px",
          }} />
        </div>
      </div>
    </div>
  );
};
