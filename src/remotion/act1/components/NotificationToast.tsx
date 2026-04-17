import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, interFont } from "../constants";

interface NotificationToastProps {
  startFrame: number;
  duration?: number; // total visible time (including in/out)
  sender?: string;
  subject?: string;
  preview?: string;
  bottom?: number;
  right?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  startFrame,
  duration = 80,
  sender = "alerts@company.local",
  subject = "Bearing failure report — Line A",
  preview = "Urgent: Motor M-401 showing abnormal vibration. Please create WO ASAP and assign to mech. team before end of shift.",
  bottom = 52,
  right = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < -2 || localFrame > duration + 10) return null;

  const inProgress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.9 },
  });

  const outStart = duration - 16;
  const outProgress = interpolate(localFrame, [outStart, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = interpolate(inProgress, [0, 1], [380, 0]) + outProgress * 380;
  const opacity = interpolate(inProgress, [0, 1], [0, 1]) * (1 - outProgress);

  // Subtle accent bar pulse
  const barPulse = interpolate(
    localFrame,
    [0, 8, 16, 24, 32],
    [0.4, 1, 0.6, 1, 0.85],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        right,
        bottom,
        width: 360,
        transform: `translateX(${translateX}px)`,
        opacity,
        zIndex: 60,
        pointerEvents: "none",
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          background: COLORS.win10ToastBg,
          border: `1px solid ${COLORS.win10ToastBorder}`,
          borderLeft: `3px solid ${COLORS.win10Accent}`,
          borderRadius: 2,
          padding: "10px 14px 12px",
          fontFamily: interFont,
          boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
          display: "flex",
          gap: 10,
        }}
      >
        {/* Outlook icon */}
        <div
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            background: "linear-gradient(135deg, #0078D4 0%, #005A9E 100%)",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            filter: `brightness(${0.9 + barPulse * 0.15})`,
          }}
        >
          📧
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.02em",
              }}
            >
              Outlook
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#A8A8A8",
              }}
            >
              now
            </span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#C8C8C8",
              marginBottom: 4,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {sender}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#FFFFFF",
              marginBottom: 4,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {subject}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#B5B5B5",
              lineHeight: "14px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow: "hidden",
            }}
          >
            {preview}
          </div>
        </div>

        {/* Close button */}
        <div
          style={{
            color: "#8A8A8A",
            fontSize: 14,
            fontWeight: 300,
            cursor: "default",
          }}
        >
          ✕
        </div>
      </div>
    </div>
  );
};
