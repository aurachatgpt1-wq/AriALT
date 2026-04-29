import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { geistFont, ARIA_COLORS } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// SceneKanbanFlow — STANDALONE scene wedged between BlobHold's "Autonomous
// task management" reveal and its "means / Reduction in staff costs" tail.
//
// Story arc (scene-local frames @ 30fps, total 180f ≈ 6s):
//   P1   0 –  90  WO-2848 detail card materializes flat at center, pills /
//                  title (typewriter) / 5 info boxes stagger in
//   P2  90 – 130  Card transitions to 3D perspective tilt (rotateX) — same
//                  treatment as the "From alert. To action." reference
//   P3 130 – 180  "and execution" caption appears ABOVE the tilted card
//                  (lighter weight than full-bold blob phrase styling)
//
// Nothing else lives here — no full kanban board, no route flights. Those
// belong to SceneKanbanRouting which mounts AFTER this scene in Act2.
// ─────────────────────────────────────────────────────────────────────────────

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const INK = ARIA_COLORS.foreground;
const MUTED = ARIA_COLORS.mutedFg;
const PAGE_BG = "#F3F4F7";
const CARD_BG = "#FFFFFF";
const APPLE_ACCENT = "#3B5BDB";

// ── Phase timing ────────────────────────────────────────────────────────────
const BG_FADE_IN_END   = 8;
// Detail card phase
const D_CARD_IN_AT     = 6;
const D_WO_AT          = 14;
const D_CRIT_AT        = 20;
const D_GEN_AT         = 26;
const D_PROGRESS_AT    = 32;
const D_TITLE_AT       = 36;
const D_TITLE_END      = 76;
const D_BOX_BASE       = 60;
const D_BOX_STAGGER    = 6;
// Perspective transition (card stays in frame, just tilts)
const TILT_START       = 90;
const TILT_END         = 130;
// "and execution" caption
const AND_EXEC_AT      = 130;
const AND_EXEC_END     = 180;

const SCENE_END        = 180;

// ── DETAIL CARD COMPONENTS ─────────────────────────────────────────────────
const Pill: React.FC<{
  label: string;
  bg: string; fg: string;
  appearAt: number; frame: number; fps: number;
  withDot?: boolean;
}> = ({ label, bg, fg, appearAt, frame, fps, withDot }) => {
  const sp = spring({
    frame: frame - appearAt, fps,
    config: { stiffness: 240, damping: 20, mass: 0.6 },
  });
  const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const scale = interpolate(sp, [0, 1], [0.85, 1], CLAMP);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "5px 12px", borderRadius: 999,
      background: bg, color: fg,
      fontSize: 13, fontFamily: geistFont, fontWeight: 800,
      letterSpacing: "0.08em",
      opacity: op,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    }}>
      {withDot && (
        <span style={{
          width: 6, height: 6, borderRadius: 999, background: fg,
        }} />
      )}
      {label}
    </span>
  );
};

const InfoBox: React.FC<{
  label: string;
  value: string;
  sub?: string;
  appearAt: number;
  frame: number; fps: number;
  flex?: number;
}> = ({ label, value, sub, appearAt, frame, fps, flex = 1 }) => {
  const sp = spring({
    frame: frame - appearAt, fps,
    config: { stiffness: 220, damping: 22, mass: 0.7 },
  });
  const op = interpolate(sp, [0, 1], [0, 1], CLAMP);
  const ty = interpolate(sp, [0, 1], [16, 0], CLAMP);

  return (
    <div style={{
      flex,
      background: "#F8F9FB",
      border: "1px solid #ECEEF2",
      borderRadius: 14,
      padding: "16px 20px 18px",
      opacity: op,
      transform: `translateY(${ty}px)`,
      minWidth: 0,
    }}>
      <div style={{
        fontSize: 11, fontFamily: geistFont, fontWeight: 700,
        color: "#9AA0B0", letterSpacing: "0.14em",
        marginBottom: 8, textTransform: "uppercase",
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontFamily: geistFont, fontWeight: 700,
        color: INK, letterSpacing: "-0.012em",
        marginBottom: sub ? 4 : 0,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{value}</div>
      {sub && (
        <div style={{
          fontSize: 13, fontFamily: geistFont, color: MUTED,
          letterSpacing: "-0.005em",
        }}>{sub}</div>
      )}
    </div>
  );
};

// ── "and execution" caption (less bold than BlobHold's burst phrasing) ────
const AndExecutionCaption: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < AND_EXEC_AT || frame >= AND_EXEC_END) return null;
  const lf = frame - AND_EXEC_AT;
  const dur = AND_EXEC_END - AND_EXEC_AT;
  const enterT = interpolate(lf, [0, 16], [0, 1], CLAMP);
  const exitT  = interpolate(lf, [dur - 12, dur], [0, 1], CLAMP);
  const op = enterT * (1 - exitT);
  const ty = interpolate(enterT, [0, 1], [12, 0], CLAMP);

  // Underline draws in
  const ulSp = spring({ frame: lf - 4, fps, config: { stiffness: 200, damping: 22, mass: 0.7 } });
  const ulProg = interpolate(ulSp, [0, 1], [0, 1], CLAMP);

  return (
    <div style={{
      position: "absolute",
      left: 0, right: 0, top: "10%",
      display: "flex", justifyContent: "center",
      zIndex: 60, pointerEvents: "none",
      opacity: op,
      transform: `translateY(${ty}px)`,
    }}>
      <span style={{
        position: "relative", display: "inline-block",
        fontFamily: geistFont, fontSize: 96, fontWeight: 600,
        letterSpacing: "-0.02em", lineHeight: 1.05,
        color: INK,
      }}>
        and{" "}
        <span style={{
          color: APPLE_ACCENT, fontStyle: "italic", fontWeight: 600,
          position: "relative", display: "inline-block",
        }}>
          Execution
          {ulProg > 0.001 && (
            <svg viewBox="0 0 600 16" preserveAspectRatio="none" style={{
              position: "absolute", left: -4, right: -4, bottom: -14,
              width: "calc(100% + 8px)", height: 16, overflow: "visible",
            }}>
              <path d="M 3 8 C 80 4, 180 13, 300 8 S 480 4, 596 10"
                stroke={APPLE_ACCENT} strokeWidth="5" strokeLinecap="round" fill="none"
                style={{ strokeDasharray: 620, strokeDashoffset: 620 * (1 - ulProg) }} />
            </svg>
          )}
        </span>
      </span>
    </div>
  );
};

// ── DETAIL CARD ────────────────────────────────────────────────────────────
const DetailCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Card pop-in
  const popSp = spring({
    frame: frame - D_CARD_IN_AT, fps,
    config: { stiffness: 200, damping: 24, mass: 0.8 },
  });
  const popOp    = interpolate(popSp, [0, 1], [0, 1], CLAMP);
  const popScale = interpolate(popSp, [0, 1], [0.86, 1], CLAMP);
  const popTy    = interpolate(popSp, [0, 1], [40, 0], CLAMP);

  // Title typewriter
  const TITLE = "OVEN_1 Peg Chain Motor T60M2 torque recovery";
  const titleProgress = interpolate(frame, [D_TITLE_AT, D_TITLE_END], [0, 1], CLAMP);
  const titleShown = Math.floor(TITLE.length * titleProgress);
  const titleText = TITLE.slice(0, titleShown);
  const showCaret = titleShown < TITLE.length && frame >= D_TITLE_AT;

  // Perspective tilt (P2): the card rotates forward + nudges down + scales
  // so the layout matches the "From alert. To action." reference.
  const tiltT = interpolate(
    frame, [TILT_START, TILT_END], [0, 1],
    { ...CLAMP, easing: Easing.inOut(Easing.cubic) },
  );
  const tiltRotX = tiltT * 22;          // forward tilt
  const tiltScale = interpolate(tiltT, [0, 1], [1, 0.88], CLAMP);
  const tiltTy   = interpolate(tiltT, [0, 1], [0, 90], CLAMP);   // nudge down

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      perspective: 1800,
      pointerEvents: "none",
      zIndex: 40,
    }}>
      <div style={{
        width: 1500,
        background: CARD_BG,
        borderRadius: 24,
        padding: "44px 56px 48px",
        border: "1px solid rgba(214,217,227,0.6)",
        boxShadow: tiltT > 0
          ? `0 ${30 + tiltT * 30}px ${80 + tiltT * 40}px -30px rgba(50,65,110,0.22), 0 8px 24px -8px rgba(50,65,110,0.10)`
          : "0 30px 80px -30px rgba(50,65,110,0.18), 0 8px 24px -8px rgba(50,65,110,0.08)",
        opacity: popOp,
        transform: `
          translateY(${popTy + tiltTy}px)
          scale(${popScale * tiltScale})
          rotateX(${tiltRotX}deg)
        `,
        transformOrigin: "center 95%",
        transformStyle: "preserve-3d",
        position: "relative",
      }}>
        {/* soft tint blurs */}
        <div style={{
          position: "absolute",
          right: -60, bottom: -100, width: 700, height: 260,
          background: "radial-gradient(circle, rgba(59,91,219,0.18), transparent 60%)",
          filter: "blur(60px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          left: -40, bottom: -80, width: 460, height: 200,
          background: "radial-gradient(circle, rgba(232,131,10,0.16), transparent 60%)",
          filter: "blur(60px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />

        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 22, position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              fontSize: 17, fontFamily: geistFont, fontWeight: 700, color: "#9AA0B0",
              letterSpacing: "0.04em",
              opacity: interpolate(frame, [D_WO_AT, D_WO_AT + 6], [0, 1], CLAMP),
            }}>WO-2848</span>
            <Pill label="CRITICAL" bg="#FDE7EA" fg="#DC2626"
              appearAt={D_CRIT_AT} frame={frame} fps={fps} />
            <Pill label="Generated by AriA" bg="rgba(59,91,219,0.10)" fg={APPLE_ACCENT}
              appearAt={D_GEN_AT} frame={frame} fps={fps} withDot />
          </div>
          <Pill label="IN PROGRESS" bg="#FFE9CF" fg="#C2410C"
            appearAt={D_PROGRESS_AT} frame={frame} fps={fps} />
        </div>

        {/* Title (typewriter) */}
        <div style={{
          fontSize: 64, fontFamily: geistFont, fontWeight: 800,
          color: INK, letterSpacing: "-0.022em", lineHeight: 1.05,
          marginBottom: 36, position: "relative", zIndex: 1,
          minHeight: 70,
        }}>
          {titleText}
          {showCaret && (
            <span style={{
              opacity: 0.45 + 0.55 * Math.abs(Math.sin(frame / 2.4)),
              color: APPLE_ACCENT, marginLeft: 4, fontWeight: 300,
            }}>|</span>
          )}
        </div>

        {/* 5 info boxes */}
        <div style={{
          display: "flex", gap: 16, position: "relative", zIndex: 1,
        }}>
          <InfoBox flex={1.15}
            label="Assigned to" value="Marco Rossi" sub="Senior Maintenance"
            appearAt={D_BOX_BASE + 0 * D_BOX_STAGGER} frame={frame} fps={fps} />
          <InfoBox flex={1.25}
            label="Location" value="Plant 1" sub="Baking Line 02 / Sector 8"
            appearAt={D_BOX_BASE + 1 * D_BOX_STAGGER} frame={frame} fps={fps} />
          <InfoBox flex={1.05}
            label="Due" value="Today, 18:00" sub="in 2h 30m"
            appearAt={D_BOX_BASE + 2 * D_BOX_STAGGER} frame={frame} fps={fps} />
          <InfoBox flex={0.85}
            label="Est. Time" value="1h 00m"
            appearAt={D_BOX_BASE + 3 * D_BOX_STAGGER} frame={frame} fps={fps} />
          <InfoBox flex={0.85}
            label="Est. Cost" value="€ 1,400"
            appearAt={D_BOX_BASE + 4 * D_BOX_STAGGER} frame={frame} fps={fps} />
        </div>
      </div>
    </div>
  );
};

// ── Scene ───────────────────────────────────────────────────────────────────
export const SceneKanbanFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = Math.min(
    interpolate(frame, [0, BG_FADE_IN_END], [0, 1], CLAMP),
    interpolate(frame, [SCENE_END - 14, SCENE_END], [1, 0], CLAMP),
  );

  return (
    <AbsoluteFill style={{ background: PAGE_BG, opacity: bgOp }}>
      <DetailCard frame={frame} fps={fps} />
      <AndExecutionCaption frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export const SCENE_KANBAN_FLOW_DURATION = SCENE_END;
