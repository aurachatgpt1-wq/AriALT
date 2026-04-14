import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { interFont } from "../constants";

export const Scene4Conclusion: React.FC = () => {
  const frame = useCurrentFrame();

  const line1Opacity = interpolate(frame, [5, 22], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line1Y = interpolate(frame, [5, 22], [20, 0], {
    extrapolateRight: "clamp",
  });

  const line2Opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [30, 50], [20, 0], {
    extrapolateRight: "clamp",
  });

  const subOpacity = interpolate(frame, [65, 85], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <div
        style={{
          fontFamily: interFont,
          fontSize: 68,
          fontWeight: 700,
          color: "#1D1D1F",
          letterSpacing: "-0.03em",
          textAlign: "center",
          opacity: line1Opacity,
          transform: `translateY(${line1Y}px)`,
        }}
      >
        A generic tool.
      </div>

      <div
        style={{
          fontFamily: interFont,
          fontSize: 68,
          fontWeight: 700,
          color: "#1D1D1F",
          letterSpacing: "-0.03em",
          textAlign: "center",
          opacity: line2Opacity,
          transform: `translateY(${line2Y}px)`,
          marginTop: 4,
        }}
      >
        For a specialized problem.
      </div>

      <div
        style={{
          fontFamily: interFont,
          fontSize: 24,
          fontWeight: 400,
          color: "#6B7280",
          letterSpacing: "-0.01em",
          textAlign: "center",
          opacity: subOpacity,
          marginTop: 32,
        }}
      >
        There's a better way to use AI.
      </div>
    </AbsoluteFill>
  );
};
