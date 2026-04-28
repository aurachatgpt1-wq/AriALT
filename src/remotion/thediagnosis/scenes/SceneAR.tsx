import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

export const SCENE_AR_DURATION = 180; // 6s @ 30fps

// ─── Palette ────────────────────────────────────────────────────────────────
const BG_WHITE  = "#FFFFFF";
const INK_DARK  = "#1D1D1F";

// ─── Timeline (30 fps) ──────────────────────────────────────────────────────
const T_2A_IN   = 6;    // "Simplifying tasks through" enters
const T_2A_OUT  = 26;   // exits, gone by ~42
const T_2B_IN   = 42;   // "Augmented reality" pops in
const T_2B_OUT  = 120;  // ~1.7s hold, then fade + slow rise

const WORD_STAGGER = 6;
const SCENE_FADE   = 16;

// ─── Phrases ────────────────────────────────────────────────────────────────
const BLOCK2A_WORDS = ["Simplifying", "tasks", "through"];

// ─── Lifecycle ──────────────────────────────────────────────────────────────
const lifecycleOpacity = (frame: number, enter: number, exit: number | null) => {
  const inS = interpolate(frame, [enter, enter + SCENE_FADE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (exit === null) return inS;
  const outS = interpolate(frame, [exit, exit + SCENE_FADE], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return inS * (1 - outS);
};

// ─── Per-word reveal ────────────────────────────────────────────────────────
const Word: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  color: string;
}> = ({ children, startFrame, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - startFrame,
    fps,
    config: { stiffness: 220, damping: 20, mass: 0.7 },
  });
  return (
    <span
      style={{
        display: "inline-block",
        color,
        fontWeight: 700,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)`,
      }}
    >
      {children}
    </span>
  );
};

// ─── Phrase renderer (single line) ──────────────────────────────────────────
const Phrase: React.FC<{
  words: string[];
  startFrame: number;
  defaultColor: string;
}> = ({ words, startFrame, defaultColor }) => (
  <span style={{ whiteSpace: "nowrap" }}>
    {words.map((w, i) => {
      const startF = startFrame + i * WORD_STAGGER;
      return (
        <React.Fragment key={i}>
          <Word startFrame={startF} color={defaultColor}>
            {w}
          </Word>
          {i < words.length - 1 && <span style={{ marginRight: 18 }} />}
        </React.Fragment>
      );
    })}
  </span>
);

// ─── Galaxy-fill text (animated nebula + twinkling stars clipped to text) ──
// Pseudo-random but deterministic star field — many tiny crisp pinpoints
const STARS = Array.from({ length: 90 }, (_, i) => {
  const x = (i * 73.13 + 11 + (i * i * 0.31)) % 100;
  const y = (i * 41.27 + i * i * 1.7 + 7) % 100;
  const phase = (i * 0.83) % (Math.PI * 2);
  const speed = 1.8 + ((i * 11) % 7) * 0.45;
  const core = 0.18 + ((i * 5) % 5) * 0.09; // 0.18..0.54% — small crisp stars
  return { x, y, phase, speed, core };
});

const GalaxyText: React.FC<{
  children: string;
  frame: number;
  brightness: number; // 0..1 — overall nebula intensity ramp (dark → vivid)
}> = ({ children, frame, brightness }) => {
  const t = frame / 30; // seconds
  // Lerp between dark RGB and vivid RGB based on brightness
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * brightness);
  const c = (dark: [number, number, number], bright: [number, number, number]) =>
    `${lerp(dark[0], bright[0])},${lerp(dark[1], bright[1])},${lerp(dark[2], bright[2])}`;
  // Alpha rises a bit as we brighten
  const a = (base: number) => Math.min(1, base * (0.6 + 0.5 * brightness));

  // Roving nebula blobs — six layers of varied colors
  const x1 = 50 + Math.cos(t * 0.7) * 35;
  const y1 = 50 + Math.sin(t * 0.6) * 30;
  const x2 = 50 + Math.cos(t * 0.5 + 2.1) * 40;
  const y2 = 50 + Math.sin(t * 0.9 + 1.3) * 35;
  const x3 = 50 + Math.cos(t * 1.1 + 4.2) * 30;
  const y3 = 50 + Math.sin(t * 0.4 + 3.0) * 28;
  const x4 = 50 + Math.cos(t * 0.3 + 5.5) * 45;
  const y4 = 50 + Math.sin(t * 0.8 + 2.7) * 25;
  const x5 = 50 + Math.cos(t * 0.6 + 1.0) * 38;
  const y5 = 50 + Math.sin(t * 0.5 + 4.6) * 32;
  const x6 = 50 + Math.cos(t * 0.9 + 3.3) * 42;
  const y6 = 50 + Math.sin(t * 0.7 + 0.7) * 30;

  // Twinkling star field — crisp pinpoints (solid core, sharp falloff)
  const starLayers = STARS.map((s) => {
    const sx = (s.x + Math.cos(t * 0.2 + s.phase) * 5) % 100;
    const sy = (s.y + Math.sin(t * 0.24 + s.phase) * 4) % 100;
    const twinkle = 0.85 + 0.15 * Math.max(0, Math.sin(t * s.speed + s.phase));
    const core = s.core;
    const edge = core * 1.4;
    return `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,${twinkle}) 0%, rgba(255,255,255,${twinkle}) ${core}%, rgba(255,255,255,0) ${edge}%)`;
  });

  const cMagenta = c([160, 40, 140], [255, 90, 200]);
  const cCyan    = c([30, 110, 170], [90, 210, 255]);
  const cViolet  = c([90, 50, 170],  [170, 80, 255]);
  const cBlue    = c([40, 60, 180],  [80, 110, 255]);
  const cPink    = c([190, 70, 120], [255, 120, 180]);
  const cTeal    = c([20, 140, 140], [80, 200, 220]);

  const galaxyBg = [
    ...starLayers,
    `radial-gradient(circle at ${x1}% ${y1}%, rgba(${cMagenta},${a(0.85)}) 0%, rgba(${cMagenta},0) 38%)`,
    `radial-gradient(circle at ${x2}% ${y2}%, rgba(${cCyan},${a(0.85)}) 0%, rgba(${cCyan},0) 42%)`,
    `radial-gradient(circle at ${x3}% ${y3}%, rgba(${cViolet},${a(0.9)}) 0%, rgba(${cViolet},0) 48%)`,
    `radial-gradient(circle at ${x4}% ${y4}%, rgba(${cBlue},${a(0.9)}) 0%, rgba(${cBlue},0) 52%)`,
    `radial-gradient(circle at ${x5}% ${y5}%, rgba(${cPink},${a(0.7)}) 0%, rgba(${cPink},0) 40%)`,
    `radial-gradient(circle at ${x6}% ${y6}%, rgba(${cTeal},${a(0.7)}) 0%, rgba(${cTeal},0) 45%)`,
    "linear-gradient(135deg, #050416 0%, #0d0828 50%, #02010a 100%)",
  ].join(", ");

  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        backgroundImage: galaxyBg,
        backgroundSize: "100% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────
export const SceneAR: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const b2a = lifecycleOpacity(frame, T_2A_IN, T_2A_OUT);

  // ── "Augmented reality" entrance — smooth, no bounce ───────────────────
  const popS = spring({
    frame: frame - T_2B_IN,
    fps,
    config: { stiffness: 100, damping: 28, mass: 1 }, // critically damped
  });
  const popOpacity = interpolate(popS, [0, 0.4], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const popScale = interpolate(popS, [0, 1], [0.7, 1]);

  // ── Slight zoom during the hold ─────────────────────────────────────────
  const holdZoom = interpolate(
    frame, [T_2B_IN + 16, T_2B_OUT], [1, 1.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Brightness ramp: starts dark, becomes slightly brighter ─────────────
  const brightness = interpolate(
    frame, [T_2B_IN, T_2B_OUT], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ── Exit upward + fade (slow, smooth) ───────────────────────────────────
  const exitS = spring({
    frame: frame - T_2B_OUT,
    fps,
    config: { stiffness: 50, damping: 30, mass: 1.6 },
  });
  const exitTranslateY = interpolate(exitS, [0, 1], [0, -1100]);
  const exitFade       = interpolate(exitS, [0.15, 1], [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const baseStyle: React.CSSProperties = {
    fontFamily: interFont,
    fontSize: 76,
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.0,
    textAlign: "center",
    padding: "0 60px",
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{ fontFamily: interFont, overflow: "hidden", background: BG_WHITE }}>

      {/* ── Block 2A — "Simplifying tasks through" ── */}
      <AbsoluteFill
        style={{
          opacity: b2a,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ ...baseStyle, color: INK_DARK }}>
          <Phrase
            words={BLOCK2A_WORDS}
            startFrame={T_2A_IN + 4}
            defaultColor={INK_DARK}
          />
        </div>
      </AbsoluteFill>

      {/* ── Block 2B — "Augmented reality" with galaxy fill, no underline ── */}
      <AbsoluteFill
        style={{
          opacity: popOpacity * exitFade,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            ...baseStyle,
            fontSize: 102,
            lineHeight: 1.25, // room for descenders (g, y) so they don't get clipped
            paddingBottom: 24,
            transform: `translateY(${exitTranslateY}px) scale(${popScale * holdZoom})`,
          }}
        >
          <GalaxyText frame={frame} brightness={brightness}>Augmented reality</GalaxyText>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
