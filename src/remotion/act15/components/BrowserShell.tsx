import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { interFont } from "../constants";

// Same layout constants as CmmsShell (act1)
const UI_TOP = 20;
const UI_BOTTOM_MARGIN = 230;
const HEAVY_SPRING = { damping: 20, stiffness: 80, mass: 2 };

interface BrowserShellProps {
  children: React.ReactNode;
  slideInStart?: number;
  url?: string;
  tabTitle?: string;
  favicon?: string;
}

export const BrowserShell: React.FC<BrowserShellProps> = ({
  children,
  slideInStart = 0,
  url = "chat.openai.com",
  tabTitle = "ChatGPT",
  favicon = "G",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = spring({
    frame: frame - slideInStart,
    fps,
    config: HEAVY_SPRING,
  });

  const translateY = interpolate(slideProgress, [0, 1], [800, 0]);
  const opacity = interpolate(slideProgress, [0, 0.05, 1], [0, 1, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: UI_TOP,
        left: 20,
        right: 20,
        bottom: UI_BOTTOM_MARGIN,
        transform: `translateY(${translateY}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #BABABA",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        fontFamily: interFont,
      }}
    >
      {/* ── Title bar + Tabs ── */}
      <div
        style={{
          height: 38,
          backgroundColor: "#DEE1E6",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 0 0 12px",
          borderBottom: "1px solid #BABABA",
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 8, marginRight: 14 }}>
          <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: "#FF5F57", border: "0.5px solid rgba(0,0,0,0.15)" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: "#FEBC2E", border: "0.5px solid rgba(0,0,0,0.15)" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: "#28C840", border: "0.5px solid rgba(0,0,0,0.15)" }} />
        </div>

        {/* Active tab */}
        <div
          style={{
            height: 30,
            backgroundColor: "#FFFFFF",
            borderRadius: "6px 6px 0 0",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 7,
            minWidth: 200,
            border: "1px solid #BABABA",
            borderBottom: "none",
            marginBottom: 0,
          }}
        >
          {/* Favicon */}
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#10A37F",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "white",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {favicon}
          </div>
          <span style={{ fontSize: 13, color: "#202124", fontWeight: 500, whiteSpace: "nowrap" }}>
            {tabTitle}
          </span>
          <div style={{ marginLeft: "auto", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12, color: "#5F6368" }}>
            ✕
          </div>
        </div>

        {/* New tab */}
        <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#5F6368", marginBottom: 2, marginLeft: 4 }}>
          +
        </div>
      </div>

      {/* ── Address bar / Toolbar ── */}
      <div
        style={{
          height: 42,
          backgroundColor: "#F1F3F4",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderBottom: "1px solid #DADCE0",
          flexShrink: 0,
        }}
      >
        {/* Nav buttons */}
        {["←", "→", "↺"].map((icon, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: i === 2 ? 16 : 18,
              color: i === 1 ? "#BBBEC4" : "#5F6368",
              cursor: "default",
            }}
          >
            {icon}
          </div>
        ))}

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            height: 30,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #DADCE0",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, color: "#34A853" }}>🔒</span>
          <span style={{ fontSize: 14, color: "#202124", flex: 1 }}>
            {url}
          </span>
          <span style={{ fontSize: 14, color: "#5F6368" }}>★</span>
        </div>

        {/* Right icons */}
        <div style={{ fontSize: 18, color: "#5F6368", padding: "0 4px" }}>⋮</div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {children}
      </div>
    </div>
  );
};
