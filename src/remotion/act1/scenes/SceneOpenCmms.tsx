import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, interFont } from "../constants";
import { CmmsShell } from "../components/CmmsShell";
import { WindowsDesktop } from "../components/WindowsDesktop";
import { WorkOrdersList } from "../components/WorkOrdersList";

// ─── Timing ───────────────────────────────────────────────────────────────────
const T_CURSOR_MOVE_START = 6;
const T_CURSOR_AT_ICON    = 32;
const T_FIRST_CLICK       = 34;
const T_SECOND_CLICK      = 44;   // double-click
const T_SPLASH_IN         = 48;
const T_SPLASH_HOLD       = 58;
const T_SPLASH_OUT_START  = 86;
const T_SPLASH_OUT_END    = 94;
const T_WINDOW_OPEN       = 90;   // window springs in while splash fades
const T_CURSOR_TO_BUTTON  = 108;
const T_BUTTON_HOVER      = 128;
const T_BUTTON_CLICK      = 148;

// ─── Icon target (Maintenance_DB.lnk is the 4th icon at x=30, y=20+3*98=314) ─
const ICON_CENTER = { x: 30 + 44, y: 314 + 30 }; // center of icon box (~74, 344)
const BUTTON_TARGET = { x: 1578, y: 216 };        // inside shell: "+ Create (IW31)" button

// ─── Natural cursor (spring-eased) ────────────────────────────────────────────
const useNaturalCursor = (startFrame: number, endFrame: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress from 0 → 1 shaped like a smooth S-curve via a spring.
  const t = spring({
    frame: frame - startFrame,
    fps,
    durationInFrames: endFrame - startFrame,
    config: { damping: 22, stiffness: 80, mass: 1.1 },
  });

  return t;
};

// ─── Splash screen ────────────────────────────────────────────────────────────
const SplashScreen: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < T_SPLASH_IN || frame > T_SPLASH_OUT_END) return null;

  const opIn = interpolate(frame, [T_SPLASH_IN, T_SPLASH_IN + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opOut = interpolate(
    frame,
    [T_SPLASH_OUT_START, T_SPLASH_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = opIn * opOut;

  const progressPct = interpolate(
    frame,
    [T_SPLASH_IN, T_SPLASH_OUT_START],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const statusMsg =
    frame < T_SPLASH_HOLD + 4
      ? "Connecting to database..."
      : frame < T_SPLASH_HOLD + 14
      ? "Loading modules..."
      : frame < T_SPLASH_HOLD + 22
      ? "Synchronizing plant data..."
      : "Ready";

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 460,
        background: "linear-gradient(180deg, #E8E8E8 0%, #C8C8C8 100%)",
        border: `1px solid ${COLORS.cmmsBorder}`,
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
        fontFamily: interFont,
        opacity,
        zIndex: 20,
      }}
    >
      {/* Classic title bar */}
      <div
        style={{
          background: "linear-gradient(180deg, #4A7EBB 0%, #3A6AA0 100%)",
          color: "#FFFFFF",
          padding: "5px 10px",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Maintenance Management System
      </div>

      {/* Body */}
      <div style={{ padding: "26px 28px 22px", color: COLORS.cmmsText }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #3A6AA0 0%, #1F4776 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              border: "2px solid #FFFFFF",
              boxShadow: "inset 0 0 0 1px #2A5078",
            }}
          >
            🛠️
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>
              Maintenance Management System
            </div>
            <div style={{ fontSize: 11, color: COLORS.cmmsLabelText, marginTop: 2 }}>
              Version 3.2.1 · Build 2019.04.23
            </div>
            <div style={{ fontSize: 10, color: COLORS.cmmsLabelText, marginTop: 1 }}>
              © 2008–2019 Corporate IT Systems Ltd.
            </div>
          </div>
        </div>

        {/* Progress bar (classic blocky style) */}
        <div
          style={{
            height: 18,
            background: "#FFFFFF",
            border: `1px inset ${COLORS.cmmsFieldBorder}`,
            padding: 2,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: `repeating-linear-gradient(90deg, #2F7BBF 0 8px, #3A8AD4 8px 10px)`,
              transition: "width 0.1s linear",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: COLORS.cmmsLabelText,
          }}
        >
          <span>{statusMsg}</span>
          <span>{Math.floor(progressPct)}%</span>
        </div>
      </div>
    </div>
  );
};

// ─── Icon selection highlight ────────────────────────────────────────────────
const IconSelection: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T_FIRST_CLICK || frame > T_SPLASH_IN + 4) return null;

  const op = interpolate(
    frame,
    [T_FIRST_CLICK, T_FIRST_CLICK + 3, T_SPLASH_IN, T_SPLASH_IN + 4],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 30 - 4,
        top: 314 - 2,
        width: 96,
        height: 78,
        background: "rgba(0,120,212,0.30)",
        border: `1px solid rgba(0,120,212,0.75)`,
        opacity: op,
        zIndex: 4,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Double-click ripple on icon ─────────────────────────────────────────────
const ClickRipple: React.FC<{ clickFrame: number; x: number; y: number }> = ({
  clickFrame,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const local = frame - clickFrame;
  if (local < 0 || local > 14) return null;

  const scale = interpolate(local, [0, 14], [0.4, 1.8], { extrapolateRight: "clamp" });
  const opacity = interpolate(local, [0, 6, 14], [0.55, 0.3, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(0,120,212,0.45)",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        zIndex: 9998,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Smooth cursor that interpolates between three waypoints ────────────────
const SmoothCursor: React.FC = () => {
  const frame = useCurrentFrame();

  const moveToIcon = useNaturalCursor(T_CURSOR_MOVE_START, T_CURSOR_AT_ICON);
  const moveToButton = useNaturalCursor(T_CURSOR_TO_BUTTON, T_BUTTON_HOVER);

  // Starting position: desktop center-right
  const START = { x: 1100, y: 640 };
  const ICON = ICON_CENTER;
  const BUTTON = BUTTON_TARGET;

  let x: number;
  let y: number;

  if (frame < T_CURSOR_TO_BUTTON) {
    // Moving from start → icon, then idle on icon
    const t = Math.min(1, moveToIcon);
    x = START.x + (ICON.x - START.x) * t;
    y = START.y + (ICON.y - START.y) * t;
  } else {
    // Moving from icon → button
    const t = Math.min(1, moveToButton);
    x = ICON.x + (BUTTON.x - ICON.x) * t;
    y = ICON.y + (BUTTON.y - ICON.y) * t;
  }

  // Click flashes
  const clickFrames = [T_FIRST_CLICK, T_SECOND_CLICK, T_BUTTON_CLICK];
  const activeClick = clickFrames.find((f) => frame >= f && frame < f + 12);
  const clickLocal = activeClick !== undefined ? frame - activeClick : -1;
  const rippleScale =
    activeClick !== undefined
      ? interpolate(clickLocal, [0, 12], [0, 1.5], { extrapolateRight: "clamp" })
      : 0;
  const rippleOpacity =
    activeClick !== undefined
      ? interpolate(clickLocal, [0, 6, 12], [0.6, 0.3, 0], { extrapolateRight: "clamp" })
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {activeClick !== undefined && (
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: COLORS.clickRipple,
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}
      <svg
        width="20"
        height="24"
        viewBox="0 0 20 24"
        style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.35))" }}
      >
        <path
          d="M0 0 L0 18 L4.5 13.5 L8 22 L11 21 L7.5 12.5 L14 12.5 Z"
          fill={COLORS.cursorWhite}
          stroke={COLORS.cursorBorder}
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};

// ─── Main scene ───────────────────────────────────────────────────────────────
const WINDOW_BOUNDS = {
  top: 36,
  left: 150,
  right: 110,
  bottom: 64,
};

export const SceneOpenCmms: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CMMS window opens with a spring from small → full
  const openProgress = spring({
    frame: frame - T_WINDOW_OPEN,
    fps,
    config: { damping: 22, stiffness: 110, mass: 1.1 },
  });

  const windowScale = interpolate(openProgress, [0, 1], [0.82, 1]);
  const windowOpacity = interpolate(openProgress, [0, 1], [0, 1]);
  const windowVisible = frame >= T_WINDOW_OPEN;

  return (
    <AbsoluteFill>
      <WindowsDesktop>
        {/* Icon selection highlight (above wallpaper, below splash) */}
        <IconSelection />

        {/* Click ripples on the icon (double-click) */}
        <ClickRipple clickFrame={T_FIRST_CLICK} x={ICON_CENTER.x} y={ICON_CENTER.y} />
        <ClickRipple clickFrame={T_SECOND_CLICK} x={ICON_CENTER.x} y={ICON_CENTER.y} />

        {/* Splash screen */}
        <SplashScreen />

        {/* CMMS window with Work Orders list */}
        {windowVisible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `scale(${windowScale})`,
              transformOrigin: `${(WINDOW_BOUNDS.left + (1920 - WINDOW_BOUNDS.right)) / 2}px ${
                (WINDOW_BOUNDS.top + (1080 - WINDOW_BOUNDS.bottom)) / 2
              }px`,
              opacity: windowOpacity,
            }}
          >
            <CmmsShell
              slideInStart={-9999}
              windowStyle="win10"
              contentStyle="erp"
              transactionCode="IW39"
              title="Work Order List (IW39) — Maintenance Management System"
              windowBounds={WINDOW_BOUNDS}
            >
              <WorkOrdersList
                buttonHoverFrame={T_BUTTON_HOVER}
                buttonClickFrame={T_BUTTON_CLICK}
              />
            </CmmsShell>
          </div>
        )}
      </WindowsDesktop>

      {/* Smooth cursor — drawn over everything */}
      <SmoothCursor />
    </AbsoluteFill>
  );
};
