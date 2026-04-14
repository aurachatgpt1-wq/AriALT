import React from "react";
import { useCurrentFrame } from "remotion";

interface TypedTextProps {
  text: string;
  startFrame: number;
  /** Frames per character */
  speed?: number;
  style?: React.CSSProperties;
  showCursor?: boolean;
}

export const TypedText: React.FC<TypedTextProps> = ({
  text,
  startFrame,
  speed = 1,
  style,
  showCursor = true,
}) => {
  const frame = useCurrentFrame();

  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(
    text.length,
    Math.floor(elapsed / speed)
  );

  const displayedText = text.slice(0, charsToShow);
  const isTyping = charsToShow < text.length && elapsed > 0;
  const cursorVisible = showCursor && elapsed > 0 && (isTyping || frame % 30 < 15);

  if (frame < startFrame) return null;

  return (
    <span style={style}>
      {displayedText}
      {cursorVisible && (
        <span
          style={{
            borderRight: "2px solid #333",
            marginLeft: 1,
            animation: "none",
          }}
        />
      )}
    </span>
  );
};
