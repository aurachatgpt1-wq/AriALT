import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
} from "remotion";

// ─── Laptop green-screen video compositing ─────────────────────────────────
// Video plays as background, content overlays exactly on the screen area.
// The bezel/keyboard of the laptop video stays visible around the content.

// Screen area coordinates (px in 1920×1080 composition space)
// Measured from green-screen analysis of the video
// Coordinates that fully cover the green screen + tuck ~4px under bezel
const SCREEN = {
  left: 132,
  top: 294,
  width: 1122,
  height: 548,
};

interface LaptopVideoFrameProps {
  children: React.ReactNode;
  videoFile?: string;
  videoStartFrom?: number;
}

export const LaptopVideoFrame: React.FC<LaptopVideoFrameProps> = ({
  children,
  videoFile = "laptop-mockup.mp4",
  videoStartFrom = 90,
}) => {
  return (
    <div style={{ position: "relative", width: 1920, height: 1080 }}>
      {/* Layer 1 — Laptop video — z-index 1 */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <OffthreadVideo
          src={staticFile(videoFile)}
          startFrom={videoStartFrom}
          style={{ width: 1920, height: 1080 }}
          muted
        />
      </div>

      {/* Layer 2 — Content on top of screen area — z-index 2 */}
      <div
        style={{
          position: "absolute",
          left: SCREEN.left,
          top: SCREEN.top,
          width: SCREEN.width,
          height: SCREEN.height,
          zIndex: 2,
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
