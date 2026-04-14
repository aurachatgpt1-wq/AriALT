import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FRANTIC_SPRING, interFont } from "../constants";

export type AppType = "whatsapp" | "teams" | "email" | "sms";

export interface PopupData {
  app: AppType;
  sender: string;
  group?: string;
  message: string;
  time: string;
  appearFrame: number;
  /** Absolute position on screen */
  x: number;
  y: number;
  /** Optional slight rotation for chaos feel */
  rotation?: number;
  /** Slide-in direction */
  from?: "top" | "right" | "bottom" | "left";
}

const APP_CONFIG: Record<AppType, { name: string; headerBg: string; iconBg: string; avatarBg: string; icon: React.ReactNode }> = {
  whatsapp: {
    name: "WhatsApp",
    headerBg: "#075E54",
    iconBg: "#25D366",
    avatarBg: "#128C7E",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  teams: {
    name: "Microsoft Teams",
    headerBg: "#464775",
    iconBg: "#6264A7",
    avatarBg: "#5558AF",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
        <path d="M20.625 5.625h-4.5a2.625 2.625 0 10-5.25 0h-4.5A1.875 1.875 0 004.5 7.5v10.875A1.875 1.875 0 006.375 20.25h11.25a1.875 1.875 0 001.875-1.875V7.5a1.875 1.875 0 00-1.875-1.875zM12 3.75a1.875 1.875 0 110 3.75A1.875 1.875 0 0112 3.75zm0 4.875a3 3 0 100 6 3 3 0 000-6zm-6 9.75v-.75a6 6 0 0112 0v.75H6z" />
      </svg>
    ),
  },
  email: {
    name: "Outlook",
    headerBg: "#0078D4",
    iconBg: "#0078D4",
    avatarBg: "#106EBE",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  sms: {
    name: "SMS",
    headerBg: "#2E7D32",
    iconBg: "#34C759",
    avatarBg: "#248A3D",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
      </svg>
    ),
  },
};

export const MessagingPopup: React.FC<{ popup: PopupData }> = ({ popup }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < popup.appearFrame) return null;

  const elapsed = frame - popup.appearFrame;

  const slideProgress = spring({
    frame: elapsed,
    fps,
    config: FRANTIC_SPRING,
  });

  // Slide in from the specified direction
  const from = popup.from ?? "right";
  const distance = 300;
  const tx =
    from === "right" ? interpolate(slideProgress, [0, 1], [distance, 0])
    : from === "left" ? interpolate(slideProgress, [0, 1], [-distance, 0])
    : 0;
  const ty =
    from === "top" ? interpolate(slideProgress, [0, 1], [-distance, 0])
    : from === "bottom" ? interpolate(slideProgress, [0, 1], [distance, 0])
    : 0;

  const opacity = interpolate(slideProgress, [0, 0.4, 1], [0, 1, 1]);
  const cfg = APP_CONFIG[popup.app];

  return (
    <div
      style={{
        position: "absolute",
        left: popup.x,
        top: popup.y,
        width: 340,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.32), 0 2px 8px rgba(0,0,0,0.18)",
        transform: `translate(${tx}px, ${ty}px) rotate(${popup.rotation ?? 0}deg)`,
        opacity,
        zIndex: 700,
        fontFamily: interFont,
      }}
    >
      {/* App header */}
      <div
        style={{
          height: 26,
          backgroundColor: cfg.headerBg,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 6,
        }}
      >
        <div style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {cfg.icon}
        </div>
        <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 11, fontWeight: 600 }}>{cfg.name}</span>
        {popup.group && (
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }}>· {popup.group}</span>
        )}
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{popup.time}</span>
      </div>

      {/* Body */}
      <div style={{ backgroundColor: "white", padding: "8px 10px", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: cfg.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "white" }}>
          {popup.sender.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1D1D1F", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {popup.sender}
          </div>
          <div style={{ fontSize: 11, color: "#6E6E73", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {popup.message}
          </div>
        </div>
        <div style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: cfg.iconBg, flexShrink: 0, marginTop: 3 }} />
      </div>
    </div>
  );
};
