import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../constants";
import { CmmsShell } from "../components/CmmsShell";
import { WorkOrderForm } from "../components/WorkOrderForm";
import { AnimatedCursor, CursorKeyframe } from "../components/AnimatedCursor";
import { NarrationText } from "../components/NarrationText";

const CURSOR_KEYFRAMES: CursorKeyframe[] = [
  { frame: 4,  x: 960, y: 400 },
  { frame: 11, x: 130, y: 355, click: true },
  { frame: 18, x: 265, y: 115, click: true },
  { frame: 30, x: 700, y: 230, click: true },
  { frame: 40, x: 700, y: 230 },
  { frame: 41, x: 380, y: 320, click: true },
  { frame: 43, x: 380, y: 345, click: true },
  { frame: 46, x: 680, y: 320, click: true },
  { frame: 47, x: 680, y: 345, click: true },
  { frame: 50, x: 980, y: 320, click: true },
  { frame: 59, x: 980, y: 320 },
  { frame: 60, x: 380, y: 385, click: true },
  { frame: 62, x: 380, y: 410, click: true },
  { frame: 63, x: 680, y: 385, click: true },
  { frame: 65, x: 680, y: 410, click: true },
  { frame: 69, x: 980, y: 385, click: true },
  { frame: 71, x: 980, y: 410, click: true },
  { frame: 74, x: 380, y: 448, click: true },
  { frame: 77, x: 380, y: 448 },
  { frame: 78, x: 680, y: 448, click: true },
  { frame: 80, x: 680, y: 448 },
  { frame: 83, x: 980, y: 448, click: true },
  { frame: 86, x: 980, y: 448 },
  { frame: 88, x: 600, y: 530, click: true },
  { frame: 92, x: 600, y: 555, click: true },
  { frame: 96, x: 600, y: 580, click: true },
  { frame: 101, x: 600, y: 650, click: true },
  { frame: 105, x: 600, y: 675, click: true },
  { frame: 108, x: 600, y: 700, click: true },
  { frame: 112, x: 600, y: 725, click: true },
  { frame: 115, x: 600, y: 790, click: true },
  { frame: 122, x: 600, y: 790 },
  { frame: 140, x: 800, y: 500 },
];

export const Scene1WorkOrder: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgLight }}>
      {/* CMMS Interface — already on screen from frame 0 */}
      <CmmsShell slideInStart={-9999}>
        <WorkOrderForm appearFrame={5} />
      </CmmsShell>

      {/* Animated cursor */}
      <AnimatedCursor keyframes={CURSOR_KEYFRAMES} visible={frame > 2} />

      {/* Apple-style narration */}
      <NarrationText
        position="bottom"
        zoneBg="transparent"
        showBorder={false}
        lines={[
          {
            words: ["Every", "operation", "must", "be", "performed", "manually."],
            startFrame: 8,
            fontSize: 58,
            color: "#1D1D1F",
            weight: 600,
          },
          {
            words: ["Field", "by", "field.", "Form", "by", "form."],
            startFrame: 32,
            fontSize: 42,
            color: "#6E6E73",
            weight: 400,
          },
        ]}
      />
    </AbsoluteFill>
  );
};
