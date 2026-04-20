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
// Phase 2: "But still:" + rapid-fire list   70 – 270f  (zoom-in + overheating bg)

const LIST_ITEMS = [
  "Fragmented.",
  "Complex.",
  "Time-consuming.",
  "Unaware.",
  "Not autonomous.",
];

const LIST_START  = 110;      // first item flashes in (~0.9s after "But still" settles)
const ITEM_DUR    = 21;       // 0.7s each
const LIST_END    = LIST_START + 5 * ITEM_DUR; // = 215, last item just shown
const HEAT_START  = 100;
const HEAT_END    = LIST_END; // heat peaks right as the last word is displayed
const FADE_OUT_START = LIST_END + 2;  // 217
const SCENE_END      = LIST_END + 17; // 232 — content fully faded
// The remainder of SCENE_3C_DURATION is intentional blank pause before Scene4 (rewind).

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

// ─── Phase 2 — "But still:" + rapid-fire list ──────────────────────────────
const Phase2: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [68, 82], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (frame < 66) return null;

  // Find which item is currently on screen. Each flashes for ITEM_DUR frames,
  // then is replaced instantly by the next. The last one stays until scene exit.
  const afterStart = frame - LIST_START;
  let activeIndex = -1;
  if (afterStart >= 0) {
    const idx = Math.floor(afterStart / ITEM_DUR);
    activeIndex = Math.min(idx, LIST_ITEMS.length - 1);
  }
  const activeItem = activeIndex >= 0 ? LIST_ITEMS[activeIndex] : null;

  // Label "But still" fades out as the first item flashes in
  const labelOp = interpolate(frame, [LIST_START - 4, LIST_START + 2], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fadeIn, pointerEvents: "none",
    }}>
      {/* "But still" label — fades out as first item arrives */}
      {labelOp > 0.01 && (
        <div style={{
          position: "absolute",
          fontFamily: interFont, fontSize: 28, fontWeight: 400,
          color: "#86868B", letterSpacing: "0.02em",
          textTransform: "uppercase" as const,
          opacity: labelOp,
        }}>
          But still
        </div>
      )}

      {/* Current item — instant swap, no fade, centered */}
      {activeItem && (
        <div key={activeIndex} style={{
          fontFamily: interFont,
          fontSize: 96,
          fontWeight: 800,
          color: "#1D1D1F",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          textAlign: "center" as const,
        }}>
          {activeItem}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3cLimits: React.FC = () => {
  const frame = useCurrentFrame();

  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const sceneOp = interpolate(frame, [0, 10, FADE_OUT_START, SCENE_END], [0, 1, 1, 0], clamp);

  // Progressive zoom throughout phase 2 (overheating crescendo)
  const zoom = interpolate(frame, [HEAT_START, HEAT_END], [1, 1.45], clamp);

  // Heat level 0→1 drives the red tint intensity
  const heat = interpolate(frame, [HEAT_START, HEAT_END], [0, 1], clamp);

  // Base bg shifts from cool #F5F5F7 toward a warm red-tinted hue
  const bgColor = `rgb(${Math.round(245 + heat * 10)}, ${Math.round(245 - heat * 55)}, ${Math.round(247 - heat * 70)})`;

  // Red radial haze — starts faint, intensifies
  const hazeOp = interpolate(heat, [0, 1], [0, 0.55], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, opacity: sceneOp, overflow: "hidden" }}>
      {/* Progressive zoom wrapper */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${zoom})`,
        transformOrigin: "center center",
        willChange: "transform",
      }}>
        <Phase1 />
        <Phase2 />
      </div>

      {/* Overheating red radial wash — grows as the list progresses */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 60%, rgba(230,60,40,0.55) 0%, rgba(220,40,30,0.25) 35%, transparent 70%)",
        opacity: hazeOp,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }} />

      {/* Subtle vignette edge that deepens with heat */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(140,30,20,0.35) 100%)",
        opacity: hazeOp * 0.8,
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};
