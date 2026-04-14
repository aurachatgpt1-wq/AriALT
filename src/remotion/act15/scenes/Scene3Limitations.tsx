import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { interFont } from "../constants";

const PHRASES = [
  { text: "Knows your plant.",     inFrame: 0,   outFrame: 60  },
  { text: "Acts before you ask.",  inFrame: 70,  outFrame: 130 },
  { text: "Runs your team.",       inFrame: 140, outFrame: 200 },
];

const FADE = 10;

export const Scene3Limitations: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F0F0F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {PHRASES.map(({ text, inFrame, outFrame }) => {
        const opacity = interpolate(
          frame,
          [inFrame, inFrame + FADE, outFrame - FADE, outFrame],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (opacity <= 0) return null;

        return (
          <div
            key={text}
            style={{
              position: "absolute",
              fontFamily: interFont,
              fontSize: 96,
              fontWeight: 700,
              color: "#1D1D1F",
              letterSpacing: "-0.03em",
              textAlign: "center",
              opacity,
              padding: "0 120px",
            }}
          >
            {text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
