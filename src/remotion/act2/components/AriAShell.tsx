import React from "react";
import { Img, staticFile } from "remotion";
import { ARIA_COLORS, ARIA_RADIUS, geistFont, SIDEBAR_WIDTH } from "../constants";

interface AriAShellProps {
  children: React.ReactNode;
  activeItem?: string;
}

// ─── Tiny inline icon (SVG path, Lucide-style) ────────────────
const Icon: React.FC<{ d: string | string[]; size?: number; color?: string }> = ({
  d, size = 13, color = ARIA_COLORS.mutedFg,
}) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {(Array.isArray(d) ? d : [d]).map((path, i) => (
      <path key={i} d={path} />
    ))}
  </svg>
);

// ─── Icon paths (Lucide) ──────────────────────────────────────
const ICONS = {
  sparkles:     ["M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"],
  database:     ["M12 2a8 2 0 1 0 0 4 8 2 0 0 0 0-4z", "M4 6v4c0 1.1 3.582 2 8 2s8-.9 8-2V6", "M4 14v4c0 1.1 3.582 2 8 2s8-.9 8-2v-4"],
  clipboard:    ["M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", "M9 12h6", "M9 16h6"],
  clipboardRect:["M8 2v4", "M16 2v4", "M3 10h18", "M9 16l2 2 4-4"],
  wrench:       ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"],
  cpu:          ["M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0", "M12 2v4", "M12 18v4", "M4.93 4.93l2.83 2.83", "M16.24 16.24l2.83 2.83", "M2 12h4", "M18 12h4", "M4.93 19.07l2.83-2.83", "M16.24 7.76l2.83-2.83"],
  package:      ["M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z", "M12 22V12", "M3.27 6.96 12 12.01l8.73-5.05", "M7.5 4.21l9 5.2"],
  alertTriangle:["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"],
  gauge:        ["M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0", "M12 2v4", "m6.343 5.657-1.414 1.414", "m19.071 5.657-1.414 1.414"],
  mapPin:       ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"],
  cart:         ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  building:     ["M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z", "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", "M10 6h4", "M10 10h4", "M10 14h4", "M10 18h4"],
  barChart:     ["M3 3v18h18", "M7 16v-5", "M11 16v-8", "M15 16v-3"],
  building2:    ["M6 22V12H2l10-10 10 10h-4v10z"],
  tags:         ["M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z", "M6 9.01V9"],
  users:        ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M12 7m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  listChecks:   ["M11 12H3", "M16 6H3", "M16 18H3", "M21 12l-4.35 4.35L15 15"],
  zap:          ["M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"],
  cog:          ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41 1.41", "m19.07 4.93-1.41 1.41"],
  layoutDash:   ["M4 5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Z", "M14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5Z", "M4 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Z", "M14 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6Z"],
  logout:       ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  chevronDown:  ["m6 9 6 6 6-6"],
  search:       ["M21 21l-4.34-4.34", "M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z"],
  inspect:      ["M10 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0", "M21 21l-6-6", "M3 3v18h18"],
};

// ─── Sidebar item ─────────────────────────────────────────────
const SidebarItem: React.FC<{
  label:   string;
  active?: boolean;
  badge?:  string;
  icon?:   string | string[];
}> = ({ label, active, badge, icon }) => (
  <div style={{
    display:         "flex",
    alignItems:      "center",
    gap:             7,
    padding:         "5px 8px",
    borderRadius:    ARIA_RADIUS.sm,
    backgroundColor: active ? ARIA_COLORS.primaryLight : "transparent",
    marginBottom:    1,
    cursor:          "pointer",
  }}>
    {icon && (
      <Icon
        d={icon}
        size={13}
        color={active ? ARIA_COLORS.primary : ARIA_COLORS.mutedFg}
      />
    )}
    <span style={{
      fontFamily: geistFont,
      fontSize:   12,
      fontWeight: active ? 600 : 400,
      color:      active ? ARIA_COLORS.primary : ARIA_COLORS.foreground,
      flex:       1,
    }}>{label}</span>
    {badge && (
      <span style={{
        fontFamily:      geistFont,
        fontSize:        9,
        fontWeight:      700,
        color:           "#FFFFFF",
        backgroundColor: ARIA_COLORS.critical,
        borderRadius:    ARIA_RADIUS.full,
        padding:         "1px 5px",
      }}>{badge}</span>
    )}
  </div>
);

// ─── Section label ────────────────────────────────────────────
const Section: React.FC<{ label: string; children: React.ReactNode; collapsible?: boolean }> = ({
  label, children, collapsible,
}) => (
  <div style={{ marginBottom: 2 }}>
    <div style={{
      display:       "flex",
      alignItems:    "center",
      justifyContent:"space-between",
      fontFamily:    geistFont,
      fontSize:      9,
      fontWeight:    600,
      color:         "rgba(118,126,140,0.65)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding:       "5px 8px 3px",
    }}>
      {label}
      {collapsible && <Icon d={ICONS.chevronDown} size={10} color="rgba(118,126,140,0.5)" />}
    </div>
    {children}
  </div>
);

// ─── Main shell ───────────────────────────────────────────────
export const AriAShell: React.FC<AriAShellProps> = ({ children, activeItem = "Knowledge Base" }) => {
  return (
    <div style={{
      position:        "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      display:         "flex",
      backgroundColor: ARIA_COLORS.background,
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width:          SIDEBAR_WIDTH,
        flexShrink:     0,
        backgroundColor:"rgba(255,255,255,0.92)",
        borderRight:    `1px solid rgba(214,217,227,0.4)`,
        display:        "flex",
        flexDirection:  "column",
        overflowY:      "hidden",
      }}>
        {/* Logo */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          padding:      "10px 12px 10px",
          borderBottom: `1px solid rgba(214,217,227,0.4)`,
        }}>
          <Img
            src={staticFile("aria-logo-full.png")}
            style={{ width: 26, height: 26, objectFit: "contain" }}
          />
          <span style={{
            fontFamily:    geistFont,
            fontSize:      16,
            fontWeight:    700,
            color:         ARIA_COLORS.foreground,
            letterSpacing: "-0.02em",
          }}>AriA<sup style={{ fontSize: 8, fontWeight: 400, color: ARIA_COLORS.mutedFg, verticalAlign: "super" }}>™</sup></span>
        </div>

        {/* Scrollable section */}
        <div style={{ flex: 1, padding: "8px 6px", display: "flex", flexDirection: "column", gap: 2, overflowY: "hidden" }}>

          {/* Plant selector */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            padding:      "4px 8px",
            borderRadius: ARIA_RADIUS.sm,
            backgroundColor: "rgba(0,0,0,0.03)",
            border:       `1px solid rgba(214,217,227,0.5)`,
            marginBottom: 4,
          }}>
            <Icon d={ICONS.building2} size={12} />
            <span style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.mutedFg, flex: 1 }}>All plants</span>
            <Icon d={ICONS.chevronDown} size={10} />
          </div>

          {/* Search */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          6,
            padding:      "4px 8px",
            borderRadius: ARIA_RADIUS.sm,
            backgroundColor: "rgba(0,0,0,0.03)",
            border:       `1px solid rgba(214,217,227,0.5)`,
            marginBottom: 6,
          }}>
            <Icon d={ICONS.search} size={11} />
            <span style={{ fontFamily: geistFont, fontSize: 11, color: ARIA_COLORS.mutedFg, flex: 1 }}>Search...</span>
            <span style={{ fontFamily: geistFont, fontSize: 9, color: ARIA_COLORS.mutedFg }}>⌘K</span>
          </div>

          {/* Pinned */}
          <SidebarItem label="AriA Assistant"  icon={ICONS.sparkles}   active={activeItem === "AriA Assistant"} />
          <SidebarItem label="Knowledge Base"  icon={ICONS.database}   active={activeItem === "Knowledge Base"} />

          {/* Operativo */}
          <Section label="Operativo">
            <SidebarItem label="Work Orders"   icon={ICONS.clipboard}     active={activeItem === "Work Orders" || activeItem === "Ordini di Lavoro"} />
            <SidebarItem label="Maintenance"   icon={ICONS.wrench}        active={activeItem === "Maintenance" || activeItem === "Manutenzione"} />
            <SidebarItem label="Inspections"   icon={ICONS.inspect}       active={activeItem === "Inspections" || activeItem === "Ispezioni"} />
          </Section>

          {/* Risorse */}
          <Section label="Resources">
            <SidebarItem label="Assets"        icon={ICONS.cpu}           active={activeItem === "Assets" || activeItem === "Attrezzature"} />
            <SidebarItem label="Spare Parts"   icon={ICONS.package}       active={activeItem === "Spare Parts" || activeItem === "Parti di Ricambio"} badge="NEW" />
            <SidebarItem label="Alarms"        icon={ICONS.alertTriangle} active={activeItem === "Alarms" || activeItem === "Allarmi"} />
            <SidebarItem label="Meters"        icon={ICONS.gauge}         active={activeItem === "Meters"} />
            <SidebarItem label="Locations"     icon={ICONS.mapPin}        active={activeItem === "Locations"} />
          </Section>

          {/* Acquisti */}
          <Section label="Procurement" collapsible>
            <SidebarItem label="Purchase Orders" icon={ICONS.cart}      active={activeItem === "Purchase Orders"} />
            <SidebarItem label="Vendors"          icon={ICONS.building} active={activeItem === "Vendors"} />
          </Section>

          {/* Analisi */}
          <Section label="Analytics" collapsible>
            <SidebarItem label="Reports" icon={ICONS.barChart} active={activeItem === "Reports"} />
          </Section>

          {/* Configurazione */}
          <Section label="Configuration" collapsible>
            <SidebarItem label="Plants"             icon={ICONS.building2}  active={activeItem === "Plants"} />
            <SidebarItem label="Categories"         icon={ICONS.tags}       active={activeItem === "Categories"} />
            <SidebarItem label="Team"               icon={ICONS.users}      active={activeItem === "Team"} />
            <SidebarItem label="Checklist Templates"icon={ICONS.listChecks} active={activeItem === "Checklist Templates"} />
            <SidebarItem label="Automations"        icon={ICONS.zap}        active={activeItem === "Automations"} />
            <SidebarItem label="Settings"           icon={ICONS.cog}        active={activeItem === "Settings"} />
          </Section>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: `1px solid rgba(214,217,227,0.4)`,
          padding:   "8px 10px",
          display:   "flex",
          alignItems:"center",
          gap:       8,
        }}>
          {/* Avatar */}
          <div style={{
            width:           26,
            height:          26,
            borderRadius:    "50%",
            backgroundColor: ARIA_COLORS.primary,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
          }}>
            <span style={{ fontFamily: geistFont, fontSize: 9, fontWeight: 700, color: "#FFFFFF" }}>BG</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily:  geistFont,
              fontSize:    10,
              fontWeight:  500,
              color:       ARIA_COLORS.foreground,
              overflow:    "hidden",
              textOverflow:"ellipsis",
              whiteSpace:  "nowrap",
            }}>brahim.ghezboury@sin…</div>
            <div style={{ fontFamily: geistFont, fontSize: 9, color: ARIA_COLORS.mutedFg }}>Administrator</div>
          </div>
          <Icon d={ICONS.logout} size={13} color={ARIA_COLORS.mutedFg} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex:          1,
        display:       "flex",
        flexDirection: "column",
        overflow:      "hidden",
        position:      "relative",
      }}>
        {children}
      </div>
    </div>
  );
};
