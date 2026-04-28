import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ARIA_BLUE, INK, PAPER, interFont } from "../constants";

// ─── Timeline (30 fps) ────────────────────────────────────────────────────────
// 4 separate blocks that crossfade / push up (Apple keynote style).
// Each block has { start, end } — enters at `start`, exits at `end`.
const BLOCKS = {
  simply:      { enter:   6, exit:  48 },
  autonomous:  { enter:  54, exit: 120 },
  execute:     { enter: 126, exit: 196 },
  workflow:    { enter: 202, exit: 270 },
} as const;

const T_ZOOM_START = 240;
const T_ZOOM_END   = 275;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const useBlockLifecycle = (enter: number, exit: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterS = spring({
    frame: frame - enter,
    fps,
    config: { damping: 180, stiffness: 110, mass: 0.75 },
  });
  const exitS = spring({
    frame: frame - exit,
    fps,
    config: { damping: 180, stiffness: 110, mass: 0.75 },
  });
  const opacity = enterS * (1 - exitS);
  const y = interpolate(enterS, [0, 1], [40, 0])
          + interpolate(exitS,  [0, 1], [0, -40]);
  return { opacity, y };
};

// Animated underline that grows left → right after the word appears.
const AccentWord: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  color?: string;
}> = ({ children, startFrame, color = ARIA_BLUE }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 180, stiffness: 110, mass: 0.7 },
  });
  const underline = spring({
    frame: frame - (startFrame + 10),
    fps,
    config: { damping: 200, stiffness: 90, mass: 0.9 },
  });
  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        color,
        opacity: reveal,
        transform: `translateY(${interpolate(reveal, [0, 1], [24, 0])}px)`,
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -10,
          height: 6,
          borderRadius: 3,
          background: color,
          transformOrigin: "left center",
          transform: `scaleX(${underline})`,
        }}
      />
    </span>
  );
};

// Per-word reveal (black text, slide up)
const Word: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  color?: string;
  weight?: number;
}> = ({ children, startFrame, color = INK, weight = 700 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 180, stiffness: 110, mass: 0.7 },
  });
  return (
    <span
      style={{
        display: "inline-block",
        color,
        fontWeight: weight,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
      }}
    >
      {children}
    </span>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneClick: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const b1 = useBlockLifecycle(BLOCKS.simply.enter,     BLOCKS.simply.exit);
  const b2 = useBlockLifecycle(BLOCKS.autonomous.enter, BLOCKS.autonomous.exit);
  const b3 = useBlockLifecycle(BLOCKS.execute.enter,    BLOCKS.execute.exit);
  const b4 = useBlockLifecycle(BLOCKS.workflow.enter,   BLOCKS.workflow.exit);

  // ── Zoom on the word "workflow": the black word scales up until its
  //    letters fill the screen and the entire stage becomes black.
  const zoom = spring({
    frame: frame - T_ZOOM_START,
    fps,
    config: { damping: 220, stiffness: 75, mass: 1.15 },
  });
  const workflowScale = interpolate(zoom, [0, 1], [1, 26]);
  const anyFade       = interpolate(zoom, [0, 0.25], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const paperFade     = interpolate(zoom, [0.55, 0.95], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: INK,
        fontFamily: interFont,
        overflow: "hidden",
      }}
    >
      {/* White paper stage — fades out during zoom to reveal black stage. */}
      <AbsoluteFill style={{ background: PAPER, opacity: paperFade }} />

      {/* ── Block 1 — "Simply" ───────────────────────────────────────────── */}
      <AbsoluteFill
        style={{
          opacity: b1.opacity,
          transform: `translateY(${b1.y}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: INK,
          fontSize: 140,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        Simply
      </AbsoluteFill>

      {/* ── Block 2 — "Your autonomous system" ───────────────────────────── */}
      <AbsoluteFill
        style={{
          opacity: b2.opacity,
          transform: `translateY(${b2.y}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: INK,
          fontSize: 140,
          fontWeight: 700,
          letterSpacing: -2,
          padding: "0 120px",
          textAlign: "center",
        }}
      >
        <div>
          <Word startFrame={BLOCKS.autonomous.enter + 3}>Your</Word>
          <span style={{ marginRight: 26 }} />
          <AccentWord startFrame={BLOCKS.autonomous.enter + 11}>
            autonomous
          </AccentWord>
          <span style={{ marginRight: 26 }} />
          <Word startFrame={BLOCKS.autonomous.enter + 22}>system</Word>
        </div>
      </AbsoluteFill>

      {/* ── Block 3 — "to manage, decide, and execute" ──────────────────── */}
      <AbsoluteFill
        style={{
          opacity: b3.opacity,
          transform: `translateY(${b3.y}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 140,
          fontWeight: 700,
          letterSpacing: -2,
          padding: "0 120px",
          textAlign: "center",
        }}
      >
        <div style={{ lineHeight: 1.3 }}>
          <Word startFrame={BLOCKS.execute.enter + 3} color={INK} weight={700}>
            to
          </Word>
          <span style={{ marginRight: 22 }} />
          <AccentWord startFrame={BLOCKS.execute.enter + 11}>manage</AccentWord>
          <Word startFrame={BLOCKS.execute.enter + 11} color={INK} weight={700}>
            ,&nbsp;
          </Word>
          <AccentWord startFrame={BLOCKS.execute.enter + 22}>decide</AccentWord>
          <Word startFrame={BLOCKS.execute.enter + 22} color={INK} weight={700}>
            ,&nbsp;
          </Word>
          <Word startFrame={BLOCKS.execute.enter + 30} color={INK} weight={700}>
            and
          </Word>
          <span style={{ marginRight: 22 }} />
          <AccentWord startFrame={BLOCKS.execute.enter + 37}>execute</AccentWord>
        </div>
      </AbsoluteFill>

      {/* ── Block 4 — "any workflow." with zoom on "workflow" ────────────── */}
      <AbsoluteFill
        style={{
          opacity: b4.opacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 140,
          letterSpacing: -2,
          padding: "0 120px",
          textAlign: "center",
          color: INK,
        }}
      >
        <div
          style={{
            transform: `translateY(${b4.y}px)`,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ opacity: anyFade, marginRight: 30 }}>
            <Word startFrame={BLOCKS.workflow.enter + 3} color={INK} weight={700}>
              any
            </Word>
          </span>
          <span
            style={{
              display: "inline-block",
              transform: `scale(${workflowScale})`,
              transformOrigin: "center center",
              color: INK,
              fontWeight: 900,
            }}
          >
            <Word startFrame={BLOCKS.workflow.enter + 12} color={INK} weight={900}>
              workflow
            </Word>
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
