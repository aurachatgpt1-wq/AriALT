import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, HEAVY_SPRING, interFont, UI_TOP, UI_BOTTOM_MARGIN } from "../constants";

interface CmmsShellProps {
  children: React.ReactNode;
  slideInStart?: number;
  sidebarActiveItem?: string;
  title?: string;
}

const SIDEBAR_ITEMS = [
  { label: "Dashboard", indent: 0 },
  { label: "Plants", indent: 0 },
  { label: "Line A", indent: 1 },
  { label: "Line B", indent: 1 },
  { label: "Line C", indent: 1 },
  { label: "Work Orders", indent: 0 },
  { label: "Maintenance", indent: 0 },
  { label: "Preventive", indent: 1 },
  { label: "Corrective", indent: 1 },
  { label: "Assets", indent: 0 },
  { label: "Inventory", indent: 0 },
  { label: "Reports", indent: 0 },
  { label: "Settings", indent: 0 },
];

const MENU_ITEMS = ["File", "Edit", "View", "Tools", "Window", "Help"];

export const CmmsShell: React.FC<CmmsShellProps> = ({
  children,
  slideInStart = 0,
  sidebarActiveItem = "Work Orders",
  title = "Maintenance Management System v3.2.1",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideProgress = spring({
    frame: frame - slideInStart,
    fps,
    config: HEAVY_SPRING,
  });

  const translateY = interpolate(slideProgress, [0, 1], [800, 0]);
  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);

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
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${COLORS.cmmsBorder}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        fontFamily: interFont,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 28,
          background: "linear-gradient(180deg, #4A7EBB 0%, #3A6AA0 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
        }}
      >
        <span style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 600 }}>{title}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["─", "□", "×"].map((icon, i) => (
            <div
              key={i}
              style={{
                width: 12, height: 12, borderRadius: 1,
                backgroundColor: i === 2 ? "#C75050" : "rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i === 1 ? 8 : 9, color: "white",
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      {/* Menu bar */}
      <div style={{ height: 26, backgroundColor: COLORS.cmmsToolbar, display: "flex", alignItems: "center", padding: "0 4px", borderBottom: `1px solid ${COLORS.cmmsBorder}` }}>
        {MENU_ITEMS.map((item) => (
          <div key={item} style={{ padding: "2px 10px", fontSize: FONT_SIZES.cmmsMenu, color: COLORS.cmmsText }}>{item}</div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ height: 32, backgroundColor: COLORS.cmmsSidebarBg, display: "flex", alignItems: "center", padding: "0 6px", gap: 4, borderBottom: `1px solid ${COLORS.cmmsBorder}` }}>
        {["New", "Open", "Save", "Print", "|", "Cut", "Copy", "Paste", "|", "Undo"].map((btn, i) =>
          btn === "|" ? (
            <div key={i} style={{ width: 1, height: 20, backgroundColor: COLORS.cmmsBorder, margin: "0 2px" }} />
          ) : (
            <div key={btn} style={{ padding: "2px 8px", fontSize: 11, color: COLORS.cmmsText, backgroundColor: COLORS.cmmsToolbar, border: `1px solid ${COLORS.cmmsBorder}`, borderRadius: 2 }}>
              {btn}
            </div>
          )
        )}
      </div>

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 200, backgroundColor: COLORS.cmmsSidebarBg, borderRight: `1px solid ${COLORS.cmmsBorder}`, padding: "4px 0", overflowY: "hidden" }}>
          {SIDEBAR_ITEMS.map((item) => (
            <div
              key={item.label}
              style={{
                padding: "4px 8px",
                paddingLeft: 8 + item.indent * 16,
                fontSize: FONT_SIZES.cmmsSidebar,
                color: COLORS.cmmsText,
                backgroundColor: item.label === sidebarActiveItem ? COLORS.cmmsSidebarActive : "transparent",
                fontWeight: item.label === sidebarActiveItem ? 600 : 400,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, backgroundColor: COLORS.cmmsBackground, padding: 16, overflow: "hidden" }}>
          {children}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: 22, backgroundColor: COLORS.cmmsToolbar, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", borderTop: `1px solid ${COLORS.cmmsBorder}`, fontSize: 10, color: COLORS.cmmsLabelText }}>
        <span>User: admin_maintenance | Plant: North Plant</span>
        <span>Last updated: 03/15/2024 14:32:07</span>
      </div>
    </div>
  );
};
