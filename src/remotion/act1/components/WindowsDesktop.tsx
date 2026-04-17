import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, interFont } from "../constants";

// ─── Desktop icons ────────────────────────────────────────────────────────────
const DESKTOP_ICONS: { label: string; emoji: string }[] = [
  { label: "This PC", emoji: "🖥️" },
  { label: "Recycle Bin", emoji: "🗑️" },
  { label: "Network (Z:)", emoji: "🗂️" },
  { label: "Maintenance_DB.lnk", emoji: "📊" },
  { label: "Reports 2024", emoji: "📁" },
  { label: "Shortcut_ERP.lnk", emoji: "📎" },
];

// ─── Taskbar pinned apps ──────────────────────────────────────────────────────
const TASKBAR_APPS: { label: string; emoji: string; active?: boolean; badge?: number }[] = [
  { label: "Edge", emoji: "🌐" },
  { label: "File Explorer", emoji: "📁" },
  { label: "Outlook", emoji: "📧", badge: 3 },
  { label: "Teams", emoji: "💬", badge: 2 },
  { label: "Excel", emoji: "📊" },
  { label: "Maintenance MS", emoji: "🛠️", active: true },
];

interface DesktopIconProps {
  icon: { label: string; emoji: string };
  x: number;
  y: number;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 88,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      fontFamily: interFont,
      userSelect: "none",
    }}
  >
    <div style={{ fontSize: 42, filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.6))" }}>
      {icon.emoji}
    </div>
    <div
      style={{
        fontSize: 11,
        color: COLORS.win10DesktopText,
        textShadow: "1px 1px 2px rgba(0,0,0,0.85)",
        textAlign: "center",
        lineHeight: "13px",
        maxWidth: 86,
        wordBreak: "break-word",
      }}
    >
      {icon.label}
    </div>
  </div>
);

// ─── Clock that ticks ─────────────────────────────────────────────────────────
const SystemClock: React.FC = () => {
  const frame = useCurrentFrame();
  // Advance one second every 30 frames
  const secondsElapsed = Math.floor(frame / 30);
  const totalSeconds = 7 + secondsElapsed; // start at 14:32:07
  const mm = 32 + Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  const hh = 14;
  const timeStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        fontSize: 11,
        color: "#FFFFFF",
        lineHeight: "13px",
        padding: "0 14px 0 10px",
        fontFamily: interFont,
      }}
    >
      <span>{timeStr}</span>
      <span>15/03/2024</span>
      <span style={{ fontSize: 9, opacity: 0.7 }}>{String(ss).padStart(2, "0")}s</span>
    </div>
  );
};

// ─── Taskbar ──────────────────────────────────────────────────────────────────
const Taskbar: React.FC<{ outlookPulse: number; teamsPulse: number }> = ({
  outlookPulse,
  teamsPulse,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 40,
        background: COLORS.win10Taskbar,
        display: "flex",
        alignItems: "center",
        borderTop: "1px solid #000000",
        zIndex: 50,
      }}
    >
      {/* Start button — four squares */}
      <div
        style={{
          width: 48,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "10px 10px",
            gridTemplateRows: "10px 10px",
            gap: 3,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ backgroundColor: "#FFFFFF" }} />
          ))}
        </div>
      </div>

      {/* Search box */}
      <div
        style={{
          width: 220,
          height: 28,
          background: "#2D2D2D",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 8,
          fontFamily: interFont,
          fontSize: 11,
          color: "#A0A0A0",
        }}
      >
        <span style={{ fontSize: 12 }}>🔍</span>
        <span>Type here to search</span>
      </div>

      {/* Task view icon */}
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontSize: 14,
          marginLeft: 2,
        }}
      >
        ⬚
      </div>

      {/* Pinned apps */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: 8, gap: 1 }}>
        {TASKBAR_APPS.map((app) => {
          const pulse =
            app.label === "Outlook" ? outlookPulse : app.label === "Teams" ? teamsPulse : 0;
          const scale = 1 + pulse * 0.08;
          return (
            <div
              key={app.label}
              style={{
                position: "relative",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: app.active ? "rgba(255,255,255,0.08)" : "transparent",
                borderBottom: app.active
                  ? `2px solid ${COLORS.win10Accent}`
                  : "2px solid transparent",
                transform: `scale(${scale})`,
                transition: "transform 0.1s ease",
              }}
            >
              <span style={{ fontSize: 18, filter: "grayscale(0.15)" }}>{app.emoji}</span>
              {app.badge !== undefined && (
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    minWidth: 14,
                    height: 14,
                    background: "#E81123",
                    borderRadius: 8,
                    fontSize: 9,
                    color: "#FFFFFF",
                    fontFamily: interFont,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    border: "1px solid #1F1F1F",
                  }}
                >
                  {app.badge}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* System tray */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          color: "#FFFFFF",
          fontSize: 13,
          fontFamily: interFont,
        }}
      >
        <span style={{ fontSize: 11, opacity: 0.85 }}>⌃</span>
        <span style={{ opacity: 0.9 }}>🌐</span>
        <span style={{ opacity: 0.9 }}>🔊</span>
        <span style={{ opacity: 0.9 }}>🔋</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "2px 4px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
          }}
        >
          ITA
        </span>
      </div>

      {/* Clock */}
      <SystemClock />

      {/* Show desktop button (far right) */}
      <div
        style={{
          width: 6,
          height: 40,
          borderLeft: "1px solid #3A3A3A",
        }}
      />
    </div>
  );
};

// ─── Corporate wallpaper ──────────────────────────────────────────────────────
const CorporateWallpaper: React.FC = () => (
  <>
    {/* Base grey-blue corporate gradient */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(160deg, ${COLORS.win10Wallpaper} 0%, ${COLORS.win10WallpaperDark} 100%)`,
      }}
    />
    {/* Subtle vignette */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.04) 0%, transparent 65%)",
      }}
    />
    {/* Faded corporate watermark text */}
    <div
      style={{
        position: "absolute",
        bottom: 80,
        right: 40,
        fontFamily: interFont,
        fontSize: 12,
        color: "rgba(255,255,255,0.22)",
        textAlign: "right",
        lineHeight: "16px",
        letterSpacing: "0.04em",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13 }}>PROPERTY OF IT DEPARTMENT</div>
      <div>Asset ID: WKS-0847-MNT</div>
      <div>Unauthorized access is prohibited</div>
    </div>
  </>
);

// ─── Main component ───────────────────────────────────────────────────────────
interface WindowsDesktopProps {
  children: React.ReactNode;
  outlookPulseFrame?: number;
  teamsPulseFrame?: number;
}

export const WindowsDesktop: React.FC<WindowsDesktopProps> = ({
  children,
  outlookPulseFrame = 90,
  teamsPulseFrame = 150,
}) => {
  const frame = useCurrentFrame();

  // Pulse animations for taskbar icons
  const outlookPulse = interpolate(
    frame,
    [outlookPulseFrame, outlookPulseFrame + 4, outlookPulseFrame + 10, outlookPulseFrame + 20],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const teamsPulse = interpolate(
    frame,
    [teamsPulseFrame, teamsPulseFrame + 4, teamsPulseFrame + 10, teamsPulseFrame + 20],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Wallpaper */}
      <CorporateWallpaper />

      {/* Desktop icons (top-left, column) */}
      {DESKTOP_ICONS.map((icon, i) => (
        <DesktopIcon
          key={icon.label}
          icon={icon}
          x={30}
          y={20 + i * 98}
        />
      ))}

      {/* Active CMMS window */}
      {children}

      {/* Taskbar */}
      <Taskbar outlookPulse={outlookPulse} teamsPulse={teamsPulse} />
    </div>
  );
};
