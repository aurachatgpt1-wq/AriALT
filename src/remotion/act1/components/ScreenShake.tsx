import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface ScreenShakeProps {
  children: React.ReactNode;
  startFrame: number;
  maxAmplitude?: number;
  rampUpDuration?: number;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  children,
  startFrame,
  maxAmplitude = 8,
  rampUpDuration = 80,
}) => {
  const frame = useCurrentFrame();

  if (frame < startFrame) {
    return <>{children}</>;
  }

  const elapsed = frame - startFrame;
  const amplitude = interpolate(
    elapsed,
    [0, rampUpDuration],
    [0, maxAmplitude],
    { extrapolateRight: "clamp" }
  );

  const shakeX = Math.sin(elapsed * 1.3) * amplitude;
  const shakeY = Math.cos(elapsed * 1.7) * amplitude * 0.7;

  return (
    <div
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
};
