import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

// ─── Timing: 3 moments × ~80f each, total 240f = 8s ─────────────────────────
// M1: 0   – 82f
// M2: 76  – 158f
// M3: 152 – 240f

const MOMENTS = [
  {
    headline:  "High inefficiency.",
    body:      "Built into every process,\nevery day.",
    start: 0,
  },
  {
    headline:  "Your expertise.",
    body:      "The only thing\nkeeping it together.",
    start: 76,
  },
  {
    headline:  "Field execution?",
    body:      "Still taking hours.",
    start: 152,
  },
];

// ─── Single moment ────────────────────────────────────────────────────────────
const Moment: React.FC<{
  headline: string;
  body: string;
  startFrame: number;
  isLast: boolean;
}> = ({ headline, body, startFrame, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inT = spring({
    frame: frame - startFrame,
    fps,
    config: { stiffness: 240, damping: 26, mass: 0.7 },
  });

  // Fade out into next moment (except last, which fades with the scene)
  const outStart = startFrame + 62;
  const outEnd   = startFrame + 76;
  const fadeOut  = isLast
    ? 1
    : interpolate(frame, [outStart, outEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const opacity    = Math.min(interpolate(inT, [0, 1], [0, 1]), fadeOut);
  const translateY = interpolate(inT, [0, 1], [36, 0]);

  // Subline appears slightly after headline
  const bodyT = spring({
    frame: frame - (startFrame + 14),
    fps,
    config: { stiffness: 220, damping: 28, mass: 0.6 },
  });
  const bodyOp = interpolate(bodyT, [0, 1], [0, 1]);
  const bodyTY = interpolate(bodyT, [0, 1], [16, 0]);

  if (frame < startFrame - 4) return null;

  return (
    <AbsoluteFill
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        opacity,
        transform:      `translateY(${translateY}px)`,
        pointerEvents:  "none",
        padding:        "0 140px",
      }}
    >
      {/* Headline — big, black, tight */}
      <div style={{
        fontFamily:    interFont,
        fontSize:      108,
        fontWeight:    700,
        color:         "#1D1D1F",
        letterSpacing: "-0.045em",
        lineHeight:    1,
        textAlign:     "center",
      }}>
        {headline}
      </div>

      {/* Body — gray, smaller, below */}
      <div style={{
        marginTop:     24,
        fontFamily:    interFont,
        fontSize:      36,
        fontWeight:    400,
        color:         "#6B7280",
        letterSpacing: "-0.02em",
        lineHeight:    1.45,
        textAlign:     "center",
        whiteSpace:    "pre-line",
        opacity:       bodyOp,
        transform:     `translateY(${bodyTY}px)`,
      }}>
        {body}
      </div>
    </AbsoluteFill>
  );
};

// ─── Progress dots ────────────────────────────────────────────────────────────
const Dots: React.FC<{ frame: number }> = ({ frame }) => {
  const active = frame < 80 ? 0 : frame < 158 ? 1 : 2;
  return (
    <div style={{
      position: "absolute",
      bottom:   48,
      left: 0, right: 0,
      display:        "flex",
      justifyContent: "center",
      alignItems:     "center",
      gap:            10,
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width:           i === active ? 28 : 8,
          height:          8,
          borderRadius:    4,
          backgroundColor: i === active ? "#1D1D1F" : "#D1D5DB",
        }} />
      ))}
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3bCost: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(
    frame,
    [0, 10, 224, 240],
    [0, 1,   1,   0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F5F7", opacity: sceneOp }}>

      {MOMENTS.map((m, i) => (
        <Moment
          key={m.headline}
          headline={m.headline}
          body={m.body}
          startFrame={m.start}
          isLast={i === MOMENTS.length - 1}
        />
      ))}

      <Dots frame={frame} />
    </AbsoluteFill>
  );
};
