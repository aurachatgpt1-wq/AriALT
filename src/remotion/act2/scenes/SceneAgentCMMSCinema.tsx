import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { geistFont } from "../constants";
import { clamp } from "../cinema/camera";

// ═══════════════════════════════════════════════════════════════════════════
//  AriA — Predictive Maintenance (cinema · keynote composition)
//  One BIG card hero per shot. Each shot transitions into the next with a
//  flip-Y, zoom-in, tilt-up, or pull-back. Beat = a sequence of shots.
// ═══════════════════════════════════════════════════════════════════════════

export const CINEMA_AGENT_DURATION = 940;

// ─── Beats ─────────────────────────────────────────────────────────────────
// Global pacing slowed ~1.35× for a calmer, more cinematic rhythm. Beat D is
// extended so the mobile Work-Order flow (dashboard → notification → detail →
// AI voice help with diagram) has proper dwell time for the payoff moment.
const B = {
  A: { start:    0, end:   40 },  // DARK type   — "Every asset"               (1.33s)
  B: { start:   40, end:   80 },  // DARK type   — "has a story."              (1.33s)
  C: { start:   80, end:  230 },  // GLASS       — 3-face flip (alarm/forecast/explain)  (5.00s)
  D: { start:  230, end:  800 },  // GLASS       — forecast + mobile flow + AI + inventory breakout (19.00s)
  E: { start:  800, end:  845 },  // LIGHT type  — "Four days."                (1.50s)
  F: { start:  845, end:  955 },  // GLASS       — auto-generated Work Order   (3.67s)
  G: { start:  955, end:  995 },  // BLUE type   — "Don't wait."               (1.33s)
  H: { start:  995, end: 1110 },  // GLASS       — 4 agents orchestrate        (3.83s)
  I: { start: 1110, end: 1140 },  // LIGHT type  — "€ 4,200 saved."            (1.00s)
} as const;

// ─── Palette ───────────────────────────────────────────────────────────────
const INK          = "#0F0F12";
const INK_SOFT     = "#2A2F3A";
const MUTED        = "#5A6070";
const LABEL        = "#8A91A0";
const ACCENT       = "#4A6DF5";
const ACCENT_DARK  = "#3B5BDB";
const SUCCESS      = "#10B981";
const SUCCESS_DARK = "#0F8B62";
const WARNING      = "#F59E0B";
const WARNING_DARK = "#B45309";
const CRITICAL     = "#E53935";
const CRITICAL_DARK= "#B91C1C";
const CRITICAL_GLOW= "rgba(229,57,53,0.55)";
const PURPLE       = "#8B5CF6";
const PURPLE_DARK  = "#6D28D9";
const DARK_BG_1    = "#0E1014";
const DARK_BG_2    = "#1A1D24";
const LIGHT_BG_1   = "#ECEDEF";
const LIGHT_BG_2   = "#F7F7F9";
const BLUE_BG_1    = "#4A6DF5";
const BLUE_BG_2    = "#6C8BFB";

const SERIF = "'Times New Roman', Georgia, 'Playfair Display', serif";

// ─── Agents roster ─────────────────────────────────────────────────────────
const AGENTS = {
  alarm:       { name: "Alarm Agent",       color: CRITICAL, colorDark: CRITICAL_DARK, letter: "A",
                 role: "detection" },
  forecasting: { name: "Forecasting Agent", color: ACCENT,   colorDark: ACCENT_DARK,   letter: "F",
                 role: "prediction" },
  maintenance: { name: "Maintenance Agent", color: SUCCESS,  colorDark: SUCCESS_DARK,  letter: "M",
                 role: "execution" },
  inventory:   { name: "Inventory Agent",   color: WARNING,  colorDark: WARNING_DARK,  letter: "I",
                 role: "parts" },
  scheduling:  { name: "Scheduling Agent",  color: PURPLE,   colorDark: PURPLE_DARK,   letter: "S",
                 role: "planning" },
} as const;
type AgentKey = keyof typeof AGENTS;

// ═══════════════════════════════════════════════════════════════════════════
//                                MAIN SCENE
// ═══════════════════════════════════════════════════════════════════════════
export const SceneAgentCMMSCinema: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inA = frame < B.A.end;
  const inB = frame >= B.B.start && frame < B.B.end;
  const inC = frame >= B.C.start && frame < B.C.end;
  const inD = frame >= B.D.start && frame < B.D.end;
  const inE = frame >= B.E.start && frame < B.E.end;
  const inF = frame >= B.F.start && frame < B.F.end;
  const inG = frame >= B.G.start && frame < B.G.end;
  const inH = frame >= B.H.start && frame < B.H.end;
  const inI = frame >= B.I.start;

  return (
    <AbsoluteFill style={{ fontFamily: geistFont, overflow: "hidden" }}>
      {inA && <BeatA frame={frame} fps={fps} />}
      {inB && <BeatB frame={frame} fps={fps} />}
      {inC && <BeatC frame={frame} />}
      {inD && <BeatD frame={frame} />}
      {inE && <BeatE frame={frame} fps={fps} />}
      {inF && <BeatF frame={frame} />}
      {inG && <BeatG frame={frame} fps={fps} />}
      {inH && <BeatH frame={frame} />}
      {inI && <BeatI frame={frame} fps={fps} />}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   SHOT — one hero card at a time with cinematic transitions
// ═══════════════════════════════════════════════════════════════════════════
type EnterKind = "zoom" | "flipIn" | "tiltUp" | "slideLeft" | "slideRight" | "rise" | "none";
type ExitKind  = "zoomOut" | "flipOut" | "slideUp" | "blur" | "fall";

type ShotProps = {
  f: number; start: number; end: number;
  enter?: EnterKind; exit?: ExitKind;
  fadeIn?: number; fadeOut?: number;
  children: React.ReactNode;
};

const Shot: React.FC<ShotProps> = ({
  f, start, end, enter = "zoom", exit = "blur",
  fadeIn = 10, fadeOut = 10, children,
}) => {
  if (f < start - 2 || f > end + 2) return null;

  const inT  = clamp((f - start) / fadeIn, 0, 1);
  const outT = clamp((f - (end - fadeOut)) / fadeOut, 0, 1);
  const eIn  = 1 - Math.pow(1 - inT, 3);
  const eOut = Math.pow(outT, 2);

  let tx = 0, ty = 0, sc = 1, rY = 0, rX = 0;
  let op = 1, blur = 0;

  // ── Entry ──
  switch (enter) {
    case "zoom":
      sc   *= 0.68 + 0.32 * eIn;
      blur += (1 - eIn) * 16;
      op   *= clamp(inT * 2, 0, 1);
      break;
    case "flipIn":
      rY   += -88 * (1 - eIn);
      sc   *= 0.9 + 0.1 * eIn;
      op   *= clamp(inT * 3, 0, 1);
      blur += (1 - eIn) * 6;
      break;
    case "tiltUp":
      rX   += 38 * (1 - eIn);
      ty   += 80 * (1 - eIn);
      sc   *= 0.85 + 0.15 * eIn;
      op   *= clamp(inT * 2, 0, 1);
      break;
    case "slideLeft":
      tx   += (1 - eIn) * 220;
      sc   *= 0.96 + 0.04 * eIn;
      op   *= clamp(inT * 2, 0, 1);
      blur += (1 - eIn) * 6;
      break;
    case "slideRight":
      tx   += (1 - eIn) * -220;
      sc   *= 0.96 + 0.04 * eIn;
      op   *= clamp(inT * 2, 0, 1);
      blur += (1 - eIn) * 6;
      break;
    case "rise":
      ty   += (1 - eIn) * 60;
      sc   *= 0.94 + 0.06 * eIn;
      op   *= clamp(inT * 2, 0, 1);
      break;
  }

  // ── Exit ──
  switch (exit) {
    case "zoomOut":
      sc   *= 1 + 0.18 * eOut;
      blur += eOut * 14;
      op   *= 1 - outT;
      break;
    case "flipOut":
      rY   += 88 * eOut;
      sc   *= 1 - 0.1 * eOut;
      op   *= outT < 0.5 ? 1 : Math.max(0, 1 - (outT - 0.5) * 2);
      blur += eOut * 4;
      break;
    case "slideUp":
      ty   += -eOut * 120;
      op   *= 1 - outT;
      break;
    case "fall":
      ty   += eOut * 120;
      op   *= 1 - outT;
      break;
    case "blur":
      blur += eOut * 12;
      op   *= 1 - outT;
      break;
  }

  const transform =
    `perspective(1800px) translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) ` +
    `rotateX(${rX.toFixed(1)}deg) rotateY(${rY.toFixed(1)}deg) scale(${sc.toFixed(3)})`;

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      transform, opacity: op,
      filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
      willChange: "transform, opacity, filter",
    }}>
      {children}
    </AbsoluteFill>
  );
};

// Compute a local shot progress (0..1 across hold window, for in-shot animations)
const shotLocalT = (f: number, start: number, end: number, fadeIn = 10): number =>
  clamp((f - (start + fadeIn)) / Math.max(1, end - start - fadeIn - 6), 0, 1);

// ═══════════════════════════════════════════════════════════════════════════
//   UNDERLINE TITLE — bold sans-serif headline with blue SVG-underlined
//   highlight words (matches SceneBlobHold "brackets" style).
// ═══════════════════════════════════════════════════════════════════════════
type UnderlineTitleProps = {
  text: string;                 // full phrase; split by spaces
  highlight: string[];          // exact words to highlight (case-sensitive; punctuation kept on word)
  size?: number;                // font size in px
  appearT?: number;             // 0..1 word-reveal progress
  underlineT?: number;          // 0..1 underline draw progress
  color?: string;
  accent?: string;
};
const UnderlineTitle: React.FC<UnderlineTitleProps> = ({
  text, highlight, size = 96, appearT = 1, underlineT = 1, color = INK, accent = ACCENT,
}) => {
  const words = text.split(" ");
  const stripPunct = (w: string) => w.replace(/[.,?!:;]+$/g, "");
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", alignItems: "baseline",
      gap: `${Math.round(size * 0.08)}px ${Math.round(size * 0.26)}px`,
      fontFamily: geistFont, fontWeight: 800,
      letterSpacing: "-0.035em", lineHeight: 1.12,
    }}>
      {words.map((w, i) => {
        // per-word stagger reveal
        const wT = clamp(appearT * words.length - i, 0, 1);
        const wE = 1 - Math.pow(1 - wT, 3);
        const isHl = highlight.includes(stripPunct(w));
        return (
          <span key={i} style={{
            position: "relative", display: "inline-block",
            fontSize: size,
            color: isHl ? accent : color,
            opacity: wE,
            transform: `translateY(${(1 - wE) * 14}px)`,
            willChange: "transform, opacity",
          }}>
            {w}
            {isHl && underlineT > 0.001 && (
              <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{
                position: "absolute", left: 0, right: 0, bottom: -Math.round(size * 0.05),
                width: "100%", height: Math.max(6, Math.round(size * 0.1)), overflow: "visible",
              }}>
                <line x1="0" y1="6" x2="200" y2="6"
                  stroke={accent} strokeWidth="4" strokeLinecap="round"
                  style={{ strokeDasharray: 200, strokeDashoffset: 200 * (1 - underlineT) }} />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   MULTI-FLIP CARD — N-faced single 3D element. Faces are swapped via
//   content-gating at edge-on moments; parent rotates -180° per flip so
//   motion reads as one continuous horizontal coin-flip through all faces.
// ═══════════════════════════════════════════════════════════════════════════
type FlipSpec = { start: number; duration: number; axis?: "x" | "y" };
type MultiFlipCardProps = {
  f: number;
  enter: { start: number; duration: number };     // first-face entry (zoom)
  flips: FlipSpec[];                               // between consecutive faces; length = faces.length - 1
  exit:  { start: number; duration: number };     // last-face exit (blur + fade)
  faces: React.ReactNode[];
};
const MultiFlipCard: React.FC<MultiFlipCardProps> = ({ f, enter, flips, exit, faces }) => {
  if (f < enter.start - 2 || f > exit.start + exit.duration + 2) return null;

  // Entry (zoom + fade)
  const enterT = clamp((f - enter.start) / enter.duration, 0, 1);
  const eIn    = 1 - Math.pow(1 - enterT, 3);

  // Exit (blur + fade)
  const exitT  = clamp((f - exit.start) / exit.duration, 0, 1);

  // Cumulative flip angle per-axis across all past + current flips (each adds -180° on its axis)
  let angleX = 0;
  let angleY = 0;
  for (const flip of flips) {
    const t = clamp((f - flip.start) / flip.duration, 0, 1);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const delta = -180 * e;
    if (flip.axis === "y") angleY += delta;
    else                   angleX += delta;
  }

  // Active face index — switches at the midpoint of each flip
  let activeIdx = 0;
  for (let i = 0; i < flips.length; i++) {
    const mid = flips[i].start + flips[i].duration / 2;
    if (f >= mid) activeIdx = i + 1;
  }

  // Pre-rotation offsets for active face: cumulative rotations up to this face index.
  // We must counter the parent's net rotation with matching pre-rotations so the face
  // lands flat when the parent settles on its slot.
  let preX = 0, preY = 0;
  for (let i = 0; i < activeIdx; i++) {
    if (flips[i].axis === "y") preY += 180;
    else                       preX += 180;
  }

  const scale   = 0.72 + 0.28 * eIn;
  const opacity = Math.min(clamp(enterT * 2, 0, 1), 1 - exitT);
  const blur    = (1 - eIn) * 12 + exitT * 10;

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      perspective: 1800,
      opacity,
      filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined,
      willChange: "transform, opacity, filter",
    }}>
      <div style={{
        position: "relative",
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        transform:
          `scale(${scale.toFixed(3)}) ` +
          `rotateX(${angleX.toFixed(2)}deg) ` +
          `rotateY(${angleY.toFixed(2)}deg)`,
      } as React.CSSProperties}>
        {faces.map((face, i) => {
          if (i !== activeIdx) return null;
          return (
            <div key={i} style={{
              transform: `rotateX(${preX.toFixed(0)}deg) rotateY(${preY.toFixed(0)}deg)`,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            } as React.CSSProperties}>
              {face}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   GLASS BACKGROUND — blurred colored blobs per beat tint
// ═══════════════════════════════════════════════════════════════════════════
type BgTint = "cool" | "alarm" | "success" | "warm";
const GlassBackground: React.FC<{ frame: number; tint: BgTint }> = ({ frame, tint }) => {
  const t = frame * 0.006;
  let blobs: Array<{ x: number; y: number; color: string; size: number }> = [];
  if (tint === "alarm") {
    blobs = [
      { x: 22 + Math.sin(t) * 3, y: 30 + Math.cos(t * 0.7) * 3, color: "rgba(229,57,53,0.30)", size: 1100 },
      { x: 80 + Math.cos(t * 0.6) * 3, y: 72, color: "rgba(245,158,11,0.24)", size: 900 },
      { x: 55, y: 50, color: "rgba(74,109,245,0.14)", size: 700 },
    ];
  } else if (tint === "cool") {
    blobs = [
      { x: 18 + Math.sin(t) * 3, y: 25, color: "rgba(74,109,245,0.34)", size: 1200 },
      { x: 82, y: 78 + Math.cos(t * 0.8) * 3, color: "rgba(139,92,246,0.28)", size: 1000 },
      { x: 62, y: 48, color: "rgba(99,102,241,0.14)", size: 700 },
    ];
  } else if (tint === "success") {
    blobs = [
      { x: 28, y: 38 + Math.sin(t) * 3, color: "rgba(16,185,129,0.32)", size: 1100 },
      { x: 76, y: 66, color: "rgba(74,109,245,0.24)", size: 1000 },
      { x: 52, y: 22, color: "rgba(139,92,246,0.14)", size: 700 },
    ];
  } else {
    blobs = [
      { x: 26, y: 36, color: "rgba(245,158,11,0.24)", size: 1100 },
      { x: 72, y: 72, color: "rgba(229,57,53,0.18)", size: 900 },
      { x: 50, y: 50, color: "rgba(74,109,245,0.12)", size: 700 },
    ];
  }
  return (
    <AbsoluteFill style={{
      background: "linear-gradient(180deg, #F6F7FA 0%, #EEF0F4 100%)",
      overflow: "hidden",
    }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${b.y}%`, left: `${b.x}%`,
          width: b.size, height: b.size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
          filter: "blur(80px)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(15,15,18,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,15,18,0.025) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
        maskImage: "radial-gradient(circle at 50% 50%, black 20%, transparent 75%)",
      }} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   GLASS CARD — hero-sized card container
// ═══════════════════════════════════════════════════════════════════════════
type GlassTint = "default" | "alarm" | "accent" | "success" | "warning" | "dark";
type GlassProps = {
  style?: React.CSSProperties;
  tint?: GlassTint;
  children?: React.ReactNode;
};
const Glass: React.FC<GlassProps> = ({ style, tint = "default", children }) => {
  const bg: Record<GlassTint, string> = {
    default: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.62) 100%)",
    alarm:   "linear-gradient(135deg, rgba(255,238,238,0.88) 0%, rgba(255,220,222,0.62) 100%)",
    accent:  "linear-gradient(135deg, rgba(232,238,255,0.88) 0%, rgba(218,228,255,0.62) 100%)",
    success: "linear-gradient(135deg, rgba(230,252,244,0.88) 0%, rgba(210,245,232,0.62) 100%)",
    warning: "linear-gradient(135deg, rgba(255,246,225,0.88) 0%, rgba(255,236,205,0.62) 100%)",
    dark:    "linear-gradient(135deg, rgba(22,24,30,0.82) 0%, rgba(14,16,22,0.90) 100%)",
  };
  const border: Record<GlassTint, string> = {
    default: "rgba(255,255,255,0.55)",
    alarm:   "rgba(229,57,53,0.32)",
    accent:  "rgba(74,109,245,0.32)",
    success: "rgba(16,185,129,0.32)",
    warning: "rgba(245,158,11,0.32)",
    dark:    "rgba(255,255,255,0.12)",
  };
  const shadow: Record<GlassTint, string> = {
    default: "0 30px 80px -16px rgba(15,15,18,0.22), 0 10px 24px -8px rgba(15,15,18,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
    alarm:   "0 30px 80px -16px rgba(229,57,53,0.28), 0 10px 24px -8px rgba(229,57,53,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
    accent:  "0 30px 80px -16px rgba(74,109,245,0.32), 0 10px 24px -8px rgba(74,109,245,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
    success: "0 30px 80px -16px rgba(16,185,129,0.28), 0 10px 24px -8px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
    warning: "0 30px 80px -16px rgba(245,158,11,0.26), inset 0 1px 0 rgba(255,255,255,0.6)",
    dark:    "0 30px 80px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
  };
  return (
    <div style={{
      background: bg[tint],
      backdropFilter: "blur(24px) saturate(1.4)",
      WebkitBackdropFilter: "blur(24px) saturate(1.4)",
      border: `1px solid ${border[tint]}`,
      borderRadius: 28,
      boxShadow: shadow[tint],
      overflow: "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   TYPE BEATS A · B · E · G · I
// ═══════════════════════════════════════════════════════════════════════════
type TypeCardProps = {
  frame: number; fps: number;
  beatStart: number; beatDuration: number;
  background: React.CSSProperties["background"];
  children: React.ReactNode;
  spot?: { x: string; y: string; color: string; size: number };
};
const TypeCard: React.FC<TypeCardProps> = ({
  frame, beatStart, beatDuration, background, children, spot,
}) => {
  const f = frame - beatStart;
  const entryT = clamp(f / 7, 0, 1);
  const entryE = 1 - Math.pow(1 - entryT, 4);
  const scale  = 1.35 + (1 - 1.35) * entryE;
  const blurPx = 14 * (1 - entryE);
  const opacity = clamp(entryT * 2, 0, 1);
  const exitStart = beatDuration - 5;
  const exitT = clamp((f - exitStart) / 5, 0, 1);
  const exitScale = 1 + 0.05 * exitT;
  const exitBlur  = 10 * exitT;
  return (
    <AbsoluteFill style={{ background, alignItems: "center", justifyContent: "center" }}>
      {spot && (
        <div style={{
          position: "absolute", top: spot.y, left: spot.x,
          width: spot.size, height: spot.size, borderRadius: "50%",
          background: `radial-gradient(circle, ${spot.color} 0%, transparent 70%)`,
          filter: "blur(40px)", transform: "translate(-50%, -50%)", pointerEvents: "none",
        }} />
      )}
      <div style={{
        transform: `scale(${scale * exitScale})`,
        filter: (blurPx + exitBlur) > 0.1 ? `blur(${(blurPx + exitBlur).toFixed(2)}px)` : undefined,
        opacity: opacity * (1 - exitT),
      }}>{children}</div>
    </AbsoluteFill>
  );
};
type AccentProps = {
  size: number; color: string; accentColor?: string;
  parts: Array<{ text: string; accent?: boolean; color?: string }>;
  weight?: number;
};
const AccentLine: React.FC<AccentProps> = ({ size, color, accentColor, parts, weight = 500 }) => (
  <div style={{
    fontSize: size, fontWeight: weight, color,
    letterSpacing: "-0.025em", lineHeight: 1.0,
    display: "inline-flex", alignItems: "baseline", gap: size * 0.18, whiteSpace: "nowrap",
  }}>
    {parts.map((p, i) => (
      <span key={i} style={{
        fontFamily: p.accent ? SERIF : "inherit",
        fontStyle:  p.accent ? "italic" : "normal",
        fontWeight: p.accent ? 500 : weight,
        color:      p.color ?? (p.accent ? (accentColor ?? color) : color),
      }}>{p.text}</span>
    ))}
  </div>
);
const BeatA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <TypeCard frame={frame} fps={fps} beatStart={B.A.start} beatDuration={B.A.end - B.A.start}
    background={`radial-gradient(ellipse 80% 60% at 50% 55%, ${DARK_BG_2} 0%, ${DARK_BG_1} 70%)`}
    spot={{ x: "50%", y: "75%", color: "rgba(74,109,245,0.22)", size: 900 }}>
    <AccentLine size={150} color="#FFFFFF" parts={[{ text: "Every" }, { text: "asset" }]} />
  </TypeCard>
);
const BeatB: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <TypeCard frame={frame} fps={fps} beatStart={B.B.start} beatDuration={B.B.end - B.B.start}
    background={`radial-gradient(ellipse 80% 60% at 50% 55%, ${DARK_BG_2} 0%, ${DARK_BG_1} 70%)`}
    spot={{ x: "50%", y: "75%", color: "rgba(74,109,245,0.22)", size: 900 }}>
    <AccentLine size={150} color="#FFFFFF" accentColor="#FFFFFF"
      parts={[{ text: "has a" }, { text: "story.", accent: true }]} />
  </TypeCard>
);
const BeatE: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <TypeCard frame={frame} fps={fps} beatStart={B.E.start} beatDuration={B.E.end - B.E.start}
    background={`radial-gradient(ellipse 80% 60% at 50% 50%, ${LIGHT_BG_2} 0%, ${LIGHT_BG_1} 70%)`}
    spot={{ x: "50%", y: "78%", color: "rgba(229,57,53,0.10)", size: 700 }}>
    <AccentLine size={220} color={INK} accentColor={CRITICAL}
      parts={[{ text: "Four" }, { text: "days.", accent: true }]} />
  </TypeCard>
);
const BeatG: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <TypeCard frame={frame} fps={fps} beatStart={B.G.start} beatDuration={B.G.end - B.G.start}
    background={`radial-gradient(ellipse 120% 80% at 30% 30%, ${BLUE_BG_2} 0%, ${BLUE_BG_1} 60%, ${ACCENT_DARK} 100%)`}
    spot={{ x: "70%", y: "70%", color: "rgba(255,255,255,0.18)", size: 800 }}>
    <AccentLine size={200} color="#FFFFFF" accentColor="#FFFFFF"
      parts={[{ text: "Don't" }, { text: "wait.", accent: true }]} />
  </TypeCard>
);
const BeatI: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = frame - B.I.start;
  const countT = clamp(f / 14, 0, 1);
  const value = Math.round(4200 * (1 - Math.pow(1 - countT, 3)));
  return (
    <TypeCard frame={frame} fps={fps} beatStart={B.I.start} beatDuration={B.I.end - B.I.start}
      background={`radial-gradient(ellipse 80% 60% at 50% 50%, ${LIGHT_BG_2} 0%, ${LIGHT_BG_1} 70%)`}
      spot={{ x: "50%", y: "80%", color: "rgba(16,185,129,0.14)", size: 700 }}>
      <AccentLine size={180} color={INK} accentColor={SUCCESS}
        parts={[{ text: `€ ${value.toLocaleString("en-US")}` }, { text: "saved.", accent: true }]} />
    </TypeCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   SHARED — Agent avatar (large)
// ═══════════════════════════════════════════════════════════════════════════
const AgentAvatar: React.FC<{ agent: AgentKey; size: number; pulse?: boolean; pulseT?: number }> = ({
  agent, size, pulse, pulseT = 0,
}) => {
  const a = AGENTS[agent];
  const glow = pulse ? 0.5 + 0.5 * Math.abs(Math.sin(pulseT * 0.28)) : 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${a.color} 0%, ${a.color}CC 100%)`,
      color: "#fff", fontSize: size * 0.44, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: pulse
        ? `0 0 0 ${4 + glow * 4}px ${a.color}22, 0 0 ${18 + glow * 14}px ${a.color}88, 0 6px 18px ${a.color}55`
        : `0 6px 18px ${a.color}55`,
      flexShrink: 0,
      fontFamily: "inherit",
    }}>
      {a.letter}
    </div>
  );
};

// Chip pill
const Chip: React.FC<{ text: React.ReactNode; color?: string; tint?: string; size?: "sm" | "md"; style?: React.CSSProperties }> = ({
  text, color = ACCENT_DARK, tint, size = "md", style,
}) => (
  <div style={{
    display: "inline-flex", alignItems: "center",
    fontSize: size === "sm" ? 11 : 13, fontWeight: 700, letterSpacing: "0.04em",
    padding: size === "sm" ? "4px 10px" : "6px 12px", borderRadius: 999,
    color, background: tint ?? `${color}18`,
    border: `1px solid ${color}33`,
    whiteSpace: "nowrap",
    ...style,
  }}>
    {text}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//   BEAT C — 3 shots: ALARM HERO → FORECASTING AGENT → PREDICTION
// ═══════════════════════════════════════════════════════════════════════════
const BeatC: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - B.C.start;

  return (
    <AbsoluteFill>
      <GlassBackground frame={frame} tint="alarm" />

      {/* ─── SINGLE 3-FACED CARD: Alarm → Forecasting → AI Explanation ─── */}
      <MultiFlipCard
        f={f}
        enter={{ start:   0, duration: 14 }}
        flips={[
          { start:  42, duration: 18, axis: "x" },  // alarm → predictive model (horizontal-axis flip)
          { start:  94, duration: 18, axis: "y" },  // predictive model → AI explanation (vertical-axis flip)
        ]}
        exit ={{ start: 138, duration: 12 }}
        faces={[
          // ─── FACE 1 — ALARM ───
          <Glass key="c-face1" tint="alarm" style={{ width: 1520, padding: "48px 56px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
              <PulseDot t={f} size={18} />
              <div style={{ fontSize: 15, fontWeight: 800, color: CRITICAL_DARK, letterSpacing: "0.18em" }}>
                CRITICAL · ANOMALY DETECTED · NOW
              </div>
              <div style={{ flex: 1 }} />
              <Chip text="sensor · vib-17" color={MUTED} tint="rgba(15,15,18,0.06)" />
              <Chip text="117.2 Hz" color={MUTED} tint="rgba(15,15,18,0.06)" />
            </div>
            <div style={{ fontSize: 82, fontWeight: 700, color: INK, letterSpacing: "-0.03em",
              lineHeight: 1.02, marginTop: 4 }}>
              P-204 · <span style={{ fontFamily: SERIF, fontStyle: "italic", color: CRITICAL_DARK }}>bearing seal</span>
            </div>
            <div style={{ fontSize: 26, color: MUTED, fontWeight: 500, marginTop: 14, lineHeight: 1.35 }}>
              Main Water Pump · Cooling line A · vibration signature diverged from 18-month baseline.
            </div>
            <div style={{
              marginTop: 28, display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.14em" }}>DEVIATION</div>
                <div style={{ fontSize: 64, fontWeight: 700, color: CRITICAL_DARK, lineHeight: 1,
                  letterSpacing: "-0.03em" }}>3.2<span style={{ fontSize: 38, color: MUTED, marginLeft: 4 }}>σ</span></div>
              </div>
              <div style={{ width: 1, height: 70, background: "rgba(15,15,18,0.12)" }} />
              <div style={{ flex: 1, height: 90 }}>
                <BigWaveform t={f} active />
              </div>
            </div>
          </Glass>,

          // ─── FACE 2 — FORECASTING AGENT (building predictive model) ───
          <Glass key="c-face2" tint="accent" style={{ width: 1520, padding: "48px 56px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 24 }}>
              <AgentAvatar agent="forecasting" size={36} pulse pulseT={f} />
              <div style={{ fontSize: 15, fontWeight: 800, color: ACCENT_DARK, letterSpacing: "0.18em" }}>
                FORECASTING AGENT · ANALYZING
              </div>
              <div style={{ flex: 1 }} />
              <TypingPulse t={f} />
              <Chip text="model · aria-pred v2.4" color={ACCENT_DARK} />
            </div>
            <div style={{ fontSize: 82, fontWeight: 700, color: INK, letterSpacing: "-0.03em",
              lineHeight: 1.02, marginTop: 4 }}>
              Building <span style={{ fontFamily: SERIF, fontStyle: "italic", color: ACCENT_DARK }}>predictive model</span>
            </div>
            <div style={{ fontSize: 26, color: MUTED, fontWeight: 500, marginTop: 14, lineHeight: 1.35 }}>
              Pulling <b>18 months</b> of P-204 health history · cross-referencing <b>42 similar assets</b> across the fleet.
            </div>
            <div style={{
              marginTop: 28, display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.14em" }}>CONTEXT</div>
                <div style={{ fontSize: 64, fontWeight: 700, color: ACCENT_DARK, lineHeight: 1,
                  letterSpacing: "-0.03em" }}>540<span style={{ fontSize: 28, color: MUTED, marginLeft: 6, fontWeight: 700 }}>days</span></div>
              </div>
              <div style={{ width: 1, height: 70, background: "rgba(15,15,18,0.12)" }} />
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Chip text="samples · 2.4M"         color={MUTED} tint="rgba(15,15,18,0.05)" />
                <Chip text="cross-ref · 42 assets"  color={ACCENT_DARK} />
                <Chip text="handoff ← Alarm Agent"  color={CRITICAL_DARK} />
              </div>
            </div>
          </Glass>,

          // ─── FACE 3 — AI EXPLANATION ───
          <Glass key="c-face3" tint="alarm" style={{ width: 1520, padding: "44px 56px" }}>
            {/* Top label row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <AgentAvatar agent="forecasting" size={36} pulse pulseT={f} />
              <div style={{ fontSize: 14, fontWeight: 800, color: ACCENT_DARK, letterSpacing: "0.2em" }}>
                FORECASTING AGENT · PREDICTION
              </div>
              <div style={{ flex: 1 }} />
              <Chip text="confidence · 92%"   color={SUCCESS_DARK} tint="rgba(16,185,129,0.14)" />
              <Chip text="ETA · day 4 · 08:42" color={CRITICAL_DARK} />
            </div>

            {/* Body: hero number · explanation */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1px 1fr", gap: 36, alignItems: "center" }}>
              {/* LEFT — the time-to-failure hero */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: CRITICAL_DARK, letterSpacing: "0.22em", marginBottom: 8 }}>
                  PREDICTED FAILURE IN
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                  <div style={{ fontSize: 180, fontWeight: 700, color: CRITICAL_DARK,
                    lineHeight: 0.9, letterSpacing: "-0.06em",
                    fontFamily: SERIF, fontStyle: "italic" }}>
                    ~4
                  </div>
                  <div style={{ fontSize: 60, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>
                    days
                  </div>
                </div>
                <div style={{ fontSize: 15, color: MUTED, fontWeight: 600, marginTop: 4, letterSpacing: "0.04em" }}>
                  ≈ 94 hours from now
                </div>
              </div>

              {/* DIVIDER */}
              <div style={{ width: 1, height: 240, background: "rgba(15,15,18,0.12)" }} />

              {/* RIGHT — AI explanation */}
              <div>
                <div style={{ fontSize: 46, fontWeight: 700, color: INK, letterSpacing: "-0.02em",
                  lineHeight: 1.1 }}>
                  The bearing seal <span style={{ fontFamily: SERIF, fontStyle: "italic", color: CRITICAL_DARK }}>
                  will fail.</span>
                </div>
                <div style={{ fontSize: 21, color: INK_SOFT, fontWeight: 500, marginTop: 14, lineHeight: 1.45,
                  maxWidth: 820 }}>
                  The lubrication film is degrading. Internal friction is compounding non-linearly.
                  Left unaddressed, the seal will rupture, the housing will overheat, and
                  <b style={{ color: INK }}> Main Water Pump will shut down</b>.
                </div>

                {/* Cascaded impact chips */}
                <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                  <Chip text="cooling line A offline"    color={CRITICAL_DARK} />
                  <Chip text="downtime · 6h+"            color={CRITICAL_DARK} />
                  <Chip text="€ 4,200 lost output"       color={WARNING_DARK} />
                  <Chip text="3 cascaded work orders"    color={MUTED} tint="rgba(15,15,18,0.05)" />
                </div>
              </div>
            </div>
          </Glass>,
        ]}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   BEAT D — 4 shots: TITLE → CHART HERO → REASONING → CONFIDENCE HUGE
// ═══════════════════════════════════════════════════════════════════════════
const BeatD: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - B.D.start;

  return (
    <AbsoluteFill>
      <GlassBackground frame={frame} tint="cool" />

      {/* ─── Shot D1 — CHART HERO (plays first) ─── */}
      <Shot f={f} start={0} end={48} enter="tiltUp" exit="blur" fadeIn={14} fadeOut={12}>
        <Glass tint="default" style={{ width: 1620, padding: "40px 52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <AgentAvatar agent="forecasting" size={44} pulse pulseT={f} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.18em" }}>
                BEARING HEALTH · 30-DAY FORECAST
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: INK, letterSpacing: "-0.02em",
                lineHeight: 1.1, marginTop: 2 }}>
                P-204 · Main Water Pump
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <Chip text="aria-pred v2.4" color={ACCENT_DARK} size="md" />
          </div>
          <div style={{ height: 520 }}>
            <ForecastChartMini chartT={clamp((f - 6) / 34, 0, 1)} />
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 14, fontSize: 13,
            color: MUTED, fontWeight: 700 }}>
            <LegendItem color={INK}      text="Historical · 18 months" />
            <LegendItem color={CRITICAL} text="Forecast · dashed" dashed />
            <LegendItem color={CRITICAL} text="Critical threshold · 20%" dashed />
          </div>
        </Glass>
      </Shot>

      {/* ─── Shot D2 — TITLE ONLY (plain white bg, bold black text) ─── */}
      <Shot f={f} start={42} end={82} enter="rise" exit="slideUp" fadeIn={12} fadeOut={10}>
        {/* White canvas overlay covering grid + BrandPill for this shot */}
        <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }} />
        <AbsoluteFill style={{
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontFamily: geistFont,
            fontSize: 140,
            fontWeight: 800,
            color: "#000000",
            letterSpacing: "-0.035em",
            lineHeight: 1,
            textAlign: "center",
          }}>
            What happens next?
          </div>
        </AbsoluteFill>
      </Shot>

      {/* ─── Shot D3 — iPhone 3D reveal + Work-Order mobile flow + AI help ─── */}
      <Shot f={f} start={76} end={340} enter="zoom" exit="blur" fadeIn={2} fadeOut={12}>
        {/* Apple-keynote tagline — sits BEHIND the phone, large and airy.
            Fades in smoothly a beat after the phone lands so the device reads
            first, then the claim blooms in.  Two-line stacked headline with
            an Apple-like subhead; subtle ink gradient keeps it "amalgamato"
            with the cool background while staying legible. */}
        <AppleBackdropTagline f={f - 76} />
        <IPhoneAgentMockup f={f} startLocal={76} />
      </Shot>

      {/* ─── Shot D3b — INVENTORY BREAKOUT (full-viewport continuation of the
           phone dive: the screen content escapes the bezel and becomes the
           desktop Inventory Agent surface with a forecast column) ─────── */}
      <Shot f={f} start={328} end={540} enter="none" exit="blur" fadeIn={0} fadeOut={14}>
        <InventoryBreakout f={f - 328} />
      </Shot>

      {/* ─── Shot D4 — CONFIDENCE HUGE ─── */}
      <Shot f={f} start={542} end={570} enter="zoom" exit="blur" fadeIn={14} fadeOut={8}>
        <Glass tint="success" style={{ width: 1100, padding: "56px 72px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: SUCCESS_DARK, letterSpacing: "0.22em" }}>
            MODEL CONFIDENCE
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center",
            gap: 16, marginTop: 12 }}>
            <div style={{ fontSize: 240, fontWeight: 700, color: SUCCESS_DARK,
              lineHeight: 0.92, letterSpacing: "-0.05em" }}>
              {Math.round(92 * clamp((f - 346) / 18, 0, 1))}
            </div>
            <div style={{ fontSize: 100, fontWeight: 700, color: SUCCESS_DARK, letterSpacing: "-0.02em" }}>
              %
            </div>
          </div>
          <div style={{ fontSize: 22, color: MUTED, fontWeight: 500, marginTop: 12 }}>
            calibrated on <b>2.4M</b> similar signatures across the fleet
          </div>
        </Glass>
      </Shot>
    </AbsoluteFill>
  );
};

const ReasoningBigCard: React.FC<{
  num: string; unit: string; label: string; body: React.ReactNode;
  color?: string; appearT: number;
  agent?: AgentKey;
}> = ({ num, unit, label, body, color, appearT, agent }) => {
  const e = 1 - Math.pow(1 - appearT, 3);
  const ag = agent ? AGENTS[agent] : null;
  const effColor = color ?? (ag ? ag.colorDark : ACCENT_DARK);
  return (
    <Glass tint="default" style={{
      padding: "28px 32px",
      opacity: appearT,
      transform: `translateY(${(1 - e) * 20}px) scale(${0.96 + 0.04 * e})`,
    }}>
      {/* Header: agent chip (if any) + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        {ag && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "4px 10px", borderRadius: 999,
            background: `${ag.color}14`, border: `1px solid ${ag.color}33`,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: `linear-gradient(135deg, ${ag.color} 0%, ${ag.colorDark} 100%)`,
              color: "#fff", fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              letterSpacing: 0,
            }}>{ag.letter}</div>
            <span style={{ fontSize: 11, fontWeight: 800, color: ag.colorDark, letterSpacing: "0.12em",
              textTransform: "uppercase" }}>
              {ag.name.replace(" Agent", "")}
            </span>
          </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.18em" }}>{label}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
        <div style={{ fontSize: 82, fontWeight: 700, color: effColor, lineHeight: 1, letterSpacing: "-0.03em" }}>
          {num}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: effColor, letterSpacing: "-0.01em" }}>{unit}</div>
      </div>
      <div style={{ fontSize: 18, color: INK_SOFT, fontWeight: 500, marginTop: 10, lineHeight: 1.35 }}>
        {body}
      </div>
    </Glass>
  );
};

// ─── Apple-keynote backdrop tagline — flanks the centered phone ─────────────
// LEFT block:  "Designed with your / field operators"   (right-aligned
//               toward the phone edge)
// RIGHT block: "in mind, / too."                        (left-aligned away
//               from the phone edge)
// Phone sits between the two blocks; nothing is hidden behind it.
// ─── Apple editorial backdrop tagline — TWO-PHASE crossfade ──────────────
// PHASE 1 (originale)  → "Designed with your field operators in mind, too."
//   in 36→60 · hold 60→140 · out 140→156
// PHASE 2 (nuova)      → "Predicted in the cloud, solved on the floor."
//   in 156→180 · hold 180→240 · out 240→260
// Le due frasi si sovrappongono al centro dello schermo, dietro al telefono,
// con crossfade morbido + leggero drift verticale per la firma Apple.
const AppleBackdropTagline: React.FC<{ f: number }> = ({ f }) => {
  // Per-phase envelopes
  const p1In   = clamp((f - 36)  / 24, 0, 1);
  const p1Out  = clamp((f - 140) / 16, 0, 1);
  const p1Op   = (1 - Math.pow(1 - p1In, 3)) * (1 - p1Out);

  const p2In   = clamp((f - 156) / 24, 0, 1);
  const p2Out  = clamp((f - 240) / 20, 0, 1);
  const p2Op   = (1 - Math.pow(1 - p2In, 3)) * (1 - p2Out);

  // Per-line stagger builders — one per phase, so each phrase's lines
  // cascade independently (Apple keynote rhythm).
  const mkLineOp = (origin: number, outT: number) => (delay: number) => {
    const t = clamp((f - (origin + delay)) / 20, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    return e * (1 - outT);
  };
  const mkLineY = (origin: number, sign: 1 | -1) => (delay: number) => {
    const t = clamp((f - (origin + delay)) / 20, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    return sign * (1 - e) * 18;
  };
  const p1LineOp   = mkLineOp(36,  p1Out);
  const p1LineYUp  = mkLineY(36,   1);
  const p1LineYDn  = mkLineY(36,  -1);
  const p2LineOp   = mkLineOp(156, p2Out);
  const p2LineYUp  = mkLineY(156,  1);
  const p2LineYDn  = mkLineY(156, -1);

  // Apple editorial sizing — same rhythm used in both phases:
  //   LEFT  (setup)  : subhead + hero
  //   RIGHT (punch)  : subhead + hero (stronger, italic on hero)
  // Sized so every line fits inside 700px and never overlaps the phone
  // (phone left edge ~x=737 in 1920 frame).
  const HEAD_SUB   = 60;
  const HEAD_HERO  = 92;
  const RIGHT_SUB  = 72;
  const RIGHT_HERO = 116;

  // ── Helpers to render one "subhead + hero" side per phase ──
  const renderLeftSide = (
    sub: string,
    hero: string,
    lineOp: (d: number) => number,
    lineY: (d: number) => number,
  ) => (
    <>
      <div style={{
        fontSize: HEAD_SUB,
        fontWeight: 500,
        color: MUTED,
        letterSpacing: "-0.025em",
        lineHeight: 1.0,
        whiteSpace: "nowrap",
        opacity: 0.72 * lineOp(0),
        transform: `translateY(${lineY(0).toFixed(2)}px)`,
        marginBottom: 6,
      }}>
        {sub}
      </div>
      <div style={{
        fontSize: HEAD_HERO,
        fontWeight: 700,
        letterSpacing: "-0.045em",
        lineHeight: 0.98,
        whiteSpace: "nowrap",
        opacity: 0.85 * lineOp(8),
        transform: `translateY(${lineY(8).toFixed(2)}px)`,
        background: `linear-gradient(180deg, ${INK} 0%, #3A4050 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
      }}>
        {hero}
      </div>
    </>
  );

  const renderRightSide = (
    sub: string,
    hero: string,
    lineOp: (d: number) => number,
    lineY: (d: number) => number,
  ) => (
    <>
      <div style={{
        fontSize: RIGHT_SUB,
        fontWeight: 500,
        color: MUTED,
        letterSpacing: "-0.025em",
        lineHeight: 1.0,
        whiteSpace: "nowrap",
        opacity: 0.72 * lineOp(4),
        transform: `translateY(${lineY(4).toFixed(2)}px)`,
        marginBottom: 6,
      }}>
        {sub}
      </div>
      <div style={{
        fontSize: RIGHT_HERO,
        fontWeight: 700,
        fontStyle: "italic",
        letterSpacing: "-0.045em",
        lineHeight: 0.98,
        whiteSpace: "nowrap",
        opacity: 0.9 * lineOp(12),
        transform: `translateY(${lineY(12).toFixed(2)}px)`,
        background: `linear-gradient(180deg, ${INK} 0%, ${ACCENT_DARK} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
      }}>
        {hero}
      </div>
    </>
  );

  // Outer frames — positioned boxes defining the 700px safe zones beside
  // the phone. Padding lives on the inner phase layers so that multiple
  // phases can overlap, each centered vertically inside the padded area.
  const leftFrame: React.CSSProperties = {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 700,
    fontFamily: geistFont,
    mixBlendMode: "multiply",
    textAlign: "right",
  };
  const rightFrame: React.CSSProperties = {
    position: "absolute",
    right: 0, top: 0, bottom: 0,
    width: 700,
    fontFamily: geistFont,
    mixBlendMode: "multiply",
    textAlign: "left",
  };
  const leftPhaseLayer: React.CSSProperties = {
    position: "absolute",
    left: 0, right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    paddingLeft: 56,
    paddingRight: 24,
    boxSizing: "border-box",
  };
  const rightPhaseLayer: React.CSSProperties = {
    position: "absolute",
    left: 0, right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    paddingLeft: 24,
    paddingRight: 56,
    boxSizing: "border-box",
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* ── LEFT FRAME — phase 1 (original) + phase 2 stacked ─────── */}
      <div style={leftFrame}>
        <div style={{ ...leftPhaseLayer, opacity: p1Op }}>
          {renderLeftSide("Designed with your", "field operators", p1LineOp, p1LineYUp)}
        </div>
        <div style={{ ...leftPhaseLayer, opacity: p2Op }}>
          {renderLeftSide("Predicted in the", "cloud,", p2LineOp, p2LineYUp)}
        </div>
      </div>

      {/* ── RIGHT FRAME — phase 1 (original) + phase 2 stacked ────── */}
      <div style={rightFrame}>
        <div style={{ ...rightPhaseLayer, opacity: p1Op }}>
          {renderRightSide("in mind,", "too.", p1LineOp, p1LineYDn)}
        </div>
        <div style={{ ...rightPhaseLayer, opacity: p2Op }}>
          {renderRightSide("solved on the", "floor.", p2LineOp, p2LineYDn)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Inventory Rack 3D — realistic industrial pallet rack ─────────────────
// Morph timeline (morphT ∈ [0,1]):
//   0.00 – 0.25  steel uprights + X-bracing rise from the floor
//   0.15 – 0.40  beams & shelf decks slide in
//   0.30 – 0.80  items land on shelves (cardboard boxes, plastic bins, parts)
//   0.70 – 1.00  label tags on shelf edges + low-stock alert appears
// Visual grammar: warm warehouse lighting, concrete floor, brown corrugated
// cardboard boxes, blue industrial bins, visible steel texture on posts.
interface RackItem {
  shelf: 0 | 1 | 2;
  slot:  0 | 1 | 2;                                 // 3 slots per shelf
  kind:  "box" | "bin" | "coil" | "bearing";
  label: string;
  tone?: "brown" | "blue" | "grey";
  w?:    number;                                    // width override
  h?:    number;                                    // height override
  alert?: boolean;                                  // low-stock pulse
}
const RACK_ITEMS: RackItem[] = [
  // Shelf 0 — top (mixed small boxes + a coil)
  { shelf: 0, slot: 0, kind: "box",   label: "BRG-7842", tone: "brown" },
  { shelf: 0, slot: 1, kind: "box",   label: "SEAL-V4",  tone: "brown", h: 78 },
  { shelf: 0, slot: 2, kind: "coil",  label: "BELT-X3",  alert: true },
  // Shelf 1 — middle (plastic bins)
  { shelf: 1, slot: 0, kind: "bin",   label: "GSK-P9",   tone: "blue" },
  { shelf: 1, slot: 1, kind: "bin",   label: "FLT-F12",  tone: "blue" },
  { shelf: 1, slot: 2, kind: "bin",   label: "FUSE-10A", tone: "grey" },
  // Shelf 2 — bottom (bigger boxes + a heavy bearing)
  { shelf: 2, slot: 0, kind: "box",     label: "VLV-44",   tone: "brown", h: 112 },
  { shelf: 2, slot: 1, kind: "bearing", label: "BRG-HVY" },
  { shelf: 2, slot: 2, kind: "box",     label: "PMP-P2",   tone: "brown", h: 112 },
];

// ── Atomic renderers per item kind ───────────────────────────────────────

const CardboardBox: React.FC<{ w: number; h: number; label: string; alert?: boolean; pulse: number }> = ({ w, h, label, alert, pulse }) => (
  <div style={{
    position: "absolute", inset: 0,
    // Cardboard brown with seams & corrugated top edge
    background:
      "linear-gradient(180deg, #B58252 0%, #9E6B3D 45%, #7F5229 100%)",
    boxShadow:
      "inset 0 2px 0 rgba(255,255,255,0.12), " +
      "inset 0 -3px 0 rgba(0,0,0,0.28), " +
      "inset 3px 0 0 rgba(0,0,0,0.12), " +
      "inset -3px 0 0 rgba(0,0,0,0.16), " +
      "0 4px 8px rgba(0,0,0,0.35)" +
      (alert ? `, 0 0 ${(16 + pulse * 18).toFixed(0)}px ${CRITICAL_GLOW}` : ""),
    borderRadius: 2,
    overflow: "hidden",
  }}>
    {/* Corrugated top edge (thin vertical stripes) */}
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 8,
      background:
        "repeating-linear-gradient(90deg, #8E6130 0px, #8E6130 2px, #6D4820 2px, #6D4820 3px)",
      opacity: 0.9,
      borderBottom: "1px solid rgba(0,0,0,0.25)",
    }} />
    {/* Central seam where box flaps meet */}
    <div style={{
      position: "absolute",
      top: 8, bottom: 0, left: "50%",
      width: 1,
      background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 100%)",
      transform: "translateX(-0.5px)",
    }} />
    {/* Tape strip across the seam */}
    <div style={{
      position: "absolute",
      top: h * 0.28, left: -2, right: -2,
      height: 10,
      background: "linear-gradient(180deg, #D4C08A 0%, #BFA46A 100%)",
      opacity: 0.82,
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    }} />
    {/* Printed SKU label (white sticker) */}
    <div style={{
      position: "absolute",
      left: 8, right: 8, bottom: 10,
      background: "#F1EADC",
      border: "0.5px solid rgba(60,40,20,0.4)",
      padding: "3px 5px",
      fontFamily: geistFont,
      fontSize: Math.min(11, w * 0.10),
      fontWeight: 800,
      color: "#2A1D0F",
      letterSpacing: "0.03em",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 1px rgba(0,0,0,0.25)",
      textAlign: "center",
    }}>
      {label}
    </div>
    {/* FRAGILE-style warning line */}
    <div style={{
      position: "absolute",
      top: 14, left: 6, right: 6,
      height: 3,
      background: "repeating-linear-gradient(90deg, #6D4820 0 6px, transparent 6px 10px)",
      opacity: 0.5,
    }} />
  </div>
);

const PlasticBin: React.FC<{ w: number; h: number; label: string; tone: "blue" | "grey" }> = ({ w, h, label, tone }) => {
  const top    = tone === "blue" ? "#3E6BB8" : "#6B717A";
  const mid    = tone === "blue" ? "#2F528D" : "#4E535B";
  const bottom = tone === "blue" ? "#1E3A6A" : "#353941";
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${bottom} 100%)`,
      boxShadow:
        "inset 0 2px 0 rgba(255,255,255,0.18), " +
        "inset 0 -3px 0 rgba(0,0,0,0.3), " +
        "inset 2px 0 0 rgba(255,255,255,0.05), " +
        "inset -2px 0 0 rgba(0,0,0,0.2), " +
        "0 4px 8px rgba(0,0,0,0.35)",
      borderRadius: "3px 3px 4px 4px",
      overflow: "hidden",
    }}>
      {/* Molded handle (rectangular recess at the top) */}
      <div style={{
        position: "absolute",
        top: 5, left: "50%", transform: "translateX(-50%)",
        width: w * 0.42, height: 7,
        background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 100%)",
        borderRadius: 3,
        boxShadow: "inset 0 1px 1px rgba(0,0,0,0.5)",
      }} />
      {/* Horizontal ridges (molded stiffeners) */}
      {[0.38, 0.52, 0.66].map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: 3, right: 3,
          top: h * p,
          height: 1.5,
          background: "rgba(0,0,0,0.25)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.08)",
        }} />
      ))}
      {/* Front label holder (clear plastic pocket) */}
      <div style={{
        position: "absolute",
        left: 6, right: 6, bottom: 6,
        height: Math.max(18, h * 0.22),
        background: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(235,238,243,0.88) 100%)",
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.25)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: geistFont,
        fontSize: Math.min(10, w * 0.10),
        fontWeight: 800,
        color: INK,
        letterSpacing: "0.02em",
      }}>
        {label}
      </div>
    </div>
  );
};

const CoiledBelt: React.FC<{ w: number; h: number; label: string; alert?: boolean; pulse: number }> = ({ w, h, label, alert, pulse }) => {
  const cx = w / 2;
  const cy = h * 0.55;
  const rOuter = Math.min(w, h) * 0.42;
  const rInner = rOuter * 0.38;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Drop shadow beneath coil */}
      <div style={{
        position: "absolute",
        left: cx - rOuter * 0.9, top: cy + rOuter * 0.5,
        width: rOuter * 1.8, height: rOuter * 0.4,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(3px)",
      }} />
      {/* Outer rubber belt */}
      <div style={{
        position: "absolute",
        left: cx - rOuter, top: cy - rOuter,
        width: rOuter * 2, height: rOuter * 2,
        borderRadius: "50%",
        background:
          `radial-gradient(circle at 40% 30%, #3A3E48 0%, #1E2128 60%, #0B0D12 100%)`,
        boxShadow:
          "inset 0 3px 6px rgba(255,255,255,0.08), " +
          "inset 0 -3px 6px rgba(0,0,0,0.6), " +
          "0 2px 4px rgba(0,0,0,0.4)" +
          (alert ? `, 0 0 ${(16 + pulse * 20).toFixed(0)}px ${CRITICAL_GLOW}` : ""),
      }} />
      {/* Ribbed belt texture (concentric lines) */}
      {[0.92, 0.80, 0.70, 0.60, 0.50].map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          left: cx - rOuter * f, top: cy - rOuter * f,
          width: rOuter * 2 * f, height: rOuter * 2 * f,
          borderRadius: "50%",
          border: "1px solid rgba(0,0,0,0.35)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
        }} />
      ))}
      {/* Inner hole (center) */}
      <div style={{
        position: "absolute",
        left: cx - rInner, top: cy - rInner,
        width: rInner * 2, height: rInner * 2,
        borderRadius: "50%",
        background:
          `radial-gradient(circle at 40% 40%, #14161D 0%, #05060A 100%)`,
        boxShadow: "inset 0 2px 3px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
      }} />
      {/* Tag on top */}
      <div style={{
        position: "absolute",
        left: 6, right: 6, bottom: 4,
        background: "#F1EADC",
        padding: "2px 4px",
        fontFamily: geistFont,
        fontSize: Math.min(10, w * 0.10),
        fontWeight: 800,
        color: "#2A1D0F",
        textAlign: "center",
        boxShadow: "0 1px 1px rgba(0,0,0,0.25)",
      }}>
        {label}
      </div>
    </div>
  );
};

const SteelBearing: React.FC<{ w: number; h: number; label: string }> = ({ w, h, label }) => {
  const cx = w / 2;
  const cy = h * 0.55;
  const rOuter = Math.min(w, h) * 0.40;
  const rMid   = rOuter * 0.72;
  const rInner = rOuter * 0.32;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{
        position: "absolute",
        left: cx - rOuter * 0.9, top: cy + rOuter * 0.5,
        width: rOuter * 1.8, height: rOuter * 0.35,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)",
        filter: "blur(3px)",
      }} />
      {/* Outer steel ring */}
      <div style={{
        position: "absolute",
        left: cx - rOuter, top: cy - rOuter,
        width: rOuter * 2, height: rOuter * 2,
        borderRadius: "50%",
        background:
          `radial-gradient(circle at 35% 25%, #E8ECF2 0%, #8C94A6 45%, #4E5564 80%, #2A2F3A 100%)`,
        boxShadow:
          "inset 0 0 0 2px rgba(255,255,255,0.08), " +
          "0 3px 6px rgba(0,0,0,0.4)",
      }} />
      {/* Inner race */}
      <div style={{
        position: "absolute",
        left: cx - rMid, top: cy - rMid,
        width: rMid * 2, height: rMid * 2,
        borderRadius: "50%",
        background:
          `radial-gradient(circle at 35% 25%, #6A7285 0%, #3B4150 65%, #1D222C 100%)`,
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.08)",
      }} />
      {/* Balls (8 around the race) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const bx = cx + Math.cos(a) * rMid * 0.78;
        const by = cy + Math.sin(a) * rMid * 0.78;
        const bR = rMid * 0.18;
        return (
          <div key={i} style={{
            position: "absolute",
            left: bx - bR, top: by - bR,
            width: bR * 2, height: bR * 2,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #E8ECF2 0%, #8C94A6 50%, #2A2F3A 100%)",
            boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.4)",
          }} />
        );
      })}
      {/* Bore */}
      <div style={{
        position: "absolute",
        left: cx - rInner, top: cy - rInner,
        width: rInner * 2, height: rInner * 2,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 30%, #14161D 0%, #05060A 100%)",
        boxShadow: "inset 0 2px 3px rgba(0,0,0,0.8)",
      }} />
      {/* Tag on top */}
      <div style={{
        position: "absolute",
        left: 6, right: 6, bottom: 4,
        background: "#F1EADC",
        padding: "2px 4px",
        fontFamily: geistFont,
        fontSize: Math.min(10, w * 0.10),
        fontWeight: 800,
        color: "#2A1D0F",
        textAlign: "center",
        boxShadow: "0 1px 1px rgba(0,0,0,0.25)",
      }}>
        {label}
      </div>
    </div>
  );
};

const InventoryRack3D: React.FC<{ morphT: number; frame: number }> = ({ morphT, frame }) => {
  if (morphT <= 0) return null;
  const eMorph = 1 - Math.pow(1 - morphT, 3);

  // ── Geometry (fits the center safe zone between the tagline blocks) ──
  const RACK_W = 520;
  const RACK_H = 640;
  const SHELF_GAP = 200;       // vertical distance between deck tops
  const POST_W = 20;           // upright post (C-channel steel)
  const BEAM_H = 14;           // horizontal load beam
  const DECK_H = 8;            // wooden/steel deck sitting on the beams
  const RACK_DEPTH = 120;      // Z-depth of the rack (front-to-back)

  // Camera — settles to a clean 7° hero angle with a touch of top-down tilt
  const rotY = -14 + 21 * eMorph;
  const rotX = 5 * (1 - eMorph);
  const scale = 0.70 + 0.30 * eMorph;
  const entryTY = (1 - eMorph) * 18;

  const rackOp = clamp(morphT * 4, 0, 1);

  // Build cascades
  const postT  = (i: number) => clamp((morphT - 0.01 * i) / 0.22, 0, 1);  // 4 posts
  const beamT  = (i: number) => clamp((morphT - 0.12 - 0.03 * i) / 0.18, 0, 1);  // 3 beams
  const deckT  = (i: number) => clamp((morphT - 0.18 - 0.03 * i) / 0.18, 0, 1);  // 3 decks
  const itemOrder = (it: RackItem) => it.shelf * 3 + it.slot;
  const itemT = (it: RackItem) => {
    const start = 0.36 + itemOrder(it) * 0.035;
    return clamp((morphT - start) / 0.18, 0, 1);
  };

  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.25);

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      perspective: 2200,
      opacity: rackOp,
      pointerEvents: "none",
    }}>
      {/* ── Warm warehouse vignette (subtle, behind the rack) ── */}
      <div style={{
        position: "absolute", inset: 0,
        background:
          "radial-gradient(ellipse 520px 380px at 50% 55%, rgba(246,232,200,0.22) 0%, rgba(246,232,200,0) 75%)",
        mixBlendMode: "multiply",
        opacity: eMorph * 0.85,
      }} />

      <div style={{
        position: "relative",
        width: RACK_W, height: RACK_H,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        transform:
          `translateY(${entryTY.toFixed(2)}px) ` +
          `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) ` +
          `scale(${scale.toFixed(3)})`,
        willChange: "transform",
      } as React.CSSProperties}>

        {/* ── Concrete floor with safety stripe ── */}
        <div style={{
          position: "absolute",
          left: -80, right: -80,
          bottom: -40,
          height: 90,
          transform: `rotateX(90deg) translateZ(-40px)`,
          transformOrigin: "center top",
          background:
            "linear-gradient(180deg, #A8A8A0 0%, #8E8E86 55%, #6F6F68 100%)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.12)",
          opacity: eMorph,
        }}>
          {/* Yellow safety stripe */}
          <div style={{
            position: "absolute",
            top: 24, left: 0, right: 0,
            height: 8,
            background:
              "repeating-linear-gradient(45deg, #E8B53A 0 14px, #1A1A1A 14px 22px)",
            opacity: 0.75,
          }} />
          {/* Concrete speckle */}
          <div style={{
            position: "absolute", inset: 0,
            background:
              "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.07) 1px, transparent 2px), " +
              "radial-gradient(circle at 70% 60%, rgba(0,0,0,0.06) 1px, transparent 2px), " +
              "radial-gradient(circle at 40% 80%, rgba(0,0,0,0.08) 1px, transparent 2px)",
          }} />
        </div>

        {/* ── Rear back-panel (for depth) ── */}
        <div style={{
          position: "absolute",
          left: POST_W, right: POST_W,
          top: 0, bottom: 0,
          transform: `translateZ(-${RACK_DEPTH / 2}px)`,
          background:
            "linear-gradient(180deg, rgba(40,44,52,0.25) 0%, rgba(24,26,32,0.25) 100%)",
          opacity: eMorph * 0.35,
        }} />

        {/* ── 4 upright posts (C-channel steel, with Z offset front/back) ── */}
        {([
          { key: "lf", side: "left",  z:  RACK_DEPTH / 2 },
          { key: "lb", side: "left",  z: -RACK_DEPTH / 2 },
          { key: "rf", side: "right", z:  RACK_DEPTH / 2 },
          { key: "rb", side: "right", z: -RACK_DEPTH / 2 },
        ] as const).map((p, i) => {
          const t = postT(i);
          const e = 1 - Math.pow(1 - t, 3);
          const h = RACK_H * e;
          const leftPx = p.side === "left" ? 0 : RACK_W - POST_W;
          return (
            <React.Fragment key={p.key}>
              <div style={{
                position: "absolute",
                left: leftPx, bottom: 0,
                width: POST_W, height: h,
                transform: `translateZ(${p.z}px)`,
                // Industrial orange-steel gradient with shading
                background:
                  "linear-gradient(90deg, " +
                    "#5E2F14 0%, #8A4A1E 18%, #B5641F 50%, #8A4A1E 82%, #5E2F14 100%)",
                boxShadow:
                  "inset 0 0 0 1px rgba(0,0,0,0.45), " +
                  "inset 0 -40px 60px -20px rgba(0,0,0,0.35)",
              }}>
                {/* Bolt holes (evenly spaced) */}
                {Array.from({ length: 8 }).map((_, bi) => (
                  <div key={bi} style={{
                    position: "absolute",
                    top: 12 + bi * ((RACK_H - 24) / 7),
                    left: "50%", transform: "translateX(-50%)",
                    width: 5, height: 5, borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 35% 30%, #2A150A 0%, #0D0603 100%)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
                    opacity: e,
                  }} />
                ))}
                {/* Base plate (bottom) */}
                {e > 0.9 && (
                  <div style={{
                    position: "absolute",
                    left: -6, right: -6, bottom: -4,
                    height: 8,
                    background:
                      "linear-gradient(180deg, #B5641F 0%, #5E2F14 100%)",
                    border: "1px solid rgba(0,0,0,0.55)",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.35)",
                  }} />
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* ── Diagonal X-bracing on the left upright-frame side ── */}
        {(["left", "right"] as const).map((side) => {
          const xOuter = side === "left" ? POST_W / 2 : RACK_W - POST_W / 2;
          const bracings = [];
          for (let s = 0; s < 2; s++) {
            // Two X-braces, one near top and one near middle
            const topY = 60 + s * 260;
            const spanH = 180;
            const t = beamT(s + 1);
            const e = 1 - Math.pow(1 - t, 3);
            bracings.push(
              <React.Fragment key={`${side}-brace-${s}`}>
                {/* "\" diagonal */}
                <div style={{
                  position: "absolute",
                  left: xOuter - 2, top: topY,
                  width: 4, height: spanH * e,
                  background:
                    "linear-gradient(90deg, #5E2F14 0%, #8A4A1E 50%, #5E2F14 100%)",
                  transformOrigin: "top center",
                  transform:
                    `translateZ(0px) rotate(${side === "left" ? 28 : -28}deg)`,
                  boxShadow: "0 1px 1px rgba(0,0,0,0.3)",
                }} />
                {/* "/" diagonal */}
                <div style={{
                  position: "absolute",
                  left: xOuter - 2, top: topY,
                  width: 4, height: spanH * e,
                  background:
                    "linear-gradient(90deg, #5E2F14 0%, #8A4A1E 50%, #5E2F14 100%)",
                  transformOrigin: "top center",
                  transform:
                    `translateZ(-${RACK_DEPTH}px) rotate(${side === "left" ? -28 : 28}deg)`,
                  opacity: 0.8,
                }} />
              </React.Fragment>
            );
          }
          return <React.Fragment key={`${side}-braces`}>{bracings}</React.Fragment>;
        })}

        {/* ── 3 horizontal load beams + wooden shelf decks ── */}
        {[0, 1, 2].map((i) => {
          const tB = beamT(i);
          const eB = 1 - Math.pow(1 - tB, 3);
          const tD = deckT(i);
          const eD = 1 - Math.pow(1 - tD, 3);
          const y = 30 + i * SHELF_GAP;
          return (
            <React.Fragment key={`shelf-${i}`}>
              {/* Front load beam (steel, orange) */}
              <div style={{
                position: "absolute",
                left: POST_W, top: y,
                width: (RACK_W - POST_W * 2) * eB,
                height: BEAM_H,
                transform: `translateZ(${RACK_DEPTH / 2}px)`,
                transformOrigin: "left center",
                background:
                  "linear-gradient(180deg, #D47726 0%, #A85618 50%, #6A2F0C 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.15), " +
                  "inset 0 -2px 2px rgba(0,0,0,0.35), " +
                  "0 2px 4px rgba(0,0,0,0.35)",
                opacity: eB,
              }} />
              {/* Rear load beam */}
              <div style={{
                position: "absolute",
                left: POST_W, top: y,
                width: (RACK_W - POST_W * 2) * eB,
                height: BEAM_H,
                transform: `translateZ(-${RACK_DEPTH / 2}px)`,
                transformOrigin: "left center",
                background:
                  "linear-gradient(180deg, #8A4A1E 0%, #6A2F0C 100%)",
                opacity: eB * 0.85,
              }} />
              {/* Wooden deck on top (particleboard look) */}
              <div style={{
                position: "absolute",
                left: POST_W, top: y + BEAM_H,
                width: (RACK_W - POST_W * 2) * eD,
                height: DECK_H,
                transform: `translateZ(0)`,
                transformOrigin: "left center",
                background:
                  "repeating-linear-gradient(90deg, " +
                    "#C9A878 0px, #BC9A67 3px, #B08C57 5px, #BC9A67 7px, #C9A878 10px)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.25), " +
                  "inset 0 -2px 3px rgba(0,0,0,0.28), " +
                  "0 3px 5px rgba(0,0,0,0.35)",
                opacity: eD,
              }} />
              {/* Shelf edge label (hanging from the front beam) */}
              {eB > 0.9 && (
                <div style={{
                  position: "absolute",
                  left: POST_W + 14, top: y + BEAM_H + DECK_H,
                  transform: `translateZ(${RACK_DEPTH / 2 + 1}px)`,
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.35)",
                  padding: "2px 8px",
                  fontFamily: geistFont,
                  fontSize: 10,
                  fontWeight: 800,
                  color: INK,
                  letterSpacing: "0.08em",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.35)",
                  opacity: eB,
                }}>
                  {`AISLE A · ROW ${i + 1}`}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* ── Items on shelves ── */}
        {RACK_ITEMS.map((it) => {
          const t = itemT(it);
          if (t <= 0) return null;
          const e = 1 - Math.pow(1 - t, 3);
          const slotW = (RACK_W - POST_W * 2 - 16) / 3 - 6;
          const defaultH = 92;
          const itemW = it.w ?? slotW;
          const itemH = it.h ?? defaultH;
          const slotX = POST_W + 8 + it.slot * ((RACK_W - POST_W * 2 - 16) / 3);
          // Bottom of the slot sits on top of the wooden deck
          const shelfTopY = 30 + it.shelf * SHELF_GAP + BEAM_H + DECK_H;
          const itemY = shelfTopY - itemH;
          return (
            <div key={`item-${it.shelf}-${it.slot}`} style={{
              position: "absolute",
              left: slotX + (slotW - itemW) / 2, top: itemY,
              width: itemW, height: itemH,
              transformStyle: "preserve-3d",
              transform:
                `translateZ(${RACK_DEPTH / 4}px) ` +
                `translateY(${((1 - e) * -20).toFixed(2)}px) ` +
                `scale(${(0.85 + 0.15 * e).toFixed(3)})`,
              opacity: e,
            }}>
              {it.kind === "box" && (
                <CardboardBox w={itemW} h={itemH} label={it.label} alert={it.alert} pulse={pulse} />
              )}
              {it.kind === "bin" && (
                <PlasticBin w={itemW} h={itemH} label={it.label} tone={(it.tone ?? "blue") as "blue" | "grey"} />
              )}
              {it.kind === "coil" && (
                <CoiledBelt w={itemW} h={itemH} label={it.label} alert={it.alert} pulse={pulse} />
              )}
              {it.kind === "bearing" && (
                <SteelBearing w={itemW} h={itemH} label={it.label} />
              )}
              {/* Contact shadow on the deck */}
              <div style={{
                position: "absolute",
                left: "8%", right: "8%",
                bottom: -6, height: 8,
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(3px)",
              }} />
            </div>
          );
        })}

        {/* ── Low-stock flag on the alerting coiled belt ── */}
        {morphT > 0.8 && (() => {
          const alertItem = RACK_ITEMS.find(x => x.alert)!;
          const slotW = (RACK_W - POST_W * 2 - 16) / 3 - 6;
          const slotX = POST_W + 8 + alertItem.slot * ((RACK_W - POST_W * 2 - 16) / 3);
          const shelfTopY = 30 + alertItem.shelf * SHELF_GAP + BEAM_H + DECK_H;
          const itemH = alertItem.h ?? 92;
          const chipT = clamp((morphT - 0.8) / 0.14, 0, 1);
          const chipE = 1 - Math.pow(1 - chipT, 3);
          return (
            <div style={{
              position: "absolute",
              left: slotX + slotW / 2,
              top: shelfTopY - itemH - 22,
              transform:
                `translate(-50%, 0) translateZ(${RACK_DEPTH / 2 + 14}px) ` +
                `scale(${(0.85 + 0.15 * chipE).toFixed(3)})`,
              opacity: chipE,
              padding: "4px 10px",
              borderRadius: 999,
              background: `linear-gradient(135deg, ${CRITICAL} 0%, ${CRITICAL_DARK} 100%)`,
              color: "#FFF",
              fontFamily: geistFont,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.05em",
              boxShadow: `0 4px 10px ${CRITICAL_GLOW}, 0 0 0 2px rgba(255,255,255,0.9)`,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#FFF",
                opacity: 0.5 + 0.5 * pulse,
              }} />
              LOW STOCK · 2 LEFT
            </div>
          );
        })()}

        {/* ── Warm overhead light ── */}
        <div style={{
          position: "absolute",
          left: "10%", right: "10%", top: -60,
          height: 200,
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,220,150,0.28) 0%, rgba(255,220,150,0) 70%)",
          opacity: eMorph * 0.9,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── iPhone 3D mockup — rotates in, settles, screen shows agent notifications ─
const IPhoneAgentMockup: React.FC<{ f: number; startLocal: number }> = ({ f, startLocal }) => {
  const local = f - startLocal;

  // Phase 1 — rotation entry (0..22f): rotates from -78° to settled tilt
  const rotT = clamp(local / 22, 0, 1);
  const rotE = 1 - Math.pow(1 - rotT, 3);
  const rotY = -78 + (10 - -78) * rotE;
  const rotX = 8 * (1 - rotE);
  const scale = 0.72 + 0.28 * rotE;

  // Phase 2 — push-in (22..38f): scale increases slightly, rotY settles (not to 0 — keep 3D visible)
  const pushT = clamp((local - 22) / 16, 0, 1);
  const pushE = 1 - Math.pow(1 - pushT, 3);
  const rotY2 = 10 - 6 * pushE;                  // 10° → 4° (keep thickness visible at rest)
  const scale2 = 1 + 0.06 * pushE;

  // Subtle idle drift — phone "breathes" after settling so the 3D keeps reading
  const idleT = clamp((local - 38) / 30, 0, 1);
  const idleDrift = Math.sin((local - 38) * 0.08) * 1.2 * idleT;

  // Phase 3 — screen content (already on while phone rotates in; no white blank)
  // Home dashboard + status bar are pinned to 1 from frame 0 so the device
  // arrives with the Work-Orders dashboard already rendered.
  const statusT    = 1;
  const notifT     = clamp((local - 28) / 10, 0, 1);  // banner slides from top after settle
  // Banner slides back up and away, freeing the home for the user to tap
  const bannerOutT = clamp((local - 54) / 8,  0, 1);
  // User taps the "Bearing Seal Replacement" WO card — visible press feedback
  // BEFORE the push transition fires. Scale-down + blue highlight + ripple.
  const cardTapT   = clamp((local - 62) / 6,  0, 1);
  // iOS push transition driver: home pushes left + detail slides in from right
  const transT     = clamp((local - 68) / 14, 0, 1);
  const stepT      = clamp((local - 88)  / 14, 0, 1); // step card reveal + progress fill
  const toolsT     = clamp((local - 102) / 12, 0, 1); // Add Notes + Foto cards
  const ctaT       = clamp((local - 114) / 12, 0, 1); // Ask help to AI + Previous/Next nav
  // ── AI voice help sub-phase (tap → mic → transcription → answer + diagram) ──
  const aiTapT      = clamp((local - 140) / 6,  0, 1); // CTA scale-down pulse
  const aiRiseT     = clamp((local - 146) / 14, 0, 1); // AI overlay rises over detail
  const aiMicT      = clamp((local - 156) / 10, 0, 1); // mic + waveform appear
  const aiTransT    = clamp((local - 162) / 20, 0, 1); // user voice transcription types in
  const aiThinkT    = clamp((local - 182) / 10, 0, 1); // AI "thinking" dots
  const aiAnswerT   = clamp((local - 190) / 14, 0, 1); // AI answer text reveal
  const aiDiagramT  = clamp((local - 204) / 22, 0, 1); // diagram draws in

  // ── Beat D → Inventory Agent reveal + cinematic dive into the screen ──
  // The phone stays a phone, but its UI transitions from the AI diagram to
  // an "Inventory Agent" mobile surface, then the camera pushes in so the
  // screen content takes over the viewport (portal-style reveal).
  //
  //   218 – 230  AI modal dismisses (slides down + fades)
  //   224 – 244  Inventory Agent surface rises into view on the screen
  //   230 – 260  Inventory list populates; low-stock bin pulses
  //   250 – 264  Camera push-in: phone scales up, bezel fades, screen dominates
  const aiDismissT     = clamp((local - 218) / 12, 0, 1);
  const inventoryRiseT = clamp((local - 224) / 20, 0, 1);
  const inventoryListT = clamp((local - 230) / 20, 0, 1);
  const invAlertT      = clamp((local - 240) / 18, 0, 1);
  const diveT          = clamp((local - 250) / 14, 0, 1);
  const diveE          = 1 - Math.pow(1 - diveT, 3);
  const diveScale      = 1 + diveE * 0.45;          // phone grows 1.0 → 1.45
  const bezelFadeT     = clamp((local - 254) / 10, 0, 1);

  const finalRotY = rotY + rotY2 - 10 + idleDrift;
  const finalScale = scale * scale2 * diveScale;

  // Phone dimensions (within frame)
  const W = 420;
  const H = 860;
  const T = 38;                                  // phone thickness (real depth)
  const halfT = T / 2;
  const R = 60;                                  // body corner radius

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      perspective: 2000,
    }}>
      {/* Phone root — holds camera transform + preserve-3d */}
      <div style={{
        position: "relative",
        width: W, height: H,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        transform: `rotateX(${rotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) scale(${finalScale.toFixed(3)})`,
        willChange: "transform",
      } as React.CSSProperties}>

        {/* Drop shadow (flat plane beneath the phone) */}
        <div style={{
          position: "absolute",
          left: "6%", right: "6%", top: "92%", height: 38,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(12px)",
          transform: `translateZ(${-halfT - 1}px)`,
        }} />

        {/* ── BACK FACE ── */}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: R,
          background:
            "linear-gradient(135deg, #1f222a 0%, #14161c 45%, #0a0b0f 100%)",
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,0.04), " +
            "inset 0 -4px 10px rgba(0,0,0,0.55)",
          transform: `translateZ(${-halfT}px) rotateY(180deg)`,
          WebkitBackfaceVisibility: "hidden",
        }}>
          {/* Subtle AriA brand mark on back */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: geistFont, fontSize: 42, fontWeight: 900, letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.05)",
          }}>AriA</div>
          {/* Faux camera module */}
          <div style={{
            position: "absolute", top: 28, left: 28,
            width: 120, height: 120, borderRadius: 26,
            background: "linear-gradient(135deg, #2a2e37 0%, #0a0b0f 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.4)",
          }}>
            <div style={{
              position: "absolute", top: 14, left: 14, width: 38, height: 38, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #2a2f3a 0%, #05070a 75%)",
              boxShadow: "inset 0 0 0 1.5px #1a1c22, 0 0 0 2px #0a0b0f",
            }} />
            <div style={{
              position: "absolute", bottom: 14, right: 14, width: 38, height: 38, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #2a2f3a 0%, #05070a 75%)",
              boxShadow: "inset 0 0 0 1.5px #1a1c22, 0 0 0 2px #0a0b0f",
            }} />
            <div style={{
              position: "absolute", top: 46, right: 14, width: 22, height: 22, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #1a1c22 0%, #05070a 75%)",
            }} />
          </div>
        </div>

        {/* ── BODY CORE — stack of rounded-rect slices creates true thickness
             with proper rounded edges (no rectangular side walls) ── */}
        {(() => {
          const SLICES = 20;
          const nodes: React.ReactNode[] = [];
          for (let i = 0; i < SLICES; i++) {
            const tNorm = i / (SLICES - 1);              // 0..1
            const z = -halfT + tNorm * T;                // Z from -halfT .. +halfT
            // Shade: darker at the Z edges, slightly lighter in the middle (fake specular highlight)
            const tDist = Math.abs(tNorm - 0.5) * 2;     // 0 center, 1 edges
            const lum = 20 + 18 * (1 - tDist);
            nodes.push(
              <div key={`slice-${i}`} style={{
                position: "absolute", inset: 0,
                borderRadius: R,
                background: `hsl(220, 10%, ${lum.toFixed(1)}%)`,
                transform: `translateZ(${z.toFixed(2)}px)`,
              }} />
            );
          }
          return nodes;
        })()}

        {/* ── BUTTONS as small 3D cubes (stacked slices, offset outside body) ── */}
        {(() => {
          type Btn = { side: "left" | "right"; y: number; h: number; depth: number; };
          const buttons: Btn[] = [
            { side: "left",  y: 150, h: 34,  depth: T * 0.5 },  // action
            { side: "left",  y: 205, h: 66,  depth: T * 0.5 },  // vol up
            { side: "left",  y: 290, h: 66,  depth: T * 0.5 },  // vol down
            { side: "right", y: 240, h: 100, depth: T * 0.5 },  // power
          ];
          const BTN_SLICES = 6;
          const protrude = 3;
          return buttons.map((b, bi) => {
            const slices: React.ReactNode[] = [];
            for (let i = 0; i < BTN_SLICES; i++) {
              const tN = i / (BTN_SLICES - 1);
              const z = -b.depth / 2 + tN * b.depth;
              const tDist = Math.abs(tN - 0.5) * 2;
              const lum = 12 + 12 * (1 - tDist);
              const width = 7;
              const left = b.side === "left" ? -protrude : W - width + protrude;
              slices.push(
                <div key={`btn-${bi}-${i}`} style={{
                  position: "absolute",
                  top: b.y, left,
                  width, height: b.h,
                  borderRadius: 2.5,
                  background: `hsl(220, 10%, ${lum.toFixed(1)}%)`,
                  transform: `translateZ(${z.toFixed(2)}px)`,
                }} />
              );
            }
            return <React.Fragment key={`btn-${bi}`}>{slices}</React.Fragment>;
          });
        })()}

        {/* ── FRONT FACE (body + screen) — translated outward by +halfT ── */}
        <div style={{
          position: "absolute", inset: 0,
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: `translateZ(${halfT}px)`,
        } as React.CSSProperties}>
          {/* Front frame (bezel) */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: R,
            background:
              "linear-gradient(145deg, #3a3e48 0%, #1f222a 48%, #0e1014 100%)",
            boxShadow:
              "0 60px 120px -40px rgba(0,0,0,0.45), " +
              "0 30px 60px -20px rgba(0,0,0,0.35), " +
              "inset 0 0 0 2px rgba(255,255,255,0.06), " +
              "inset 0 -2px 4px rgba(0,0,0,0.5)",
          }} />

          {/* Screen */}
          <div style={{
            position: "absolute", top: 12, left: 12, right: 12, bottom: 12,
            borderRadius: 50,
            background: "linear-gradient(180deg, #F3F4F7 0%, #E8ECF4 100%)",
            overflow: "hidden",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
          }}>
          {/* Dynamic Island */}
          <div style={{
            position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
            width: 126, height: 34, borderRadius: 20,
            background: "#050608",
          }} />

          {/* Status bar */}
          <div style={{
            position: "absolute", top: 20, left: 30, right: 30,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: geistFont, fontSize: 14, fontWeight: 700, color: INK,
            opacity: statusT,
          }}>
            <span>18:50</span>
            <span style={{ width: 160 }} /> {/* dynamic island gap */}
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 10 }}>●●●●</span>
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

          {/* APP CONTENT ─ full-screen, beneath dynamic island + status bar ─ */}
          <div style={{
            position: "absolute", top: 56, left: 0, right: 0, bottom: 0,
            fontFamily: geistFont, overflow: "hidden",
          }}>
            {/* ── HOME SCREEN (pushes left when detail takes over) ── */}
            <PhoneHomeScreen pushT={transT} cardTapT={cardTapT} />
            {/* ── DETAIL SCREEN (slides in from right; card-stacks when AI modal up) ── */}
            <PhoneDetailScreen
              pushT={transT}
              stepT={stepT}
              toolsT={toolsT}
              ctaT={ctaT}
              aiTapT={aiTapT}
              modalT={aiRiseT}
            />
            {/* ── AI VOICE HELP MODAL (slides up from bottom over detail) ── */}
            <PhoneAIHelpOverlay
              riseT={aiRiseT}
              micT={aiMicT}
              transT={aiTransT}
              thinkT={aiThinkT}
              answerT={aiAnswerT}
              diagramT={aiDiagramT}
              dismissT={aiDismissT}
            />
            {/* ── INVENTORY AGENT surface (rises after AI modal dismisses) ── */}
            <PhoneInventoryScreen
              riseT={inventoryRiseT}
              listT={inventoryListT}
              alertT={invAlertT}
            />
            {/* ── INCOMING NOTIFICATION BANNER (sits on top of home only) ── */}
            <PhoneNotificationBanner notifT={notifT} dismiss={bannerOutT} />
          </div>

          {/* Screen glare overlay (3D effect) — dims out during the dive so the
              screen content looks flat + viewport-native */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(${105 + finalRotY * 0.3}deg,
              rgba(255,255,255,0.12) 0%,
              rgba(255,255,255,0.02) 35%,
              rgba(255,255,255,0) 55%,
              rgba(255,255,255,0.05) 100%)`,
            mixBlendMode: "screen",
            opacity: 1 - bezelFadeT,
            pointerEvents: "none",
          }} />
          </div>
          {/* /Screen */}
        </div>
        {/* /Front face */}
      </div>
      {/* /Phone root */}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   MOBILE WORK-ORDER APP — 3-phase flow rendered inside the iPhone screen
//   Phase A : Home dashboard (Work Orders list)
//   Phase B : Incoming notification banner slides down from top
//   Phase C : Work-Order detail with checklist (tasks pop in sequentially)
// ═══════════════════════════════════════════════════════════════════════════

// ─── PHASE A — HOME DASHBOARD (matches AriA mobile UI reference) ────────────
const PhoneHomeScreen: React.FC<{ pushT: number; cardTapT: number }> = ({
  pushT, cardTapT,
}) => {
  // iOS push — when detail takes over, home shifts LEFT by ~30% of screen width
  // with a slight dim overlay on top (standard UINavigationController feel).
  const ePush = 1 - Math.pow(1 - pushT, 3);
  const pushX = -ePush * 120;           // ~30% of 396-wide content
  return (
    <div style={{
      position: "absolute", inset: 0,
      transform: `translateX(${pushX.toFixed(2)}px)`,
      padding: "10px 22px 0",
      display: "flex", flexDirection: "column", gap: 14,
      willChange: "transform",
    }}>
      {/* Dim overlay that iOS draws on the back stack during a push */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#000",
        opacity: ePush * 0.18,
        pointerEvents: "none",
        zIndex: 99,
      }} />
      {/* Top-right more button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 6px 14px -6px rgba(15,15,18,0.1), 0 1px 3px rgba(15,15,18,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: INK_SOFT, letterSpacing: "-0.05em",
        }}>•••</div>
      </div>

      {/* Big title */}
      <div style={{
        fontSize: 34, fontWeight: 900, color: INK,
        letterSpacing: "-0.025em", lineHeight: 1.05,
        marginTop: -2, marginBottom: 6,
      }}>
        Work Orders
      </div>

      {/* TODAY section */}
      <PhoneSectionHeader icon="cal" title="Today" sub="1 scheduled activity" />
      <PhoneWOCard
        title="Bearing Seal Replacement"
        sub="P-204 · Main Pump · 0/5 · 2 doc"
        percent={0}
        tapT={cardTapT}
      />

      {/* PAST section */}
      <div style={{ height: 6 }} />
      <PhoneSectionHeader icon="clock" title="Past" sub="1 archived work order" />
      <div style={{
        textAlign: "center",
        fontSize: 10, fontWeight: 800, color: LABEL, letterSpacing: "0.18em",
        marginTop: 4, marginBottom: 2,
      }}>
        29 MAR 2026
      </div>
      <PhoneWOCard
        title="Hydraulic Pump Replacement"
        sub="0/5 completed · 1 doc"
        percent={0}
        muted
      />

      {/* Bottom nav */}
      <div style={{ flex: 1 }} />
      <PhoneBottomNav />
    </div>
  );
};

// ─── Reusable small section header (icon + title + sub) ────────────────────
const PhoneSectionHeader: React.FC<{ icon: "cal" | "clock"; title: string; sub: string }> = ({
  icon, title, sub,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: "rgba(15,15,18,0.04)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: INK, fontSize: 14, fontWeight: 800,
    }}>
      {icon === "cal" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="1.8" stroke={INK} strokeWidth="1.4" />
          <path d="M5 1.5v2.5M11 1.5v2.5M2 6.5h12" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3.2a4.8 4.8 0 1 1-4.54 3.25" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M2.2 2.6v3h3M8 5v3.2l2.2 1.4" stroke={INK} strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{sub}</div>
    </div>
  </div>
);

// ─── Reusable WO card (title + sub + percent + progress bar) ───────────────
const PhoneWOCard: React.FC<{
  title: string; sub: string; percent: number; muted?: boolean; tapT?: number;
}> = ({ title, sub, percent, muted = false, tapT = 0 }) => {
  // Tap curve: 0 → 1 (press-down) → 0 (release). Same language as the
  // "Ask help to AI" button: accent-tinted background + accent border + scale.
  const tapCurve = tapT <= 0.5 ? tapT * 2 : (1 - tapT) * 2;
  const pressScale = 1 - tapCurve * 0.05;
  const isTapping = tapT > 0;
  return (
    <div style={{
      position: "relative",
      background: isTapping
        ? `rgba(74,109,245,${(0.04 + tapCurve * 0.1).toFixed(3)})`
        : "#FFFFFF",
      border: isTapping
        ? `1px solid rgba(74,109,245,${(0.25 + tapCurve * 0.2).toFixed(3)})`
        : "1px solid transparent",
      borderRadius: 14,
      padding: "12px 14px",
      boxShadow: isTapping
        ? `0 10px 24px -10px rgba(74,109,245,${(0.2 * tapCurve).toFixed(3)}), 0 8px 20px -10px rgba(15,15,18,0.1), 0 1px 3px rgba(15,15,18,0.05)`
        : "0 8px 20px -10px rgba(15,15,18,0.1), 0 1px 3px rgba(15,15,18,0.05)",
      transform: `scale(${pressScale.toFixed(3)})`,
      transformOrigin: "50% 50%",
      willChange: "transform",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 800,
            color: muted ? INK_SOFT : INK,
            letterSpacing: "-0.01em", lineHeight: 1.2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{title}</div>
          <div style={{ fontSize: 10.5, color: MUTED, fontWeight: 500, marginTop: 2 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: muted ? MUTED : INK }}>{percent}%</div>
      </div>
      <div style={{
        marginTop: 10, height: 3, borderRadius: 3,
        background: "rgba(15,15,18,0.06)", position: "relative",
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: `${percent}%`,
          borderRadius: 3, background: ACCENT,
        }} />
      </div>
    </div>
  );
};

// ─── Bottom nav pill + floating search ─────────────────────────────────────
const PhoneBottomNav: React.FC = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingBottom: 14, paddingTop: 8,
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      background: "#FFFFFF",
      borderRadius: 999,
      padding: "6px 10px", gap: 4,
      boxShadow: "0 8px 20px -10px rgba(15,15,18,0.12), 0 1px 3px rgba(15,15,18,0.05)",
    }}>
      <PhoneNavItem label="Overview" active={false} icon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2.5 7L8 2.5 13.5 7v6a1 1 0 0 1-1 1H10v-4H6v4H3.5a1 1 0 0 1-1-1V7z"
            stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      } />
      <PhoneNavItem label="Orders" active={true} icon={
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2.5 11.5l5.5-5.5M4 2.5l3 3-1.5 1.5-3-3L4 2.5zM12 2.5l-3 3 1.5 1.5 3-3L12 2.5zM5.5 10l3 3 1-1-3-3-1 1z"
            stroke={INK} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      } />
    </div>
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      background: "#FFFFFF",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 8px 20px -10px rgba(15,15,18,0.12), 0 1px 3px rgba(15,15,18,0.05)",
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke={INK} strokeWidth="1.5" />
        <path d="M10.3 10.3l3 3" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const PhoneNavItem: React.FC<{ label: string; icon: React.ReactNode; active: boolean }> = ({
  label, icon, active,
}) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 2,
    padding: "4px 12px",
    borderRadius: 999,
    background: active ? "rgba(15,15,18,0.06)" : "transparent",
  }}>
    {icon}
    <div style={{ fontSize: 9, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>{label}</div>
  </div>
);

// ─── PHASE B — INCOMING NOTIFICATION BANNER ────────────────────────────────
// ─── BEAT E — INVENTORY AGENT SURFACE (rises after AI modal dismisses) ──────
// A full-screen mobile UI that replaces the AI overlay: header + 4 SKU rows
// with stock bars, one pulsing "low stock" alert at top. Designed so the
// camera push-in lands on a self-sufficient screen that reads at full viewport.
const PhoneInventoryScreen: React.FC<{
  riseT: number; listT: number; alertT: number;
}> = ({ riseT, listT, alertT }) => {
  if (riseT <= 0) return null;
  const e     = 1 - Math.pow(1 - riseT, 3);
  const riseY = (1 - e) * 40;
  const op    = clamp(riseT * 1.6, 0, 1);

  type Row = {
    sku: string; name: string; stock: number; min: number; max: number;
    critical?: boolean;
  };
  const rows: Row[] = [
    { sku: "BRG-6204", name: "Bearing 6204 ZZ",     stock: 3,  min: 8,  max: 40, critical: true },
    { sku: "BLT-M10",  name: "Coupling bolts M10",  stock: 22, min: 12, max: 50 },
    { sku: "SEL-42X",  name: "Mech. seal 42 mm",    stock: 11, min: 6,  max: 20 },
    { sku: "LUB-SHT",  name: "High-temp grease",    stock: 18, min: 10, max: 24 },
  ];

  // Per-row reveal stagger
  const rowT = (i: number) => clamp((listT - i * 0.12) / 0.4, 0, 1);

  // Pulse loop for the critical alert chip
  const pulse = alertT > 0
    ? 0.55 + 0.45 * Math.abs(Math.sin(alertT * Math.PI * 3))
    : 0;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "#F3F4F7",
      opacity: op,
      transform: `translateY(${riseY.toFixed(2)}px)`,
      padding: "14px 16px 14px",
      display: "flex", flexDirection: "column", gap: 10,
      fontFamily: geistFont,
      willChange: "transform, opacity",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`,
            color: "#fff", fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 10px -2px ${ACCENT}55`,
          }}>A</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              fontSize: 8.5, fontWeight: 800, color: MUTED, letterSpacing: "0.16em",
            }}>ARIA · INVENTORY</div>
            <div style={{
              fontSize: 13, fontWeight: 800, color: INK, letterSpacing: "-0.01em",
            }}>Warehouse A · Bay 3</div>
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: LABEL,
          padding: "4px 8px", borderRadius: 8,
          background: "rgba(15,15,18,0.06)",
        }}>Live</div>
      </div>

      {/* Alert banner — low stock */}
      {alertT > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: `linear-gradient(135deg, ${CRITICAL}14 0%, ${CRITICAL}08 100%)`,
          border: `1px solid ${CRITICAL}44`,
          borderRadius: 10,
          padding: "8px 10px",
          opacity: clamp(alertT * 2, 0, 1),
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: CRITICAL,
            boxShadow: `0 0 ${(4 + pulse * 10).toFixed(1)}px ${CRITICAL_GLOW}`,
            flexShrink: 0,
          }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: CRITICAL_DARK, letterSpacing: "-0.005em" }}>
              Low stock · BRG-6204
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: MUTED }}>
              3 left · reorder suggested by AriA
            </div>
          </div>
          <div style={{
            fontSize: 9.5, fontWeight: 800, color: "#fff",
            background: CRITICAL, padding: "4px 8px", borderRadius: 8,
            letterSpacing: "0.02em",
          }}>REORDER</div>
        </div>
      )}

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {rows.map((r, i) => {
          const tR = rowT(i);
          const eR = 1 - Math.pow(1 - tR, 3);
          const fill = clamp(r.stock / r.max, 0, 1);
          const low  = r.stock < r.min;
          const bar  = fill * eR;
          return (
            <div key={r.sku} style={{
              background: "#fff",
              border: "1px solid rgba(15,15,18,0.06)",
              borderRadius: 10,
              padding: "9px 11px",
              opacity: clamp(tR * 1.5, 0, 1),
              transform: `translateY(${((1 - eR) * 8).toFixed(2)}px)`,
              display: "flex", flexDirection: "column", gap: 6,
              boxShadow: "0 1px 2px rgba(15,15,18,0.04)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <div style={{
                    fontSize: 8.5, fontWeight: 800, color: LABEL, letterSpacing: "0.12em",
                  }}>{r.sku}</div>
                  <div style={{
                    fontSize: 11.5, fontWeight: 800, color: INK, letterSpacing: "-0.005em",
                  }}>{r.name}</div>
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 900,
                  color: low ? CRITICAL_DARK : INK,
                  letterSpacing: "-0.02em",
                }}>{r.stock}</div>
              </div>
              {/* Stock bar */}
              <div style={{
                position: "relative",
                width: "100%", height: 5, borderRadius: 3,
                background: "rgba(15,15,18,0.06)",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  width: `${(bar * 100).toFixed(1)}%`,
                  background: low
                    ? `linear-gradient(90deg, ${CRITICAL} 0%, ${CRITICAL_DARK} 100%)`
                    : `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                  borderRadius: 3,
                }} />
                {/* Min marker */}
                <div style={{
                  position: "absolute", top: -1, bottom: -1,
                  left: `${(r.min / r.max * 100).toFixed(1)}%`,
                  width: 1.5, background: "rgba(15,15,18,0.35)",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── SHOT D3b — INVENTORY BREAKOUT (desktop continuation of the dive) ───────
// Picks up where the phone dive ended: the inventory content grows from the
// phone's screen rect (420×860 in the center, scaled 1.45×) to the full
// 1920×1080 viewport, then reveals a richer desktop layout with a forecast
// column. A single pulsing alert remains the narrative anchor.
//
// Local frame budget (shot length 212f):
//   0 – 22   Grow + bezel dissolve (card expands from phone rect to full)
//   18 – 50  Alert banner re-seats into desktop position
//   28 – 90  SKU grid reveals + stock bars fill
//   60 – 140 Forecast column draws (chart + "why" bullets)
//   140 – 200  Hold (breathing room for the read)
//   200 – 212  Shot's own blur-out (handled by <Shot/>)
const InventoryBreakout: React.FC<{ f: number }> = ({ f }) => {
  // ── Phase 1 — grow from phone rect to full viewport ──────────────────────
  // Phone screen rect at end of dive: width ≈ 420 * 1.45 = 609,
  // height ≈ 860 * 1.45 = 1247 (center of viewport). The card begins at that
  // size + position and scales/reshapes to 1720×960 centered.
  const growT  = clamp(f / 22, 0, 1);
  const growE  = 1 - Math.pow(1 - growT, 3);
  const startW = 540;
  const startH = 960;
  const endW   = 1720;
  const endH   = 960;
  const W      = startW + (endW - startW) * growE;
  const H      = startH + (endH - startH) * growE;
  const cardOp = clamp(growT * 2, 0, 1);

  // ── Phase 2 — alert banner prominence ─────────────────────────────────────
  const alertT = clamp((f - 18) / 20, 0, 1);
  const alertE = 1 - Math.pow(1 - alertT, 3);
  const pulse  = alertT > 0
    ? 0.55 + 0.45 * Math.abs(Math.sin(f * 0.18))
    : 0;

  // ── Phase 3 — SKU rows reveal ─────────────────────────────────────────────
  const listT  = clamp((f - 28) / 60, 0, 1);

  // ── Phase 4 — forecast column draws ───────────────────────────────────────
  const foreT  = clamp((f - 60) / 80, 0, 1);
  const foreE  = 1 - Math.pow(1 - foreT, 3);

  type Row = {
    sku: string; name: string; stock: number; min: number; max: number;
    loc: string; critical?: boolean;
  };
  const rows: Row[] = [
    { sku: "BRG-6204", name: "Bearing 6204 ZZ",     stock: 3,  min: 8,  max: 40, loc: "A·Bay 3·S2", critical: true },
    { sku: "BLT-M10",  name: "Coupling bolts M10",  stock: 22, min: 12, max: 50, loc: "A·Bay 1·S4" },
    { sku: "SEL-42X",  name: "Mech. seal 42 mm",    stock: 11, min: 6,  max: 20, loc: "A·Bay 3·S1" },
    { sku: "LUB-SHT",  name: "High-temp grease",    stock: 18, min: 10, max: 24, loc: "A·Bay 2·S5" },
  ];
  const rowT = (i: number) => clamp((listT - i * 0.12) / 0.4, 0, 1);

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: geistFont,
    }}>
      <div style={{
        width: W, height: H,
        background: "#F7F8FB",
        borderRadius: 24,
        boxShadow:
          "0 60px 120px -40px rgba(15,15,18,0.22), " +
          "0 30px 60px -20px rgba(15,15,18,0.12)",
        border: "1px solid rgba(15,15,18,0.06)",
        overflow: "hidden",
        opacity: cardOp,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* ── Top bar — window chrome + AriA pill ──────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 24px",
          borderBottom: "1px solid rgba(15,15,18,0.06)",
          background: "#fff",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`,
              color: "#fff", fontSize: 12, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 10px -2px ${ACCENT}55`,
            }}>A</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: MUTED, letterSpacing: "0.16em" }}>
                ARIA · INVENTORY AGENT
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>
                Warehouse A · Bay 3 · Live
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            fontSize: 10, fontWeight: 800, color: "#fff",
            background: SUCCESS_DARK, padding: "5px 10px", borderRadius: 8,
            letterSpacing: "0.08em",
          }}>1,248 SKU · SYNCED</div>
        </div>

        {/* ── Body — two columns: inventory list + forecast panel ──────── */}
        <div style={{
          flex: 1, display: "flex", gap: 20, padding: 24, minHeight: 0,
        }}>
          {/* LEFT — inventory rows (scaling in from phone) */}
          <div style={{
            flex: 1.25, display: "flex", flexDirection: "column", gap: 14, minWidth: 0,
          }}>
            {/* Alert banner */}
            {alertT > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                background: `linear-gradient(135deg, ${CRITICAL}14 0%, ${CRITICAL}08 100%)`,
                border: `1.5px solid ${CRITICAL}55`,
                borderRadius: 14,
                padding: "16px 20px",
                opacity: alertE,
                transform: `translateY(${((1 - alertE) * 10).toFixed(2)}px)`,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: CRITICAL,
                  boxShadow: `0 0 ${(6 + pulse * 16).toFixed(1)}px ${CRITICAL_GLOW}`,
                  flexShrink: 0,
                }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 800, color: CRITICAL_DARK,
                    letterSpacing: "0.14em",
                  }}>LOW STOCK · AUTO-DETECTED</div>
                  <div style={{
                    fontSize: 20, fontWeight: 800, color: INK, letterSpacing: "-0.01em",
                  }}>Bearing 6204 ZZ — 3 units remaining</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>
                    Reorder threshold · 8 units · AriA suggests PO to supplier SKF
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: "#fff",
                  background: `linear-gradient(135deg, ${CRITICAL} 0%, ${CRITICAL_DARK} 100%)`,
                  padding: "10px 16px", borderRadius: 10,
                  letterSpacing: "0.08em",
                  boxShadow: `0 6px 14px -6px ${CRITICAL_GLOW}`,
                }}>CREATE PO</div>
              </div>
            )}

            {/* SKU rows */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 10,
              opacity: clamp(listT * 2, 0, 1),
            }}>
              {/* Column header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr 130px 170px 90px",
                gap: 16, padding: "0 14px",
                fontSize: 10, fontWeight: 800, color: LABEL, letterSpacing: "0.14em",
              }}>
                <div>SKU</div>
                <div>ITEM</div>
                <div>LOCATION</div>
                <div>STOCK</div>
                <div style={{ textAlign: "right" }}>QTY</div>
              </div>

              {rows.map((r, i) => {
                const tR = rowT(i);
                const eR = 1 - Math.pow(1 - tR, 3);
                const fill = clamp(r.stock / r.max, 0, 1);
                const low  = r.critical === true;
                const bar  = fill * eR;
                return (
                  <div key={r.sku} style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr 130px 170px 90px",
                    gap: 16, alignItems: "center",
                    background: low
                      ? "rgba(229,57,53,0.05)"
                      : "#fff",
                    border: low
                      ? `1px solid ${CRITICAL}33`
                      : "1px solid rgba(15,15,18,0.06)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    opacity: clamp(tR * 1.5, 0, 1),
                    transform: `translateY(${((1 - eR) * 8).toFixed(2)}px)`,
                    boxShadow: "0 1px 2px rgba(15,15,18,0.04)",
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 800, color: LABEL, letterSpacing: "0.1em",
                    }}>{r.sku}</div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: INK, letterSpacing: "-0.005em",
                    }}>{r.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>
                      {r.loc}
                    </div>
                    {/* Stock bar */}
                    <div style={{
                      position: "relative",
                      height: 8, borderRadius: 4,
                      background: "rgba(15,15,18,0.06)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        width: `${(bar * 100).toFixed(1)}%`,
                        background: low
                          ? `linear-gradient(90deg, ${CRITICAL} 0%, ${CRITICAL_DARK} 100%)`
                          : `linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                        borderRadius: 4,
                      }} />
                      {/* Min marker */}
                      <div style={{
                        position: "absolute", top: -2, bottom: -2,
                        left: `${(r.min / r.max * 100).toFixed(1)}%`,
                        width: 2, background: "rgba(15,15,18,0.45)",
                      }} />
                    </div>
                    <div style={{
                      fontSize: 18, fontWeight: 900,
                      color: low ? CRITICAL_DARK : INK,
                      letterSpacing: "-0.02em",
                      textAlign: "right",
                    }}>{r.stock}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — forecast "why" column */}
          <div style={{
            flex: 0.85, minWidth: 0,
            opacity: clamp(foreT * 2, 0, 1),
            transform: `translateX(${((1 - foreE) * 30).toFixed(2)}px)`,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <div style={{
              background: "#fff",
              border: "1px solid rgba(15,15,18,0.06)",
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex", flexDirection: "column", gap: 12,
              boxShadow: "0 1px 2px rgba(15,15,18,0.04)",
              flex: 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AgentAvatar agent="forecasting" size={28} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, color: MUTED, letterSpacing: "0.14em",
                  }}>WHY THIS MATTERS · AI FORECAST</div>
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: INK, letterSpacing: "-0.01em",
                  }}>BRG-6204 · runway</div>
                </div>
              </div>

              {/* Tiny burn-down chart */}
              <ForecastBurnDown t={foreE} />

              <div style={{
                display: "flex", flexDirection: "column", gap: 8,
                borderTop: "1px dashed rgba(15,15,18,0.1)",
                paddingTop: 10,
              }}>
                <BulletRow
                  color={CRITICAL_DARK}
                  label="3 WOs scheduled this week"
                  sub="2 use 2× BRG-6204 each → 6 units needed"
                  t={clamp((foreT - 0.25) / 0.35, 0, 1)}
                />
                <BulletRow
                  color={WARNING_DARK}
                  label="Supplier lead time · 5 days"
                  sub="Ships Mon → on-site Thu AM"
                  t={clamp((foreT - 0.45) / 0.35, 0, 1)}
                />
                <BulletRow
                  color={SUCCESS_DARK}
                  label="Stockout risk · avoided"
                  sub="if PO is approved within 24h"
                  t={clamp((foreT - 0.65) / 0.35, 0, 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Small burn-down sparkline: stock drops from today, crosses min threshold,
// hits zero around day 6 (without action).
const ForecastBurnDown: React.FC<{ t: number }> = ({ t }) => {
  const W = 380;
  const H = 120;
  const padL = 36, padR = 12, padT = 10, padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const days   = [0, 1, 2, 3, 4, 5, 6];
  const stocks = [3, 2.5, 2, 1, 0.5, 0.2, 0];   // projected without PO
  const xAt = (d: number) => padL + (d / 6) * innerW;
  const yAt = (s: number) => padT + (1 - s / 8) * innerH;  // scale 0..8
  const poly = days.map((d, i) => `${xAt(d)},${yAt(stocks[i]).toFixed(1)}`).join(" ");
  const drawT = clamp(t, 0, 1);
  const minY  = yAt(8);  // never drawn; min threshold instead:
  const thrY  = yAt(1);  // draw min threshold at stock=1 for visual emphasis
  void minY;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Axis */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgba(15,15,18,0.15)" strokeWidth={1} />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="rgba(15,15,18,0.15)" strokeWidth={1} />
      {/* Min threshold line */}
      <line x1={padL} y1={thrY} x2={W - padR} y2={thrY}
        stroke={CRITICAL} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.5} />
      <text x={padL + 4} y={thrY - 4} fontSize="9" fill={CRITICAL_DARK} fontWeight={800}
        fontFamily={geistFont} letterSpacing="0.08em">MIN · 8u</text>
      {/* Burn-down polyline (animated stroke-dashoffset) */}
      <polyline
        points={poly}
        fill="none"
        stroke={CRITICAL_DARK}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="400"
        strokeDashoffset={400 * (1 - drawT)}
      />
      {/* Zero-hit dot */}
      {drawT > 0.9 && (
        <circle cx={xAt(6)} cy={yAt(0)} r={4.5} fill={CRITICAL}
          stroke="#fff" strokeWidth={1.5} />
      )}
      {/* X-axis labels */}
      {[0, 2, 4, 6].map((d) => (
        <text key={d} x={xAt(d)} y={H - 6} fontSize="9" fill={MUTED}
          fontFamily={geistFont} textAnchor="middle" fontWeight={700}>
          {d === 0 ? "Today" : `+${d}d`}
        </text>
      ))}
    </svg>
  );
};

const BulletRow: React.FC<{
  color: string; label: string; sub: string; t: number;
}> = ({ color, label, sub, t }) => {
  const e = 1 - Math.pow(1 - t, 3);
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      opacity: clamp(t * 1.5, 0, 1),
      transform: `translateX(${((1 - e) * 12).toFixed(2)}px)`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%", background: color,
        marginTop: 7, flexShrink: 0,
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 800, color: INK, letterSpacing: "-0.005em",
        }}>{label}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>{sub}</div>
      </div>
    </div>
  );
};

const PhoneNotificationBanner: React.FC<{ notifT: number; dismiss: number }> = ({
  notifT, dismiss,
}) => {
  const ag = AGENTS.maintenance;
  const e = 1 - Math.pow(1 - notifT, 3);
  // iOS-style swipe-up dismiss: banner slides back above the status bar with
  // a mild ease-in (accelerating) so it feels flicked away.
  const eOut = Math.pow(dismiss, 2);
  const enterTranslate = (1 - e) * -120;
  const outTranslate   = -eOut * 160;
  const tapScale = 1 - eOut * 0.02;
  const opacity  = notifT * (1 - Math.pow(dismiss, 1.4));
  return (
    <div style={{
      position: "absolute", top: 10, left: 14, right: 14,
      borderRadius: 16,
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(15,15,18,0.07)",
      boxShadow: "0 20px 40px -14px rgba(15,15,18,0.22), 0 4px 12px -4px rgba(15,15,18,0.1)",
      padding: "11px 13px",
      display: "flex", gap: 11, alignItems: "center",
      opacity,
      transform: `translateY(${(enterTranslate + outTranslate).toFixed(2)}px) scale(${tapScale.toFixed(3)})`,
      transformOrigin: "50% 50%",
      willChange: "transform, opacity",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: `linear-gradient(135deg, ${ag.color} 0%, ${ag.colorDark} 100%)`,
        color: "#fff", fontSize: 13, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 4px 10px -2px ${ag.color}55`,
      }}>{ag.letter}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "baseline", gap: 6,
          fontSize: 9, fontWeight: 800, color: ag.colorDark, letterSpacing: "0.1em",
          marginBottom: 1,
        }}>
          <span>MAINTENANCE</span>
          <span style={{
            padding: "0.5px 5px", borderRadius: 999,
            background: `${CRITICAL}18`, border: `1px solid ${CRITICAL}44`,
            color: CRITICAL_DARK, fontSize: 8, letterSpacing: "0.08em",
          }}>HIGH</span>
          <span style={{ marginLeft: "auto", color: MUTED, fontWeight: 700 }}>now</span>
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 800, color: INK,
          letterSpacing: "-0.01em", lineHeight: 1.2,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>New WO · Bearing Seal Replacement</div>
        <div style={{
          fontSize: 10.5, fontWeight: 500, color: INK_SOFT,
          marginTop: 1, lineHeight: 1.25,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>P-204 · Main Water Pump · 5 steps</div>
      </div>
    </div>
  );
};

// ─── PHASE C — WORK-ORDER DETAIL (active step view) ────────────────────────
const PhoneDetailScreen: React.FC<{
  pushT: number; stepT: number; toolsT: number; ctaT: number;
  aiTapT: number; modalT: number;
}> = ({ pushT, stepT, toolsT, ctaT, aiTapT, modalT }) => {
  if (pushT <= 0) return null;
  // iOS push — detail enters from RIGHT edge of screen. easeOutCubic feels right.
  const ePush = 1 - Math.pow(1 - pushT, 3);
  const enterX = (1 - ePush) * 396;     // full content width
  const eS = 1 - Math.pow(1 - stepT,   3);
  const eT = 1 - Math.pow(1 - toolsT,  3);
  const eC = 1 - Math.pow(1 - ctaT,    3);
  // Tap animation — scale-down then back up
  const tapCurve = aiTapT <= 0.5 ? aiTapT * 2 : (1 - aiTapT) * 2;
  const tapScale = 1 - tapCurve * 0.05;
  // iOS card-stack modal: when AI overlay rises, detail scales down slightly
  // and gets rounded top corners + a dim overlay — like a presented sheet stack.
  const eModal = 1 - Math.pow(1 - modalT, 3);
  const stackScale  = 1 - eModal * 0.06;         // 1 → 0.94
  const stackRadius = eModal * 18;               // 0 → 18px top corners
  const stackTY     = -eModal * 8;               // slight upward lift

  // WO context
  const stepIndex     = 2;
  const stepCount     = 5;
  const completedDone = 1;                              // 1/5 completed
  const progressPct   = (completedDone / stepCount) * 100 * eS;
  const stepTitle     = "Remove impeller assembly";
  const stepDesc      =
    "Disconnect the motor coupling, loosen the locking ring and slide the impeller off the shaft. Inspect the bushings for wear and set aside for reassembly with the new SKF 6205-2RS seal.";

  return (
    <div style={{
      position: "absolute", inset: 0,
      transform:
        `translateX(${enterX.toFixed(2)}px) ` +
        `translateY(${stackTY.toFixed(2)}px) ` +
        `scale(${stackScale.toFixed(3)})`,
      transformOrigin: "50% 0%",
      borderTopLeftRadius:  stackRadius,
      borderTopRightRadius: stackRadius,
      background: "linear-gradient(180deg, #F3F4F7 0%, #E8ECF4 100%)",
      overflow: "hidden",
      padding: "6px 20px 14px",
      display: "flex", flexDirection: "column", gap: 12,
      boxShadow: eModal > 0
        ? `0 -10px 30px -12px rgba(15,15,18,${(0.18 * eModal).toFixed(3)})`
        : "none",
      willChange: "transform",
    }}>
      {/* iOS-style dim overlay when AI modal presents on top (card-stack) */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#000",
        opacity: eModal * 0.22,
        pointerEvents: "none",
        zIndex: 99,
      }} />
      {/* ── HEADER — centered WO title + close X ── */}
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: 40, marginTop: 2,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: INK,
          letterSpacing: "-0.01em",
          textAlign: "center",
        }}>
          Bearing Seal Replacement
        </div>
        <div style={{
          position: "absolute", right: 0, top: 2,
          width: 36, height: 36, borderRadius: "50%",
          background: "#FFFFFF",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 14px -6px rgba(15,15,18,0.1), 0 1px 3px rgba(15,15,18,0.06)",
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M3 3l7 7M10 3l-7 7" stroke={INK}
              strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* ── STEP CARD ── */}
      <div style={{
        background: "rgba(15,15,18,0.035)",
        border: "1px solid rgba(15,15,18,0.06)",
        borderRadius: 18,
        padding: "14px 15px 16px",
        opacity: stepT,
        transform: `translateY(${(1 - eS) * 14}px)`,
      }}>
        {/* Top row — Step N of M pill + To do status */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <div style={{
            padding: "3px 10px", borderRadius: 999,
            background: "rgba(15,15,18,0.1)",
            fontSize: 10, fontWeight: 800, color: INK,
            letterSpacing: "-0.005em",
          }}>
            Step {stepIndex} of {stepCount}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 11, fontWeight: 600, color: MUTED,
          }}>
            <span style={{
              width: 13, height: 13, borderRadius: "50%",
              border: `1.4px solid ${MUTED}`,
              display: "inline-block",
            }} />
            To do
          </div>
        </div>

        {/* Step title */}
        <div style={{
          fontSize: 17, fontWeight: 900, color: INK,
          letterSpacing: "-0.02em", lineHeight: 1.15,
          marginTop: 2, marginBottom: 6,
        }}>
          {stepTitle}
        </div>

        {/* Step description */}
        <div style={{
          fontSize: 11, color: INK_SOFT, fontWeight: 500,
          lineHeight: 1.4, letterSpacing: "-0.005em",
        }}>
          {stepDesc}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 12, height: 3, borderRadius: 3,
          background: "rgba(15,15,18,0.08)", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${progressPct.toFixed(1)}%`, borderRadius: 3,
            background: INK,
          }} />
        </div>

        {/* Dots + "1/5 completed" */}
        <div style={{
          marginTop: 8,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: stepCount }).map((_, i) => (
              <span key={i} style={{
                width: i + 1 === stepIndex ? 8 : 4,
                height: 4, borderRadius: 2,
                background: i + 1 === stepIndex ? INK
                  : i + 1 < stepIndex ? INK_SOFT : "rgba(15,15,18,0.18)",
                transition: "width 200ms",
              }} />
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED }}>
            {completedDone}/{stepCount} completed
          </div>
        </div>
      </div>

      {/* ── Add Notes + Foto cards ── */}
      <div style={{ display: "flex", gap: 10, opacity: toolsT,
        transform: `translateY(${(1 - eT) * 12}px)` }}>
        <PhoneToolCard
          icon="notes"
          title="Add Notes"
          sub="No notes"
        />
        <PhoneToolCard
          icon="foto"
          title="Foto"
          sub="No photo"
        />
      </div>

      {/* ── Spacer pushes CTA to bottom ── */}
      <div style={{ flex: 1 }} />

      {/* ── Ask help to AI (tap-animated) ── */}
      <div style={{
        background: aiTapT > 0
          ? `rgba(74,109,245,${0.06 + aiTapT * 0.14})`
          : "rgba(15,15,18,0.04)",
        border: aiTapT > 0
          ? `1px solid ${ACCENT}44`
          : "1px solid rgba(15,15,18,0.06)",
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: ctaT,
        transform: `translateY(${(1 - eC) * 16}px) scale(${tapScale.toFixed(3)})`,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5l1.1 2.9L11 5.5 8.1 6.6 7 9.5 5.9 6.6 3 5.5l2.9-1.1L7 1.5z"
            fill={ACCENT} stroke={ACCENT} strokeWidth="0.6" strokeLinejoin="round" />
          <path d="M11.5 9.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4.4-1z"
            fill={ACCENT} />
        </svg>
        <span style={{
          fontSize: 13, fontWeight: 800, color: INK,
          letterSpacing: "-0.01em",
        }}>
          Ask help to AI
        </span>
      </div>

      {/* ── Previous / Next ── */}
      <div style={{
        display: "flex", gap: 10,
        opacity: ctaT,
        transform: `translateY(${(1 - eC) * 20}px)`,
      }}>
        <div style={{
          flex: "0 0 auto",
          background: "#FFFFFF",
          borderRadius: 999,
          padding: "12px 18px",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 800, color: INK,
          letterSpacing: "-0.01em",
          boxShadow: "0 6px 14px -6px rgba(15,15,18,0.1), 0 1px 3px rgba(15,15,18,0.06)",
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M7 2L3 5.5 7 9" stroke={INK}
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </div>
        <div style={{
          flex: 1,
          background: "#0F1629",
          borderRadius: 999,
          padding: "12px 18px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontSize: 13, fontWeight: 800, color: "#FFFFFF",
          letterSpacing: "-0.01em",
          boxShadow: "0 8px 16px -6px rgba(15,22,41,0.35)",
        }}>
          Next
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M4 2l4 3.5-4 3.5" stroke="#FFFFFF"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── PHASE D — AI VOICE HELP OVERLAY (mic → transcript → answer + diagram) ──
const PhoneAIHelpOverlay: React.FC<{
  riseT: number; micT: number; transT: number;
  thinkT: number; answerT: number; diagramT: number;
  dismissT?: number;
}> = ({ riseT, micT, transT, thinkT, answerT, diagramT, dismissT = 0 }) => {
  if (riseT <= 0) return null;
  // iOS modal sheet: slides up from BOTTOM of screen. Content area is ~780px
  // tall; the sheet covers the top portion, leaving a small gap at the top
  // where the presenting screen peeks out (iOS 13+ card-style).
  const e  = 1 - Math.pow(1 - riseT, 3);
  const SHEET_TOP_GAP = 18;              // presenter peek gap at the top
  const sheetH = 780 - SHEET_TOP_GAP;    // sheet height in px
  // Dismiss: slide back down + fade out (swipe-to-dismiss feel)
  const dE       = 1 - Math.pow(1 - dismissT, 3);
  const dismissY = dE * sheetH;
  const enterY   = (1 - e) * sheetH + dismissY;
  const sheetOp  = 1 - dE;

  // User spoken question — typed progressively
  const userQuestion = "Help me understand this step better";
  const userShown = userQuestion.slice(0, Math.floor(userQuestion.length * transT));

  // AI answer — typed progressively
  const aiAnswer =
    "First, release the coupling bolts, then slide the locking ring off the shaft. The impeller will pull free along the keyway — no force needed.";
  const aiShown = aiAnswer.slice(0, Math.floor(aiAnswer.length * answerT));

  return (
    <div style={{
      position: "absolute",
      top: SHEET_TOP_GAP, left: 0, right: 0, bottom: 0,
      background: "rgba(255,255,255,0.99)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      boxShadow: "0 -20px 40px -18px rgba(15,15,18,0.22)",
      transform: `translateY(${enterY.toFixed(2)}px)`,
      opacity: sheetOp,
      padding: "10px 20px 16px",
      display: "flex", flexDirection: "column", gap: 12,
      overflow: "hidden",
      willChange: "transform, opacity",
    }}>
      {/* iOS-style drag handle (grabber) at the top of the sheet */}
      <div style={{
        position: "absolute", top: 6, left: "50%",
        transform: "translateX(-50%)",
        width: 38, height: 4, borderRadius: 2,
        background: "rgba(15,15,18,0.14)",
      }} />
      {/* Top row — AriA AI label + close X */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        minHeight: 36,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 9,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`,
            color: "#fff", fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 10px -2px ${ACCENT}55`,
          }}>A</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: MUTED, letterSpacing: "0.14em",
            }}>ARIA AI · HELP</div>
            <div style={{
              fontSize: 12, fontWeight: 800, color: INK, letterSpacing: "-0.01em",
            }}>Step 2 · Impeller</div>
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(15,15,18,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M2.5 2.5l6 6M8.5 2.5l-6 6" stroke={INK}
              strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* User bubble — appears when transcription starts */}
      {transT > 0 && (
        <div style={{
          alignSelf: "flex-end",
          maxWidth: "88%",
          background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
          color: "#fff",
          borderRadius: 14,
          borderBottomRightRadius: 4,
          padding: "9px 12px",
          fontSize: 11.5, fontWeight: 600,
          letterSpacing: "-0.005em", lineHeight: 1.3,
          boxShadow: `0 6px 14px -6px ${ACCENT}66`,
          opacity: clamp(transT * 4, 0, 1),
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <rect x="3.25" y="1" width="2.5" height="4.5" rx="1.25" fill="#fff" />
              <path d="M1.5 4v0.3a3 3 0 0 0 6 0V4M4.5 7v1" stroke="#fff"
                strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.08em",
              opacity: 0.85 }}>YOU · VOICE</span>
          </div>
          <span>"{userShown}</span>
          {transT < 1 && <span style={{ opacity: 0.7 }}>|</span>}
          {transT >= 1 && <span>"</span>}
        </div>
      )}

      {/* AI bubble — thinking then answer, + diagram */}
      {(thinkT > 0 || answerT > 0 || diagramT > 0) && (
        <div style={{
          alignSelf: "flex-start",
          width: "100%",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 9, fontWeight: 800, color: ACCENT_DARK,
            letterSpacing: "0.14em",
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 5,
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 9, fontWeight: 900,
            }}>A</span>
            ARIA
          </div>

          {/* Thinking dots while answer is empty */}
          {thinkT > 0 && answerT < 0.05 && (
            <div style={{
              background: "rgba(15,15,18,0.04)",
              border: "1px solid rgba(15,15,18,0.06)",
              borderRadius: 14,
              borderTopLeftRadius: 4,
              padding: "10px 14px",
              display: "flex", gap: 4,
              alignItems: "center",
              width: "fit-content",
              opacity: clamp(thinkT * 3, 0, 1),
            }}>
              {[0, 1, 2].map((i) => {
                const delay = i * 0.2;
                const phase = ((thinkT * 6 - delay) % 1 + 1) % 1;
                const op = 0.4 + Math.sin(phase * Math.PI) * 0.6;
                return (
                  <span key={i} style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: INK, opacity: op,
                  }} />
                );
              })}
            </div>
          )}

          {/* Answer text bubble */}
          {answerT > 0.05 && (
            <div style={{
              background: "rgba(15,15,18,0.04)",
              border: "1px solid rgba(15,15,18,0.06)",
              borderRadius: 14,
              borderTopLeftRadius: 4,
              padding: "10px 12px",
              fontSize: 11.5, fontWeight: 500, color: INK,
              letterSpacing: "-0.005em", lineHeight: 1.4,
            }}>
              {aiShown}
              {answerT < 1 && <span style={{ opacity: 0.5 }}>|</span>}
            </div>
          )}

          {/* Impeller removal diagram */}
          {diagramT > 0 && (
            <ImpellerDiagram diagramT={diagramT} />
          )}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom mic dock — always visible, pulses with mic state */}
      {micT > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#FFFFFF",
          borderRadius: 999,
          padding: "8px 12px 8px 8px",
          boxShadow: "0 10px 24px -10px rgba(15,15,18,0.14), 0 1px 3px rgba(15,15,18,0.06)",
          opacity: micT,
        }}>
          <MicButton micT={micT} answerT={answerT} />
          <div style={{ flex: 1 }}>
            <AudioWaveform micT={micT} answerT={answerT} />
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: MUTED,
            padding: "3px 8px", borderRadius: 999,
            background: "rgba(15,15,18,0.04)",
            letterSpacing: "-0.005em",
          }}>
            {answerT > 0.05 ? "Done" : transT >= 1 ? "Processing…" : "Listening…"}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Animated microphone button (pulse ring while listening) ────────────────
const MicButton: React.FC<{ micT: number; answerT: number }> = ({ micT, answerT }) => {
  const listening = answerT < 0.05;
  // Simple sine pulse for the outer halo
  const pulse = listening ? Math.abs(Math.sin(micT * 14)) : 0;
  const haloScale = 1 + pulse * 0.25;
  const haloAlpha = (listening ? 0.18 + pulse * 0.2 : 0.0);
  return (
    <div style={{ position: "relative", width: 36, height: 36 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: ACCENT,
        transform: `scale(${haloScale.toFixed(3)})`,
        opacity: haloAlpha,
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: listening
          ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`
          : `linear-gradient(135deg, ${SUCCESS} 0%, ${SUCCESS_DARK} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 10px -2px ${listening ? ACCENT : SUCCESS}55`,
      }}>
        {listening ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="5" y="1.5" width="4" height="7" rx="2" fill="#fff" />
            <path d="M2.5 6.5V7a4.5 4.5 0 0 0 9 0V6.5M7 11v1.5" stroke="#fff"
              strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5l3 3 5-6" stroke="#fff"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
};

// ─── Audio waveform strip (animates while listening, flattens after) ────────
const AudioWaveform: React.FC<{ micT: number; answerT: number }> = ({ micT, answerT }) => {
  const active = answerT < 0.05;
  const bars = 22;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 20 }}>
      {Array.from({ length: bars }).map((_, i) => {
        // Pseudo-random per-bar phase
        const phase = (i * 0.37) % 1;
        const t = micT * 10 + i * 0.6;
        const amp = active ? (0.3 + 0.7 * Math.abs(Math.sin(t + phase * 6))) : 0.12;
        const h = 4 + amp * 16;
        return (
          <div key={i} style={{
            width: 2.5, height: h, borderRadius: 1.5,
            background: active ? ACCENT : "rgba(15,15,18,0.2)",
            transition: "height 60ms, background 200ms",
          }} />
        );
      })}
    </div>
  );
};

// ─── Impeller-removal diagram ───────────────────────────────────────────────
// Technical blueprint-style cross-section: motor housing with mounting flange,
// bearing stack, keyed shaft with hatching, centrifugal impeller (shrouds +
// curved blades), locking ring, and dimension arrow showing slide-off.
const ImpellerDiagram: React.FC<{ diagramT: number }> = ({ diagramT }) => {
  // Normalized draw-in phases per component
  const p1 = clamp(diagramT / 0.14, 0, 1);                 // center line
  const p2 = clamp((diagramT - 0.05) / 0.18, 0, 1);        // housing outline + flange
  const p3 = clamp((diagramT - 0.16) / 0.12, 0, 1);        // housing hatching
  const p4 = clamp((diagramT - 0.22) / 0.14, 0, 1);        // bearing stack
  const p5 = clamp((diagramT - 0.30) / 0.18, 0, 1);        // shaft + keyway
  const p6 = clamp((diagramT - 0.42) / 0.22, 0, 1);        // impeller shrouds + blades
  const p7 = clamp((diagramT - 0.58) / 0.12, 0, 1);        // locking ring
  const p8 = clamp((diagramT - 0.66) / 0.16, 0, 1);        // slide-off arrow + dim line
  const p9 = clamp((diagramT - 0.78) / 0.22, 0, 1);        // callouts + labels

  const draw = (len: number, dash: number) => ({
    strokeDasharray: dash,
    strokeDashoffset: (1 - len) * dash,
  });

  // Subtle paper-grid background (blueprint feel)
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(15,15,18,0.08)",
      borderRadius: 14,
      padding: "10px 12px 8px",
      opacity: clamp(diagramT * 3, 0, 1),
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 6,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 800, color: LABEL, letterSpacing: "0.14em",
        }}>
          FIG · IMPELLER REMOVAL
        </div>
        <div style={{
          fontSize: 8, fontWeight: 700, color: MUTED, letterSpacing: "0.12em",
        }}>
          P-204 · SEC. A-A
        </div>
      </div>

      <div style={{ position: "relative" }}>
        {/* Blueprint grid */}
        <svg width="100%" height="164" viewBox="0 0 300 164" fill="none"
          style={{ display: "block" }}>
          <defs>
            {/* Hatch pattern for solid material (engineering standard) */}
            <pattern id="hatch-solid" patternUnits="userSpaceOnUse"
              width="5" height="5" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" stroke={INK_SOFT}
                strokeWidth="0.55" />
            </pattern>
            {/* Light hatch for keyway */}
            <pattern id="hatch-key" patternUnits="userSpaceOnUse"
              width="3" height="3" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="3" stroke={INK} strokeWidth="0.4" />
            </pattern>
            {/* Arrowhead marker for dimension lines */}
            <marker id="arrow-accent" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill={ACCENT} />
            </marker>
            <marker id="tick-ink" viewBox="0 0 10 10" refX="5" refY="5"
              markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 V10" stroke={INK} strokeWidth="1.3" />
            </marker>
          </defs>

          {/* Grid dots — very subtle */}
          <g opacity="0.35">
            {Array.from({ length: 15 }).map((_, i) =>
              Array.from({ length: 8 }).map((_, j) => (
                <circle key={`${i}-${j}`} cx={i * 20 + 10} cy={j * 20 + 12}
                  r="0.5" fill={LABEL} />
              ))
            )}
          </g>

          {/* ───── Axis center line (dashed) ───── */}
          <line x1="12" y1="82" x2="290" y2="82"
            stroke={MUTED} strokeWidth="0.6"
            strokeDasharray="6 3 1.5 3"
            style={{
              strokeDasharray: "6 3 1.5 3",
              strokeDashoffset: (1 - p1) * 278,
              opacity: p1,
            }} />

          {/* ───── Motor / bearing housing (left block) ───── */}
          {/* Mounting flange (left) */}
          <g opacity={p2}>
            <path d="M18 34 L30 34 L30 48 L22 52 L22 112 L30 116 L30 130 L18 130 Z"
              stroke={INK} strokeWidth="1.4" strokeLinejoin="round" fill="none"
              style={draw(p2, 260)} />
            {/* Bolt holes on flange */}
            <circle cx="24" cy="42"  r="1.6" stroke={INK} strokeWidth="0.9" fill="#FFF"
              style={{ opacity: p2 }} />
            <circle cx="24" cy="122" r="1.6" stroke={INK} strokeWidth="0.9" fill="#FFF"
              style={{ opacity: p2 }} />
            <circle cx="24" cy="82"  r="1.6" stroke={INK} strokeWidth="0.9" fill="#FFF"
              style={{ opacity: p2 }} />
          </g>

          {/* Housing body */}
          <path d="M30 38 L118 38 L118 60 L128 60 L128 50
                   L132 50 L132 40
                   M30 126 L118 126 L118 104 L128 104 L128 114
                   L132 114 L132 124"
            stroke={INK} strokeWidth="1.5" strokeLinejoin="round" fill="none"
            style={draw(p2, 320)} />

          {/* Inside bore walls (dashed hidden lines) */}
          <path d="M30 58 L100 58 M30 106 L100 106"
            stroke={INK} strokeWidth="0.9"
            strokeDasharray="3 2"
            style={{ strokeDasharray: "3 2",
              strokeDashoffset: (1 - p2) * 70, opacity: p2 * 0.65 }} />

          {/* Hatch fill on the housing wall (upper and lower "solid" strips) */}
          <g opacity={p3}>
            <path d="M30 38 L118 38 L118 58 L30 58 Z" fill="url(#hatch-solid)" />
            <path d="M30 106 L118 106 L118 126 L30 126 Z" fill="url(#hatch-solid)" />
          </g>

          {/* ───── Bearing stack ───── */}
          <g opacity={p4}>
            {/* Bearing housing block */}
            <rect x="96" y="58" width="22" height="48"
              stroke={INK} strokeWidth="1.2" fill="#FFF"
              style={draw(p4, 140)} />
            {/* Two rolling elements (balls) top */}
            <circle cx="107" cy="68" r="3.4" stroke={INK} strokeWidth="1" fill="#FFF" />
            <circle cx="107" cy="68" r="1.2" stroke={INK} strokeWidth="0.7" fill={INK} />
            {/* Two rolling elements (balls) bottom */}
            <circle cx="107" cy="96" r="3.4" stroke={INK} strokeWidth="1" fill="#FFF" />
            <circle cx="107" cy="96" r="1.2" stroke={INK} strokeWidth="0.7" fill={INK} />
            {/* Seal indicator — small cross-hatched strip */}
            <rect x="118" y="74" width="4" height="16"
              stroke={INK} strokeWidth="0.9" fill="url(#hatch-key)" />
          </g>

          {/* ───── Shaft ───── */}
          <g opacity={p5}>
            {/* Shaft body (top edge + bottom edge drawn as two lines) */}
            <line x1="122" y1="78" x2="224" y2="78"
              stroke={INK} strokeWidth="1.5"
              style={draw(p5, 102)} />
            <line x1="122" y1="86" x2="224" y2="86"
              stroke={INK} strokeWidth="1.5"
              style={draw(p5, 102)} />
            {/* Shaft end cap */}
            <line x1="224" y1="78" x2="224" y2="86"
              stroke={INK} strokeWidth="1.5"
              style={draw(p5, 8)} />
            {/* Shaft section hatching (behind the impeller, showing cut) */}
            <rect x="146" y="78" width="22" height="8"
              fill="url(#hatch-key)" opacity={p5 * 0.7} />
            {/* Keyway notch on top of shaft */}
            <path d="M150 78 L150 74 L160 74 L160 78"
              stroke={INK} strokeWidth="1.2" fill="#FFF"
              style={draw(p5, 22)} />
            {/* Keyway inside hatching */}
            <rect x="150" y="74" width="10" height="4"
              fill="url(#hatch-key)" opacity={p5 * 0.55} />
          </g>

          {/* ───── Impeller (centrifugal, side-section view) ───── */}
          <g opacity={p6}>
            {/* Back shroud (right disc) */}
            <path d="M208 50 L208 114"
              stroke={INK} strokeWidth="1.6"
              style={draw(p6, 64)} />
            <path d="M208 50 Q198 46 188 50"
              stroke={INK} strokeWidth="1.5" fill="none"
              style={draw(p6, 24)} />
            <path d="M208 114 Q198 118 188 114"
              stroke={INK} strokeWidth="1.5" fill="none"
              style={draw(p6, 24)} />
            {/* Front shroud (left curved wall — the volute inlet side) */}
            <path d="M188 50 Q176 66 174 82 Q176 98 188 114"
              stroke={INK} strokeWidth="1.6" fill="none"
              style={draw(p6, 70)} />
            {/* Inlet eye opening at top-left */}
            <path d="M180 50 L188 50 M180 114 L188 114"
              stroke={INK} strokeWidth="1.4"
              style={draw(p6, 16)} />
            {/* Blades (4 curved cross-section lines inside impeller) */}
            <path d="M180 58 Q192 66 204 60"
              stroke={INK} strokeWidth="1.1" fill="none"
              style={draw(p6, 28)} />
            <path d="M180 70 Q192 76 204 74"
              stroke={INK} strokeWidth="1.1" fill="none"
              style={draw(p6, 26)} />
            <path d="M180 94 Q192 92 204 90"
              stroke={INK} strokeWidth="1.1" fill="none"
              style={draw(p6, 26)} />
            <path d="M180 106 Q192 98 204 104"
              stroke={INK} strokeWidth="1.1" fill="none"
              style={draw(p6, 28)} />
            {/* Impeller hub (connection to shaft) */}
            <rect x="196" y="78" width="12" height="8"
              stroke={INK} strokeWidth="1.2" fill="#FFF"
              style={draw(p6, 40)} />
            {/* Hub centerline mark */}
            <line x1="202" y1="76" x2="202" y2="88"
              stroke={INK} strokeWidth="0.6"
              strokeDasharray="1.5 1"
              style={{ opacity: p6 }} />
          </g>

          {/* ───── Locking ring / nut ───── */}
          <g opacity={p7}>
            <rect x="216" y="72" width="8" height="20"
              stroke={ACCENT_DARK} strokeWidth="1.4"
              fill={ACCENT} fillOpacity="0.14"
              style={draw(p7, 56)} />
            {/* Ring knurl ticks */}
            <line x1="216" y1="76" x2="224" y2="76"
              stroke={ACCENT_DARK} strokeWidth="0.8" />
            <line x1="216" y1="80" x2="224" y2="80"
              stroke={ACCENT_DARK} strokeWidth="0.8" />
            <line x1="216" y1="84" x2="224" y2="84"
              stroke={ACCENT_DARK} strokeWidth="0.8" />
            <line x1="216" y1="88" x2="224" y2="88"
              stroke={ACCENT_DARK} strokeWidth="0.8" />
          </g>

          {/* ───── Slide-off dimension arrow ───── */}
          <g opacity={p8}>
            {/* Dimension extension lines */}
            <line x1="208" y1="136" x2="208" y2="120"
              stroke={ACCENT} strokeWidth="0.8"
              strokeDasharray="2 1.5"
              style={{ opacity: p8 }} />
            <line x1="286" y1="136" x2="286" y2="120"
              stroke={ACCENT} strokeWidth="0.8"
              strokeDasharray="2 1.5"
              style={{ opacity: p8 }} />
            {/* Main dimension arrow */}
            <line x1="210" y1="140" x2="284" y2="140"
              stroke={ACCENT} strokeWidth="1.6"
              markerEnd="url(#arrow-accent)"
              style={draw(p8, 74)} />
            {/* Dimension text */}
            <text x="247" y="152" fontSize="8" fontWeight="800" fill={ACCENT_DARK}
              textAnchor="middle" fontFamily="inherit"
              style={{ opacity: p8 }}>
              ← SLIDE OFF →
            </text>
          </g>

          {/* ───── Callouts (numbered circles with leader lines) ───── */}
          <g opacity={p9}>
            {/* 1 — Housing */}
            <line x1="60" y1="20" x2="60" y2="37" stroke={INK} strokeWidth="0.6" />
            <circle cx="60" cy="14" r="6.5" stroke={INK} strokeWidth="1" fill="#FFF" />
            <text x="60" y="17" fontSize="7.5" fontWeight="800" fill={INK}
              textAnchor="middle" fontFamily="inherit">1</text>

            {/* 2 — Bearing */}
            <line x1="107" y1="52" x2="107" y2="58" stroke={INK} strokeWidth="0.6" />
            <circle cx="107" cy="46" r="6.5" stroke={INK} strokeWidth="1" fill="#FFF" />
            <text x="107" y="49" fontSize="7.5" fontWeight="800" fill={INK}
              textAnchor="middle" fontFamily="inherit">2</text>

            {/* 3 — Keyway */}
            <line x1="155" y1="68" x2="155" y2="74" stroke={INK} strokeWidth="0.6" />
            <circle cx="155" cy="62" r="6.5" stroke={INK} strokeWidth="1" fill="#FFF" />
            <text x="155" y="65" fontSize="7.5" fontWeight="800" fill={INK}
              textAnchor="middle" fontFamily="inherit">3</text>

            {/* 4 — Impeller */}
            <line x1="190" y1="125" x2="190" y2="114" stroke={INK} strokeWidth="0.6" />
            <circle cx="190" cy="131" r="6.5" stroke={INK} strokeWidth="1" fill="#FFF" />
            <text x="190" y="134" fontSize="7.5" fontWeight="800" fill={INK}
              textAnchor="middle" fontFamily="inherit">4</text>

            {/* 5 — Locking ring */}
            <line x1="220" y1="62" x2="220" y2="72" stroke={ACCENT_DARK} strokeWidth="0.6" />
            <circle cx="220" cy="56" r="6.5" stroke={ACCENT_DARK} strokeWidth="1"
              fill={ACCENT} fillOpacity="0.14" />
            <text x="220" y="59" fontSize="7.5" fontWeight="800" fill={ACCENT_DARK}
              textAnchor="middle" fontFamily="inherit">5</text>
          </g>
        </svg>

        {/* ───── Legend strip ───── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 10, rowGap: 3,
          fontSize: 9, fontWeight: 700, color: INK,
          letterSpacing: "-0.005em",
          marginTop: 6,
          opacity: p9,
        }}>
          <LegendRow n="1" label="Housing"     color={INK} />
          <LegendRow n="2" label="Bearing"     color={INK} />
          <LegendRow n="3" label="Keyway"      color={INK} />
          <LegendRow n="4" label="Impeller"    color={INK} />
          <LegendRow n="5" label="Locking Ring" color={ACCENT_DARK} />
          <LegendRow n="→" label="Slide Off"   color={ACCENT_DARK} />
        </div>
      </div>
    </div>
  );
};

const LegendRow: React.FC<{ n: string; label: string; color: string }> = ({
  n, label, color,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 11, height: 11, borderRadius: n === "→" ? 3 : "50%",
      border: `1px solid ${color}`,
      color, fontSize: 7, fontWeight: 900,
      background: n === "5" ? `${ACCENT}14` : "transparent",
    }}>{n}</span>
    <span style={{ color: MUTED, fontWeight: 500 }}>{label}</span>
  </div>
);

// ─── Small tool card (Notes / Foto) ───────────────────────────────────────
const PhoneToolCard: React.FC<{ icon: "notes" | "foto"; title: string; sub: string }> = ({
  icon, title, sub,
}) => (
  <div style={{
    flex: 1,
    background: "#FFFFFF",
    borderRadius: 14,
    padding: "12px 12px 14px",
    boxShadow: "0 8px 20px -10px rgba(15,15,18,0.1), 0 1px 3px rgba(15,15,18,0.05)",
    display: "flex", flexDirection: "column", gap: 8,
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "rgba(15,15,18,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {icon === "notes" ? (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M9 1.5l2.5 2.5L5 10.5l-3 .5.5-3L9 1.5z"
            stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1.5" y="3.5" width="10" height="7.5" rx="1.5"
            stroke={INK} strokeWidth="1.3" />
          <circle cx="6.5" cy="7.25" r="2" stroke={INK} strokeWidth="1.3" />
          <path d="M4.5 3.5l1-1.2h2l1 1.2" stroke={INK} strokeWidth="1.3"
            strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <div style={{
      fontSize: 13, fontWeight: 800, color: INK, letterSpacing: "-0.01em",
    }}>
      {title}
    </div>
    <div style={{
      fontSize: 10.5, color: MUTED, fontWeight: 500,
      marginTop: -4,
    }}>
      {sub}
    </div>
  </div>
);


// ═══════════════════════════════════════════════════════════════════════════
//   BEAT F — 4 shots: CROSSING ZOOM → CA FLASH → WORK ORDER → DETAILS
// ═══════════════════════════════════════════════════════════════════════════
const BeatF: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - B.F.start;
  // CA flash window within the beat (during F2)
  const caAt = 30;
  const caF = f - caAt;
  const caActive = caF >= 0 && caF < 18;
  const caOffset = caActive ? Math.sin((caF / 18) * Math.PI) * 9 : 0;
  const flashOp  = caActive ? Math.sin((caF / 18) * Math.PI) * 0.28 : 0;

  return (
    <AbsoluteFill>
      <GlassBackground frame={frame} tint="cool" />

      {/* ─── Shot F1 — CROSSING ZOOM ─── */}
      <Shot f={f} start={0} end={33} enter="zoom" exit="blur" fadeIn={10} fadeOut={10}>
        <Glass tint="default" style={{ width: 1480, padding: "36px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <PulseDot t={f} size={14} />
            <div style={{ fontSize: 15, fontWeight: 800, color: CRITICAL_DARK, letterSpacing: "0.18em" }}>
              CROSSING CRITICAL · DAY 4 · 08:42
            </div>
            <div style={{ flex: 1 }} />
            <Chip text="P-204 · bearing seal" color={MUTED} tint="rgba(15,15,18,0.05)" />
          </div>
          <div style={{ height: 500, transform: `translateX(${-caOffset * 0.3}px)` }}>
            <ForecastChartMini chartT={1} highlightCross caSplit={caOffset} zoomCross={clamp((f - 12) / 18, 0, 1)} />
          </div>
        </Glass>
      </Shot>

      {/* ─── Shot F2 — FLASH + "AUTO-GENERATED" ─── */}
      <Shot f={f} start={28} end={55} enter="zoom" exit="flipOut" fadeIn={8} fadeOut={10}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 16,
            padding: "16px 28px", borderRadius: 999,
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE} 100%)`,
            boxShadow: `0 20px 60px -12px ${ACCENT}88, 0 0 80px ${ACCENT}44`,
            color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "0.14em",
          }}>
            <span style={{ fontSize: 26 }}>✦</span>
            AUTO-GENERATED BY ARIA
          </div>
          <div style={{ marginTop: 28, maxWidth: 1400, display: "flex", justifyContent: "center" }}>
            <UnderlineTitle
              text="From forecast to action"
              highlight={["forecast", "action"]}
              size={72}
              appearT={clamp((f - 30) / 18, 0, 1)}
              underlineT={clamp((f - 42) / 14, 0, 1)}
            />
          </div>
          <div style={{ fontSize: 24, color: MUTED, fontWeight: 500, marginTop: 14 }}>
            The platform creates the Work Order · automatically.
          </div>
        </div>
      </Shot>

      {/* ─── Shot F3 — WORK ORDER HERO ─── */}
      <Shot f={f} start={50} end={91} enter="flipIn" exit="blur" fadeIn={14} fadeOut={12}>
        <Glass tint="accent" style={{ width: 1480, padding: "44px 56px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: ACCENT_DARK, letterSpacing: "0.18em" }}>
                WORK ORDER · WO-2847
              </div>
              <div style={{ fontSize: 56, fontWeight: 700, color: INK, letterSpacing: "-0.03em",
                lineHeight: 1.05, marginTop: 6 }}>
                Replace bearing seal · <span style={{ fontFamily: SERIF, fontStyle: "italic", color: ACCENT_DARK }}>P-204</span>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{
              padding: "10px 16px", borderRadius: 12,
              background: "rgba(229,57,53,0.14)", border: `1px solid ${CRITICAL}55`,
              color: CRITICAL_DARK, fontSize: 16, fontWeight: 800, letterSpacing: "0.12em",
            }}>CRITICAL</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 18 }}>
            <WoBadge label="TYPE"     value="Preventive"    color={ACCENT_DARK} />
            <WoBadge label="DUE"      value="Day 3 · 08:00" color={INK} />
            <WoBadge label="DURATION" value="3h 45m"        color={INK} />
            <WoBadge label="ASSIGNEE" value="Mario R."      color={INK} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 26 }}>
            {/* Checklist */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.18em", marginBottom: 10 }}>
                CHECKLIST · 5 STEPS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Order replacement · BRG-6208-2RS",
                  "Reserve 2h maintenance window",
                  "LOTO · open housing · replace bearing",
                  "Re-grease · verify alignment",
                  "Restart · log new baseline",
                ].map((t, i) => {
                  const stepT = clamp((f - (58 + i * 4)) / 14, 0, 1);
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12, fontSize: 16,
                      opacity: stepT, transform: `translateX(${(1 - stepT) * -8}px)`,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: `1.5px solid ${MUTED}`,
                        color: MUTED, fontSize: 12, fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>{i + 1}</div>
                      <span style={{ color: INK_SOFT, fontWeight: 500 }}>{t}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parts + agent row */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.18em" }}>
                PARTS · INVENTORY AGENT
              </div>
              <div style={{
                padding: "16px 18px", borderRadius: 16,
                background: "rgba(245,158,11,0.12)",
                border: `1px solid ${WARNING}44`,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <AgentAvatar agent="inventory" size={44} />
                <div style={{ flex: 1, lineHeight: 1.3 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>
                    BRG-6208-2RS
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>
                    bearing seal · warehouse A
                  </div>
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: SUCCESS_DARK,
                  background: "rgba(16,185,129,0.14)", border: `1px solid ${SUCCESS}44`,
                  padding: "8px 14px", borderRadius: 10, letterSpacing: "0.08em",
                }}>3 IN STOCK · RESERVED</div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <div style={{
                  flex: 1, padding: "14px 18px", borderRadius: 14,
                  background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                  color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: "0.04em",
                  textAlign: "center",
                  boxShadow: "0 12px 28px -10px rgba(74,109,245,0.6)",
                }}>APPROVE &amp; SCHEDULE</div>
                <div style={{
                  padding: "14px 22px", borderRadius: 14,
                  background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.6)",
                  fontSize: 15, fontWeight: 700, color: INK_SOFT, textAlign: "center",
                }}>Review</div>
              </div>
            </div>
          </div>
        </Glass>
      </Shot>

      {/* ─── Shot F4 — "From alert to WO in 12 seconds" ─── */}
      <Shot f={f} start={85} end={110} enter="rise" exit="blur" fadeIn={10} fadeOut={8}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: ACCENT_DARK, letterSpacing: "0.22em" }}>
            AUTOMATION
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
            <UnderlineTitle
              text="Alert → WO in 12 seconds"
              highlight={["Alert", "seconds"]}
              size={96}
              appearT={clamp((f - 86) / 18, 0, 1)}
              underlineT={clamp((f - 98) / 14, 0, 1)}
            />
          </div>
          <div style={{ fontSize: 22, color: MUTED, fontWeight: 500, marginTop: 14 }}>
            no manual routing · no lost tickets · no guesswork
          </div>
        </div>
      </Shot>

      {/* CA overlays */}
      {caActive && (
        <AbsoluteFill style={{
          pointerEvents: "none",
          background: `linear-gradient(90deg, rgba(229,57,53,${0.12 + flashOp}) 0%, transparent 10%, transparent 90%, rgba(74,109,245,${0.12 + flashOp}) 100%)`,
          mixBlendMode: "screen",
        }} />
      )}
      {flashOp > 0 && (
        <AbsoluteFill style={{ background: "white", opacity: flashOp, pointerEvents: "none" }} />
      )}
    </AbsoluteFill>
  );
};

const WoBadge: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    padding: "14px 18px", borderRadius: 14,
    background: `${color}12`, border: `1px solid ${color}28`,
  }}>
    <div style={{ fontSize: 11, fontWeight: 800, color: LABEL, letterSpacing: "0.16em", marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 18, fontWeight: 800, color, letterSpacing: "-0.01em" }}>{value}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//   BEAT H — 5 shots: TITLE → 4 AGENT HEROES → PULL-BACK RESOLVED
// ═══════════════════════════════════════════════════════════════════════════
const BeatH: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - B.H.start;

  return (
    <AbsoluteFill>
      <GlassBackground frame={frame} tint="success" />

      {/* ─── Shot H1 — TITLE ─── */}
      <Shot f={f} start={0} end={24} enter="rise" exit="slideUp" fadeIn={10} fadeOut={10}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: SUCCESS_DARK, letterSpacing: "0.22em" }}>
            AGENT ORCHESTRATION
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
            <UnderlineTitle
              text="Four agents. One response."
              highlight={["agents.", "response."]}
              size={96}
              appearT={clamp((f - 2) / 18, 0, 1)}
              underlineT={clamp((f - 14) / 14, 0, 1)}
            />
          </div>
          <div style={{ fontSize: 22, color: MUTED, fontWeight: 500, marginTop: 14 }}>
            P-204 · auto-coordinated in 12 seconds
          </div>
        </div>
      </Shot>

      {/* ─── Shot H2 — FORECASTING AGENT HERO ─── */}
      <Shot f={f} start={19} end={43} enter="flipIn" exit="flipOut" fadeIn={10} fadeOut={10}>
        <AgentHeroCard agent="forecasting" step="1 · DETECT"
          action={<>Predicts failure in <b style={{ color: CRITICAL_DARK }}>~4 days</b></>}
          detail={<>3.2σ vibration anomaly · bearing seal · confidence <b>92%</b></>}
          f={f} start={19} />
      </Shot>

      {/* ─── Shot H3 — INVENTORY AGENT HERO ─── */}
      <Shot f={f} start={38} end={62} enter="flipIn" exit="flipOut" fadeIn={10} fadeOut={10}>
        <AgentHeroCard agent="inventory" step="2 · VERIFY PARTS"
          action={<>Reserves <b>BRG-6208-2RS</b> automatically</>}
          detail={<>3 in stock · warehouse A · <b style={{ color: SUCCESS_DARK }}>reserved for WO-2847</b></>}
          f={f} start={38} />
      </Shot>

      {/* ─── Shot H4 — SCHEDULING AGENT HERO ─── */}
      <Shot f={f} start={57} end={81} enter="flipIn" exit="flipOut" fadeIn={10} fadeOut={10}>
        <AgentHeroCard agent="scheduling" step="3 · SCHEDULE"
          action={<>Books <b>2h window</b> · day 3 · 08:00</>}
          detail={<>no line conflicts · Mario R. <b style={{ color: SUCCESS_DARK }}>notified &amp; accepted</b></>}
          f={f} start={57} />
      </Shot>

      {/* ─── Shot H5 — MAINTENANCE AGENT HERO ─── */}
      <Shot f={f} start={76} end={97} enter="flipIn" exit="blur" fadeIn={10} fadeOut={8}>
        <AgentHeroCard agent="maintenance" step="4 · EXECUTE"
          action={<>Dispatches <b>5-step checklist</b> to mobile</>}
          detail={<>LOTO · replace bearing · re-grease · verify alignment · log baseline</>}
          f={f} start={76} />
      </Shot>

      {/* ─── Shot H6 — RESOLVED (pull-back reveals all agents) ─── */}
      <Shot f={f} start={92} end={115} enter="zoom" exit="blur" fadeIn={12} fadeOut={10}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          {/* Row of mini agent badges */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {(["forecasting","inventory","scheduling","maintenance"] as AgentKey[]).map((k, i) => {
              const t = clamp((f - (94 + i * 3)) / 10, 0, 1);
              return (
                <React.Fragment key={k}>
                  <div style={{
                    opacity: t,
                    transform: `scale(${0.8 + 0.2 * t})`,
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 14px 8px 8px", borderRadius: 999,
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow: `0 8px 24px -8px ${AGENTS[k].color}66`,
                  }}>
                    <AgentAvatar agent={k} size={30} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>
                      {AGENTS[k].name.replace(" Agent", "")}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: SUCCESS_DARK }}>✓</span>
                  </div>
                  {i < 3 && (
                    <div style={{
                      opacity: t, fontSize: 20, color: ACCENT, fontWeight: 800,
                    }}>→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Resolved hero card */}
          <Glass tint="success" style={{
            padding: "36px 56px",
            display: "flex", alignItems: "center", gap: 36,
          }}>
            <div style={{
              width: 78, height: 78, borderRadius: "50%",
              background: `linear-gradient(135deg, ${SUCCESS} 0%, ${SUCCESS_DARK} 100%)`,
              color: "#fff", fontSize: 40, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 36px ${SUCCESS}88`,
            }}>✓</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: SUCCESS_DARK, letterSpacing: "0.18em" }}>
                RESOLVED · ORCHESTRATED
              </div>
              <div style={{ fontSize: 48, fontWeight: 700, color: INK, letterSpacing: "-0.02em",
                marginTop: 4, lineHeight: 1.05 }}>
                Downtime <span style={{ fontFamily: SERIF, fontStyle: "italic", color: SUCCESS_DARK }}>avoided</span>
              </div>
            </div>
            <div style={{ width: 1, height: 90, background: "rgba(15,15,18,0.1)" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: LABEL, letterSpacing: "0.16em" }}>SAVINGS</div>
              <div style={{ fontSize: 64, fontWeight: 700, color: SUCCESS_DARK,
                letterSpacing: "-0.03em", lineHeight: 1, marginTop: 4 }}>€ 4,200</div>
            </div>
          </Glass>
        </div>
      </Shot>
    </AbsoluteFill>
  );
};

// Agent hero card (used in H2-H5)
const AgentHeroCard: React.FC<{
  agent: AgentKey; step: string; action: React.ReactNode; detail: React.ReactNode;
  f: number; start: number;
}> = ({ agent, step, action, detail, f, start }) => {
  const a = AGENTS[agent];
  const checkT = clamp((f - (start + 14)) / 10, 0, 1);
  return (
    <Glass tint="default" style={{ width: 1360, padding: "48px 56px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 18 }}>
        <AgentAvatar agent={agent} size={108} pulse pulseT={f} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: a.colorDark, letterSpacing: "0.22em" }}>
            STEP {step}
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: INK, letterSpacing: "-0.02em",
            lineHeight: 1.1, marginTop: 4 }}>
            {a.name}
          </div>
        </div>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: checkT > 0.5 ? a.color : "transparent",
          border: `2.5px solid ${checkT > 0.5 ? a.color : MUTED}`,
          color: "#fff", fontSize: 30, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
          opacity: checkT,
          transform: `scale(${0.8 + 0.2 * checkT})`,
          boxShadow: checkT > 0.5 ? `0 0 20px ${a.color}88` : undefined,
        }}>{checkT > 0.5 ? "✓" : ""}</div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 700, color: INK, letterSpacing: "-0.02em",
        lineHeight: 1.2, marginTop: 12 }}>
        {action}
      </div>
      <div style={{ fontSize: 20, color: MUTED, fontWeight: 500, marginTop: 14, lineHeight: 1.4 }}>
        {detail}
      </div>
    </Glass>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   SHARED — Small visual primitives
// ═══════════════════════════════════════════════════════════════════════════
const PulseDot: React.FC<{ t: number; size?: number }> = ({ t, size = 14 }) => {
  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.28));
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: CRITICAL,
      boxShadow: `0 0 0 ${4 + pulse * 4}px ${CRITICAL}22, 0 0 ${12 + pulse * 10}px ${CRITICAL_GLOW}`,
      flexShrink: 0,
    }} />
  );
};

const TypingPulse: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    {[0, 1, 2].map((i) => {
      const phase = (t * 0.22 + i * 0.6) % (Math.PI * 2);
      const op = 0.4 + 0.6 * Math.max(0, Math.sin(phase));
      const y = Math.sin(phase) * 3;
      return (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: ACCENT,
          opacity: op, transform: `translateY(${y}px)`,
          boxShadow: `0 0 8px ${ACCENT}88`,
        }} />
      );
    })}
  </div>
);

const LegendItem: React.FC<{ color: string; text: string; dashed?: boolean }> = ({
  color, text, dashed,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{
      width: 22, height: 2,
      background: dashed ? "transparent" : color,
      borderTop: dashed ? `2px dashed ${color}` : undefined,
    }} />
    <span>{text}</span>
  </div>
);

const BigWaveform: React.FC<{ t: number; active?: boolean }> = ({ t, active }) => {
  const w = 800, h = 90;
  const pts: string[] = [];
  for (let x = 0; x <= w; x += 4) {
    const y = h / 2
      + Math.sin(x * 0.04 + t * 0.3) * 14
      + Math.sin(x * 0.12 + t * 0.14) * 7
      - Math.exp(-Math.pow((x - w * 0.62) / 30, 2)) * 28;
    pts.push(`${pts.length === 0 ? "M" : "L"}${x},${y.toFixed(1)}`);
  }
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={pts.join(" ")} fill="none"
        stroke={active ? CRITICAL : INK}
        strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: active ? "drop-shadow(0 0 8px rgba(229,57,53,0.6))" : undefined }}
      />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//   SHARED — Forecast chart
// ═══════════════════════════════════════════════════════════════════════════
const MINI = { w: 1320, h: 460, padL: 64, padR: 32, padT: 32, padB: 44 };
const mYH = (h: number) =>
  MINI.padT + (1 - h / 100) * (MINI.h - MINI.padT - MINI.padB);

const M_TODAY = 870;
const M_CROSS = 1200;
const M_CRIT  = 20;
const M_HIST_XS = [60, 180, 300, 420, 540, 660, 780, 870];
const M_HIST_HS = [92, 88, 82, 75, 68, 58, 48, 30];
const M_HIST_POLY = M_HIST_XS.map((x, i) => `${x},${mYH(M_HIST_HS[i]).toFixed(1)}`).join(" ");
const M_FORE_POLY =
  `${M_TODAY},${mYH(30).toFixed(1)} ${M_CROSS},${mYH(M_CRIT).toFixed(1)} ${MINI.w - MINI.padR},${mYH(0).toFixed(1)}`;
const polyLen = (pts: string): number => {
  const c = pts.split(" ").map((p) => p.split(",").map(Number));
  let len = 0;
  for (let i = 1; i < c.length; i++) {
    const dx = c[i][0] - c[i - 1][0]; const dy = c[i][1] - c[i - 1][1];
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
};
const M_HIST_LEN = polyLen(M_HIST_POLY);

type MiniProps = {
  chartT: number;
  highlightCross?: boolean;
  caSplit?: number;
  zoomCross?: number; // 0..1 — optional zoom toward crossing
};
const ForecastChartMini: React.FC<MiniProps> = ({ chartT, highlightCross, caSplit = 0, zoomCross = 0 }) => {
  const histOffset = M_HIST_LEN * (1 - chartT);
  const foreClip   = Math.max(0, Math.min(1, chartT * 1.6 - 0.6));
  const critOp     = Math.max(0, Math.min(1, chartT * 1.8 - 0.8));

  // Zoom toward crossing
  const ze = zoomCross < 0.5 ? 2 * zoomCross * zoomCross : 1 - Math.pow(-2 * zoomCross + 2, 3) / 2;
  const zscale = 1 + ze * 0.35;
  const zcx = 50 + ze * 22;   // shift view origin toward crossing
  const zcy = 50 + ze * 12;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${MINI.w} ${MINI.h}`}
      preserveAspectRatio="none" style={{ display: "block" }}>
      <g style={{ transformOrigin: `${zcx}% ${zcy}%`, transform: `scale(${zscale})` }}>
        {[0, 25, 50, 75, 100].map((h) => (
          <line key={h} x1={MINI.padL} y1={mYH(h)} x2={MINI.w - MINI.padR} y2={mYH(h)}
            stroke="rgba(15,15,18,0.05)" strokeWidth={1} />
        ))}
        {[0, 50, 100].map((h) => (
          <text key={h} x={MINI.padL - 10} y={mYH(h) + 5}
            fontSize="13" fill={LABEL} textAnchor="end" fontWeight={700}>
            {h}%
          </text>
        ))}
        <line x1={M_TODAY} y1={MINI.padT} x2={M_TODAY} y2={MINI.h - MINI.padB}
          stroke="rgba(15,15,18,0.22)" strokeWidth={1} strokeDasharray="4 4" />
        <text x={M_TODAY} y={MINI.h - MINI.padB + 26}
          fontSize="13" fill={MUTED} textAnchor="middle" fontWeight={800} letterSpacing="0.1em">
          TODAY
        </text>
        <line x1={MINI.padL} y1={mYH(M_CRIT)} x2={MINI.w - MINI.padR} y2={mYH(M_CRIT)}
          stroke={CRITICAL} strokeWidth={1.4} strokeDasharray="6 6" opacity={critOp * 0.55} />
        <text x={MINI.padL + 8} y={mYH(M_CRIT) - 7}
          fontSize="12" fill={CRITICAL} fontWeight={800} letterSpacing="0.12em" opacity={critOp}>
          CRITICAL · 20%
        </text>
        {caSplit !== 0 && (
          <>
            <polyline points={M_HIST_POLY} fill="none" stroke="#E53935" strokeWidth={2.8}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={M_HIST_LEN} strokeDashoffset={histOffset}
              transform={`translate(${caSplit},0)`} opacity={0.6} />
            <polyline points={M_HIST_POLY} fill="none" stroke="#4A6DF5" strokeWidth={2.8}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={M_HIST_LEN} strokeDashoffset={histOffset}
              transform={`translate(${-caSplit},0)`} opacity={0.6} />
          </>
        )}
        <polyline points={M_HIST_POLY} fill="none" stroke={INK} strokeWidth={2.8}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={M_HIST_LEN} strokeDashoffset={histOffset} />
        <polyline points={M_FORE_POLY} fill="none" stroke={CRITICAL} strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 6"
          style={{
            clipPath: `polygon(0 0, ${(foreClip * 100).toFixed(1)}% 0, ${(foreClip * 100).toFixed(1)}% 100%, 0 100%)`,
          }} />
        {foreClip > 0.7 && (
          <>
            {highlightCross && (
              <circle cx={M_CROSS} cy={mYH(M_CRIT)} r={20 + ze * 10}
                fill="none" stroke={CRITICAL} strokeWidth={2} opacity={0.55} />
            )}
            <circle cx={M_CROSS} cy={mYH(M_CRIT)} r={8 + ze * 2} fill={CRITICAL}
              style={{ filter: `drop-shadow(0 0 16px ${CRITICAL_GLOW})` }} />
          </>
        )}
      </g>
    </svg>
  );
};
