import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_SIZES, HEAVY_SPRING, interFont, UI_TOP, UI_BOTTOM_MARGIN } from "../constants";

interface CmmsShellProps {
  children: React.ReactNode;
  slideInStart?: number;
  sidebarActiveItem?: string;
  title?: string;
  /** Visual chrome style — "xp" keeps legacy, "win10" renders Windows 10 Enterprise flat chrome */
  windowStyle?: "xp" | "win10";
  /** Inner content style — "default" (classic CMMS) or "erp" (old enterprise gestionale) */
  contentStyle?: "default" | "erp";
  /** When set, the window will render with explicit inset bounds instead of the legacy UI_TOP/UI_BOTTOM_MARGIN frame */
  windowBounds?: { top: number; left: number; right: number; bottom: number };
  /** Extra transform applied to the whole window (e.g. subtle wobble when clicking title bar) */
  extraTransform?: string;
  /** Transaction code shown in the command field (erp style only) */
  transactionCode?: string;
  /** Right-side bold title in the command bar (erp style only) */
  rightTitle?: string;
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

// Enterprise-style menu (System / Edit / Goto / Favorites …) — evokes classic 2000s ERP
const ERP_MENU_ITEMS = [
  "System",
  "Edit",
  "Goto",
  "Favorites",
  "Extras",
  "Environment",
  "Settings",
  "Help",
];

// Navigation tree with expand markers
const ERP_TREE_ITEMS: { label: string; indent: number; expanded?: boolean; isFolder?: boolean }[] = [
  { label: "Favorites", indent: 0, expanded: true, isFolder: true },
  { label: "▶ WO_CREATE", indent: 1 },
  { label: "▶ WO_LIST", indent: 1 },
  { label: "SAP Menu", indent: 0, expanded: true, isFolder: true },
  { label: "Logistics", indent: 1, expanded: true, isFolder: true },
  { label: "Plant Maintenance", indent: 2, expanded: true, isFolder: true },
  { label: "Work Orders", indent: 3, expanded: true, isFolder: true },
  { label: "▷ Create (IW31)", indent: 4 },
  { label: "▷ List (IW39)", indent: 4 },
  { label: "▷ Change (IW32)", indent: 4 },
  { label: "Preventive Maint.", indent: 3, isFolder: true },
  { label: "Assets", indent: 2, isFolder: true },
  { label: "Inventory", indent: 1, isFolder: true },
  { label: "Human Resources", indent: 1, isFolder: true },
  { label: "Accounting", indent: 1, isFolder: true },
];

// ─── Toolbar icon button (ERP-style 3D) ──────────────────────────────────────
const ErpIconBtn: React.FC<{ emoji: string; color?: string; title?: string; width?: number }> = ({
  emoji,
  color,
  width = 22,
}) => (
  <div
    style={{
      width,
      height: 22,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      background: COLORS.erpToolbar,
      border: `1px solid transparent`,
      color: color ?? "#333",
      cursor: "default",
      marginRight: 1,
    }}
  >
    {emoji}
  </div>
);

export const CmmsShell: React.FC<CmmsShellProps> = ({
  children,
  slideInStart = 0,
  sidebarActiveItem = "Work Orders",
  title = "Maintenance Management System v3.2.1",
  windowStyle = "xp",
  contentStyle = "default",
  windowBounds,
  extraTransform = "",
  transactionCode = "IW31",
  rightTitle = "Create Work Order: Initial",
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

  const isWin10 = windowStyle === "win10";
  const bounds = windowBounds ?? {
    top: UI_TOP,
    left: 20,
    right: 20,
    bottom: UI_BOTTOM_MARGIN,
  };

  const titleBarIcons = isWin10
    ? [
        { icon: "─", color: "#2B2B2B", bg: "transparent", hoverBg: "#E5E5E5", width: 46 },
        { icon: "☐", color: "#2B2B2B", bg: "transparent", hoverBg: "#E5E5E5", width: 46 },
        { icon: "✕", color: "#2B2B2B", bg: "transparent", hoverBg: "#E81123", width: 46 },
      ]
    : [];

  return (
    <div
      style={{
        position: "absolute",
        top: bounds.top,
        left: bounds.left,
        right: bounds.right,
        bottom: bounds.bottom,
        transform: `translateY(${translateY}px) ${extraTransform}`,
        opacity,
        display: "flex",
        flexDirection: "column",
        borderRadius: isWin10 ? 0 : 4,
        overflow: "hidden",
        border: isWin10
          ? `1px solid ${COLORS.win10WindowBorder}`
          : `1px solid ${COLORS.cmmsBorder}`,
        boxShadow: isWin10
          ? `0 10px 32px ${COLORS.win10WindowShadow}, 0 2px 6px rgba(0,0,0,0.18)`
          : "0 4px 20px rgba(0,0,0,0.15)",
        fontFamily: interFont,
        zIndex: 10,
      }}
    >
      {/* Title bar */}
      {isWin10 ? (
        <div
          style={{
            height: 32,
            background: COLORS.win10WindowChrome,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 0,
            borderBottom: `1px solid ${COLORS.win10WindowBorder}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 10 }}>
            <span style={{ fontSize: 14 }}>🛠️</span>
            <span
              style={{
                color: "#2B2B2B",
                fontSize: 12,
                fontWeight: 400,
                letterSpacing: "0.01em",
              }}
            >
              {title}
            </span>
          </div>
          <div style={{ display: "flex", height: "100%" }}>
            {titleBarIcons.map((btn, i) => (
              <div
                key={i}
                style={{
                  width: btn.width,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 400,
                  color: btn.color,
                }}
              >
                {btn.icon}
              </div>
            ))}
          </div>
        </div>
      ) : (
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
      )}

      {contentStyle === "erp" ? (
        <>
          {/* ── Menu bar (ERP style) ── */}
          <div
            style={{
              height: 22,
              background: COLORS.erpToolbar,
              display: "flex",
              alignItems: "center",
              padding: "0 4px",
              borderBottom: `1px solid ${COLORS.erpBorder}`,
              boxShadow: "inset 0 -1px 0 #FFFFFF55",
            }}
          >
            {ERP_MENU_ITEMS.map((item) => (
              <div
                key={item}
                style={{
                  padding: "2px 10px",
                  fontSize: 11,
                  color: "#1A1A1A",
                  fontWeight: 400,
                }}
              >
                <span style={{ textDecoration: "underline" }}>{item.charAt(0)}</span>
                {item.slice(1)}
              </div>
            ))}
          </div>

          {/* ── Command bar: transaction code + icon toolbar ── */}
          <div
            style={{
              height: 30,
              background: COLORS.erpToolbar,
              display: "flex",
              alignItems: "center",
              padding: "0 6px",
              gap: 4,
              borderBottom: `1px solid ${COLORS.erpBorder}`,
            }}
          >
            {/* Green execute arrow */}
            <div
              style={{
                width: 22,
                height: 22,
                background: COLORS.erpAccentGreen,
                border: `1px outset #8DD19B`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 700,
                cursor: "default",
              }}
            >
              ✓
            </div>

            {/* Transaction code input (3D inset) */}
            <div
              style={{
                width: 120,
                height: 20,
                background: "#FFFFFF",
                border: `1px solid ${COLORS.erpBorder}`,
                borderTopColor: COLORS.erpBorderDark,
                borderLeftColor: COLORS.erpBorderDark,
                fontSize: 11,
                color: "#1A1A1A",
                padding: "1px 4px",
                display: "flex",
                alignItems: "center",
                fontFamily: "Consolas, 'Courier New', monospace",
              }}
            >
              {transactionCode}
            </div>

            <div style={{ width: 6 }} />

            {/* Colored icon toolbar — SAP-like pixel icons */}
            <ErpIconBtn emoji="💾" /> {/* Save */}
            <ErpIconBtn emoji="⬅" /> {/* Back (yellow arrow) */}
            <ErpIconBtn emoji="⛔" /> {/* Exit */}
            <ErpIconBtn emoji="✖" /> {/* Cancel */}
            <div style={{ width: 4 }} />
            <ErpIconBtn emoji="🖨" />
            <ErpIconBtn emoji="🔍" />
            <ErpIconBtn emoji="📋" />
            <div style={{ width: 4 }} />
            <ErpIconBtn emoji="▲" />
            <ErpIconBtn emoji="▼" />
            <ErpIconBtn emoji="◀" />
            <ErpIconBtn emoji="▶" />
            <div style={{ width: 4 }} />
            <ErpIconBtn emoji="🗂" />
            <ErpIconBtn emoji="📎" />
            <ErpIconBtn emoji="📊" />
            <div style={{ width: 4 }} />
            <ErpIconBtn emoji="🆘" />
            <ErpIconBtn emoji="⚙" />

            <div style={{ flex: 1 }} />

            {/* Right-side app title */}
            <div
              style={{
                fontSize: 11,
                color: "#1A1A1A",
                fontWeight: 700,
                paddingRight: 6,
              }}
            >
              {rightTitle}
            </div>
          </div>

          {/* ── Main area ── */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* ERP navigation tree */}
            <div
              style={{
                width: 220,
                background: COLORS.erpSidebar,
                borderRight: `1px solid ${COLORS.erpBorder}`,
                padding: "4px 0",
                fontFamily: interFont,
                fontSize: 11,
                color: "#1A1A1A",
              }}
            >
              {/* Tree header */}
              <div
                style={{
                  padding: "2px 6px 4px",
                  fontWeight: 700,
                  borderBottom: `1px solid ${COLORS.erpSidebarBorder}`,
                  marginBottom: 4,
                  fontSize: 11,
                  color: "#1A1A1A",
                  background: COLORS.erpToolbar,
                }}
              >
                Navigation
              </div>
              {ERP_TREE_ITEMS.map((item, i) => {
                const isActive =
                  item.label === "▷ Create (IW31)" ||
                  item.label === "▷ List (IW39)" && sidebarActiveItem === "Work Orders";
                return (
                  <div
                    key={i}
                    style={{
                      padding: "1px 6px",
                      paddingLeft: 6 + item.indent * 14,
                      fontSize: 11,
                      color: "#1A1A1A",
                      background: isActive ? COLORS.erpSelectedRow : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {item.isFolder && (
                      <span style={{ fontSize: 9, color: "#666" }}>
                        {item.expanded ? "▼" : "▶"}
                      </span>
                    )}
                    <span style={{ fontSize: 11 }}>
                      {item.isFolder ? "📁" : ""}
                    </span>
                    <span
                      style={{
                        fontWeight: item.isFolder ? 600 : 400,
                        fontFamily: interFont,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Content area */}
            <div
              style={{
                flex: 1,
                background: COLORS.erpBody,
                padding: 10,
                overflow: "hidden",
              }}
            >
              {children}
            </div>
          </div>

          {/* ── Status bar (ERP style) ── */}
          <div
            style={{
              height: 22,
              background: COLORS.erpStatusBar,
              display: "flex",
              alignItems: "center",
              padding: "0 6px",
              borderTop: `1px solid ${COLORS.erpBorder}`,
              fontSize: 11,
              color: "#1A1A1A",
              gap: 10,
            }}
          >
            {/* Status traffic light */}
            <div
              style={{
                width: 14,
                height: 14,
                background: COLORS.erpStatusGreen,
                border: "1px solid #1F6B28",
                borderRadius: "50%",
                boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.5)",
              }}
            />
            <span>Ready</span>
            <div style={{ width: 1, height: 14, background: "#8A8A8A" }} />
            <span style={{ fontFamily: "Consolas, monospace" }}>MMS</span>
            <div style={{ width: 1, height: 14, background: "#8A8A8A" }} />
            <span style={{ fontFamily: "Consolas, monospace" }}>(1) 100</span>
            <div style={{ width: 1, height: 14, background: "#8A8A8A" }} />
            <span>admin_maintenance</span>
            <div style={{ width: 1, height: 14, background: "#8A8A8A" }} />
            <span style={{ fontFamily: "Consolas, monospace" }}>srv-app-01</span>
            <div style={{ flex: 1 }} />
            <span>OVR</span>
            <div style={{ width: 1, height: 14, background: "#8A8A8A" }} />
            <span style={{ fontFamily: "Consolas, monospace" }}>14:32</span>
          </div>
        </>
      ) : (
        <>
          {/* ── Legacy menu bar ── */}
          <div style={{ height: 26, backgroundColor: COLORS.cmmsToolbar, display: "flex", alignItems: "center", padding: "0 4px", borderBottom: `1px solid ${COLORS.cmmsBorder}` }}>
            {MENU_ITEMS.map((item) => (
              <div key={item} style={{ padding: "2px 10px", fontSize: FONT_SIZES.cmmsMenu, color: COLORS.cmmsText }}>{item}</div>
            ))}
          </div>

          {/* ── Legacy toolbar ── */}
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

          {/* ── Legacy main area ── */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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

            <div style={{ flex: 1, backgroundColor: COLORS.cmmsBackground, padding: 16, overflow: "hidden" }}>
              {children}
            </div>
          </div>

          {/* ── Legacy status bar ── */}
          <div style={{ height: 22, backgroundColor: COLORS.cmmsToolbar, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", borderTop: `1px solid ${COLORS.cmmsBorder}`, fontSize: 10, color: COLORS.cmmsLabelText }}>
            <span>User: admin_maintenance | Plant: North Plant</span>
            <span>Last updated: 03/15/2024 14:32:07</span>
          </div>
        </>
      )}
    </div>
  );
};
