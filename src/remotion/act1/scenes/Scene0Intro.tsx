import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { interFont } from "../constants";

export const Scene0Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // Text: fade in then fade out
  const textOpacity = interpolate(
    frame,
    [0, 12, 62, 75],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Background: dark → #F0F3FF (AriA brand blue tint)
  const t = interpolate(frame, [68, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r = Math.round(29  + (240 - 29)  * t);
  const g = Math.round(29  + (243 - 29)  * t);
  const b = Math.round(31  + (255 - 31)  * t);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Base color */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: `rgb(${r},${g},${b})` }} />

      {/* Blob 1 — appears as background transitions to light */}
      <div style={{
        position: "absolute",
        width: 900, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.18) 0%, transparent 70%)",
        left: interpolate(t, [0, 1], [-160, -120]),
        top:  interpolate(t, [0, 1], [-200, -160]),
        filter: "blur(60px)",
        opacity: t,
      }} />

      {/* Blob 2 */}
      <div style={{
        position: "absolute",
        width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(107,142,255,0.15) 0%, transparent 65%)",
        right: interpolate(t, [0, 1], [-240, -200]),
        top:   interpolate(t, [0, 1], [60, 100]),
        filter: "blur(70px)",
        opacity: t,
      }} />

      {/* Text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 120px",
      }}>
        <span style={{
          fontFamily: interFont,
          fontSize: 68,
          fontWeight: 500,
          color: "#F5F5F7",
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          textAlign: "center",
          opacity: textOpacity,
        }}>
          This is how industry works today.
        </span>
      </div>
    </AbsoluteFill>
  );
};
