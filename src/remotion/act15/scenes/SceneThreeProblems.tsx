import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

// ─── Config ───────────────────────────────────────────────────────────────────
const ORB_SIZE  = 52;
const CONTENT_W = 1100;
const ROW_H     = 92;              // px per slot
const MAX_ROWS  = 4;               // visible rows at once
const CLIP_H    = ROW_H * MAX_ROWS;// 368px clipped window
const ANCHOR_Y  = CLIP_H - ROW_H; // 276 — Y of the bottom (newest) row

// Centered block
const BLOCK_H    = ORB_SIZE + 36 + CLIP_H;    // 52+36+368 = 456
const BLOCK_TOP  = (1080 - BLOCK_H) / 2;       // 312
const BLOCK_LEFT = (1920 - CONTENT_W) / 2;     // 410

const ITEMS = [
  { text: "Memory resets with every conversation", delay: 28  },
  { text: "Context is generic, not yours",         delay: 66  },
  { text: "Your data stays out of the loop",       delay: 104 },
  { text: "No integration with your systems",      delay: 142 },
  { text: "You still have to take the action",     delay: 180 },
];

// ─── Grey Orb ─────────────────────────────────────────────────────────────────
const GreyOrb: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const spin  = (frame / fps) * 30;
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 1.4);
  const glow  = ORB_SIZE * (1.06 + pulse * 0.05);
  return (
    <div style={{ position: "relative", width: ORB_SIZE, height: ORB_SIZE, flexShrink: 0 }}>
      <div style={{
        position: "absolute", width: glow * 2, height: glow * 2, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(156,163,175,0.28) 0%, transparent 60%)",
        left: "50%", top: "50%", transform: "translate(-50%,-50%)", filter: "blur(14px)",
      }} />
      <div style={{
        width: ORB_SIZE, height: ORB_SIZE, borderRadius: "50%",
        background: `conic-gradient(from ${spin}deg, #9CA3AF, #C8CBD0, #D1D5DB, #B0B7C3, #9CA3AF)`,
        boxShadow: `0 0 ${ORB_SIZE * 0.4}px rgba(156,163,175,0.45)`,
      }} />
      <div style={{
        position: "absolute", width: ORB_SIZE * 0.38, height: ORB_SIZE * 0.26, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.26) 0%, transparent 70%)",
        top: ORB_SIZE * 0.10, left: ORB_SIZE * 0.13,
      }} />
    </div>
  );
};

// ─── Red X circle ─────────────────────────────────────────────────────────────
const XCircle: React.FC<{ size?: number }> = ({ size = 42 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    backgroundColor: "rgba(220,38,38,0.09)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <line x1="2" y1="2" x2="11" y2="11" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
      <line x1="11" y1="2" x2="2" y2="11" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const SceneThreeProblems: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (f: number, s = 300, d = 26, m = 0.6) =>
    spring({ frame: frame - f, fps, config: { stiffness: s, damping: d, mass: m } });

  const globalOut = interpolate(frame, [256, 270], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Orb entrance
  const orbEnter = sp(4, 360, 20, 0.5);

  // Scroll offset: each item after the first pushes the stack up by ROW_H
  const scrollY = ITEMS.reduce((acc, item, i) => {
    if (i === 0) return acc;
    return acc + spring({
      frame: frame - item.delay,
      fps,
      config: { stiffness: 200, damping: 28, mass: 0.85 },
    }) * ROW_H;
  }, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#F8F9FC", opacity: globalOut }}>

      <div style={{
        position: "absolute",
        top: BLOCK_TOP,
        left: BLOCK_LEFT,
        width: CONTENT_W,
        height: BLOCK_H,
      }}>

        {/* ── Orb row ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          height: ORB_SIZE, marginBottom: 36,
          opacity: interpolate(orbEnter, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(orbEnter, [0, 1], [10, 0])}px)`,
        }}>
          <GreyOrb frame={frame} fps={fps} />
          <span style={{
            fontFamily: interFont, fontSize: 24, fontWeight: 600,
            color: "#9CA3AF", letterSpacing: "-0.01em",
          }}>
            Generic AI
          </span>
        </div>

        {/* ── Clipped list window ── */}
        <div style={{
          position: "relative",
          height: CLIP_H,
          overflow: "hidden",
        }}>

          {/* Top-of-window fade — hides items scrolling off the top */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: ROW_H * 1.6,
            background: "linear-gradient(to bottom, #F8F9FC 0%, rgba(248,249,252,0) 100%)",
            zIndex: 10, pointerEvents: "none",
          }} />

          {ITEMS.map((item, i) => {
            // Skip until 8 frames before this item's entry
            if (frame < item.delay - 8) return null;

            // Entry animation spring (per-item)
            const entryT  = sp(item.delay, 320, 26, 0.5);
            const slideIn  = interpolate(entryT, [0, 1], [32, 0]);
            const fadeIn   = interpolate(entryT, [0, 1], [0, 1]);

            // Slot: 0 = bottom (newest), grows as item scrolls up
            const slot = scrollY / ROW_H - i;

            // Y position within the clip window
            const posY = ANCHOR_Y + i * ROW_H - scrollY;

            // Font size: large at bottom, shrinks as item rises
            const fontSize = interpolate(
              slot, [0, 1, 2, 3],
              [46, 37, 30, 25],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            // Icon size: also shrinks with depth
            const iconSize = Math.round(interpolate(
              slot, [0, 1, 2, 3],
              [42, 36, 30, 25],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            ));

            // Opacity: fades as it rises
            const depthAlpha = interpolate(
              slot, [0, 0.4, 1.4, 2.4, 3.2],
              [1,   1,   0.55, 0.2, 0.05],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div key={item.text} style={{
                position: "absolute",
                top: posY + slideIn,
                left: 0, right: 0,
                height: ROW_H,
                display: "flex", alignItems: "center", gap: 18,
                opacity: fadeIn * depthAlpha,
              }}>
                <XCircle size={iconSize} />
                <span style={{
                  fontFamily: interFont,
                  fontSize,
                  fontWeight: 500,
                  color: "#1D1D1F",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}>
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </AbsoluteFill>
  );
};
