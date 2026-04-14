import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, UI_BOTTOM_MARGIN, UI_TOP } from "../constants";
import { MaintenancePlanForm } from "../components/MaintenancePlanForm";
import { ExcelOverlay } from "../components/ExcelOverlay";
import { AnimatedCursor, CursorKeyframe } from "../components/AnimatedCursor";
import { NarrationText } from "../components/NarrationText";
import { interFont } from "../constants";

const CURSOR_KEYFRAMES: CursorKeyframe[] = [
  { frame: 0, x: 500, y: 300 },
  { frame: 25, x: 1300, y: 220, click: true },
  { frame: 35, x: 1300, y: 220 },
  { frame: 45, x: 430, y: 295, click: true },
  { frame: 60, x: 1350, y: 245, click: true },
  { frame: 68, x: 1350, y: 245 },
  { frame: 78, x: 580, y: 295, click: true },
  { frame: 88, x: 1420, y: 220, click: true },
  { frame: 94, x: 1420, y: 220 },
  { frame: 102, x: 430, y: 340, click: true },
  { frame: 112, x: 580, y: 340, click: true },
  { frame: 118, x: 580, y: 365, click: true },
  { frame: 125, x: 430, y: 385, click: true },
  { frame: 135, x: 430, y: 385 },
  { frame: 140, x: 450, y: 450, click: true },
  { frame: 155, x: 450, y: 475, click: true },
  { frame: 165, x: 450, y: 500, click: true },
  { frame: 175, x: 450, y: 525, click: true },
  { frame: 185, x: 450, y: 550, click: true },
  { frame: 195, x: 450, y: 610, click: true },
  { frame: 208, x: 450, y: 635, click: true },
  { frame: 218, x: 450, y: 660, click: true },
  { frame: 240, x: 700, y: 400 },
];

export const Scene2ManutenzionePreventiva: React.FC = () => {
  const frame = useCurrentFrame();
  const highlightedRow = frame >= 25 && frame < 100 ? 0 : -1;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgLight }}>
      {/* CMMS narrowed */}
      <div
        style={{
          position: "absolute",
          top: UI_TOP,
          left: 20,
          width: "calc(55% - 30px)",
          bottom: UI_BOTTOM_MARGIN,
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${COLORS.cmmsBorder}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CmmsShellInline title="Maintenance Management System v3.2.1">
          <MaintenancePlanForm appearFrame={5} />
        </CmmsShellInline>
      </div>

      {/* Excel overlay */}
      <ExcelOverlay slideInFrame={10} highlightedRow={highlightedRow} />

      {/* Copy indicator */}
      <CopyIndicator frame={frame} />

      {/* Animated cursor */}
      <AnimatedCursor keyframes={CURSOR_KEYFRAMES} visible />

      {/* Apple narration */}
      <NarrationText
        position="bottom"
        zoneBg="transparent"
        showBorder={false}
        lines={[
          {
            words: ["Copy.", "Paste.", "Repeat."],
            startFrame: 15,
            fontSize: 58,
            color: "#1D1D1F",
            weight: 600,
          },
          {
            words: ["Hours", "of", "work.", "Every.", "Single.", "Day."],
            startFrame: 80,
            fontSize: 40,
            color: "#6E6E73",
            weight: 400,
          },
        ]}
      />
    </AbsoluteFill>
  );
};

const CmmsShellInline: React.FC<{ children: React.ReactNode; title: string }> = ({
  children,
  title,
}) => (
  <div style={{ display: "flex", flexDirection: "column", flex: 1, fontFamily: interFont }}>
    <div style={{ height: 26, background: "linear-gradient(180deg, #4A7EBB 0%, #3A6AA0 100%)", display: "flex", alignItems: "center", padding: "0 8px" }}>
      <span style={{ color: "white", fontSize: 11, fontWeight: 600 }}>{title}</span>
    </div>
    <div style={{ height: 22, backgroundColor: COLORS.cmmsToolbar, display: "flex", alignItems: "center", padding: "0 4px", borderBottom: `1px solid ${COLORS.cmmsBorder}` }}>
      {["File", "Edit", "View", "Tools"].map((m) => (
        <span key={m} style={{ padding: "0 8px", fontSize: 11, color: COLORS.cmmsText }}>{m}</span>
      ))}
    </div>
    <div style={{ flex: 1, backgroundColor: COLORS.cmmsBackground, padding: 10, overflow: "hidden" }}>
      {children}
    </div>
    <div style={{ height: 20, backgroundColor: COLORS.cmmsToolbar, borderTop: `1px solid ${COLORS.cmmsBorder}`, padding: "0 8px", display: "flex", alignItems: "center", fontSize: 9, color: COLORS.cmmsLabelText }}>
      User: admin_maintenance | Plant: North Plant
    </div>
  </div>
);

const CopyIndicator: React.FC<{ frame: number }> = ({ frame }) => {
  const copyFrames = [35, 68, 94];
  const activeCopy = copyFrames.find((cf) => frame >= cf && frame < cf + 15);
  if (!activeCopy) return null;

  const elapsed = frame - activeCopy;
  const opacity = interpolate(elapsed, [0, 5, 10, 15], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const translateY = interpolate(elapsed, [0, 15], [0, -15], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 180 + translateY,
        right: 380,
        backgroundColor: "rgba(33, 115, 70, 0.9)",
        color: "white",
        padding: "3px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: interFont,
        opacity,
        zIndex: 500,
      }}
    >
      Ctrl+C
    </div>
  );
};
