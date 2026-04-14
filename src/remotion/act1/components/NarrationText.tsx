import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont, TEXT_ZONE_HEIGHT } from "../constants";

interface WordRevealProps {
  words: string[];
  startFrame: number;
  framePerWord?: number;
  fontSize?: number;
  color?: string;
  weight?: number;
  letterSpacing?: string;
  wordColors?: string[];
  wordWeights?: number[];
  wordDelays?: number[]; // per-word frame offset added to startFrame
}

/**
 * Apple-style word-by-word reveal with spring animation.
 * Each word slides up and fades in independently.
 */
const WordReveal: React.FC<WordRevealProps> = ({
  words,
  startFrame,
  framePerWord = 6,
  fontSize = 64,
  color = "#1D1D1F",
  weight = 600,
  letterSpacing = "-0.02em",
  wordColors,
  wordWeights,
  wordDelays,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 14px",
        overflow: "hidden",
      }}
    >
      {words.map((word, i) => {
        const wordFrame = startFrame + (wordDelays ? (wordDelays[i] ?? i * framePerWord) : i * framePerWord);
        const progress = spring({
          frame: frame - wordFrame,
          fps,
          config: { damping: 20, stiffness: 200, mass: 0.4 },
        });

        const translateY = interpolate(progress, [0, 1], [30, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${translateY}px)`,
              opacity,
              fontFamily: interFont,
              fontSize,
              fontWeight: wordWeights?.[i] ?? weight,
              color: wordColors?.[i] ?? color,
              letterSpacing,
              lineHeight: 1.1,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Apple-style narration: centered on screen, large, minimal.
 * Multiple lines supported, each appearing after the previous.
 */
export interface NarrationLine {
  words: string[];
  startFrame: number;
  framePerWord?: number;
  fontSize?: number;
  color?: string;
  weight?: number;
  wordColors?: string[];
  wordWeights?: number[];
  wordDelays?: number[];
}

interface NarrationTextProps {
  lines: NarrationLine[];
  position?: "center" | "bottom" | "top";
  zoneBg?: string;
  showBorder?: boolean;
}

export const NarrationText: React.FC<NarrationTextProps> = ({
  lines,
  position = "bottom",
  zoneBg = "#F5F5F7",
  showBorder = true,
}) => {
  const frame = useCurrentFrame();

  const firstLine = lines[0];
  if (frame < firstLine.startFrame - 5) return null;

  // "bottom" = dedicated text zone at the bottom of the screen
  // "center" = floating centered on screen (no zone background)
  const isZone = position === "bottom";

  if (isZone) {
    return (
      <>
        {/* Dedicated text zone: clean white strip at the bottom */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: TEXT_ZONE_HEIGHT,
            backgroundColor: zoneBg,
            borderTop: showBorder ? "1px solid rgba(0,0,0,0.08)" : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {lines.map((line, i) => (
            <WordReveal
              key={i}
              words={line.words}
              startFrame={line.startFrame}
              framePerWord={line.framePerWord}
              fontSize={line.fontSize ?? 62}
              color={line.color ?? "#1D1D1F"}
              weight={line.weight ?? 600}
              wordColors={line.wordColors}
              wordWeights={line.wordWeights}
              wordDelays={line.wordDelays}
            />
          ))}
        </div>
      </>
    );
  }

  // Center / top position (floating, no background)
  const positionStyle: React.CSSProperties =
    position === "center"
      ? { top: "50%", transform: "translateY(-50%)" }
      : { top: 80 };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...positionStyle,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {lines.map((line, i) => (
        <WordReveal
          key={i}
          words={line.words}
          startFrame={line.startFrame}
          fontSize={line.fontSize ?? 62}
          color={line.color ?? "#1D1D1F"}
          weight={line.weight ?? 600}
        />
      ))}
    </div>
  );
};

/**
 * Simple single-line Apple caption (smaller, lighter).
 * Used for subtitles or supportive copy.
 */
interface AppleCaptionProps {
  text: string;
  startFrame: number;
  fontSize?: number;
  color?: string;
}

export const AppleCaption: React.FC<AppleCaptionProps> = ({
  text,
  startFrame,
  fontSize = 28,
  color = "#6E6E73",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 100, mass: 0.8 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [16, 0]);

  if (frame < startFrame) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 999,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: interFont,
          fontSize,
          fontWeight: 400,
          color,
          letterSpacing: "-0.01em",
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {text}
      </span>
    </div>
  );
};
