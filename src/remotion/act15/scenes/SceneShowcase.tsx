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

// ─── Browser window chrome ───────────────────────────────────────────────────
const BrowserFrame: React.FC<{
  src: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
}> = ({ src, width, height, style }) => {
  const barH = 32;
  return (
    <div
      style={{
        width,
        height: height + barH,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow:
          "0 8px 24px rgba(0,0,0,0.15), " +
          "0 24px 48px rgba(0,0,0,0.12), " +
          "0 48px 80px rgba(20,40,80,0.10), " +
          "inset 0 0 0 0.5px rgba(255,255,255,0.25)",
        flexShrink: 0,
        transform: "perspective(1200px) rotateX(1.5deg)",
        transformOrigin: "center bottom",
        ...style,
      }}
    >
      <div
        style={{
          height: barH,
          background: "linear-gradient(180deg, #FAFAFA 0%, #ECECEC 100%)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          gap: 8,
          borderBottom: "1px solid #D5D5D5",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F57", boxShadow: "0 1px 3px rgba(255,95,87,0.4)" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FEBC2E", boxShadow: "0 1px 3px rgba(254,188,46,0.4)" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28C840", boxShadow: "0 1px 3px rgba(40,200,64,0.4)" }} />
      </div>
      <div style={{ width, height, overflow: "hidden" }}>
        <Img
          src={staticFile(src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }}
        />
      </div>
    </div>
  );
};

// ─── Scrolling rows ──────────────────────────────────────────────────────────
const WINDOW_W = 520;
const WINDOW_H = 330;
const GAP = 34;
const ITEM_W = WINDOW_W + GAP;

const ALL_SRCS = [
  "showcase/a.png", "showcase/f.png", "showcase/d.png", "showcase/h.png",
  "showcase/b.png", "showcase/g.png", "showcase/e.png", "showcase/i.png",
];
const TOP_STRIP = [...ALL_SRCS, ...ALL_SRCS, ...ALL_SRCS];
const BOT_SRCS = [...ALL_SRCS].reverse();
const BOT_STRIP = [...BOT_SRCS, ...BOT_SRCS, ...BOT_SRCS];

const TOP_ROW_Y = 50;
const BOT_ROW_Y = 700;
const SCROLL_SPEED = 2.2;

// ─── Logo positions ──────────────────────────────────────────────────────────
// Start: matches SceneBridge logo (shifted up after flip)
const START_CX = 960;
const START_CY = 200;
const START_SIZE = 110;

// Middle: centered during showcase (no text, just logo between rows)
const MID_CX = 960;
const MID_CY = 556;
const MID_SIZE = 120;

// End: matches SceneBridgeList check position
const END_CX = 580;
const END_CY = 540;
const END_SIZE = 128;

// ─── Timing ──────────────────────────────────────────────────────────────────
const T_MORPH_TO_MID = 20;      // logo shrinks from hero to mid position
const T_ROWS_IN = 30;           // screenshots start
const T_MORPH_TO_END = 240;     // logo starts moving to list position
const T_FADE_OUT_START = 280;
const T_FADE_OUT_END = 310;

// ─── Component ───────────────────────────────────────────────────────────────
export const SceneShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clamp = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
  };

  const sceneOp = interpolate(frame, [T_FADE_OUT_START, T_FADE_OUT_END], [1, 0], clamp);

  // ── Logo morph: START → MID → END ──
  // Phase 1: hero center → small top-center
  const morph1 = spring({
    frame: frame - T_MORPH_TO_MID, fps,
    config: { stiffness: 100, damping: 20, mass: 1.0 },
  });
  // Phase 2: small top-center → list check position
  const morph2 = spring({
    frame: frame - T_MORPH_TO_END, fps,
    config: { stiffness: 120, damping: 22, mass: 1.0 },
  });

  // Interpolate through the three positions
  const logoCX_mid   = interpolate(morph1, [0, 1], [START_CX, MID_CX], clamp);
  const logoCY_mid   = interpolate(morph1, [0, 1], [START_CY, MID_CY], clamp);
  const logoSize_mid = interpolate(morph1, [0, 1], [START_SIZE, MID_SIZE], clamp);

  const logoCX   = interpolate(morph2, [0, 1], [logoCX_mid, END_CX], clamp);
  const logoCY   = interpolate(morph2, [0, 1], [logoCY_mid, END_CY], clamp);
  const logoSize = interpolate(morph2, [0, 1], [logoSize_mid, END_SIZE], clamp);

  const logoShadow = interpolate(morph1, [0, 1], [1, 0.3], clamp);
  // Shadow grows again when logo goes to end position
  const logoShadowEnd = interpolate(morph2, [0, 1], [logoShadow, 0.7], clamp);

  // Rows entrance
  const rowSp = spring({
    frame: frame - T_ROWS_IN, fps,
    config: { stiffness: 100, damping: 24, mass: 1.0 },
  });
  const rowOp = interpolate(rowSp, [0, 1], [0, 0.70], clamp);
  // Rows fade out when logo starts moving to end position
  const rowFadeOut = interpolate(frame, [T_MORPH_TO_END, T_MORPH_TO_END + 30], [1, 0], clamp);

  // Continuous scroll
  const scrollOffset = frame * SCROLL_SPEED;
  const stripW = TOP_STRIP.length * ITEM_W;
  const topStartX = -stripW / 3;
  const botStartX = -stripW / 3;
  const topX = topStartX + scrollOffset;
  const botX = botStartX - scrollOffset;

  // (tagline removed — shown in SceneBridge instead)

  return (
    <AbsoluteFill style={{ opacity: sceneOp, overflow: "hidden" }}>
      {/* ── Background gradient (matches SceneBridge) ── */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#6FA3CC" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, #A8C4E8 0%, #7BAFD4 45%, #5E9EC8 100%)" }} />
      <div style={{
        position: "absolute",
        width: 1000, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(147,197,253,0.38) 0%, transparent 65%)",
        right: -200, bottom: -160, filter: "blur(90px)",
      }} />

      {/* ── Top row — scrolls RIGHT ── */}
      <div style={{
        position: "absolute", top: TOP_ROW_Y, left: 0,
        height: WINDOW_H + 32, overflow: "visible",
        opacity: rowOp * rowFadeOut,
      }}>
        <div style={{
          display: "flex", gap: GAP,
          transform: `translateX(${topX}px)`,
          willChange: "transform",
        }}>
          {TOP_STRIP.map((src, i) => (
            <BrowserFrame key={`top-${i}`} src={src} width={WINDOW_W} height={WINDOW_H} />
          ))}
        </div>
      </div>

      {/* ── Bottom row — scrolls LEFT ── */}
      <div style={{
        position: "absolute", top: BOT_ROW_Y, left: 0,
        height: WINDOW_H + 32, overflow: "visible",
        opacity: rowOp * rowFadeOut,
      }}>
        <div style={{
          display: "flex", gap: GAP,
          transform: `translateX(${botX}px)`,
          willChange: "transform",
        }}>
          {BOT_STRIP.map((src, i) => (
            <BrowserFrame key={`bot-${i}`} src={src} width={WINDOW_W} height={WINDOW_H} />
          ))}
        </div>
      </div>

      {/* ── Logo (morphs through 3 positions) ── */}
      <div style={{
        position: "absolute",
        left: logoCX - logoSize / 2,
        top: logoCY - logoSize / 2,
        width: logoSize, height: logoSize,
        borderRadius: logoSize * 0.22,
        overflow: "hidden",
        zIndex: 12,
        boxShadow:
          `0 ${4 + logoShadowEnd * 18}px ${14 + logoShadowEnd * 36}px rgba(0,0,0,${0.12 + logoShadowEnd * 0.18}), ` +
          `0 ${10 + logoShadowEnd * 24}px ${48 + logoShadowEnd * 40}px rgba(20,40,80,${0.18 + logoShadowEnd * 0.18})`,
        willChange: "transform",
      }}>
        <Img
          src={staticFile("aria-logo.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};
