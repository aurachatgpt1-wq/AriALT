import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { geistFont, ARIA_COLORS } from "../constants";
import { WindRing3D } from "../components/WindRing3D";

// ─── Items ────────────────────────────────────────────────────────────────────
const ITEMS = [
  "Getting the context",
  "Aligning your goals",
  "Identifying applicable standards",
  "Adapting agents to your regulatory context",
  "Gathering your data",
  "Data Contextual Binding",
  "Orchestrating smart matchmaking",
];

// ─── Blue shimmer sweep (same as SceneFormProfile) ──────────────────────────
const getShimmerStyle = (localFrame: number): React.CSSProperties => {
  const sweepDur = 55;
  const pauseDur = 95;
  const cycleDur = sweepDur + pauseDur;
  const f = Math.max(0, localFrame);
  const phase = ((f % cycleDur) + cycleDur) % cycleDur;
  const pos = phase < sweepDur ? 95 - (phase / sweepDur) * 90 : 5;

  return {
    backgroundColor: "#1A1F33",
    backgroundImage:
      "linear-gradient(100deg, " +
      "#1A1F33 0%, " +
      "#1A1F33 42%, " +
      "rgba(120,150,255,0.95) 47%, " +
      "#ffffff 50%, " +
      "rgba(120,150,255,0.95) 53%, " +
      "#1A1F33 58%, " +
      "#1A1F33 100%)",
    backgroundSize: "300% 100%",
    backgroundPosition: `${pos}% 0%`,
    backgroundRepeat: "no-repeat",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };
};

// ─── Timing ──────────────────────────────────────────────────────────────────
// Blob starts at the regulatory phase's final white-circle position and morphs
// to the header position. Source position matches RegulatoryAnalyzingPhase:
// LIST_LEFT (=(1920-1100)/2=410) + LIST_BLOB_SIZE/2 - 6 = 474, CENTER_Y=540, size=140.
const BLOB_START_CX   = 474;
const BLOB_START_CY   = 540;
const BLOB_START_SIZE = 140;

const T_BLOB_MORPH  = 0;          // blob morph starts immediately
const T_BLOB_DONE   = 16;         // blob reached header position
const T_HEADER_TEXT = 14;          // "Executing the plan..." fades in as blob settles
const T_LIST_IN     = 22;         // list items fade in
const ITEM_START    = 40;         // first item starts completing
const ITEM_STEP     = 22;         // frames between each item completion (tight rhythm)
const STOP_AT_INDEX = 4;          // stop at item index 4 ("Gathering your data") — don't complete it

// Zoom phase: after item 3 completes, zoom into "Gathering your data" (index 4)
const T_ZOOM_START  = ITEM_START + STOP_AT_INDEX * ITEM_STEP + 4; // ~132
const T_ZOOM_END    = T_ZOOM_START + 24;                           // ~156
// "Space opens" — content parts vertically to let next scene enter
const T_SPLIT_START = T_ZOOM_END + 4;                              // ~160
const T_SPLIT_END   = T_SPLIT_START + 18;                          // ~178
const T_FADE_OUT_START = T_SPLIT_START + 10;
const T_FADE_OUT_END   = T_SPLIT_END;

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneExecutingPlan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sceneOp = interpolate(frame, [T_FADE_OUT_START, T_FADE_OUT_END], [1, 0], clamp);

  // Blob morph from regulatory phase end position → header position
  const blobMorphSp = spring({
    frame: frame - T_BLOB_MORPH, fps,
    config: { stiffness: 180, damping: 22, mass: 0.8 },
  });
  const HEADER_LEFT = 540;
  const HEADER_TOP  = 70;
  const BLOB_END_SIZE = 64;
  const BLOB_END_CX = HEADER_LEFT + BLOB_END_SIZE / 2;
  const BLOB_END_CY = HEADER_TOP + BLOB_END_SIZE / 2;

  const blobCX   = interpolate(blobMorphSp, [0, 1], [BLOB_START_CX, BLOB_END_CX], clamp);
  const blobCY   = interpolate(blobMorphSp, [0, 1], [BLOB_START_CY, BLOB_END_CY], clamp);
  const blobSize = interpolate(blobMorphSp, [0, 1], [BLOB_START_SIZE, BLOB_END_SIZE], clamp);

  // Header text ("Executing the plan...") fades in as blob settles
  const headerTextSp = spring({
    frame: frame - T_HEADER_TEXT, fps,
    config: { stiffness: 220, damping: 22, mass: 0.7 },
  });
  const headerTextOp = interpolate(headerTextSp, [0, 1], [0, 1], clamp);
  const headerTextX  = interpolate(headerTextSp, [0, 1], [-10, 0], clamp);

  // Blob breathing
  const t = frame / fps;
  const blobBreathe = 1 + Math.sin(t * 3.2) * 0.08;

  // Animated dots (stable: 3 dots, opacity-switched)
  const dotCount = Math.floor(frame / 7) % 4;

  // List container entrance
  const listSp = spring({
    frame: frame - T_LIST_IN, fps,
    config: { stiffness: 180, damping: 22, mass: 0.8 },
  });
  const listOp = interpolate(listSp, [0, 1], [0, 1], clamp);

  // Layout
  const LEFT       = 540;
  const TOP        = 170;
  const BULLET_W   = 58;
  const BULLET_GAP = 26;
  const ROW_H      = 104;

  // Camera zoom into "Gathering your data" (index STOP_AT_INDEX = 4)
  const zoomSp = spring({
    frame: frame - T_ZOOM_START, fps,
    config: { stiffness: 130, damping: 20, mass: 1.0 },
  });
  const cameraScale = interpolate(zoomSp, [0, 1], [1, 1.55], clamp);
  // Focal point: center of "Gathering your data" row
  const FOCAL_X = LEFT + BULLET_W / 2 + BULLET_GAP + 260; // roughly center of the text
  const FOCAL_Y = TOP + STOP_AT_INDEX * ROW_H + ROW_H / 2;
  const vignetteOp = interpolate(zoomSp, [0, 1], [0, 0.45], clamp);

  // ── Space opens — items above move UP, items below move DOWN
  const splitSp = spring({
    frame: frame - T_SPLIT_START, fps,
    config: { stiffness: 140, damping: 20, mass: 0.9 },
  });
  const splitOffset = interpolate(splitSp, [0, 1], [0, 600], clamp);
  // The focused "Gathering your data" row also fades/scales up as space opens
  const focusScale = interpolate(splitSp, [0, 1], [1, 1.15], clamp);
  const focusOp = interpolate(splitSp, [0, 0.6, 1], [1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{
      opacity: sceneOp,
      overflow: "hidden",
    }}>
      {/* ── Dynamic animated background (same as SceneFormProfile) ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#F0F3FF" }} />
      <div style={{
        position: "absolute",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.18) 0%, transparent 70%)",
        left: interpolate(frame, [0, 300], [-120, 60]),
        top:  interpolate(frame, [0, 300], [-160, -80]),
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute",
        width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,142,255,0.15) 0%, transparent 65%)",
        right: interpolate(frame, [0, 300], [-200, -80]),
        top:   interpolate(frame, [0, 300], [100, 260]),
        filter: "blur(70px)",
      }} />
      <div style={{
        position: "absolute",
        width: 700, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(165,184,255,0.20) 0%, transparent 65%)",
        left:   interpolate(frame, [0, 300], [200, 400]),
        bottom: interpolate(frame, [0, 300], [-180, -100]),
        filter: "blur(55px)",
      }} />
      <div style={{
        position: "absolute",
        width: 600, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.07) 0%, transparent 60%)",
        left: interpolate(frame, [0, 300], [500, 640]),
        top:  interpolate(frame, [0, 300], [150, 80]),
        filter: "blur(80px)",
      }} />
      {/* ── Camera zoom stage — everything inside scales toward "Gathering your data" ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform:
          `translate(${FOCAL_X * (1 - cameraScale)}px, ${FOCAL_Y * (1 - cameraScale)}px) ` +
          `scale(${cameraScale})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>
      {/* ── White circle halo (fades out as blob takes over) — carries over from
           the regulatory phase's scales-of-justice badge for a smooth handoff ── */}
      <div style={{
        position: "absolute",
        left: blobCX - blobSize / 2,
        top:  blobCY - blobSize / 2,
        width: blobSize,
        height: blobSize,
        borderRadius: "50%",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(59,91,219,0.08)",
        opacity: interpolate(frame, [0, 12], [1, 0], clamp),
        zIndex: 10,
      }} />

      {/* ── Blob (morphs from regulatory position → header position) ── */}
      <div style={{
        position: "absolute",
        left: blobCX - blobSize / 2,
        top:  blobCY - blobSize / 2 - splitOffset,
        width: blobSize,
        height: blobSize,
        transform: `scale(${blobBreathe})`,
        transformOrigin: "center",
        opacity: interpolate(frame, [0, 8], [0.3, 1], clamp) * interpolate(splitSp, [0, 0.8], [1, 0], clamp),
        zIndex: 11,
      }}>
        <WindRing3D size={blobSize} frame={frame} fps={fps} />
      </div>

      {/* ── "Executing the plan..." — fades in next to header blob ── */}
      <div style={{
        position: "absolute",
        left: HEADER_LEFT + BLOB_END_SIZE + 20,
        top: HEADER_TOP - splitOffset,
        height: BLOB_END_SIZE,
        display: "flex",
        alignItems: "center",
        opacity: headerTextOp * interpolate(splitSp, [0, 0.8], [1, 0], clamp),
        transform: `translateX(${headerTextX}px)`,
        fontFamily: geistFont,
        fontSize: 38,
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: ARIA_COLORS.mutedFg,
      }}>
        Building your platform
        <span style={{ opacity: dotCount >= 1 ? 1 : 0 }}>.</span>
        <span style={{ opacity: dotCount >= 2 ? 1 : 0 }}>.</span>
        <span style={{ opacity: dotCount >= 3 ? 1 : 0 }}>.</span>
      </div>

      {/* ── Checklist ── */}
      <div style={{
        position: "absolute",
        left: LEFT,
        top: TOP,
        opacity: listOp,
      }}>
        {ITEMS.map((label, i) => {
          // Progress for this item: 0 = pending (number circle), 1 = completed (green check, strikethrough)
          // Items at or after STOP_AT_INDEX never complete — they stay pending
          const itemFrame = ITEM_START + i * ITEM_STEP;
          const completeT = i < STOP_AT_INDEX ? spring({
            frame: frame - itemFrame, fps,
            config: { stiffness: 260, damping: 22, mass: 0.6 },
          }) : 0;
          const isCompleted = completeT > 0.05;

          // Strikethrough width animation
          const strikeW = interpolate(completeT, [0, 1], [0, 100], clamp);

          // Circle fill (pending → green check)
          const circleFill = interpolate(completeT, [0, 1], [0, 1], clamp);

          // Item appear (staggered fade in even before completion)
          const appearSp = spring({
            frame: frame - (T_LIST_IN + 2 + i * 2), fps,
            config: { stiffness: 220, damping: 22, mass: 0.7 },
          });
          const itemOp = interpolate(appearSp, [0, 1], [0, 1], clamp);
          const itemX  = interpolate(appearSp, [0, 1], [-12, 0], clamp);

          // Split offset: items above STOP_AT_INDEX move UP, below move DOWN.
          // "Gathering your data" (index 4) stays but fades out as space opens.
          const isFocus = i === STOP_AT_INDEX;
          const splitY = isFocus
            ? 0
            : (i < STOP_AT_INDEX ? -splitOffset : splitOffset);
          const nonFocusFade = isFocus
            ? 1
            : interpolate(splitSp, [0, 0.8], [1, 0], clamp);
          const focusItemOp = isFocus ? focusOp : 1;
          const focusItemScale = isFocus ? focusScale : 1;

          // Shimmer sweep on the focused "Gathering your data" — activates ONLY
          // when the checklist reaches its turn (item index 4 = STOP_AT_INDEX).
          const focusTurnFrame = ITEM_START + STOP_AT_INDEX * ITEM_STEP;
          const shimmerActive = isFocus && frame >= focusTurnFrame;

          return (
            <div key={label} style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: BULLET_GAP,
              height: ROW_H,
              opacity: itemOp * nonFocusFade * focusItemOp,
              transform: `translate(${itemX}px, ${splitY}px) scale(${focusItemScale})`,
              transformOrigin: "left center",
              willChange: "transform, opacity",
            }}>
              {/* Circle / Check */}
              <div style={{
                width: BULLET_W, height: BULLET_W,
                borderRadius: "50%",
                flexShrink: 0,
                position: "relative",
                border: isCompleted ? "none" : `2px solid rgba(154,160,176,0.45)`,
                backgroundColor: `rgba(31,168,112,${circleFill})`,
                transition: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {/* Pending number (fades out when completing) */}
                <span style={{
                  position: "absolute",
                  fontFamily: geistFont,
                  fontSize: 22,
                  fontWeight: 500,
                  color: "rgba(154,160,176,0.75)",
                  opacity: 1 - circleFill,
                }}>
                  {i + 1}
                </span>
                {/* Green checkmark (fades in when completing) */}
                <svg
                  viewBox="0 0 24 24"
                  width={30}
                  height={30}
                  style={{ opacity: circleFill, position: "absolute" }}
                >
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Label with animated strikethrough */}
              <div style={{
                position: "relative",
                fontFamily: geistFont,
                fontSize: 40,
                fontWeight: 500,
                letterSpacing: "-0.015em",
                color: ARIA_COLORS.foreground,
                whiteSpace: "nowrap",
                ...(shimmerActive ? getShimmerStyle(frame - focusTurnFrame) : {}),
              }}>
                {label}
                {/* Strikethrough line — grows from left to right */}
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  height: 2.5,
                  width: `${strikeW}%`,
                  backgroundColor: ARIA_COLORS.foreground,
                  transform: "translateY(-50%)",
                }} />
              </div>
            </div>
          );
        })}
      </div>
      </div>
      {/* end camera zoom stage */}

      {/* Vignette overlay during zoom */}
      {vignetteOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)",
          opacity: vignetteOp,
          zIndex: 20,
          pointerEvents: "none",
          mixBlendMode: "multiply",
        }} />
      )}
    </AbsoluteFill>
  );
};
