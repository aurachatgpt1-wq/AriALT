import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CmmsShell } from "../components/CmmsShell";
import { MaintenancePlanForm } from "../components/MaintenancePlanForm";
import { ExcelOverlay } from "../components/ExcelOverlay";
import { WindowsDesktop } from "../components/WindowsDesktop";
import { interFont } from "../constants";

// ─── Window bounds inside the Windows 10 desktop ─────────────────────────────
// CMMS window sits on the left (approx. 55% width), Excel on the right.
const CMMS_BOUNDS = {
  top: 36,
  left: 40,
  right: 900,        // leaves ~860px for Excel
  bottom: 64,        // above taskbar
};

const EXCEL_BOUNDS = {
  top: 60,
  right: 40,
  bottom: 80,
  width: 820,
};

// Copy → Paste rhythm. Each event has a kind ("copy" anchors over Excel on the
// right; "paste" anchors over the form on the left), a frame, and a Y anchor so
// successive events descend the screen as the form fills.
type ShortcutKind = "copy" | "paste";
interface ShortcutEvent {
  kind: ShortcutKind;
  frame: number;
  y: number;
}

const SHORTCUTS: ShortcutEvent[] = [
  { kind: "copy",  frame: 28,  y: 240 },
  { kind: "paste", frame: 44,  y: 260 },
  { kind: "copy",  frame: 64,  y: 300 },
  { kind: "paste", frame: 80,  y: 320 },
  { kind: "copy",  frame: 102, y: 360 },
  { kind: "paste", frame: 118, y: 380 },
  { kind: "copy",  frame: 148, y: 440 },
  { kind: "paste", frame: 164, y: 460 },
  { kind: "copy",  frame: 196, y: 520 },
  { kind: "paste", frame: 212, y: 540 },
];

const SHORTCUT_DURATION = 26;

interface ShortcutPopupProps {
  event: ShortcutEvent;
  frame: number;
  fps: number;
}

const ShortcutPopup: React.FC<ShortcutPopupProps> = ({ event, frame, fps }) => {
  const elapsed = frame - event.frame;
  if (elapsed < 0 || elapsed > SHORTCUT_DURATION) return null;

  // Springy pop-in scale
  const popIn = spring({
    frame: elapsed,
    fps,
    config: { damping: 9, stiffness: 260, mass: 0.5 },
  });
  const scale = interpolate(popIn, [0, 1], [0.55, 1]);

  const opacity = interpolate(
    elapsed,
    [0, 3, SHORTCUT_DURATION - 8, SHORTCUT_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const translateY = interpolate(elapsed, [0, SHORTCUT_DURATION], [0, -14], {
    extrapolateRight: "clamp",
  });

  const isCopy = event.kind === "copy";
  // Copy anchors near the Excel window (right half of the screen), paste
  // anchors near the CMMS form (left half).
  const leftPos = isCopy ? 1200 : 420;

  const bg = isCopy ? "#217346" : "#1F4E79"; // Excel green vs ERP link blue
  const glow = isCopy
    ? "0 0 24px rgba(33,115,70,0.55), 0 4px 12px rgba(0,0,0,0.4)"
    : "0 0 24px rgba(31,78,121,0.55), 0 4px 12px rgba(0,0,0,0.4)";

  return (
    <div
      style={{
        position: "absolute",
        top: event.y + translateY,
        left: leftPos,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        opacity,
        zIndex: 500,
        pointerEvents: "none",
      }}
    >
      {/* Enclosing box around the whole keycap cluster */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(20, 24, 32, 0.92)",
          border: `2px solid ${bg}`,
          borderRadius: 14,
          boxShadow: `${glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Keycap cluster: Ctrl + C/V */}
        <Keycap label="Ctrl" bg={bg} />
        <span
          style={{
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: interFont,
            textShadow: "0 2px 4px rgba(0,0,0,0.6)",
          }}
        >
          +
        </span>
        <Keycap label={isCopy ? "C" : "V"} bg={bg} glow={glow} big />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 34,
            background: "rgba(255,255,255,0.15)",
            margin: "0 2px",
          }}
        />

        {/* Action label */}
        <span
          style={{
            fontFamily: interFont,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            padding: "0 6px 0 2px",
            textShadow: `0 0 12px ${bg}`,
          }}
        >
          {isCopy ? "COPY" : "PASTE"}
        </span>
      </div>
    </div>
  );
};

const Keycap: React.FC<{ label: string; bg: string; glow?: string; big?: boolean }> = ({
  label,
  bg,
  glow,
  big = false,
}) => (
  <div
    style={{
      minWidth: big ? 44 : 54,
      height: big ? 44 : 36,
      padding: big ? "0 12px" : "0 10px",
      background: `linear-gradient(180deg, #FFFFFF 0%, #E6E6E6 55%, #C8C8C8 100%)`,
      border: `2px solid ${bg}`,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1A1A1A",
      fontFamily: interFont,
      fontWeight: 800,
      fontSize: big ? 24 : 16,
      letterSpacing: big ? "0.02em" : "0.04em",
      boxShadow: glow ?? "0 3px 0 rgba(0,0,0,0.35), 0 5px 10px rgba(0,0,0,0.25)",
    }}
  >
    {label}
  </div>
);

const ShortcutLayer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <>
    {SHORTCUTS.map((ev, i) => (
      <ShortcutPopup key={i} event={ev} frame={frame} fps={fps} />
    ))}
  </>
);

export const Scene2ManutenzionePreventiva: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Highlighted Excel row advances on each Copy event so the viewer sees WHICH
  // cell is being grabbed right as the Ctrl+C popup appears.
  let highlightedRow = -1;
  if (frame >= 24 && frame < 60) highlightedRow = 0;
  else if (frame >= 60 && frame < 98) highlightedRow = 1;
  else if (frame >= 98 && frame < 144) highlightedRow = 2;
  else if (frame >= 144 && frame < 192) highlightedRow = 3;
  else if (frame >= 192) highlightedRow = 4;

  return (
    <AbsoluteFill>
      <WindowsDesktop
        outlookPulseFrame={-9999}
        teamsPulseFrame={-9999}
      >
        {/* CMMS window (left side) */}
        <CmmsShell
          slideInStart={-9999}
          windowStyle="win10"
          contentStyle="erp"
          transactionCode="IP01"
          title="Create Maintenance Plan (IP01) — Maintenance Management System"
          rightTitle="Create Maintenance Plan: Initial"
          windowBounds={CMMS_BOUNDS}
        >
          <MaintenancePlanForm
            appearFrame={0}
            enableFocusRing
          />
        </CmmsShell>

        {/* Excel overlay (right side) */}
        <ExcelOverlay
          slideInFrame={0}
          highlightedRow={highlightedRow}
          chromeStyle="win10"
          bounds={EXCEL_BOUNDS}
        />

        {/* Ctrl+C / Ctrl+V shortcut popups — emphasize the copy/paste grind */}
        <ShortcutLayer frame={frame} fps={fps} />
      </WindowsDesktop>
    </AbsoluteFill>
  );
};
