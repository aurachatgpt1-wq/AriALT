import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, FRANTIC_SPRING, interFont } from "../constants";

export interface NotificationData {
  message: string;
  type: "error" | "warning" | "info";
  appearFrame: number;
}

interface NotificationBadgeProps {
  notification: NotificationData;
  index: number;
}

const TYPE_CONFIG = {
  error: {
    bg: COLORS.warningRed,
    icon: "✕",
  },
  warning: {
    bg: COLORS.warningAmber,
    icon: "⚠",
  },
  info: {
    bg: COLORS.infoBlue,
    icon: "ℹ",
  },
};

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  notification,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < notification.appearFrame) return null;

  const slideProgress = spring({
    frame: frame - notification.appearFrame,
    fps,
    config: FRANTIC_SPRING,
  });

  const translateX = interpolate(slideProgress, [0, 1], [400, 0]);
  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);

  const config = TYPE_CONFIG[notification.type];

  return (
    <div
      style={{
        position: "absolute",
        top: 30 + index * 60,
        right: 25,
        width: 340,
        height: 50,
        backgroundColor: config.bg,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        transform: `translateX(${translateX}px)`,
        opacity,
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        zIndex: 800 + index,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "white",
          fontWeight: 700,
        }}
      >
        {config.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: FONT_SIZES.notificationTitle,
            fontWeight: 700,
            color: "white",
            fontFamily: interFont,
            lineHeight: 1.2,
          }}
        >
          {notification.type === "error" ? "ERRORE" : notification.type === "warning" ? "ATTENZIONE" : "INFO"}
        </div>
        <div
          style={{
            fontSize: FONT_SIZES.notification - 2,
            color: "rgba(255,255,255,0.9)",
            fontFamily: interFont,
            lineHeight: 1.2,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {notification.message}
        </div>
      </div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", cursor: "default" }}>×</div>
    </div>
  );
};
