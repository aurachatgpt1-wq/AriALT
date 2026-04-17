import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

// ─── Items ────────────────────────────────────────────────────────────────────
const ITEMS = [
  "Memory Persistent",
  "Context-aware",
  "No prompts needed",
  "Tailored on your Data",
  "Works with your existing systems",
  "Compliant with your standards",
  "No setup costs",
  "Autonomous by design",
  "Ready from day one",
];
const LAST_IDX = ITEMS.length - 1;

// ─── Timing (relative to this scene's frame 0) ──────────────────────────────
const T_LIST_IN     = 10;           // list starts scrolling
const T_LIST_BASE   = 18;
const LIST_STEP     = 19;
const T_ZOOM        = T_LIST_BASE + 7 * LIST_STEP + 28;     // ~179
const T_FINAL_ZOOM_END  = T_ZOOM + 30;
const T_FINAL_HOLD_END  = T_FINAL_ZOOM_END + 18;
const T_SCENE_OUT_START = T_FINAL_HOLD_END;
const T_SCENE_OUT_END   = T_SCENE_OUT_START + 17;

// ─── Layout ──────────────────────────────────────────────────────────────────
const CHECK_Y       = 540;
const SLOT_H        = 150;
const CHECK_LOGO_SIZE = 128;
const LOGO_GAP      = 52;
const CHECK_LOGO_CX = 580;
const CHECK_LOGO_CY = CHECK_Y;
const FOCUSED_TEXT_X = CHECK_LOGO_CX + CHECK_LOGO_SIZE / 2 + LOGO_GAP;
const CURVE_MAX_PX  = 230;
const CURVE_MAX_DIST = 2.6;
const LOGO_BR_RATIO = 0.22;
const FOCAL_X       = CHECK_LOGO_CX + 260;
const FOCAL_Y       = CHECK_Y;

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneBridgeList: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const sceneOp = interpolate(frame, [T_SCENE_OUT_START, T_SCENE_OUT_END], [1, 0], clamp);

  // List entrance
  const p2Op = interpolate(frame, [T_LIST_IN, T_LIST_IN + 14], [0, 1], clamp);

  // List scroll
  const TRIGGERS = Array.from({ length: 8 }, (_, i) => T_LIST_BASE + i * LIST_STEP);
  const scrollPos = TRIGGERS.reduce((acc, f) =>
    acc + spring({ frame: frame - f, fps, config: { stiffness: 110, damping: 26, mass: 1.1 } }),
    0
  );

  // Per-item zoom
  const zoomT = spring({ frame: frame - T_ZOOM, fps, config: { stiffness: 100, damping: 20, mass: 1.3 } });
  const zoomScale = interpolate(zoomT, [0, 1], [1, 1.32]);

  // Camera zoom
  const finalZoomT = spring({
    frame: frame - T_ZOOM, fps,
    config: { stiffness: 70, damping: 22, mass: 1.4 },
  });
  const cameraScale = interpolate(finalZoomT, [0, 1], [1, 1.65]);
  const vignetteOp = interpolate(finalZoomT, [0, 1], [0, 0.55], clamp);

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>

      {/* ── Background gradient ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#6FA3CC" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, #A8C4E8 0%, #7BAFD4 45%, #5E9EC8 100%)" }} />
      <div style={{
        position: "absolute", width: 1000, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147,197,253,0.38) 0%, transparent 65%)",
        right: -200, bottom: -160, filter: "blur(90px)",
      }} />

      {/* Fade masks */}
      {p2Op > 0.01 && (
        <>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 300,
            background: "linear-gradient(to bottom, rgba(95,148,195,0.94) 0%, transparent 100%)",
            zIndex: 5, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 320,
            background: "linear-gradient(to top, rgba(95,148,195,0.94) 0%, transparent 100%)",
            zIndex: 5, pointerEvents: "none",
          }} />
        </>
      )}

      {/* ── Camera-zoom stage ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform:
          `translate(${FOCAL_X * (1 - cameraScale)}px, ${FOCAL_Y * (1 - cameraScale)}px) ` +
          `scale(${cameraScale})`,
        transformOrigin: "0 0",
        willChange: "transform",
      }}>

        {p2Op > 0.01 && (
          <>
            {/* Atmospheric glow */}
            <div style={{
              position: "absolute",
              left: FOCUSED_TEXT_X - 320,
              top: CHECK_Y - 260,
              width: 1700, height: 520,
              pointerEvents: "none", zIndex: 6,
              background:
                "radial-gradient(ellipse at 22% 50%, " +
                "rgba(240,248,255,0.30) 0%, rgba(186,216,245,0.18) 32%, rgba(120,170,220,0) 72%)",
              filter: "blur(32px)",
              opacity: p2Op,
            }} />

            {/* Scrolling list */}
            {ITEMS.map((label, i) => {
              const distance = i - scrollPos;
              const absDist  = Math.abs(distance);
              if (absDist > 3.1) return null;

              const isLast = i === LAST_IDX;
              const yPos   = CHECK_Y + distance * SLOT_H;
              const requestedFontSize = interpolate(
                absDist, [0, 0.5, 1.2, 2.2], [92, 92, 52, 32],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const itemOp = interpolate(
                absDist, [0, 0.15, 0.85, 1.8, 2.8], [1, 1, 0.32, 0.14, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              );
              const fontWeight = absDist < 0.35 ? 800 : 400;

              const curveT  = Math.min(1, absDist / CURVE_MAX_DIST);
              const recess  = (1 - Math.cos(curveT * Math.PI / 2)) * CURVE_MAX_PX;
              const itemX   = FOCUSED_TEXT_X - recess;

              const SCREEN_RIGHT_MARGIN = 80;
              const availableW = 1920 - itemX - SCREEN_RIGHT_MARGIN;
              const CHAR_W_RATIO = 0.50;
              const naturalW = label.length * requestedFontSize * CHAR_W_RATIO;
              const fit = naturalW > availableW ? availableW / naturalW : 1;
              const baseFontSize = requestedFontSize * fit;

              const scale = isLast && absDist < 0.5 ? zoomScale : 1;
              const finalZoomFade = isLast
                ? 1
                : interpolate(finalZoomT, [0, 1], [1, 0], clamp);

              const focusedGlow = Math.max(0, 1 - absDist / 0.4);
              const itemFilter = focusedGlow > 0.01
                ? `drop-shadow(0 0 ${14 * focusedGlow}px rgba(255,255,255,${0.32 * focusedGlow})) ` +
                  `drop-shadow(0 0 ${36 * focusedGlow}px rgba(180,215,245,${0.22 * focusedGlow}))`
                : "none";

              return (
                <div key={label} style={{
                  position: "absolute",
                  left: itemX, top: yPos,
                  transform: `translateY(-50%) scale(${scale})`,
                  transformOrigin: "left center",
                  opacity: p2Op * itemOp * finalZoomFade,
                  pointerEvents: "none", zIndex: 8,
                  filter: itemFilter,
                  willChange: "transform, opacity, filter",
                }}>
                  <span style={{
                    fontFamily: interFont,
                    fontSize: baseFontSize, fontWeight,
                    color: "rgba(255,255,255,0.97)",
                    letterSpacing: absDist < 0.35 ? "-0.034em" : "-0.014em",
                    whiteSpace: "nowrap",
                  }}>{label}</span>
                </div>
              );
            })}
          </>
        )}

        {/* ── Logo at check position ── */}
        <div style={{
          position: "absolute",
          left: CHECK_LOGO_CX - CHECK_LOGO_SIZE / 2,
          top: CHECK_LOGO_CY - CHECK_LOGO_SIZE / 2,
          width: CHECK_LOGO_SIZE, height: CHECK_LOGO_SIZE,
          zIndex: 10,
        }}>
          <div style={{
            width: "100%", height: "100%",
            borderRadius: CHECK_LOGO_SIZE * LOGO_BR_RATIO,
            overflow: "hidden",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
          }}>
            <Img
              src={staticFile("aria-logo.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

      </div>{/* end camera-zoom stage */}

      {/* Vignette */}
      {vignetteOp > 0.01 && (
        <div style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.60) 100%)",
          opacity: vignetteOp,
          zIndex: 11, pointerEvents: "none", mixBlendMode: "multiply",
        }} />
      )}

    </AbsoluteFill>
  );
};
