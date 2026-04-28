// ─────────────────────────────────────────────────────────────────────────────
// Phone Dashboard Intro — the iPhone "Overview" screen of the AriA app, shown
// as the very first beat of the promotional video. Pure mobile UI at full
// 1080×2280 portrait resolution (396×836 source, 2.727× uniform scale), no
// 3D phone body or bezel — just the app surface, animated top-to-bottom.
//
// Flow:
//   Renders the full Overview dashboard instantly in its final, settled state
//   — no staggered card entrance, no progress-bar fill, no title slide.
//   The dashboard is meant to read as "already there" from the first frame
//   so the viewer sees a complete app screen, not a build-up.
//
// Output:
//   - Aspect   : 1080 × 2280
//   - FPS      : 30
//   - Duration : 210 frames (7 s)
//   - Surface  : #F3F4F7 (native app surface color)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Inter";

const { fontFamily: geistFont } = loadGeist();

// ─── Source screen dimensions + uniform scale to 1080-wide canvas ───────────
const SRC_SCREEN_W = 396;
const SRC_SCREEN_H = 836;
const SCREEN_SCALE = 1080 / SRC_SCREEN_W;   // ≈ 2.727

export const PHONE_DASH_FPS      = 30;
export const PHONE_DASH_WIDTH    = SRC_SCREEN_W * SCREEN_SCALE;       // 1080
export const PHONE_DASH_HEIGHT   = Math.round(SRC_SCREEN_H * SCREEN_SCALE); // 2280
export const PHONE_DASH_DURATION = 210;

// ─── Tokens ─────────────────────────────────────────────────────────────────
const INK       = "#0F0F12";
const MUTED     = "#5A6070";
const LABEL     = "#8A91A0";
const SUCCESS   = "#10B981";
const ORANGE    = "#F59E0B";
const ORANGE_BG = "#FFE7CC";
const SUCCESS_BG = "#D6F5E8";

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

// ─────────────────────────────────────────────────────────────────────────────
// Small SVG glyphs — SF Symbols-style, drawn flat and thin so they read at any
// scale. Colors are passed in from the parent card.
// ─────────────────────────────────────────────────────────────────────────────

const IconBars: React.FC<{ color: string; size?: number }> = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="8" width="2.2" height="4.5" rx="0.6" fill={color} />
    <rect x="5.9" y="5" width="2.2" height="7.5" rx="0.6" fill={color} />
    <rect x="10.3" y="2" width="2.2" height="10.5" rx="0.6" fill={color} />
  </svg>
);

const IconPeople: React.FC<{ color: string; size?: number }> = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 14" fill="none">
    <circle cx="5" cy="4" r="2.3" fill={color} />
    <path d="M1.2 12c0-2.2 1.7-3.6 3.8-3.6s3.8 1.4 3.8 3.6" fill={color} />
    <circle cx="11.5" cy="4.4" r="1.8" fill={color} />
    <path d="M9.3 12.0c0-1.7 1.2-2.8 2.8-2.8 1.6 0 2.8 1.1 2.8 2.8"
      fill={color} />
  </svg>
);

const IconGears: React.FC<{ color: string; size?: number }> = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <g transform="translate(0.2 0.2)">
      <path d="M6.2 0.8h1.4l0.25 1.4a4 4 0 0 1 0.95 0.4l1.15-0.8 1 1-0.8 1.15a4 4 0 0 1 0.4 0.95L12 5.15v1.4l-1.4 0.25a4 4 0 0 1-0.4 0.95l0.8 1.15-1 1-1.15-0.8a4 4 0 0 1-0.95 0.4L7.6 10.9H6.2l-0.25-1.4a4 4 0 0 1-0.95-0.4L3.85 9.9l-1-1 0.8-1.15a4 4 0 0 1-0.4-0.95L1.9 6.55v-1.4l1.4-0.25a4 4 0 0 1 0.4-0.95L2.9 2.8l1-1 1.15 0.8a4 4 0 0 1 0.95-0.4L6.2 0.8z"
        fill={color} />
      <circle cx="6.9" cy="5.85" r="1.35" fill="#fff" />
    </g>
    <g transform="translate(6 6)">
      <path d="M5.2 2.0h0.9l0.17 0.9a2.6 2.6 0 0 1 0.6 0.25l0.75-0.52 0.65 0.65-0.52 0.75a2.6 2.6 0 0 1 0.25 0.6l0.9 0.17v0.9l-0.9 0.17a2.6 2.6 0 0 1-0.25 0.6l0.52 0.75-0.65 0.65-0.75-0.52a2.6 2.6 0 0 1-0.6 0.25l-0.17 0.9h-0.9l-0.17-0.9a2.6 2.6 0 0 1-0.6-0.25l-0.75 0.52-0.65-0.65 0.52-0.75a2.6 2.6 0 0 1-0.25-0.6l-0.9-0.17v-0.9l0.9-0.17a2.6 2.6 0 0 1 0.25-0.6l-0.52-0.75 0.65-0.65 0.75 0.52a2.6 2.6 0 0 1 0.6-0.25L5.2 2.0z"
        fill={color} />
      <circle cx="5.65" cy="5.45" r="0.9" fill="#fff" />
    </g>
  </svg>
);

const IconDoc: React.FC<{ color: string; size?: number }> = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 16" fill="none">
    <path d="M2 1.5h6.2l3.8 3.8V14a0.5 0.5 0 0 1-0.5 0.5H2A0.5 0.5 0 0 1 1.5 14V2A0.5 0.5 0 0 1 2 1.5z"
      fill={color} />
    <path d="M8 1.5v3.8h4" fill="rgba(255,255,255,0.35)" />
    <rect x="4" y="7.5" width="6" height="0.9" rx="0.4" fill="#fff" />
    <rect x="4" y="9.6" width="6" height="0.9" rx="0.4" fill="#fff" />
    <rect x="4" y="11.7" width="4" height="0.9" rx="0.4" fill="#fff" />
  </svg>
);

const IconQualityBadge: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M9 1.6l1.8 1.1 2.1-0.15 0.9 1.9 1.9 0.9-0.15 2.1 1.1 1.8-1.1 1.8 0.15 2.1-1.9 0.9-0.9 1.9-2.1-0.15L9 16.4l-1.8-1.1-2.1 0.15-0.9-1.9-1.9-0.9 0.15-2.1L1.35 9l1.1-1.8-0.15-2.1 1.9-0.9 0.9-1.9 2.1 0.15L9 1.6z"
      fill={SUCCESS} />
    <path d="M5.6 9.2l2.2 2.2 4.6-4.6" stroke="#fff" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconWarningTriangle: React.FC<{ size?: number; color?: string }> = ({
  size = 18, color = ORANGE,
}) => (
  <svg width={size} height={size} viewBox="0 0 20 18" fill="none">
    <path d="M10 2.2 18.3 15.6a1.1 1.1 0 0 1-0.95 1.65H1.65A1.1 1.1 0 0 1 0.7 15.6L9 2.2a1.17 1.17 0 0 1 2 0z"
      fill={color} />
    <rect x="9.2" y="7.0" width="1.6" height="5.0" rx="0.7" fill="#fff" />
    <circle cx="10" cy="13.8" r="0.9" fill="#fff" />
  </svg>
);

const IconBolt: React.FC<{ color: string; size?: number }> = ({ color, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 14 16" fill="none">
    <path d="M8.4 0.6 2 9.2h4l-0.6 5.8 6.4-8.6H8L8.4 0.6z" fill={color} />
  </svg>
);

const IconChevronRight: React.FC<{ color: string; size?: number }> = ({ color, size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
    <path d="M3.5 2l3 3-3 3" stroke={color}
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconHome: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 3.2 2.6 11.2a1 1 0 0 0 .6 1.75H5v7.35A1.7 1.7 0 0 0 6.7 22h3.3v-5.4h4v5.4h3.3A1.7 1.7 0 0 0 19 20.3v-7.35h1.8a1 1 0 0 0 .6-1.75L12 3.2z" />
  </svg>
);

const IconWrenchScrew: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Crossed wrench + screwdriver (SF Symbols-style) */}
    <path d="M4 20 13.5 10.5M18 3.8l2.2 2.2-3 3 1.2 1.2-1.6 1.6-1.2-1.2-3 3-2.2-2.2 3-3 -1.2-1.2 1.6-1.6 1.2 1.2 3-3z"
      fill={color} />
    <path d="M4 20 5.4 20.4a0.8 0.8 0 0 0 0.95-0.2l1.2-1.4a0.8 0.8 0 0 0-0.1-1.1L4.2 14.8a0.8 0.8 0 0 0-1.1-0.1l-1.4 1.2a0.8 0.8 0 0 0-0.2 0.95L1.9 18.2"
      fill={color} />
  </svg>
);

const IconSearch: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="10.5" cy="10.5" r="6.2" stroke={color} strokeWidth="2" />
    <path d="M15 15l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reusable card wrapper — rounded white card with subtle shadow, animates in
// with a staggered rise + fade.
// ─────────────────────────────────────────────────────────────────────────────
const Card: React.FC<{
  enterT: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ enterT, children, style }) => {
  const e = easeOutCubic(enterT);
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 18,
      padding: "14px 16px",
      border: "1px solid rgba(15,15,18,0.05)",
      boxShadow:
        "0 1px 2px rgba(15,15,18,0.04), " +
        "0 10px 24px -14px rgba(15,15,18,0.08)",
      opacity: e,
      transform: `translateY(${((1 - e) * 10).toFixed(2)}px)`,
      willChange: "transform, opacity",
      ...style,
    }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export const PhoneDashboardIntro: React.FC = () => {
  // Everything is shown at its settled final state from frame 0 — no staggered
  // entrance, no title slide-in, no progress-bar fill-up. The dashboard reads
  // as "already there" the moment the viewer sees the screen.
  const statusT    = 1;
  const titleT     = 1;
  const segT       = 1;
  const alertT     = 1;

  const prodEnterT = 1;
  const prodBarT   = 1;

  const workEnterT = 1;
  const workBarT   = 1;
  const machEnterT = 1;
  const machBarT   = 1;

  const ordEnterT  = 1;
  const qualEnterT = 1;

  const energyEnterT = 1;

  const tabT       = 1;

  const tabE = easeOutCubic(tabT);

  return (
    <AbsoluteFill style={{
      backgroundColor: "#F3F4F7",
      overflow: "hidden",
      fontFamily: geistFont,
    }}>
      {/* Stage — native screen size 396×836 anchored top-left and scaled
          uniformly from (0,0) so it fills the canvas edge-to-edge. */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: SRC_SCREEN_W,
        height: SRC_SCREEN_H,
        transform: `scale(${SCREEN_SCALE})`,
        transformOrigin: "0 0",
        background: "linear-gradient(180deg, #F3F4F7 0%, #E8ECF4 100%)",
        overflow: "hidden",
      }}>
        {/* ── STATUS BAR — clock + dynamic island + signal/wifi/battery ── */}
        <div style={{
          position: "absolute", top: 20, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 30px",
          opacity: statusT,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color: INK,
            letterSpacing: "-0.02em",
          }}>18:50</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* signal dots */}
            <span style={{
              fontSize: 10, color: INK, letterSpacing: "1px",
            }}>●●●●</span>
            {/* wifi */}
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 3.6a9 9 0 0 1 12 0" stroke={INK} strokeWidth="1.3"
                strokeLinecap="round" fill="none" />
              <path d="M3 5.8a6 6 0 0 1 8 0" stroke={INK} strokeWidth="1.3"
                strokeLinecap="round" fill="none" />
              <path d="M5 8a3 3 0 0 1 4 0" stroke={INK} strokeWidth="1.3"
                strokeLinecap="round" fill="none" />
              <circle cx="7" cy="9.2" r="0.7" fill={INK} />
            </svg>
            {/* battery */}
            <span style={{
              display: "inline-block",
              width: 22, height: 10, borderRadius: 2,
              border: `1.2px solid ${INK}`, position: "relative",
            }}>
              <span style={{
                position: "absolute", inset: 1.5, width: "80%",
                background: INK, borderRadius: 1,
              }} />
            </span>
          </span>
        </div>

        {/* Dynamic island — centered black pill at the top */}
        <div style={{
          position: "absolute", top: 11, left: "50%",
          transform: "translateX(-50%)",
          width: 110, height: 28, borderRadius: 999,
          background: "#0B0B0E",
          opacity: statusT,
        }} />

        {/* ── APP BODY — starts below status bar ── */}
        <div style={{
          position: "absolute", top: 50, left: 0, right: 0, bottom: 0,
          padding: "18px 20px 100px",
          display: "flex", flexDirection: "column", gap: 12,
          overflow: "hidden",
        }}>
          {/* ── TITLE ── */}
          <div style={{
            fontSize: 34, fontWeight: 900, color: INK,
            letterSpacing: "-0.035em",
            marginTop: 18, marginBottom: 2,
            opacity: titleT,
            transform: `translateX(${((1 - easeOutCubic(titleT)) * -14).toFixed(2)}px)`,
          }}>
            Overview
          </div>

          {/* ── SEGMENTED CONTROL — Today / Week / Month ── */}
          <div style={{
            background: "rgba(15,15,18,0.07)",
            border: "1px solid rgba(15,15,18,0.04)",
            borderRadius: 999,
            padding: 3,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            opacity: segT,
            transform: `scale(${(0.97 + easeOutCubic(segT) * 0.03).toFixed(3)})`,
            transformOrigin: "50% 50%",
          }}>
            {["Today", "Week", "Month"].map((lbl, i) => {
              const active = i === 0;
              return (
                <div key={lbl} style={{
                  textAlign: "center",
                  padding: "7px 0",
                  borderRadius: 999,
                  background: active ? "#FFFFFF" : "transparent",
                  fontSize: 12, fontWeight: active ? 800 : 600,
                  color: active ? INK : MUTED,
                  letterSpacing: "-0.005em",
                  boxShadow: active
                    ? "0 1px 2px rgba(15,15,18,0.05), 0 4px 10px -4px rgba(15,15,18,0.08)"
                    : "none",
                }}>
                  {lbl}
                </div>
              );
            })}
          </div>

          {/* ── ALERT BANNER ── */}
          <Card enterT={alertT} style={{
            padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 12,
            marginTop: 4,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: ORANGE_BG,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <IconWarningTriangle size={18} color={ORANGE} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 800, color: INK,
                letterSpacing: "-0.01em", lineHeight: 1.15,
              }}>3 active alerts</div>
              <div style={{
                fontSize: 11, fontWeight: 500, color: MUTED,
                marginTop: 2,
              }}>Tap to see details</div>
            </div>
            <IconChevronRight color={LABEL} size={10} />
          </Card>

          {/* ── PRODUCTION CARD ── */}
          <Card enterT={prodEnterT} style={{ padding: "14px 16px" }}>
            {/* Head row: icon + label + "Today" */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <IconBars color={INK} size={13} />
                <span style={{
                  fontSize: 10.5, fontWeight: 800, color: INK,
                  letterSpacing: "0.09em",
                }}>PRODUCTION</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 3,
                fontSize: 11, fontWeight: 500, color: LABEL,
              }}>
                <IconChevronRight color={LABEL} size={9} />
                <span>Today</span>
              </div>
            </div>
            {/* Big number */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{
                fontSize: 34, fontWeight: 900, color: INK,
                letterSpacing: "-0.035em", lineHeight: 1,
              }}>1.240</span>
              <span style={{
                fontSize: 13, fontWeight: 600, color: MUTED,
                letterSpacing: "-0.01em",
              }}>/ 1.500 pcs</span>
            </div>
            {/* Progress bar */}
            <div style={{
              marginTop: 10, height: 5, borderRadius: 3,
              background: "rgba(15,15,18,0.08)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${(82 * easeOutCubic(prodBarT)).toFixed(2)}%`,
                background: INK,
                borderRadius: 3,
              }} />
            </div>
            {/* Labels below bar */}
            <div style={{
              marginTop: 8,
              display: "flex", justifyContent: "space-between",
              fontSize: 11, fontWeight: 500,
            }}>
              <span style={{ color: INK, fontWeight: 800 }}>82% of target</span>
              <span style={{ color: MUTED }}>260 remaining pcs</span>
            </div>
          </Card>

          {/* ── 2-COL: Workers + Machinery ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          }}>
            <Card enterT={workEnterT} style={{ padding: "13px 14px" }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 4,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconPeople color={INK} size={14} />
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: INK,
                    letterSpacing: "0.09em",
                  }}>WORKERS</span>
                </div>
                <IconChevronRight color={LABEL} size={9} />
              </div>
              <div style={{
                fontSize: 28, fontWeight: 900, color: INK,
                letterSpacing: "-0.03em", lineHeight: 1, marginTop: 2,
              }}>48/60</div>
              <div style={{
                marginTop: 10, height: 4, borderRadius: 2,
                background: "rgba(15,15,18,0.08)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${(80 * easeOutCubic(workBarT)).toFixed(2)}%`,
                  background: INK,
                  borderRadius: 2,
                }} />
              </div>
              <div style={{
                marginTop: 7,
                fontSize: 10.5, fontWeight: 500, color: MUTED,
              }}>80% present</div>
            </Card>

            <Card enterT={machEnterT} style={{ padding: "13px 14px" }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 4,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconGears color={INK} size={14} />
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: INK,
                    letterSpacing: "0.09em",
                  }}>MACHINERY</span>
                </div>
                <IconChevronRight color={LABEL} size={9} />
              </div>
              <div style={{
                fontSize: 28, fontWeight: 900, color: INK,
                letterSpacing: "-0.03em", lineHeight: 1, marginTop: 2,
              }}>12/14</div>
              <div style={{
                marginTop: 10, height: 4, borderRadius: 2,
                background: "rgba(15,15,18,0.08)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${(87 * easeOutCubic(machBarT)).toFixed(2)}%`,
                  background: INK,
                  borderRadius: 2,
                }} />
              </div>
              <div style={{
                marginTop: 7,
                fontSize: 10.5, fontWeight: 500, color: MUTED,
              }}>87% efficiency</div>
            </Card>
          </div>

          {/* ── 2-COL: Orders + Quality ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          }}>
            <Card enterT={ordEnterT} style={{ padding: "13px 14px" }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 6,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconDoc color={INK} size={13} />
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: INK,
                    letterSpacing: "0.09em",
                  }}>ORDERS</span>
                </div>
                <IconChevronRight color={LABEL} size={9} />
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginTop: 2,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 24, fontWeight: 900, color: INK,
                    letterSpacing: "-0.025em", lineHeight: 1,
                  }}>23</div>
                  <div style={{
                    fontSize: 10, fontWeight: 500, color: MUTED, marginTop: 3,
                  }}>Waiting</div>
                </div>
                <div style={{
                  width: 1, alignSelf: "stretch",
                  background: "rgba(15,15,18,0.08)",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 24, fontWeight: 900, color: SUCCESS,
                    letterSpacing: "-0.025em", lineHeight: 1,
                  }}>187</div>
                  <div style={{
                    fontSize: 10, fontWeight: 500, color: MUTED, marginTop: 3,
                  }}>Completed</div>
                </div>
              </div>
            </Card>

            <Card enterT={qualEnterT} style={{ padding: "13px 14px" }}>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 6,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <IconQualityBadge size={15} />
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: INK,
                    letterSpacing: "0.09em",
                  }}>QUALITY</span>
                </div>
              </div>
              <div style={{
                fontSize: 24, fontWeight: 900, color: INK,
                letterSpacing: "-0.025em", lineHeight: 1,
              }}>3.2%</div>
              <div style={{
                fontSize: 10.5, fontWeight: 500, color: MUTED,
                marginTop: 4,
              }}>Defect rate</div>
              <div style={{
                marginTop: 8,
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 9px",
                borderRadius: 999,
                background: SUCCESS_BG,
                fontSize: 10.5, fontWeight: 800, color: SUCCESS,
                letterSpacing: "-0.005em",
              }}>
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" fill={SUCCESS} />
                  <path d="M3 5l1.5 1.5L7 4" stroke="#fff" strokeWidth="1.3"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Normal
              </div>
            </Card>
          </div>

          {/* ── ENERGY CARD ── */}
          <Card enterT={energyEnterT} style={{ padding: "13px 16px" }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <IconBolt color={ORANGE} size={14} />
                <span style={{
                  fontSize: 10.5, fontWeight: 800, color: INK,
                  letterSpacing: "0.09em",
                }}>ENERGY</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <IconChevronRight color={LABEL} size={9} />
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11.5, fontWeight: 800, color: ORANGE,
                  letterSpacing: "-0.005em",
                }}>
                  <IconWarningTriangle size={13} color={ORANGE} />
                  Close to the limit
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 8 }}>
              <span style={{
                fontSize: 22, fontWeight: 900, color: INK,
                letterSpacing: "-0.025em", lineHeight: 1,
              }}>2.105 kWh</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: MUTED,
                letterSpacing: "-0.01em",
              }}>/ 2.500 kWh</span>
            </div>
            <div style={{
              marginTop: 9, height: 4, borderRadius: 2,
              background: "rgba(15,15,18,0.08)",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${(84 * easeOutCubic(energyEnterT)).toFixed(2)}%`,
                background: `linear-gradient(90deg, ${ORANGE} 0%, #EA580C 100%)`,
                borderRadius: 2,
              }} />
            </div>
            <div style={{
              marginTop: 7,
              fontSize: 10.5, fontWeight: 500, color: MUTED,
            }}>84% of the threshold used</div>
          </Card>
        </div>

        {/* ── BOTTOM TAB BAR — floating pill + search ── */}
        <div style={{
          position: "absolute", bottom: 22, left: 16, right: 16,
          display: "flex", alignItems: "center", gap: 10,
          opacity: tabT,
          transform: `translateY(${((1 - tabE) * 20).toFixed(2)}px)`,
        }}>
          {/* Pill with tabs */}
          <div style={{
            flex: 1,
            background: "#FFFFFF",
            borderRadius: 999,
            padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
            boxShadow:
              "0 1px 2px rgba(15,15,18,0.05), " +
              "0 14px 30px -14px rgba(15,15,18,0.18)",
            border: "1px solid rgba(15,15,18,0.04)",
          }}>
            {/* Overview (active) */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <IconHome color={INK} size={22} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: INK,
                letterSpacing: "-0.005em",
              }}>Overview</span>
            </div>
            {/* Orders */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <IconWrenchScrew color={INK} size={22} />
              <span style={{
                fontSize: 10, fontWeight: 700, color: INK,
                letterSpacing: "-0.005em",
              }}>Orders</span>
            </div>
          </div>
          {/* Floating search button */}
          <div style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow:
              "0 1px 2px rgba(15,15,18,0.05), " +
              "0 14px 30px -12px rgba(15,15,18,0.2)",
            border: "1px solid rgba(15,15,18,0.04)",
          }}>
            <IconSearch color={INK} size={22} />
          </div>
        </div>

        {/* ── HOME INDICATOR ── */}
        <div style={{
          position: "absolute", bottom: 6, left: "50%",
          transform: "translateX(-50%)",
          width: 110, height: 4, borderRadius: 3,
          background: "rgba(15,15,18,0.85)",
          opacity: statusT,
        }} />
      </div>
    </AbsoluteFill>
  );
};
