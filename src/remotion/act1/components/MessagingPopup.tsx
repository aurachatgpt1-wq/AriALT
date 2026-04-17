import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont } from "../constants";

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

const APP_CONFIG: Record<
  AppType,
  {
    name: string;
    titleBarBg: string;
    titleBarFg: string;
    iconBg: string;
    avatarBg: string;
    bodyBg: string;
    senderColor: string;
    textColor: string;
    accent: string;
    urgentTag: string;
    icon: React.ReactNode;
  }
> = {
  whatsapp: {
    name: "WhatsApp Web",
    titleBarBg: "#075E54",
    titleBarFg: "#FFFFFF",
    iconBg: "#25D366",
    avatarBg: "#128C7E",
    bodyBg: "#ECE5DD",
    senderColor: "#075E54",
    textColor: "#1A1A1A",
    accent: "#25D366",
    urgentTag: "NEW MESSAGE",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  teams: {
    name: "Microsoft Teams",
    titleBarBg: "#4B4E9C",
    titleBarFg: "#FFFFFF",
    iconBg: "#6264A7",
    avatarBg: "#5558AF",
    bodyBg: "#2D2C40",
    senderColor: "#C8C6F5",
    textColor: "#EAEAEA",
    accent: "#92C353",
    urgentTag: "@MENTION",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
        <path d="M20.625 5.625h-4.5a2.625 2.625 0 10-5.25 0h-4.5A1.875 1.875 0 004.5 7.5v10.875A1.875 1.875 0 006.375 20.25h11.25a1.875 1.875 0 001.875-1.875V7.5a1.875 1.875 0 00-1.875-1.875zM12 3.75a1.875 1.875 0 110 3.75A1.875 1.875 0 0112 3.75zm0 4.875a3 3 0 100 6 3 3 0 000-6zm-6 9.75v-.75a6 6 0 0112 0v.75H6z" />
      </svg>
    ),
  },
  email: {
    name: "Outlook",
    titleBarBg: "#0F1D3A",
    titleBarFg: "#FFFFFF",
    iconBg: "#0078D4",
    avatarBg: "#106EBE",
    bodyBg: "#1E293B",
    senderColor: "#A5C8F0",
    textColor: "#E2E8F0",
    accent: "#0078D4",
    urgentTag: "HIGH IMPORTANCE",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
  sms: {
    name: "Messages",
    titleBarBg: "#1E1E1E",
    titleBarFg: "#FFFFFF",
    iconBg: "#34C759",
    avatarBg: "#5A5A5A",
    bodyBg: "#FFFFFF",
    senderColor: "#1D1D1F",
    textColor: "#1D1D1F",
    accent: "#34C759",
    urgentTag: "URGENT SMS",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
      </svg>
    ),
  },
};

interface MessagingPopupProps {
  popup: PopupData;
  /** Age cutoff (frames) — after this, the popup fades and desaturates */
  ageCutoff?: number;
}

// ─── Popup dimensions — large, near-square dialog-window scale ────────────────
const POPUP_WIDTH = 560;
const TITLE_BAR_HEIGHT = 40;
const BANNER_HEIGHT = 26;

export const MessagingPopup: React.FC<MessagingPopupProps> = ({ popup, ageCutoff = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < popup.appearFrame) return null;

  const elapsed = frame - popup.appearFrame;

  // ─── Aggressive pop-in with overshoot + jitter ─────────────────────────────
  const popSpring = spring({
    frame: elapsed,
    fps,
    config: { damping: 7, stiffness: 340, mass: 0.7 },
  });
  // Scale overshoots to 1.06 then settles at 1
  const scaleEntry = interpolate(popSpring, [0, 0.55, 1], [0.62, 1.06, 1]);

  // Jitter on first ~6 frames — screen-shake-like
  const jitter = elapsed < 6 ? (Math.random() < 0.5 ? -1 : 1) * (6 - elapsed) * 1.6 : 0;
  const jitterY = elapsed < 6 ? (Math.random() < 0.5 ? -1 : 1) * (6 - elapsed) * 1.2 : 0;

  const from = popup.from ?? "right";
  const distance = 220;
  const tx =
    from === "right" ? interpolate(popSpring, [0, 1], [distance, 0])
    : from === "left" ? interpolate(popSpring, [0, 1], [-distance, 0])
    : 0;
  const ty =
    from === "top" ? interpolate(popSpring, [0, 1], [-distance, 0])
    : from === "bottom" ? interpolate(popSpring, [0, 1], [distance, 0])
    : 0;

  // Age: fade/desaturate older popups
  const age = Math.max(0, elapsed - ageCutoff);
  const ageFade = interpolate(age, [0, 40], [1, 0.5], { extrapolateRight: "clamp" });
  const ageScale = interpolate(age, [0, 40], [1, 0.92], { extrapolateRight: "clamp" });
  const ageSaturate = interpolate(age, [0, 40], [1, 0.5], { extrapolateRight: "clamp" });

  const opacity = interpolate(popSpring, [0, 0.3, 1], [0, 1, 1]) * ageFade;
  const cfg = APP_CONFIG[popup.app];

  const isDark = popup.app === "teams" || popup.app === "email";

  // Z-index: newest on top
  const zIndex = 700 + popup.appearFrame;

  // Red alert flash on brand-new popup (first 8 frames)
  const alertFlash = elapsed < 10
    ? interpolate(elapsed, [0, 2, 6, 10], [1, 1, 0.6, 0])
    : 0;

  // "Urgent" detection: certain keywords get the red banner treatment
  const isUrgent =
    /urgent|alarm|alert|NOW|emergency|escalat|unacceptable|stopped|overdue|unsafe/i.test(
      popup.message,
    ) || popup.message === popup.message.toUpperCase();

  return (
    <div
      style={{
        position: "absolute",
        left: popup.x,
        top: popup.y,
        width: POPUP_WIDTH,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow:
          age === 0
            ? `0 22px 50px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.35), 0 0 ${30 * alertFlash}px rgba(255,60,60,${0.9 * alertFlash})`
            : "0 8px 22px rgba(0,0,0,0.28)",
        transform: `translate(${tx + jitter}px, ${ty + jitterY}px) rotate(${popup.rotation ?? 0}deg) scale(${scaleEntry * ageScale})`,
        transformOrigin: "center center",
        opacity,
        filter: `saturate(${ageSaturate})`,
        zIndex,
        fontFamily: interFont,
        border: `2px solid ${alertFlash > 0.3 ? "#FF3B3B" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`,
      }}
    >
      {/* ── Title bar (Windows-style) ── */}
      <div
        style={{
          height: TITLE_BAR_HEIGHT,
          background: cfg.titleBarBg,
          display: "flex",
          alignItems: "center",
          padding: "0 0 0 14px",
          gap: 10,
          borderBottom: "1px solid rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 5,
            background: cfg.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {cfg.icon}
        </div>
        <span
          style={{
            color: cfg.titleBarFg,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.01em",
          }}
        >
          {cfg.name}
        </span>
        {popup.group && (
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
            — {popup.group}
          </span>
        )}
        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.6)", fontSize: 12, paddingRight: 14 }}>
          {popup.time}
        </span>

        {/* Fake window buttons */}
        <div style={{ display: "flex", height: TITLE_BAR_HEIGHT }}>
          {["─", "☐", "✕"].map((ch, i) => (
            <div
              key={i}
              style={{
                width: 46,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: i === 2 ? "#FFFFFF" : "rgba(255,255,255,0.85)",
                background: i === 2 ? "#E81123" : "transparent",
                fontSize: 13,
              }}
            >
              {ch}
            </div>
          ))}
        </div>
      </div>

      {/* ── Urgent alert banner (when detected) ── */}
      {isUrgent && (
        <div
          style={{
            height: BANNER_HEIGHT,
            background: "linear-gradient(90deg, #B91C1C 0%, #DC2626 50%, #B91C1C 100%)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 10,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderBottom: "1px solid rgba(0,0,0,0.25)",
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ fontSize: 15 }}>⚠️</span>
          <span>{cfg.urgentTag}</span>
          <span style={{ flex: 1 }} />
          <span style={{ opacity: 0.9 }}>ACTION REQUIRED</span>
        </div>
      )}

      {/* ── Body (bigger, near-square proportion) ── */}
      <div
        style={{
          background: cfg.bodyBg,
          padding: "22px 24px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          minHeight: 240,
        }}
      >
        {/* Sender row */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: cfg.avatarBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 26,
              fontWeight: 700,
              color: "white",
              position: "relative",
              boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
            }}
          >
            {popup.sender.charAt(0).toUpperCase()}
            {popup.app === "teams" && (
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: cfg.accent,
                  border: `3px solid ${cfg.bodyBg}`,
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: cfg.senderColor,
                marginBottom: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {popup.sender}
            </div>
            <div
              style={{
                fontSize: 12,
                color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
                letterSpacing: "0.04em",
              }}
            >
              {popup.app === "email" ? "To: you@maintenance.it" : popup.group ?? cfg.name}
            </div>
          </div>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: cfg.accent,
              flexShrink: 0,
              boxShadow: `0 0 18px ${cfg.accent}`,
            }}
          />
        </div>

        {/* Message body */}
        <div
          style={{
            fontSize: 16,
            color: cfg.textColor,
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            fontWeight: 500,
          }}
        >
          {popup.message}
        </div>

        {/* Meta row (timestamp + priority tag) */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: 11,
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)",
            letterSpacing: "0.05em",
          }}
        >
          <span>🕒 {popup.time}</span>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>{popup.app === "email" ? "Inbox" : cfg.name}</span>
          {isUrgent && (
            <>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ color: "#FF3B3B", fontWeight: 700 }}>HIGH PRIORITY</span>
            </>
          )}
        </div>
      </div>

      {/* ── Footer actions (like a real window dialog) ── */}
      <div
        style={{
          background: isDark ? "#1A1924" : "#F5F5F5",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          padding: "10px 18px",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span
          style={{
            marginRight: "auto",
            fontSize: 11,
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
            letterSpacing: "0.05em",
          }}
        >
          {popup.app === "email"
            ? `From: no-reply@${popup.sender.toLowerCase().replace(/\s/g, "").slice(0, 8)}.it`
            : `via ${cfg.name}`}
        </span>
        <div
          style={{
            padding: "6px 18px",
            background: "transparent",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}`,
            color: isDark ? "rgba(255,255,255,0.75)" : "#333",
            fontSize: 12,
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          Dismiss
        </div>
        <div
          style={{
            padding: "6px 20px",
            background: cfg.accent,
            color: "#FFFFFF",
            fontSize: 12,
            borderRadius: 3,
            fontWeight: 700,
            boxShadow: `0 0 12px ${cfg.accent}88`,
          }}
        >
          Reply
        </div>
      </div>
    </div>
  );
};
