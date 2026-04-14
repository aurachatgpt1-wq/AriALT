import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

// ─── Timing (270f = 9s) ───────────────────────────────────────────────────────
// Phase 1: "Okay, these tools are useful."  0  – 75f  (fade out 60–75)
// Phase 2: "But still:" + list              70 – 270f

const LIST_ITEMS = [
  "Fragmented.",
  "Complex.",
  "Time-consuming.",
  "Unaware.",
  "Not autonomous.",
];

const LIST_START = 88;       // first item spring starts
const LIST_STAGGER = 26;     // frames between each item

// ─── Phase 1 — statement ─────────────────────────────────────────────────────
const Phase1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inT = spring({ frame, fps, config: { stiffness: 260, damping: 26, mass: 0.7 } });
  const opacity = Math.min(
    interpolate(inT, [0, 1], [0, 1]),
    interpolate(frame, [58, 75], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const translateY = interpolate(inT, [0, 1], [30, 0]);

  // Sub-line
  const subT = spring({ frame: frame - 14, fps, config: { stiffness: 240, damping: 28, mass: 0.6 } });
  const subOp = Math.min(
    interpolate(subT, [0, 1], [0, 1]),
    interpolate(frame, [58, 75], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );

  if (frame > 76) return null;

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity, transform: `translateY(${translateY}px)`,
      pointerEvents: "none", padding: "0 140px",
    }}>
      <div style={{
        fontFamily: interFont, fontSize: 96, fontWeight: 700,
        color: "#1D1D1F", letterSpacing: "-0.04em",
        lineHeight: 1.05, textAlign: "center",
      }}>
        Okay, these tools<br />are useful.
      </div>
      <div style={{
        marginTop: 22,
        fontFamily: interFont, fontSize: 32, fontWeight: 400,
        color: "#6B7280", letterSpacing: "-0.015em",
        textAlign: "center", opacity: subOp,
        transform: `translateY(${interpolate(subT, [0, 1], [12, 0])}px)`,
      }}>
        We get it.
      </div>
    </AbsoluteFill>
  );
};

// ─── Phase 2 — "But still:" + list (Apple minimalist) ──────────────────────
const Phase2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [68, 82], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (frame < 66) return null;

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fadeIn, pointerEvents: "none",
    }}>
      {/* "But still" label — centered, understated */}
      <div style={{
        fontFamily: interFont, fontSize: 28, fontWeight: 400,
        color: "#86868B", letterSpacing: "0.02em",
        marginBottom: 48, textTransform: "uppercase" as const,
      }}>
        But still
      </div>

      {/* Items — large, bold, centered, no icons */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 6,
      }}>
        {LIST_ITEMS.map((item, i) => {
          const itemStart = LIST_START + i * LIST_STAGGER;
          const t = spring({
            frame: frame - itemStart,
            fps,
            config: { stiffness: 180, damping: 22, mass: 0.8 },
          });
          const op    = interpolate(t, [0, 1], [0, 1]);
          const scale = interpolate(t, [0, 1], [0.92, 1]);
          const ty    = interpolate(t, [0, 1], [24, 0]);

          if (frame < itemStart - 3) return null;

          return (
            <div key={item} style={{
              opacity: op,
              transform: `translateY(${ty}px) scale(${scale})`,
              fontFamily: interFont,
              fontSize: 72,
              fontWeight: 700,
              color: "#1D1D1F",
              letterSpacing: "-0.04em",
              lineHeight: 1.25,
              textAlign: "center" as const,
            }}>
              {item}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3cLimits: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(
    frame,
    [0, 10, 254, 270],
    [0, 1,   1,   0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#F5F5F7", opacity: sceneOp }}>
      <Phase1 />
      <Phase2 />
    </AbsoluteFill>
  );
};
